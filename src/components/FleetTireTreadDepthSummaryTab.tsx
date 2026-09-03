import React, { useState, useMemo } from "react";
import { 
  Gauge, 
  Search, 
  Filter, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Eye, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Wrench, 
  Edit3, 
  Plus, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X
} from "lucide-react";
import { 
  VehicleRecord, 
  TirePositionMeasurement, 
  TireReplacementRecord, 
  BatteryReplacementRecord 
} from "../types";
import { 
  getVehicleTireMeasurements 
} from "../data/tireManagementData";
import { 
  getVehicleBatteryRecord 
} from "../data/batteryManagementData";
import { 
  CRITICAL_TREAD_DEPTH_MM, 
  WARNING_TREAD_DEPTH_MM 
} from "../data/tireInspectionConfig";
import { VEHICLE_TYPE_LABELS } from "../data/categories";
import { VehicleChassisTireLayout } from "./VehicleChassisTireLayout";

interface FleetTireTreadDepthSummaryTabProps {
  vehicles: VehicleRecord[];
  replacements: TireReplacementRecord[];
  batteryReplacements: BatteryReplacementRecord[];
  selectedVehicleId: string;
  criticalThresholdMm?: number;
  warningThresholdMm?: number;
  onSelectVehicleId: (id: string) => void;
  onQuickMeasurement?: (measurement: TirePositionMeasurement) => void;
  onReplaceTire?: (positionKey: string) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
}

