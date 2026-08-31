import { 
  TireReplacementRecord, 
  TirePositionMeasurement, 
  VehicleRecord, 
  VehicleType 
} from "../types";
import { getWheelPositionsForVehicleType } from "./tireInspectionConfig";

export const TIRE_BRANDS = [
  "Bridgestone",
  "Michelin",
  "Deestone",
  "Otani",
  "Goodyear",
  "Maxxis",
  "Continental",
  "Yokohama",
  "Dunlop",
  "Double Coin"
];

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

// Initial realistic replacement history records
export const INITIAL_TIRE_REPLACEMENTS: TireReplacementRecord[] = [
  {
    id: "TR-2026-001",
    vehicleId: "v-01",
    licensePlate: "70-8591",
    vehicleBrand: "Isuzu",
    vehicleModel: "GXZ 360",
    vehicleType: "tractor_10w",
    positionKey: "FL",
    positionNameTh: "เพลา 1 หน้าซ้าย (FL)",
    replacedDate: "2026-07-15",
    replacedMileage: 372000,
    tireBrand: "Bridgestone",
    tireModel: "R156",
    tireSize: "295/80R22.5",
    tireSerial: "BS-2481903",
    dotCode: "DOT 2224",
    tireType: "new",
    initialTreadDepthMm: 14.5,
    currentTreadDepthMm: 11.2,
    costPerTire: 9200,
    supplierOrShop: "ศูนย์บริการ บริดจสโตน บอย ยางยนต์",
    technicianName: "ช่างสมชาย (อู่ TNB)",
    reason: "worn_out",
    reasonLabelTh: "ดอกยางหมดตามอายุการใช้งาน (< 2.0 มม.)",
    status: "active",
    notes: "เปลี่ยนยางคู่หน้าชุดใหม่ พร้อมตั้งศูนย์ถ่วงล้อเลเซอร์",
    createdAt: "2026-07-15T09:30:00Z"
  },
  {
    id: "TR-2026-002",
    vehicleId: "v-01",
    licensePlate: "70-8591",
    vehicleBrand: "Isuzu",
    vehicleModel: "GXZ 360",
    vehicleType: "tractor_10w",
    positionKey: "FR",
    positionNameTh: "เพลา 1 หน้าขวา (FR)",
    replacedDate: "2026-07-15",
    replacedMileage: 372000,
    tireBrand: "Bridgestone",
    tireModel: "R156",
    tireSize: "295/80R22.5",
    tireSerial: "BS-2481904",
    dotCode: "DOT 2224",
    tireType: "new",
    initialTreadDepthMm: 14.5,
    currentTreadDepthMm: 11.0,
    costPerTire: 9200,
    supplierOrShop: "ศูนย์บริการ บริดจสโตน บอย ยางยนต์",
    technicianName: "ช่างสมชาย (อู่ TNB)",
    reason: "worn_out",
    reasonLabelTh: "ดอกยางหมดตามอายุการใช้งาน (< 2.0 มม.)",
    status: "active",
    notes: "เปลี่ยนยางคู่หน้าชุดใหม่ พร้อมตั้งศูนย์ถ่วงล้อเลเซอร์",
    createdAt: "2026-07-15T09:30:00Z"
  },
  {
    id: "TR-2026-003",
    vehicleId: "v-01",
    licensePlate: "70-8591",
    vehicleBrand: "Isuzu",
    vehicleModel: "GXZ 360",
    vehicleType: "tractor_10w",
    positionKey: "A2_L_OUT",
    positionNameTh: "เพลา 2 ซ้ายนอก (A2-L-Out)",
    replacedDate: "2026-05-10",
    replacedMileage: 345000,
    tireBrand: "Michelin",
    tireModel: "X Multi D",
    tireSize: "295/80R22.5",
    tireSerial: "MCH-994102",
    dotCode: "DOT 1224",
    tireType: "new",
    initialTreadDepthMm: 15.0,
    currentTreadDepthMm: 8.8,
    costPerTire: 10500,
    supplierOrShop: "มิชลิน ทรัค เซ็นเตอร์ พระราม 2",
    technicianName: "ช่างวิชัย (อู่ TNB)",
    reason: "burst_or_cut",
    reasonLabelTh: "ยางระเบิด / หน้ายางฉีกขาดรุนแรง",
    status: "active",
    notes: "เหยียบเหล็กเส้นบนทางหลวง ฉีกขาดจนซ่อมไม่ได้ จึงเปลี่ยนเส้นใหม่",
    createdAt: "2026-05-10T14:20:00Z"
  },
  {
    id: "TR-2026-004",
    vehicleId: "v-02",
    licensePlate: "70-9122",
    vehicleBrand: "Hino",
    vehicleModel: "Victa 500",
    vehicleType: "tractor_10w",
    positionKey: "A3_R_OUT",
    positionNameTh: "เพลา 3 ขวานอก (A3-R-Out)",
    replacedDate: "2026-08-01",
    replacedMileage: 418000,
    tireBrand: "Otani",
    tireModel: "OH-301",
    tireSize: "11R22.5",
    tireSerial: "OT-551980",
    dotCode: "DOT 2824",
    tireType: "retread",
    initialTreadDepthMm: 13.0,
    currentTreadDepthMm: 12.0,
    costPerTire: 4800,
    supplierOrShop: "โรงงานโอตานิ ยางหล่อดอก สมุทรสาคร",
    technicianName: "ช่างมานพ (อู่ TNB)",
    reason: "worn_out",
    reasonLabelTh: "ดอกยางหมดตามอายุการใช้งาน (< 2.0 มม.)",
    status: "active",
    notes: "ใช้โครงยางแท้มาหล่อดอกเกรดพรีเมียม ประหยัดต้นทุน 50%",
    createdAt: "2026-08-01T11:00:00Z"
  },
  {
    id: "TR-2026-005",
    vehicleId: "v-03",
    licensePlate: "71-2045",
    vehicleBrand: "Isuzu",
    vehicleModel: "FTR 240",
    vehicleType: "box_truck_6w",
    positionKey: "FL",
    positionNameTh: "หน้าซ้าย (FL)",
    replacedDate: "2026-06-20",
    replacedMileage: 189000,
    tireBrand: "Deestone",
    tireModel: "SV402",
    tireSize: "9.5R17.5",
    tireSerial: "DS-330198",
    dotCode: "DOT 1924",
    tireType: "new",
    initialTreadDepthMm: 13.5,
    currentTreadDepthMm: 9.8,
    costPerTire: 5800,
    supplierOrShop: "ดีสโตน ตัวแทนจำหน่ายสาขากิ่งแก้ว",
    technicianName: "ช่างสมชาย (อู่ TNB)",
    reason: "scheduled_rotation",
    reasonLabelTh: "สลับยางตามรอบบำรุงรักษา PM",
    status: "active",
    notes: "เปลี่ยนคู่หน้าใหม่ เส้นเดิมย้ายไปสลับใส่เพลาหลัง",
    createdAt: "2026-06-20T16:00:00Z"
  },
  {
    id: "TR-2026-006",
    vehicleId: "v-05",
    licensePlate: "1ฒน-4921",
    vehicleBrand: "Toyota",
    vehicleModel: "Hilux Revo",
    vehicleType: "pickup_box",
    positionKey: "RL",
    positionNameTh: "หลังซ้าย (RL)",
    replacedDate: "2026-08-12",
    replacedMileage: 122000,
    tireBrand: "Bridgestone",
    tireModel: "Duravis R611",
    tireSize: "195R14C",
    tireSerial: "BS-771920",
    dotCode: "DOT 3024",
    tireType: "new",
    initialTreadDepthMm: 11.0,
    currentTreadDepthMm: 10.5,
    costPerTire: 3200,
    supplierOrShop: "บี-ควิก สาขาบางนา",
    technicianName: "ช่างบีควิก",
    reason: "puncture_damage",
    reasonLabelTh: "โดนตะปู / แก้มยางฉีก ปะซ่อมไม่ได้",
    status: "active",
    notes: "โดนเหล็กแหลมทิ่มแก้มยางระหว่างส่งสินค้าด่วน เบิกยางใหม่ทันที",
    createdAt: "2026-08-12T13:10:00Z"
  }
];

