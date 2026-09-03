import { RepairTicket } from "../types";

export const TNB_STANDARD_9_TICKETS: RepairTicket[] = [
  // 1. 700-6844 (รอดำเนินการ - Pending)
  {
    id: "TK-202608-6844",
    ticketNumber: "REP-2026-0801",
    createdAt: "2026-08-30T08:15:00.000Z",
    updatedAt: "2026-08-30T09:00:00.000Z",
    licensePlate: "700-6844",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "RCK",
    vehicleModel: "RCK-620-CSTC • หาง 2 เพลา",
    vehicleType: "trailer_2axle",
    currentMileage: 244714,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายธวัชชัย รุ่งโรจน์ (พนักงานขับรถสายตะวันออก)",
    requesterPhone: "089-555-1234",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางหมดสภาพ: 1 2 3 4 หาง ขอเบิกยางใหม่พร้อมตั้งศูนย์เพลาหาง",
    issues: [
      {
        id: "iss-6844-1",
        title: "ยางเพลา 1 และ 2 ของหางหมดสภาพ",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ดอกยางสึกเรียบถึงสะพานยางทั้ง 4 ตำแหน่ง เสี่ยงลื่นไถลตอนฝนตก",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
    ],
    status: "pending",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-09-02T16:00:00.000Z",
    partsList: [
      { id: "P-6844-1", name: "ยางบรรทุก 11R22.5 Bridgestone R156", quantity: 4, unitPrice: 8500, total: 34000 }
    ],
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    aiDiagnosis: {
      summary: "ยางหางพ่วง 2 เพลาสึกหรอถึงสะพานยางทั้ง 4 เส้น ควรเปลี่ยนใหม่เพื่อความปลอดภัยในการบรรทุก",
      possibleCauses: ["การใช้งานระยะทางสะสม", "การบรรทุกหนักต่อเนื่อง"],
      recommendedChecks: ["เปลี่ยนยางคู่เพลา 1 และ 2", "ตรวจเช็คลมยางและขันน็อตล้อตามสเปก 550 Nm"],
      suggestedParts: [
        { name: "ยางบรรทุก 11R22.5", estimatedCost: 34000, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 34800,
      estimatedRepairTimeHours: 3,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "เสี่ยงต่อการลื่นไถลขณะเบรกกะทันหันบนถนนเปียก"
    },
    history: [
      { id: "h1", timestamp: "2026-08-30T08:15:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนยางหาง 4 เส้น", updatedBy: "นายธวัชชัย รุ่งโรจน์" }
    ]
  },

  // 2. 701-1890 (รอดำเนินการ - Pending)
  {
    id: "TK-202608-1890",
    ticketNumber: "REP-2026-0802",
    createdAt: "2026-08-29T10:30:00.000Z",
    updatedAt: "2026-08-29T11:00:00.000Z",
    licensePlate: "701-1890",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "FTR34JXTXT • หัวลาก 6 ล้อ",
    vehicleType: "tractor_6w",
    currentMileage: 185320,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายสมเกียรติ สว่างวงศ์",
    requesterPhone: "081-333-8899",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] เปลี่ยนยางหน้า : ดอกยางหน้าสึกกินข้าง พวงมาลัยดึงซ้ายเล็กน้อย",
    issues: [
      {
        id: "iss-1890-1",
        title: "เปลี่ยนยางคู่หน้า 2 เส้นและตั้งศูนย์ล้อ",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ยางหน้าซ้ายสึกกินขอบด้านใน",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [],
    status: "pending",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-09-01T15:00:00.000Z",
    partsList: [
      { id: "P-1890-1", name: "ยางบรรทุก 9.5R17.5 Bridgestone", quantity: 2, unitPrice: 6200, total: 12400 }
    ],
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    aiDiagnosis: {
      summary: "ยางหน้าสึกกินขอบด้านในเกิดจากมุมโท (Toe-in/out) ผิดเพี้ยน ควรเปลี่ยนยางคู่หน้าพร้อมตั้งศูนย์ล้อ",
      possibleCauses: ["มุมโทเพลาหน้าไม่ได้ศูนย์", "ลูกหมากคันส่งหน้าเริ่มหลวม"],
      recommendedChecks: ["เปลี่ยนยางคู่หน้า", "ตรวจเช็คบูชปีกนกและลูกหมากคันชักคันส่ง", "ตั้งศูนย์ถ่วงล้อใหม่"],
      suggestedParts: [
        { name: "ยาง 9.5R17.5", estimatedCost: 12400, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 600,
      estimatedTotalCost: 13000,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "พวงมาลัยดึงซ้ายทำให้ผู้ขับขี่ควบคุมทิศทางได้ยากขึ้น"
    },
    history: [
      { id: "h1", timestamp: "2026-08-29T10:30:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนยางหน้า", updatedBy: "นายสมเกียรติ สว่างวงศ์" }
    ]
  },

  // 3. 701-0711 (รอดำเนินการ - Pending)
  {
    id: "TK-202608-0711",
    ticketNumber: "REP-2026-0803",
    createdAt: "2026-08-28T08:30:00.000Z",
    updatedAt: "2026-08-29T10:15:00.000Z",
    licensePlate: "701-0711",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "RCK",
    vehicleModel: "RCK-620-CSTC • หาง 2 เพลา",
    vehicleType: "trailer_2axle",
    currentMileage: 242713,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายณรงค์ฤทธิ์ ชัยชนะ",
    requesterPhone: "089-555-1234",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "high",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางหมดสภาพ : ตำแหน่งยาง 3 และ 4 ของหางพ่วง มีรอยบวมปูดที่แก้มยาง",
    issues: [
      {
        id: "iss-711-1",
        title: "ยางตำแหน่ง 3 และ 4 บวมและดอกยางสึก",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "แก้มยางบวมปูด เสี่ยงต่อการระเบิดขณะบรรทุกหนัก 20 ตัน",
        urgency: "high",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    ],
    status: "pending",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-08-30T16:00:00.000Z",
    partsList: [
      { id: "P-711-1", name: "ยางเรเดียลรถบรรทุก 11R22.5 Bridgestone R156", quantity: 2, unitPrice: 8500, total: 17000 }
    ],
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    aiDiagnosis: {
      summary: "ยางตำแหน่ง 3 และ 4 บวมที่โครงสร้างยางเสี่ยงระเบิดขณะวิ่งงานบรรทุกหนัก",
      possibleCauses: ["กระแทกขอบทางหรือตกหลุมรุนแรง", "โครงสร้างลวดด้านในฉีกขาด"],
      recommendedChecks: ["เปลี่ยนยางใหม่ทันทีก่อนออกวิ่ง", "ตรวจเช็คลมยางและขอบกระทะล้อ"],
      suggestedParts: [
        { name: "ยางบรรทุก 11R22.5", estimatedCost: 17000, necessity: "จำเป็นเร่งด่วน" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 17800,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "high",
      safetyWarning: "ห้ามปล่อยรถออกวิ่งก่อนเปลี่ยนยางเด็ดขาด เสี่ยงเกิดอุบัติเหตุร้ายแรง"
    },
    history: [
      { id: "h1", timestamp: "2026-08-28T08:30:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนยางตำแหน่ง 3-4", updatedBy: "นายณรงค์ฤทธิ์ ชัยชนะ" }
    ]
  },

  // 4. 701-1900 (กำลังตรวจเช็ค - Inspecting)
  {
    id: "TK-202608-1900",
    ticketNumber: "REP-2026-0804",
    createdAt: "2026-08-27T09:15:00.000Z",
    updatedAt: "2026-08-29T14:30:00.000Z",
    licensePlate: "701-1900",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "FTR34Q0XXU • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 243290,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายประสิทธิ์ ศรีสวัสดิ์",
    requesterPhone: "081-444-9988",
    category: "aircon",
    subCategoryId: "ac-refrigerant",
    subCategoryName: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf",
    priority: "medium",
    symptoms: "1. [เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf] แอร์มีแต่ลมร้อน ไม่มีไอเย็น และมีเสียงฟู่ๆ ตอนเปิดเบอร์แรงสุด 2. กรองแอร์ตัน 3. ล้างตู้แอร์",
    issues: [
      {
        id: "iss-1900-1",
        title: "แอร์ห้องโดยสารไม่มีความเย็น มีแต่ลมร้อน",
        category: "aircon",
        subCategoryId: "ac-refrigerant",
        subCategoryName: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf",
        description: "คอมเพรสเซอร์แอร์ทำงานแต่ไม่มีความเย็น น้ำยาแอร์พร่อง",
        urgency: "medium",
        isResolved: false
      },
      {
        id: "iss-1900-2",
        title: "กรองแอร์ห้องโดยสารตันและมีกลิ่นอับ",
        category: "aircon",
        subCategoryId: "ac-cleaning",
        subCategoryName: "ล้างตู้แอร์ & กรอง PM2.5",
        description: "ฝุ่นเกาะหนาแน่น ลมแอร์ออกเบา",
        urgency: "low",
        isResolved: false
      },
      {
        id: "iss-1900-3",
        title: "สายพานคอมแอร์หย่อนและมีเสียงดังเอี๊ยด",
        category: "engine",
        subCategoryId: "eng-belts",
        subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
        description: "จังหวะเร่งเครื่องมีเสียงสายพานเสียดสี",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [],
    status: "inspecting",
    assignedMechanic: "ช่างวิชาญ",
    estimatedCompletionDate: "2026-08-30T17:00:00.000Z",
    partsList: [
      { id: "P-1900-1", name: "น้ำยาแอร์ R134a แท้ + น้ำมันคอมเพรสเซอร์", quantity: 1, unitPrice: 500, total: 500 }
    ],
    partsCost: 500,
    laborCost: 0,
    totalCost: 500,
    feedback: {
      id: "fb-1900",
      rating: 5,
      overallRating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ตรวจรับงานซ่อมเรียบร้อย รอพนักงานขับรับรถ ช่างวิชาญเช็คจุดรั่วได้แม่นยำมากครับ",
      reviewerName: "นายประสิทธิ์ ศรีสวัสดิ์",
      createdAt: "2026-08-29T15:00:00.000Z",
      tags: ["ตรวจละเอียด", "ช่างมืออาชีพ"]
    },
    aiDiagnosis: {
      summary: "โอริงข้อต่อท่อแรงดันแอร์รั่วซึมทำให้น้ำยาแอร์ระเหยหมด สายพานคอมแอร์เริ่มหย่อนสภาพ",
      possibleCauses: ["โอริงท่อแอร์เสื่อมสภาพตามอายุ", "สายพานหย่อน"],
      recommendedChecks: ["เปลี่ยนชุดโอริงท่อแอร์", "แวคคั่มระบบเติมน้ำยาแอร์ R134a", "ปรับตั้งความตึงสายพาน"],
      suggestedParts: [
        { name: "ชุดโอริงและน้ำยาแอร์", estimatedCost: 500, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 500,
      estimatedTotalCost: 1000,
      estimatedRepairTimeHours: 3,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "ห้องโดยสารร้อนส่งผลต่อความเหนื่อยล้าของพนักงานขับรถระยะไกล"
    },
    history: [
      { id: "h1", timestamp: "2026-08-27T09:15:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมแอร์ไม่เย็น", updatedBy: "นายประสิทธิ์ ศรีสวัสดิ์" },
      { id: "h2", timestamp: "2026-08-28T10:00:00.000Z", status: "inspecting", note: "ช่างวิชาญนำเกจวัดแรงดันน้ำยาแอร์ พบแรงดันต่ำกว่า 15 PSI กำลังถอดเช็ครอยรั่ว", updatedBy: "ช่างวิชาญ" }
    ]
  },

  // 5. 700-1772 (กำลังตรวจเช็ค - Inspecting)
  {
    id: "TK-202608-1772",
    ticketNumber: "REP-2026-0805",
    createdAt: "2026-08-26T11:00:00.000Z",
    updatedAt: "2026-08-28T16:00:00.000Z",
    licensePlate: "700-1772",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "FTR34Q0XXU • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 243830,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายสมเกียรติ พรหมดี",
    requesterPhone: "086-123-7890",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางในล้อหลัง: อาการ : ยางดอกหมดสภาพ ขอเปลี่ยนยางใหม่คู่หลัง",
    issues: [
      {
        id: "iss-1772-1",
        title: "เปลี่ยนยางในล้อหลังดอกหมดสภาพ",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ดอกยางล้อหลังสึกถึงสะพานยาง",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [],
    status: "inspecting",
    assignedMechanic: "ช่างวิชาญ",
    estimatedCompletionDate: "2026-08-30T15:00:00.000Z",
    partsList: [
      { id: "P-1772-1", name: "ยางในและยางรองล้อหลัง Isuzu FTR", quantity: 2, unitPrice: 250, total: 500 }
    ],
    partsCost: 500,
    laborCost: 0,
    totalCost: 500,
    feedback: {
      id: "fb-1772",
      rating: 5,
      overallRating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ตรวจรับงานซ่อมเรียบร้อย รอพนักงานขับรับรถ",
      reviewerName: "นายสมเกียรติ พรหมดี",
      createdAt: "2026-08-28T16:30:00.000Z",
      tags: ["ช่างชำนาญการ", "บริการดี"]
    },
    aiDiagnosis: {
      summary: "ยางในล้อหลังหมดสภาพจากการใช้งานสะสม ควรเปลี่ยนยางและตรวจเช็คขอบกระทะล้อ",
      possibleCauses: ["การเสียดสีภายในกะทะล้อ", "อายุยางในเกินกำหนด"],
      recommendedChecks: ["เปลี่ยนยางในและแถบยางรอง", "ตรวจเช็คลูกปืนล้อหลัง"],
      suggestedParts: [
        { name: "ยางในรถบรรทุก", estimatedCost: 500, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 300,
      estimatedTotalCost: 800,
      estimatedRepairTimeHours: 1.5,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "ยางในที่บางลงเสี่ยงต่อการรั่วซึมกะทันหันขณะบรรทุกสินค้า"
    },
    history: [
      { id: "h1", timestamp: "2026-08-26T11:00:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนยางในล้อหลัง", updatedBy: "นายสมเกียรติ พรหมดี" },
      { id: "h2", timestamp: "2026-08-28T14:00:00.000Z", status: "inspecting", note: "ช่างวิชาญนำรถเข้าช่องตรวจเช็คและถอดล้อหลัง", updatedBy: "ช่างวิชาญ" }
    ]
  },

  // 6. 700-2799 (ซ่อมเสร็จสมบูรณ์ - Completed)
  {
    id: "TK-202608-2799",
    ticketNumber: "REP-2026-0806",
    createdAt: "2026-08-22T08:00:00.000Z",
    updatedAt: "2026-08-24T16:30:00.000Z",
    licensePlate: "700-2799",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "RCK",
    vehicleModel: "RCK • หาง 3 เพลา",
    vehicleType: "trailer_3axle",
    currentMileage: 243878,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายวิเชียร มั่นคง (คนขับรถพ่วง)",
    requesterPhone: "082-999-3344",
    category: "tires",
    subCategoryId: "sus-alignment",
    subCategoryName: "สลับยาง & ถ่วงล้อ",
    priority: "medium",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางหมดสภาพ: ยางหมดสภาพ 2 เส้น สลับยางและถ่วงล้อหาง 3 เพลา",
    issues: [
      {
        id: "iss-2799-1",
        title: "สลับยาง 12 เส้นและเช็คลมยางไนโตรเจน",
        category: "tires",
        subCategoryId: "sus-alignment",
        subCategoryName: "สลับยาง & ถ่วงล้อ",
        description: "สลับยางหน้า-หลัง ซ้าย-ขวา เพื่อให้หน้ายางสึกสม่ำเสมอ",
        urgency: "medium",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-08-24T15:00:00.000Z",
    actualCompletionDate: "2026-08-24T16:00:00.000Z",
    partsList: [
      { id: "P-2799-1", name: "จุ๊บลมยางแรงดันสูงทองเหลือง 12 ตัว", quantity: 12, unitPrice: 25, total: 300 },
      { id: "P-2799-2", name: "เติมลมไนโตรเจน 12 ล้อ", quantity: 1, unitPrice: 100, total: 100 }
    ],
    partsCost: 400,
    laborCost: 0,
    totalCost: 400,
    aiDiagnosis: {
      summary: "สลับยางหาง 3 เพลาครบ 12 เส้นตามรอบการบำรุงรักษาเชิงป้องกัน ตรวจเช็คแรงดันลมยาง 120 PSI ทุกเส้น",
      possibleCauses: ["การบำรุงรักษาตามรอบปกติ"],
      recommendedChecks: ["ตรวจเช็คความแน่นของน็อตล้อ 12 ล้อด้วยประแจปอนด์ (Torque Wrench)"],
      suggestedParts: [],
      estimatedLaborCost: 0,
      estimatedTotalCost: 400,
      estimatedRepairTimeHours: 1.5,
      urgencyLevel: "low",
      safetyWarning: "ควรตรวจเช็คซ้ำความแน่นน็อตล้อหลังวิ่งงาน 100 กม. แรก"
    },
    mechanicNotes: "สลับยางครบ 12 เส้น ขันน็อตล้อด้วยประแจปอนด์ 550 Nm ทุกล้อ วัดลมยางได้ 120 PSI เสมอกันทุกเส้น",
    history: [
      { id: "h1", timestamp: "2026-08-22T08:00:00.000Z", status: "pending", note: "เปิดใบงานสลับยางหาง 3 เพลา", updatedBy: "นายวิเชียร มั่นคง" },
      { id: "h2", timestamp: "2026-08-23T10:00:00.000Z", status: "in_progress", note: "นำหางเข้าช่องสลับยางและตรวจเช็คล้อ", updatedBy: "ทีมช่างยาง" },
      { id: "h3", timestamp: "2026-08-24T16:00:00.000Z", status: "completed", note: "ส่งมอบหางพ่วงพร้อมใช้งาน", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },

  // 7. 701-2117 (ซ่อมเสร็จสมบูรณ์ - Completed, Emergency Breakdown GPS)
  {
    id: "TK-202608-2117",
    ticketNumber: "REP-2026-0807",
    createdAt: "2026-08-21T07:30:00.000Z",
    updatedAt: "2026-08-21T18:00:00.000Z",
    licensePlate: "701-2117",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "GXZ77NJT001684 • หัวลาก 10 ล้อ",
    vehicleType: "tractor_10w",
    currentMileage: 382400,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายบุญเลิศ แสงทอง (หัวหน้าชุดขับรถบรรทุกหนัก)",
    requesterPhone: "086-777-1234",
    breakdownLocation: {
      isEmergencyBreakdown: true,
      latitude: 13.54129,
      longitude: 100.82471,
      locationName: "รถเสียฉุกเฉินนอกสถานที่ GPS (ถนนบางนา-ตราด กม. 36)",
      landmarks: "จอดชิดไหล่ทางซ้าย หน้าปั๊ม ปตท. มีกรวยสะท้อนแสงตั้งเตือน 50 ม.",
      accuracy: 5
    },
    category: "engine",
    subCategoryId: "eng-belts",
    subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
    priority: "critical",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] 701-2117: ตรวจพบอาการ : สายพานหน้าเครื่องขาดและลูกรอกแตก รถเสียฉุกเฉินนอกสถานที่",
    issues: [
      {
        id: "iss-2117-1",
        title: "เปลี่ยนชุดสายพานหน้าเครื่องแท้ Isuzu GXZ 360",
        category: "engine",
        subCategoryId: "eng-belts",
        subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
        description: "สายพานขาดระหว่างทาง หน่วยเซอร์วิสเข้าเปลี่ยนนอกสถานที่",
        urgency: "critical",
        isResolved: true
      },
      {
        id: "iss-2117-2",
        title: "เปลี่ยนลูกรอกตั้งสายพานและตรวจเช็คไดชาร์จ",
        category: "engine",
        subCategoryId: "eng-belts",
        subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
        description: "ลูกรอกแตกทำให้สายพานหลุด",
        urgency: "high",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-08-21T16:00:00.000Z",
    actualCompletionDate: "2026-08-21T17:30:00.000Z",
    partsList: [
      { id: "P-2117-1", name: "สายพานหน้าเครื่องแท้ Isuzu GXZ 6UZ1", quantity: 2, unitPrice: 1450, total: 2900 },
      { id: "P-2117-2", name: "ชุดลูกรอกตั้งสายพานอัตโนมัติ", quantity: 1, unitPrice: 1600, total: 1600 }
    ],
    partsCost: 4500,
    laborCost: 0,
    totalCost: 4500,
    feedback: {
      id: "fb-2117",
      rating: 5,
      overallRating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ทีมเซอร์วิสฉุกเฉินเดินทางถึงจุดเกิดเหตุเร็วมาก ซ่อมเสร็จสามารถวิ่งงานต่อได้ทันเวลาครับ",
      reviewerName: "นายบุญเลิศ แสงทอง",
      createdAt: "2026-08-21T18:30:00.000Z",
      tags: ["เซอร์วิสไว", "มืออาชีพ"]
    },
    aiDiagnosis: {
      summary: "สายพานหน้าเครื่องขาดเนื่องจากลูกรอกตั้งสายพานแตกฉับพลัน ทีมเซอร์วิสเปลี่ยนอะไหล่ใหม่นอกสถานที่สำเร็จ",
      possibleCauses: ["ลูกปืนลูกรอกแตกจากความร้อนสะสม", "สายพานหมดอายุ"],
      recommendedChecks: ["เปลี่ยนสายพานและลูกรอก", "ทดสอบระบบไดชาร์จและปั๊มน้ำ"],
      suggestedParts: [
        { name: "สายพานหน้าเครื่อง", estimatedCost: 2900, necessity: "จำเป็นฉุกเฉิน" },
        { name: "ลูกรอกสายพาน", estimatedCost: 1600, necessity: "จำเป็นฉุกเฉิน" }
      ],
      estimatedLaborCost: 0,
      estimatedTotalCost: 4500,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "critical",
      safetyWarning: "ได้รับการแก้ไขและทดสอบระบบเรียบร้อย รถพร้อมใช้งานปลอดภัย 100%"
    },
    mechanicNotes: "เปลี่ยนสายพานและลูกรอกใหม่นอกสถานที่ ทดสอบสตาร์ท 20 นาที ระบบไฟชาร์จปกติ 28V",
    history: [
      { id: "h1", timestamp: "2026-08-21T07:30:00.000Z", status: "pending", note: "แจ้งเหตุฉุกเฉินรถจอดเสียข้างทาง", updatedBy: "นายบุญเลิศ แสงทอง" },
      { id: "h2", timestamp: "2026-08-21T09:00:00.000Z", status: "in_progress", note: "ทีมโมบายเซอร์วิสเข้าถึงหน้างาน", updatedBy: "หน่วยเซอร์วิส" },
      { id: "h3", timestamp: "2026-08-21T17:30:00.000Z", status: "completed", note: "ซ่อมเสร็จส่งมอบรถกลับเข้าเส้นทาง", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },

  // 8. 701-0714 (ซ่อมเสร็จสมบูรณ์ - Completed)
  {
    id: "TK-202608-0714",
    ticketNumber: "REP-2026-0808",
    createdAt: "2026-08-20T08:00:00.000Z",
    updatedAt: "2026-08-21T15:00:00.000Z",
    licensePlate: "701-0714",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "SIXWHEELS TRUCK",
    vehicleModel: "SIXWHEELS TRUCK • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 198420,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายอำนาจ เจริญสุข",
    requesterPhone: "083-444-5566",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "1. [เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)] ยางบวม ยางแตกกลางทาง หรือมีรอยบาดแก้มยาง ขอเปลี่ยนยางใหม่คู่หน้า",
    issues: [
      {
        id: "iss-0714-1",
        title: "เปลี่ยนยางใหม่ 2 เส้นตามรอบความปลอดภัย",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ยางหน้าซ้ายมีรอยบาดแก้มยางลึก",
        urgency: "medium",
        isResolved: true
      }
    ],
    attachedImages: [],
    status: "completed",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-08-21T14:00:00.000Z",
    actualCompletionDate: "2026-08-21T14:45:00.000Z",
    partsList: [
      { id: "P-0714-1", name: "ยางเรเดียล 9.5R17.5", quantity: 2, unitPrice: 5800, total: 11600 }
    ],
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    aiDiagnosis: {
      summary: "ยางหน้าซ้ายมีรอยแผลที่แก้มยาง เสี่ยงต่อการระเบิด ได้ทำการเปลี่ยนยางใหม่คู่หน้าเรียบร้อย",
      possibleCauses: ["การเบียดขอบฟุตบาทหรือของมีคม"],
      recommendedChecks: ["เปลี่ยนยางคู่หน้า", "ตรวจเช็คลมยางและตั้งศูนย์"],
      suggestedParts: [
        { name: "ยาง 9.5R17.5", estimatedCost: 11600, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 0,
      estimatedTotalCost: 0,
      estimatedRepairTimeHours: 1.5,
      urgencyLevel: "medium",
      safetyWarning: "เปลี่ยนยางใหม่แล้ว ปลอดภัยในการขับขี่ 100%"
    },
    mechanicNotes: "เปลี่ยนยางคู่หน้า 2 เส้น ขันน็อตล้อ 450 Nm และตั้งศูนย์เรียบร้อย",
    history: [
      { id: "h1", timestamp: "2026-08-20T08:00:00.000Z", status: "pending", note: "แจ้งเปลี่ยนยางแก้มมีรอยบาด", updatedBy: "นายอำนาจ เจริญสุข" },
      { id: "h2", timestamp: "2026-08-21T14:45:00.000Z", status: "completed", note: "เปลี่ยนยางเสร็จส่งมอบรถ", updatedBy: "ทีมช่างยาง" }
    ]
  },

  // 9. 70-8844 (ซ่อมเสร็จสมบูรณ์ - Completed)
  {
    id: "TK-202608-8844",
    ticketNumber: "REP-2026-0809",
    createdAt: "2026-08-19T07:30:00.000Z",
    updatedAt: "2026-08-21T17:00:00.000Z",
    licensePlate: "70-8844",
    province: "พระนครศรีอยุธยา",
    vehicleBrand: "Hino",
    vehicleModel: "Hino 500 Victor 380HP • 10 ล้อหัวลาก",
    vehicleType: "tractor_10w",
    currentMileage: 382400,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายบุญเลิศ แสงทอง",
    requesterPhone: "086-777-1234",
    category: "engine",
    subCategoryId: "eng-belts",
    subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
    priority: "critical",
    symptoms: "สายพานหน้าเครื่องมีรอยแตกลายงาอย่างรุนแรง และลูกรอกตั้งสายพานมีเสียงดังจี๊ดๆ ขณะเร่งเครื่อง ขอเปลี่ยนด่วนก่อนสายพานขาดกลางทาง",
    issues: [
      {
        id: "iss-8844-1",
        title: "เปลี่ยนชุดสายพานหน้าเครื่องและลูกรอกดันสายพานแท้ Hino",
        category: "engine",
        subCategoryId: "eng-belts",
        subCategoryName: "สายพานหน้าเครื่อง / สายพานไทม์มิ่ง / ลูกรอก",
        description: "สายพานแตกลายงาลึกและลูกรอกเริ่มแกว่ง",
        urgency: "critical",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างประสิทธิ์",
    estimatedCompletionDate: "2026-08-21T15:00:00.000Z",
    actualCompletionDate: "2026-08-21T16:30:00.000Z",
    partsList: [
      { id: "P-8844-1", name: "สายพานหน้าเครื่องแท้ Hino 500 Victor", quantity: 2, unitPrice: 1450, total: 2900 },
      { id: "P-8844-2", name: "ชุดลูกรอกตั้งสายพานอัตโนมัติ (Auto Tensioner)", quantity: 1, unitPrice: 3200, total: 3200 }
    ],
    partsCost: 6100,
    laborCost: 1200,
    totalCost: 7300,
    feedback: {
      id: "fb-8844",
      rating: 5,
      overallRating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างประสิทธิ์ตรวจพบเร็วมาก เปลี่ยนเสร็จเครื่องเดินเรียบเงียบกริบ วิ่งงานไกลได้อย่างสบายใจครับ",
      reviewerName: "นายบุญเลิศ แสงทอง",
      createdAt: "2026-08-21T18:00:00.000Z",
      tags: ["ช่างมือหนึ่ง", "ปลอดภัย", "อะไหล่แท้ตรงรุ่น"]
    },
    aiDiagnosis: {
      summary: "สายพานหน้าเครื่องหมดอายุการใช้งานและลูกรอกตั้งสายพานลูกปืนแตก เปลี่ยนชุดใหม่ตรงรุ่นเรียบร้อย",
      possibleCauses: ["อายุการใช้งานเกิน 100,000 กม.", "ความร้อนสะสมในห้องเครื่อง"],
      recommendedChecks: ["เปลี่ยนสายพานและลูกรอกพร้อมกัน", "ตรวจเช็คการหมุนของพูลเล่ย์ไดชาร์จและปั๊มน้ำ"],
      suggestedParts: [
        { name: "สายพานหน้าเครื่องแท้", estimatedCost: 2900, necessity: "จำเป็นฉุกเฉิน" },
        { name: "ลูกรอกตั้งสายพาน", estimatedCost: 3200, necessity: "จำเป็นฉุกเฉิน" }
      ],
      estimatedLaborCost: 1200,
      estimatedTotalCost: 7300,
      estimatedRepairTimeHours: 3,
      urgencyLevel: "critical",
      safetyWarning: "อันตรายสูงสุด เครื่องยนต์จะ Overheat ทันทีหากสายพานขาดขณะวิ่งงาน"
    },
    mechanicNotes: "เปลี่ยนสายพานแท้ Hino ทั้ง 2 เส้น พร้อมชุดลูกรอกตั้งสายพานใหม่ สตาร์ทเทส 30 นาที เสียงเงียบสนิท",
    history: [
      { id: "h1", timestamp: "2026-08-19T07:30:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมด่วน สายพานมีเสียงดัง", updatedBy: "นายบุญเลิศ แสงทอง" },
      { id: "h2", timestamp: "2026-08-20T09:00:00.000Z", status: "in_progress", note: "เบิกอะไหล่แท้ศูนย์และเริ่มถอดประกอบ", updatedBy: "ช่างประสิทธิ์" },
      { id: "h3", timestamp: "2026-08-21T16:30:00.000Z", status: "completed", note: "ส่งมอบรถเรียบร้อย", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  }
];
