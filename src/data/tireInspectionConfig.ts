import { 
  TirePositionMeasurement, 
  TireInspectionReport, 
  VehicleType 
} from "../types";

export const CRITICAL_TREAD_DEPTH_MM = 2.0; // มาตรฐานกรมการขนส่งทางบก: ต่ำกว่า 2.0 มม. หรือถึงสะพานยาง -> วิกฤต ห้ามวิ่ง
export const WARNING_TREAD_DEPTH_MM = 3.5;  // 2.0 - 3.5 มม. -> เฝ้าระวัง เตรียมเปลี่ยน/สลับยาง
export const NEW_TIRE_DEPTH_MM = 14.0;      // ยางใหม่ทั่วไป 12.0 - 15.0 มม.

export interface WheelPositionConfig {
  key: string;
  nameTh: string;
  nameEn: string;
  axle: number; // 1 = Front, 2 = Drive/Middle, 3 = Rear, 4+ = Trailer
  side: 'left' | 'right';
  isDual: boolean; // ล้อคู่หรือไม่
}

export function getWheelPositionsForVehicleType(vehicleType: VehicleType): WheelPositionConfig[] {
  switch (vehicleType) {
    case "pickup":
    case "pickup_box":
    case "van":
    case "sedan":
    case "suv":
    case "forklift":
    case "motorcycle":
      return [
        { key: "FL", nameTh: "หน้าซ้าย (FL)", nameEn: "Front Left", axle: 1, side: "left", isDual: false },
        { key: "FR", nameTh: "หน้าขวา (FR)", nameEn: "Front Right", axle: 1, side: "right", isDual: false },
        { key: "RL", nameTh: "หลังซ้าย (RL)", nameEn: "Rear Left", axle: 2, side: "left", isDual: false },
        { key: "RR", nameTh: "หลังขวา (RR)", nameEn: "Rear Right", axle: 2, side: "right", isDual: false },
        { key: "SPARE", nameTh: "ยางอะไหล่ (Spare)", nameEn: "Spare Tire", axle: 0, side: "left", isDual: false }
      ];

    case "jumbo_4w":
      return [
        { key: "FL", nameTh: "หน้าซ้าย (FL)", nameEn: "Front Left", axle: 1, side: "left", isDual: false },
        { key: "FR", nameTh: "หน้าขวา (FR)", nameEn: "Front Right", axle: 1, side: "right", isDual: false },
        { key: "RL_OUT", nameTh: "หลังซ้ายนอก (RL-Out)", nameEn: "Rear Left Outer", axle: 2, side: "left", isDual: true },
        { key: "RL_IN", nameTh: "หลังซ้ายใน (RL-In)", nameEn: "Rear Left Inner", axle: 2, side: "left", isDual: true },
        { key: "RR_IN", nameTh: "หลังขวาใน (RR-In)", nameEn: "Rear Right Inner", axle: 2, side: "right", isDual: true },
        { key: "RR_OUT", nameTh: "หลังขวานอก (RR-Out)", nameEn: "Rear Right Outer", axle: 2, side: "right", isDual: true },
        { key: "SPARE", nameTh: "ยางอะไหล่ (Spare)", nameEn: "Spare Tire", axle: 0, side: "left", isDual: false }
      ];

    case "box_truck_6w":
    case "tractor_6w":
      return [
        { key: "FL", nameTh: "หน้าซ้าย (FL)", nameEn: "Front Left", axle: 1, side: "left", isDual: false },
        { key: "FR", nameTh: "หน้าขวา (FR)", nameEn: "Front Right", axle: 1, side: "right", isDual: false },
        { key: "RL_OUT", nameTh: "เพลาขับซ้ายนอก (RL-Out)", nameEn: "Rear Left Outer", axle: 2, side: "left", isDual: true },
        { key: "RL_IN", nameTh: "เพลาขับซ้ายใน (RL-In)", nameEn: "Rear Left Inner", axle: 2, side: "left", isDual: true },
        { key: "RR_IN", nameTh: "เพลาขับขวาใน (RR-In)", nameEn: "Rear Right Inner", axle: 2, side: "right", isDual: true },
        { key: "RR_OUT", nameTh: "เพลาขับขวานอก (RR-Out)", nameEn: "Rear Right Outer", axle: 2, side: "right", isDual: true },
        { key: "SPARE", nameTh: "ยางอะไหล่ (Spare)", nameEn: "Spare Tire", axle: 0, side: "left", isDual: false }
      ];

    case "trailer_2axle":
    case "trailer_3axle":
      return [
        { key: "T1_L_OUT", nameTh: "หางพ่วงเพลา 1 ซ้ายนอก", nameEn: "Trailer Axle 1 Left Outer", axle: 1, side: "left", isDual: true },
        { key: "T1_L_IN", nameTh: "หางพ่วงเพลา 1 ซ้ายใน", nameEn: "Trailer Axle 1 Left Inner", axle: 1, side: "left", isDual: true },
        { key: "T1_R_IN", nameTh: "หางพ่วงเพลา 1 ขวาใน", nameEn: "Trailer Axle 1 Right Inner", axle: 1, side: "right", isDual: true },
        { key: "T1_R_OUT", nameTh: "หางพ่วงเพลา 1 ขวานอก", nameEn: "Trailer Axle 1 Right Outer", axle: 1, side: "right", isDual: true },
        { key: "T2_L_OUT", nameTh: "หางพ่วงเพลา 2 ซ้ายนอก", nameEn: "Trailer Axle 2 Left Outer", axle: 2, side: "left", isDual: true },
        { key: "T2_L_IN", nameTh: "หางพ่วงเพลา 2 ซ้ายใน", nameEn: "Trailer Axle 2 Left Inner", axle: 2, side: "left", isDual: true },
        { key: "T2_R_IN", nameTh: "หางพ่วงเพลา 2 ขวาใน", nameEn: "Trailer Axle 2 Right Inner", axle: 2, side: "right", isDual: true },
        { key: "T2_R_OUT", nameTh: "หางพ่วงเพลา 2 ขวานอก", nameEn: "Trailer Axle 2 Right Outer", axle: 2, side: "right", isDual: true },
        { key: "T3_L_OUT", nameTh: "หางพ่วงเพลา 3 ซ้ายนอก", nameEn: "Trailer Axle 3 Left Outer", axle: 3, side: "left", isDual: true },
        { key: "T3_L_IN", nameTh: "หางพ่วงเพลา 3 ซ้ายใน", nameEn: "Trailer Axle 3 Left Inner", axle: 3, side: "left", isDual: true },
        { key: "T3_R_IN", nameTh: "หางพ่วงเพลา 3 ขวาใน", nameEn: "Trailer Axle 3 Right Inner", axle: 3, side: "right", isDual: true },
        { key: "T3_R_OUT", nameTh: "หางพ่วงเพลา 3 ขวานอก", nameEn: "Trailer Axle 3 Right Outer", axle: 3, side: "right", isDual: true }
      ];

    case "tractor_10w":
    case "truck":
    case "other":
    default:
      return [
        { key: "FL", nameTh: "เพลา 1 หน้าซ้าย (FL)", nameEn: "Axle 1 Front Left", axle: 1, side: "left", isDual: false },
        { key: "FR", nameTh: "เพลา 1 หน้าขวา (FR)", nameEn: "Axle 1 Front Right", axle: 1, side: "right", isDual: false },
        { key: "A2_L_OUT", nameTh: "เพลา 2 ซ้ายนอก (A2-L-Out)", nameEn: "Axle 2 Left Outer", axle: 2, side: "left", isDual: true },
        { key: "A2_L_IN", nameTh: "เพลา 2 ซ้ายใน (A2-L-In)", nameEn: "Axle 2 Left Inner", axle: 2, side: "left", isDual: true },
        { key: "A2_R_IN", nameTh: "เพลา 2 ขวาใน (A2-R-In)", nameEn: "Axle 2 Right Inner", axle: 2, side: "right", isDual: true },
        { key: "A2_R_OUT", nameTh: "เพลา 2 ขวานอก (A2-R-Out)", nameEn: "Axle 2 Right Outer", axle: 2, side: "right", isDual: true },
        { key: "A3_L_OUT", nameTh: "เพลา 3 ซ้ายนอก (A3-L-Out)", nameEn: "Axle 3 Left Outer", axle: 3, side: "left", isDual: true },
        { key: "A3_L_IN", nameTh: "เพลา 3 ซ้ายใน (A3-L-In)", nameEn: "Axle 3 Left Inner", axle: 3, side: "left", isDual: true },
        { key: "A3_R_IN", nameTh: "เพลา 3 ขวาใน (A3-R-In)", nameEn: "Axle 3 Right Inner", axle: 3, side: "right", isDual: true },
        { key: "A3_R_OUT", nameTh: "เพลา 3 ขวานอก (A3-R-Out)", nameEn: "Axle 3 Right Outer", axle: 3, side: "right", isDual: true },
        { key: "SPARE", nameTh: "ยางอะไหล่ (Spare)", nameEn: "Spare Tire", axle: 0, side: "left", isDual: false }
      ];
  }
}

