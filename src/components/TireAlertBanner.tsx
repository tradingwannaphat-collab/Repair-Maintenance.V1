import React, { useState } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Send, 
  Truck, 
  Wrench, 
  ExternalLink,
  BellRing,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { TireMaintenanceAlert, TireAlertSetting, VehicleRecord } from "../types";

interface TireAlertBannerProps {
  alerts: TireMaintenanceAlert[];
  settings: TireAlertSetting;
  onOpenSettings: () => void;
  onOpenDispatch: () => void;
  onOpenAlertHub: () => void;
  onOpenWeeklyPlan?: () => void;
  onSelectVehicleId: (vehicleId: string) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
  selectedVehicleId?: string;
}

export const TireAlertBanner: React.FC<TireAlertBannerProps> = ({
  alerts,
  settings,
  onOpenSettings,
  onOpenDispatch,
  onOpenAlertHub,
  onOpenWeeklyPlan,
  onSelectVehicleId,
  onRequestRepairForVehicle,
  selectedVehicleId
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!settings.enableAutoAlert || alerts.length === 0) {
    return null;
  }

  const criticalAlerts = alerts.filter((a) => a.alertLevel === "critical");
  const warningAlerts = alerts.filter((a) => a.alertLevel === "warning");
  const hasCritical = criticalAlerts.length > 0;

  // Unique affected vehicles
  const affectedVehicles: Array<{ vehicleId: string; licensePlate: string; hasCritical: boolean }> = Array.from(
    new Map<string, { vehicleId: string; licensePlate: string; hasCritical: boolean }>(
      alerts.map((a) => [a.vehicleId, { vehicleId: a.vehicleId, licensePlate: a.licensePlate, hasCritical: a.alertLevel === "critical" }])
    ).values()
  );

  return (
    <div
      id="tire-automated-alert-banner"
      className={`rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
        hasCritical
          ? "bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950/90 border-rose-600/70 shadow-rose-950/50"
          : "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/90 border-amber-600/60 shadow-amber-950/40"
      }`}
    >
      {/* Top Bar / Header */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Pulsing Alert Icon */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              hasCritical
                ? "bg-rose-600 text-white ring-4 ring-rose-500/30 animate-pulse"
                : "bg-amber-600 text-white ring-4 ring-amber-500/30"
            }`}
          >
            {hasCritical ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border ${
                  hasCritical
                    ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                }`}
              >
                🚨 ระบบแจ้งเตือนอัตโนมัติสำหรับฝ่ายซ่อมบำรุง
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                (เกณฑ์มาตรฐาน: วิกฤต &lt; {settings.criticalThresholdMm} มม. | เฝ้าระวัง &lt; {settings.warningThresholdMm} มม.)
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1 flex flex-wrap items-center gap-2">
              <span>
                ตรวจพบดอกยางต่ำกว่าเกณฑ์มาตรฐาน{" "}
                <strong className={hasCritical ? "text-rose-400 font-mono" : "text-amber-400 font-mono"}>
                  {alerts.length} ตำแหน่งล้อ
                </strong>{" "}
                จากรถ {affectedVehicles.length} คัน
              </span>
            </h2>

            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
              {hasCritical && (
                <span className="text-rose-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  🔴 วิกฤตห้ามวิ่ง: {criticalAlerts.length} เส้น (ต้องเปลี่ยนทันที)
                </span>
              )}
              {warningAlerts.length > 0 && (
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  🟡 เฝ้าระวัง: {warningAlerts.length} เส้น (เตรียมสลับ/จัดซื้อ)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenWeeklyPlan || onOpenAlertHub}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40"
            title="เปิดดูแผนการเปลี่ยนยางรายสัปดาห์ (คันไหน ของสัปดาห์ไหน)"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>📅 แผนเปลี่ยนยางรายสัปดาห์</span>
          </button>

          <button
            type="button"
            onClick={onOpenAlertHub}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              hasCritical
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 ring-2 ring-amber-400/40"
            }`}
          >
            <span>รายการแจ้งเตือน ({alerts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenDispatch}
            className="px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-600/50 transition-colors shadow-sm"
            title="ส่งข้อความแจ้งเตือนหาช่างผ่านไลน์ / กลุ่มงาน"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งแจ้งเตือนช่าง</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="ปรับตั้งค่าเกณฑ์มาตรฐานความลึกร่องยาง (mm)"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">เกณฑ์ ({settings.criticalThresholdMm}/{settings.warningThresholdMm})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            title={isCollapsed ? "ขยายรายละเอียด" : "ย่อแถบแจ้งเตือน"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Vehicle Pills & Preventive Warning Note */}
      {!isCollapsed && (
        <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
          {/* Quick Affected Vehicle Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">คลิกเพื่อดูผังรถคันที่มีปัญหา:</span>
            {affectedVehicles.map((v) => {
              const isSelected = selectedVehicleId === v.vehicleId;
              const vehAlerts = alerts.filter((a) => a.vehicleId === v.vehicleId);
              const hasVehCritical = vehAlerts.some((a) => a.alertLevel === "critical");

              return (
                <button
                  key={v.vehicleId}
                  type="button"
                  onClick={() => onSelectVehicleId(v.vehicleId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-white text-slate-950 border-white shadow-lg ring-2 ring-blue-500"
                      : hasVehCritical
                      ? "bg-rose-950/80 text-rose-200 border-rose-700/80 hover:bg-rose-900"
                      : "bg-amber-950/80 text-amber-200 border-amber-700/80 hover:bg-amber-900"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span className="font-mono">{v.licensePlate}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      hasVehCritical ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                    }`}
                  >
                    {vehAlerts.length} ล้อ
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direct Preventive Action Callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">ข้อปฏิบัติเชิงรุกสำหรับฝ่ายซ่อมบำรุง: </span>
                <span>
                  กรุณาเปิดใบแจ้งซ่อมเพื่อเปลี่ยนยางใหม่ก่อนส่งมอบรถให้พนักงานขับขี่ เพื่อป้องกันอุบัติเหตุจากยางระเบิดและปฏิบัติตามมาตรฐานความปลอดภัย ISO 39001
                </span>
              </div>
            </div>

            {onRequestRepairForVehicle && (
              <button
                type="button"
                onClick={() => {
                  const targetPlate = affectedVehicles[0]?.licensePlate;
                  if (targetPlate) onRequestRepairForVehicle(targetPlate);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>เปิดใบแจ้งซ่อมทันที</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