export const FleetTireTreadDepthSummaryTab: React.FC<FleetTireTreadDepthSummaryTabProps> = ({
  vehicles,
  replacements,
  batteryReplacements,
  selectedVehicleId,
  criticalThresholdMm = CRITICAL_TREAD_DEPTH_MM,
  warningThresholdMm = WARNING_TREAD_DEPTH_MM,
  onSelectVehicleId,
  onQuickMeasurement,
  onReplaceTire,
  onRequestRepairForVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "critical" | "warning" | "safe">("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"min_depth_asc" | "min_depth_desc" | "plate" | "mileage">("min_depth_asc");
  const [isLayoutOpenModal, setIsLayoutOpenModal] = useState<boolean>(false);
  const [showOnlyLayout, setShowOnlyLayout] = useState<boolean>(false);

  // Compute stats for every vehicle in fleet
  const vehicleStatsList = useMemo(() => {
    return vehicles.map((v) => {
      const measurements = getVehicleTireMeasurements(v, replacements);
      const criticalCount = measurements.filter((m) => m.alertLevel === "critical" || m.treadDepthMm < criticalThresholdMm).length;
      const warningCount = measurements.filter((m) => !(m.alertLevel === "critical" || m.treadDepthMm < criticalThresholdMm) && (m.alertLevel === "warning" || m.treadDepthMm <= warningThresholdMm)).length;
      const safeCount = measurements.length - criticalCount - warningCount;
      const minDepth = measurements.length > 0 ? Math.min(...measurements.map((m) => m.treadDepthMm)) : 0;
      const avgDepth = measurements.length > 0 
        ? Number((measurements.reduce((acc, m) => acc + m.treadDepthMm, 0) / measurements.length).toFixed(1))
        : 0;

      let overallGrade: "critical" | "warning" | "safe" = "safe";
      if (criticalCount > 0 || minDepth < criticalThresholdMm) {
        overallGrade = "critical";
      } else if (warningCount > 0 || minDepth <= warningThresholdMm) {
        overallGrade = "warning";
      }

      return {
        vehicle: v,
        measurements,
        criticalCount,
        warningCount,
        safeCount,
        totalTires: measurements.length,
        minDepth,
        avgDepth,
        overallGrade
      };
    });
  }, [vehicles, replacements]);

  // Filter and sort list
  const filteredVehicles = useMemo(() => {
    return vehicleStatsList.filter((item) => {
      const v = item.vehicle;
      const matchesSearch = 
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.brand && v.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.model && v.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.department && v.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === "all" ? true : item.overallGrade === statusFilter;

      const matchesType = 
        vehicleTypeFilter === "all" ? true : v.vehicleType === vehicleTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      if (sortBy === "min_depth_asc") {
        return a.minDepth - b.minDepth;
      } else if (sortBy === "min_depth_desc") {
        return b.minDepth - a.minDepth;
      } else if (sortBy === "plate") {
        return a.vehicle.licensePlate.localeCompare(b.vehicle.licensePlate);
      } else {
        return b.vehicle.currentMileage - a.vehicle.currentMileage;
      }
    });
  }, [vehicleStatsList, searchTerm, statusFilter, vehicleTypeFilter, sortBy]);

  // Currently inspected vehicle
  const currentVehicleStat = useMemo(() => {
    return vehicleStatsList.find((s) => s.vehicle.id === selectedVehicleId) || vehicleStatsList[0];
  }, [vehicleStatsList, selectedVehicleId]);

  const currentVehicleBattery = useMemo(() => {
    if (!currentVehicleStat) return undefined;
    return getVehicleBatteryRecord(currentVehicleStat.vehicle.licensePlate, batteryReplacements) ||
      batteryReplacements.find((b) => b.vehicleId === currentVehicleStat.vehicle.id);
  }, [currentVehicleStat, batteryReplacements]);

  // Fleet Totals
  const fleetTotals = useMemo(() => {
    const totalVehicles = vehicles.length;
    const criticalVehicles = vehicleStatsList.filter((s) => s.overallGrade === "critical").length;
    const warningVehicles = vehicleStatsList.filter((s) => s.overallGrade === "warning").length;
    const safeVehicles = vehicleStatsList.filter((s) => s.overallGrade === "safe").length;
    const totalTires = vehicleStatsList.reduce((sum, s) => sum + s.totalTires, 0);
    const criticalTires = vehicleStatsList.reduce((sum, s) => sum + s.criticalCount, 0);
    const warningTires = vehicleStatsList.reduce((sum, s) => sum + s.warningCount, 0);
    const safeTires = vehicleStatsList.reduce((sum, s) => sum + s.safeCount, 0);

    return {
      totalVehicles,
      criticalVehicles,
      warningVehicles,
      safeVehicles,
      totalTires,
      criticalTires,
      warningTires,
      safeTires
    };
  }, [vehicles, vehicleStatsList]);

  // Export summary to CSV
  const handleExportSummaryCSV = () => {
    const headers = [
      "ลำดับ",
      "ทะเบียนรถ",
      "ยี่ห้อ/รุ่น",
      "ประเภทรถ",
      "แผนก",
      "เลขไมล์ (กม.)",
      "จำนวนยาง (เส้น)",
      "ดอกยางต่ำสุด (mm)",
      "ดอกยางเฉลี่ย (mm)",
      "ล้อวิกฤต (<2.0mm)",
      "ล้อเฝ้าระวัง (2.0-3.5mm)",
      "ล้อปกติ (>3.5mm)",
      "ระดับเกณฑ์ความปลอดภัย"
    ];

    const rows = filteredVehicles.map((item, idx) => [
      idx + 1,
      item.vehicle.licensePlate,
      `"${item.vehicle.brand} ${item.vehicle.model}"`,
      `"${VEHICLE_TYPE_LABELS[item.vehicle.vehicleType] || item.vehicle.vehicleType}"`,
      `"${item.vehicle.department}"`,
      item.vehicle.currentMileage,
      item.totalTires,
      item.minDepth,
      item.avgDepth,
      item.criticalCount,
      item.warningCount,
      item.safeCount,
      item.overallGrade === "critical" ? "วิกฤต (ห้ามวิ่ง)" : item.overallGrade === "warning" ? "เฝ้าระวัง" : "ปกติ"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fleet_Tread_Depth_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS BAR: FLEET TREAD DEPTH HEALTH CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Vehicles Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">รถทั้งหมดในกองยาน</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {fleetTotals.totalVehicles} <span className="text-xs font-normal text-slate-500">คัน</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ตรวจยางครบ {fleetTotals.totalTires} ล้อ
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Vehicles Card */}
        <div 
          onClick={() => setStatusFilter("critical")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
            statusFilter === "critical" ? "border-rose-500 ring-2 ring-rose-300 bg-rose-50/30" : "border-slate-200 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>🔴 เกณฑ์วิกฤต (&lt; 2.0 mm)</span>
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {fleetTotals.criticalVehicles} <span className="text-xs font-normal text-rose-700">คัน</span>
          </div>
          <div className="text-[11px] text-rose-700/80 mt-0.5">
            พบยางวิกฤตรวม {fleetTotals.criticalTires} เส้น (ห้ามวิ่ง)
          </div>
        </div>

        {/* Warning Vehicles Card */}
        <div 
          onClick={() => setStatusFilter("warning")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
            statusFilter === "warning" ? "border-amber-500 ring-2 ring-amber-300 bg-amber-50/30" : "border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>🟡 เกณฑ์เฝ้าระวัง (2.0-3.5 mm)</span>
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">
            {fleetTotals.warningVehicles} <span className="text-xs font-normal text-amber-800">คัน</span>
          </div>
          <div className="text-[11px] text-amber-800/80 mt-0.5">
            พบยางเฝ้าระวังรวม {fleetTotals.warningTires} เส้น
          </div>
        </div>

        {/* Safe Vehicles Card */}
        <div 
          onClick={() => setStatusFilter("safe")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
            statusFilter === "safe" ? "border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>🟢 เกณฑ์ปกติทุกล้อ (&gt; 3.5 mm)</span>
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {fleetTotals.safeVehicles} <span className="text-xs font-normal text-emerald-800">คัน</span>
          </div>
          <div className="text-[11px] text-emerald-800/80 mt-0.5">
            ยางสมบูรณ์รวม {fleetTotals.safeTires} เส้น
          </div>
        </div>
      </div>

      {/* 2. VEHICLE CHASSIS LAYOUT VIEWER (DIRECT VIEW OF SELECTED VEHICLE) */}
      {currentVehicleStat && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    ผังโครงสร้างรถ (VEHICLE CHASSIS LAYOUT)
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    currentVehicleStat.overallGrade === "critical"
                      ? "bg-rose-100 text-rose-700 border-rose-300"
                      : currentVehicleStat.overallGrade === "warning"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}>
                    {currentVehicleStat.overallGrade === "critical" 
                      ? "🔴 ระดับเกณฑ์วิกฤต (มีล้อต่ำกว่า 2.0 mm)" 
                      : currentVehicleStat.overallGrade === "warning" 
                      ? "🟡 ระดับเกณฑ์เฝ้าระวัง (2.0-3.5 mm)" 
                      : "🟢 ระดับเกณฑ์ปกติทุกล้อ"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-extrabold text-slate-900 font-mono">
                    {currentVehicleStat.vehicle.licensePlate}
                  </h3>
                  <span className="text-xs text-slate-600 font-medium">
                    {currentVehicleStat.vehicle.brand} {currentVehicleStat.vehicle.model} ({VEHICLE_TYPE_LABELS[currentVehicleStat.vehicle.vehicleType] || currentVehicleStat.vehicle.vehicleType})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Vehicle Switcher Dropdown & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">เปลี่ยนคัน:</span>
                <select
                  value={currentVehicleStat.vehicle.id}
                  onChange={(e) => onSelectVehicleId(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-bold font-mono rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {vehicles.map((v) => {
                    const stat = vehicleStatsList.find((s) => s.vehicle.id === v.id);
                    const mark = stat?.overallGrade === "critical" ? "🔴 " : stat?.overallGrade === "warning" ? "🟡 " : "🟢 ";
                    return (
                      <option key={v.id} value={v.id}>
                        {mark} {v.licensePlate} ({v.brand})
                      </option>
                    );
                  })}
                </select>
              </div>

              {onRequestRepairForVehicle && currentVehicleStat.overallGrade === "critical" && (
                <button
                  type="button"
                  onClick={() => onRequestRepairForVehicle(currentVehicleStat.vehicle.licensePlate)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>เปิดใบแจ้งซ่อมทันที</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowOnlyLayout(!showOnlyLayout)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {showOnlyLayout ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                <span>{showOnlyLayout ? "แสดงตารางสรุปด้านล่าง" : "ย่อ/ซ่อนผังตัวรถ"}</span>
              </button>
            </div>
          </div>

          {/* Render Vehicle Chassis Tire Layout Component */}
          {!showOnlyLayout && (
            <div className="pt-2">
              <VehicleChassisTireLayout
                vehicle={currentVehicleStat.vehicle}
                measurements={currentVehicleStat.measurements}
                replacements={replacements}
                batteryRecord={currentVehicleBattery}
                criticalThresholdMm={criticalThresholdMm}
                warningThresholdMm={warningThresholdMm}
                onQuickMeasurement={onQuickMeasurement}
                onReplaceTire={onReplaceTire}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. FLEET SUMMARY TABLE: ALL VEHICLES TREAD DEPTH MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>ตารางสรุปความลึกดอกยางทุกคันในกองยาน (Fleet Tread Depth Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่แถวรถเพื่อแสดงผัง Layout ตัวรถ (Chassis Layout) แจกแจงความลึกและระดับเกณฑ์ของแต่ละตำแหน่งล้อ
            </p>
          </div>

          {/* Actions & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSummaryCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาทะเบียน, รุ่น, แผนก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px] font-medium mr-1">เกณฑ์:</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === "all" ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด ({vehicles.length})
              </button>
              <button
                onClick={() => setStatusFilter("critical")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  statusFilter === "critical" ? "bg-rose-600 text-white font-bold" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                🔴 วิกฤต ({fleetTotals.criticalVehicles})
              </button>
              <button
                onClick={() => setStatusFilter("warning")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  statusFilter === "warning" ? "bg-amber-600 text-white font-bold" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                🟡 เฝ้าระวัง ({fleetTotals.warningVehicles})
              </button>
              <button
                onClick={() => setStatusFilter("safe")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  statusFilter === "safe" ? "bg-emerald-600 text-white font-bold" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                🟢 ปกติ ({fleetTotals.safeVehicles})
              </button>
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option value="min_depth_asc">ดอกยางต่ำสุด (วิกฤตสุดก่อน)</option>
              <option value="min_depth_desc">ดอกยางต่ำสุด (มากไปน้อย)</option>
              <option value="plate">เลขทะเบียนรถ</option>
              <option value="mileage">เลขไมล์สะสม</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center border-r border-slate-200">#</th>
                <th className="py-3 px-3 border-r border-slate-200">ทะเบียนรถ</th>
                <th className="py-3 px-3 border-r border-slate-200">ยี่ห้อ & รุ่น</th>
                <th className="py-3 px-3 border-r border-slate-200">ประเภทรถ</th>
                <th className="py-3 px-3 text-right border-r border-slate-200">เลขไมล์</th>
                <th className="py-3 px-3 text-right border-r border-slate-200 font-mono">ดอกยางต่ำสุด</th>
                <th className="py-3 px-3 text-right border-r border-slate-200 font-mono">ดอกยางเฉลี่ย</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">แจกแจงเกณฑ์ล้อ (วิกฤต / เฝ้าระวัง / ปกติ)</th>
                <th className="py-3 px-3 text-center border-r border-slate-200">ระดับเกณฑ์รวม</th>
                <th className="py-3 px-3 text-center">ดูผังรถ (Layout)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลรถตามตัวกรองที่เลือก
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((item, idx) => {
                  const v = item.vehicle;
                  const isSelected = v.id === selectedVehicleId;
                  const isCritical = item.overallGrade === "critical";
                  const isWarning = item.overallGrade === "warning";

                  return (
                    <tr
                      key={v.id}
                      onClick={() => onSelectVehicleId(v.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-blue-50/80 font-medium ring-1 ring-blue-300/50" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-400 border-r border-slate-100">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900 border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-sm">{v.licensePlate}</span>
                        </div>
                        {v.oldLicensePlate && (
                          <div className="text-[10px] text-slate-400 font-normal">เดิม: {v.oldLicensePlate}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 border-r border-slate-100">
                        <div className="font-semibold text-slate-900">{v.brand} {v.model}</div>
                        <div className="text-[11px] text-slate-500">{v.department}</div>
                      </td>

                      <td className="py-3 px-3 border-r border-slate-100">
                        <span className="text-xs text-slate-700">
                          {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}
                        </span>
                        <div className="text-[10px] text-slate-400">{item.totalTires} ตำแหน่งล้อ</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                        {v.currentMileage.toLocaleString()} กม.
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold border-r border-slate-100">
                        <span
                          className={`text-sm ${
                            item.minDepth < CRITICAL_TREAD_DEPTH_MM 
                              ? "text-rose-600 font-black" 
                              : item.minDepth <= WARNING_TREAD_DEPTH_MM 
                              ? "text-amber-600 font-bold" 
                              : "text-emerald-600 font-bold"
                          }`}
                        >
                          {item.minDepth} mm
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 border-r border-slate-100">
                        {item.avgDepth} mm
                      </td>

                      <td className="py-3 px-3 border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold">
                          {item.criticalCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 font-extrabold" title="ล้อวิกฤต">
                              🔴 {item.criticalCount}
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                          <span className="text-slate-300">/</span>
                          {item.warningCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300" title="ล้อเฝ้าระวัง">
                              🟡 {item.warningCount}
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                          <span className="text-slate-300">/</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300" title="ล้อปกติ">
                            🟢 {item.safeCount}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isCritical
                              ? "bg-rose-100 text-rose-700 border-rose-300"
                              : isWarning
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          {isCritical ? "🔴 วิกฤต" : isWarning ? "🟡 เฝ้าระวัง" : "🟢 ปกติ"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVehicleId(v.id);
                            setShowOnlyLayout(false);
                            // Smooth scroll to layout section
                            window.scrollTo({ top: 380, behavior: "smooth" });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูผังรถ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
