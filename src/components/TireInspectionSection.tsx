import React from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert,
  Sliders
} from "lucide-react";
import { 
  TirePositionMeasurement, 
  VehicleType, 
  TireInspectionReport 
} from "../types";
import { 
  CRITICAL_TREAD_DEPTH_MM, 
  WARNING_TREAD_DEPTH_MM, 
  NEW_TIRE_DEPTH_MM,
  evaluateTireCondition,
  generateDefaultTireMeasurements
} from "../data/tireInspectionConfig";

interface TireInspectionSectionProps {
  vehicleType: VehicleType;
  measurements: TirePositionMeasurement[];
  onChange: (measurements: TirePositionMeasurement[], report: TireInspectionReport) => void;
  readOnly?: boolean;
}

export const TireInspectionSection: React.FC<TireInspectionSectionProps> = ({
  vehicleType,
  measurements,
  onChange,
  readOnly = false
}) => {
  const currentReport = evaluateTireCondition(measurements);

  const handleMeasurementChange = (
    index: number,
    field: keyof TirePositionMeasurement,
    value: any
  ) => {
    const updated = measurements.map((m, idx) => {
      if (idx !== index) return m;
      return { ...m, [field]: value };
    });
    const newReport = evaluateTireCondition(updated);
    onChange(updated, newReport);
  };

  const handleApplyPreset = (depth: number, condition: TirePositionMeasurement["wearCondition"] = "normal") => {
    const updated = measurements.map((m) => ({
      ...m,
      treadDepthMm: depth,
      wearCondition: condition,
      notes: ""
    }));
    const newReport = evaluateTireCondition(updated);
    onChange(updated, newReport);
  };

  const handleResetToDefault = () => {
    const fresh = generateDefaultTireMeasurements(vehicleType, 9.0);
    const newReport = evaluateTireCondition(fresh);
    onChange(fresh, newReport);
  };

  return (
    <div className="space-y-4 bg-slate-900/90 border border-slate-700/90 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-inner">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>ระบบตรวจวัดความลึกร่องดอกยาง & แจ้งเตือนความปลอดภัย (Tire Tread Depth & Wear)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ตรวจวัดความลึกดอกยางทุกตำแหน่ง (มม.) เกณฑ์กฎหมาย: ต่ำกว่า 2.0 มม. หรือบวมปูด = วิกฤต ห้ามปล่อยรถวิ่ง
          </p>
        </div>

        {/* Quick Presets */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-slate-400 mr-1 font-medium">คีย์ด่วน:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset(14.0, "normal")}
              className="px-2 py-1 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 rounded text-[10px] font-bold transition-colors"
            >
              ยางใหม่ (14 mm)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(8.0, "normal")}
              className="px-2 py-1 bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-500/30 rounded text-[10px] font-bold transition-colors"
            >
              สภาพดี (8 mm)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(3.0, "uneven_wear")}
              className="px-2 py-1 bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-500/30 rounded text-[10px] font-bold transition-colors"
            >
              เฝ้าระวัง (3 mm)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(1.5, "bulge")}
              className="px-2 py-1 bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/40 rounded text-[10px] font-bold transition-colors"
            >
              วิกฤต (1.5 mm)
            </button>
          </div>
        )}
      </div>

      {/* Alert Status Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
        currentReport.overallTireStatus === "critical"
          ? "bg-rose-950/80 border-rose-500 text-rose-100 shadow-lg shadow-rose-950/50 animate-pulse"
          : currentReport.overallTireStatus === "warning"
          ? "bg-amber-950/70 border-amber-500/80 text-amber-100 shadow-md shadow-amber-950/30"
          : "bg-emerald-950/60 border-emerald-500/50 text-emerald-100"
      }`}>
        <div className="shrink-0 mt-0.5">
          {currentReport.overallTireStatus === "critical" && <ShieldAlert className="w-6 h-6 text-rose-400" />}
          {currentReport.overallTireStatus === "warning" && <AlertTriangle className="w-6 h-6 text-amber-400" />}
          {currentReport.overallTireStatus === "safe" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-sm tracking-wide">
              {currentReport.overallTireStatus === "critical" && "🚨 แจ้งเตือนวิกฤต: สภาพยางไม่ผ่านเกณฑ์ความปลอดภัยขั้นวิกฤต"}
              {currentReport.overallTireStatus === "warning" && "⚠️ สภาพยางอยู่ในระดับเฝ้าระวัง (Warning)"}
              {currentReport.overallTireStatus === "safe" && "✅ สภาพยางและดอกยางทุกล้ออยู่ในเกณฑ์ปลอดภัย (Safe)"}
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span>ดอกยางต่ำสุด: <strong className="text-white font-bold">{currentReport.minTreadDepthMm} mm</strong></span>
              <span>•</span>
              <span>เฉลี่ย: <strong className="text-white font-bold">{currentReport.avgTreadDepthMm} mm</strong></span>
            </div>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            {currentReport.alertMessage}
          </p>
        </div>
      </div>

      {/* Tire Wheel Position Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {measurements.map((item, idx) => {
          const depth = Number(item.treadDepthMm) || 0;
          const isCritical = depth < CRITICAL_TREAD_DEPTH_MM || item.wearCondition === "bulge" || item.wearCondition === "cut";
          const isWarning = !isCritical && (depth <= WARNING_TREAD_DEPTH_MM || item.wearCondition === "uneven_wear" || item.wearCondition === "cracks");
          const isSafe = !isCritical && !isWarning;

          const progressPct = Math.min(100, Math.max(0, Math.round((depth / NEW_TIRE_DEPTH_MM) * 100)));

          return (
            <div
              key={item.positionKey || idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isCritical
                  ? "bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/50"
                  : isWarning
                  ? "bg-amber-950/30 border-amber-500/60"
                  : "bg-slate-800/80 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-white">
                    {item.positionNameTh}
                  </span>
                </div>

                {/* Status Indicator */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isCritical
                    ? "bg-rose-900/80 text-rose-300 border-rose-500"
                    : isWarning
                    ? "bg-amber-900/80 text-amber-300 border-amber-500"
                    : "bg-emerald-900/80 text-emerald-300 border-emerald-500"
                }`}>
                  {isCritical ? "🚨 วิกฤต (< 2.0 mm)" : isWarning ? "⚠️ เฝ้าระวัง (2.0-3.5 mm)" : "🟢 ปลอดภัย (> 3.5 mm)"}
                </span>
              </div>

              {/* Controls: Depth Input & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Tread Depth Input */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                    ความลึกดอกยาง (มม.):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      disabled={readOnly}
                      value={item.treadDepthMm}
                      onChange={(e) => handleMeasurementChange(idx, "treadDepthMm", parseFloat(e.target.value) || 0)}
                      className={`w-full font-mono font-bold px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        isCritical
                          ? "bg-rose-950 text-rose-100 border-rose-500 focus:ring-rose-500"
                          : isWarning
                          ? "bg-amber-950 text-amber-100 border-amber-500 focus:ring-amber-500"
                          : "bg-slate-900 text-white border-slate-600 focus:ring-blue-500"
                      }`}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      mm
                    </span>
                  </div>

                  {/* Visual Depth Bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Wear Condition Selector */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                    สภาพหน้ายาง / อาการสึก:
                  </label>
                  <select
                    disabled={readOnly}
                    value={item.wearCondition}
                    onChange={(e) => handleMeasurementChange(idx, "wearCondition", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="normal">✅ ดอกยางสึกเรียบปกติ</option>
                    <option value="uneven_wear">🟡 ยางกินข้าง / สึกบั้ง (Uneven)</option>
                    <option value="bulge">🚨 ยางบวมปูด (Bulge - อันตราย)</option>
                    <option value="cracks">⚠️ แตกลายงา (Cracking)</option>
                    <option value="cut">🚨 บาดแผลฉีกขาด (Cut)</option>
                    <option value="nail_puncture">🚨 ตะปูตำ / รั่วซึม (Puncture)</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