// Helper to generate dynamic tire measurements for a vehicle, combining realistic variations
export function getVehicleTireMeasurements(
  vehicle: VehicleRecord,
  replacementHistory: TireReplacementRecord[] = []
): TirePositionMeasurement[] {
  const configs = getWheelPositionsForVehicleType(vehicle.vehicleType);
  const vehicleReplacements = replacementHistory.filter(
    (r) => r.vehicleId === vehicle.id || r.licensePlate === vehicle.licensePlate
  );

  return configs.map((cfg) => {
    // Check if this position has a replacement record
    const latestRep = vehicleReplacements
      .filter((r) => r.positionKey === cfg.key)
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
      // Create some variance for realism: e.g. front tires wear faster, or some vehicles have critical/warning tires
      const mileageMod = (vehicle.currentMileage + cfg.axle * 7000 + (cfg.side === "left" ? 1200 : 0)) % 40000;
      depth = Math.max(1.4, Math.min(14.0, Number((14.0 - (mileageMod / 40000) * 12.5).toFixed(1))));

      // Add a couple of critical tires for demo alerts
      if (vehicle.licensePlate === "70-8591" && cfg.key === "A3_L_IN") {
        depth = 1.8; // Critical (< 2.0 mm)
        wear = "uneven_wear";
      } else if (vehicle.licensePlate === "70-9122" && cfg.key === "FL") {
        depth = 2.4; // Warning (2.0 - 3.5 mm)
      } else if (vehicle.licensePlate === "71-2045" && cfg.key === "RR_OUT") {
        depth = 1.6; // Critical (< 2.0 mm)
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
      notes: latestRep ? `เปลี่ยนเมื่อ ${latestRep.replacedDate} (${latestRep.tireBrand})` : ""
    };
  });
}
