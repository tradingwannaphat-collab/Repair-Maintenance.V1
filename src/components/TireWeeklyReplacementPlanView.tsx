import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Truck,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Edit3,
  User,
  MapPin,
  ChevronDown,
  Sparkles,
  Check,
  X,
  Plus,
  Eye,
  ArrowRight,
  Gauge,
  Flame,
  Building,
  Phone
} from "lucide-react";
import {
  TireMaintenanceAlert,
  TireAlertSetting,
  VehicleRecord,
  WeeklyTirePlanVehicle,
  WeeklyPlanStatus,
  WeeklyPlanOverride
} from "../types";
import { VEHICLE_TYPE_LABELS } from "../data/categories";

const STORAGE_KEY = "TNB_TIRE_WEEKLY_PLAN_OVERRIDES_V1";

interface TireWeeklyReplacementPlanViewProps {
  alerts: TireMaintenanceAlert[];
  settings: TireAlertSetting;
  vehicles: VehicleRecord[];
  onSelectVehicleForDiagram: (vehicleId: string) => void;
  onReplaceTire?: (positionKey: string, vehicleId?: string) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
}

// 4 Standard Weeks Definition
export interface WeekDefinition {
  weekNumber: 1 | 2 | 3 | 4;
  labelTh: string;
  dateRangeTh: string;
  urgencyLabel: string;
  urgencyLevel: "critical" | "warning_high" | "warning_mid" | "normal";
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  columnHeaderBg: string;
  description: string;
}

export const WEEK_DEFINITIONS: WeekDefinition[] = [
  {
    weekNumber: 1,
    labelTh: "สัปดาห์ที่ 1",
    dateRangeTh: "1 - 7 ก.ย. 2569 (สัปดาห์นี้)",
    urgencyLabel: "เร่งด่วนสูงสุด (วิกฤตห้ามวิ่ง)",
    urgencyLevel: "critical",
    badgeBg: "bg-rose-500/20",
    badgeBorder: "border-rose-500/40",
    badgeText: "text-rose-400",
    columnHeaderBg: "from-rose-950/80 via-slate-900 to-slate-900 border-rose-700/60",
    description: "รถที่ตรวจพบดอกยางต่ำกว่า 2.0 มม. หรือยางบวม/ฉีก ต้องเปลี่ยนทันทีก่อนปล่อยวิ่ง"
  },
  {
    weekNumber: 2,
    labelTh: "สัปดาห์ที่ 2",
    dateRangeTh: "8 - 14 ก.ย. 2569",
    urgencyLabel: "เฝ้าระวังขั้นสูง (ใกล้แตะวิกฤต)",
    urgencyLevel: "warning_high",
    badgeBg: "bg-amber-500/20",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-400",
    columnHeaderBg: "from-amber-950/80 via-slate-900 to-slate-900 border-amber-700/60",
    description: "รถที่ดอกยางเหลือ 2.0 - 2.5 มม. เตรียมอะไหล่และเข้าเปลี่ยนในสัปดาห์หน้า"
  },
  {
    weekNumber: 3,
    labelTh: "สัปดาห์ที่ 3",
    dateRangeTh: "15 - 21 ก.ย. 2569",
    urgencyLabel: "เฝ้าระวังทั่วไป (ตามรอบบำรุง)",
    urgencyLevel: "warning_mid",
    badgeBg: "bg-blue-500/20",
    badgeBorder: "border-blue-500/40",
    badgeText: "text-blue-400",
    columnHeaderBg: "from-blue-950/80 via-slate-900 to-slate-900 border-blue-700/60",
    description: "รถที่ดอกยาง 2.6 - 3.0 มม. จัดคิวเข้าสลับหรือเปลี่ยนตามแผนงาน"
  },
  {
    weekNumber: 4,
    labelTh: "สัปดาห์ที่ 4",
    dateRangeTh: "22 - 30 ก.ย. 2569",
    urgencyLabel: "เตรียมความพร้อมล่วงหน้า",
    urgencyLevel: "normal",
    badgeBg: "bg-emerald-500/20",
    badgeBorder: "border-emerald-500/40",
    badgeText: "text-emerald-400",
    columnHeaderBg: "from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-700/60",
    description: "รถที่ดอกยาง 3.1 - 3.5 มม. เฝ้าระวังต่อเนื่องและเตรียมสั่งซื้อสต็อกยาง"
  }
];

