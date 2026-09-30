import React, { useState, useMemo } from "react";
import { 
  Gauge, 
  CircleDot, 
  RotateCcw, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  Wrench, 
  Edit3, 
  Trash2, 
  Sliders, 
  Layers, 
  Info, 
  Sparkles, 
  ArrowRightLeft, 
  ShieldCheck, 
  Eye, 
  ChevronRight,
  ShieldAlert,
  Hash,
  X,
  Check,
  Tag,
  BatteryCharging
} from "lucide-react";
import { 
  VehicleRecord, 
  RepairTicket, 
  TireReplacementRecord, 
  TirePositionMeasurement, 
  BatteryReplacementRecord,
  VehicleType,
  TireAlertSetting,
  TireMaintenanceAlert
} from "../types";
import { 
  loadTireAlertSettings, 
  saveTireAlertSettings, 
  calculateFleetTireAlerts, 
  playTireAlertSound, 
  DEFAULT_TIRE_ALERT_SETTINGS 
} from "../data/tireAlertConfig";
import { TireAlertBanner } from "./TireAlertBanner";
import { TireAlertSettingsModal } from "./TireAlertSettingsModal";
import { TireAlertDispatchModal } from "./TireAlertDispatchModal";
import { TireMaintenanceAlertHubTab } from "./TireMaintenanceAlertHubTab";
import { 
  TIRE_BRANDS, 
  TIRE_SIZES, 
  TIRE_TYPES,
  TIRE_REPLACEMENT_REASONS,
  INITIAL_TIRE_REPLACEMENTS,
  getTireTypeLabel,
  getVehicleTireMeasurements 
} from "../data/tireManagementData";
import { 
  INITIAL_BATTERY_REPLACEMENTS,
  getVehicleBatteryRecord
} from "../data/batteryManagementData";
import { BatteryManagementViewTab } from "./BatteryManagementViewTab";
import { VehicleChassisTireLayout } from "./VehicleChassisTireLayout";
import { FleetTireTreadDepthSummaryTab } from "./FleetTireTreadDepthSummaryTab";
import { 
  getWheelPositionsForVehicleType, 
  CRITICAL_TREAD_DEPTH_MM, 
  WARNING_TREAD_DEPTH_MM, 
  NEW_TIRE_DEPTH_MM,
  WheelPositionConfig
} from "../data/tireInspectionConfig";
import { VEHICLE_TYPE_LABELS } from "../data/categories";

const TIRE_REPLACEMENTS_STORAGE_KEY = "tnb_fleet_tire_replacements_v2";
const BATTERY_REPLACEMENTS_STORAGE_KEY = "tnb_fleet_battery_replacements_v1";

export const normalizePlate = (p?: string): string => (p || "").replace(/[^0-9a-zA-Zก-๙]/g, "");

export const isPlateMatch = (recordPlate: string, vehicle?: VehicleRecord): boolean => {
  if (!recordPlate || !vehicle) return false;
  const p1 = normalizePlate(recordPlate);
  const p2 = normalizePlate(vehicle.licensePlate);
  if (p1 === p2) return true;
  if (vehicle.oldLicensePlate && normalizePlate(vehicle.oldLicensePlate) === p1) return true;
  
  // Strip non-digits
  const d1 = recordPlate.replace(/\D/g, "");
  const d2 = (vehicle.licensePlate || "").replace(/\D/g, "");
  if (d1 && d2) {
    if (d1 === d2) return true;
    if (d1.length >= 4 && d2.length >= 4 && d1.slice(-4) === d2.slice(-4)) return true;
  }
  return false;
};

interface TireManagementViewProps {
  vehicles: VehicleRecord[];
  tickets?: RepairTicket[];
  onRequestRepairForVehicle?: (licensePlate: string) => void;
  onOpenVehicleRepairHistory?: (licensePlate: string) => void;
}

