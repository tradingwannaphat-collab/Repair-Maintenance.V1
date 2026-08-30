import { PMMonthlyScheduleItem, PMPlanType, PMChecklistItem } from "../types";
import { FULL_TNB_FLEET_DATA, UTILITY_VEHICLES } from "./initialFleetData";
import { TNB_TRUCKS_DATA } from "./tnbTrucksData";
import { TNB_TRAILERS_DATA } from "./tnbTrailersData";
import { REAL_FLEET_PM_SCHEDULES_2026 } from "./pmPlanSample2026";

export const PM_TYPE_CONFIG: Record<PMPlanType, {
  nameTh: string;
  nameEn: string;
  badgeColor: string;
  intervalKm: number;
  intervalMonths: number;
  estimatedCost: number;
  description: string;
  standardChecklist: string[];
}> = {
  pm1_minor: {
    nameTh: "PM 1: เช็คระยะย่อย (A-Service)",
    nameEn: "Minor Service (10k-20k km)",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    intervalKm: 15000,
    intervalMonths: 3,
    estimatedCost: 3500,
    description: "เปลี่ยนถ่ายน้ำมันเครื่อง ไส้กรองน้ำมันเครื่อง ตรวจเช็คระบบไฟส่องสว่าง ลมยาง และตรวจระดับน้ำยาหล่อเย็น",
    standardChecklist: [
      "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์แท้เกรดงานหนัก (Heavy-Duty Engine Oil)",
      "เปลี่ยนไส้กรองน้ำมันเครื่อง (Engine Oil Filter)",
      "ตรวจระดับน้ำหล่อเย็นในหม้อน้ำและถังพัก (Coolant Level Check)",
      "ตรวจเช็คระบบไฟส่องสว่าง ไฟเลี้ยว ไฟเบรก ไฟสัญญาณรอบคัน",
      "ตรวจเช็คแรงดันลมยางทุกเส้นและขันแน่นน็อตล้อ (Tire Pressure & Torque)",
      "ตรวจเช็คระดับน้ำมันเบรกและน้ำมันคลัตช์ (Brake & Clutch Fluid)",
      "ตรวจสภาพใบปัดน้ำฝนและน้ำยาฉีดกระจก"
    ]
  },
  pm2_intermediate: {
    nameTh: "PM 2: เช็คระยะปานกลาง (B-Service)",
    nameEn: "Intermediate Service (40k-50k km)",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    intervalKm: 40000,
    intervalMonths: 6,
    estimatedCost: 8500,
    description: "งาน PM1 + เปลี่ยนถ่ายน้ำมันเกียร์/เฟืองท้าย ไส้กรองอากาศ ไส้กรองดักน้ำ อัดจารบีลูกปืนล้อและเพลากลาง",
    standardChecklist: [
      "ดำเนินการรายการตรวจสอบตามมาตรฐาน PM 1 ทั้งหมด",
      "เปลี่ยนไส้กรองอากาศ (Air Cleaner Filter)",
      "เปลี่ยนไส้กรองน้ำมันเชื้อเพลิง / กรองดักน้ำ (Fuel Water Separator)",
      "เปลี่ยนถ่ายน้ำมันเกียร์และน้ำมันเฟืองท้าย (Gear & Differential Oil)",
      "อัดจารบีเพลากลาง กากบาท และลูกหมากช่วงล่าง (Greasing Chassis & Universal Joint)",
      "ตรวจเช็คความหนาผ้าเบรก จานเบรก และปรับตั้งเบรกลม (Brake Lining & Slack Adjuster)",
      "ตรวจเช็คความตึงและสภาพสายพานเครื่องยนต์ (Engine Belts Tension)",
      "ตรวจเช็คสภาพแบตเตอรี่ แรงดันไฟ และขั้วแบตเตอรี่"
    ]
  },
  pm3_major: {
    nameTh: "PM 3: เช็คระยะใหญ่ (C-Service / Major Overhaul)",
    nameEn: "Major Service (80k-100k km)",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    intervalKm: 80000,
    intervalMonths: 12,
    estimatedCost: 18500,
    description: "งาน PM2 + ล้างหม้อน้ำ เปลี่ยนสายพานไทม์มิ่ง/หน้าเครื่อง เช็คปั๊มลม วาล์วลม เบรกใหญ่ และระบบส่งกำลังทั้งระบบ",
    standardChecklist: [
      "ดำเนินการรายการตรวจสอบตามมาตรฐาน PM 2 ทั้งหมด",
      "ถ่ายและล้างระบบน้ำหล่อเย็นหม้อน้ำ (Radiator Flush & Renewal)",
      "ตรวจเช็คระบบเบรกลม วาล์วควบคุมลม และดรายเออร์ลม (Air Brake System & Air Dryer)",
      "เปลี่ยนชุดสายพานหน้าเครื่องและลูกรอกปรับตึง (Serpentine Belt & Tensioner)",
      "ตรวจเช็คระยะห่างวาล์วเครื่องยนต์และหัวฉีดคอมมอนเรล (Valve Clearance & Injectors)",
      "ตรวจสภาพสปริงแหนบ โช้คอัพ บูชยาง และแท่นเครื่อง/แท่นเกียร์",
      "ตรวจเช็คไดชาร์จ ไดสตาร์ท และแรงดันไฟไดนาโม",
      "ล้างท่อร่วมไอดีและทำความสะอาดระบบ EGR"
    ]
  },
  pm_annual: {
    nameTh: "PM ตรวจสภาพประจำปี (Annual Inspection / DLT)",
    nameEn: "Annual Regulatory & Safety Inspection",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    intervalKm: 0,
    intervalMonths: 12,
    estimatedCost: 4500,
    description: "ตรวจสภาพความพร้อมตามเกณฑ์กรมการขนส่งทางบก ทดสอบควันดำ เบรก แสงสว่าง คัสซี เพื่อต่อภาษี/พรบ.",
    standardChecklist: [
      "ตรวจวัดค่าควันดำ / มลพิษไอเสีย (Smoke Emission Test)",
      "ทดสอบประสิทธิภาพเบรกหน้า-หลังบนแท่นทดสอบ (Roller Brake Tester)",
      "ตรวจเช็คศูนย์ล้อและมุมพวงมาลัย (Wheel Alignment Test)",
      "ตรวจความเข้มและมุมตกของโคมไฟหน้า (Headlight Beam Test)",
      "ตรวจเช็คความสมบูรณ์ของเลขตัวถัง (Chassis) และเลขเครื่องยนต์ตรงเล่มทะเบียน",
      "ตรวจเช็คอุปกรณ์ความปลอดภัย ถังดับเพลิง กรวยสะท้อนแสง และกล่องปฐมพยาบาล",
      "ตรวจเช็คความพร้อมของระบบ GPS ติดตามยานพาหนะและเครื่องรูดใบขับขี่"
    ]
  },
  pm_custom: {
    nameTh: "PM เฉพาะกิจ / ตรวจสภาพพิเศษ",
    nameEn: "Custom / Special PM Check",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    intervalKm: 0,
    intervalMonths: 0,
    estimatedCost: 5000,
    description: "แผนการตรวจเช็คพิเศษตามฤดูกาล หรือเตรียมความพร้อมก่อนงานวิ่งระยะไกลพิเศษ",
    standardChecklist: [
      "ตรวจเช็คระบบระบายความร้อนและระบบแอร์ห้องโดยสาร",
      "ตรวจเช็คสภาพยางและระบบกันสะเทือน",
      "ตรวจเช็คระบบน้ำมันเชื้อเพลิงและระบบส่งกำลัง",
      "ทดสอบระบบไฟฟ้าและแบตเตอรี่สำรอง"
    ]
  }
};

