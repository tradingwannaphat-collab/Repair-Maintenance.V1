import { CategoryMeta, StatusMeta, RepairCategory, RepairStatus, SubCategoryMeta } from "../types";

export const CATEGORIES_CONFIG: Record<RepairCategory, CategoryMeta> = {
  suspension: {
    id: "suspension",
    nameTh: "ระบบช่วงล่าง & เบรก",
    nameEn: "Suspension & Brakes",
    iconName: "ShieldAlert",
    color: "#e11d48",
    bgLight: "bg-rose-50",
    borderColor: "border-rose-200 text-rose-700",
    description: "โช้คอัพ, ลูกหมาก, จานเบรก, ผ้าเบรก, เพลาขับ, ศูนย์ล้อ, พวงมาลัยสั่น",
    commonSymptoms: [
      "เบรกแล้วมีเสียงดังเอี๊ยด หรือแป้นเบรกลึกผิดปกติ",
      "พวงมาลัยสั่นเวลาขับขี่ความเร็วสูงหรือเบรก",
      "มีเสียงดังกุกกักเมื่อขับตกหลุมหรือทางขรุขระ",
      "รถกินซ้าย/กินขวา ปล่อยมือแล้วเป๋",
      "โช้คอัพมีคราบน้ำมันรั่วซึม ยวบยาบไม่เกาะถนน"
    ],
    subCategories: [
      { id: "sus-brakes", nameTh: "ระบบเบรก & จานเบรก & ผ้าเบรก", nameEn: "Brake Pads, Rotors & Calipers", description: "เปลี่ยนผ้าเบรก เจียรจานเบรก ตรวจเช็คปั๊มเบรกและสายอ่อน" },
      { id: "sus-shocks", nameTh: "โช้คอัพ & สปริง & เบ้าโช้ค", nameEn: "Shock Absorbers & Springs", description: "โช้คอัพรั่วซึม สปริงล้า ยางกันกระแทก และลูกปืนเบ้าโช้ค" },
      { id: "sus-bushings", nameTh: "ลูกหมาก & บูชปีกนก & ยางกันโคลง", nameEn: "Ball Joints, Bushings & Sway Bars", description: "ลูกหมากคันชัก-คันส่ง ลูกหมากปีกนก บูชยางฉีกขาด" },
      { id: "sus-steering", nameTh: "แร็คพวงมาลัย & เพลาขับหน้า/หลัง", nameEn: "Steering Rack, Tie Rods & Drive Shafts", description: "แร็คพวงมาลัยรั่ว ยางหุ้มเพลาขับฉีกขาด ลูกปืนล้อมีเสียงหึ่ง" },
      { id: "sus-alignment", nameTh: "ตั้งศูนย์ล้อ & ถ่วงล้อ", nameEn: "Wheel Alignment & Geometry", description: "ตรวจเช็คมุมโท มุมแคมเบอร์ แก้ปัญหารถกินซ้าย/ขวา" }
    ]
  },
  lubricant: {
    id: "lubricant",
    nameTh: "ระบบหล่อลื่น & ของเหลว",
    nameEn: "Lubricants & Fluids",
    iconName: "Droplets",
    color: "#d97706",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200 text-amber-700",
    description: "น้ำมันเครื่อง, กรองน้ำมัน, น้ำมันเกียร์, น้ำมันเบรก, น้ำมันพาวเวอร์, น้ำยาหล่อเย็น",
    commonSymptoms: [
      "ถึงรอบเปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง",
      "ไฟเตือนแรงดันน้ำมันเครื่องโชว์หน้าปัด",
      "มีรอยหยดน้ำมันเครื่อง/น้ำมันเกียร์ใต้ท้องรถ",
      "น้ำยาหล่อเย็นหม้อน้ำลดระดับเร็วกว่าปกติ",
      "น้ำมันเบรกหรือน้ำมันคลัตช์สีคล้ำผิดปกติ"
    ],
    subCategories: [
      { id: "lub-engine-oil", nameTh: "น้ำมันเครื่อง & ไส้กรองน้ำมันเครื่อง", nameEn: "Engine Oil & Filter Change", description: "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์แท้ พร้อมไส้กรองและแหวนรอง" },
      { id: "lub-gear-oil", nameTh: "น้ำมันเกียร์ & น้ำมันเฟืองท้าย", nameEn: "Transmission & Differential Fluid", description: "เปลี่ยนถ่าย/ฟลัชชิ่งน้ำมันเกียร์อัตโนมัติ ATF/CVT และน้ำมันเฟืองท้าย" },
      { id: "lub-coolant", nameTh: "น้ำยาหล่อเย็นหม้อน้ำ & ฟลัชหม้อน้ำ", nameEn: "Radiator Coolant Flush", description: "เติม/เปลี่ยนน้ำยาหล่อเย็นป้องกันสนิมและลดความร้อนสะสม" },
      { id: "lub-brake-fluid", nameTh: "น้ำมันเบรก & น้ำมันคลัตช์ (DOT 4/5.1)", nameEn: "Brake & Clutch Fluid", description: "ไล่ลมระบบเบรก เปลี่ยนถ่ายน้ำมันเบรกป้องกันฟองอากาศ" },
      { id: "lub-power-hydraulics", nameTh: "น้ำมันพาวเวอร์ & น้ำมันไฮดรอลิก (รถยก/กระบะยก)", nameEn: "Power Steering & Hydraulic Fluids", description: "ตรวจเช็คระดับน้ำมันพาวเวอร์และระบบกระบอกสูบไฮดรอลิก" }
    ]
  },
  lighting: {
    id: "lighting",
    nameTh: "ระบบแสงสว่าง & ไฟฟ้า",
    nameEn: "Lighting & Electrical",
    iconName: "Lightbulb",
    color: "#eab308",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200 text-yellow-700",
    description: "ไฟหน้า, ไฟท้าย, ไฟเบรก, ไฟเลี้ยว, แบตเตอรี่, ไดสตาร์ท, ไดชาร์จ, ฟิวส์",
    commonSymptoms: [
      "ไฟหน้า/ไฟสูง/ไฟต่ำ ไม่ติด 1 หรือ 2 ข้าง",
      "ไฟท้าย หรือไฟเบรกขาด ไม่สว่างเวลาแตะเบรก",
      "ไฟเลี้ยวกะพริบเร็วผิดปกติ หรือไม่ทำงาน",
      "สตาร์ทติดยาก เสียงไดสตาร์ทอืด แบตเตอรี่เสื่อม",
      "ไฟเตือนระบบไดชาร์จ (รูปแบตเตอรี่) โชว์ค้าง"
    ],
    subCategories: [
      { id: "light-headlight", nameTh: "ไฟหน้า / ไฟสูง / ไฟตัดหมอก", nameEn: "Headlights & Fog Lights", description: "เปลี่ยนหลอดไฟ LED/Halogen ปรับระดับลำแสง ขัดโคมไฟหน้าเหลือง" },
      { id: "light-tail-brake", nameTh: "ไฟท้าย / ไฟเบรก / ไฟถอย / ไฟเลี้ยว", nameEn: "Tail, Brake & Turn Signal Lights", description: "ตรวจเช็คขั้วหลอด หลอดไฟท้ายขาด แผงไฟเบรกดวงที่สาม" },
      { id: "light-battery", nameTh: "แบตเตอรี่ & ขั้วแบต & สายดิน", nameEn: "Battery & Terminals", description: "ตรวจวัดค่า CCA เปลี่ยนแบตเตอรี่ใหม่ ล้างขี้เกลือขั้วแบต" },
      { id: "light-alternator", nameTh: "ไดชาร์จ & ไดสตาร์ท", nameEn: "Alternator & Starter Motor", description: "ตรวจวัดแรงดันไฟชาร์จ แปลงถ่านไดสตาร์ท รีเลย์สตาร์ท" },
      { id: "light-fuse-wiring", nameTh: "ฟิวส์ & กล่องรีเลย์ & ระบบสายไฟตัวรถ", nameEn: "Fuses, Relays & Harness Wiring", description: "ไล่ระบบไฟช็อต ฟิวส์ขาด เปลี่ยนสายไฟที่กรอบแตก" }
    ]
  },
  engine: {
    id: "engine",
    nameTh: "เครื่องยนต์ & ระบบส่งกำลัง",
    nameEn: "Engine & Transmission",
    iconName: "Zap",
    color: "#4f46e5",
    bgLight: "bg-indigo-50",
    borderColor: "border-indigo-200 text-indigo-700",
    description: "สายพาน, หัวเทียน, หัวฉีด, หม้อน้ำ, ปั๊มน้ำ, เกียร์กระตุก, เสียงดังในห้องเครื่อง",
    commonSymptoms: [
      "ไฟ Check Engine โชว์บนหน้าปัดเรือนไมล์",
      "เครื่องยนต์สะดุด เร่งไม่ขึ้น กำลังตก",
      "เกียร์กระตุกเวลาเข้าเกียร์ D/R หรือเปลี่ยนจังหวะช้า",
      "อุณหภูมิความร้อนขึ้นสูงผิดปกติ (Overheat)",
      "มีควันขาวหรือควันดำออกจากท่อไอเสียปริมาณมาก"
    ],
    subCategories: [
      { id: "eng-ignition", nameTh: "ระบบจุดระเบิด / หัวเทียน / คอยล์จุดระเบิด", nameEn: "Ignition Coils & Spark Plugs", description: "เปลี่ยนหัวเทียน Iridium, คอยล์จุดระเบิด, ล้างหัวฉีดน้ำมันเชื้อเพลิง" },
      { id: "eng-belts", nameTh: "สายพานหน้าเครื่อง & สายพานไทม์มิ่ง & รอกดัน", nameEn: "Drive Belts, Timing Belt & Tensioner", description: "เปลี่ยนสายพานหน้าเครื่องมีเสียงดังเอี๊ยด รอกดันสายพานแตก" },
      { id: "eng-cooling", nameTh: "หม้อน้ำ / ปั๊มน้ำ / วาล์วน้ำ / พัดลมหม้อน้ำ", nameEn: "Radiator, Water Pump & Thermostat", description: "ซ่อมหม้อน้ำรั่ว เปลี่ยนวาล์วน้ำ มอเตอร์พัดลมระบายความร้อน" },
      { id: "eng-transmission", nameTh: "ระบบคลัตช์ & เกียร์ & สมองกลเกียร์ TCU", nameEn: "Clutch System & Transmission", description: "เปลี่ยนชุดคลัตช์ ซ่อมเกียร์กระตุก โซลินอยด์วาล์วเกียร์" },
      { id: "eng-air-fuel", nameTh: "กรองอากาศ / ปีกผีเสื้อ / เซ็นเซอร์ไอเสีย O2", nameEn: "Air Intake, Throttle Body & Sensors", description: "ล้างลิ้นปีกผีเสื้อ เปลี่ยนกรองอากาศ เซ็นเซอร์ Air Flow / O2" }
    ]
  },
  tires: {
    id: "tires",
    nameTh: "ยาง & ล้อ",
    nameEn: "Tires & Wheels",
    iconName: "CircleDot",
    color: "#0891b2",
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-200 text-cyan-700",
    description: "ปะยาง, สลับยาง, เปลี่ยนยางชุดใหม่, ยางบวม, ล้อแม็กดุ้ง, ถ่วงล้อ",
    commonSymptoms: [
      "ยางรั่วซึม ลมยางอ่อนผิดปกติ ต้องเติมบ่อย",
      "ดอกยางสึกถึงสะพานยาง หรือยางกินข้าง",
      "ยางบวม ยางแตกลายงา หรือมีรอยบาดแก้มยาง",
      "ถึงระยะสลับยางและถ่วงล้อประจำรอบ (10,000 กม.)",
      "รถมีอาการเหินน้ำเมื่อขับขี่ขณะฝนตก"
    ],
    subCategories: [
      { id: "tire-replacement", nameTh: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)", nameEn: "New Tire Replacement", description: "เปลี่ยนยางรถยนต์มาตรฐานตามเบอร์และดัชนีรับน้ำหนัก" },
      { id: "tire-puncture", nameTh: "ปะยาง (แทงใยไหม / สตรีมร้อน-เย็น)", nameEn: "Puncture Repair & Patching", description: "ปะรูรั่วจากตะปูตำ เศษเหล็กบาดหน้ายาง" },
      { id: "tire-rotation", nameTh: "สลับยาง & ถ่วงล้อ 4 ล้อ", nameEn: "Tire Rotation & High-Speed Balancing", description: "สลับตำแหน่งยางหน้า-หลัง ถ่วงตะกั่วแก้อาการพวงมาลัยสั่น" },
      { id: "tire-rim-tpms", nameTh: "จุ๊บลม / เซ็นเซอร์ลมยาง TPMS / ซ่อมแม็กดุ้ง", nameEn: "Valves, TPMS Sensors & Rim Repair", description: "เปลี่ยนจุ๊บลมยาง ซ่อมรอยดัดคดวงล้อแม็ก เซ็นเซอร์วัดลมยาง" }
    ]
  },
  aircon: {
    id: "aircon",
    nameTh: "ระบบปรับอากาศ & แอร์",
    nameEn: "Air Conditioning",
    iconName: "Fan",
    color: "#0284c7",
    bgLight: "bg-sky-50",
    borderColor: "border-sky-200 text-sky-700",
    description: "แอร์ไม่เย็น, ล้างตู้แอร์, เติมน้ำยาแอร์, กรองแอร์ PM2.5, คอมเพรสเซอร์, พัดลมแอร์",
    commonSymptoms: [
      "แอร์มีแต่ลมร้อน ไม่มีไอเย็น หรือเย็นเฉพาะตอนรถวิ่ง",
      "มีกลิ่นอับชื้น หรือกลิ่นไหม้ออกมาจากช่องแอร์",
      "พัดลมแอร์มีเสียงดังผิดปกติ ลมเบาแม้ปรับระดับสูงสุด",
      "มีน้ำแอร์หยดลงพื้นฝั่งผู้โดยสารด้านหน้า",
      "คอมเพรสเซอร์แอร์ตัดต่อบ่อย หรือมีเสียงดังแก๊กๆ"
    ],
    subCategories: [
      { id: "ac-refrigerant", nameTh: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf", nameEn: "Refrigerant Leak Test & Recharge", description: "แวคคั่มระบบ เติมน้ำยาแอร์และน้ำมันคอมเพรสเซอร์" },
      { id: "ac-compressor", nameTh: "คอมเพรสเซอร์แอร์ & คลัตช์คอมแอร์", nameEn: "AC Compressor & Magnetic Clutch", description: "เปลี่ยนหน้าคลัตช์คอมแอร์ ซ่อม/เปลี่ยนคอมเพรสเซอร์ใหม่" },
      { id: "ac-cleaning", nameTh: "ล้างตู้แอร์ (แบบส่องกล้อง / ถอดตู้) & กรอง PM2.5", nameEn: "Evaporator Cleaning & Cabin Filter", description: "ล้างทำความสะอาดคอยล์เย็น ฆ่าเชื้อโรค เปลี่ยนกรองอากาศแอร์" },
      { id: "ac-blower-fan", nameTh: "โบลเวอร์พัดลมแอร์ & คอยล์ร้อนหน้ารถ", nameEn: "Blower Motor & Condenser Fan", description: "เปลี่ยนมอเตอร์พัดลมแอร์ แผงระบายความร้อนหน้ารถ" }
    ]
  },
  bodywork: {
    id: "bodywork",
    nameTh: "ตัวถัง สี & กระจก",
    nameEn: "Body, Glass & Paint",
    iconName: "Car",
    color: "#7c3aed",
    bgLight: "bg-violet-50",
    borderColor: "border-violet-200 text-violet-700",
    description: "เคาะพ่นสี, ริ้วรอยเฉี่ยวชน, กระจกหน้าแตกร้าว, ใบปัดน้ำฝน, กลอนล็อคประตู, กันชนหน้า-หลัง",
    commonSymptoms: [
      "มีรอยเฉี่ยวชน รอยบุบ หรือแผลขูดขีดรอบตัวถัง",
      "กระจกหน้ารถมีรอยสะเก็ดหินแตกร้าว",
      "ยางใบปัดน้ำฝนเสื่อมสภาพ ปัดสะดุดไม่สะอาด",
      "ประตูหรือฝาท้ายปิดไม่สนิท หรือกลอนล็อคฝืด",
      "กระจกมองข้างพับหรือปรับไฟฟ้าไม่ทำงาน"
    ],
    subCategories: [
      { id: "body-paint-dent", nameTh: "เคาะ ดึงรอยบุบ & พ่นสี 2K อบความร้อน", nameEn: "Dent Removal & 2K Paint Work", description: "ซ่อมสีรอบคัน ชิ้นงานกันชน ประตู ซุ้มล้อ ฝากระโปรง" },
      { id: "body-glass", nameTh: "กระจกบังลมหน้า / กระจกข้างแตกร้าว", nameEn: "Windshield & Window Glass", description: "เปลี่ยนกระจกหน้ารถยนต์ติดฟิล์ม ซ่อมรอยสะเก็ดหินแตก" },
      { id: "body-wipers", nameTh: "ยางใบปัดน้ำฝน & มอเตอร์ฉีดน้ำล้างกระจก", nameEn: "Wiper Blades & Washer Motor", description: "เปลี่ยนยางปัดน้ำฝนซิลิโคน ปรับหัวฉีดน้ำล้างกระจก" },
      { id: "body-doors-locks", nameTh: "กลอนประตู / รางกระจกไฟฟ้า / มือเปิดนอก-ใน", nameEn: "Door Locks, Latches & Power Windows", description: "ซ่อมกระจกตกราง มอเตอร์กระจกไฟฟ้า กลอนประตูฝืด" }
    ]
  },
  inspection: {
    id: "inspection",
    nameTh: "ตรวจเช็คตามระยะทาง (PM)",
    nameEn: "Periodic Maintenance",
    iconName: "CheckCircle2",
    color: "#16a34a",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200 text-emerald-700",
    description: "เช็คระยะ 10,000 / 20,000 / 40,000 / 100,000 กม., ตรวจสภาพรถประจำปี ตรอ.",
    commonSymptoms: [
      "ถึงกำหนดตรวจเช็คระยะรอบ 10,000 กม.",
      "ถึงกำหนดตรวจเช็คระยะใหญ่รอบ 40,000 / 80,000 กม.",
      "ตรวจเช็คสภาพความพร้อมรถก่อนเดินทางไกลประจำแผนก",
      "ตรวจสภาพรถประจำปีเพื่อต่อภาษีและ พ.ร.บ."
    ],
    subCategories: [
      { id: "insp-minor-pm", nameTh: "เช็คระยะย่อย (10,000 / 30,000 / 50,000 กม.)", nameEn: "Minor PM Service (10k/30k/50k km)", description: "ตรวจเช็ค 30 รายการมาตรฐาน เปลี่ยนน้ำมันเครื่อง เช็คลมยางและเบรก" },
      { id: "insp-major-pm", nameTh: "เช็คระยะใหญ่ (40,000 / 80,000 / 100,000 กม.)", nameEn: "Major PM Service (40k/80k/100k km)", description: "ตรวจเช็ค 60+ รายการ เปลี่ยนของเหลวทั้งคัน หัวเทียน ไส้กรองครบชุด" },
      { id: "insp-pretrip", nameTh: "ตรวจความพร้อมก่อนเดินทางไกล (Safety Pre-Trip)", nameEn: "Pre-Trip Safety Inspection", description: "ตรวจเช็คระบบเบรก ไฟส่องสว่าง ยาง ระดับน้ำมันเครื่อง ระบบหล่อเย็น" },
      { id: "insp-annual-tax", nameTh: "ตรวจสภาพรถประจำปี ตรอ. / ต่อภาษี-พ.ร.บ.", nameEn: "Annual Inspection & Roadworthiness", description: "วัดค่าควันดำ ตรวจเบรก ตรวจไฟส่องสว่างเพื่อต่อทะเบียน" }
    ]
  },
  other: {
    id: "other",
    nameTh: "อื่นๆ / อุปกรณ์ส่วนเสริม",
    nameEn: "Other & Accessories",
    iconName: "Wrench",
    color: "#64748b",
    bgLight: "bg-slate-50",
    borderColor: "border-slate-200 text-slate-700",
    description: "กล้องติดหน้ารถ, เครื่องเสียง, เบาะนั่ง, ฟิล์มกรองแสง, กุญแจรีโมท, อุปกรณ์ช่วยเหลือฉุกเฉิน",
    commonSymptoms: [
      "กล้องบันทึกหน้ารถไม่บันทึกภาพ หรือหน้าจอดับ",
      "กุญแจรีโมทถ่านหมด หรือสัญญาณเปิดปิดติดขัด",
      "ฟิล์มกรองแสงพองเป็นฟองอากาศ บดบังทัศนวิสัย",
      "อุปกรณ์ติดเสริมภายในห้องโดยสารชำรุดเสียหาย"
    ],
    subCategories: [
      { id: "oth-dashcam-gps", nameTh: "กล้องติดหน้ารถ / GPS ติดตามรถองค์กร", nameEn: "Dashcam & Fleet GPS Tracking", description: "ติดตั้ง ตรวจเช็คกล้องบันทึกหน้า-หลัง กล่อง GPS และสายไฟ" },
      { id: "oth-window-film", nameTh: "ฟิล์มกรองแสง / ฟิล์มนิรภัย", nameEn: "Window Tinting & Sun Protection", description: "ลอกฟิล์มเก่าที่พองลอก ติดตั้งฟิล์มกันความร้อนบานหน้า-รอบคัน" },
      { id: "oth-remote-key", nameTh: "กุญแจรีโมท / Smart Key / ระบบกันขโมย", nameEn: "Remote Key & Immobilizer", description: "เปลี่ยนถ่านกุญแจ ทำกุญแจสำรอง รีเซ็ตสัญญาณกันขโมย" },
      { id: "oth-safety-gear", nameTh: "อุปกรณ์ความปลอดภัย / ถังดับเพลิง / แม่แรง", nameEn: "Emergency Tools & Safety Gear", description: "ตรวจเช็คถังดับเพลิงติดรถ แม่แรง ป้ายสามเหลี่ยมสะท้อนแสง" }
    ]
  }
};

export const STATUS_CONFIG: Record<RepairStatus, StatusMeta> = {
  pending: {
    id: "pending",
    labelTh: "รอดำเนินการ / รับเรื่องใหม่",
    color: "#f59e0b",
    textColor: "text-amber-700",
    bgColor: "bg-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    stepNumber: 1,
    description: "ระบบรับเรื่องแจ้งซ่อมแล้ว รอหัวหน้าช่างตรวจสอบและจ่ายงาน"
  },
  inspecting: {
    id: "inspecting",
    labelTh: "กำลังตรวจเช็คประเมิน",
    color: "#3b82f6",
    textColor: "text-blue-700",
    bgColor: "bg-blue-500",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-300",
    stepNumber: 2,
    description: "ช่างนำรถขึ้นลิฟต์ตรวจหาสาเหตุ ประเมินรายการอะไหล่และค่าแรง"
  },
  waiting_parts: {
    id: "waiting_parts",
    labelTh: "รออะไหล่ / ขออนุมัติ",
    color: "#8b5cf6",
    textColor: "text-purple-700",
    bgColor: "bg-purple-500",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-300",
    stepNumber: 3,
    description: "สั่งเบิกอะไหล่แท้/รอชิ้นส่วนจัดส่งจากศูนย์บริการ"
  },
  in_progress: {
    id: "in_progress",
    labelTh: "กำลังดำเนินการซ่อม",
    color: "#0284c7",
    textColor: "text-sky-700",
    bgColor: "bg-sky-500",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-300",
    stepNumber: 4,
    description: "ช่างผู้เชี่ยวชาญกำลังทำการถอดเปลี่ยนอะไหล่และปรับจูนระบบ"
  },
  testing: {
    id: "testing",
    labelTh: "ทดสอบคุณภาพ (QC)",
    color: "#059669",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    stepNumber: 5,
    description: "ทดสอบวิ่งจริง เช็คความปลอดภัยรอบคัน และทำความสะอาดก่อนส่งมอบ"
  },
  completed: {
    id: "completed",
    labelTh: "ซ่อมเสร็จสมบูรณ์ / ส่งมอบแล้ว",
    color: "#16a34a",
    textColor: "text-green-700",
    bgColor: "bg-green-600",
    badgeBg: "bg-green-100 text-green-800 border-green-300",
    stepNumber: 6,
    description: "งานซ่อมเสร็จสิ้น 100% พร้อมส่งมอบให้ผู้แจ้งซ่อมนำรถไปใช้งาน"
  },
  cancelled: {
    id: "cancelled",
    labelTh: "ยกเลิกงานซ่อม",
    color: "#6b7280",
    textColor: "text-gray-600",
    bgColor: "bg-gray-400",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-300",
    stepNumber: 0,
    description: "ยกเลิกรายการแจ้งซ่อมเนื่องจากแจ้งซ้ำซ้อนหรือตรวจแล้วไม่มีปัญหา"
  }
};

export const TNB_DEPARTMENTS = [
  "ฝ่ายขนส่ง",
  "ฝ่ายซ่อมบำรุง",
  "ฝ่ายบริหาร",
  "ฝ่ายสำนักงาน",
  "ฝ่ายคลังสินค้า"
] as const;

export type DepartmentName = typeof TNB_DEPARTMENTS[number];

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  all: "ทุกประเภทรถยนต์ (All)",
  tractor_6w: "หัวลาก 6 ล้อ",
  tractor_10w: "หัวลาก 10 ล้อ",
  trailer_2axle: "หาง 2 เพลา",
  trailer_3axle: "หาง 3 เพลา",
  box_truck_6w: "6 ล้อตู้ทึบ",
  jumbo_4w: "4 ล้อจัมโบ้",
  pickup_box: "รถกระบะตู้",
  sedan: "รถเก๋ง",
  forklift: "รถโฟล์คลิฟท์",
  // fallback for compatibility
  truck: "หัวลาก / รถบรรทุก 6-10 ล้อ",
  pickup: "รถกระบะตู้ / ปิ๊กอัพ",
  van: "รถตู้รับส่ง / ขนของ",
  suv: "รถอเนกประสงค์ SUV",
  motorcycle: "รถมอเตอร์ไซค์",
  other: "อื่นๆ"
};

