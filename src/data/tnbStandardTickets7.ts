import { RepairTicket } from "../types";

export const TNB_STANDARD_7_TICKETS: RepairTicket[] = [
  {
    id: "TK-202608-0711",
    ticketNumber: "REP-2026-0801",
    createdAt: "2026-08-28T08:30:00.000Z",
    updatedAt: "2026-08-29T10:15:00.000Z",
    licensePlate: "701-0711",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "RCK",
    vehicleModel: "RCK-620-CSTC • หาง 2 เพลา",
    vehicleType: "trailer_2axle",
    currentMileage: 242713,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายธวัชชัย รุ่งโรจน์ (พนักงานขับรถสายตะวันออก)",
    requesterPhone: "089-555-1234",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ & เช็คเบรกหาง",
    priority: "high",
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางหมดสภาพ ดอกยางสึกเรียบ และมีรอยบวมที่แก้มยางเพลาที่ 1 ด้านซ้าย ขอเปลี่ยนยางใหม่ด่วนก่อนออกวิ่งรอบค่ำ",
    issues: [
      {
        id: "iss-711-1",
        title: "ยางเพลา 1 ซ้าย บวมและดอกยางสึกถึงสะพานยาง",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "แก้มยางบวมปูด เสี่ยงต่อการระเบิดขณะบรรทุกหนัก 20 ตัน",
        urgency: "high",
        isResolved: false
      },
      {
        id: "iss-711-2",
        title: "ตรวจเช็คผ้าเบรกและลมเบรกหางพ่วง",
        category: "suspension",
        subCategoryId: "sus-brakes",
        subCategoryName: "ระบบเบรก & จานเบรก & ผ้าเบรก",
        description: "เบรกหางจับช้ากว่าปกติเล็กน้อย ตรวจเช็คกระบอกลมเบรก",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
    ],
    status: "pending",
    assignedMechanic: "รอจ่ายงาน",
    estimatedCompletionDate: "2026-08-30T16:00:00.000Z",
    partsList: [
      { id: "P-711-1", name: "ยางเรเดียลรถบรรทุก 11R22.5 Bridgestone R156", quantity: 2, unitPrice: 8500, total: 17000 },
      { id: "P-711-2", name: "กระทะล้อเหล็ก 8.25x22.5", quantity: 1, unitPrice: 2200, total: 2200 }
    ],
    partsCost: 19200,
    laborCost: 800,
    totalCost: 20000,
    aiDiagnosis: {
      summary: "ยางเพลา 1 ด้านซ้ายมีอาการบวมที่โครงสร้างยางเสี่ยงยางระเบิด และระบบเบรกหางพ่วงมีระยะหยุดยาวขึ้น",
      possibleCauses: ["การกระแทกของมีคมหรือหลุมบนผิวทาง", "อายุยางครบ 100,000 กม."],
      recommendedChecks: ["เปลี่ยนยางใหม่คู่หน้าเพลา 1", "ตรวจเช็ควาล์วปรับแรงดันลมเบรกหาง (Relay Valve)"],
      suggestedParts: [
        { name: "ยางบรรทุก 11R22.5", estimatedCost: 17000, necessity: "จำเป็นเร่งด่วน" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 20000,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "เร่งด่วน",
      safetyWarning: "ห้ามปล่อยรถออกวิ่งก่อนเปลี่ยนยางเด็ดขาด เสี่ยงเกิดอุบัติเหตุบนทางหลวง"
    },
    history: [
      { id: "h1", timestamp: "2026-08-28T08:30:00.000Z", status: "pending", note: "คนขับเปิดใบแจ้งซ่อมเปลี่ยนยางด่วน", updatedBy: "นายธวัชชัย รุ่งโรจน์" }
    ]
  },
  {
    id: "TK-202608-1900",
    ticketNumber: "REP-2026-0802",
    createdAt: "2026-08-27T09:15:00.000Z",
    updatedAt: "2026-08-29T14:30:00.000Z",
    licensePlate: "701-1900",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "Isuzu FTR34QXXXU • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 243290,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายประสิทธิ์ ศรีสวัสดิ์",
    requesterPhone: "081-444-9988",
    category: "aircon",
    subCategoryId: "ac-refrigerant",
    subCategoryName: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf",
    priority: "medium",
    symptoms: "1. [เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf] แอร์มีแต่ลมร้อน ไม่มีไอเย็น และมีเสียงดังฟู่ๆ ตอนเปิดแอร์เบอร์แรงสุด 2. กรองแอร์ตัน 3. ล้างตู้แอร์",
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
    attachedImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
    ],
    status: "inspecting",
    assignedMechanic: "ช่างวิชาญ",
    estimatedCompletionDate: "2026-08-30T17:00:00.000Z",
    partsList: [
      { id: "P-1900-1", name: "น้ำยาแอร์ R134a แท้ + น้ำมันคอมเพรสเซอร์", quantity: 1, unitPrice: 500, total: 500 },
      { id: "P-1900-2", name: "กรองแอร์ห้องโดยสาร Isuzu FTR แท้", quantity: 1, unitPrice: 350, total: 350 },
      { id: "P-1900-3", name: "สายพานคอมเพรสเซอร์แอร์", quantity: 1, unitPrice: 420, total: 420 }
    ],
    partsCost: 1270,
    laborCost: 500,
    totalCost: 1770,
    feedback: {
      id: "fb-1900",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ตรวจรับงานซ่อมเรียบร้อย ช่างวิชาญเช็คจุดรั่วได้แม่นยำมากครับ",
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
      estimatedTotalCost: 1770,
      estimatedRepairTimeHours: 3,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "ห้องโดยสารร้อนส่งผลต่อความเหนื่อยล้าของพนักงานขับรถระยะไกล"
    },
    history: [
      { id: "h1", timestamp: "2026-08-27T09:15:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมแอร์ไม่เย็น", updatedBy: "นายประสิทธิ์ ศรีสวัสดิ์" },
      { id: "h2", timestamp: "2026-08-28T10:00:00.000Z", status: "inspecting", note: "ช่างวิชาญนำเกจวัดแรงดันน้ำยาแอร์ พบแรงดันต่ำกว่า 15 PSI กำลังถอดเช็ครอยรั่ว", updatedBy: "ช่างวิชาญ" }
    ]
  },
  {
    id: "TK-202608-1772",
    ticketNumber: "REP-2026-0803",
    createdAt: "2026-08-26T11:00:00.000Z",
    updatedAt: "2026-08-28T16:00:00.000Z",
    licensePlate: "700-1772",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "Isuzu FTR34QXXXU • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 243830,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายสมเกียรติ พรหมดี",
    requesterPhone: "086-123-7890",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "เปลี่ยนยางใหม่คู่หน้า และตรวจเช็คลูกปืนล้อหน้าซ้ายมีเสียงดังหอนตอนวิ่ง 60-80 กม./ชม.",
    issues: [
      {
        id: "iss-1772-1",
        title: "เปลี่ยนยางคู่หน้า 2 เส้นตามรอบระยะทาง",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ดอกยางหน้าสึกเท่ากันถึงสะพานยาง วิ่งครบ 95,000 กม.",
        urgency: "medium",
        isResolved: false
      },
      {
        id: "iss-1772-2",
        title: "ตรวจเช็คลูกปืนล้อหน้าซ้าย",
        category: "suspension",
        subCategoryId: "sus-steering",
        subCategoryName: "แร็คพวงมาลัย & เพลาขับหน้า/หลัง",
        description: "มีเสียงครางหอนขณะเลี้ยวขวา",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
    ],
    status: "inspecting",
    assignedMechanic: "ช่างมนตรี",
    estimatedCompletionDate: "2026-08-30T15:00:00.000Z",
    partsList: [
      { id: "P-1772-1", name: "ยางรถบรรทุก 6 ล้อ 9.5R17.5 Bridgestone", quantity: 2, unitPrice: 6200, total: 12400 },
      { id: "P-1772-2", name: "ชุดลูกปืนล้อหน้า Isuzu แท้", quantity: 1, unitPrice: 1600, total: 1600 }
    ],
    partsCost: 14000,
    laborCost: 800,
    totalCost: 14800,
    aiDiagnosis: {
      summary: "ยางหน้าสึกตามระยะทาง และลูกปืนล้อหน้าซ้ายจาระบีแห้งเริ่มเป็นตามด",
      possibleCauses: ["การใช้งานระยะทางสะสม", "ซีลลูกปืนกันฝุ่นเสื่อมสภาพ"],
      recommendedChecks: ["อัดจาระบีลูกปืนล้อใหม่หรือเปลี่ยนชุดตลับลูกปืน", "ตั้งศูนย์ถ่วงล้อหน้า"],
      suggestedParts: [
        { name: "ยาง 9.5R17.5", estimatedCost: 12400, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 14800,
      estimatedRepairTimeHours: 2.5,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "ลูกปืนล้อที่ชำรุดอาจทำให้เกิดความร้อนสะสมจนล้อล็อคขณะวิ่งเร็ว"
    },
    history: [
      { id: "h1", timestamp: "2026-08-26T11:00:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนยาง", updatedBy: "นายสมเกียรติ พรหมดี" },
      { id: "h2", timestamp: "2026-08-28T14:00:00.000Z", status: "inspecting", note: "นำรถขึ้นฮอยส์ถอดดรัมเบรกตรวจลูกปืน", updatedBy: "ช่างมนตรี" }
    ]
  },
  {
    id: "TK-202608-2799",
    ticketNumber: "REP-2026-0804",
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
    symptoms: "1. [ระบบเบรก & จานเบรก & ผ้าเบรก] ยางหมดสภาพ สลับยางหาง 3 เพลา 12 เส้นตามรอบ 40,000 กม. และตั้งศูนย์เพลาหาง",
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
      urgencyLevel: "ทั่วไป",
      safetyWarning: "ควรตรวจเช็คซ้ำความแน่นน็อตล้อหลังวิ่งงาน 100 กม. แรก"
    },
    mechanicNotes: "สลับยางครบ 12 เส้น ขันน็อตล้อด้วยประแจปอนด์ 550 Nm ทุกล้อ วัดลมยางได้ 120 PSI เสมอกันทุกเส้น",
    history: [
      { id: "h1", timestamp: "2026-08-22T08:00:00.000Z", status: "pending", note: "เปิดใบงานสลับยางหาง 3 เพลา", updatedBy: "นายวิเชียร มั่นคง" },
      { id: "h2", timestamp: "2026-08-23T10:00:00.000Z", status: "in_progress", note: "นำหางเข้าช่องสลับยางและตรวจเช็คล้อ", updatedBy: "ทีมช่างยาง" },
      { id: "h3", timestamp: "2026-08-24T16:00:00.000Z", status: "completed", note: "ส่งมอบหางพ่วงพร้อมใช้งาน", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-8844",
    ticketNumber: "REP-2026-0805",
    createdAt: "2026-08-19T07:30:00.000Z",
    updatedAt: "2026-08-21T17:00:00.000Z",
    licensePlate: "70-8844",
    province: "พระนครศรีอยุธยา",
    vehicleBrand: "Hino",
    vehicleModel: "Hino 500 Victor 380HP • 10 ล้อหัวลาก",
    vehicleType: "tractor_10w",
    currentMileage: 382400,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายบุญเลิศ แสงทอง (หัวหน้าชุดขับรถบรรทุกหนัก)",
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
    assignedMechanic: "ช่างประสิทธิ์ (หัวหน้าช่างเครื่องยนต์)",
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
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างประสิทธิ์ตรวจพบเร็วมาก เปลี่ยนเสร็จเครื่องเดินเรียบเงียบกริบ วิ่งงานไกลได้อย่างสบายใจครับ",
      reviewerName: "นายบุญเลิศ แสงทอง",
      createdAt: "2026-08-21T18:00:00.000Z",
      tags: ["ช่างมือหนึ่ง", "ปลอดภัย", "อะไหล่แท้ตรงรุ่น"]
    },
    aiDiagnosis: {
      summary: "สายพานหน้าเครื่องหมดอายุการใช้งานและลูกรอกตั้งสายพานลูกปืนแตก หากขาดจะทำให้ปั๊มน้ำและไดชาร์จหยุดทำงานทันที",
      possibleCauses: ["อายุการใช้งานเกิน 100,000 กม.", "ความร้อนสะสมในห้องเครื่อง"],
      recommendedChecks: ["เปลี่ยนสายพานและลูกรอกพร้อมกัน", "ตรวจเช็คการหมุนของพูลเล่ย์ไดชาร์จและปั๊มน้ำ"],
      suggestedParts: [
        { name: "สายพานหน้าเครื่องแท้", estimatedCost: 2900, necessity: "จำเป็นฉุกเฉิน" },
        { name: "ลูกรอกตั้งสายพาน", estimatedCost: 3200, necessity: "จำเป็นฉุกเฉิน" }
      ],
      estimatedLaborCost: 1200,
      estimatedTotalCost: 7300,
      estimatedRepairTimeHours: 3,
      urgencyLevel: "ฉุกเฉิน",
      safetyWarning: "อันตรายสูงสุด เครื่องยนต์จะ Overheat ทันทีหากสายพานขาดขณะวิ่งงาน"
    },
    mechanicNotes: "เปลี่ยนสายพานแท้ Hino ทั้ง 2 เส้น พร้อมชุดลูกรอกตั้งสายพานใหม่ สตาร์ทเทส 30 นาที เสียงเงียบสนิท ไม่มีอาการสั่นหรือสะบัด",
    history: [
      { id: "h1", timestamp: "2026-08-19T07:30:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมด่วน สายพานมีเสียงดัง", updatedBy: "นายบุญเลิศ แสงทอง" },
      { id: "h2", timestamp: "2026-08-20T09:00:00.000Z", status: "in_progress", note: "เบิกอะไหล่แท้ศูนย์และเริ่มถอดประกอบ", updatedBy: "ช่างประสิทธิ์" },
      { id: "h3", timestamp: "2026-08-21T16:30:00.000Z", status: "completed", note: "ส่งมอบรถเรียบร้อย", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-5511",
    ticketNumber: "REP-2026-0806",
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-20T15:00:00.000Z",
    licensePlate: "นข-5511",
    province: "ชลบุรี",
    vehicleBrand: "Toyota",
    vehicleModel: "Toyota Hilux Revo • รถสำนักงาน/เซอร์วิส",
    vehicleType: "pickup_box",
    currentMileage: 112000,
    department: "ฝ่ายบริการและซ่อมบำรุง",
    requesterName: "นายธีระพงษ์ วัฒนา",
    requesterPhone: "084-333-1122",
    category: "lighting",
    subCategoryId: "light-headlight",
    subCategoryName: "ไฟหน้า / ไฟสูง / ไฟตัดหมอก",
    priority: "high",
    symptoms: "หลอดไฟหน้าด้านขวาขาด และไฟสปอร์ตไลท์ตัดหมอกติดๆ ดับๆ จากขั้วสายไฟหลวม",
    issues: [
      {
        id: "iss-5511-1",
        title: "เปลี่ยนหลอดไฟหน้า LED และแก้ไขปลั๊กไฟตัดหมอก",
        category: "lighting",
        subCategoryId: "light-headlight",
        subCategoryName: "ไฟหน้า / ไฟสูง / ไฟตัดหมอก",
        description: "หลอดไฟต่ำขวาไม่สว่าง",
        urgency: "high",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างธีระพงษ์",
    estimatedCompletionDate: "2026-08-20T12:00:00.000Z",
    actualCompletionDate: "2026-08-20T14:30:00.000Z",
    partsList: [
      { id: "P-5511-1", name: "ชุดหลอดไฟหน้า LED Philips H4 แท้", quantity: 1, unitPrice: 1800, total: 1800 },
      { id: "P-5511-2", name: "ชุดปลั๊กกันน้ำและฟิวส์ไฟตัดหมอก", quantity: 1, unitPrice: 250, total: 250 }
    ],
    partsCost: 2050,
    laborCost: 400,
    totalCost: 2450,
    aiDiagnosis: {
      summary: "หลอดไฟหน้าขาดตามชั่วโมงการทำงาน และขั้วปลั๊กไฟตัดหมอกมีคราบขี้เกลือทำให้ไฟกระพริบ",
      possibleCauses: ["การใช้งานเวลากลางคืนต่อเนื่อง", "ความชื้นสะสม"],
      recommendedChecks: ["เปลี่ยนหลอดไฟหน้าคู่หน้า", "ทำความสะอาดและใส่จาระบีซิลิโคนกันชื้นที่ขั้วปลั๊ก"],
      suggestedParts: [
        { name: "หลอดไฟ LED H4", estimatedCost: 1800, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 400,
      estimatedTotalCost: 2450,
      estimatedRepairTimeHours: 1,
      urgencyLevel: "เร่งด่วน",
      safetyWarning: "ทัศนวิสัยเวลากลางคืนลดลง เสี่ยงอุบัติเหตุ"
    },
    history: [
      { id: "h1", timestamp: "2026-08-18T10:00:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมระบบไฟส่องสว่าง", updatedBy: "นายธีระพงษ์ วัฒนา" },
      { id: "h2", timestamp: "2026-08-20T14:30:00.000Z", status: "completed", note: "เปลี่ยนหลอดไฟ ปรับระดับลำแสงมาตรฐาน และส่งมอบเรียบร้อย", updatedBy: "ช่างธีระพงษ์" }
    ]
  },
  {
    id: "TK-202608-1770",
    ticketNumber: "REP-2026-0807",
    createdAt: "2026-08-16T09:00:00.000Z",
    updatedAt: "2026-08-17T15:00:00.000Z",
    licensePlate: "700-1770",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "Isuzu FTR34QXXXU • 6 ล้อตู้ทึบ",
    vehicleType: "box_truck_6w",
    currentMileage: 244100,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายเฉลิมพล สุขใจ",
    requesterPhone: "085-666-7788",
    category: "tires",
    subCategoryId: "tire-puncture",
    subCategoryName: "ปะยาง & เช็คลมยาง & ถ่วงล้อ",
    priority: "low",
    symptoms: "ยางหลังขวาในมีตะปูเกลียวตำ ลมยางซึมช้าๆ ขอปะยางแบบแทงไหม/ดอกเห็ด และเช็คลมยางทุกล้อ",
    issues: [
      {
        id: "iss-1770-1",
        title: "ปะยางแบบดอกเห็ดและถ่วงล้อหลัง",
        category: "tires",
        subCategoryId: "tire-puncture",
        subCategoryName: "ปะยาง & เช็คลมยาง & ถ่วงล้อ",
        description: "มีตะปูตำหน้ายาง ไม่มีรอยแผลที่แก้มยาง",
        urgency: "low",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างมนตรี",
    estimatedCompletionDate: "2026-08-17T12:00:00.000Z",
    actualCompletionDate: "2026-08-17T11:45:00.000Z",
    partsList: [
      { id: "P-1770-1", name: "ดอกเห็ดปะยางเรเดียล Maruni", quantity: 1, unitPrice: 250, total: 250 },
      { id: "P-1770-2", name: "กาวปะยางเคมีและน้ำยาเคลือบซีลยาง", quantity: 1, unitPrice: 100, total: 100 }
    ],
    partsCost: 350,
    laborCost: 200,
    totalCost: 550,
    feedback: {
      id: "fb-1770",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างมนตรีปะยางได้แน่นหนาดีมากครับ เช็คลมยางครบ 6 ล้อพร้อมออกวิ่งงานต่อได้ทันที",
      reviewerName: "นายเฉลิมพล สุขใจ",
      createdAt: "2026-08-17T16:00:00.000Z",
      tags: ["ปะยางแน่นหนา", "ทำงานไว"]
    },
    aiDiagnosis: {
      summary: "รอยตะปูตำบริเวณกึ่งกลางหน้ายาง สามารถปะแบบดอกเห็ด (Mushroom Plug) ปิดสนิททั้งด้านในและด้านนอกได้มาตรฐาน",
      possibleCauses: ["การเหยียบเศษโลหะในไซต์งาน"],
      recommendedChecks: ["ทดสอบจุ่มน้ำเช็ครอยรั่วหลังปะยาง", "วัดแรงดันลมยางคู่หลัง"],
      suggestedParts: [
        { name: "ชุดปะยางดอกเห็ด", estimatedCost: 350, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 200,
      estimatedTotalCost: 550,
      estimatedRepairTimeHours: 1,
      urgencyLevel: "ทั่วไป",
      safetyWarning: "หากปล่อยทิ้งไว้โครงสร้างเข็มขัดรัดหน้ายางอาจขึ้นสนิมจากน้ำที่ซึมเข้า"
    },
    history: [
      { id: "h1", timestamp: "2026-08-16T09:00:00.000Z", status: "pending", note: "แจ้งปะยางล้อหลังขวา", updatedBy: "นายเฉลิมพล สุขใจ" },
      { id: "h2", timestamp: "2026-08-17T11:45:00.000Z", status: "completed", note: "ปะดอกเห็ด ทดสอบรั่วผ่าน ส่งมอบรถเรียบร้อย", updatedBy: "ช่างมนตรี" }
    ]
  }
];