export const TireWeeklyReplacementPlanView: React.FC<TireWeeklyReplacementPlanViewProps> = ({
  alerts,
  settings,
  vehicles,
  onSelectVehicleForDiagram,
  onReplaceTire,
  onRequestRepairForVehicle
}) => {
  // Load overrides from LocalStorage
  const [overrides, setOverrides] = useState<Record<string, WeeklyPlanOverride>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save overrides to LocalStorage
  const updateOverride = (vehicleId: string, partial: Partial<WeeklyPlanOverride>) => {
    setOverrides((prev) => {
      const next = {
        ...prev,
        [vehicleId]: {
          ...(prev[vehicleId] || {}),
          ...partial
        }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to persist weekly plan overrides", e);
      }
      return next;
    });
  };

  // Reset all overrides to smart auto-schedule
  const handleResetToAutoSchedule = () => {
    if (window.confirm("ต้องการรีเซ็ตการจัดสัปดาห์ทั้งหมดกลับเป็นค่าคำนวณตามระดับความเร่งด่วนอัตโนมัติหรือไม่?")) {
      setOverrides({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // View Filter / Controls
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"kanban" | "table" | "cards">("kanban");

  // Modal for editing vehicle schedule
  const [editingVehiclePlan, setEditingVehiclePlan] = useState<WeeklyTirePlanVehicle | null>(null);
  const [editWeekNum, setEditWeekNum] = useState<1 | 2 | 3 | 4>(1);
  const [editTargetDate, setEditTargetDate] = useState<string>("");
  const [editStatus, setEditStatus] = useState<WeeklyPlanStatus>("pending");
  const [editShop, setEditShop] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Group alerts by Vehicle to construct WeeklyTirePlanVehicle objects
  const plannedVehicles: WeeklyTirePlanVehicle[] = useMemo(() => {
    // 1. Group alerts by vehicleId
    const vehicleAlertMap = new Map<string, TireMaintenanceAlert[]>();
    alerts.forEach((alert) => {
      const list = vehicleAlertMap.get(alert.vehicleId) || [];
      list.push(alert);
      vehicleAlertMap.set(alert.vehicleId, list);
    });

    const result: WeeklyTirePlanVehicle[] = [];

    vehicleAlertMap.forEach((vAlerts, vId) => {
      const vehicle = vehicles.find((v) => v.id === vId) || {
        id: vId,
        licensePlate: vAlerts[0]?.licensePlate || "-",
        vehicleType: vAlerts[0]?.vehicleType || "tractor_6w",
        department: vAlerts[0]?.department || "ฝ่ายขนส่ง",
        driverName: vAlerts[0]?.driverName || "-",
        currentMileage: vAlerts[0]?.currentMileage || 0,
        brand: "",
        model: ""
      };

      const hasCritical = vAlerts.some((a) => a.alertLevel === "critical");
      const minTread = Math.min(...vAlerts.map((a) => a.treadDepthMm));

      // Calculate automated week assignment based on safety priority
      let autoWeek: 1 | 2 | 3 | 4 = 1;
      if (hasCritical) {
        autoWeek = 1; // Critical tires must be done in Week 1 (Urgent)
      } else if (minTread <= 2.5) {
        autoWeek = 2; // Approaching critical -> Week 2
      } else if (minTread <= 3.0) {
        autoWeek = 3; // Mid-warning -> Week 3
      } else {
        autoWeek = 4; // Warning -> Week 4
      }

      // Calculate cost
      const isHeavy =
        vehicle.vehicleType === "tractor_6w" ||
        vehicle.vehicleType === "trailer_2axle" ||
        vehicle.vehicleType === "trailer_3axle" ||
        vehicle.vehicleType === "box_truck_6w";
      const unitCost = isHeavy ? 12500 : 3800;
      const estimatedCost = vAlerts.length * unitCost;

      // Apply overrides if any
      const override = overrides[vId] || {};
      const finalWeekNumber = override.weekNumber || autoWeek;
      const weekDef = WEEK_DEFINITIONS.find((w) => w.weekNumber === finalWeekNumber) || WEEK_DEFINITIONS[0];

      // Default target date based on week
      let defaultTargetDate = "";
      if (finalWeekNumber === 1) defaultTargetDate = "2026-09-04";
      else if (finalWeekNumber === 2) defaultTargetDate = "2026-09-11";
      else if (finalWeekNumber === 3) defaultTargetDate = "2026-09-18";
      else defaultTargetDate = "2026-09-25";

      result.push({
        vehicleId: vId,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        department: vehicle.department,
        driverName: vehicle.driverName,
        driverPhone: (vehicle as any).driverPhone,
        currentMileage: vehicle.currentMileage,
        brand: (vehicle as any).vehicleBrand || (vehicle as any).brand,
        model: (vehicle as any).vehicleModel || (vehicle as any).model,
        weekNumber: finalWeekNumber,
        weekLabel: `${weekDef.labelTh} (${weekDef.dateRangeTh})`,
        targetDate: override.targetDate || defaultTargetDate,
        tiresToReplace: vAlerts.map((a) => ({
          alertId: a.id,
          positionKey: a.positionKey,
          positionNameTh: a.positionNameTh,
          treadDepthMm: a.treadDepthMm,
          thresholdMm: a.thresholdMm,
          differenceMm: a.differenceMm,
          alertLevel: a.alertLevel,
          wearCondition: a.wearCondition,
          tireBrand: a.tireBrand,
          pressurePsi: a.pressurePsi
        })),
        totalTires: vAlerts.length,
        hasCritical,
        minTreadDepthMm: minTread,
        estimatedCost,
        status: override.status || "pending",
        assignedShopOrTechnician: override.assignedShopOrTechnician || (hasCritical ? "ส.รวมยนต์ (ศูนย์เปลี่ยนด่วน)" : "อู่เจริญการยาง"),
        notes: override.notes || (hasCritical ? "ห้ามปล่อยรถวิ่งทางไกล จนกว่าจะเปลี่ยนยางเสร็จ" : "")
      });
    });

    // Sort: Critical first, then min tread depth ascending
    return result.sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      if (a.hasCritical !== b.hasCritical) return a.hasCritical ? -1 : 1;
      return a.minTreadDepthMm - b.minTreadDepthMm;
    });
  }, [alerts, vehicles, overrides]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return plannedVehicles.filter((v) => {
      if (selectedWeekFilter !== "all" && v.weekNumber !== selectedWeekFilter) {
        return false;
      }
      if (selectedStatusFilter !== "all" && v.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPlate = (v.licensePlate || "").toLowerCase().includes(q);
        const matchDriver = (v.driverName || "").toLowerCase().includes(q);
        const matchDept = (v.department || "").toLowerCase().includes(q);
        const matchBrand = [v.brand, v.model].filter(Boolean).join(" ").toLowerCase().includes(q);
        const matchPos = v.tiresToReplace.some((t) =>
          t.positionNameTh.toLowerCase().includes(q) || t.positionKey.toLowerCase().includes(q)
        );
        if (!matchPlate && !matchDriver && !matchDept && !matchBrand && !matchPos) {
          return false;
        }
      }
      return true;
    });
  }, [plannedVehicles, selectedWeekFilter, selectedStatusFilter, searchQuery]);

  // Aggregate stats per week
  const weekStats = useMemo(() => {
    return WEEK_DEFINITIONS.map((def) => {
      const items = plannedVehicles.filter((v) => v.weekNumber === def.weekNumber);
      const vehicleCount = items.length;
      const tireCount = items.reduce((sum, v) => sum + v.totalTires, 0);
      const cost = items.reduce((sum, v) => sum + v.estimatedCost, 0);
      const criticalVehicles = items.filter((v) => v.hasCritical).length;
      const completedCount = items.filter((v) => v.status === "completed").length;

      return {
        ...def,
        vehicleCount,
        tireCount,
        cost,
        criticalVehicles,
        completedCount,
        items
      };
    });
  }, [plannedVehicles]);

  // Total summary
  const grandTotalVehicles = plannedVehicles.length;
  const grandTotalTires = plannedVehicles.reduce((sum, v) => sum + v.totalTires, 0);
  const grandTotalCost = plannedVehicles.reduce((sum, v) => sum + v.estimatedCost, 0);

  // Open edit modal
  const handleOpenEditModal = (v: WeeklyTirePlanVehicle) => {
    setEditingVehiclePlan(v);
    setEditWeekNum(v.weekNumber);
    setEditTargetDate(v.targetDate || "");
    setEditStatus(v.status);
    setEditShop(v.assignedShopOrTechnician || "");
    setEditNotes(v.notes || "");
  };

  const handleSaveEditModal = () => {
    if (!editingVehiclePlan) return;
    updateOverride(editingVehiclePlan.vehicleId, {
      weekNumber: editWeekNum,
      targetDate: editTargetDate,
      status: editStatus,
      assignedShopOrTechnician: editShop,
      notes: editNotes
    });
    setEditingVehiclePlan(null);
  };

  // Quick move week handler
  const handleQuickMoveWeek = (vehicleId: string, targetWeek: 1 | 2 | 3 | 4) => {
    updateOverride(vehicleId, { weekNumber: targetWeek });
  };

  // Quick toggle status handler
  const handleQuickToggleStatus = (vehicleId: string, currentStatus: WeeklyPlanStatus) => {
    const nextStatus: Record<WeeklyPlanStatus, WeeklyPlanStatus> = {
      pending: "scheduled",
      scheduled: "in_progress",
      in_progress: "completed",
      completed: "pending"
    };
    updateOverride(vehicleId, { status: nextStatus[currentStatus] });
  };

  // Export Weekly Plan to CSV
  const handleExportWeeklyPlanCSV = () => {
    const headers = [
      "สัปดาห์ที่",
      "ช่วงวันที่ของสัปดาห์",
      "ทะเบียนรถ",
      "ประเภทรถ",
      "ยี่ห้อ/รุ่น",
      "แผนก",
      "พนักงานขับรถ",
      "เลขไมล์ปัจจุบัน",
      "ระดับความเร่งด่วน",
      "จำนวนยางที่ต้องเปลี่ยน",
      "ตำแหน่งล้อและดอกยาง (มม.)",
      "วันที่นัดหมาย",
      "ศูนย์บริการ/ช่าง",
      "สถานะแผนงาน",
      "ประมาณการงบประมาณ (บาท)",
      "หมายเหตุ"
    ];

    const rows = plannedVehicles.map((v) => {
      const weekDef = WEEK_DEFINITIONS.find((w) => w.weekNumber === v.weekNumber);
      const tireListText = v.tiresToReplace
        .map((t) => `${t.positionNameTh} (${t.treadDepthMm}มม. ${t.alertLevel === "critical" ? "🔴วิกฤต" : "🟡เฝ้าระวัง"})`)
        .join("; ");

      const statusTh =
        v.status === "completed"
          ? "เสร็จสิ้นแล้ว"
          : v.status === "in_progress"
          ? "อยู่ระหว่างเข้าซ่อม"
          : v.status === "scheduled"
          ? "ล็อคคิวแล้ว"
          : "รอดำเนินการ";

      return [
        `"สัปดาห์ที่ ${v.weekNumber}"`,
        `"${weekDef?.dateRangeTh || ""}"`,
        `"${v.licensePlate}"`,
        `"${VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}"`,
        `"${[v.brand, v.model].filter(Boolean).join(" ") || "-"}"`,
        `"${v.department}"`,
        `"${v.driverName || "-"}"`,
        v.currentMileage,
        v.hasCritical ? "🔴 วิกฤตห้ามวิ่ง" : "🟡 เฝ้าระวัง",
        v.totalTires,
        `"${tireListText}"`,
        `"${v.targetDate || "-"}"`,
        `"${v.assignedShopOrTechnician || "-"}"`,
        `"${statusTh}"`,
        v.estimatedCost,
        `"${(v.notes || "").replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Weekly_Tire_Replacement_Plan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="tire-weekly-replacement-plan" className="space-y-6">
      {/* 1. TOP HEADER: Weekly Schedule Banner & Summary Cards */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>แผนการเปลี่ยนยางประจำสัปดาห์ (Weekly Fleet Schedule)</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ประจำเดือน กันยายน 2569
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2.5">
              <span>จัดคิวเปลี่ยนยางรายสัปดาห์</span>
              <span className="text-sm font-normal text-slate-400">
                (กระจายคิวรถ {grandTotalVehicles} คัน • ยาง {grandTotalTires} เส้น)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ระบุชัดเจนว่า <strong className="text-white">"คันไหน"</strong> ต้องเปลี่ยนใน{" "}
              <strong className="text-blue-300">"สัปดาห์ไหน"</strong> โดยระบบจัดลำดับความเร่งด่วนตามความลึกดอกยาง
              เพื่อไม่ให้รถจอดซ่อมชนกันและรักษามาตรฐานความปลอดภัยสูงสุด
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToAutoSchedule}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="จัดคิวรถเข้าแต่ละสัปดาห์ตามระดับความเร่งด่วนใหม่อัตโนมัติ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>จัดแผนอัตโนมัติ</span>
            </button>

            <button
              type="button"
              onClick={handleExportWeeklyPlanCSV}
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 transition-colors"
              title="ดาวน์โหลดตารางแผนรายสัปดาห์เป็นไฟล์ Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              title="พิมพ์ใบแผนการเปลี่ยนยางประจำสัปดาห์"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบแผนงาน</span>
            </button>
          </div>
        </div>

        {/* 4 Weekly Breakdown Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          {weekStats.map((week) => {
            const isFiltered = selectedWeekFilter === week.weekNumber;

            return (
              <div
                key={week.weekNumber}
                onClick={() =>
                  setSelectedWeekFilter(selectedWeekFilter === week.weekNumber ? "all" : week.weekNumber)
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isFiltered
                    ? "bg-slate-800 ring-2 ring-blue-400 shadow-lg border-blue-400"
                    : "bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${week.badgeBg} ${week.badgeBorder} ${week.badgeText}`}
                    >
                      {week.labelTh}
                    </span>
                    <div className="text-xs font-bold text-slate-300 mt-1 font-mono">
                      {week.dateRangeTh}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xl sm:text-2xl font-black font-mono ${
                        week.criticalVehicles > 0 ? "text-rose-400" : "text-white"
                      }`}
                    >
                      {week.vehicleCount}{" "}
                      <span className="text-xs font-normal text-slate-400">คัน</span>
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {week.tireCount} เส้น
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">งบประมาณ:</div>
                  <div className="font-mono font-bold text-amber-300">
                    ฿{week.cost.toLocaleString()}
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">เสร็จแล้ว:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {week.completedCount} / {week.vehicleCount} คัน
                  </span>
                </div>

                {isFiltered && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CONTROL BAR: Search, Week Tabs & View Modes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาทะเบียนรถ, คนขับ, แผนก, ยี่ห้อ หรือตำแหน่งล้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Status Filter & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">สถานะ:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                <option value="pending">⏳ รอดำเนินการ</option>
                <option value="scheduled">📅 ล็อคคิวแล้ว</option>
                <option value="in_progress">🔧 อยู่ระหว่างซ่อม</option>
                <option value="completed">✅ เสร็จสิ้นแล้ว</option>
              </select>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setLayoutMode("kanban")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layoutMode === "kanban"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="มุมมองคอลัมน์แบ่งรายสัปดาห์ (Weekly Columns)"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>คอลัมน์สัปดาห์</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layoutMode === "table"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="มุมมองตารางกำหนดการ (Matrix Table)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>ตารางกำหนดการ</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode("cards")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layoutMode === "cards"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="มุมมองการ์ดรายคัน"
              >
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>การ์ดรายคัน</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Week Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">เลือกดูสัปดาห์:</span>
            <button
              type="button"
              onClick={() => setSelectedWeekFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                selectedWeekFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ทุกสัปดาห์ ({plannedVehicles.length} คัน)
            </button>

            {WEEK_DEFINITIONS.map((def) => {
              const count = plannedVehicles.filter((v) => v.weekNumber === def.weekNumber).length;
              const isSelected = selectedWeekFilter === def.weekNumber;
              return (
                <button
                  key={def.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeekFilter(isSelected ? "all" : def.weekNumber)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${def.weekNumber === 1 ? "bg-rose-500" : def.weekNumber === 2 ? "bg-amber-500" : def.weekNumber === 3 ? "bg-blue-500" : "bg-emerald-500"}`} />
                  <span>
                    {def.labelTh} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-slate-500 text-[11px]">
            แสดงผล <strong>{filteredVehicles.length}</strong> คัน จากทั้งหมด {plannedVehicles.length} คัน
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: Switch between Kanban, Table, or Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            ไม่พบรถในแผนการเปลี่ยนตามเงื่อนไขตัวกรอง
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกดู "ทุกสัปดาห์" เพื่อดูรถทั้งหมด
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedWeekFilter("all");
              setSelectedStatusFilter("all");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : layoutMode === "kanban" ? (
        /* ============================================================= */
        /* MODE 1: WEEKLY KANBAN COLUMNS (สัปดาห์ไหน คันไหน ชัดเจนที่สุด) */
        /* ============================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {WEEK_DEFINITIONS.filter(
            (def) => selectedWeekFilter === "all" || selectedWeekFilter === def.weekNumber
          ).map((weekDef) => {
            const weekVehicles = filteredVehicles.filter((v) => v.weekNumber === weekDef.weekNumber);
            const totalTiresInWeek = weekVehicles.reduce((sum, v) => sum + v.totalTires, 0);
            const totalCostInWeek = weekVehicles.reduce((sum, v) => sum + v.estimatedCost, 0);

            return (
              <div
                key={weekDef.weekNumber}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[550px] overflow-hidden"
              >
                {/* Column Header */}
                <div className={`p-4 bg-gradient-to-br ${weekDef.columnHeaderBg} text-white border-b border-slate-700/50`}>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${weekDef.badgeBg} ${weekDef.badgeBorder} ${weekDef.badgeText}`}
                    >
                      {weekDef.labelTh}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {weekVehicles.length} คัน
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white mt-1.5 font-mono">
                    {weekDef.dateRangeTh}
                  </h3>

                  <div className="text-[11px] text-slate-300/90 mt-0.5 flex items-center gap-1">
                    <span>{weekDef.urgencyLabel}</span>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">ต้องเปลี่ยน:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {totalTiresInWeek} เส้น • ฿{totalCostInWeek.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Column Body: Vehicle Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[750px]">
                  {weekVehicles.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      <span>ไม่มีรถที่กำหนดในสัปดาห์นี้</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        สามารถย้ายรถจากสัปดาห์อื่นมาที่นี่ได้
                      </span>
                    </div>
                  ) : (
                    weekVehicles.map((v) => {
                      return (
                        <div
                          key={v.vehicleId}
                          className={`bg-white rounded-xl border p-3.5 shadow-sm transition-all hover:shadow-md ${
                            v.hasCritical
                              ? "border-rose-300 hover:border-rose-500 bg-rose-50/10"
                              : "border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          {/* Card Top: License Plate & Vehicle Specs */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {/* Thai Style License Plate Display */}
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border-2 border-amber-500/80 rounded-lg shadow-xs">
                                <Truck className="w-3.5 h-3.5 text-amber-700" />
                                <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                                  {v.licensePlate}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-600 font-semibold mt-1">
                                {[v.brand, v.model].filter(Boolean).join(" ") || VEHICLE_TYPE_LABELS[v.vehicleType]}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {v.department} • คนขับ: {v.driverName || "-"}
                              </div>
                            </div>

                            {/* Status Chip / Dropdown */}
                            <div className="text-right shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuickToggleStatus(v.vehicleId, v.status)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                                  v.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : v.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800 border-blue-300 animate-pulse"
                                    : v.status === "scheduled"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                }`}
                                title="คลิกเพื่อเปลี่ยนสถานะงาน"
                              >
                                {v.status === "completed"
                                  ? "✅ เสร็จสิ้น"
                                  : v.status === "in_progress"
                                  ? "🔧 กำลังซ่อม"
                                  : v.status === "scheduled"
                                  ? "📅 ล็อคคิว"
                                  : "⏳ รอดำเนินการ"}
                              </button>
                              <div className="text-[10px] font-mono text-slate-400 mt-1">
                                {v.currentMileage.toLocaleString()} กม.
                              </div>
                            </div>
                          </div>

                          {/* Target Date & Shop */}
                          <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                <span>นัดหมาย:</span>
                              </span>
                              <span className="font-mono font-bold text-slate-800">
                                {v.targetDate ? new Date(v.targetDate).toLocaleDateString("th-TH") : "ตามรอบสัปดาห์"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 text-slate-400">
                                <Building className="w-3 h-3 text-amber-600" />
                                <span>อู่/ร้านยาง:</span>
                              </span>
                              <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={v.assignedShopOrTechnician}>
                                {v.assignedShopOrTechnician || "อู่เจริญการยาง"}
                              </span>
                            </div>
                          </div>

                          {/* Tires to replace breakdown */}
                          <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                <Gauge className="w-3 h-3 text-blue-600" />
                                <span>ล้อที่ต้องเปลี่ยน ({v.totalTires} เส้น):</span>
                              </span>
                              <span className="font-mono font-bold text-amber-700">
                                ฿{v.estimatedCost.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {v.tiresToReplace.map((tire) => (
                                <span
                                  key={tire.alertId}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
                                    tire.alertLevel === "critical"
                                      ? "bg-rose-100 text-rose-800 border-rose-300"
                                      : "bg-amber-100 text-amber-800 border-amber-300"
                                  }`}
                                  title={`${tire.positionNameTh} ความลึก ${tire.treadDepthMm} มม. (${tire.wearCondition})`}
                                >
                                  <span>{tire.positionKey}</span>
                                  <span className="font-normal text-[9px] text-slate-600">
                                    {tire.treadDepthMm}มม.
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>

                          {v.notes && (
                            <div className="mt-2 text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-100">
                              <strong>หมายเหตุ:</strong> {v.notes}
                            </div>
                          )}

                          {/* Quick Change Week Dropdown / Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-slate-400 text-[10px]">ย้ายสัปดาห์:</span>
                            <div className="flex items-center gap-1">
                              {([1, 2, 3, 4] as const).map((wNum) => (
                                <button
                                  key={wNum}
                                  type="button"
                                  onClick={() => handleQuickMoveWeek(v.vehicleId, wNum)}
                                  className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold transition-all ${
                                    v.weekNumber === wNum
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                  }`}
                                  title={`ย้ายไปสัปดาห์ที่ ${wNum}`}
                                >
                                  W{wNum}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(v)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="แก้ไขนัดหมาย / วันที่ / อู่บริการ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onSelectVehicleForDiagram(v.vehicleId)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ดูผังล้อรอบคัน"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {onReplaceTire && (
                              <button
                                type="button"
                                onClick={() => onReplaceTire(v.tiresToReplace[0]?.positionKey, v.vehicleId)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                                title="บันทึกเปลี่ยนยางใหม่"
                              >
                                เปลี่ยนยาง
                              </button>
                            )}

                            {onRequestRepairForVehicle && (
                              <button
                                type="button"
                                onClick={() => onRequestRepairForVehicle(v.licensePlate)}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold text-white transition-all flex items-center gap-1 shadow-xs ${
                                  v.hasCritical
                                    ? "bg-rose-600 hover:bg-rose-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                                }`}
                                title="เปิดใบแจ้งซ่อมไปยังฝ่ายซ่อมบำรุงทันที"
                              >
                                <Wrench className="w-3 h-3" />
                                <span>เปิดใบซ่อม</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : layoutMode === "table" ? (
        /* ============================================================= */
        /* MODE 2: WEEKLY MATRIX TABLE (ตารางกำหนดการรายสัปดาห์)          */
        /* ============================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">สัปดาห์</th>
                  <th className="py-3 px-4">ทะเบียนรถ</th>
                  <th className="py-3 px-4">ชนิดรถ / ยี่ห้อ</th>
                  <th className="py-3 px-4">แผนก / คนขับ</th>
                  <th className="py-3 px-4 text-center">ล้อที่ต้องเปลี่ยน</th>
                  <th className="py-3 px-4">รายละเอียดตำแหน่งล้อ & ดอกยาง</th>
                  <th className="py-3 px-4">วันที่นัด / อู่บริการ</th>
                  <th className="py-3 px-4 text-right">งบประมาณ</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVehicles.map((v) => {
                  const weekDef = WEEK_DEFINITIONS.find((w) => w.weekNumber === v.weekNumber);

                  return (
                    <tr
                      key={v.vehicleId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        v.hasCritical ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Week Column */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${weekDef?.badgeBg} ${weekDef?.badgeBorder} ${weekDef?.badgeText} border`}
                        >
                          {weekDef?.labelTh}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {weekDef?.dateRangeTh.split("(")[0]}
                        </div>
                      </td>

                      {/* License Plate */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {v.hasCritical && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                          <span className="text-sm font-black">{v.licensePlate}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">
                          ไมล์: {v.currentMileage.toLocaleString()} กม.
                        </div>
                      </td>

                      {/* Vehicle Type & Brand */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {[v.brand, v.model].filter(Boolean).join(" ") || "-"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}
                        </div>
                      </td>

                      {/* Dept & Driver */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{v.department}</div>
                        <div className="text-[10px] text-slate-400">
                          คนขับ: {v.driverName || "-"}
                        </div>
                      </td>

                      {/* Total Tires */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-lg font-mono font-black text-xs ${
                            v.hasCritical
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {v.totalTires} เส้น
                        </span>
                      </td>

                      {/* Tires Detail */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {v.tiresToReplace.map((t) => (
                            <span
                              key={t.alertId}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                t.alertLevel === "critical"
                                  ? "bg-rose-100 text-rose-800 border-rose-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                              title={`${t.positionNameTh} ${t.treadDepthMm}มม.`}
                            >
                              {t.positionKey}: {t.treadDepthMm}มม.
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Target Date & Shop */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-semibold">
                          {v.targetDate ? new Date(v.targetDate).toLocaleDateString("th-TH") : "-"}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={v.assignedShopOrTechnician}>
                          {v.assignedShopOrTechnician || "อู่เจริญการยาง"}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        ฿{v.estimatedCost.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStatus(v.vehicleId, v.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            v.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : v.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : v.status === "scheduled"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {v.status === "completed"
                            ? "✅ เสร็จสิ้น"
                            : v.status === "in_progress"
                            ? "🔧 กำลังซ่อม"
                            : v.status === "scheduled"
                            ? "📅 ล็อคคิว"
                            : "⏳ รอดำเนินการ"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Change Week */}
                          <select
                            value={v.weekNumber}
                            onChange={(e) => handleQuickMoveWeek(v.vehicleId, Number(e.target.value) as 1 | 2 | 3 | 4)}
                            className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none cursor-pointer"
                            title="ย้ายสัปดาห์"
                          >
                            <option value={1}>W1</option>
                            <option value={2}>W2</option>
                            <option value={3}>W3</option>
                            <option value={4}>W4</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(v)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="แก้ไขรายละเอียด"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {onRequestRepairForVehicle && (
                            <button
                              type="button"
                              onClick={() => onRequestRepairForVehicle(v.licensePlate)}
                              className={`px-2 py-1 rounded text-[11px] font-bold text-white transition-colors ${
                                v.hasCritical
                                  ? "bg-rose-600 hover:bg-rose-500"
                                  : "bg-blue-600 hover:bg-blue-500"
                              }`}
                              title="เปิดใบแจ้งซ่อม"
                            >
                              แจ้งซ่อม
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ============================================================= */
        /* MODE 3: VEHICLE CARDS VIEW (การ์ดรายคันขนาดใหญ่)              */
        /* ============================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map((v) => {
            const weekDef = WEEK_DEFINITIONS.find((w) => w.weekNumber === v.weekNumber);

            return (
              <div
                key={v.vehicleId}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm space-y-3.5 transition-all ${
                  v.hasCritical
                    ? "border-rose-300 hover:border-rose-500 bg-rose-50/15"
                    : "border-slate-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${weekDef?.badgeBg} ${weekDef?.badgeBorder} ${weekDef?.badgeText}`}
                      >
                        {weekDef?.labelTh} ({weekDef?.dateRangeTh})
                      </span>
                      {v.hasCritical ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                          🔴 วิกฤต ห้ามวิ่ง
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                          🟡 เฝ้าระวัง
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900 font-mono mt-1 flex items-center gap-2">
                      <span>{v.licensePlate}</span>
                      <span className="text-xs font-semibold text-slate-500 font-sans">
                        {[v.brand, v.model].filter(Boolean).join(" ")}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500">
                      {v.department} • คนขับ: {v.driverName || "-"} • เลขไมล์: {v.currentMileage.toLocaleString()} กม.
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleStatus(v.vehicleId, v.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        v.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : v.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : v.status === "scheduled"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {v.status === "completed"
                        ? "✅ เสร็จสิ้น"
                        : v.status === "in_progress"
                        ? "🔧 กำลังซ่อม"
                        : v.status === "scheduled"
                        ? "📅 ล็อคคิว"
                        : "⏳ รอดำเนินการ"}
                    </button>
                    <div className="text-sm font-black font-mono text-amber-700 mt-1">
                      ฿{v.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tire list */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>ตำแหน่งล้อที่ต้องเปลี่ยน ({v.totalTires} เส้น):</span>
                    <span className="text-slate-400 font-normal">ความลึกต่ำสุด: {v.minTreadDepthMm} มม.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {v.tiresToReplace.map((t) => (
                      <div
                        key={t.alertId}
                        className={`p-2 rounded-lg border flex items-center justify-between font-mono ${
                          t.alertLevel === "critical"
                            ? "bg-rose-50 border-rose-200 text-rose-900"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div>
                          <div className="font-bold">{t.positionNameTh} ({t.positionKey})</div>
                          <div className="text-[10px] text-slate-500 font-sans">{t.wearCondition}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm">{t.treadDepthMm}</span>{" "}
                          <span className="text-[10px]">มม.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-400">ย้ายสัปดาห์:</span>
                    {([1, 2, 3, 4] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleQuickMoveWeek(v.vehicleId, w)}
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono transition-colors ${
                          v.weekNumber === w
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        W{w}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(v)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      แก้ไขนัดหมาย
                    </button>
                    {onRequestRepairForVehicle && (
                      <button
                        type="button"
                        onClick={() => onRequestRepairForVehicle(v.licensePlate)}
                        className={`px-3 py-1 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                          v.hasCritical ? "bg-rose-600 hover:bg-rose-500" : "bg-blue-600 hover:bg-blue-500"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>เปิดใบแจ้งซ่อม</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: Edit Schedule Details */}
      {editingVehiclePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>ปรับแผนการเปลี่ยนยาง: {editingVehiclePlan.licensePlate}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[editingVehiclePlan.brand, editingVehiclePlan.model].filter(Boolean).join(" ")} • แผนก {editingVehiclePlan.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehiclePlan(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              {/* Select Week */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  กำหนดเข้าสัปดาห์ไหน:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WEEK_DEFINITIONS.map((def) => (
                    <button
                      key={def.weekNumber}
                      type="button"
                      onClick={() => setEditWeekNum(def.weekNumber)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        editWeekNum === def.weekNumber
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold">{def.labelTh}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{def.dateRangeTh}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Date */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  วันที่นัดหมายเฉพาะเจาะจง (Target Date):
                </label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  สถานะแผนงาน:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as WeeklyPlanStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="pending">⏳ รอดำเนินการ (Pending)</option>
                  <option value="scheduled">📅 ล็อคคิวอู่แล้ว (Scheduled)</option>
                  <option value="in_progress">🔧 อยู่ระหว่างเข้าซ่อม (In Progress)</option>
                  <option value="completed">✅ เปลี่ยนเสร็จสมบูรณ์ (Completed)</option>
                </select>
              </div>

              {/* Assigned Shop or Tech */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ศูนย์บริการ / อู่ยาง / ช่างผู้ดูแล:
                </label>
                <input
                  type="text"
                  placeholder="เช่น ส.รวมยนต์, อู่เจริญการยาง, บริดจสโตน บี-ฟาสต์..."
                  value={editShop}
                  onChange={(e) => setEditShop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  หมายเหตุ / ข้อควรระวัง:
                </label>
                <textarea
                  rows={2}
                  placeholder="บันทึกข้อความสำหรับหัวหน้างานหรือช่าง..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingVehiclePlan(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveEditModal}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30"
              >
                บันทึกแผนงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRINT SCHEDULE MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full p-8 my-8 text-slate-900 space-y-6 print:m-0 print:p-4 print:border-none print:shadow-none">
            {/* Print Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div>
                <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                  บริษัท วรรณภัทร ทรานสปอร์ต แอนด์ เซอร์วิส จำกัด
                </div>
                <h1 className="text-xl font-black text-slate-900 mt-1">
                  ใบแผนการเปลี่ยนยางประจำสัปดาห์ (Weekly Fleet Tire Replacement Plan)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  ประจำเดือน กันยายน 2569 • เอกสารควบคุมความปลอดภัย ISO 39001
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>วันที่ออกเอกสาร: {new Date().toLocaleDateString("th-TH")}</div>
                <div>กองยาน: {plannedVehicles.length} คัน / {grandTotalTires} เส้น</div>
                <div className="font-bold text-amber-800">
                  งบประมาณรวม: ฿{grandTotalCost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Weekly Summary Grid */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              {WEEK_DEFINITIONS.map((def) => {
                const count = plannedVehicles.filter((v) => v.weekNumber === def.weekNumber).length;
                const tires = plannedVehicles
                  .filter((v) => v.weekNumber === def.weekNumber)
                  .reduce((s, v) => s + v.totalTires, 0);

                return (
                  <div key={def.weekNumber} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="font-black text-slate-800">{def.labelTh}</div>
                    <div className="text-[10px] text-slate-500">{def.dateRangeTh}</div>
                    <div className="text-sm font-black text-slate-900 mt-1 font-mono">
                      {count} คัน ({tires} เส้น)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vehicle Schedule Table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-[11px] font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-10">ลำดับ</th>
                  <th className="border border-slate-300 p-2">สัปดาห์</th>
                  <th className="border border-slate-300 p-2">ทะเบียนรถ</th>
                  <th className="border border-slate-300 p-2">ประเภท / แผนก</th>
                  <th className="border border-slate-300 p-2">พนักงานขับรถ</th>
                  <th className="border border-slate-300 p-2 text-center">จำนวนล้อ</th>
                  <th className="border border-slate-300 p-2">ตำแหน่งล้อ (ความลึกดอกยาง)</th>
                  <th className="border border-slate-300 p-2">อู่ / วันที่นัด</th>
                  <th className="border border-slate-300 p-2 text-right">งบประมาณ</th>
                </tr>
              </thead>
              <tbody>
                {plannedVehicles.map((v, idx) => (
                  <tr key={v.vehicleId} className={v.hasCritical ? "bg-rose-50/40" : ""}>
                    <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-bold">
                      สัปดาห์ที่ {v.weekNumber}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-bold">
                      {v.licensePlate}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType} ({v.department})
                    </td>
                    <td className="border border-slate-300 p-2">{v.driverName || "-"}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {v.totalTires} เส้น
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px]">
                      {v.tiresToReplace.map((t) => `${t.positionKey} (${t.treadDepthMm}มม.)`).join(", ")}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px]">
                      {v.assignedShopOrTechnician || "อู่เจริญการยาง"}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                      ฿{v.estimatedCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-xs">
              <div className="text-center space-y-10">
                <div>ผู้จัดทำแผนงาน</div>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-[11px] text-slate-500">(เจ้าหน้าที่ฝ่ายซ่อมบำรุง)</div>
              </div>
              <div className="text-center space-y-10">
                <div>หัวหน้าฝ่ายซ่อมบำรุง / ตรวจสอบ</div>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-[11px] text-slate-500">(นายช่างใหญ่ / ผู้จัดการฝ่าย)</div>
              </div>
              <div className="text-center space-y-10">
                <div>ผู้อนุมัติงบประมาณ</div>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-[11px] text-slate-500">(ผู้จัดการทั่วไป / กรรมการ)</div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสารนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