// Initial and Sample PM Schedules using real vehicle data (Jan - Dec 2026)
export const INITIAL_PM_SCHEDULES: PMMonthlyScheduleItem[] = REAL_FLEET_PM_SCHEDULES_2026;
export const DEMO_SAMPLE_PM_SCHEDULES: PMMonthlyScheduleItem[] = REAL_FLEET_PM_SCHEDULES_2026;
export const INITIAL_PM_SCHEDULES_2026: PMMonthlyScheduleItem[] = REAL_FLEET_PM_SCHEDULES_2026;

export const MONTH_NAMES_TH = [
  "มกราคม (Jan)",
  "กุมภาพันธ์ (Feb)",
  "มีนาคม (Mar)",
  "เมษายน (Apr)",
  "พฤษภาคม (May)",
  "มิถุนายน (Jun)",
  "กรกฎาคม (Jul)",
  "สิงหาคม (Aug)",
  "กันยายน (Sep)",
  "ตุลาคม (Oct)",
  "พฤศจิกายน (Nov)",
  "ธันวาคม (Dec)"
];

export const MONTH_SHORT_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

/**
 * Generate 12-month annual PM Plan for the whole fleet
 */
export function generateAnnualPMPlanForFleet(
  vehicles: {
    id: string;
    licensePlate: string;
    province?: string;
    erpCode?: string;
    vehicleBrand?: string;
    brand?: string;
    vehicleModel?: string;
    model?: string;
    vehicleType: string;
    currentMileage?: number;
    department?: string;
    driverName?: string;
  }[],
  year: number
): PMMonthlyScheduleItem[] {
  const result: PMMonthlyScheduleItem[] = [];

  vehicles.forEach((veh, vehIdx) => {
    // Schedule PM every 3 months for heavy vehicles: Month 3 (PM1), Month 6 (PM2), Month 9 (PM1), Month 12 (PM3/Annual)
    const baseMonthOffset = (vehIdx % 3); // staggered schedule
    const pmMonths = [
      { month: ((1 + baseMonthOffset) % 12) + 1, type: "pm1_minor" as PMPlanType },
      { month: ((4 + baseMonthOffset) % 12) + 1, type: "pm2_intermediate" as PMPlanType },
      { month: ((7 + baseMonthOffset) % 12) + 1, type: "pm1_minor" as PMPlanType },
      { month: ((10 + baseMonthOffset) % 12) + 1, type: "pm3_major" as PMPlanType }
    ];

    pmMonths.forEach((pm, planIdx) => {
      const cfg = PM_TYPE_CONFIG[pm.type];
      const baseMileage = (veh.currentMileage || 50000) + ((planIdx + 1) * (cfg?.intervalKm || 15000));
      const day = 10 + ((vehIdx * 2) % 18);
      const plannedDate = `${year}-${String(pm.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const code = `PM-${year}-${String(pm.month).padStart(2, "0")}-${String(vehIdx + 1).padStart(3, "0")}`;

      const checklists: PMChecklistItem[] = (cfg?.standardChecklist || []).map((item, cIdx) => ({
        id: `c-${planIdx}-${cIdx}`,
        item,
        category: pm.type,
        isChecked: false
      }));

      result.push({
        id: `pm-auto-${year}-${veh.id}-${pm.month}`,
        pmPlanCode: code,
        isoDocNumber: "TNB-MT-PLN-001-Rev.02",
        vehicleId: veh.id,
        licensePlate: veh.licensePlate,
        erpNo: veh.erpCode || "",
        province: veh.province || "กรุงเทพมหานคร",
        vehicleBrand: veh.vehicleBrand || veh.brand || "ISUZU",
        vehicleModel: veh.vehicleModel || veh.model || "GXZ77NXXFV",
        vehicleType: veh.vehicleType as any,
        carrierCompany: "TNB",
        department: veh.department || "ฝ่ายขนส่ง",
        driverName: veh.driverName || "พนักงานขับรถ TNB",
        year,
        month: pm.month,
        plannedDate,
        pmType: pm.type,
        pmTypeName: cfg?.nameTh || "PM ตรวจเช็คตามระยะทาง",
        targetMileage: baseMileage,
        lastServiceMileage: veh.currentMileage || 0,
        status: "planned",
        estimatedCost: cfg?.estimatedCost || 3500,
        assignedTechnician: "ทีมช่างศูนย์บริการ TNB",
        checklists,
        notes: `แผน PM อัตโนมัติรอบปี ${year} ตามมาตรฐานระยะทาง ${cfg?.intervalKm?.toLocaleString() || 15000} กม.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });

  return result.sort((a, b) => a.month - b.month || a.licensePlate.localeCompare(b.licensePlate));
}
