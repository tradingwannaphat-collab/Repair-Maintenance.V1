import { 
  DailyInspectionItemTemplate, 
  DailyVehicleInspectionRecord, 
  DailyInspectionCheckResult,
  VehicleRecord, 
  InspectionCheckStatus 
} from "../types";
import { FULL_TNB_FLEET_DATA } from "./initialFleetData";

export const DAILY_INSPECTION_ITEMS_TEMPLATE: DailyInspectionItemTemplate[] = [
  {
    no: 1,
    name: "ระบบเบรก",
    standard: "ใช้งานได้ปกติ ระยะเหยียบเบรกและการจับตัวมั่นคง เบรกมือล็อคแน่น",
    method: "Ot3 (ทดสอบเหยียบแป้นเบรกขณะรถหยุดและเคลื่อนที่ช้าๆ)",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "cabin",
    descriptionGuide: "ทดสอบการทำงานของแป้นเบรกเท้า และดึงคันเบรกมือเพื่อตรวจเช็คระยะฟรีและการล็อคตัว"
  },
  {
    no: 2,
    name: "แตร",
    standard: "ใช้งานได้ปกติ เสียงดังกังวานชัดเจน ไม่ขาดหาย",
    method: "ใช้หูฟังเสียงการทำงาน (กดทดสอบสวิตช์แตร)",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "cabin",
    descriptionGuide: "กดทดสอบสวิตช์แตรที่พวงมาลัย เสียงต้องดังชัดเจนสม่ำเสมอ"
  },
  {
    no: 3,
    name: "ระดับน้ำในหม้อน้ำ & ถังพักน้ำ",
    standard: "ระดับน้ำไม่ต่ำกว่าขีด min (อยู่ระหว่างขีด FULL - LOW)",
    method: "Ot5 (ตรวจดูด้วยสายตาที่ถังพักน้ำหล่อเย็น)",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ตรวจเช็คขณะเครื่องเย็น ระดับน้ำหล่อเย็นต้องไม่ต่ำกว่าขีด LOW และไม่มีคราบสนิมหรือน้ำมันปน"
  },
  {
    no: 4,
    name: "ระดับน้ำมันเบรกและคลัตช์",
    standard: "ระดับน้ำมันไม่ต่ำกว่าขีด min (อยู่ระหว่างขีด MAX - MIN)",
    method: "ใช้สายตาดูที่กระปุกน้ำมันเบรกและน้ำมันคลัตช์",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "engine",
    descriptionGuide: "ตรวจเช็คระดับน้ำมันเบรกและน้ำมันคลัตช์ที่กระปุกพักน้ำมัน สีน้ำมันต้องใส ไม่ดำขุ่น"
  },
  {
    no: 5,
    name: "แบตเตอรี่ & ขั้วแบต",
    standard: "สะอาด ไม่มีขี้เกลือ ระดับน้ำกลั่นไม่ต่ำกว่าขีด min ขั้วแน่น",
    method: "Et3 (ตรวจระดับน้ำกลั่นและความแน่นของขั้วแบตเตอรี่)",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "underbody",
    descriptionGuide: "ตรวจความสะอาดของเปลือกแบตเตอรี่ ขั้วบวก-ลบต้องแน่นสนิท ไม่มีคราบขี้เกลือ และระดับน้ำกรด/น้ำกลั่นพอดี"
  },
  {
    no: 6,
    name: "สายพานพัดลม & สายพานหน้าเครื่อง",
    standard: "กดแล้วยุบลงไม่มากกว่า 2 cm. ไม่แตกลายงาหรือมีรอยฉีกขาด",
    method: "E5 (ใช้นิ้วมือกดตรงกึ่งกลางสายพานระหว่างพูลเลย์)",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ดับเครื่องยนต์แล้วใช้นิ้วมือกดกึ่งกลางสายพาน ความตึงต้องยุบตัวได้ 10-15 มม. (ไม่เกิน 2 ซม.)"
  },
  {
    no: 7,
    name: "ยางรถและแรงดันลมยาง",
    standard: "ไม่รั่วซึม ความดันตามมาตรฐาน 110-120 PSI (6.75-8.5 บาร์) ยางไม่บวม",
    method: "W1 (ใช้เกจวัดลมยาง หรือเคาะฟังเสียงยางทุกล้อ)",
    frequency: "1 ครั้ง/วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "ตรวจเช็คลมยางทั้งล้อหน้า ล้อขับเคลื่อน และล้อพ่วง ตรวจดูรอยบวม รอยฉีกขาดที่แก้มยาง"
  },
  {
    no: 8,
    name: "พื้นกระบะ / พื้นตู้คอนเทนเนอร์",
    standard: "สะอาด ไม่มีสิ่งของตกหล่น ขยะ หรือวัตถุมีคม พื้นไม่ยุบพัง",
    method: "ใช้สายตาดูและกวาดทำความสะอาดก่อนเริ่มงาน",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "cargo",
    descriptionGuide: "ตรวจดูความสะอาดและความแข็งแรงของพื้นกระบะ/ตู้ทึบ ไม่มีเศษหิน ไม้ หรือตะปูที่อาจทำให้สินค้าเสียหาย"
  },
  {
    no: 9,
    name: "ปากนกแก้ว & สลักล็อคกระบะท้าย",
    standard: "ใช้งานได้ปกติ ล็อคแน่นหนา ป้องกันฝาท้ายเปิดขณะวิ่ง",
    method: "ใช้สายตาดูและทดสอบโยกสลักล็อค",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "rear",
    descriptionGuide: "ตรวจสอบมือจับและสลักล็อคปากนกแก้วฝาท้ายกระบะ ต้องล็อคแน่นและมีสลักนิรภัยกันคลาย"
  },
  {
    no: 10,
    name: "ผ้าใบคลุม & เชือกผูกรัด",
    standard: "ไม่มีรูรั่ว ไม่ฉีกขาด เชือกรัดแน่นหนาพร้อมใช้งาน",
    method: "Ot3 (ตรวจสภาพผ้าใบและการยึดรัด)",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "cargo",
    descriptionGuide: "ตรวจสอบผ้าใบคลุมสินค้า ไม่มีรอยรั่วซึมที่อาจทำให้น้ำฝนเข้า และเชือกผูกรัดอยู่ในสภาพเหนียวแน่น"
  },
  {
    no: 11,
    name: "ลูกปืนล้อ & ดุมล้อ",
    standard: "ไม่แตก ไม่สึกหรอ ไม่มีคราบจารบีหรือน้ำมันเฟืองท้ายเยิ้ม",
    method: "W2 (ตรวจดูคราบน้ำมันที่ฝาดุมล้อ และฟังเสียงขณะเคลื่อนที่)",
    frequency: "1 ครั้ง/วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "ตรวจเช็คฝาครอบดุมล้อ ต้องไม่มีคราบน้ำมันหรือจารบีไหลเยิ้ม และไม่มีความร้อนสะสมผิดปกติหลังวิ่ง"
  },
  {
    no: 12,
    name: "น็อตล้อ & น็อตยึดกะทะล้อ",
    standard: "ไม่ขาด ครบทุกตัว ขันแน่นตามแรงบิดมาตรฐาน ไม่มีรอยสนิมแดงรอบเกลียว",
    method: "W3 (ใช้ประแจเคาะหรือขันกวดเช็คความแน่น)",
    frequency: "1 ครั้ง/10 วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "เคาะฟังเสียงน็อตล้อทุกล้อ ต้องแน่นสนิทและมีแหวนล็อกครบถ้วน ไม่มีรอยแตกร้าวที่รูน็อต"
  },
  {
    no: 13,
    name: "วาล์วเครื่องยนต์ & เสียงการทำงาน",
    standard: "ค่าระยะห่างวาล์วเท่ากับฟิลเลอร์เกจ #16 เสียงเครื่องยนต์เดินเรียบ ไม่ดังผิดปกติ",
    method: "E2 (ฟังเสียงการทำงานของวาล์วขณะเดินเบาและเร่งเครื่อง)",
    frequency: "1 ครั้ง/15 วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ฟังเสียงฝาวาล์วขณะสตาร์ทเครื่องยนต์ ต้องไม่มีเสียงเคาะกระแทกผิดปกติของกระเดื่องวาล์ว"
  },
  {
    no: 14,
    name: "ระดับน้ำมันเครื่อง",
    standard: "ระดับน้ำมันอยู่ระหว่างขีด F และ L (ไม่ต่ำกว่า L) สีไม่ดำข้นเหนียว",
    method: "ดึงก้านวัดระดับน้ำมันเครื่อง เช็ดให้สะอาด เสียบกลับแล้วดึงมาดู",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ตรวจเช็คขณะจอดบนพื้นราบและดับเครื่องยนต์อย่างน้อย 5 นาที ระดับน้ำมันต้องอยู่ระหว่าง F และ L"
  },
  {
    no: 15,
    name: "ถังลมเบรก & การถ่ายน้ำออกจากถังลม",
    standard: "ดึงห่วงก๊อกถ่ายน้ำเพื่อระบายน้ำและตะกอนออกจากถังลมทุกลูก",
    method: "ดึงห่วงก๊อกถ่ายน้ำใต้ถังลมจนมีแต่ลมออกมา ไม่มีน้ำพุ่ง",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "underbody",
    descriptionGuide: "ดึงห่วงระบายน้ำใต้ถังลมเบรกเพื่อป้องกันน้ำสะสมเข้าไปกัดกร่อนวาล์วเบรกและหม้อลม"
  },
  {
    no: 16,
    name: "ระบบไฟส่องสว่าง & ไฟสัญญาณรอบคัน",
    standard: "ไฟหน้า (สูง/ต่ำ), ไฟหรี่, ไฟเลี้ยวซ้าย-ขวา, ไฟเบรก, ไฟถอย, ไฟฉุกเฉิน, ไฟป้ายทะเบียน ติดครบทุกดวง",
    method: "เปิดสวิตช์ไฟทุกตำแหน่งแล้วเดินวนตรวจเช็ครอบคันรถ",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "front",
    descriptionGuide: "ตรวจเช็คหลอดไฟส่องสว่าง โคมไฟไม่แตก ฝุ่นไม่เกาะหนา และจังหวะไฟเลี้ยวเป็นปกติ"
  },
  {
    no: 17,
    name: "พวงมาลัยและระบบบังคับเลี้ยว",
    standard: "ระยะฟรีพวงมาลัย 30-50 มม. หมุนเลี้ยวได้คล่องตัว ไม่ดึงซ้าย/ขวาขณะวิ่ง",
    method: "ทดสอบโยกพวงมาลัยซ้าย-ขวาขณะจอด และสังเกตการคืนตัว",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "cabin",
    descriptionGuide: "ตรวจเช็คระยะฟรีของพวงมาลัย ข้อยึดคันส่ง-คันชัก และกระปุกพวงมาลัยพาวเวอร์"
  },
  {
    no: 18,
    name: "ทัศนวิสัย / กระจกมองข้าง & ใบปัดน้ำฝน",
    standard: "กระจกบังลมหน้าสะอาด ไม่แตกร้าว กระจกมองข้างปรับมุมมองชัดเจน ก้านปัดปัดสะอาดและน้ำฉีดออกปกติ",
    method: "ตรวจดูด้วยสายตาและทดลองฉีดน้ำล้างกระจก",
    frequency: "1 ครั้ง/วัน",
    category: "visibility",
    diagramZone: "front",
    descriptionGuide: "ทำความสะอาดกระจกหน้าและกระจกมองข้าง เติมน้ำในกระปุกฉีดกระจก และตรวจยางใบปัดน้ำฝนไม่ฉีกขาด"
  },
  {
    no: 19,
    name: "เกจวัดหน้าปัด & แรงดันลม & ความร้อน",
    standard: "เกจวัดแรงดันลม 7-9 บาร์, เกจความร้อนไม่เกินกึ่งกลาง, ไม่มีไฟเตือน Check Engine หรือ Brake ค้าง",
    method: "สังเกตเกจวัดและไฟเตือนหน้าปัดหลังสตาร์ทเครื่องยนต์ 1 นาที",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "cabin",
    descriptionGuide: "ตรวจเช็คแรงดันลมเบรกต้องขึ้นตามเกณฑ์ปกติ เกจความร้อนและเกจแรงดันน้ำมันเครื่องทำงานสมบูรณ์"
  },
  {
    no: 20,
    name: "อุปกรณ์ความปลอดภัยฉุกเฉิน",
    standard: "ถังดับเพลิงเข็มอยู่แถบเขียว, ป้ายสามเหลี่ยมสะท้อนแสง, หนุนล้อ, แม่แรง และประแจล้อพร้อมใช้งาน",
    method: "ตรวจนับและตรวจสอบเกจวัดถังดับเพลิงประจำรถ",
    frequency: "1 ครั้ง/วัน",
    category: "safety",
    diagramZone: "cabin",
    descriptionGuide: "ตรวจเช็คอุปกรณ์ความปลอดภัยฉุกเฉินประจำรถตามมาตรฐานความปลอดภัยกรมการขนส่งและ ISO 39001"
  },
  {
    no: 21,
    name: "ตรวจรอยรั่วซึมใต้ท้องรถ",
    standard: "ไม่มีคราบน้ำมันเครื่อง น้ำมันเกียร์ น้ำมันเฟืองท้าย หรือน้ำหล่อเย็น หยดลงพื้น",
    method: "ก้มมองตรวจใต้ท้องรถและบริเวณพื้นจอด",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "underbody",
    descriptionGuide: "ก้มตรวจใต้ท้องรถบริเวณแคร้งน้ำมันเครื่อง เสื้อเกียร์ เฟืองท้าย และท่อยางระบบน้ำ ไม่มีรอยรั่วหยด"
  }
];