// Generate default measurements for a vehicle type
export function generateDefaultTireMeasurements(
  vehicleType: VehicleType,
  presetDepth: number = 8.5
): TirePositionMeasurement[] {
  const positions = getWheelPositionsForVehicleType(vehicleType);
  return positions.map((pos) => ({
    positionKey: pos.key,
    positionNameTh: pos.nameTh,
    treadDepthMm: presetDepth,
    pressurePsi: 115,
    wearCondition: "normal",
    isAlert: false,
    alertLevel: "safe",
    notes: ""
  }));
}

// Evaluate condition and generate alert
export function evaluateTireCondition(
  measurements: TirePositionMeasurement[]
): TireInspectionReport {
  if (!measurements || measurements.length === 0) {
    return {
      minTreadDepthMm: 0,
      avgTreadDepthMm: 0,
      overallTireStatus: "safe",
      warningCount: 0,
      criticalCount: 0,
      alertMessage: "ยังไม่มีการบันทึกการวัดความลึกดอกยาง",
      measurements: [],
      recommendationAction: "none"
    };
  }

  let totalDepth = 0;
  let minDepth = Infinity;
  let criticalCount = 0;
  let warningCount = 0;
  const criticalPositions: string[] = [];
  const warningPositions: string[] = [];

  const evaluatedMeasurements: TirePositionMeasurement[] = measurements.map((m) => {
    const depth = Number(m.treadDepthMm) || 0;
    totalDepth += depth;
    if (depth < minDepth) minDepth = depth;

    let alertLevel: 'safe' | 'warning' | 'critical' = 'safe';
    let isAlert = false;

    // Critical conditions: depth < 2.0mm or bulge or cut or nail puncture
    if (depth < CRITICAL_TREAD_DEPTH_MM || m.wearCondition === "bulge" || m.wearCondition === "cut") {
      alertLevel = "critical";
      isAlert = true;
      criticalCount++;
      criticalPositions.push(`${m.positionNameTh} (${depth} mm, ${m.wearCondition})`);
    } else if (depth <= WARNING_TREAD_DEPTH_MM || m.wearCondition === "uneven_wear" || m.wearCondition === "cracks") {
      alertLevel = "warning";
      isAlert = true;
      warningCount++;
      warningPositions.push(`${m.positionNameTh} (${depth} mm)`);
    }

    return {
      ...m,
      treadDepthMm: depth,
      alertLevel,
      isAlert
    };
  });

  const avgDepth = Number((totalDepth / measurements.length).toFixed(1));
  const finalMinDepth = minDepth === Infinity ? 0 : Number(minDepth.toFixed(1));

  let overallTireStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let alertMessage = "✅ ดอกยางและสภาพยางทุกล้ออยู่ในเกณฑ์มาตรฐานปลอดภัย (> 3.5 มม.)";
  let recommendationAction: 'none' | 'rotate_tires' | 'replace_urgent' | 'adjust_alignment_pressure' = 'none';

  if (criticalCount > 0) {
    overallTireStatus = "critical";
    alertMessage = `🚨 แจ้งเตือนวิกฤต! พบยางต่ำกว่าเกณฑ์กฎหมาย (< 2.0 มม.) หรือชำรุดเสียหายร้ายแรง ${criticalCount} ตำแหน่ง (${criticalPositions.join(", ")}) — ห้ามปล่อยรถวิ่งเด็ดขาด ต้องเปลี่ยนยางทันที!`;
    recommendationAction = "replace_urgent";
  } else if (warningCount > 0) {
    overallTireStatus = "warning";
    alertMessage = `⚠️ เฝ้าระวัง: พบล้อที่มีดอกยางเหลือน้อย (2.0 - 3.5 มม.) หรือกินข้าง ${warningCount} ตำแหน่ง (${warningPositions.join(", ")}) — แนะนำสลับยางหรือเตรียมจัดซื้อยางชุดใหม่`;
    recommendationAction = "rotate_tires";
  }

  return {
    measuredAt: new Date().toISOString(),
    minTreadDepthMm: finalMinDepth,
    avgTreadDepthMm: avgDepth,
    overallTireStatus,
    warningCount,
    criticalCount,
    alertMessage,
    measurements: evaluatedMeasurements,
    recommendationAction
  };
}