export function getVehicleTypeLabel(vehicleType?: string): string {
  if (!vehicleType) return "ยานพาหนะ";
  return VEHICLE_TYPE_LABELS[vehicleType] || vehicleType;
}

export function getSubCategoryName(categoryId: RepairCategory, subCategoryId?: string): string {
  if (!subCategoryId) return "";
  const cat = CATEGORIES_CONFIG[categoryId];
  if (!cat) return subCategoryId;
  const sub = cat.subCategories.find(s => s.id === subCategoryId);
  return sub ? sub.nameTh : subCategoryId;
}

export const POPULAR_VEHICLE_BRANDS = [
  { value: "HINO", label: "HINO (ฮีโน่ - รถบรรทุก/หัวลาก 6-10 ล้อ)", isTruck: true },
  { value: "ISUZU", label: "ISUZU (อีซูซุ - รถบรรทุก/หัวลาก/กระบะ)", isTruck: true },
  { value: "RCK", label: "RCK (หางพ่วง 2-3 เพลา / หางกึ่งพ่วง)", isTrailer: true },
  { value: "MITSUBISHI", label: "MITSUBISHI / FUSO (มิตซูบิชิ / ฟูโซ่)", isTruck: true },
  { value: "SMM", label: "SMM (หางพ่วง / กึ่งพ่วง 3 เพลา)", isTrailer: true },
  { value: "SCANIA", label: "SCANIA (สแกเนีย - หัวลากยุโรป)", isTruck: true },
  { value: "VOLVO", label: "VOLVO (วอลโว่ - หัวลาก)", isTruck: true },
  { value: "TOYOTA", label: "TOYOTA (โตโยต้า - กระบะ/โฟล์คลิฟต์/เก๋ง)" },
  { value: "NISSAN", label: "NISSAN / UD TRUCKS (นิสสัน / ยูดี)" },
  { value: "FORD", label: "FORD (ฟอร์ด - กระบะ/แวน)" },
  { value: "KOMATSU", label: "KOMATSU (โคมัตสุ - รถโฟล์คลิฟต์)" },
  { value: "BYD", label: "BYD (บีวายดี - รถไฟฟ้า EV/โฟล์คลิฟต์)" },
  { value: "MG", label: "MG (เอ็มจี)" },
  { value: "อื่นๆ", label: "อื่นๆ (ระบุเอง)" }
] as const;

