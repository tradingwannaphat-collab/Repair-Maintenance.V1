import { VehicleSafetyItemTemplate, VehicleSafetyHandoverRecord } from "../types";

/**
 * มาตรฐานอุปกรณ์ความปลอดภัยที่ต้องจัดให้มีประจำรถขนส่งสินค้า (10 รายการ)
 * อ้างอิงตามข้อกำหนดมาตรฐานความปลอดภัย ISO 39001 / กฎระเบียบบริษัท ทีเอ็นบี โลจิสติกส์
 */
export const VEHICLE_SAFETY_ITEMS_TEMPLATE: VehicleSafetyItemTemplate[] = [
  {
    id: "sec-01",
    itemCode: "SEC-01",
    nameTh: "ที่หนุนล้อ",
    nameEn: "Wheel Chock",
    standardQty: 2,
    unit: "อัน",
    purpose: "หลังจากจอด รับ-ส่งสินค้า วางที่หนุนล้อด้าน หน้า-หลัง ของล้อรถบรรทุกฝั่งคนขับทุกครั้ง ป้องกันรถไหล",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 750,
    specNote: "ยางหนาทึบเสริมใยเหล็ก ขนาด 20x15x12 ซม. ทนทานต่อแรงกด 20 ตัน"
  },
  {
    id: "sec-02",
    itemCode: "SEC-02",
    nameTh: "กรวยจราจร",
    nameEn: "Traffic Cone",
    standardQty: 2,
    unit: "อัน",
    purpose: "วางกรวยจราจรที่ด้านหน้า-หลัง ของรถบรรทุก กรณีเกิดเหตุฉุกเฉิน",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 450,
    specNote: "สีส้มสะท้อนแสง สูง 70 ซม. คาดแถบสะท้อนแสง 3M เกรด Diamond 2 แถบ ฐานยางดำถ่วงน้ำหนัก"
  },
  {
    id: "sec-03",
    itemCode: "SEC-03",
    nameTh: "ถังดับเพลิง",
    nameEn: "Fire Extinguisher",
    standardQty: 1,
    unit: "ถัง",
    purpose: "ใช้ระงับเหตุฉุกเฉิน หากเกิดเพลิงไหม้รถบรรทุก",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 1450,
    specNote: "เคมีแห้ง (Dry Chemical) ชนิด ABC ขนาด 10/15 ปอนด์ มอก. 332-2537 พร้อมเกจวัดแรงดันและขายึดเหล็ก"
  },
  {
    id: "sec-04",
    itemCode: "SEC-04",
    nameTh: "สายรัดสินค้า",
    nameEn: "Cargo Ratchet Strap",
    standardQty: 2,
    unit: "เส้น",
    purpose: "ใช้รัดสินค้าระหว่างขนส่ง ป้องกันสินค้าเสียหาย",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: false, // หัวลากไม่มีสินค้าบนหัว
      pickup: true
    },
    estimatedValueBaht: 650,
    specNote: "โพลีเอสเตอร์ 100% หน้ากว้าง 2 นิ้ว ยาว 6-10 เมตร แรงดึงขาด 5,000 กก. พร้อมหัวก้ามปู Ratchet"
  },
  {
    id: "sec-05",
    itemCode: "SEC-05",
    nameTh: "ไฟฉายสปอร์ตไลท์",
    nameEn: "Spotlight Flashlight",
    standardQty: 1,
    unit: "กระบอก",
    purpose: "ใช้โบกให้สัญญาณ กรณีเกิดเหตุฉุกเฉินเวลากลางคืน",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 550,
    specNote: "LED กำลังสูง 10W ชาร์จไฟบ้าน/ไฟรถ 12V-24V ได้ ส่องสว่างไกลกว่า 300 เมตร พร้อมโหมดไฟกะพริบฉุกเฉิน"
  },
  {
    id: "sec-06",
    itemCode: "SEC-06",
    nameTh: "กุญแจล็อกตู้",
    nameEn: "Container / Door Padlock",
    standardQty: 1,
    unit: "ชุด",
    purpose: "ใช้ล็อกตู้สินค้าป้องกันเมื่อมีการขนสินค้าค้างรอส่งวันต่อไป",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: false,
      pickup: true
    },
    estimatedValueBaht: 480,
    specNote: "แม่กุญแจทองเหลืองแท้ คอยาว ป้องกันการเลื่อยตัด พร้อมลูกกุญแจ 3 ดอก"
  },
  {
    id: "sec-07",
    itemCode: "SEC-07",
    nameTh: "ผ้าใบคลุมสินค้า",
    nameEn: "Tarpaulin with Rope",
    standardQty: 1,
    unit: "ผืน",
    purpose: "ใช้คลุมสินค้าป้องกันสินค้าเปียกฝน",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: false,
      pickup: true
    },
    estimatedValueBaht: 2200,
    specNote: "ผ้าใบคูนิลอนเคลือบ PVC กันน้ำ 100% หนา 0.5 มม. ขนาดตามความยาวกระบะ พร้อมตาไก่ทองเหลืองและเชือกมัด 20 เมตร"
  },
  {
    id: "sec-08",
    itemCode: "SEC-08",
    nameTh: "เสื้อสะท้อนแสง",
    nameEn: "Reflective Safety Vest",
    standardQty: 1,
    unit: "ตัว",
    purpose: "เพื่อให้สามารถมองเห็นได้ชัดเจนในระยะไกล",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 250,
    specNote: "ผ้าตาข่ายสีเขียวนีออน ระบายอากาศดี แถบสะท้อนแสงมาตรฐาน EN 471 กว้าง 2 นิ้ว"
  },
  {
    id: "sec-09",
    itemCode: "SEC-09",
    nameTh: "หมวกนิรภัย",
    nameEn: "Safety Helmet (Hard Hat)",
    standardQty: 1,
    unit: "ใบ",
    purpose: "สวมใส่เพื่อป้องกันศีรษะถูกกระแทกหากมีการเข้าไปตรวจสอบใต้รถบรรทุก",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 380,
    specNote: "พลาสติก ABS เกรด A แข็งแรง ทนแรงกระแทก มอก. 368-2554 พร้อมสายรัดคางแบบ 4 จุด"
  },
  {
    id: "sec-10",
    itemCode: "SEC-10",
    nameTh: "รองเท้านิรภัย",
    nameEn: "Safety Shoes",
    standardQty: 1,
    unit: "คู่",
    purpose: "สวมใส่เพื่อป้องกันเท้าถูกกระแทกหากมีการเข้าไปปฏิบัติงานในจุดเสี่ยง",
    vehicleTypes: {
      sixTenWheel: true,
      tractor: true,
      pickup: true
    },
    estimatedValueBaht: 980,
    specNote: "หัวเหล็กรับแรงกระแทก 200 จูล หนังแท้ พื้น PU กันลื่น ป้องกันน้ำมัน สารเคมี และตะปูทิ่มแทง"
  }
];