export const INSPECTION_CATEGORIES_CONFIG = {
  engine: { label: "เครื่องยนต์ & ของเหลว", color: "text-amber-400 bg-amber-950/40 border-amber-500/30" },
  brake: { label: "ระบบเบรก & ลมเบรก", color: "text-rose-400 bg-rose-950/40 border-rose-500/30" },
  visibility: { label: "ทัศนวิสัย & กระจก", color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30" },
  tires: { label: "ยาง & ล้อ & น็อต", color: "text-blue-400 bg-blue-950/40 border-blue-500/30" },
  electrical: { label: "ระบบไฟ & แตร & เกจ", color: "text-yellow-400 bg-yellow-950/40 border-yellow-500/30" },
  safety: { label: "อุปกรณ์ความปลอดภัย", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30" },
  bodywork: { label: "ตัวถัง พื้นกระบะ & ผ้าใบ", color: "text-purple-400 bg-purple-950/40 border-purple-500/30" }
};

// Generate default check results for a vehicle (all pass or with custom defects)
export function createDefaultInspectionResults(defects: { itemNo: number; description: string }[] = []): DailyInspectionCheckResult[] {
  return DAILY_INSPECTION_ITEMS_TEMPLATE.map((tpl) => {
    const defect = defects.find((d) => d.itemNo === tpl.no);
    if (defect) {
      return {
        itemId: tpl.no,
        no: tpl.no,
        name: tpl.name,
        standard: tpl.standard,
        method: tpl.method,
        frequency: tpl.frequency,
        category: tpl.category,
        status: "fail" as InspectionCheckStatus,
        hasIssue: true,
        issueDescription: defect.description,
        issueUrgency: "high",
        remark: "พบปัญหาตรวจเช็คประจำวัน"
      };
    }
    return {
      itemId: tpl.no,
      no: tpl.no,
      name: tpl.name,
      standard: tpl.standard,
      method: tpl.method,
      frequency: tpl.frequency,
      category: tpl.category,
      status: "pass" as InspectionCheckStatus,
      hasIssue: false
    };
  });
}

// Initial Sample Daily Inspection Records for August 2026
export const INITIAL_DAILY_INSPECTIONS: DailyVehicleInspectionRecord[] = [
  {
    id: "DCI-20260830-001",
    docNumber: "DCI-2026-0830-001",
    isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
    date: "2026-08-30",
    time: "07:15",
    vehicleId: "v1",
    licensePlate: "70-1234",
    erpNo: "TRK-001",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "ISUZU",
    vehicleModel: "GXZ 360",
    vehicleType: "tractor_10w",
    department: "ขนส่งภาคกลาง",
    driverName: "สมหมาย ขับขี่ดี",
    driverPhone: "081-234-5678",
    inspectorName: "วิชัย ตรวจละเอียด",
    inspectorPhone: "089-987-6543",
    currentMileage: 185420,
    startMileage: 185420,
    overallStatus: "pass",
    defectCount: 0,
    results: createDefaultInspectionResults(),
    notes: "ตรวจสภาพก่อนออกวิ่งงานรอบเช้า 08:00 น. สภาพรถสมบูรณ์ 100%",
    locationName: "ศูนย์กระจายสินค้า TNB ลาดกระบัง",
    createdAt: "2026-08-30T07:15:00.000Z",
    updatedAt: "2026-08-30T07:15:00.000Z"
  },
  {
    id: "DCI-20260830-002",
    docNumber: "DCI-2026-0830-002",
    isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
    date: "2026-08-30",
    time: "07:30",
    vehicleId: "v2",
    licensePlate: "70-5678",
    erpNo: "TRK-002",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "HINO",
    vehicleModel: "Victor 500",
    vehicleType: "tractor_10w",
    department: "ขนส่งภาคเหนือ",
    driverName: "บุญมี มีสุข",
    driverPhone: "082-345-6789",
    inspectorName: "วิชัย ตรวจละเอียด",
    inspectorPhone: "089-987-6543",
    currentMileage: 142350,
    startMileage: 142350,
    overallStatus: "fail",
    defectCount: 1,
    results: createDefaultInspectionResults([
      { itemNo: 16, description: "ไฟเลี้ยวขวาด้านท้ายขาด ไม่กระพริบ โคมมีฝ้าไอน้ำเข้า" }
    ]),
    notes: "พบไฟเลี้ยวท้ายขวาไม่ติด ส่งเปิดใบแจ้งซ่อมด่วน REP-2026-0801",
    ticketCreated: true,
    ticketNumber: "REP-2026-0801",
    locationName: "ศูนย์กระจายสินค้า TNB ลาดกระบัง",
    createdAt: "2026-08-30T07:30:00.000Z",
    updatedAt: "2026-08-30T07:30:00.000Z"
  },
  {
    id: "DCI-20260830-003",
    docNumber: "DCI-2026-0830-003",
    isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
    date: "2026-08-30",
    time: "07:45",
    vehicleId: "v3",
    licensePlate: "71-2345",
    erpNo: "TRK-003",
    province: "ชลบุรี",
    vehicleBrand: "ISUZU",
    vehicleModel: "Deca 360",
    vehicleType: "tractor_10w",
    department: "ขนส่งภาคตะวันออก",
    driverName: "สมศักดิ์ มั่นคง",
    driverPhone: "083-456-7890",
    inspectorName: "พรชัย ตรวจสอบไว",
    inspectorPhone: "087-111-2233",
    currentMileage: 95800,
    startMileage: 95800,
    overallStatus: "pass",
    defectCount: 0,
    results: createDefaultInspectionResults(),
    notes: "ตรวจสภาพความพร้อมก่อนวิ่งท่าเรือแหลมฉบัง ปกติทุกรายการ",
    locationName: "สาขาแหลมฉบัง ชลบุรี",
    createdAt: "2026-08-30T07:45:00.000Z",
    updatedAt: "2026-08-30T07:45:00.000Z"
  },
  {
    id: "DCI-20260829-001",
    docNumber: "DCI-2026-0829-001",
    isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
    date: "2026-08-29",
    time: "07:20",
    vehicleId: "v1",
    licensePlate: "70-1234",
    erpNo: "TRK-001",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "ISUZU",
    vehicleModel: "GXZ 360",
    vehicleType: "tractor_10w",
    department: "ขนส่งภาคกลาง",
    driverName: "สมหมาย ขับขี่ดี",
    inspectorName: "วิชัย ตรวจละเอียด",
    currentMileage: 185100,
    overallStatus: "pass",
    defectCount: 0,
    results: createDefaultInspectionResults(),
    locationName: "ศูนย์กระจายสินค้า TNB ลาดกระบัง",
    createdAt: "2026-08-29T07:20:00.000Z",
    updatedAt: "2026-08-29T07:20:00.000Z"
  },
  {
    id: "DCI-20260829-002",
    docNumber: "DCI-2026-0829-002",
    isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
    date: "2026-08-29",
    time: "07:40",
    vehicleId: "v4",
    licensePlate: "71-6789",
    erpNo: "TRK-004",
    province: "สมุทรปราการ",
    vehicleBrand: "FUSO",
    vehicleModel: "Super Great",
    vehicleType: "tractor_10w",
    department: "ขนส่งภาคกลาง",
    driverName: "อนุชา ปลอดภัย",
    inspectorName: "วิชัย ตรวจละเอียด",
    currentMileage: 210400,
    overallStatus: "fail",
    defectCount: 1,
    results: createDefaultInspectionResults([
      { itemNo: 7, description: "ลมยางล้อหลังซ้ายด้านนอกต่ำ 85 PSI มีเศษตะปูปักที่ร่องยาง" }
    ]),
    notes: "ปะยางเรียบร้อยก่อนออกเดินทาง",
    locationName: "ศูนย์กระจายสินค้า TNB ลาดกระบัง",
    createdAt: "2026-08-29T07:40:00.000Z",
    updatedAt: "2026-08-29T07:40:00.000Z"
  }
];
