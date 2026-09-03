import { 
  TireReplacementRecord, 
  TirePositionMeasurement, 
  VehicleRecord 
} from "../types";
import { getWheelPositionsForVehicleType } from "./tireInspectionConfig";
import { STANDARD_TIRE_REPLACEMENTS_DOC1 } from "./standardTireReplacementsData";

export const TIRE_BRANDS = [
  "MARVEMAX",
  "DAYTON",
  "Bridgestone",
  "Michelin",
  "DEESTONE",
  "SKYRIVER",
  "Maris",
  "BDYALBCFTK",
  "Otani",
  "Goodyear",
  "Maxxis",
  "Firestone",
  "Continental",
  "Yokohama",
  "Dunlop",
  "Double Coin",
  "Giti",
  "Linglong",
  "Sailun",
  "Westlake",
  "Advance",
  "Hankook",
  "Apollo",
  "Leao",
  "Triangle",
  "__OTHER__"
];

export const TIRE_TYPES = [
  { key: "new", label: "ยางใหม่ (New Tire)", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "retread", label: "ยางหล่อดอก (Retread Tire)", badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "cold_retread", label: "ยางหล่อเย็น (Cold Retread)", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "hot_retread", label: "ยางหล่อร้อน (Hot Retread)", badgeColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  { key: "rotate", label: "สลับยาง / ยางหมุนเวียน (Rotated)", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "used", label: "ยางมือสองสภาพดี (Used)", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "other", label: "อื่นๆ / ระบุเอง", badgeColor: "bg-slate-50 text-slate-700 border-slate-200" }
];

export const getTireTypeLabel = (type: string) => {
  const match = TIRE_TYPES.find((t) => t.key === type);
  if (match) return match.label.split(" ")[0];
  if (type === "new") return "ยางใหม่";
  if (type === "retread") return "หล่อดอก";
  if (type === "cold_retread") return "หล่อเย็น";
  if (type === "hot_retread") return "หล่อร้อน";
  if (type === "rotate") return "สลับยาง";
  if (type === "used") return "ยางมือสอง";
  return type || "ยางใหม่";
};

export const TIRE_SIZES = [
  "11R22.5",
  "295/80R22.5",
  "12R22.5",
  "10.00R20",
  "215/75R17.5",
  "225/75R17.5",
  "9.5R17.5",
  "195R14C",
  "205/70R15C",
  "265/65R17"
];

export const TIRE_REPLACEMENT_REASONS = [
  { key: "worn_out", label: "ดอกยางหมดตามอายุการใช้งาน (< 2.0 มม.)" },
  { key: "burst_or_cut", label: "ยางระเบิด / หน้ายางฉีกขาดรุนแรง" },
  { key: "puncture_damage", label: "โดนตะปู / แก้มยางฉีก ปะซ่อมไม่ได้" },
  { key: "uneven_wear", label: "ยางกินข้าง / สึกไม่สม่ำเสมอ" },
  { key: "scheduled_rotation", label: "สลับยางตามรอบบำรุงรักษา PM" },
  { key: "annual_renewal", label: "เปลี่ยนยกชุดประจำปี / ตามมาตรฐาน ISO 39001" },
  { key: "other", label: "อื่นๆ / เบิกยางอะไหล่ทดแทน" }
];

// Standard replacement history records from Document 1 (20 operations, 50 tire positions)
export const INITIAL_TIRE_REPLACEMENTS: TireReplacementRecord[] = STANDARD_TIRE_REPLACEMENTS_DOC1;

// Helper to generate dynamic tire measurements for a vehicle, combining realistic variations
export function getVehicleTireMeasurements(
  vehicle: VehicleRecord,
  replacementHistory: TireReplacementRecord[] = []
): TirePositionMeasurement[] {
  const configs = getWheelPositionsForVehicleType(vehicle.vehicleType);
  const vehicleReplacements = replacementHistory.filter(
    (r) => r.vehicleId === vehicle.id || r.licensePlate === vehicle.licensePlate || (vehicle.oldLicensePlate && r.licensePlate === vehicle.oldLicensePlate)
  );

  return configs.map((cfg) => {
    // Check if this position has a replacement record
    const latestRep = vehicleReplacements
      .filter((r) => r.positionKey === cfg.key || String(r.positionNumber) === String(cfg.positionNumber))
      .sort((a, b) => new Date(b.replacedDate).getTime() - new Date(a.replacedDate).getTime())[0];

    // Seed realistic tread depths based on vehicle mileage and position
    let depth = 8.5;
    let wear: TirePositionMeasurement["wearCondition"] = "normal";
    let psi = cfg.axle === 1 ? 115 : 120;
    if (vehicle.vehicleType === "pickup" || vehicle.vehicleType === "pickup_box" || vehicle.vehicleType === "sedan") {
      psi = 38;
      depth = 7.0;
    }

    if (latestRep) {
      depth = latestRep.currentTreadDepthMm || (latestRep.initialTreadDepthMm - 2.5);
    } else {
      // Create some variance for realism: e.g. front tires wear faster
      const mileageMod = (vehicle.currentMileage + cfg.axle * 7000 + (cfg.side === "left" ? 1200 : 0)) % 40000;
      depth = Math.max(1.4, Math.min(14.0, Number((14.0 - (mileageMod / 40000) * 12.5).toFixed(1))));

      if (vehicle.licensePlate === "70-8591" && cfg.key === "A3_L_IN") {
        depth = 1.8;
        wear = "uneven_wear";
      } else if (vehicle.licensePlate === "70-9122" && cfg.key === "FL") {
        depth = 2.4;
      } else if (vehicle.licensePlate === "71-2045" && cfg.key === "RR_OUT") {
        depth = 1.6;
        wear = "cracks";
      }
    }

    let alertLevel: "safe" | "warning" | "critical" = "safe";
    let isAlert = false;

    const isCriticalWear = (wear as string) === "bulge" || (wear as string) === "cut";
    const isWarningWear = (wear as string) === "uneven_wear" || (wear as string) === "cracks" || (wear as string) === "nail_puncture";

    if (depth < 2.0 || isCriticalWear) {
      alertLevel = "critical";
      isAlert = true;
    } else if (depth <= 3.5 || isWarningWear) {
      alertLevel = "warning";
      isAlert = true;
    }

    return {
      positionKey: cfg.key,
      positionNameTh: cfg.nameTh,
      treadDepthMm: depth,
      pressurePsi: psi,
      wearCondition: wear,
      isAlert,
      alertLevel,
      notes: latestRep ? `เปลี่ยน ${latestRep.replacedDateTh || latestRep.replacedDate} (${latestRep.tireBrand} ${latestRep.tireSerial ? 'SN:' + latestRep.tireSerial : ''})` : ""
    };
  });
}