/**
 * ข้อความสัญญาและเงื่อนไขความรับผิดชอบกรณีสูญหาย (Liability Terms Clause)
 */
export const DEFAULT_SAFETY_LIABILITY_CLAUSE = 
  "ข้าพเจ้า (พนักงานขับรถผู้รับมอบ) ได้ทำการตรวจสอบและรับมอบอุปกรณ์ความปลอดภัยประจำรถขนส่งสินค้าข้างต้น " +
  "ในสภาพสมบูรณ์และถูกต้องครบถ้วนตามรายการแล้ว ข้าพเจ้าสัญญาว่าจะดูแลรักษา ใช้งานตามวัตถุประสงค์เพื่อความปลอดภัย " +
  "และเก็บรักษาไว้ประจำรถตลอดเวลา หากเกิดการชำรุดเสียหายจากการใช้งานผิดประเภท ประมาทเลินเล่อ หรือสูญหาย " +
  "ข้าพเจ้ายินยอมรับผิดชอบชดใช้ค่าเสียหายตามมูลค่าของอุปกรณ์ หรือจัดหาอุปกรณ์มาตรฐานเดียวกันมาทดแทนให้แก่บริษัท " +
  "ทีเอ็นบี โลจิสติกส์ จำกัด ทันทีโดยไม่มีข้อโต้แย้งใดๆ ทั้งสิ้น และยินยอมส่งมอบคืนอุปกรณ์ทั้งหมดเมื่อสิ้นสุดสภาพการปฏิบัติงาน";

