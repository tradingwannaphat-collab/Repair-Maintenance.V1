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
    method: "ทดสอบเหยียบแป้นเบรกเท้า และดึงเบรกมือล็อค",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "cabin",
    descriptionGuide: "ทดสอบเหยียบแป้นเบรกขณะรถหยุดและเคลื่อนที่ช้าๆ ตรวจเช็คระยะยุบตัว แป้นเบรกไม่จมหรือหยุ่น และดึงเบรกมือต้องล็อครถอยู่แน่นหนา"
  },
  {
    no: 2,
    name: "แตร",
    standard: "ใช้งานได้ปกติ เสียงดังกังวานชัดเจน ไม่ขาดหาย",
    method: "กดทดสอบสวิตช์แตรที่พวงมาลัยและฟังเสียง",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "cabin",
    descriptionGuide: "กดทดสอบสวิตช์แตรที่พวงมาลัย เสียงต้องดังกังวาน ชัดเจนสม่ำเสมอ ไม่ติดขัดหรือเสียงเบาผิดปกติ"
  },
  {
    no: 3,
    name: "ระดับน้ำในหม้อน้ำ & ถังพักน้ำ",
    standard: "ระดับน้ำไม่ต่ำกว่าขีด min (อยู่ระหว่างขีด FULL - LOW)",
    method: "ตรวจดูระดับน้ำหล่อเย็นที่ถังพักน้ำด้วยสายตา",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ตรวจเช็คขณะเครื่องยนต์เย็น สังเกตระดับน้ำในถังพักหม้อน้ำต้องอยู่ระหว่าง FULL และ LOW น้ำต้องใส ไม่มีคราบสนิมหรือน้ำมันเครื่องปนเปื้อน"
  },
  {
    no: 4,
    name: "ระดับน้ำมันเบรกและคลัตช์",
    standard: "ระดับน้ำมันไม่ต่ำกว่าขีด min (อยู่ระหว่างขีด MAX - MIN)",
    method: "ตรวจดูระดับน้ำมันที่กระปุกเบรกและคลัตช์",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "engine",
    descriptionGuide: "สังเกตระดับน้ำมันในกระปุกพักน้ำมันเบรกและน้ำมันคลัตช์ ต้องอยู่ระหว่างขีด MAX และ MIN น้ำมันต้องมีสีใส ไม่ดำขุ่นหรือลดลงผิดปกติ"
  },
  {
    no: 5,
    name: "แบตเตอรี่ & ขั้วแบต",
    standard: "สะอาด ไม่มีขี้เกลือ ระดับน้ำกลั่นไม่ต่ำกว่าขีด min ขั้วแน่น",
    method: "ตรวจดูขั้วแบต ระดับน้ำกลั่น และความแน่น",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "underbody",
    descriptionGuide: "ตรวจดูขั้วบวกและขั้วลบต้องขันแน่น ไม่โยกคลอน ไม่มีคราบขี้เกลือสีขาว/เขียวเกาะ และระดับน้ำกรด/น้ำกลั่นอยู่ระหว่างขีดกำหนด"
  },
  {
    no: 6,
    name: "สายพานพัดลม & สายพานหน้าเครื่อง",
    standard: "กดแล้วยุบลงไม่มากกว่า 2 cm. ไม่แตกลายงาหรือมีรอยฉีกขาด",
    method: "ใช้นิ้วมือกดตรวจความตึงและรอยแตกลายงา",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "ดับเครื่องยนต์แล้วใช้นิ้วมือกดกึ่งกลางสายพานระหว่างพูลเลย์ สายพานต้องยุบตัวได้ 10-15 มม. (ไม่เกิน 2 ซม.) สภาพสายพานต้องไม่แตกลายงาหรือเปื่อยรุ่ย"
  },
  {
    no: 7,
    name: "ยางรถและแรงดันลมยาง",
    standard: "ไม่รั่วซึม ความดันตามมาตรฐาน 110-120 PSI (6.75-8.5 บาร์) ยางไม่บวม",
    method: "ใช้เกจวัดลมยาง หรือเคาะฟังเสียงยางทุกล้อ",
    frequency: "1 ครั้ง/วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "ใช้เกจวัดแรงดันลมยางทุกล้อ (รวมล้ออะไหล่) หรือใช้ค้อนเคาะฟังเสียงสะท้อน ตรวจดูสภาพดอกยาง ร่องยางไม่มีหินฝัง และแก้มยางไม่บวมปูดหรือฉีกขาด"
  },
  {
    no: 8,
    name: "พื้นกระบะ / พื้นตู้คอนเทนเนอร์",
    standard: "สะอาด ไม่มีสิ่งของตกหล่น ขยะ หรือวัตถุมีคม พื้นไม่ยุบพัง",
    method: "กวาดทำความสะอาดและตรวจดูสภาพพื้นตู้",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "cargo",
    descriptionGuide: "ตรวจดูความสะอาดภายในตู้ทึบหรือกระบะบรรทุก กวาดเศษหิน เศษไม้ ขยะ และตรวจดูพื้นไม้หรือเหล็กต้องไม่ผุพัง ไม่ยุบตัว ไม่มีตะปูโผล่"
  },
  {
    no: 9,
    name: "ปากนกแก้ว & สลักล็อคกระบะท้าย",
    standard: "ใช้งานได้ปกติ ล็อคแน่นหนา ป้องกันฝาท้ายเปิดขณะวิ่ง",
    method: "ตรวจดูสลักล็อคและทดสอบโยกมือจับฝาท้าย",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "rear",
    descriptionGuide: "ทดสอบโยกมือจับและบานพับฝาท้าย ตรวจเช็คสลักล็อคปากนกแก้วทั้งสองข้าง ต้องล็อคได้สนิทแน่นหนา และมีสลักนิรภัย (R-pin) ล็อคกันคลาย"
  },
  {
    no: 10,
    name: "ผ้าใบคลุม & เชือกผูกรัด",
    standard: "ไม่มีรูรั่ว ไม่ฉีกขาด เชือกรัดแน่นหนาพร้อมใช้งาน",
    method: "ตรวจสภาพผ้าใบ ดึงเชือกรัดสินค้าให้ตึง",
    frequency: "1 ครั้ง/วัน",
    category: "bodywork",
    diagramZone: "cargo",
    descriptionGuide: "คลี่ตรวจผ้าใบคลุมสินค้า ต้องไม่มีรูรั่วหรือรอยฉีกขาดที่จะทำให้น้ำฝนรั่วซึม เชือกผูกรัดเหนียวแน่น ไม่เปื่อย และสายรัดสเตย์ (Ratchet Strap) ใช้งานได้สมบูรณ์"
  },
  {
    no: 11,
    name: "ลูกปืนล้อ & ดุมล้อ",
    standard: "ไม่แตก ไม่สึกหรอ ไม่มีคราบจารบีหรือน้ำมันเฟืองท้ายเยิ้ม",
    method: "ตรวจคราบน้ำมันที่ดุมล้อและฟังเสียงขณะวิ่ง",
    frequency: "1 ครั้ง/วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "ตรวจดูฝาครอบดุมล้อทั้งล้อหน้าและล้อหลัง ต้องไม่มีคราบจารบีหรือน้ำมันซึมเยิ้มออกมา หลังวิ่งทดสอบสัมผัสฝาดุมล้อต้องไม่ร้อนจัดผิดปกติ"
  },
  {
    no: 12,
    name: "น็อตล้อ & น็อตยึดกะทะล้อ",
    standard: "ไม่ขาด ครบทุกตัว ขันแน่นตามแรงบิดมาตรฐาน ไม่มีรอยสนิมแดงรอบเกลียว",
    method: "ใช้ค้อนเคาะฟังเสียง หรือใช้ประแจขันกวด",
    frequency: "1 ครั้ง/10 วัน",
    category: "tires",
    diagramZone: "wheel",
    descriptionGuide: "ใช้ค้อนเคาะที่หัวน็อตล้อทุกล้อ เสียงต้องดังกังวานแน่นสนิท น็อตครบทุกตัว ไม่มีตัวใดหลวม คลายตัว หรือมีคราบสนิมแดงไหลออกจากเกลียว"
  },
  {
    no: 13,
    name: "วาล์วเครื่องยนต์ & เสียงการทำงาน",
    standard: "ค่าระยะห่างวาล์วเท่ากับฟิลเลอร์เกจ #16 เสียงเครื่องยนต์เดินเรียบ ไม่ดังผิดปกติ",
    method: "ฟังเสียงการทำงานของเครื่องยนต์ขณะเดินเบา",
    frequency: "1 ครั้ง/15 วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "สตาร์ทเครื่องยนต์และฟังเสียงในห้องเครื่องขณะเดินเบาและเร่งรอบเบาๆ เสียงกระเดื่องวาล์วต้องสม่ำเสมอ ไม่มีเสียงเคาะโลหะกระทบกันดังผิดปกติ"
  },
  {
    no: 14,
    name: "ระดับน้ำมันเครื่อง",
    standard: "ระดับน้ำมันอยู่ระหว่างขีด F และ L (ไม่ต่ำกว่า L) สีไม่ดำข้นเหนียว",
    method: "ดึงก้านวัดเช็ดสะอาด เสียบวัดระดับน้ำมัน",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "engine",
    descriptionGuide: "จอดรถบนพื้นราบ ดับเครื่องยนต์ทิ้งไว้ 3-5 นาที ดึงก้านวัดน้ำมันเครื่องออกมาเช็ดให้สะอาด เสียบกลับลงไปให้สุดแล้วดึงขึ้นมาดู ระดับต้องอยู่ระหว่างขีด F และ L"
  },
  {
    no: 15,
    name: "ถังลมเบรก & การถ่ายน้ำออกจากถังลม",
    standard: "ดึงห่วงก๊อกถ่ายน้ำเพื่อระบายน้ำและตะกอนออกจากถังลมทุกลูก",
    method: "ดึงห่วงก๊อกระบายน้ำใต้ถังลมจนมีแต่ลมออก",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "underbody",
    descriptionGuide: "ดึงห่วงก๊อกระบายน้ำใต้ถังพักลมเบรกทุกลูกวันละ 1 ครั้ง เพื่อไล่น้ำและความชื้นที่สะสมออกจนกระทั่งมีแต่ลมพุ่งออกมา ช่วยป้องกันวาล์วเบรกเกิดสนิม"
  },
  {
    no: 16,
    name: "ระบบไฟส่องสว่าง & ไฟสัญญาณรอบคัน",
    standard: "ไฟหน้า (สูง/ต่ำ), ไฟหรี่, ไฟเลี้ยวซ้าย-ขวา, ไฟเบรก, ไฟถอย, ไฟฉุกเฉิน, ไฟป้ายทะเบียน ติดครบทุกดวง",
    method: "เปิดสวิตช์ไฟทุกดวงแล้วเดินตรวจเช็ครอบคัน",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "front",
    descriptionGuide: "เปิดสวิตช์ไฟหรี่ ไฟหน้า ไฟตัดหมอก ไฟเลี้ยวซ้าย-ขวา และไฟฉุกเฉิน จากนั้นเดินวนรอบตัวรถตรวจดูหลอดไฟทุกดวงต้องติดสว่าง โคมไม่แตก และไฟเบรกทำงานเมื่อเหยียบแป้น"
  },
  {
    no: 17,
    name: "พวงมาลัยและระบบบังคับเลี้ยว",
    standard: "ระยะฟรีพวงมาลัย 30-50 มม. หมุนเลี้ยวได้คล่องตัว ไม่ดึงซ้าย/ขวาขณะวิ่ง",
    method: "ทดสอบโยกพวงมาลัยซ้าย-ขวาเพื่อตรวจระยะฟรี",
    frequency: "1 ครั้ง/วัน",
    category: "brake",
    diagramZone: "cabin",
    descriptionGuide: "จับพวงมาลัยแล้วโยกซ้าย-ขวาเบาๆ ระยะฟรีต้องไม่เกิน 30-50 มม. หมุนพวงมาลัยต้องลื่นไหล ไม่ติดขัด ไม่มีเสียงดัง และเมื่อวิ่งตรงพวงมาลัยต้องไม่ดึงไปข้างใดข้างหนึ่ง"
  },
  {
    no: 18,
    name: "ทัศนวิสัย / กระจกมองข้าง & ใบปัดน้ำฝน",
    standard: "กระจกบังลมหน้าสะอาด ไม่แตกร้าว กระจกมองข้างปรับมุมมองชัดเจน ก้านปัดปัดสะอาดและน้ำฉีดออกปกติ",
    method: "ตรวจกระจกมองข้าง และทดลองฉีดน้ำปัดกระจก",
    frequency: "1 ครั้ง/วัน",
    category: "visibility",
    diagramZone: "front",
    descriptionGuide: "ทำความสะอาดกระจกหน้า กระจกส่องหลัง และกระจกมองข้างทั้ง 2 ฝั่ง ปรับมุมมองให้เห็นล้อหลังชัดเจน ทดสอบฉีดน้ำล้างกระจกและใบปัดน้ำฝนต้องปัดได้เกลี้ยง ไม่สะดุด"
  },
  {
    no: 19,
    name: "เกจวัดหน้าปัด & แรงดันลม & ความร้อน",
    standard: "เกจวัดแรงดันลม 7-9 บาร์, เกจความร้อนไม่เกินกึ่งกลาง, ไม่มีไฟเตือน Check Engine หรือ Brake ค้าง",
    method: "สังเกตเกจวัดและไฟเตือนหน้าปัดหลังสตาร์ท",
    frequency: "1 ครั้ง/วัน",
    category: "electrical",
    diagramZone: "cabin",
    descriptionGuide: "หลังสตาร์ทเครื่องยนต์ สังเกตแรงดันลมเบรกต้องขึ้นถึง 7-9 บาร์ เกจความร้อนต้องไม่เกินครึ่งหนึ่ง และไฟเตือนสีแดง/สีส้มบนหน้าปัด (เช่น Check Engine, ABS, แบตเตอรี่) ต้องดับลง"
  },
  {
    no: 20,
    name: "อุปกรณ์ความปลอดภัยฉุกเฉิน",
    standard: "ถังดับเพลิงเข็มอยู่แถบเขียว, ป้ายสามเหลี่ยมสะท้อนแสง, หนุนล้อ, แม่แรง และประแจล้อพร้อมใช้งาน",
    method: "ตรวจนับและดูเกจวัดถังดับเพลิงประจำรถ",
    frequency: "1 ครั้ง/วัน",
    category: "safety",
    diagramZone: "cabin",
    descriptionGuide: "ตรวจเช็คอุปกรณ์ประจำรถ: ถังดับเพลิง (เข็มวัดแรงดันต้องชี้ในแถบสีเขียวและมีซีลล็อก), ป้ายสามเหลี่ยมสะท้อนแสงฉุกเฉิน, ไม้หนุนล้อ 2 อัน, แม่แรงยกรถ และประแจขันล้อพร้อมด้ามต่อ"
  },
  {
    no: 21,
    name: "ตรวจรอยรั่วซึมใต้ท้องรถ",
    standard: "ไม่มีคราบน้ำมันเครื่อง น้ำมันเกียร์ น้ำมันเฟืองท้าย หรือน้ำหล่อเย็น หยดลงพื้น",
    method: "ก้มส่องไฟตรวจใต้ท้องรถและพื้นจุดที่จอด",
    frequency: "1 ครั้ง/วัน",
    category: "engine",
    diagramZone: "underbody",
    descriptionGuide: "ก้มมองใต้ท้องรถบริเวณอ่างน้ำมันเครื่อง เสื้อเกียร์ เพลากลาง เฟืองท้าย และท่อยางหม้อน้ำ ตรวจดูพื้นจุดที่จอดรถต้องไม่มีรอยหยดของน้ำมันหรือน้ำหล่อเย็น"
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