export const TireManagementView: React.FC<TireManagementViewProps> = ({
  vehicles,
  tickets = [],
  onRequestRepairForVehicle,
  onOpenVehicleRepairHistory
}) => {
  // -------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // -------------------------------------------------------------
  const [replacements, setReplacements] = useState<TireReplacementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(TIRE_REPLACEMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_TIRE_REPLACEMENTS.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading tire replacements storage:", e);
    }
    return INITIAL_TIRE_REPLACEMENTS;
  });

  // Save to localStorage when updated
  const saveReplacements = (updated: TireReplacementRecord[]) => {
    setReplacements(updated);
    try {
      localStorage.setItem(TIRE_REPLACEMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving tire replacements storage:", e);
    }
  };

  // Battery Replacements State
  const [batteryReplacements, setBatteryReplacements] = useState<BatteryReplacementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(BATTERY_REPLACEMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading battery replacements storage:", e);
    }
    return INITIAL_BATTERY_REPLACEMENTS;
  });

  const saveBatteryReplacements = (updated: BatteryReplacementRecord[]) => {
    setBatteryReplacements(updated);
    try {
      localStorage.setItem(BATTERY_REPLACEMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving battery replacements storage:", e);
    }
  };

  // Selected vehicle for Chassis view
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Battery record for currently selected vehicle
  const selectedVehicleBattery = useMemo(() => {
    if (!selectedVehicle) return undefined;
    return getVehicleBatteryRecord(selectedVehicle.licensePlate, batteryReplacements) ||
      batteryReplacements.find(
        (b) => b.vehicleId === selectedVehicle.id || isPlateMatch(b.licensePlate, selectedVehicle)
      );
  }, [selectedVehicle, batteryReplacements]);

  // Chassis diagram view mode: 'chassis_layout' (true visual truck layout) vs 'grid_cards'
  const [chassisViewMode, setChassisViewMode] = useState<"chassis_layout" | "grid_cards">("chassis_layout");

  // Main Sub-Tab: 'chassis_inspection' | 'fleet_tire_matrix' | 'alerts_hub' | 'replacement_history' | 'battery_history'
  const [activeSubTab, setActiveSubTab] = useState<
    "chassis_inspection" | "fleet_tire_matrix" | "alerts_hub" | "replacement_history" | "battery_history"
  >("chassis_inspection");

  // Automated Alert System State
  const [alertSettings, setAlertSettings] = useState<TireAlertSetting>(loadTireAlertSettings);
  const [isAlertSettingsModalOpen, setIsAlertSettingsModalOpen] = useState<boolean>(false);
  const [isAlertDispatchModalOpen, setIsAlertDispatchModalOpen] = useState<boolean>(false);

  const handleSaveAlertSettings = (newSettings: TireAlertSetting) => {
    setAlertSettings(newSettings);
    saveTireAlertSettings(newSettings);
  };

  // Fleet-wide tire alerts calculated dynamically based on configured thresholds
  const fleetAlerts: TireMaintenanceAlert[] = useMemo(() => {
    return calculateFleetTireAlerts(vehicles, replacements, alertSettings);
  }, [vehicles, replacements, alertSettings]);

  const criticalAlertsCount = useMemo(() => {
    return fleetAlerts.filter((a) => a.alertLevel === "critical").length;
  }, [fleetAlerts]);

  const warningAlertsCount = useMemo(() => {
    return fleetAlerts.filter((a) => a.alertLevel === "warning").length;
  }, [fleetAlerts]);

  // Audio alert chime if enabled and critical alert exists
  const hasPlayedAudioRef = React.useRef(false);
  React.useEffect(() => {
    if (alertSettings.enableAutoAlert && alertSettings.alertSoundEnabled && criticalAlertsCount > 0 && !hasPlayedAudioRef.current) {
      playTireAlertSound("critical");
      hasPlayedAudioRef.current = true;
    }
  }, [alertSettings.enableAutoAlert, alertSettings.alertSoundEnabled, criticalAlertsCount]);

  // Filter / Search for vehicles
  const [vehicleSearch, setVehicleSearch] = useState<string>("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [tireStatusFilter, setTireStatusFilter] = useState<"all" | "critical" | "warning" | "safe">("all");

  // Search in replacement logs
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyBrandFilter, setHistoryBrandFilter] = useState<string>("all");
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("all");

  // Modals
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState<boolean>(false);
  const [isRotationModalOpen, setIsRotationModalOpen] = useState<boolean>(false);
  const [isQuickMeasurementModalOpen, setIsQuickMeasurementModalOpen] = useState<boolean>(false);

  // Form State for Log Tire Replacement
  const [targetPositions, setTargetPositions] = useState<string[]>([]);
  const [replaceDate, setReplaceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [replaceMileage, setReplaceMileage] = useState<number>(selectedVehicle?.currentMileage || 0);
  
  // Brand state (Supports Preset list & Custom Typing)
  const [replaceBrand, setReplaceBrand] = useState<string>("Bridgestone");
  const [isCustomBrand, setIsCustomBrand] = useState<boolean>(false);
  const [customBrandText, setCustomBrandText] = useState<string>("");

  const [replaceModel, setReplaceModel] = useState<string>("R156");
  
  // Size state (Supports Preset list & Custom Typing)
  const [replaceSize, setReplaceSize] = useState<string>("295/80R22.5");
  const [isCustomSize, setIsCustomSize] = useState<boolean>(false);
  const [customSizeText, setCustomSizeText] = useState<string>("");

  const [replaceSerial, setReplaceSerial] = useState<string>("");
  const [replaceDot, setReplaceDot] = useState<string>("DOT 3424");

  // Type state (New, Retread, Cold Retread, Hot Retread, Rotated, Used, Custom)
  const [replaceType, setReplaceType] = useState<string>("new");
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [customTypeText, setCustomTypeText] = useState<string>("");

  const [replaceInitialDepth, setReplaceInitialDepth] = useState<number>(14.0);
  const [replaceCost, setReplaceCost] = useState<number>(9000);
  const [replaceSupplier, setReplaceSupplier] = useState<string>("ศูนย์บริการ บริดจสโตน บอย ยางยนต์");
  const [replaceTechnician, setReplaceTechnician] = useState<string>("ช่างสมชาย (อู่ TNB)");
  const [replaceReason, setReplaceReason] = useState<string>("worn_out");
  const [replaceNotes, setReplaceNotes] = useState<string>("");

  // Dynamic list of all known brands for filter dropdown
  const allKnownBrands = useMemo(() => {
    const customFromLogs = replacements.map((r) => r.tireBrand).filter(Boolean);
    const baseBrands = TIRE_BRANDS.filter((b) => b !== "__OTHER__");
    return Array.from(new Set([...baseBrands, ...customFromLogs]));
  }, [replacements]);

  // Rotation Form State
  const [rotSourcePos, setRotSourcePos] = useState<string>("");
  const [rotTargetPos, setRotTargetPos] = useState<string>("");
  const [rotNotes, setRotNotes] = useState<string>("สลับยางตามรอบระยะ 30,000 กม.");

  // Quick Measurement Form State
  const [quickPosKey, setQuickPosKey] = useState<string>("");
  const [quickDepth, setQuickDepth] = useState<number>(8.5);
  const [quickPsi, setQuickPsi] = useState<number>(115);
  const [quickWear, setQuickWear] = useState<TirePositionMeasurement["wearCondition"]>("normal");

  // Wheel positions config for the current vehicle
  const currentPositionsConfig: WheelPositionConfig[] = useMemo(() => {
    if (!selectedVehicle) return [];
    return getWheelPositionsForVehicleType(selectedVehicle.vehicleType);
  }, [selectedVehicle]);

  // Current measurements evaluated for selected vehicle
  const currentMeasurements: TirePositionMeasurement[] = useMemo(() => {
    if (!selectedVehicle) return [];
    return getVehicleTireMeasurements(selectedVehicle, replacements);
  }, [selectedVehicle, replacements]);

  // Summary counts for selected vehicle
  const selectedVehicleStats = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let safe = 0;
    let minD = Infinity;
    let totalD = 0;

    currentMeasurements.forEach((m) => {
      totalD += m.treadDepthMm;
      if (m.treadDepthMm < minD) minD = m.treadDepthMm;
      if (m.alertLevel === "critical" || m.treadDepthMm < alertSettings.criticalThresholdMm) critical++;
      else if (m.alertLevel === "warning" || m.treadDepthMm <= alertSettings.warningThresholdMm) warning++;
      else safe++;
    });

    const avgD = currentMeasurements.length > 0 ? (totalD / currentMeasurements.length).toFixed(1) : "0";
    return {
      totalTires: currentMeasurements.length,
      critical,
      warning,
      safe,
      minTreadDepth: minD === Infinity ? 0 : minD,
      avgTreadDepth: Number(avgD)
    };
  }, [currentMeasurements, alertSettings]);

  // Fleet-wide calculations
  const fleetStats = useMemo(() => {
    let totalTires = 0;
    let totalCritical = 0;
    let totalWarning = 0;
    let totalSafe = 0;
    let totalCost = 0;

    vehicles.forEach((v) => {
      const ms = getVehicleTireMeasurements(v, replacements);
      totalTires += ms.length;
      ms.forEach((m) => {
        if (m.alertLevel === "critical" || m.treadDepthMm < alertSettings.criticalThresholdMm) totalCritical++;
        else if (m.alertLevel === "warning" || m.treadDepthMm <= alertSettings.warningThresholdMm) totalWarning++;
        else totalSafe++;
      });
    });

    replacements.forEach((r) => {
      totalCost += Number(r.costPerTire) || 0;
    });

    return {
      totalVehicles: vehicles.length,
      totalTires,
      totalCritical,
      totalWarning,
      totalSafe,
      totalReplacementsCount: replacements.length,
      totalCost
    };
  }, [vehicles, replacements, alertSettings]);

  // Filtered vehicles list for left drawer/picker
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (vehicleSearch.trim()) {
        const q = vehicleSearch.toLowerCase().trim();
        const matchPlate = (v.licensePlate || "").toLowerCase().includes(q) || (v.oldLicensePlate || "").toLowerCase().includes(q);
        const matchBrand = (v.vehicleBrand || v.brand || "").toLowerCase().includes(q);
        const matchModel = (v.vehicleModel || v.model || "").toLowerCase().includes(q);
        const matchDept = (v.department || "").toLowerCase().includes(q);
        const matchDriver = (v.driverName || "").toLowerCase().includes(q);
        if (!matchPlate && !matchBrand && !matchModel && !matchDept && !matchDriver) return false;
      }
      if (vehicleTypeFilter !== "all" && v.vehicleType !== vehicleTypeFilter) {
        return false;
      }
      if (tireStatusFilter !== "all") {
        const ms = getVehicleTireMeasurements(v, replacements);
        const hasCritical = ms.some((m) => m.alertLevel === "critical");
        const hasWarning = ms.some((m) => m.alertLevel === "warning");
        if (tireStatusFilter === "critical" && !hasCritical) return false;
        if (tireStatusFilter === "warning" && !hasWarning) return false;
        if (tireStatusFilter === "safe" && (hasCritical || hasWarning)) return false;
      }
      return true;
    });
  }, [vehicles, vehicleSearch, vehicleTypeFilter, tireStatusFilter, replacements]);

  // Filtered replacement history
  const filteredHistory = useMemo(() => {
    return replacements.filter((r) => {
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase().trim();
        const matchPlate = (r.licensePlate || "").toLowerCase().includes(q);
        const matchBrand = (r.tireBrand || "").toLowerCase().includes(q);
        const matchPos = (r.positionNameTh || "").toLowerCase().includes(q) || (r.positionKey || "").toLowerCase().includes(q);
        const matchSerial = (r.tireSerial || "").toLowerCase().includes(q);
        const matchModel = (r.tireModel || "").toLowerCase().includes(q);
        const matchTech = (r.technicianName || "").toLowerCase().includes(q);
        const matchShop = (r.supplierOrShop || "").toLowerCase().includes(q);
        const matchNotes = (r.notes || "").toLowerCase().includes(q);
        if (!matchPlate && !matchBrand && !matchPos && !matchSerial && !matchModel && !matchTech && !matchShop && !matchNotes) return false;
      }
      if (historyBrandFilter !== "all" && r.tireBrand !== historyBrandFilter) {
        return false;
      }
      if (historyTypeFilter !== "all") {
        if (historyTypeFilter === "retread_all") {
          if (!["retread", "cold_retread", "hot_retread"].includes(r.tireType)) return false;
        } else if (r.tireType !== historyTypeFilter) {
          return false;
        }
      }
      return true;
    });
  }, [replacements, historySearch, historyBrandFilter, historyTypeFilter]);

  // -------------------------------------------------------------
  // 2. HANDLERS
  // -------------------------------------------------------------

  // Open Log Tire Replacement Modal for specific position(s)
  const handleOpenReplaceModal = (posKey?: string) => {
    if (!selectedVehicle) return;
    setReplaceMileage(selectedVehicle.currentMileage || 0);
    setReplaceDate(new Date().toISOString().slice(0, 10));
    if (posKey) {
      setTargetPositions([posKey]);
    } else {
      setTargetPositions([currentPositionsConfig[0]?.key || "FL"]);
    }
    setReplaceSerial(`SN-${Math.floor(1000000 + Math.random() * 9000000)}`);
    
    // Reset custom typing states
    setIsCustomBrand(false);
    setCustomBrandText("");
    setIsCustomType(false);
    setCustomTypeText("");
    setIsCustomSize(false);
    setCustomSizeText("");

    setIsReplaceModalOpen(true);
  };

  // Submit Tire Replacement
  const handleSaveTireReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || targetPositions.length === 0) return;

    // Resolve effective brand (preset vs custom typing)
    const effectiveBrand = (isCustomBrand || replaceBrand === "__OTHER__")
      ? (customBrandText.trim() || "อื่นๆ")
      : replaceBrand;

    // Resolve effective tire type
    const effectiveType = (isCustomType || replaceType === "other")
      ? (customTypeText.trim() || "other")
      : replaceType;

    // Resolve effective size
    const effectiveSize = (isCustomSize || replaceSize === "__OTHER__")
      ? (customSizeText.trim() || "295/80R22.5")
      : replaceSize;

    const reasonObj = TIRE_REPLACEMENT_REASONS.find((r) => r.key === replaceReason);
    const newRecords: TireReplacementRecord[] = targetPositions.map((posKey, idx) => {
      const cfg = currentPositionsConfig.find((p) => p.key === posKey);
      return {
        id: `TR-${Date.now()}-${idx + 1}`,
        vehicleId: selectedVehicle.id,
        licensePlate: selectedVehicle.licensePlate,
        vehicleBrand: selectedVehicle.brand,
        vehicleModel: selectedVehicle.model,
        vehicleType: selectedVehicle.vehicleType,
        positionKey: posKey,
        positionNameTh: cfg ? cfg.nameTh : posKey,
        replacedDate: replaceDate,
        replacedMileage: Number(replaceMileage),
        tireBrand: effectiveBrand,
        tireModel: replaceModel,
        tireSize: effectiveSize,
        tireSerial: replaceSerial ? `${replaceSerial}-${idx + 1}` : undefined,
        dotCode: replaceDot,
        tireType: effectiveType as any,
        initialTreadDepthMm: Number(replaceInitialDepth),
        currentTreadDepthMm: Number(replaceInitialDepth),
        costPerTire: Number(replaceCost),
        supplierOrShop: replaceSupplier,
        technicianName: replaceTechnician,
        reason: replaceReason as any,
        reasonLabelTh: reasonObj ? reasonObj.label : "เปลี่ยนยางทดแทน",
        status: "active",
        notes: replaceNotes,
        createdAt: new Date().toISOString()
      };
    });

    const updated = [...newRecords, ...replacements];
    saveReplacements(updated);
    setIsReplaceModalOpen(false);
  };

  // Open Quick Measurement update
  const handleOpenQuickMeasurement = (measurement: TirePositionMeasurement) => {
    setQuickPosKey(measurement.positionKey);
    setQuickDepth(measurement.treadDepthMm);
    setQuickPsi(measurement.pressurePsi || 115);
    setQuickWear(measurement.wearCondition || "normal");
    setIsQuickMeasurementModalOpen(true);
  };

  // Save Quick Measurement update
  const handleSaveQuickMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !quickPosKey) return;

    // Create or update a synthetic measurement record by logging a lightweight update
    const cfg = currentPositionsConfig.find((p) => p.key === quickPosKey);
    const updatedRecord: TireReplacementRecord = {
      id: `TR-MEAS-${Date.now()}`,
      vehicleId: selectedVehicle.id,
      licensePlate: selectedVehicle.licensePlate,
      vehicleBrand: selectedVehicle.brand,
      vehicleModel: selectedVehicle.model,
      vehicleType: selectedVehicle.vehicleType,
      positionKey: quickPosKey,
      positionNameTh: cfg ? cfg.nameTh : quickPosKey,
      replacedDate: new Date().toISOString().slice(0, 10),
      replacedMileage: selectedVehicle.currentMileage,
      tireBrand: "Bridgestone",
      tireType: "used",
      initialTreadDepthMm: 14.0,
      currentTreadDepthMm: Number(quickDepth),
      costPerTire: 0,
      technicianName: "ช่างตรวจสภาพประจำวัน (TNB)",
      reason: "scheduled_rotation",
      reasonLabelTh: "อัปเดตการวัดความลึกดอกยางประจำรอบ",
      status: "active",
      notes: `ตรวจวัดความลึกดอกยางได้ ${quickDepth} มม. แรงดัน ${quickPsi} PSI (${quickWear})`,
      createdAt: new Date().toISOString()
    };

    saveReplacements([updatedRecord, ...replacements]);
    setIsQuickMeasurementModalOpen(false);
  };

  // Delete a replacement log
  const handleDeleteReplacement = (id: string) => {
    if (window.confirm("ยืนยันการลบประวัติการเปลี่ยนยางรายการนี้?")) {
      saveReplacements(replacements.filter((r) => r.id !== id));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID รายการ",
      "วันที่เปลี่ยน",
      "ทะเบียนรถ",
      "ยี่ห้อ/รุ่นรถ",
      "ตำแหน่งล้อ",
      "ยี่ห้อยาง",
      "รุ่นยาง",
      "ขนาดยาง",
      "DOT / สัปดาห์-ปี",
      "ซีเรียลยาง",
      "ประเภทยาง",
      "ดอกยางเริ่มต้น (มม.)",
      "ดอกยางปัจจุบัน (มม.)",
      "ราคา/เส้น (บาท)",
      "สาเหตุที่เปลี่ยน",
      "ศูนย์/ร้านที่ติดตั้ง",
      "ช่างผู้รับผิดชอบ",
      "หมายเหตุ"
    ];

    const rows = filteredHistory.map((r) => [
      r.id,
      r.replacedDate,
      `"${r.licensePlate}"`,
      `"${r.vehicleBrand || ''} ${r.vehicleModel || ''}"`,
      `"${r.positionNameTh}"`,
      `"${r.tireBrand}"`,
      `"${r.tireModel || ''}"`,
      `"${r.tireSize || ''}"`,
      `"${r.dotCode || ''}"`,
      `"${r.tireSerial || ''}"`,
      `"${r.tireType === 'new' ? 'ยางใหม่' : r.tireType === 'retread' ? 'ยางหล่อดอก' : 'สลับยาง'}"`,
      r.initialTreadDepthMm.toString(),
      (r.currentTreadDepthMm || r.initialTreadDepthMm).toString(),
      r.costPerTire.toString(),
      `"${r.reasonLabelTh || ''}"`,
      `"${r.supplierOrShop || ''}"`,
      `"${r.technicianName || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TNB_Fleet_Tire_Management_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP STATS & FLEET OVERVIEW BANNER                     */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Fleet Tire Management & Tread Depth Tracking (ISO 39001)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>ระบบตรวจสอบ & บันทึกการเปลี่ยนยาง</span>
              <span className="text-xs bg-amber-500/25 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-medium">
                ติดตามความลึกดอกยาง & ตำแหน่งล้อ
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              ตรวจสอบตำแหน่งยางรอบคัน (Chassis Diagram) ตรวจวัดความลึกร่องดอกยาง (mm) 
              บันทึกประวัติการเปลี่ยนยางแต่ละตำแหน่ง และตรวจสอบรอบการสลับยางของกองยาน {vehicles.length} คัน
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto">
            <button
              onClick={() => handleOpenReplaceModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ บันทึกเปลี่ยนยางใหม่</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
              title="ส่งออกประวัติการเปลี่ยนยางเป็น Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">ส่งออก Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Fleet Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* Card 1: Total Tires */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>ยางทั้งหมดในฟลีท</span>
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
              {fleetStats.totalTires.toLocaleString()} <span className="text-xs font-normal text-slate-400">เส้น</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">จากรถประจำการ {fleetStats.totalVehicles} คัน</div>
          </div>

          {/* Card 2: Critical Tires */}
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
            <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
              <span>🔴 วิกฤต ห้ามวิ่ง (&lt; {alertSettings.criticalThresholdMm} mm)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1 font-mono">
              {fleetStats.totalCritical} <span className="text-xs font-normal text-rose-300">เส้น</span>
            </div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">ต้องเปลี่ยนด่วนตามกฎหมาย</div>
          </div>

          {/* Card 3: Warning Tires */}
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
              <span>🟡 เฝ้าระวัง ({alertSettings.criticalThresholdMm} - {alertSettings.warningThresholdMm} mm)</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono">
              {fleetStats.totalWarning} <span className="text-xs font-normal text-amber-300">เส้น</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">เตรียมสลับหรือสั่งซื้ออะไหล่</div>
          </div>

          {/* Card 4: Safe Tires */}
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
              <span>🟢 ดอกยางปกติ (&gt; {alertSettings.warningThresholdMm} mm)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">
              {fleetStats.totalSafe} <span className="text-xs font-normal text-emerald-300">เส้น</span>
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">สภาพสมบูรณ์ พร้อมวิ่งงาน</div>
          </div>

          {/* Card 5: Total Replacement Cost */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>งบเปลี่ยนยางสะสม</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-1 font-mono">
              ฿{fleetStats.totalCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">บันทึกแล้ว {fleetStats.totalReplacementsCount} รายการ</div>
          </div>
        </div>

        {/* Sub-View Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab("chassis_inspection")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "chassis_inspection"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4 text-amber-300" />
            <span>1. ผังตำแหน่งยาง & แบตเตอรี่รอบคัน (Chassis Diagram)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("fleet_tire_matrix")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "fleet_tire_matrix"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/40"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Gauge className="w-4 h-4 text-cyan-300" />
            <span>2. สรุปความลึกของยางทั้งกองยาน (Fleet Summary & Layout)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("alerts_hub")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
              activeSubTab === "alerts_hub"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/40"
                : fleetAlerts.length > 0
                ? "bg-rose-950/60 text-rose-200 hover:bg-rose-900 border border-rose-800/80"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${criticalAlertsCount > 0 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span>3. 🚨 ศูนย์แจ้งเตือน & แผนเปลี่ยนยางรายสัปดาห์ ({fleetAlerts.length})</span>
            {criticalAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("replacement_history")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "replacement_history"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-300" />
            <span>4. ประวัติการเปลี่ยนยางทั้งหมด ({replacements.length} รายการ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("battery_history")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "battery_history"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BatteryCharging className="w-4 h-4 text-amber-300" />
            <span>5. ประวัติการเปลี่ยนแบตเตอรี่ ({batteryReplacements.length} คัน)</span>
          </button>
        </div>
      </div>

      {/* Automated Maintenance Alert Banner */}
      <TireAlertBanner
        alerts={fleetAlerts}
        settings={alertSettings}
        onOpenSettings={() => setIsAlertSettingsModalOpen(true)}
        onOpenDispatch={() => setIsAlertDispatchModalOpen(true)}
        onOpenAlertHub={() => setActiveSubTab("alerts_hub")}
        onOpenWeeklyPlan={() => setActiveSubTab("alerts_hub")}
        onSelectVehicleId={(vId) => {
          setSelectedVehicleId(vId);
          setActiveSubTab("chassis_inspection");
        }}
        onRequestRepairForVehicle={onRequestRepairForVehicle}
        selectedVehicleId={selectedVehicleId}
      />

      {/* ======================================================== */}
      {/* 2. SUBTAB 1: CHASSIS & WHEEL POSITION INSPECTION VIEW    */}
      {/* ======================================================== */}
      {activeSubTab === "chassis_inspection" && selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ----------------------------------------------------- */}
          {/* Left Column: Vehicle Selector List (4 cols)           */}
          {/* ----------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>เลือกรถในกองยาน ({filteredVehicles.length})</span>
                </h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {vehicles.length} คัน
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {vehicleSearch && (
                  <button
                    type="button"
                    onClick={() => setVehicleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tire Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                <button
                  onClick={() => setTireStatusFilter("all")}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    tireStatusFilter === "all" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setTireStatusFilter("critical")}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    tireStatusFilter === "critical" ? "bg-rose-600 text-white font-bold" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  🔴 วิกฤต
                </button>
                <button
                  onClick={() => setTireStatusFilter("warning")}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    tireStatusFilter === "warning" ? "bg-amber-600 text-white font-bold" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  🟡 เฝ้าระวัง
                </button>
                <button
                  onClick={() => setTireStatusFilter("safe")}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    tireStatusFilter === "safe" ? "bg-emerald-600 text-white font-bold" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  🟢 ปกติ
                </button>
              </div>

              {/* Vehicle Cards List */}
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredVehicles.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลรถตามตัวกรอง
                  </div>
                ) : (
                  filteredVehicles.map((v) => {
                    const isSelected = selectedVehicle ? v.id === selectedVehicle.id : false;
                    const measurements = getVehicleTireMeasurements(v, replacements);
                    const hasCritical = measurements.some((m) => m.alertLevel === "critical");
                    const hasWarning = measurements.some((m) => m.alertLevel === "warning");
                    const minDepth = measurements.length > 0 ? Math.min(...measurements.map((m) => m.treadDepthMm)) : 0;
                    const brandModelStr = [v.vehicleBrand || v.brand, v.vehicleModel || v.model].filter(Boolean).join(" ");

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-400/40"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm font-mono">{v.licensePlate}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            hasCritical
                              ? "bg-rose-100 text-rose-700 border-rose-300"
                              : hasWarning
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}>
                            {hasCritical ? "🔴 วิกฤต (< 2.0 mm)" : hasWarning ? "🟡 เฝ้าระวัง" : "🟢 ดอกยางปกติ"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                          <span>{brandModelStr || "-"}</span>
                          <span className="text-slate-400 text-[11px]">{VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span>ไมล์: <strong className="text-slate-700 font-mono">{(v.currentMileage || 0).toLocaleString()} กม.</strong></span>
                          <span>ดอกยางต่ำสุด: <strong className={`font-mono font-bold ${minDepth < 2.0 ? 'text-rose-600' : minDepth <= 3.5 ? 'text-amber-600' : 'text-emerald-600'}`}>{minDepth === Infinity ? 0 : minDepth} mm</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* Right Column: Visual Chassis Diagram & Details (8 col)*/}
          {/* ----------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active Vehicle Info Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                    {VEHICLE_TYPE_LABELS[selectedVehicle.vehicleType] || selectedVehicle.vehicleType}
                  </span>
                  <span className="text-xs text-slate-500">
                    แผนก: <strong className="text-slate-700">{selectedVehicle.department || "ทั่วไป"}</strong>
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {selectedVehicle.licensePlate}
                  </h2>
                  <span className="text-slate-600 text-sm font-semibold">
                    {[selectedVehicle.vehicleBrand || selectedVehicle.brand, selectedVehicle.vehicleModel || selectedVehicle.model].filter(Boolean).join(" ")} {selectedVehicle.year ? `(${selectedVehicle.year})` : ""}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                  <span>เลขไมล์ปัจจุบัน: <strong className="text-slate-900 font-mono font-bold">{(selectedVehicle.currentMileage || 0).toLocaleString()} กม.</strong></span>
                  <span>•</span>
                  <span>จำนวนตำแหน่งล้อ: <strong className="text-slate-900 font-bold">{currentPositionsConfig.length} ตำแหน่ง</strong></span>
                  <span>•</span>
                  <span>ดอกยางเฉลี่ย: <strong className="text-blue-700 font-bold font-mono">{selectedVehicleStats.avgTreadDepth} mm</strong></span>
                </div>
              </div>

              {/* Action Buttons for this vehicle */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenReplaceModal()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกเปลี่ยนยางคันนี้</span>
                </button>

                {onRequestRepairForVehicle && (
                  <button
                    onClick={() => onRequestRepairForVehicle(selectedVehicle.licensePlate)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>เปิดใบแจ้งซ่อม</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Switcher: Chassis Layout vs Grid Cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium pl-2 hidden sm:inline">รูปแบบ:</span>
                <button
                  type="button"
                  onClick={() => setChassisViewMode("chassis_layout")}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    chassisViewMode === "chassis_layout"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ผังโครงสร้างตัวรถ (Chassis Layout)</span>
                  <span className="sm:hidden">ผังตัวรถเสมือนจริง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChassisViewMode("grid_cards")}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    chassisViewMode === "grid_cards"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">การ์ดแจกแจงล้อ (Card Grid)</span>
                  <span className="sm:hidden">การ์ดแยกตามล้อ</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 pr-2 hidden md:block">
                รถคันนี้: <strong className="text-white font-mono font-bold">{selectedVehicle.licensePlate}</strong>
              </div>
            </div>

            {/* If Chassis Layout Mode: Render VehicleChassisTireLayout */}
            {chassisViewMode === "chassis_layout" ? (
              <VehicleChassisTireLayout
                vehicle={selectedVehicle}
                measurements={currentMeasurements}
                replacements={replacements}
                batteryRecord={selectedVehicleBattery}
                criticalThresholdMm={alertSettings.criticalThresholdMm}
                warningThresholdMm={alertSettings.warningThresholdMm}
                onQuickMeasurement={handleOpenQuickMeasurement}
                onReplaceTire={handleOpenReplaceModal}
              />
            ) : (
              /* Visual Chassis & Tire Diagram Container (Grid Cards) */
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    ผังแสดงตำแหน่งยางรอบคัน (CHASSIS TIRE POSITION DIAGRAM)
                  </h3>
                </div>

                {/* Color Legend */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> &gt; 3.5 mm (ปกติ)
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> 2.0 - 3.5 mm (เฝ้าระวัง)
                  </span>
                  <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600/40">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> &lt; 2.0 mm (วิกฤต)
                  </span>
                </div>
              </div>

              {/* Truck Front Direction Indicator */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-slate-800 text-blue-300 text-xs font-bold border border-slate-700 tracking-wider">
                  <span>▲ ด้านหน้าหัวรถ (FRONT)</span>
                </div>
              </div>

              {/* Dedicated Battery Compartment for this vehicle */}
              {(() => {
                const currentVehicleBattery = getVehicleBatteryRecord(selectedVehicle.licensePlate, batteryReplacements) ||
                  batteryReplacements.find(
                    (b) => b.vehicleId === selectedVehicle.id || isPlateMatch(b.licensePlate, selectedVehicle)
                  );

                return (
                  <div className="mb-5 max-w-3xl mx-auto">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800 to-slate-800/90 border border-amber-500/40 shadow-lg relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                            <BatteryCharging className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-amber-400 font-mono tracking-wide uppercase">
                                🔋 กล่องแบตเตอรี่ประจำรถ (BATTERY COMPARTMENT)
                              </span>
                              {currentVehicleBattery ? (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40 flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>มีบันทึกเปลี่ยนในระบบ (Doc 2)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                  แบตเตอรี่มาตรฐานประจำรถ (24V)
                                </span>
                              )}
                            </div>

                            {currentVehicleBattery ? (
                              <div className="mt-1 space-y-1 text-xs">
                                <div className="text-white font-bold text-sm flex items-center gap-2">
                                  <span>{currentVehicleBattery.quantity || 2} ลูก x {currentVehicleBattery.batteryBrand} {currentVehicleBattery.batteryModelOrSize}</span>
                                  <span className="text-xs text-amber-400 font-normal">฿{(currentVehicleBattery.cost || 0).toLocaleString()} บ.</span>
                                </div>
                                <div className="text-slate-300 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                  <span>วันที่เปลี่ยน: <strong className="text-white font-mono">{currentVehicleBattery.displayDateTh || currentVehicleBattery.replacedDate}</strong></span>
                                  <span>ร้าน: <strong className="text-white">{currentVehicleBattery.supplierOrShop}</strong></span>
                                  {currentVehicleBattery.replacedMileage ? (
                                    <span>ไมล์: <strong className="text-white font-mono">{currentVehicleBattery.replacedMileage.toLocaleString()} กม.</strong></span>
                                  ) : null}
                                  {currentVehicleBattery.driverName && (
                                    <span>พขร: <strong className="text-white">{currentVehicleBattery.driverName}</strong></span>
                                  )}
                                </div>
                                {currentVehicleBattery.reason && (
                                  <div className="text-[10px] text-amber-300/90 italic">
                                    สาเหตุ: {currentVehicleBattery.reason}
                                  </div>
                                )}
                                {currentVehicleBattery.previousBrand && (
                                  <div className="text-[10px] text-slate-400">
                                    แบตเตอรี่เดิม: {currentVehicleBattery.previousBrand} {currentVehicleBattery.previousModelOrSize} ({currentVehicleBattery.previousReplacedDate || "มากับรถ"})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-400 text-xs mt-1">
                                ระบบไฟฟ้า 24V (แบตเตอรี่ 12V 2 ลูก) ยังไม่มีประวัติการเปลี่ยนแบตเตอรี่เฉพาะคันนี้
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveSubTab("battery_history")}
                            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>ดูประวัติทั้งหมด</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubTab("battery_history")}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ บันทึกเปลี่ยนแบต</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chassis Visual Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {currentMeasurements.map((m) => {
                  const cfg = currentPositionsConfig.find((c) => c.key === m.positionKey);
                  const isCritical = m.alertLevel === "critical";
                  const isWarning = m.alertLevel === "warning";
                  const isSafe = m.alertLevel === "safe";

                  // Find latest replacement for this position matching vehicle licensePlate & positionKey / positionNumber
                  const latestRep = replacements
                    .filter((r) => {
                      const plateMatches = r.vehicleId === selectedVehicle.id || isPlateMatch(r.licensePlate, selectedVehicle);
                      if (!plateMatches) return false;
                      if (r.positionKey && r.positionKey === m.positionKey) return true;
                      if (r.positionNumber && cfg?.positionNumber && String(r.positionNumber) === String(cfg.positionNumber)) return true;
                      return false;
                    })
                    .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];

                  const depthPct = Math.min(100, Math.max(0, Math.round((m.treadDepthMm / NEW_TIRE_DEPTH_MM) * 100)));

                  return (
                    <div
                      key={m.positionKey}
                      className={`p-4 rounded-xl border transition-all ${
                        latestRep
                          ? isCritical
                            ? "bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/60 ring-2 ring-emerald-400/80"
                            : isWarning
                            ? "bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/60 ring-2 ring-emerald-400/80"
                            : "bg-slate-800/95 border-emerald-500/70 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-950/30"
                          : isCritical
                          ? "bg-rose-950/30 border-rose-600/80 shadow-md shadow-rose-950/50"
                          : isWarning
                          ? "bg-amber-950/30 border-amber-500/70 shadow-md shadow-amber-950/50"
                          : "bg-slate-800/80 border-slate-700 hover:border-blue-500/50"
                      }`}
                    >
                      {/* Card Header: Position & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              {m.positionKey}
                            </span>
                            <span className="text-xs font-bold text-slate-300">{m.positionNameTh}</span>
                          </div>
                          {cfg && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              เพลา {cfg.axle > 0 ? cfg.axle : 'อะไหล่'} • {cfg.side === 'left' ? 'ฝั่งซ้าย' : 'ฝั่งขวา'} {cfg.isDual ? '(ล้อคู่)' : ''} {cfg.positionNumber ? `• ตำแหน่งที่ #${cfg.positionNumber}` : ''}
                            </div>
                          )}
                        </div>

                        {/* Status Chip & Replacement Indicator */}
                        <div className="flex items-center gap-1.5">
                          {latestRep && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                              <span>มีประวัติเปลี่ยน (Doc 1)</span>
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border whitespace-nowrap ${
                            isCritical
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          }`}>
                            {isCritical ? "🔴 วิกฤต" : isWarning ? "🟡 เฝ้าระวัง" : "🟢 ปกติ"}
                          </span>
                        </div>
                      </div>

                      {/* Main Tread Depth Display */}
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] text-slate-400">ความลึกร่องดอกยาง (Tread Depth)</div>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className={`text-2xl font-black font-mono ${
                              isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {m.treadDepthMm}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">มม. (mm)</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">แรงดันลมยาง</div>
                          <div className="text-sm font-mono font-bold text-blue-300 mt-0.5">
                            {m.pressurePsi || 115} <span className="text-[10px] text-slate-400 font-normal">PSI</span>
                          </div>
                        </div>
                      </div>

                      {/* Depth Progress Bar */}
                      <div className="mt-2 space-y-1">
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCritical ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${depthPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0 mm</span>
                          <span>เกณฑ์ 2.0 mm</span>
                          <span>ใหม่ 14.0 mm</span>
                        </div>
                      </div>

                      {/* Tire Installation & Replacement Details */}
                      <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[11px] space-y-1.5">
                        {latestRep ? (
                          <>
                            <div className="flex items-center justify-between text-slate-200">
                              <span>
                                ยี่ห้อ: <strong className="text-white font-bold">{latestRep.tireBrand} {latestRep.tireModel || ''}</strong>
                                {latestRep.treadPattern && (
                                  <span className="text-amber-300 ml-1">({latestRep.treadPattern})</span>
                                )}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                                latestRep.tireType === "new"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              }`}>
                                {getTireTypeLabel(latestRep.tireType)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300 text-[11px]">
                              <span>เปลี่ยนเมื่อ: <strong className="text-white font-mono">{latestRep.replacedDateTh || latestRep.replacedDate}</strong></span>
                              {latestRep.replacedMileage ? (
                                <span>ไมล์: <strong className="text-white font-mono">{latestRep.replacedMileage.toLocaleString()} กม.</strong></span>
                              ) : null}
                            </div>

                            {latestRep.driverName && (
                              <div className="text-[11px] text-slate-300">
                                พขร: <strong className="text-white">{latestRep.driverName}</strong>
                              </div>
                            )}

                            {latestRep.tireSerial && (
                              <div className="text-[10px] text-slate-300 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 flex items-center justify-between">
                                <span>SN: {latestRep.tireSerial}</span>
                                {latestRep.rimType && <span className="text-slate-400">{latestRep.rimType}</span>}
                              </div>
                            )}

                            {latestRep.notes && (
                              <div className="text-[10px] text-amber-200 bg-amber-950/50 p-1.5 rounded border border-amber-800/40 leading-snug">
                                {latestRep.notes}
                              </div>
                            )}

                            {latestRep.oldTiresReturnedCount ? (
                              <div className="text-[10px] text-slate-400">
                                ยางเก่าคืน: <strong className="text-slate-200">{latestRep.oldTiresReturnedCount} เส้น</strong>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="text-slate-400 text-[11px] italic">
                            ยางมาตรฐานประจำรถ (ยังไม่มีบันทึกเปลี่ยนย่อย)
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside card */}
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenQuickMeasurement(m)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="อัปเดตการวัดความลึกดอกยาง"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>วัดดอกยาง</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReplaceModal(m.positionKey)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="บันทึกการเปลี่ยนยางตำแหน่งนี้"
                        >
                          <Plus className="w-3 h-3" />
                          <span>เปลี่ยนยาง</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Truck Rear Direction Indicator */}
              <div className="flex items-center justify-center mt-5">
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 tracking-wider">
                  <span>▼ ด้านท้ายรถ (REAR)</span>
                </div>
              </div>
            </div>
            )}

            {/* Detailed Table Breakdown for this vehicle */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>ตารางแจกแจงสถานะยางทุกตำแหน่ง ({selectedVehicle.licensePlate})</span>
                </h3>
                <span className="text-xs text-slate-500">
                  มาตรฐานกรมการขนส่งทางบก: ความลึกร่องยางไม่ต่ำกว่า 2.0 มม.
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-16 text-center border-r border-slate-200">ตำแหน่ง</th>
                      <th className="py-3 px-4 border-r border-slate-200">ชื่อตำแหน่งล้อ</th>
                      <th className="py-3 px-3 text-right border-r border-slate-200">ความลึก (mm)</th>
                      <th className="py-3 px-3 text-right border-r border-slate-200">แรงดัน (PSI)</th>
                      <th className="py-3 px-3 text-center border-r border-slate-200">สถานะความปลอดภัย</th>
                      <th className="py-3 px-4 border-r border-slate-200">ข้อมูลยางที่ติดตั้ง & วันที่เปลี่ยนล่าสุด</th>
                      <th className="py-3 px-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {currentMeasurements.map((m) => {
                      const cfg = currentPositionsConfig.find((c) => c.key === m.positionKey);
                      const isCritical = m.alertLevel === "critical";
                      const isWarning = m.alertLevel === "warning";
                      const latestRep = replacements
                        .filter((r) => {
                          const plateMatches = r.vehicleId === selectedVehicle.id || isPlateMatch(r.licensePlate, selectedVehicle);
                          if (!plateMatches) return false;
                          if (r.positionKey && r.positionKey === m.positionKey) return true;
                          if (r.positionNumber && cfg?.positionNumber && String(r.positionNumber) === String(cfg.positionNumber)) return true;
                          return false;
                        })
                        .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];

                      return (
                        <tr key={m.positionKey} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-100">
                            {m.positionKey}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 border-r border-slate-100">
                            <div>{m.positionNameTh}</div>
                            {cfg?.positionNumber && (
                              <div className="text-[10px] text-slate-400">ตำแหน่ง #{cfg.positionNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold border-r border-slate-100">
                            <span className={isCritical ? "text-rose-600 font-black text-sm" : isWarning ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                              {m.treadDepthMm}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {m.pressurePsi || 115}
                          </td>
                          <td className="py-3 px-3 text-center border-r border-slate-100">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isCritical
                                ? "bg-rose-100 text-rose-700 border-rose-300"
                                : isWarning
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            }`}>
                              {isCritical ? "🔴 วิกฤต" : isWarning ? "🟡 เฝ้าระวัง" : "🟢 ปกติ"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs border-r border-slate-100">
                            {latestRep ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{latestRep.tireBrand} {latestRep.tireModel}</span>
                                  {latestRep.treadPattern && (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                      ลาย{latestRep.treadPattern}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200 font-semibold">
                                    Doc 1
                                  </span>
                                </div>
                                <div className="text-slate-500 text-[11px] mt-0.5">
                                  ({latestRep.replacedDateTh || latestRep.replacedDate}) • ฿{latestRep.costPerTire.toLocaleString()} • {latestRep.replacedMileage?.toLocaleString()} กม.
                                </div>
                                {latestRep.driverName && (
                                  <div className="text-[10px] text-slate-500">พขร: {latestRep.driverName}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">ยางมาตรฐาน (ยังไม่มีประวัติเปลี่ยนย่อย)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleOpenReplaceModal(m.positionKey)}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold transition-colors"
                            >
                              เปลี่ยนยาง
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUBTAB: FLEET TREAD DEPTH SUMMARY MATRIX & LAYOUT    */}
      {/* ======================================================== */}
      {activeSubTab === "fleet_tire_matrix" && (
        <FleetTireTreadDepthSummaryTab
          vehicles={vehicles}
          replacements={replacements}
          batteryReplacements={batteryReplacements}
          selectedVehicleId={selectedVehicleId}
          criticalThresholdMm={alertSettings.criticalThresholdMm}
          warningThresholdMm={alertSettings.warningThresholdMm}
          onSelectVehicleId={(id) => setSelectedVehicleId(id)}
          onQuickMeasurement={handleOpenQuickMeasurement}
          onReplaceTire={handleOpenReplaceModal}
          onRequestRepairForVehicle={onRequestRepairForVehicle}
        />
      )}

      {/* ======================================================== */}
      {/* 3. SUBTAB: AUTOMATED PREVENTIVE TIRE ALERT HUB           */}
      {/* ======================================================== */}
      {activeSubTab === "alerts_hub" && (
        <TireMaintenanceAlertHubTab
          alerts={fleetAlerts}
          settings={alertSettings}
          vehicles={vehicles}
          onOpenSettings={() => setIsAlertSettingsModalOpen(true)}
          onOpenDispatch={() => setIsAlertDispatchModalOpen(true)}
          onSelectVehicleForDiagram={(vId) => {
            setSelectedVehicleId(vId);
            setActiveSubTab("chassis_inspection");
          }}
          onQuickMeasurement={handleOpenQuickMeasurement}
          onReplaceTire={handleOpenReplaceModal}
          onRequestRepairForVehicle={onRequestRepairForVehicle}
        />
      )}

      {/* ======================================================== */}
      {/* 3. SUBTAB 2: FLEET REPLACEMENT HISTORY LOG TABLE         */}
      {/* ======================================================== */}
      {activeSubTab === "replacement_history" && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาทะเบียนรถ, ตำแหน่งล้อ, ยี่ห้อยาง, ซีเรียล..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Brand Filter (Includes dynamic custom brands) */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600">ยี่ห้อ:</span>
                <select
                  value={historyBrandFilter}
                  onChange={(e) => setHistoryBrandFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                >
                  <option value="all">ทุกยี่ห้อ ({allKnownBrands.length})</option>
                  {allKnownBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Tire Type Filter */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600">ประเภท:</span>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="new">ยางใหม่</option>
                  <option value="retread_all">ยางหล่อดอก (ทั้งหมด)</option>
                  <option value="retread">หล่อดอกทั่วไป</option>
                  <option value="cold_retread">หล่อเย็น</option>
                  <option value="hot_retread">หล่อร้อน</option>
                  <option value="rotate">สลับยาง</option>
                  <option value="used">ยางมือสอง</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenReplaceModal()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ บันทึกเปลี่ยนยางใหม่</span>
              </button>
            </div>
          </div>

          {/* Replacement History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold">
                  บันทึกประวัติการเปลี่ยนยางและสลับยางทั้งกองยาน (FLEET TIRE REPLACEMENT LEDGER)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredHistory.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center border-r border-slate-200">#</th>
                    <th className="py-3 px-3 w-28 border-r border-slate-200">วันที่เปลี่ยน</th>
                    <th className="py-3 px-3 w-28 border-r border-slate-200">ทะเบียนรถ</th>
                    <th className="py-3 px-3 w-40 border-r border-slate-200">ตำแหน่งล้อ</th>
                    <th className="py-3 px-4 border-r border-slate-200">ยี่ห้อ / รุ่น / ขนาด</th>
                    <th className="py-3 px-3 w-28 border-r border-slate-200">DOT / ซีเรียล</th>
                    <th className="py-3 px-3 w-24 text-center border-r border-slate-200">ประเภท</th>
                    <th className="py-3 px-3 w-28 text-right border-r border-slate-200">เลขไมล์ที่เปลี่ยน</th>
                    <th className="py-3 px-3 w-24 text-right border-r border-slate-200">ราคา/เส้น</th>
                    <th className="py-3 px-4 border-r border-slate-200">สาเหตุ & ผู้ติดตั้ง</th>
                    <th className="py-3 px-3 w-16 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <Gauge className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">ไม่พบข้อมูลประวัติการเปลี่ยนยาง</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-semibold border-r border-slate-100">
                          <div>{rec.replacedDateTh || rec.replacedDate}</div>
                          {rec.replacedDateTh && (
                            <div className="text-[10px] text-slate-400 font-sans">{rec.replacedDate}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono border-r border-slate-100">
                          <div>{rec.licensePlate}</div>
                          {rec.driverName && (
                            <div className="text-[10px] text-slate-500 font-normal font-sans">พขร: {rec.driverName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-100">
                          <span className="font-bold text-slate-800">{rec.positionNameTh}</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">({rec.positionKey})</span>
                          {rec.positionNumber && (
                            <div className="text-[10px] text-slate-400">ตำแหน่ง #{rec.positionNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{rec.tireBrand} {rec.tireModel}</span>
                            {rec.treadPattern && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                ลาย{rec.treadPattern}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{rec.tireSize}</div>
                          {rec.rimType && (
                            <div className="text-[10px] text-slate-400">{rec.rimType}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px] border-r border-slate-100">
                          <div>{rec.dotCode || '-'}</div>
                          <div className="text-[10px] text-slate-400">{rec.tireSerial || '-'}</div>
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                            rec.tireType === "new"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : rec.tireType === "retread"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : rec.tireType === "cold_retread"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : rec.tireType === "hot_retread"
                              ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                              : rec.tireType === "used"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {getTireTypeLabel(rec.tireType)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 border-r border-slate-100">
                          {rec.replacedMileage.toLocaleString()} กม.
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 border-r border-slate-100">
                          ฿{rec.costPerTire.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs border-r border-slate-100">
                          <div className="font-medium text-slate-800">{rec.reasonLabelTh || rec.reason}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{rec.supplierOrShop} • {rec.technicianName}</div>
                          {rec.notes && <div className="text-[10px] text-amber-800 font-medium mt-0.5 bg-amber-50 px-1 py-0.5 rounded">{rec.notes}</div>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                const targetVeh = vehicles.find((v) => isPlateMatch(rec.licensePlate, v));
                                if (targetVeh) {
                                  setSelectedVehicleId(targetVeh.id);
                                  setActiveSubTab("chassis_inspection");
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="เปิดดูผังรถคันนี้"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReplacement(rec.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3.1 SUBTAB 3: BATTERY REPLACEMENT HISTORY TAB (DOC 2)    */}
      {/* ======================================================== */}
      {activeSubTab === "battery_history" && (
        <BatteryManagementViewTab
          vehicles={vehicles}
          batteryReplacements={batteryReplacements}
          onSaveBatteryReplacements={saveBatteryReplacements}
          onSelectVehicleForDiagram={(vehId) => {
            setSelectedVehicleId(vehId);
            setActiveSubTab("chassis_inspection");
          }}
          onRequestRepairForVehicle={onRequestRepairForVehicle}
        />
      )}

      {/* ======================================================== */}
      {/* 4. MODAL: LOG TIRE REPLACEMENT FORM                      */}
      {/* ======================================================== */}
      {isReplaceModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">บันทึกการเปลี่ยนยาง (Log Tire Replacement)</h3>
                  <p className="text-xs text-blue-200">
                    รถทะเบียน: <strong className="text-white font-mono">{selectedVehicle.licensePlate}</strong> ({selectedVehicle.brand} {selectedVehicle.model})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReplaceModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTireReplacement} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
              {/* Position Checkbox Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกตำแหน่งล้อที่เปลี่ยน (สามารถเลือกหลายล้อพร้อมกันได้): <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                  {currentPositionsConfig.map((pos) => {
                    const isChecked = targetPositions.includes(pos.key);
                    return (
                      <label
                        key={pos.key}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTargetPositions([...targetPositions, pos.key]);
                            } else {
                              setTargetPositions(targetPositions.filter((k) => k !== pos.key));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-mono">{pos.key}</span>
                        <span className="text-[11px] truncate text-slate-500">{pos.nameTh.split(' ')[0]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Row 1: Date & Mileage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่เปลี่ยนยาง: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={replaceDate}
                    onChange={(e) => setReplaceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เลขไมล์ที่เปลี่ยน (กม.): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={replaceMileage}
                    onChange={(e) => setReplaceMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 2: Brand (Dropdown + Custom Typing Option), Model, Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Brand Selection / Free-text Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ยี่ห้อยาง: <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomBrand(!isCustomBrand);
                        if (!isCustomBrand && !customBrandText) {
                          setCustomBrandText(replaceBrand !== "__OTHER__" ? replaceBrand : "");
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline transition-colors"
                    >
                      {isCustomBrand ? "📋 เลือกจากลิสต์" : "✏️ พิมพ์ยี่ห้อเอง"}
                    </button>
                  </div>

                  {isCustomBrand ? (
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="พิมพ์ชื่อยี่ห้อ เช่น Giti, Linglong, Westlake..."
                        value={customBrandText}
                        onChange={(e) => setCustomBrandText(e.target.value)}
                        className="w-full px-3 py-2 bg-amber-50/70 border-2 border-amber-400 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        autoFocus
                      />
                      <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                        ✨ พิมพ์ระบุแบรนด์อื่นได้อย่างอิสระ
                      </span>
                    </div>
                  ) : (
                    <select
                      value={replaceBrand}
                      onChange={(e) => {
                        if (e.target.value === "__OTHER__") {
                          setIsCustomBrand(true);
                          setCustomBrandText("");
                        } else {
                          setReplaceBrand(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      {TIRE_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b === "__OTHER__" ? "➕ อื่นๆ (พิมพ์ระบุเอง...)" : b}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รุ่นยาง / ลายดอก:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น R156, X Multi, ดอกสร้อย..."
                    value={replaceModel}
                    onChange={(e) => setReplaceModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Size (Dropdown + Custom Typing Option) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ขนาดยาง:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSize(!isCustomSize);
                        if (!isCustomSize && !customSizeText) {
                          setCustomSizeText(replaceSize);
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline transition-colors"
                    >
                      {isCustomSize ? "📋 เลือกจากลิสต์" : "✏️ พิมพ์ขนาดเอง"}
                    </button>
                  </div>

                  {isCustomSize ? (
                    <div>
                      <input
                        type="text"
                        placeholder="เช่น 11R22.5, 315/80R22.5..."
                        value={customSizeText}
                        onChange={(e) => setCustomSizeText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <select
                      value={replaceSize}
                      onChange={(e) => {
                        if (e.target.value === "__OTHER__") {
                          setIsCustomSize(true);
                          setCustomSizeText("");
                        } else {
                          setReplaceSize(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      {TIRE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="__OTHER__">➕ อื่นๆ (พิมพ์ขนาดเอง...)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Row 3: DOT, Serial, Tire Type (With Retread options & Custom) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    DOT (สัปดาห์/ปีที่ผลิต):
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น DOT 3424"
                    value={replaceDot}
                    onChange={(e) => setReplaceDot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ซีเรียลนัมเบอร์:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น SN-8849201"
                    value={replaceSerial}
                    onChange={(e) => setReplaceSerial(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tire Type (Supports New, Retread, Cold/Hot Retread, Used, Custom) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ประเภทยาง: <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomType(!isCustomType);
                        if (!isCustomType && !customTypeText) {
                          setCustomTypeText("");
                        }
                      }}
                      className="text-[10px] text-purple-600 hover:text-purple-800 font-bold underline transition-colors"
                    >
                      {isCustomType ? "📋 เลือกจากลิสต์" : "✏️ ระบุประเภทเอง"}
                    </button>
                  </div>

                  {isCustomType ? (
                    <div>
                      <input
                        type="text"
                        placeholder="ระบุประเภทยาง เช่น หล่อดอกโครงเรเดียล..."
                        value={customTypeText}
                        onChange={(e) => setCustomTypeText(e.target.value)}
                        className="w-full px-3 py-2 bg-purple-50/70 border-2 border-purple-400 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <select
                      value={replaceType}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "other") {
                          setIsCustomType(true);
                          setCustomTypeText("");
                        } else {
                          setReplaceType(val);
                          // Auto adjust typical cost / depth hints for retread
                          if (["retread", "cold_retread", "hot_retread"].includes(val)) {
                            if (replaceCost === 9000 || replaceCost === 0) setReplaceCost(4800);
                            if (replaceInitialDepth === 14.0) setReplaceInitialDepth(13.0);
                          } else if (val === "new") {
                            if (replaceCost === 4800) setReplaceCost(9000);
                            if (replaceInitialDepth === 13.0) setReplaceInitialDepth(14.0);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      {TIRE_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 4: Initial Depth, Cost, Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ความลึกดอกยางเริ่มต้น (mm):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={replaceInitialDepth}
                    onChange={(e) => setReplaceInitialDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ราคาต่อเส้น (บาท):
                  </label>
                  <input
                    type="number"
                    value={replaceCost}
                    onChange={(e) => setReplaceCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-amber-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สาเหตุที่เปลี่ยน:
                  </label>
                  <select
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {TIRE_REPLACEMENT_REASONS.map((r) => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Supplier & Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ศูนย์บริการ / ร้านค้าที่ติดตั้ง:
                  </label>
                  <input
                    type="text"
                    value={replaceSupplier}
                    onChange={(e) => setReplaceSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ช่างผู้รับผิดชอบ:
                  </label>
                  <input
                    type="text"
                    value={replaceTechnician}
                    onChange={(e) => setReplaceTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม:
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ถ่วงล้อเลเซอร์, สลับคู่หน้าไปหลัง, เก็บโครงยางเก่าไว้หล่อดอก"
                  value={replaceNotes}
                  onChange={(e) => setReplaceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={targetPositions.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนยาง ({targetPositions.length} เส้น)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: QUICK TREAD DEPTH MEASUREMENT UPDATE           */}
      {/* ======================================================== */}
      {isQuickMeasurementModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">อัปเดตการตรวจวัดดอกยาง ({quickPosKey})</h3>
              </div>
              <button
                onClick={() => setIsQuickMeasurementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickMeasurement} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ความลึกร่องดอกยาง (มม.): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  required
                  value={quickDepth}
                  onChange={(e) => setQuickDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  เกณฑ์: &gt;3.5 mm ปกติ | 2.0 - 3.5 mm เฝ้าระวัง | &lt;2.0 mm วิกฤต
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แรงดันลมยาง (PSI):
                </label>
                <input
                  type="number"
                  value={quickPsi}
                  onChange={(e) => setQuickPsi(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สภาพความสึกหรอ:
                </label>
                <select
                  value={quickWear}
                  onChange={(e) => setQuickWear(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">ปกติ สึกสม่ำเสมอ (Normal)</option>
                  <option value="uneven_wear">สึกไม่สม่ำเสมอ / กินข้าง (Uneven Wear)</option>
                  <option value="cracks">แตกลายงา (Cracks)</option>
                  <option value="bulge">บวมปูด (Bulge - วิกฤต)</option>
                  <option value="cut">ฉีกขาด (Cut - วิกฤต)</option>
                  <option value="nail_puncture">มีตะปูตำ (Nail Puncture)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickMeasurementModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                >
                  บันทึกผลการวัด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated Alert System: Settings Modal */}
      <TireAlertSettingsModal
        isOpen={isAlertSettingsModalOpen}
        onClose={() => setIsAlertSettingsModalOpen(false)}
        settings={alertSettings}
        onSave={handleSaveAlertSettings}
      />

      {/* Automated Alert System: Dispatch to LINE / Maintenance Modal */}
      <TireAlertDispatchModal
        isOpen={isAlertDispatchModalOpen}
        onClose={() => setIsAlertDispatchModalOpen(false)}
        alerts={fleetAlerts}
        settings={alertSettings}
        onRequestRepairForVehicle={onRequestRepairForVehicle}
      />
    </div>
  );
};