export function normalizeVehicleBrand(brand?: string): string {
  if (!brand) return "HINO";
  const b = brand.trim();
  const bUpper = b.toUpperCase();
  if (bUpper.includes("HINO") || b.includes("ฮีโน่")) return "HINO";
  if (bUpper.includes("ISUZU") || b.includes("อีซูซุ")) return "ISUZU";
  if (bUpper.includes("RCK")) return "RCK";
  if (bUpper.includes("MITSUBISHI") || bUpper.includes("FUSO") || b.includes("มิตซู")) return "MITSUBISHI";
  if (bUpper.includes("SMM")) return "SMM";
  if (bUpper.includes("SCANIA") || b.includes("สแกเนีย")) return "SCANIA";
  if (bUpper.includes("VOLVO") || b.includes("วอลโว่")) return "VOLVO";
  if (bUpper.includes("TOYOTA") || b.includes("โตโยต้า")) return "TOYOTA";
  if (bUpper.includes("NISSAN") || bUpper.includes("UD") || b.includes("นิสสัน")) return "NISSAN";
  if (bUpper.includes("FORD") || b.includes("ฟอร์ด")) return "FORD";
  if (bUpper.includes("KOMATSU") || b.includes("โคมัต")) return "KOMATSU";
  if (bUpper.includes("BYD")) return "BYD";
  if (bUpper.includes("MG")) return "MG";
  return b;
}