/**
 * ข้อมูลตัวอย่างใบเซ็นรับอุปกรณ์เซฟตี้ติดรถ
 */
export const INITIAL_SAFETY_HANDOVERS: VehicleSafetyHandoverRecord[] = [
  {
    id: "sft-rec-001",
    documentNumber: "SFT-2026-001",
    vehicleId: "v-01",
    licensePlate: "700-1764",
    vehicleType: "tractor_6w",
    vehicleBrand: "HINO",
    vehicleModel: "Victor 500",
    department: "แผนกลากตู้คอนเทนเนอร์ (Container Fleet)",
    driverName: "สมหมาย มั่นคง",
    driverEmployeeId: "DRV-1024",
    driverPhone: "081-456-7890",
    handoverDate: "2026-08-15",
    currentMileage: 184520,
    issuedBy: "กมลวรรณ ชัยพร (จป.วิชาชีพ)",
    issuedByRole: "เจ้าหน้าที่ความปลอดภัยในการทำงาน (จป.)",
    handoverReason: "annual_renewal",
    status: "active",
    liabilityAgreementAccepted: true,
    liabilityClauseText: DEFAULT_SAFETY_LIABILITY_CLAUSE,
    driverSignatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M20,45 Q50,15 90,40 T160,35 T190,55' fill='none' stroke='%231d4ed8' stroke-width='3'/></svg>",
    officerSignatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M15,50 Q60,20 100,45 T170,40' fill='none' stroke='%23047857' stroke-width='3'/></svg>",
    managerSignatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M30,55 Q70,25 120,40 T180,30' fill='none' stroke='%234338ca' stroke-width='3'/></svg>",
    signedDocumentUpload: {
      fileName: "TNB_Safety_Signed_700-1764.pdf",
      fileSize: 458210,
      fileType: "application/pdf",
      dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2Jq",
      uploadedAt: "2026-08-15T10:45:00Z",
      uploadedBy: "กมลวรรณ ชัยพร (จป.)",
      notes: "สแกนใบเซ็นรับตัวจริงที่มีลายมือชื่อสดของนายสมหมาย และ จป. ตรวจสอบสภาพครบถ้วน 100%"
    },
    items: [
      {
        templateId: "sec-01",
        itemCode: "SEC-01",
        nameTh: "ที่หนุนล้อ",
        quantity: 2,
        unit: "อัน",
        status: "received",
        serialOrAssetTag: "CHOCK-700-1764-A/B",
        conditionNote: "สภาพดีมาก ยางไม่แตก",
        estimatedValueBaht: 750
      },
      {
        templateId: "sec-02",
        itemCode: "SEC-02",
        nameTh: "กรวยจราจร",
        quantity: 2,
        unit: "อัน",
        status: "received",
        serialOrAssetTag: "CONE-700-1764-1/2",
        conditionNote: "แถบสะท้อนแสงสมบูรณ์",
        estimatedValueBaht: 450
      },
      {
        templateId: "sec-03",
        itemCode: "SEC-03",
        nameTh: "ถังดับเพลิง",
        quantity: 1,
        unit: "ถัง",
        status: "received",
        serialOrAssetTag: "EXT-ABC-2026-042",
        conditionNote: "เกจวัดอยู่ในแถบสีเขียว แรงดันปกติ",
        estimatedValueBaht: 1450
      },
      {
        templateId: "sec-04",
        itemCode: "SEC-04",
        nameTh: "สายรัดสินค้า",
        quantity: 0,
        unit: "เส้น",
        status: "not_applicable",
        conditionNote: "หัวลากไม่ต้องมีสายรัดสินค้า",
        estimatedValueBaht: 650
      },
      {
        templateId: "sec-05",
        itemCode: "SEC-05",
        nameTh: "ไฟฉายสปอร์ตไลท์",
        quantity: 1,
        unit: "กระบอก",
        status: "received",
        serialOrAssetTag: "TORCH-10W-019",
        conditionNote: "แบตเตอรี่เต็ม ทดสอบเปิดติด",
        estimatedValueBaht: 550
      },
      {
        templateId: "sec-06",
        itemCode: "SEC-06",
        nameTh: "กุญแจล็อกตู้",
        quantity: 0,
        unit: "ชุด",
        status: "not_applicable",
        conditionNote: "หัวลากไม่ต้องมีแม่กุญแจ",
        estimatedValueBaht: 480
      },
      {
        templateId: "sec-07",
        itemCode: "SEC-07",
        nameTh: "ผ้าใบคลุมสินค้า",
        quantity: 0,
        unit: "ผืน",
        status: "not_applicable",
        conditionNote: "หัวลากไม่ต้องมีผ้าใบ",
        estimatedValueBaht: 2200
      },
      {
        templateId: "sec-08",
        itemCode: "SEC-08",
        nameTh: "เสื้อสะท้อนแสง",
        quantity: 1,
        unit: "ตัว",
        status: "received",
        serialOrAssetTag: "VEST-XL-088",
        conditionNote: "ไซส์ XL สภาพใหม่",
        estimatedValueBaht: 250
      },
      {
        templateId: "sec-09",
        itemCode: "SEC-09",
        nameTh: "หมวกนิรภัย",
        quantity: 1,
        unit: "ใบ",
        status: "received",
        serialOrAssetTag: "HELMET-Y-102",
        conditionNote: "สายรัดคางแน่นหนา",
        estimatedValueBaht: 380
      },
      {
        templateId: "sec-10",
        itemCode: "SEC-10",
        nameTh: "รองเท้านิรภัย",
        quantity: 1,
        unit: "คู่",
        status: "received",
        serialOrAssetTag: "SHOE-42-054",
        conditionNote: "เบอร์ 42 สภาพใหม่",
        estimatedValueBaht: 980
      }
    ],
    notes: "ส่งมอบอุปกรณ์ความปลอดภัยประจำรถรอบประจำปี พร้อมติดสติกเกอร์รหัสทรัพย์สินทุกชิ้น",
    createdAt: "2026-08-15T09:30:00Z",
    updatedAt: "2026-08-15T10:45:00Z"
  },
  {
    id: "sft-rec-002",
    documentNumber: "SFT-2026-002",
    vehicleId: "v-02",
    licensePlate: "700-1768",
    vehicleType: "box_truck_6w",
    vehicleBrand: "ISUZU",
    vehicleModel: "Forward 240",
    department: "สายส่งด่วนพิเศษภาคตะวันออก",
    driverName: "สมชาย รักษาดี",
    driverEmployeeId: "DRV-1035",
    driverPhone: "089-765-4321",
    handoverDate: "2026-09-02",
    currentMileage: 142100,
    issuedBy: "กมลวรรณ ชัยพร (จป.วิชาชีพ)",
    issuedByRole: "เจ้าหน้าที่ความปลอดภัยในการทำงาน (จป.)",
    handoverReason: "new_driver",
    status: "active",
    liabilityAgreementAccepted: true,
    liabilityClauseText: DEFAULT_SAFETY_LIABILITY_CLAUSE,
    driverSignatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M25,50 Q75,10 110,40 T175,50' fill='none' stroke='%231d4ed8' stroke-width='3'/></svg>",
    officerSignatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M15,50 Q60,20 100,45 T170,40' fill='none' stroke='%23047857' stroke-width='3'/></svg>",
    items: [
      {
        templateId: "sec-01",
        itemCode: "SEC-01",
        nameTh: "ที่หนุนล้อ",
        quantity: 2,
        unit: "อัน",
        status: "received",
        serialOrAssetTag: "CHOCK-700-1768-A/B",
        conditionNote: "สภาพปกติ",
        estimatedValueBaht: 750
      },
      {
        templateId: "sec-02",
        itemCode: "SEC-02",
        nameTh: "กรวยจราจร",
        quantity: 2,
        unit: "อัน",
        status: "received",
        serialOrAssetTag: "CONE-700-1768-1/2",
        conditionNote: "สภาพปกติ",
        estimatedValueBaht: 450
      },
      {
        templateId: "sec-03",
        itemCode: "SEC-03",
        nameTh: "ถังดับเพลิง",
        quantity: 1,
        unit: "ถัง",
        status: "received",
        serialOrAssetTag: "EXT-ABC-2026-088",
        conditionNote: "แรงดันปกติ อยู่ในเกณฑ์เขียว",
        estimatedValueBaht: 1450
      },
      {
        templateId: "sec-04",
        itemCode: "SEC-04",
        nameTh: "สายรัดสินค้า",
        quantity: 2,
        unit: "เส้น",
        status: "received",
        serialOrAssetTag: "STRAP-5T-01/02",
        conditionNote: "สายรัดและตัวโยกสมบูรณ์",
        estimatedValueBaht: 650
      },
      {
        templateId: "sec-05",
        itemCode: "SEC-05",
        nameTh: "ไฟฉายสปอร์ตไลท์",
        quantity: 1,
        unit: "กระบอก",
        status: "received",
        serialOrAssetTag: "TORCH-10W-033",
        conditionNote: "ใช้งานได้ปกติ",
        estimatedValueBaht: 550
      },
      {
        templateId: "sec-06",
        itemCode: "SEC-06",
        nameTh: "กุญแจล็อกตู้",
        quantity: 1,
        unit: "ชุด",
        status: "received",
        serialOrAssetTag: "LOCK-ISU-1768",
        conditionNote: "แม่กุญแจพร้อมลูกกุญแจ 3 ดอก",
        estimatedValueBaht: 480
      },
      {
        templateId: "sec-07",
        itemCode: "SEC-07",
        nameTh: "ผ้าใบคลุมสินค้า",
        quantity: 1,
        unit: "ผืน",
        status: "received",
        serialOrAssetTag: "TARP-GREEN-08",
        conditionNote: "ขนาด 4x6 ม. พร้อมเชือก",
        estimatedValueBaht: 2200
      },
      {
        templateId: "sec-08",
        itemCode: "SEC-08",
        nameTh: "เสื้อสะท้อนแสง",
        quantity: 1,
        unit: "ตัว",
        status: "received",
        serialOrAssetTag: "VEST-L-045",
        conditionNote: "ไซส์ L",
        estimatedValueBaht: 250
      },
      {
        templateId: "sec-09",
        itemCode: "SEC-09",
        nameTh: "หมวกนิรภัย",
        quantity: 1,
        unit: "ใบ",
        status: "received",
        serialOrAssetTag: "HELMET-Y-115",
        conditionNote: "สภาพดี",
        estimatedValueBaht: 380
      },
      {
        templateId: "sec-10",
        itemCode: "SEC-10",
        nameTh: "รองเท้านิรภัย",
        quantity: 1,
        unit: "คู่",
        status: "received",
        serialOrAssetTag: "SHOE-41-092",
        conditionNote: "เบอร์ 41",
        estimatedValueBaht: 980
      }
    ],
    notes: "ส่งมอบอุปกรณ์ครบถ้วนทั้ง 10 รายการสำหรับรถ 6 ล้อตู้ทึบ พนักงานเซ็นรับทราบเงื่อนไขชดใช้กรณีสูญหาย",
    createdAt: "2026-09-02T08:30:00Z",
    updatedAt: "2026-09-02T09:15:00Z"
  }
];

export const SAFETY_HANDOVERS_STORAGE_KEY = "tnb_fleet_clean_safety_handovers_v1";
export const SAFETY_TEMPLATES_STORAGE_KEY = "tnb_fleet_clean_safety_templates_v1";
