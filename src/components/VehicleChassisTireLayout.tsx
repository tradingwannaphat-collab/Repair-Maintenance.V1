import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Sparkles, 
  Edit3, 
  Plus, 
  BatteryCharging, 
  Info,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Smartphone,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  MoveHorizontal
} from "lucide-react";
import { 
  VehicleRecord, 
  TirePositionMeasurement, 
  TireReplacementRecord, 
  BatteryReplacementRecord 
} from "../types";
import { 
  getWheelPositionsForVehicleType, 
  CRITICAL_TREAD_DEPTH_MM, 
  WARNING_TREAD_DEPTH_MM, 
  NEW_TIRE_DEPTH_MM,
  WheelPositionConfig 
} from "../data/tireInspectionConfig";
import { getTireTypeLabel } from "../data/tireManagementData";

interface VehicleChassisTireLayoutProps {
  vehicle: VehicleRecord;
  measurements: TirePositionMeasurement[];
  replacements?: TireReplacementRecord[];
  batteryRecord?: BatteryReplacementRecord;
  criticalThresholdMm?: number;
  warningThresholdMm?: number;
  onQuickMeasurement?: (measurement: TirePositionMeasurement) => void;
  onReplaceTire?: (positionKey: string) => void;
  selectedPositionKey?: string;
  onSelectPositionKey?: (positionKey: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const VehicleChassisTireLayout: React.FC<VehicleChassisTireLayoutProps> = ({
  vehicle,
  measurements,
  replacements = [],
  batteryRecord,
  criticalThresholdMm = CRITICAL_TREAD_DEPTH_MM,
  warningThresholdMm = WARNING_TREAD_DEPTH_MM,
  onQuickMeasurement,
  onReplaceTire,
  selectedPositionKey,
  onSelectPositionKey,
  readOnly = false,
  compact = false
}) => {
  const positionsConfig = getWheelPositionsForVehicleType(vehicle.vehicleType);

  // Mobile View Mode:
  // 'all_scroll': Full chassis layout with smooth horizontal touch-swipe and jump pills
  // 'fit_screen': Scaled down so the entire truck fits 100% on the mobile screen without scrolling
  // 'left_side': Shows only left wheels in full-width mobile card layout
  // 'right_side': Shows only right wheels in full-width mobile card layout
  const [mobileViewMode, setMobileViewMode] = useState<"all_scroll" | "fit_screen" | "left_side" | "right_side">("all_scroll");

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(850);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      ro.disconnect();
    };
  }, []);

  // Update content height when dependencies change
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [vehicle, measurements, replacements]);

  // Calculate scaling factor for 'fit_screen' mode
  const BASE_CHASSIS_WIDTH = 740;
  const fitScale = useMemo(() => {
    if (containerWidth <= 0) return 1;
    // Account for padding (24px)
    const availableWidth = containerWidth - 24;
    if (availableWidth >= BASE_CHASSIS_WIDTH) return 1;
    return Math.min(1, Math.max(0.38, availableWidth / BASE_CHASSIS_WIDTH));
  }, [containerWidth]);

  // Helper to scroll left/center/right in scroll mode
  const scrollToSide = (side: "left" | "center" | "right") => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (side === "left") {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (side === "right") {
      el.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      el.scrollTo({ left: maxScroll / 2, behavior: "smooth" });
    }
  };

  // Group wheels by axle
  // Axles: 1 = Front, 2 = Drive/Middle, 3 = Rear/Trailer, 0 = Spare
  const axleGroups = useMemo(() => {
    const map = new Map<number, WheelPositionConfig[]>();
    positionsConfig.forEach((cfg) => {
      const axleNo = cfg.axle;
      if (!map.has(axleNo)) {
        map.set(axleNo, []);
      }
      map.get(axleNo)!.push(cfg);
    });
    return map;
  }, [positionsConfig]);

  const sortedAxles: number[] = Array.from(axleGroups.keys())
    .filter((a): a is number => typeof a === "number" && a > 0)
    .sort((a, b) => a - b);

  const spareConfigs = axleGroups.get(0) || [];

  // Plate matching helper
  const isPlateMatch = (rPlate: string) => {
    const clean = (s: string) => s.replace(/[\s\-\_]/g, "").toLowerCase();
    return clean(rPlate) === clean(vehicle.licensePlate) || 
      (vehicle.oldLicensePlate && clean(rPlate) === clean(vehicle.oldLicensePlate));
  };

  // Helper to get measurement for a key
  const getMeasurement = (posKey: string) => {
    return measurements.find((m) => m.positionKey === posKey);
  };

  // Helper to get latest replacement for a position
  const getLatestReplacement = (posKey: string, posNumber?: number) => {
    return replacements
      .filter((r) => {
        const matchPlate = r.vehicleId === vehicle.id || isPlateMatch(r.licensePlate);
        if (!matchPlate) return false;
        if (r.positionKey && r.positionKey === posKey) return true;
        if (r.positionNumber && posNumber && String(r.positionNumber) === String(posNumber)) return true;
        return false;
      })
      .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];
  };

  // Stats calculation
  const totalTires = measurements.length;
  const criticalCount = measurements.filter((m) => m.alertLevel === "critical" || m.treadDepthMm < criticalThresholdMm).length;
  const warningCount = measurements.filter((m) => !(m.alertLevel === "critical" || m.treadDepthMm < criticalThresholdMm) && (m.alertLevel === "warning" || m.treadDepthMm <= warningThresholdMm)).length;
  const safeCount = totalTires - criticalCount - warningCount;
  const minDepth = measurements.length > 0 ? Math.min(...measurements.map((m) => m.treadDepthMm)) : 0;
  const avgDepth = measurements.length > 0 
    ? Number((measurements.reduce((acc, m) => acc + m.treadDepthMm, 0) / measurements.length).toFixed(1))
    : 0;

  // Single Tire Wheel Card Component inside layout
  const renderWheelBox = (cfg: WheelPositionConfig, isFullWidth: boolean = false) => {
    const m = getMeasurement(cfg.key);
    if (!m) return null;

    const rep = getLatestReplacement(cfg.key, cfg.positionNumber);
    const depth = m.treadDepthMm;
    const isCritical = m.alertLevel === "critical" || depth < criticalThresholdMm;
    const isWarning = !isCritical && (m.alertLevel === "warning" || depth <= warningThresholdMm);
    const isSafe = !isCritical && !isWarning;
    const isSelected = selectedPositionKey === cfg.key;

    const depthPct = Math.min(100, Math.max(0, Math.round((depth / NEW_TIRE_DEPTH_MM) * 100)));

    return (
      <div
        key={cfg.key}
        id={`wheel-${vehicle.id}-${cfg.key}`}
        onClick={() => onSelectPositionKey && onSelectPositionKey(cfg.key)}
        className={`relative rounded-xl transition-all select-none ${
          isFullWidth 
            ? "p-3 sm:p-4 w-full" 
            : compact 
            ? "p-2 w-36 sm:w-44" 
            : "p-2.5 sm:p-3.5 w-40 sm:w-52 md:w-60 shrink-0"
        } ${
          isSelected
            ? "ring-2 ring-blue-400 shadow-xl"
            : ""
        } ${
          isCritical
            ? "bg-rose-950/90 border-2 border-rose-500 text-rose-100 shadow-lg shadow-rose-950/70"
            : isWarning
            ? "bg-amber-950/85 border-2 border-amber-500 text-amber-100 shadow-md shadow-amber-950/50"
            : "bg-slate-900/90 border-2 border-emerald-500/70 text-slate-200 hover:border-emerald-400"
        } cursor-pointer`}
      >
        {/* Top bar: Position Code & Alert Badge */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-white">
              {cfg.key}
            </span>
            {cfg.positionNumber && (
              <span className="text-[10px] font-bold text-slate-300">
                #{cfg.positionNumber}
              </span>
            )}
          </div>

          {/* Alert Grade Badge */}
          <span
            className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 border shrink-0 ${
              isCritical
                ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                : isWarning
                ? "bg-amber-500 text-slate-950 border-amber-300"
                : "bg-emerald-600 text-white border-emerald-400"
            }`}
          >
            {isCritical ? (
              <>
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>วิกฤต</span>
              </>
            ) : isWarning ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                <span>เฝ้าระวัง</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>ปกติ</span>
              </>
            )}
          </span>
        </div>

        {/* Position Thai Name */}
        <div className="text-[10px] sm:text-[11px] font-medium text-slate-300 truncate mb-1.5" title={cfg.nameTh}>
          {cfg.nameTh}
        </div>

        {/* Tread Depth Prominent Display */}
        <div className="flex items-baseline justify-between bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-tight">ความลึกดอกยาง</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-mono font-black text-lg sm:text-xl leading-tight ${
                  isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {depth}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">มม.</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-tight">แรงดันลม</span>
            <span className="font-mono font-bold text-xs text-blue-300">
              {m.pressurePsi || 115} <span className="text-[9px] text-slate-400 font-normal">PSI</span>
            </span>
          </div>
        </div>

        {/* Depth Gauge Progress Bar with Critical Threshold Marker */}
        <div className="mt-1.5 space-y-0.5">
          <div className="relative w-full bg-slate-950 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-800">
            {/* Critical threshold marker line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10" 
              style={{ left: `${(criticalThresholdMm / NEW_TIRE_DEPTH_MM) * 100}%` }}
              title={`เกณฑ์วิกฤต ${criticalThresholdMm} มม.`}
            />
            <div
              className={`h-full rounded-full transition-all ${
                isCritical ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${depthPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0</span>
            <span className="text-rose-400 font-bold">{criticalThresholdMm}mm</span>
            <span>14mm</span>
          </div>
        </div>

        {/* Tire info / Replacement note */}
        {rep ? (
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] space-y-0.5">
            <div className="flex items-center justify-between text-slate-200 font-semibold truncate">
              <span className="truncate">{rep.tireBrand} {rep.tireModel}</span>
              {rep.treadPattern && (
                <span className="text-[9px] text-amber-300 bg-amber-950/60 px-1 rounded border border-amber-700/50 shrink-0 ml-1">
                  {rep.treadPattern}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>{rep.replacedDateTh || rep.replacedDate}</span>
              {rep.tireSerial && <span className="truncate max-w-[70px]">SN:{rep.tireSerial}</span>}
            </div>
          </div>
        ) : (
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
            ยางมาตรฐานประจำรถ
          </div>
        )}

        {/* Action buttons (only in non-compact mode and not readOnly) */}
        {!readOnly && !compact && (
          <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-end gap-1.5">
            {onQuickMeasurement && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickMeasurement(m);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                title="อัปเดตการวัดความลึกดอกยาง"
              >
                <Edit3 className="w-2.5 h-2.5 text-amber-400" />
                <span>วัดดอก</span>
              </button>
            )}
            {onReplaceTire && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplaceTire(cfg.key);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="บันทึกการเปลี่ยนยางตำแหน่งนี้"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>เปลี่ยน</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Side View Layout (for left_side or right_side on mobile)
  const renderSideView = (side: "left" | "right") => {
    const isLeft = side === "left";
    const sideConfigs = positionsConfig.filter((c) => c.side === side);

    return (
      <div className="w-full space-y-4">
        {/* Side Banner Navigation */}
        <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isLeft ? "bg-blue-400 animate-pulse" : "bg-cyan-400 animate-pulse"}`} />
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>{isLeft ? "ล้อฝั่งซ้ายของตัวรถ (LEFT SIDE)" : "ล้อฝั่งขวาของตัวรถ (RIGHT SIDE)"}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                แสดงล้อทุกล้อฝั่ง{isLeft ? "ซ้าย (ด้านคนนั่ง/ติดขอบทาง)" : "ขวา (ด้านคนขับ)"} รวม {sideConfigs.length} ล้อ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileViewMode(isLeft ? "right_side" : "left_side")}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>สลับดูฝั่ง{isLeft ? "ขวา ▶" : "ซ้าย ◀"}</span>
          </button>
        </div>

        {/* Axle by axle listing */}
        {sortedAxles.map((axleNo) => {
          const axleConfigs = sideConfigs.filter((c) => c.axle === axleNo);
          if (axleConfigs.length === 0) return null;

          const axleLabel = axleNo === 1 
            ? `เพลา 1: ล้อหน้าฝั่ง${isLeft ? "ซ้าย" : "ขวา"}` 
            : axleNo === 2 
            ? `เพลา 2: ล้อขับฝั่ง${isLeft ? "ซ้าย (ใน-นอก)" : "ขวา (ใน-นอก)"}` 
            : `เพลา ${axleNo}: ล้อตามฝั่ง${isLeft ? "ซ้าย (ใน-นอก)" : "ขวา (ใน-นอก)"}`;

          return (
            <div key={axleNo} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{axleLabel}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {axleConfigs.length} ล้อ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {axleConfigs.map((cfg) => renderWheelBox(cfg, true))}
              </div>
            </div>
          );
        })}

        {/* Battery section for left side or as info */}
        {batteryRecord && (
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 p-3.5 rounded-xl border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">
                  กล่องแบตเตอรี่ (BATTERY) • {batteryRecord.voltageSpec || "24V"}
                </div>
                <div className="text-[11px] text-slate-300">
                  {batteryRecord.batteryBrand} {batteryRecord.batteryModel} • {batteryRecord.replacedDateTh || batteryRecord.replacedDate}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-emerald-400 font-mono font-bold">SOH: {batteryRecord.healthStatusSoh}%</div>
              <div className="text-[10px] text-slate-400 font-mono">{batteryRecord.voltageVolts}V</div>
            </div>
          </div>
        )}

        {/* Spare tire if available */}
        {spareConfigs.length > 0 && (
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-xs font-bold text-slate-400">
              ยางอะไหล่ใต้ท้องรถ (SPARE TIRE)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spareConfigs.map((cfg) => renderWheelBox(cfg, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Standard Truck Chassis Layout Graphic
  const renderChassisGraphic = () => {
    return (
      <div 
        ref={contentRef}
        className="w-[720px] mx-auto flex flex-col items-center py-2 select-none"
      >
        {/* ======================================================== */}
        {/* 1. FRONT CABIN (หัวรถ / ห้องโดยสาร)                     */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center mb-4">
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800/90 text-blue-300 text-xs font-bold border border-slate-700 tracking-wider shadow-inner mb-3">
            <span>▲ ด้านหน้ารถ (FRONT DIRECTION)</span>
          </div>

          {/* Cabin Graphic Box */}
          <div className="w-64 sm:w-80 h-20 sm:h-24 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl border-2 border-slate-700 flex flex-col items-center justify-center relative shadow-lg">
            {/* Windshield Graphic */}
            <div className="w-48 sm:w-60 h-8 sm:h-10 bg-slate-950/90 rounded-t-xl border border-slate-600/60 flex items-center justify-center">
              <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>{vehicle.licensePlate} • CABIN</span>
              </span>
            </div>

            {/* Grille & Headlights */}
            <div className="w-full flex items-center justify-between px-4 mt-2">
              <div className="w-4 h-3 rounded-full bg-amber-400/80 shadow-md shadow-amber-400/50" title="ไฟหน้าซ้าย" />
              <div className="h-1.5 w-28 bg-slate-950 rounded-full border border-slate-700" />
              <div className="w-4 h-3 rounded-full bg-amber-400/80 shadow-md shadow-amber-400/50" title="ไฟหน้าขวา" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CHASSIS RAILS & AXLES SECTION                        */}
        {/* ======================================================== */}
        <div className="w-full relative flex flex-col items-center space-y-8 py-2">
          {/* Central Vertical Chassis Twin Rails (คานแซสซีส์) */}
          <div className="absolute inset-y-0 w-24 sm:w-28 flex justify-between px-2 pointer-events-none z-0">
            {/* Left Rail */}
            <div className="w-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-sm shadow-md h-full border-x border-slate-600" />
            {/* Right Rail */}
            <div className="w-3 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 rounded-sm shadow-md h-full border-x border-slate-600" />
          </div>

          {/* Render each axle */}
          {sortedAxles.map((axleNo) => {
            const configs = axleGroups.get(axleNo) || [];
            const leftConfigs = configs.filter((c) => c.side === "left");
            const rightConfigs = configs.filter((c) => c.side === "right");

            const isAxle1 = axleNo === 1;
            const axleLabel = isAxle1 
              ? "เพลา 1 (ล้อหน้า)" 
              : axleNo === 2 
              ? "เพลา 2 (เพลาขับ)" 
              : `เพลา ${axleNo} (เพลาตาม/หางพ่วง)`;

            return (
              <div key={axleNo} className="w-full relative z-10 flex flex-col items-center">
                {/* Axle Label & Beam */}
                <div className="w-full flex items-center justify-center relative my-1">
                  {/* Horizontal Steel Axle Rod */}
                  <div className="w-full max-w-2xl h-4 bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700 rounded-md border border-slate-500 shadow-inner flex items-center justify-center">
                    {/* Differential Gearbox Center Pod */}
                    <div className="w-12 h-6 rounded-md bg-slate-900 border border-slate-600 flex items-center justify-center shadow-lg">
                      <span className="text-[9px] font-mono font-bold text-slate-300">
                        A{axleNo}
                      </span>
                    </div>
                  </div>

                  {/* Axle Title Floating Tag */}
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 shadow">
                    {axleLabel}
                  </div>
                </div>

                {/* Left Wheels & Right Wheels Layout Container */}
                <div className="w-full flex items-start justify-between gap-3 sm:gap-6 pt-3 px-2">
                  {/* LEFT SIDE WHEELS */}
                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      {leftConfigs.map((cfg) => renderWheelBox(cfg))}
                    </div>
                  </div>

                  {/* Central Spacer (Chassis center gap) */}
                  <div className="w-12 sm:w-16 shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-slate-500 font-mono rotate-90 tracking-wider">CHASSIS</span>
                  </div>

                  {/* RIGHT SIDE WHEELS */}
                  <div className="flex-1 flex justify-start">
                    <div className="flex items-center gap-2">
                      {rightConfigs.map((cfg) => renderWheelBox(cfg))}
                    </div>
                  </div>
                </div>

                {/* Battery Compartment Mounted after Axle 1 */}
                {isAxle1 && (
                  <div className="w-full flex items-center justify-center my-6 z-10">
                    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 p-3 rounded-2xl border-2 border-amber-500/50 shadow-xl max-w-md w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <BatteryCharging className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                              ช่องติดตั้งแบตเตอรี่ (BATTERY COMPARTMENT)
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40 font-bold">
                              {batteryRecord?.voltageSpec || (vehicle.vehicleType.includes("tractor") || vehicle.vehicleType.includes("truck") ? "24V (2 ลูก)" : "12V (1 ลูก)")}
                            </span>
                          </div>
                          {batteryRecord ? (
                            <div className="text-[11px] text-slate-300 mt-0.5">
                              <strong className="text-white">{batteryRecord.batteryBrand} {batteryRecord.batteryModel}</strong> • {batteryRecord.replacedDateTh || batteryRecord.replacedDate}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              แบตเตอรี่มาตรฐานประจำตัวรถ (อยู่ในระบบคัสซี)
                            </div>
                          )}
                        </div>
                      </div>

                      {batteryRecord && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-emerald-400 font-mono font-bold">
                            SOH: {batteryRecord.healthStatusSoh}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {batteryRecord.voltageVolts}V
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ======================================================== */}
          {/* 3. SPARE TIRE & REAR SECTION                            */}
          {/* ======================================================== */}
          {spareConfigs.length > 0 && (
            <div className="w-full flex flex-col items-center pt-4 z-10">
              <div className="px-3 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-400 mb-2">
                ยางอะไหล่ใต้ท้องรถ (SPARE TIRE CARRIER)
              </div>
              <div className="flex items-center justify-center">
                {spareConfigs.map((cfg) => renderWheelBox(cfg))}
              </div>
            </div>
          )}

          {/* Rear Bumper & Taillights */}
          <div className="w-full flex flex-col items-center pt-6 z-10">
            {/* Bumper Bar */}
            <div className="w-64 sm:w-80 h-7 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-b-xl border-2 border-slate-700 flex items-center justify-between px-4 shadow-md">
              <div className="w-5 h-2.5 rounded bg-rose-600 shadow-md shadow-rose-600/50" title="ไฟท้ายซ้าย" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] font-mono text-slate-400 font-bold">REAR BUMPER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
              <div className="w-5 h-2.5 rounded bg-rose-600 shadow-md shadow-rose-600/50" title="ไฟท้ายขวา" />
            </div>

            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 text-slate-500 text-xs font-bold border border-slate-800 tracking-wider mt-3">
              <span>▼ ด้านท้ายรถ (REAR DIRECTION)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 sm:p-6 text-white shadow-2xl relative"
    >
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Summary & Level Legend */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-black text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
              <span>ผังตำแหน่งล้อ & สรุปความลึกดอกยาง (CHASSIS TIRE LAYOUT)</span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1">
            <span>ทะเบียน: <strong className="text-white font-mono font-bold">{vehicle.licensePlate}</strong></span>
            <span>•</span>
            <span>รุ่น: <strong className="text-slate-200">{vehicle.brand} {vehicle.model}</strong></span>
            <span>•</span>
            <span>ไมล์: <strong className="text-blue-300 font-mono">{vehicle.currentMileage.toLocaleString()} กม.</strong></span>
            <span>•</span>
            <span>ดอกยางต่ำสุด: <strong className={`font-mono font-bold ${minDepth < criticalThresholdMm ? "text-rose-400" : minDepth <= warningThresholdMm ? "text-amber-400" : "text-emerald-400"}`}>{minDepth} mm</strong></span>
          </div>
        </div>

        {/* Legend: 3 Levels / Safety Thresholds */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>&gt; {warningThresholdMm} mm (ปกติ: {safeCount})</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-600/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{criticalThresholdMm}-{warningThresholdMm} mm (เฝ้าระวัง: {warningCount})</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-600/40">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>&lt; {criticalThresholdMm} mm (วิกฤต: {criticalCount})</span>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly View Mode Toolbar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-slate-800 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>มุมมองผังตัวรถ (Mobile Controls):</span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileViewMode("all_scroll")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileViewMode === "all_scroll"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5 text-blue-300" />
            <span>ทั้งคัน (ปัดเลื่อน)</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewMode("fit_screen")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileViewMode === "fit_screen"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>ย่อพอดีจอ (Fit)</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewMode("left_side")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileViewMode === "left_side"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>ดูเฉพาะล้อซ้าย</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewMode("right_side")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileViewMode === "right_side"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>ดูเฉพาะล้อขวา</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area based on selected Mobile View Mode */}
      <div className="relative z-10 w-full">
        {/* VIEW 1: SIDE VIEW (LEFT OR RIGHT) */}
        {mobileViewMode === "left_side" && renderSideView("left")}
        {mobileViewMode === "right_side" && renderSideView("right")}

        {/* VIEW 2: FIT TO SCREEN MODE (SCALED TO FIT MOBILE WITHOUT HORIZONTAL SCROLL) */}
        {mobileViewMode === "fit_screen" && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-center text-[11px] text-slate-400 bg-slate-900/50 py-1 px-3 rounded-lg border border-slate-800 mb-2">
              📱 โหมดย่อพอดีจอ (Fit to Screen) • ย่อโครงสร้างทั้งคันให้แสดงผลครบโดยไม่ต้องเลื่อน
            </div>
            <div 
              className="w-full flex justify-center overflow-hidden"
              style={{
                height: `${Math.round(contentHeight * fitScale) + 20}px`
              }}
            >
              <div 
                style={{
                  transform: `scale(${fitScale})`,
                  transformOrigin: "top center",
                  width: `${BASE_CHASSIS_WIDTH}px`,
                  transition: "transform 0.2s ease"
                }}
              >
                {renderChassisGraphic()}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FULL CHASSIS SCROLLABLE (DEFAULT, WITH SMOOTH TOUCH SWIPE & QUICK JUMP) */}
        {mobileViewMode === "all_scroll" && (
          <div className="w-full">
            {/* Mobile swipe helper and jump buttons */}
            <div className="sm:hidden flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 mb-3">
              <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <span>👈 ปัดซ้าย-ขวาเพื่อดูล้อรอบคัน</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollToSide("left")}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-bold border border-slate-700"
                >
                  ◀ ล้อซ้าย
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSide("center")}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                >
                  กลาง
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSide("right")}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-bold border border-slate-700"
                >
                  ล้อขวา ▶
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Wrapper - Never cuts off */}
            <div 
              ref={scrollContainerRef}
              className="w-full overflow-x-auto touch-pan-x pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="min-w-[720px] max-w-4xl mx-auto flex flex-col items-center">
                {renderChassisGraphic()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

