import React, { useState, useMemo } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Sliders, 
  Send, 
  Wrench, 
  Plus, 
  Truck, 
  Eye, 
  FileSpreadsheet, 
  ArrowUpDown, 
  DollarSign, 
  Layers, 
  Gauge, 
  Flame, 
  Calendar,
  User,
  ShieldCheck,
  Edit3
} from "lucide-react";
import { 
  TireMaintenanceAlert, 
  TireAlertSetting, 
  VehicleRecord, 
  TirePositionMeasurement 
} from "../types";
import { VEHICLE_TYPE_LABELS } from "../data/categories";
import { TireWeeklyReplacementPlanView } from "./TireWeeklyReplacementPlanView";

interface TireMaintenanceAlertHubTabProps {
  alerts: TireMaintenanceAlert[];
  settings: TireAlertSetting;
  vehicles: VehicleRecord[];
  initialHubView?: "weekly_plan" | "individual_alerts";
  onOpenSettings: () => void;
  onOpenDispatch: () => void;
  onSelectVehicleForDiagram: (vehicleId: string) => void;
  onQuickMeasurement?: (measurement: TirePositionMeasurement) => void;
  onReplaceTire?: (positionKey: string, vehicleId?: string) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
}

export const TireMaintenanceAlertHubTab: React.FC<TireMaintenanceAlertHubTabProps> = ({
  alerts,
  settings,
  vehicles,
  initialHubView = "weekly_plan",
  onOpenSettings,
  onOpenDispatch,
  onSelectVehicleForDiagram,
  onQuickMeasurement,
  onReplaceTire,
  onRequestRepairForVehicle
}) => {
  const [activeHubView, setActiveHubView] = useState<"weekly_plan" | "individual_alerts">(initialHubView);
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "critical" | "warning">("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const criticalAlerts = alerts.filter((a) => a.alertLevel === "critical");
  const warningAlerts = alerts.filter((a) => a.alertLevel === "warning");

  // Distinct vehicles with alerts
  const affectedVehiclesCount = useMemo(() => {
    return new Set(alerts.map((a) => a.vehicleId)).size;
  }, [alerts]);

  // Estimated replacement cost (assuming 12,500 THB for heavy truck tire, 3,800 for pickup)
  const estimatedTotalCost = useMemo(() => {
    return alerts.reduce((acc, a) => {
      const isHeavy = a.vehicleType === "tractor_6w" || a.vehicleType === "trailer_2axle" || a.vehicleType === "trailer_3axle" || a.vehicleType === "box_truck_6w";
      const tireCost = isHeavy ? 12500 : 3800;
      return acc + tireCost;
    }, 0);
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (urgencyFilter !== "all" && alert.alertLevel !== urgencyFilter) {
        return false;
      }
      if (vehicleTypeFilter !== "all" && alert.vehicleType !== vehicleTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPlate = (alert.licensePlate || "").toLowerCase().includes(q);
        const matchPos = (alert.positionNameTh || "").toLowerCase().includes(q) || (alert.positionKey || "").toLowerCase().includes(q);
        const matchDept = (alert.department || "").toLowerCase().includes(q);
        const matchDriver = (alert.driverName || "").toLowerCase().includes(q);
        const matchBrand = (alert.tireBrand || "").toLowerCase().includes(q);
        if (!matchPlate && !matchPos && !matchDept && !matchDriver && !matchBrand) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, urgencyFilter, vehicleTypeFilter, searchQuery]);

  // Export alerts to CSV
  const handleExportAlertsCSV = () => {
    const headers = [
      "ลำดับ",
      "ระดับความเร่งด่วน",
      "ทะเบียนรถ",
      "ประเภทรถ",
      "แผนก",
      "พนักงานขับรถ",
      "เลขไมล์ปัจจุบัน",
      "ตำแหน่งล้อ",
      "ความลึกดอกยาง (มม.)",
      "เกณฑ์มาตรฐาน (มม.)",
      "ส่วนต่างต่ำกว่าเกณฑ์ (มม.)",
      "สภาพการสึกหรอ",
      "ความเสี่ยง",
      "การดำเนินการที่แนะนำ"
    ];

    const rows = filteredAlerts.map((a, idx) => [
      idx + 1,
      a.alertLevel === "critical" ? "วิกฤต (ห้ามวิ่ง)" : "เฝ้าระวัง",
      `"${a.licensePlate}"`,
      `"${VEHICLE_TYPE_LABELS[a.vehicleType] || a.vehicleType}"`,
      `"${a.department}"`,
      `"${a.driverName || "-"}"`,
      a.currentMileage,
      `"${a.positionNameTh} (${a.positionKey})"`,
      a.treadDepthMm,
      a.thresholdMm,
      Math.abs(a.differenceMm),
      `"${a.wearCondition}"`,
      `"${a.riskDescription.replace(/"/g, '""')}"`,
      `"${a.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TNB_Fleet_Tire_Alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 0. Hub Sub-view Switcher: Weekly Replacement Plan vs Individual Tire Alerts */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveHubView("weekly_plan")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeHubView === "weekly_plan"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>📅 แผนการเปลี่ยนยางรายสัปดาห์ (Weekly Plan)</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                activeHubView === "weekly_plan"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {affectedVehiclesCount} คัน
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHubView("individual_alerts")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeHubView === "individual_alerts"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/40"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🚨 รายการแจ้งเตือนรายเส้น (Individual Alerts)</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                activeHubView === "individual_alerts"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {alerts.length} ตำแหน่งล้อ
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>จัดลำดับความเร่งด่วนตามเกณฑ์ความปลอดภัยมาตรฐาน ISO 39001</span>
        </div>
      </div>

      {activeHubView === "weekly_plan" ? (
        <TireWeeklyReplacementPlanView
          alerts={alerts}
          settings={settings}
          vehicles={vehicles}
          onSelectVehicleForDiagram={onSelectVehicleForDiagram}
          onReplaceTire={onReplaceTire}
          onRequestRepairForVehicle={onRequestRepairForVehicle}
        />
      ) : (
        <>
          {/* 1. Header Overview & Alert Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Tires */}
        <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-800/50 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 ระดับวิกฤต ห้ามวิ่ง (&lt; {settings.criticalThresholdMm} mm)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-1">
              {criticalAlerts.length} <span className="text-xs font-normal text-rose-300">เส้น</span>
            </div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">ต้องเปลี่ยนทันทีก่อนเกิดเหตุ</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Warning Tires */}
        <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-800/50 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>🟡 ระดับเฝ้าระวัง (&lt; {settings.warningThresholdMm} mm)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              {warningAlerts.length} <span className="text-xs font-normal text-amber-300">เส้น</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">เตรียมสลับหรือจัดซื้อล่วงหน้า</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Affected Vehicles */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between text-white">
          <div>
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>รถที่ตรวจพบปัญหา</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {affectedVehiclesCount} <span className="text-xs font-normal text-slate-400">คัน</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">จากกองยานทั้งหมด {vehicles.length} คัน</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Estimated Budget */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between text-white">
          <div>
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>ประมาณการงบเปลี่ยนยาง</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
              ฿{estimatedTotalCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">เพื่อเปลี่ยนยางทั้ง {alerts.length} เส้น</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Search, Filters & Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาทะเบียน, ตำแหน่งล้อ, แผนก, คนขับ หรือยี่ห้อยาง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenDispatch}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
              title="ส่งข้อความแจ้งเตือนอัตโนมัติหาฝ่ายช่าง / LINE Notify"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งแจ้งเตือนช่าง (LINE Dispatch)</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title="ตั้งค่าเกณฑ์มาตรฐานความลึกดอกยาง (มม.)"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>ตั้งค่าเกณฑ์มาตรฐาน</span>
            </button>

            <button
              type="button"
              onClick={handleExportAlertsCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title="ส่งออกรายการแจ้งเตือนเป็น Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHubView("weekly_plan")}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="สลับไปดูแผนการเปลี่ยนยางรายสัปดาห์ (คันไหน ของสัปดาห์ไหน)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ดูแผนรายสัปดาห์</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
                title="มุมมองการ์ดรายละเอียด"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
                title="มุมมองตารางข้อมูล"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">ระดับความเร่งด่วน:</span>
            <button
              type="button"
              onClick={() => setUrgencyFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                urgencyFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ทั้งหมด ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setUrgencyFilter("critical")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                urgencyFilter === "critical"
                  ? "bg-rose-600 text-white font-bold"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>🔴 วิกฤตห้ามวิ่ง ({criticalAlerts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setUrgencyFilter("warning")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                urgencyFilter === "warning"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>🟡 เฝ้าระวัง ({warningAlerts.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            แสดง {filteredAlerts.length} จากทั้งหมด {alerts.length} รายการ
          </div>
        </div>
      </div>

      {/* 3. Empty State or Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {alerts.length === 0
              ? "ยอดเยี่ยม! ไม่พบยางที่ต่ำกว่าเกณฑ์ความปลอดภัย"
              : "ไม่พบรายการแจ้งเตือนตามเงื่อนไขตัวกรอง"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {alerts.length === 0
              ? `ยางทุกล้อในกองยานมีความลึกดอกยางอยู่ในเกณฑ์มาตรฐานปลอดภัย (> ${settings.warningThresholdMm} มม.) ตามระเบียบ ISO 39001`
              : "ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองความเร่งด่วนเพื่อดูรายการทั้งหมด"}
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.alertLevel === "critical";

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between ${
                  isCritical
                    ? "bg-rose-950/20 border-rose-300/80 hover:border-rose-500 shadow-rose-950/5"
                    : "bg-amber-950/15 border-amber-300/80 hover:border-amber-500 shadow-amber-950/5"
                }`}
              >
                {/* Card Top */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                          isCritical ? "bg-rose-600" : "bg-amber-500"
                        }`}
                      >
                        {isCritical ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-mono tracking-wide">
                            {alert.licensePlate}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isCritical
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {isCritical ? "🔴 วิกฤต ห้ามปล่อยวิ่ง" : "🟡 เฝ้าระวัง เตรียมเปลี่ยน"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {VEHICLE_TYPE_LABELS[alert.vehicleType] || alert.vehicleType} • แผนก: {alert.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xl sm:text-2xl font-black font-mono ${
                          isCritical ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {alert.treadDepthMm}{" "}
                        <span className="text-xs font-normal text-slate-500">มม.</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        เกณฑ์: {alert.thresholdMm} มม. (
                        <strong className={isCritical ? "text-rose-600" : "text-amber-600"}>
                          {alert.differenceMm} มม.
                        </strong>
                        )
                      </div>
                    </div>
                  </div>

                  {/* Position & Tire Details */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">ตำแหน่งล้อ:</div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-blue-600" />
                        <span>{alert.positionNameTh}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">สภาพดอกยาง / ลมยาง:</div>
                      <div className="font-semibold text-slate-700">
                        {alert.wearCondition !== "normal" ? (
                          <span className="text-rose-600 font-bold">{alert.wearCondition}</span>
                        ) : (
                          "สึกหรอตามอายุ"
                        )}{" "}
                        {alert.pressurePsi ? `(${alert.pressurePsi} PSI)` : ""}
                      </div>
                    </div>
                    {alert.tireBrand && (
                      <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">ยี่ห้อยางเดิม:</span>
                        <span className="font-mono text-slate-700">
                          {alert.tireBrand} {alert.tireSerial ? `(SN: ${alert.tireSerial})` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Risk Warning Box */}
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                      isCritical
                        ? "bg-rose-100/70 border-rose-300 text-rose-900"
                        : "bg-amber-100/70 border-amber-300 text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      <span>ความเสี่ยงต่อการเกิดอุบัติเหตุ:</span>
                    </div>
                    <p className="text-[11px] text-slate-700">{alert.riskDescription}</p>
                  </div>

                  {/* Action Recommendation */}
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold">การดำเนินการที่แนะนำ: </span>
                    <span className="text-slate-700">{alert.recommendedAction}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-white/80 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectVehicleForDiagram(alert.vehicleId)}
                    className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดูผังล้อรอบคัน</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onQuickMeasurement && (
                      <button
                        type="button"
                        onClick={() =>
                          onQuickMeasurement({
                            positionKey: alert.positionKey,
                            positionNameTh: alert.positionNameTh,
                            treadDepthMm: alert.treadDepthMm,
                            pressurePsi: alert.pressurePsi || 115,
                            wearCondition: alert.wearCondition,
                            isAlert: true,
                            alertLevel: alert.alertLevel
                          })
                        }
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="วัดความลึกซ้ำ"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">วัดซ้ำ</span>
                      </button>
                    )}

                    {onReplaceTire && (
                      <button
                        type="button"
                        onClick={() => onReplaceTire(alert.positionKey, alert.vehicleId)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        title="บันทึกเปลี่ยนยางใหม่ตำแหน่งนี้"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เปลี่ยนยาง</span>
                      </button>
                    )}

                    {onRequestRepairForVehicle && (
                      <button
                        type="button"
                        onClick={() => onRequestRepairForVehicle(alert.licensePlate)}
                        className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                          isCritical ? "bg-rose-600 hover:bg-rose-500" : "bg-amber-600 hover:bg-amber-500"
                        }`}
                        title="เปิดใบแจ้งซ่อมไปยังฝ่ายซ่อมบำรุง"
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
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ระดับ</th>
                  <th className="py-3 px-4">ทะเบียนรถ</th>
                  <th className="py-3 px-4">ตำแหน่งล้อ</th>
                  <th className="py-3 px-4 text-center">ความลึก (มม.)</th>
                  <th className="py-3 px-4 text-center">เกณฑ์มาตรฐาน</th>
                  <th className="py-3 px-4">สภาพการสึกหรอ</th>
                  <th className="py-3 px-4">ความเสี่ยง / ข้อแนะนำ</th>
                  <th className="py-3 px-4 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAlerts.map((alert) => {
                  const isCritical = alert.alertLevel === "critical";

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical ? "bg-rose-50/30" : "bg-amber-50/20"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCritical ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isCritical ? "🔴 วิกฤต" : "🟡 เฝ้าระวัง"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {alert.licensePlate}
                        <div className="text-[10px] font-sans text-slate-400 font-normal">
                          {alert.department}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{alert.positionNameTh}</div>
                        <div className="text-[10px] font-mono text-slate-400">{alert.positionKey}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                        <span className={isCritical ? "text-rose-600" : "text-amber-600"}>
                          {alert.treadDepthMm}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {alert.thresholdMm} มม.
                        <div
                          className={`text-[10px] font-bold ${
                            isCritical ? "text-rose-600" : "text-amber-600"
                          }`}
                        >
                          ({alert.differenceMm} มม.)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={alert.wearCondition !== "normal" ? "text-rose-600 font-bold" : ""}>
                          {alert.wearCondition}
                        </span>
                        {alert.pressurePsi && (
                          <span className="text-slate-400 text-[10px] block">
                            {alert.pressurePsi} PSI
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[11px] text-slate-800 line-clamp-1 font-semibold">
                          {alert.riskDescription}
                        </div>
                        <div className="text-[10px] text-blue-700 line-clamp-1">
                          {alert.recommendedAction}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectVehicleForDiagram(alert.vehicleId)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ดูผังล้อรถ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onReplaceTire && (
                            <button
                              type="button"
                              onClick={() => onReplaceTire(alert.positionKey, alert.vehicleId)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold transition-colors"
                            >
                              เปลี่ยนยาง
                            </button>
                          )}

                          {onRequestRepairForVehicle && (
                            <button
                              type="button"
                              onClick={() => onRequestRepairForVehicle(alert.licensePlate)}
                              className={`px-2 py-1 text-white rounded text-[11px] font-bold transition-colors ${
                                isCritical ? "bg-rose-600 hover:bg-rose-500" : "bg-amber-600 hover:bg-amber-500"
                              }`}
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
      )}
        </>
      )}
    </div>
  );
};
