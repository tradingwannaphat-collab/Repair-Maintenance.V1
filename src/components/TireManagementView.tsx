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
  Tag
} from "lucide-react";
import { 
  VehicleRecord, 
  RepairTicket, 
  TireReplacementRecord, 
  TirePositionMeasurement, 
  VehicleType 
} from "../types";
import { 
  TIRE_BRANDS, 
  TIRE_SIZES, 
  TIRE_REPLACEMENT_REASONS,
  INITIAL_TIRE_REPLACEMENTS,
  getVehicleTireMeasurements 
} from "../data/tireManagementData";
import { 
  getWheelPositionsForVehicleType, 
  CRITICAL_TREAD_DEPTH_MM, 
  WARNING_TREAD_DEPTH_MM, 
  NEW_TIRE_DEPTH_MM,
  WheelPositionConfig
} from "../data/tireInspectionConfig";
import { VEHICLE_TYPE_LABELS } from "../data/categories";

const TIRE_REPLACEMENTS_STORAGE_KEY = "tnb_fleet_tire_replacements_v1";

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
      if (saved) return JSON.parse(saved);
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

  // Selected vehicle for Chassis view
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Main Sub-Tab: 'chassis_inspection' | 'replacement_history' | 'fleet_tire_matrix'
  const [activeSubTab, setActiveSubTab] = useState<"chassis_inspection" | "replacement_history" | "fleet_tire_matrix">("chassis_inspection");

  // Filter / Search for vehicles
  const [vehicleSearch, setVehicleSearch] = useState<string>("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [tireStatusFilter, setTireStatusFilter] = useState<"all" | "critical" | "warning" | "safe">("all");

  // Search in replacement logs
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyBrandFilter, setHistoryBrandFilter] = useState<string>("all");

  // Modals
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState<boolean>(false);
  const [isRotationModalOpen, setIsRotationModalOpen] = useState<boolean>(false);
  const [isQuickMeasurementModalOpen, setIsQuickMeasurementModalOpen] = useState<boolean>(false);

  // Form State for Log Tire Replacement
  const [targetPositions, setTargetPositions] = useState<string[]>([]);
  const [replaceDate, setReplaceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [replaceMileage, setReplaceMileage] = useState<number>(selectedVehicle?.currentMileage || 0);
  const [replaceBrand, setReplaceBrand] = useState<string>("Bridgestone");
  const [replaceModel, setReplaceModel] = useState<string>("R156");
  const [replaceSize, setReplaceSize] = useState<string>("295/80R22.5");
  const [replaceSerial, setReplaceSerial] = useState<string>("");
  const [replaceDot, setReplaceDot] = useState<string>("DOT 3424");
  const [replaceType, setReplaceType] = useState<"new" | "retread" | "rotate" | "used">("new");
  const [replaceInitialDepth, setReplaceInitialDepth] = useState<number>(14.0);
  const [replaceCost, setReplaceCost] = useState<number>(9000);
  const [replaceSupplier, setReplaceSupplier] = useState<string>("ศูนย์บริการ บริดจสโตน บอย ยางยนต์");
  const [replaceTechnician, setReplaceTechnician] = useState<string>("ช่างสมชาย (อู่ TNB)");
  const [replaceReason, setReplaceReason] = useState<string>("worn_out");
  const [replaceNotes, setReplaceNotes] = useState<string>("");

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
      if (m.alertLevel === "critical") critical++;
      else if (m.alertLevel === "warning") warning++;
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
  }, [currentMeasurements]);

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
        if (m.alertLevel === "critical") totalCritical++;
        else if (m.alertLevel === "warning") totalWarning++;
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
  }, [vehicles, replacements]);

  // Filtered vehicles list for left drawer/picker
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (vehicleSearch.trim()) {
        const q = vehicleSearch.toLowerCase();
        const matchPlate = v.licensePlate.toLowerCase().includes(q);
        const matchBrand = v.brand.toLowerCase().includes(q);
        const matchModel = v.model.toLowerCase().includes(q);
        if (!matchPlate && !matchBrand && !matchModel) return false;
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
        const q = historySearch.toLowerCase();
        const matchPlate = r.licensePlate.toLowerCase().includes(q);
        const matchBrand = r.tireBrand.toLowerCase().includes(q);
        const matchPos = r.positionNameTh.toLowerCase().includes(q);
        const matchSerial = (r.tireSerial || "").toLowerCase().includes(q);
        if (!matchPlate && !matchBrand && !matchPos && !matchSerial) return false;
      }
      if (historyBrandFilter !== "all" && r.tireBrand !== historyBrandFilter) {
        return false;
      }
      return true;
    });
  }, [replacements, historySearch, historyBrandFilter]);

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
    setIsReplaceModalOpen(true);
  };

  // Submit Tire Replacement
  const handleSaveTireReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || targetPositions.length === 0) return;

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
        tireBrand: replaceBrand,
        tireModel: replaceModel,
        tireSize: replaceSize,
        tireSerial: replaceSerial ? `${replaceSerial}-${idx + 1}` : undefined,
        dotCode: replaceDot,
        tireType: replaceType,
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
              <span>🔴 วิกฤต ห้ามวิ่ง (&lt; 2.0 mm)</span>
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
              <span>🟡 เฝ้าระวัง (2.0 - 3.5 mm)</span>
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
              <span>🟢 ดอกยางปกติ (&gt; 3.5 mm)</span>
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
            <span>1. ผังตำแหน่งยาง & ตรวจวัดดอกยางรายคัน (Chassis & Wheel Layout)</span>
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
            <span>2. ประวัติการเปลี่ยนยางทั้งหมด (Replacement Log - {replacements.length})</span>
          </button>
        </div>
      </div>

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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                    const isSelected = v.id === selectedVehicle.id;
                    const measurements = getVehicleTireMeasurements(v, replacements);
                    const hasCritical = measurements.some((m) => m.alertLevel === "critical");
                    const hasWarning = measurements.some((m) => m.alertLevel === "warning");
                    const minDepth = Math.min(...measurements.map((m) => m.treadDepthMm));

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
                          <span>{v.brand} {v.model}</span>
                          <span className="text-slate-400 text-[11px]">{VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span>ไมล์: <strong className="text-slate-700 font-mono">{v.currentMileage.toLocaleString()} กม.</strong></span>
                          <span>ดอกยางต่ำสุด: <strong className={`font-mono font-bold ${minDepth < 2.0 ? 'text-rose-600' : minDepth <= 3.5 ? 'text-amber-600' : 'text-emerald-600'}`}>{minDepth} mm</strong></span>
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
                    แผนก: <strong className="text-slate-700">{selectedVehicle.department}</strong>
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {selectedVehicle.licensePlate}
                  </h2>
                  <span className="text-slate-600 text-sm font-semibold">
                    {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                  <span>เลขไมล์ปัจจุบัน: <strong className="text-slate-900 font-mono font-bold">{selectedVehicle.currentMileage.toLocaleString()} กม.</strong></span>
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

            {/* Visual Chassis & Tire Diagram Container */}
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

              {/* Chassis Visual Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {currentMeasurements.map((m) => {
                  const cfg = currentPositionsConfig.find((c) => c.key === m.positionKey);
                  const isCritical = m.alertLevel === "critical";
                  const isWarning = m.alertLevel === "warning";
                  const isSafe = m.alertLevel === "safe";

                  // Find latest replacement for this position
                  const latestRep = replacements
                    .filter((r) => (r.vehicleId === selectedVehicle.id || r.licensePlate === selectedVehicle.licensePlate) && r.positionKey === m.positionKey)
                    .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];

                  const depthPct = Math.min(100, Math.max(0, Math.round((m.treadDepthMm / NEW_TIRE_DEPTH_MM) * 100)));

                  return (
                    <div
                      key={m.positionKey}
                      className={`p-4 rounded-xl border transition-all ${
                        isCritical
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
                              เพลา {cfg.axle > 0 ? cfg.axle : 'อะไหล่'} • {cfg.side === 'left' ? 'ฝั่งซ้าย' : 'ฝั่งขวา'} {cfg.isDual ? '(ล้อคู่)' : ''}
                            </div>
                          )}
                        </div>

                        {/* Status Chip */}
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
                      <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[11px] space-y-1">
                        {latestRep ? (
                          <>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>ยี่ห้อ: <strong className="text-white font-bold">{latestRep.tireBrand} {latestRep.tireModel || ''}</strong></span>
                              <span className="text-slate-400 font-mono">{latestRep.dotCode || 'DOT'}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>เปลี่ยนเมื่อ: <strong className="text-slate-300 font-mono">{latestRep.replacedDate}</strong></span>
                              <span>ไมล์ที่เปลี่ยน: <strong className="text-slate-300 font-mono">{latestRep.replacedMileage.toLocaleString()} กม.</strong></span>
                            </div>
                            {latestRep.tireSerial && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                ซีเรียล: {latestRep.tireSerial}
                              </div>
                            )}
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
                      const isCritical = m.alertLevel === "critical";
                      const isWarning = m.alertLevel === "warning";
                      const latestRep = replacements
                        .filter((r) => (r.vehicleId === selectedVehicle.id || r.licensePlate === selectedVehicle.licensePlate) && r.positionKey === m.positionKey)
                        .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];

                      return (
                        <tr key={m.positionKey} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-100">
                            {m.positionKey}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 border-r border-slate-100">
                            {m.positionNameTh}
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
                                <span className="font-bold text-slate-800">{latestRep.tireBrand} {latestRep.tireModel}</span>
                                <span className="text-slate-500 text-[11px] ml-2">({latestRep.replacedDate}) • ฿{latestRep.costPerTire.toLocaleString()}</span>
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

              {/* Brand Filter */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600">ยี่ห้อ:</span>
                <select
                  value={historyBrandFilter}
                  onChange={(e) => setHistoryBrandFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทุกยี่ห้อ</option>
                  {TIRE_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
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
                          {rec.replacedDate}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono border-r border-slate-100">
                          {rec.licensePlate}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-100">
                          <span className="font-bold text-slate-800">{rec.positionNameTh}</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">({rec.positionKey})</span>
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100">
                          <div className="font-bold text-slate-900">{rec.tireBrand} {rec.tireModel}</div>
                          <div className="text-[11px] text-slate-500">{rec.tireSize}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px] border-r border-slate-100">
                          <div>{rec.dotCode || '-'}</div>
                          <div className="text-[10px] text-slate-400">{rec.tireSerial || '-'}</div>
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rec.tireType === "new"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : rec.tireType === "retread"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {rec.tireType === "new" ? "ยางใหม่" : rec.tireType === "retread" ? "หล่อดอก" : "สลับยาง"}
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
                          {rec.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{rec.notes}</div>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteReplacement(rec.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

              {/* Row 2: Brand, Model, Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยี่ห้อยาง: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={replaceBrand}
                    onChange={(e) => setReplaceBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {TIRE_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รุ่นยาง:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น R156, X Multi"
                    value={replaceModel}
                    onChange={(e) => setReplaceModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ขนาดยาง:
                  </label>
                  <select
                    value={replaceSize}
                    onChange={(e) => setReplaceSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {TIRE_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: DOT, Serial, Tire Type */}
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ประเภทยาง:
                  </label>
                  <select
                    value={replaceType}
                    onChange={(e) => setReplaceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">ยางใหม่ (New Tire)</option>
                    <option value="retread">ยางหล่อดอก (Retread)</option>
                    <option value="rotate">สลับยาง (Rotated)</option>
                    <option value="used">ยางมือสองสภาพดี</option>
                  </select>
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
    </div>
  );
};
