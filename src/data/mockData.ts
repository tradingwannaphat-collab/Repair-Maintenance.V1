import { RepairTicket } from "../types";
import { TNB_STANDARD_7_TICKETS } from "./tnbStandardTickets7";

// Standard TNB Active & Completed Operations Tickets (7 ใบงานตรงตามระบบหน้างาน TNB)
export const INITIAL_TICKETS: RepairTicket[] = TNB_STANDARD_7_TICKETS;


// Sample Demo Data (Optional for testing and demonstrations)
export const DEMO_SAMPLE_TICKETS: RepairTicket[] = [
  {
    id: "TK-202608-001",
    ticketNumber: "REP-2026-0801",
    createdAt: "2026-08-20T08:30:00.000Z",
    updatedAt: "2026-08-21T09:15:00.000Z",
    licensePlate: "1ฒข-4589",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Toyota",
    vehicleModel: "Hilux Revo 2.8 D-Cab 4WD",
    vehicleType: "pickup_box",
    currentMileage: 84500,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายสมชาย ใจดี (คนขับรถสายเหนือ)",
    requesterPhone: "",
    breakdownLocation: {
      isEmergencyBreakdown: true,
      latitude: 14.238491,
      longitude: 100.709322,
      locationName: "ถนนพหลโยธิน กม. 64 ขาออก (ใกล้นิคมนวนคร-วังน้อย)",
      landmarks: "จอดชิดไหล่ทางซ้าย หน้าปั๊ม ปตท. วังน้อย มีกรวยสะท้อนแสงตั้งเตือน 50 ม.",
      accuracy: 8
    },
    category: "suspension",
    subCategoryId: "sus-brakes",
    subCategoryName: "ระบบเบรก & จานเบรก & ผ้าเบรก",
    priority: "high",
    symptoms: "เบรกแล้วมีเสียงเสียดสีดังกึกๆ พวงมาลัยสั่นเล็กน้อยตอนชะลอความเร็วที่ 80-100 กม./ชม. และโช้คอัพหน้าขวามีคราบน้ำมันซึม",
    issues: [
      {
        id: "iss-1",
        title: "ผ้าเบรกหน้าหมดและจานเบรกสั่นสะท้าน",
        category: "suspension",
        subCategoryId: "sus-brakes",
        subCategoryName: "ระบบเบรก & จานเบรก & ผ้าเบรก",
        description: "เหยียบเบรกแล้วมีเสียงขูดจานชัดเจน แป้นเบรกลึกและพวงมาลัยสั่นขณะแตะเบรกที่ความเร็วเกิน 80 กม./ชม.",
        urgency: "high",
        isResolved: false
      },
      {
        id: "iss-2",
        title: "โช้คอัพหน้าขวามีคราบน้ำมันรั่วซึม",
        category: "suspension",
        subCategoryId: "sus-shocks",
        subCategoryName: "โช้คอัพ & สปริง & เบ้าโช้ค",
        description: "ส่องดูแกนโช้คมีคราบน้ำมันเกาะเยิ้ม ยวบยาบตอนเข้าโค้งหรือตกคอสะพาน",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
    ],
    status: "in_progress",
    assignedMechanic: "ช่างวิชาญ (ช่างช่วงล่างระดับสูง)",
    estimatedCompletionDate: "2026-08-22T16:00:00.000Z",
    partsList: [
      { id: "P-101", name: "ชุดผ้าเบรกหน้าเกรดพรีเมียม (Brembo/Toyota)", quantity: 1, unitPrice: 2400, total: 2400 },
      { id: "P-102", name: "เจียรจานเบรกคู่หน้าแบบประชิดล้อ", quantity: 2, unitPrice: 400, total: 800 },
      { id: "P-103", name: "โช้คอัพแก๊สคู่หน้า Revo 4WD (แท้ห้าง)", quantity: 2, unitPrice: 2800, total: 5600 },
      { id: "P-104", name: "ชุดยางกันกระแทกและยางกันฝุ่นโช้ค", quantity: 2, unitPrice: 350, total: 700 }
    ],
    partsCost: 9500,
    laborCost: 1500,
    totalCost: 11000,
    aiDiagnosis: {
      summary: "ผ้าเบรกหน้าหมดถึงเนื้อเหล็กจานเบรก และโช้คอัพหน้าขวาซีลรั่วทำให้เสียแรงดันน้ำมัน",
      possibleCauses: [
        "ผ้าเบรกหมดสภาพตามระยะการใช้งานงานหนัก",
        "ซีลลูกสูบโช้คอัพฉีกขาดจากการวิ่งทางขรุขระ",
        "จานเบรกคดเล็กน้อยเนื่องจากความร้อนสะสม"
      ],
      recommendedChecks: [
        "ตรวจสอบความหนาจานเบรกหลังเจียร",
        "เช็คยางลูกหมากปีกนกบน-ล่าง",
        "ตั้งศูนย์ถ่วงล้อใหม่หลังเปลี่ยนโช้ค"
      ],
      suggestedParts: [
        { name: "ผ้าเบรกหน้าแท้", estimatedCost: 2500, necessity: "จำเป็นมาก" },
        { name: "โช้คอัพหน้า", estimatedCost: 5500, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 1500,
      estimatedTotalCost: 11000,
      estimatedRepairTimeHours: 4,
      urgencyLevel: "เร่งด่วน",
      safetyWarning: "อันตรายจากระยะเบรกที่ยาวขึ้นและเสี่ยงต่อการเสียการทรงตัวขณะเบรกกะทันหัน"
    },
    mechanicNotes: "ถอดประกอบผ้าเบรกเก่าพบว่าสึกจนถึงหมุดทองเหลือง ทำการเปลี่ยนผ้าเบรกและเจียรจานเรียบร้อย กำลังติดตั้งโช้คหน้าคู่ใหม่",
    history: [
      { id: "h1", timestamp: "2026-08-20T08:30:00.000Z", status: "pending", note: "สร้างใบแจ้งซ่อมเข้าระบบ (แจ้ง 2 ปัญหา: เบรก + โช้ค)", updatedBy: "นายสมชาย ใจดี" },
      { id: "h2", timestamp: "2026-08-20T10:00:00.000Z", status: "inspecting", note: "หัวหน้าช่างรับเรื่อง มอบหมายช่างวิชาญตรวจเช็ค", updatedBy: "หัวหน้าช่างเกรียงไกร" },
      { id: "h3", timestamp: "2026-08-20T13:30:00.000Z", status: "waiting_parts", note: "เบิกอะไหล่ผ้าเบรกและโช้คหน้าแท้จากศูนย์โตโยต้า", updatedBy: "เจ้าหน้าที่พัสดุ" },
      { id: "h4", timestamp: "2026-08-21T09:00:00.000Z", status: "in_progress", note: "อะไหล่มาถึง เริ่มทำการถอดเปลี่ยนช่วงล่าง", updatedBy: "ช่างวิชาญ" }
    ]
  },
  {
    id: "TK-202608-002",
    ticketNumber: "REP-2026-0802",
    createdAt: "2026-08-19T09:15:00.000Z",
    updatedAt: "2026-08-20T15:30:00.000Z",
    licensePlate: "3ขค-1290",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "D-Max Spacecab 1.9 Ddi",
    vehicleType: "pickup_box",
    currentMileage: 40200,
    department: "ฝ่ายขนส่ง",
    requesterName: "นางสาวศิริพร ทรัพย์มั่นคง",
    requesterPhone: "089-123-4567",
    category: "lubricant",
    subCategoryId: "lub-engine-oil",
    subCategoryName: "น้ำมันเครื่อง & ไส้กรองน้ำมันเครื่อง",
    priority: "medium",
    symptoms: "ถึงรอบเปลี่ยนถ่ายน้ำมันเครื่องระยะ 40,000 กม. และขอให้ตรวจเช็คน้ำมันเกียร์ น้ำมันเฟืองท้าย และน้ำยาหล่อเย็น",
    issues: [
      {
        id: "iss-201",
        title: "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์แท้และไส้กรอง",
        category: "lubricant",
        subCategoryId: "lub-engine-oil",
        subCategoryName: "น้ำมันเครื่อง & ไส้กรองน้ำมันเครื่อง",
        description: "ครบกำหนดระยะ 40,000 กม. เติมน้ำมันเครื่องสังเคราะห์แท้ 5W-30",
        urgency: "medium",
        isResolved: true
      },
      {
        id: "iss-202",
        title: "เปลี่ยนถ่ายน้ำมันเกียร์และน้ำมันเฟืองท้ายรอบใหญ่",
        category: "lubricant",
        subCategoryId: "lub-gear-oil",
        subCategoryName: "น้ำมันเกียร์ & น้ำมันเฟืองท้าย",
        description: "เปลี่ยนถ่ายน้ำมันเกียร์ธรรมดาและเฟืองท้ายป้องกันการสึกหรอของเฟือง",
        urgency: "medium",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างอนันต์ (ช่างระบบของเหลว)",
    estimatedCompletionDate: "2026-08-20T12:00:00.000Z",
    actualCompletionDate: "2026-08-20T14:45:00.000Z",
    partsList: [
      { id: "P-201", name: "น้ำมันเครื่องสังเคราะห์แท้ 100% 5W-30 (7 ลิตร)", quantity: 1, unitPrice: 2200, total: 2200 },
      { id: "P-202", name: "ไส้กรองน้ำมันเครื่องแท้ Isuzu", quantity: 1, unitPrice: 290, total: 290 },
      { id: "P-203", name: "แหวนรองน็อตถ่ายน้ำมันเครื่อง", quantity: 1, unitPrice: 30, total: 30 },
      { id: "P-204", name: "น้ำมันเกียร์ธรรมดา Isuzu BESCO Tranself 3 ลิตร", quantity: 1, unitPrice: 750, total: 750 },
      { id: "P-205", name: "น้ำมันเฟืองท้าย Isuzu BESCO Gear Oil 2.5 ลิตร", quantity: 1, unitPrice: 650, total: 650 },
      { id: "P-206", name: "น้ำยาหล่อเย็น Super Long Life Coolant 4 ลิตร", quantity: 1, unitPrice: 580, total: 580 }
    ],
    partsCost: 4500,
    laborCost: 600,
    totalCost: 5100,
    feedback: {
      id: "fb-002",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างอนันต์ทำงานเรียบร้อยมากค่ะ ล้างห้องเครื่องให้สะอาดเอี่ยม อธิบายรายการของเหลวที่เปลี่ยนชัดเจน ส่งมอบรถเร็วกว่ากำหนด ประทับใจมากค่ะ",
      reviewerName: "นางสาวศิริพร ทรัพย์มั่นคง",
      createdAt: "2026-08-20T16:00:00.000Z",
      tags: ["ช่างมืออาชีพ", "ตรงต่อเวลา", "ห้องเครื่องสะอาด", "อธิบายละเอียด"]
    },
    aiDiagnosis: {
      summary: "เช็คระยะตามตารางรอบ 40,000 กม. เปลี่ยนของเหลวเต็มระบบเพื่อรักษาประสิทธิภาพและยืดอายุเครื่องยนต์",
      possibleCauses: ["การเสื่อมสภาพของน้ำมันเครื่องตามระยะเวลาและระยะทาง"],
      recommendedChecks: ["เป่ากรองอากาศและกรองแอร์", "ตรวจเช็คระดับน้ำมันเบรกและคลัตช์"],
      suggestedParts: [
        { name: "น้ำมันเครื่องสังเคราะห์แท้", estimatedCost: 2200, necessity: "จำเป็นมาก" },
        { name: "ไส้กรองน้ำมันเครื่อง", estimatedCost: 300, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 600,
      estimatedTotalCost: 5100,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "หากไม่เปลี่ยนถ่ายตามรอบ อาจเกิดคราบโคลนเหนียวในเครื่องยนต์และเพิ่มอัตราสิ้นเปลืองน้ำมัน"
    },
    mechanicNotes: "เปลี่ยนถ่ายของเหลวครบทุกจุด ตรวจเช็คไม่พบคราบรั่วซึม ล้างห้องเครื่องและรีเซ็ตไฟเตือนรอบเช็คระยะแล้ว ส่งมอบรถคืนเรียบร้อย",
    history: [
      { id: "h1", timestamp: "2026-08-19T09:15:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมเปลี่ยนของเหลว", updatedBy: "นางสาวศิริพร ทรัพย์มั่นคง" },
      { id: "h2", timestamp: "2026-08-19T11:00:00.000Z", status: "in_progress", note: "นำรถเข้าหลุมเปลี่ยนถ่ายของเหลว", updatedBy: "ช่างอนันต์" },
      { id: "h3", timestamp: "2026-08-20T11:30:00.000Z", status: "testing", note: "สตาร์ทเครื่องยนต์ตรวจเช็คการรั่วซึมและวัดระดับน้ำมัน", updatedBy: "ช่างอนันต์" },
      { id: "h4", timestamp: "2026-08-20T14:45:00.000Z", status: "completed", note: "ส่งมอบรถให้ผู้ขับพร้อมใบเสร็จบันทึกประวัติ", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-003",
    ticketNumber: "REP-2026-0803",
    createdAt: "2026-08-21T07:45:00.000Z",
    updatedAt: "2026-08-21T10:00:00.000Z",
    licensePlate: "นข-5511",
    province: "ชลบุรี",
    vehicleBrand: "Honda",
    vehicleModel: "Civic FE 1.5 Turbo RS",
    vehicleType: "sedan",
    currentMileage: 52300,
    department: "ฝ่ายบริหาร",
    requesterName: "นายธนพล สุวรรณเวช (ผู้จัดการฝ่ายการตลาด)",
    requesterPhone: "084-555-8899",
    category: "lighting",
    subCategoryId: "light-headlight",
    subCategoryName: "ไฟหน้า / ไฟสูง / ไฟตัดหมอก",
    priority: "high",
    symptoms: "ไฟหน้า Full LED ฝั่งซ้ายดับทั้งไฟต่ำและไฟเดย์ไลท์ (DRL) ไฟเตือนระบบไฟส่องสว่างโชว์บนหน้าปัด และไฟเลี้ยวซ้ายกะพริบเร็วผิดปกติ",
    issues: [
      {
        id: "iss-301",
        title: "โคมไฟหน้า LED ฝั่งซ้ายไม่ติดและไฟเตือนขึ้นหน้าปัด",
        category: "lighting",
        subCategoryId: "light-headlight",
        subCategoryName: "ไฟหน้า / ไฟสูง / ไฟตัดหมอก",
        description: "ไฟต่ำและไฟ DRL ด้านซ้ายดับสนิท มีข้อความเตือน Headlight Problem บนหน้าปัดดิจิทัล",
        urgency: "high",
        isResolved: false
      },
      {
        id: "iss-302",
        title: "ไฟเลี้ยวหน้าซ้ายกะพริบเร็วเป็น 2 เท่า",
        category: "lighting",
        subCategoryId: "light-tail-brake",
        subCategoryName: "ไฟท้าย / ไฟเบรก / ไฟถอย / ไฟเลี้ยว",
        description: "เมื่อเปิดไฟเลี้ยวซ้าย จังหวะกะพริบเร็วเหมือนโหลดขาด",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    status: "inspecting",
    assignedMechanic: "ช่างธีระพงษ์ (ผู้เชี่ยวชาญระบบไฟฟ้าและกล่องควบคุม)",
    estimatedCompletionDate: "2026-08-22T14:00:00.000Z",
    partsList: [
      { id: "P-301", name: "กล่องควบคุมชุดไฟหน้า LED Driver Module ซ้าย", quantity: 1, unitPrice: 3800, total: 3800 },
      { id: "P-302", name: "ชุดฟิวส์และรีเลย์ระบบไฟหน้าแท้", quantity: 1, unitPrice: 350, total: 350 }
    ],
    partsCost: 4150,
    laborCost: 800,
    totalCost: 4950,
    aiDiagnosis: {
      summary: "โมดูลควบคุมไฟหน้า LED Driver ชำรุดหรือมีสายไฟหลวมทำให้ชุดไฟหน้าซ้ายตัดการทำงานและส่งผลให้ไฟเลี้ยวกะพริบเร็ว",
      possibleCauses: [
        "กล่องควบคุม LED Module ลัดวงจรจากความชื้นหรือเสื่อมสภาพ",
        "ปลั๊กต่อสายไฟขั้วกราวด์หลวมหรือไหม้",
        "ฟิวส์ระบบไฟหน้าขาด"
      ],
      recommendedChecks: [
        "ใช้เครื่องสแกน OBD-II ตรวจเช็คโค้ดข้อผิดพลาดระบบ BCM",
        "วัดแรงดันไฟและกราวด์ที่ปลั๊กไฟหน้าซ้าย",
        "ตรวจเช็คสภาพซีลโคมไฟหน้าว่ามีน้ำรั่วซึมเข้าหรือไม่"
      ],
      suggestedParts: [
        { name: "LED Driver Module", estimatedCost: 3800, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 4950,
      estimatedRepairTimeHours: 2.5,
      urgencyLevel: "เร่งด่วน",
      safetyWarning: "อันตรายอย่างยิ่งเมื่อขับขี่ช่วงค่ำคืน ทัศนวิสัยลดลงและผิดกฎหมายจราจร"
    },
    mechanicNotes: "กำลังใช้คอมพิวเตอร์ Diagnostic Tool สแกนอ่านค่าจากกล่อง BCM พบโค้ด B1203 Left Headlight Circuit Malfunction",
    history: [
      { id: "h1", timestamp: "2026-08-21T07:45:00.000Z", status: "pending", note: "ผู้บริหารแจ้งซ่อมระบบไฟหน้าดับ", updatedBy: "นายธนพล สุวรรณเวช" },
      { id: "h2", timestamp: "2026-08-21T08:30:00.000Z", status: "inspecting", note: "นำรถเข้าช่องตรวจระบบไฟ เช็คแรงดันไฟและกล่องควบคุม", updatedBy: "ช่างธีระพงษ์" }
    ]
  },
  {
    id: "TK-202608-004",
    ticketNumber: "REP-2026-0804",
    createdAt: "2026-08-18T14:20:00.000Z",
    updatedAt: "2026-08-21T08:00:00.000Z",
    licensePlate: "70-8844",
    province: "พระนครศรีอยุธยา",
    vehicleBrand: "Hino",
    vehicleModel: "500 Victor 380HP (10 ล้อบรรทุก)",
    vehicleType: "tractor_10w",
    currentMileage: 198000,
    department: "ฝ่ายขนส่ง",
    requesterName: "นายบุญเลิศ แสงทอง",
    requesterPhone: "086-777-1234",
    category: "engine",
    subCategoryId: "eng-ignition",
    subCategoryName: "ระบบจุดระเบิด / หัวเทียน / คอยล์จุดระเบิด",
    priority: "critical",
    symptoms: "เครื่องยนต์สะดุด กำลังตกเมื่อขึ้นเนิน มีไฟเตือนเครื่องยนต์โชว์ และสังเกตเห็นควันดำออกผิดปกติขณะเร่งแซง",
    issues: [
      {
        id: "iss-401",
        title: "หัวฉีดดีเซลแรงดันสูง Common Rail จ่ายน้ำมันไม่สม่ำเสมอ",
        category: "engine",
        subCategoryId: "eng-ignition",
        subCategoryName: "ระบบจุดระเบิด / หัวเทียน / คอยล์จุดระเบิด",
        description: "เครื่องยนต์กระตุกตอนบรรทุกเต็มพิกัด 15 ตัน ควันดำโขมง เร่งแซงไม่ขึ้น",
        urgency: "critical",
        isResolved: false
      },
      {
        id: "iss-402",
        title: "กรองดักน้ำและกรองโซล่าดีเซลตัน",
        category: "engine",
        subCategoryId: "eng-air-fuel",
        subCategoryName: "กรองอากาศ / ปีกผีเสื้อ / เซ็นเซอร์ไอเสีย O2",
        description: "ไฟเตือน Water in Fuel โชว์เตือนเป็นช่วงๆ",
        urgency: "high",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
    ],
    status: "waiting_parts",
    assignedMechanic: "ช่างประสิทธิ์ (หัวหน้าทีมช่างเครื่องยนต์หนัก)",
    estimatedCompletionDate: "2026-08-24T17:00:00.000Z",
    partsList: [
      { id: "P-401", name: "ชุดหัวฉีด Common Rail แท้ Denso (ชุด 6 หัว)", quantity: 1, unitPrice: 28000, total: 28000 },
      { id: "P-402", name: "ไส้กรองดักน้ำและกรองโซล่าแท้ Hino", quantity: 1, unitPrice: 1850, total: 1850 },
      { id: "P-403", name: "ชุดซีลฝาครอบวาล์วและโอริงหัวฉีด", quantity: 1, unitPrice: 1200, total: 1200 }
    ],
    partsCost: 31050,
    laborCost: 4500,
    totalCost: 35550,
    aiDiagnosis: {
      summary: "หัวฉีดดีเซลแรงดันสูง Common Rail จ่ายน้ำมันไม่สมบูรณ์ เกิดการอุดตันและรั่วไหลภายในหัวฉีด",
      possibleCauses: [
        "หัวฉีดสูบ 3 และสูบ 5 ปลายเข็มสึกหรอและอุดตัน",
        "กรองดักน้ำสกปรกทำให้น้ำมันดีเซลมีสิ่งปนเปื้อนเข้าสู่ระบบ",
        "แรงดันคอมมอนเรลตกหล่นขณะเครื่องยนต์รับโหลดสูง"
      ],
      recommendedChecks: [
        "ทดสอบแรงดันราง Common Rail ด้วยเกจวัด",
        "นำหัวฉีดเข้าแท่นเทสทดสอบอัตราการฉีดและปริมาณน้ำมันไหลกลับ (Back Leak)",
        "ล้างถังน้ำมันเชื้อเพลิงหากพบสิ่งสกปรกสะสม"
      ],
      suggestedParts: [
        { name: "ชุดหัวฉีดแท้", estimatedCost: 28000, necessity: "จำเป็นมาก" },
        { name: "กรองโซล่าดักน้ำ", estimatedCost: 1850, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 4500,
      estimatedTotalCost: 35550,
      estimatedRepairTimeHours: 8,
      urgencyLevel: "ฉุกเฉิน",
      safetyWarning: "เสี่ยงต่อการที่เครื่องยนต์ดับกลางทางขณะบรรทุกหนัก หรือลูกสูบติดเนื่องจากอุณหภูมิการเผาไหม้ผิดปกติ"
    },
    mechanicNotes: "ถอดหัวฉีดทดสอบแท่นเทสพบว่าหัวฉีดสูบ 3 และ 5 ฉีดหยด สั่งเบิกชุดหัวฉีดแท้จากศูนย์ Hino รอสินค้าเข้าวันที่ 22 ส.ค.",
    history: [
      { id: "h1", timestamp: "2026-08-18T14:20:00.000Z", status: "pending", note: "คนขับแจ้งรถกำลังตก ควันดำผิดปกติ", updatedBy: "นายบุญเลิศ แสงทอง" },
      { id: "h2", timestamp: "2026-08-19T09:00:00.000Z", status: "inspecting", note: "ช่างถอดหัวฉีดขึ้นแท่นเทสตรวจเช็ค", updatedBy: "ช่างประสิทธิ์" },
      { id: "h3", timestamp: "2026-08-20T10:30:00.000Z", status: "waiting_parts", note: "รอชุดหัวฉีดแท้ จัดส่งจากคลังสินค้าหลัก", updatedBy: "เจ้าหน้าที่จัดซื้อ" }
    ]
  },
  {
    id: "TK-202608-005",
    ticketNumber: "REP-2026-0805",
    createdAt: "2026-08-17T11:10:00.000Z",
    updatedAt: "2026-08-18T16:00:00.000Z",
    licensePlate: "ฮข-9922",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Toyota",
    vehicleModel: "Commuter 2.8 D-4D (รถตู้รับส่งพนักงาน)",
    vehicleType: "sedan",
    currentMileage: 112000,
    department: "ฝ่ายสำนักงาน",
    requesterName: "นายณรงค์ เกียรติขจร",
    requesterPhone: "082-333-7890",
    category: "aircon",
    subCategoryId: "ac-refrigerant",
    subCategoryName: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf",
    priority: "high",
    symptoms: "แอร์แถวหลังไม่เย็น มีแต่ลมร้อนออกมา ส่วนแอร์แถวหน้าเย็นน้อยมากและมีกลิ่นเหม็นอับ",
    issues: [
      {
        id: "iss-501",
        title: "ตู้แอร์แถวหลังไม่มีความเย็น มีแต่ลมร้อน",
        category: "aircon",
        subCategoryId: "ac-refrigerant",
        subCategoryName: "เช็ครั่ว & เติมน้ำยาแอร์ R134a / R1234yf",
        description: "ผู้โดยสารแถว 2-4 บ่นร้อนมาก แอร์ไม่มีไอเย็นออกมาเลย",
        urgency: "high",
        isResolved: true
      },
      {
        id: "iss-502",
        title: "กลิ่นอับชื้นและฝุ่นสะสมในตู้แอร์หน้า",
        category: "aircon",
        subCategoryId: "ac-cleaning",
        subCategoryName: "ล้างตู้แอร์ (แบบส่องกล้อง / ถอดตู้) & กรอง PM2.5",
        description: "เปิดแอร์ช่วงแรกมีกลิ่นเหม็นอับ ต้องการล้างตู้แอร์และเปลี่ยนกรอง PM2.5",
        urgency: "medium",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างสมเกียรติ (ช่างแอร์รถยนต์)",
    estimatedCompletionDate: "2026-08-18T15:00:00.000Z",
    actualCompletionDate: "2026-08-18T15:45:00.000Z",
    partsList: [
      { id: "P-501", name: "ตู้คอยล์เย็นหลัง (Evaporator Rear)", quantity: 1, unitPrice: 3200, total: 3200 },
      { id: "P-502", name: "วาล์วแอร์บล็อกหน้า-หลัง (Expansion Valve)", quantity: 2, unitPrice: 650, total: 1300 },
      { id: "P-503", name: "กรองแอร์ห้องโดยสาร PM2.5 แอนตี้แบคทีเรีย", quantity: 2, unitPrice: 450, total: 900 },
      { id: "P-504", name: "น้ำยาแอร์ R134a แท้ + น้ำมันคอมเพรสเซอร์ ND-8", quantity: 1, unitPrice: 950, total: 950 }
    ],
    partsCost: 6350,
    laborCost: 1800,
    totalCost: 8150,
    feedback: {
      id: "fb-005",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 4,
      comment: "แอร์กลับมาเย็นฉ่ำทั้งคันแล้วครับ พนักงานที่นั่งรถตู้ชมทุกคน ไม่มีกลิ่นอับแล้ว ช่างสมเกียรติทำงานละเอียดมาก",
      reviewerName: "นายณรงค์ เกียรติขจร",
      createdAt: "2026-08-18T17:30:00.000Z",
      tags: ["แอร์เย็นฉ่ำ", "ไร้กลิ่นอับ", "ช่างเชี่ยวชาญ", "งานเรียบร้อย"]
    },
    aiDiagnosis: {
      summary: "ตู้คอยล์เย็นด้านหลังรั่วซึมทำให้น้ำยาแอร์ในระบบลดต่ำกว่ามาตรฐาน ส่งผลให้แอร์หลังไม่มีความเย็นและแอร์หน้าเย็นน้อย",
      possibleCauses: [
        "คอยล์เย็นด้านหลังผุและเกิดตามดรั่วซึม",
        "กรองแอร์ตันสะสมความชื้นจนเกิดกลิ่นอับ",
        "วาล์วฉีดน้ำยาตันบางส่วน"
      ],
      recommendedChecks: [
        "อัดไนโตรเจนเช็ครอยรั่วทั้งระบบหน้า-หลัง",
        "ล้างทำความสะอาดแผงคอยล์ร้อนหน้ารถ",
        "แวคคั่มระบบไล่ความชื้นก่อนเติมน้ำยาใหม่"
      ],
      suggestedParts: [
        { name: "ตู้คอยล์เย็นหลัง", estimatedCost: 3200, necessity: "จำเป็นมาก" },
        { name: "น้ำยาแอร์ R134a", estimatedCost: 950, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 1800,
      estimatedTotalCost: 8150,
      estimatedRepairTimeHours: 4,
      urgencyLevel: "เร่งด่วน",
      safetyWarning: "ส่งผลกระทบต่อสุขอนามัยและความสะดวกสบายของผู้โดยสาร และคอมแอร์อาจพังหากน้ำมันคอมแห้ง"
    },
    mechanicNotes: "เปลี่ยนตู้แอร์หลัง ล้างตู้หน้า แวคคั่มเติมน้ำยาแอร์ใหม่ วัดอุณหภูมิลมออกหน้าช่องแอร์ได้ 6.5 องศาเซลเซียส เย็นฉ่ำทั้งคัน",
    history: [
      { id: "h1", timestamp: "2026-08-17T11:10:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อมระบบแอร์รถตู้", updatedBy: "นายณรงค์ เกียรติขจร" },
      { id: "h2", timestamp: "2026-08-17T13:00:00.000Z", status: "inspecting", note: "ตรวจเช็กรั่วพบจุดรั่วที่ตู้แอร์หลัง", updatedBy: "ช่างสมเกียรติ" },
      { id: "h3", timestamp: "2026-08-18T09:00:00.000Z", status: "in_progress", note: "ถอดเปลี่ยนตู้แอร์และล้างระบบ", updatedBy: "ช่างสมเกียรติ" },
      { id: "h4", timestamp: "2026-08-18T14:30:00.000Z", status: "testing", note: "เปิดแอร์เทสความเย็น 45 นาที ไม่พบน้ำยารั่ว", updatedBy: "ช่างสมเกียรติ" },
      { id: "h5", timestamp: "2026-08-18T15:45:00.000Z", status: "completed", note: "ส่งมอบรถกลับเข้าประจำการส่วนกลาง", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-006",
    ticketNumber: "REP-2026-0806",
    createdAt: "2026-08-16T13:00:00.000Z",
    updatedAt: "2026-08-17T17:00:00.000Z",
    licensePlate: "2กม-7744",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Toyota",
    vehicleModel: "Yaris Ativ 1.2 Premium Luxury",
    vehicleType: "sedan",
    currentMileage: 48000,
    department: "ฝ่ายบัญชี & การเงิน",
    requesterName: "นางสาวพัชราภรณ์ วงศ์สวัสดิ์",
    requesterPhone: "083-444-2211",
    category: "tires",
    subCategoryId: "tire-replacement",
    subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
    priority: "medium",
    symptoms: "ยางหน้าซ้ายโดนตะปูตำลมยางลดลงเรื่อยๆ และยางทั้ง 4 เส้นใช้มา 48,000 กม. เริ่มมีเนื้อยางแตกลายงา ต้องการเปลี่ยนยางชุดใหม่",
    issues: [
      {
        id: "iss-601",
        title: "เปลี่ยนยางชุดใหม่ 4 เส้นและถ่วงล้อ",
        category: "tires",
        subCategoryId: "tire-replacement",
        subCategoryName: "เปลี่ยนยางใหม่ (ชุด 2 เส้น / 4 เส้น)",
        description: "ยางเดิมแตกลายงา ดอกยางหมด ขอเปลี่ยนเป็นยาง Michelin นุ่มเงียบ",
        urgency: "medium",
        isResolved: true
      },
      {
        id: "iss-602",
        title: "ตั้งศูนย์ล้อระบบเลเซอร์ 3D",
        category: "suspension",
        subCategoryId: "sus-alignment",
        subCategoryName: "ตั้งศูนย์ล้อ & ถ่วงล้อ",
        description: "รถมีอาการกินซ้ายเล็กน้อย ต้องการให้ตั้งศูนย์ล้อใหม่",
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
    assignedMechanic: "ช่างมนตรี (ศูนย์บริการยางและช่วงล่าง)",
    estimatedCompletionDate: "2026-08-17T16:00:00.000Z",
    actualCompletionDate: "2026-08-17T16:30:00.000Z",
    partsList: [
      { id: "P-601", name: "ยางรถยนต์ Michelin Primacy 4 ขนาด 195/60 R16 (ชุด 4 เส้น)", quantity: 4, unitPrice: 3450, total: 13800 },
      { id: "P-602", name: "จุ๊บลมยางสแตนเลสกันสนิม", quantity: 4, unitPrice: 50, total: 200 },
      { id: "P-603", name: "บริการถ่วงล้อ 4 ล้อ และตั้งศูนย์ล้อระบบเลเซอร์ 3D", quantity: 1, unitPrice: 600, total: 600 },
      { id: "P-604", name: "เติมลมยางไนโตรเจน 4 ล้อ", quantity: 1, unitPrice: 200, total: 200 }
    ],
    partsCost: 14000,
    laborCost: 800,
    totalCost: 14800,
    feedback: {
      id: "fb-006",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ยางนุ่มเงียบมาก ขับสบายขึ้นเยอะ ช่างมนตรีแนะนำการดูแลรักษายางดีมากค่ะ พวงมาลัยตรงเป๊ะ",
      reviewerName: "นางสาวพัชราภรณ์ วงศ์สวัสดิ์",
      createdAt: "2026-08-17T18:00:00.000Z",
      tags: ["ขับนุ่มเงียบ", "ตั้งศูนย์ตรง", "บริการรวดเร็ว", "ให้คำแนะนำดี"]
    },
    aiDiagnosis: {
      summary: "ยางรถยนต์หมดอายุการใช้งาน มีรอยรั่วซึมจากของมีคมและเนื้อยางแตกลายงา แนะนำเปลี่ยนยางใหม่ทั้งชุด 4 เส้น",
      possibleCauses: ["ระยะทางวิ่งสะสมและอายุยางเกิน 3 ปี", "การเหยียบของมีคมบนถนน"],
      recommendedChecks: ["ตรวจเช็คความคดของกระทะล้อแม็ก", "ตั้งศูนย์ถ่วงล้อ 4 ล้อ"],
      suggestedParts: [
        { name: "ยางรถยนต์ชุด 4 เส้น", estimatedCost: 13800, necessity: "จำเป็นมาก" }
      ],
      estimatedLaborCost: 800,
      estimatedTotalCost: 14800,
      estimatedRepairTimeHours: 1.5,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "เสี่ยงต่อยางระเบิดขณะใช้ความเร็วสูง หรือลื่นไถลระยะเบรกยาวขณะถนนเปียก"
    },
    mechanicNotes: "เปลี่ยนยาง Michelin ใหม่ 4 เส้น สัปดาห์/ปีผลิตล่าสุด 25/26 ถ่วงล้อและตั้งศูนย์ได้ค่าตามมาตรฐานโรงงาน",
    history: [
      { id: "h1", timestamp: "2026-08-16T13:00:00.000Z", status: "pending", note: "แจ้งเปลี่ยนยางชุดใหม่", updatedBy: "นางสาวพัชราภรณ์ วงศ์สวัสดิ์" },
      { id: "h2", timestamp: "2026-08-17T10:00:00.000Z", status: "in_progress", note: "นำรถขึ้นฮอยส์ถอดเปลี่ยนยาง 4 เส้น", updatedBy: "ช่างมนตรี" },
      { id: "h3", timestamp: "2026-08-17T15:00:00.000Z", status: "testing", note: "ทดสอบวิ่งทางเรียบ พวงมาลัยตรง ศูนย์ล้อไม่ดึง", updatedBy: "ช่างมนตรี" },
      { id: "h4", timestamp: "2026-08-17T16:30:00.000Z", status: "completed", note: "ส่งมอบรถเรียบร้อย", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-007",
    ticketNumber: "REP-2026-0807",
    createdAt: "2026-08-15T10:00:00.000Z",
    updatedAt: "2026-08-19T11:00:00.000Z",
    licensePlate: "5กผ-3311",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Mitsubishi",
    vehicleModel: "Triton Double Cab 4x4",
    vehicleType: "pickup",
    currentMileage: 92000,
    department: "ฝ่ายสำรวจและพัฒนาโครงการ",
    requesterName: "นายพิชัย อารีย์มิตร",
    requesterPhone: "085-888-9900",
    category: "bodywork",
    subCategoryId: "body-paint-dent",
    subCategoryName: "เคาะ ดึงรอยบุบ & พ่นสี 2K อบความร้อน",
    priority: "low",
    symptoms: "มีรอยเฉี่ยวชนเสาในลานจอดรถ กันชนหน้าด้านซ้ายครูดสีถลอก และสเกิร์ตข้างมีรอยบุบเล็กน้อย",
    issues: [
      {
        id: "iss-701",
        title: "เคาะพ่นสีกันชนหน้าซ้ายและสเกิร์ตข้าง",
        category: "bodywork",
        subCategoryId: "body-paint-dent",
        subCategoryName: "เคาะ ดึงรอยบุบ & พ่นสี 2K อบความร้อน",
        description: "รอยครูดลึกถึงเนื้อพลาสติกกันชนและสเกิร์ตบุบ",
        urgency: "low",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างสุรชัย (แผนกเคาะพ่นสี 2K)",
    estimatedCompletionDate: "2026-08-19T12:00:00.000Z",
    actualCompletionDate: "2026-08-19T10:30:00.000Z",
    partsList: [
      { id: "P-701", name: "กิ๊บล็อคกันชนหน้าแท้ Triton", quantity: 6, unitPrice: 45, total: 270 },
      { id: "P-702", name: "วัสดุสีรองพื้นและสี 2K สูตรโรงงาน Mitsubishi", quantity: 1, unitPrice: 1500, total: 1500 }
    ],
    partsCost: 1770,
    laborCost: 3500,
    totalCost: 5270,
    feedback: {
      id: "fb-007",
      rating: 4,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 4,
      comment: "สีเนียนมาก เทียบกับสีตัวถังเดิมมองไม่เห็นรอยต่อเลย ช่างสุรชัยฝีมือดีมากครับ",
      reviewerName: "นายพิชัย อารีย์มิตร",
      createdAt: "2026-08-19T14:00:00.000Z",
      tags: ["สีเนียนสวย", "ฝีมือประณีต", "เทียบสีเหมือนศูนย์"]
    },
    aiDiagnosis: {
      summary: "รอยขูดขีดระดับชั้นสีจริงและแล็กเกอร์บริเวณกันชนหน้าซ้ายและสเกิร์ต ไม่โดนโครงสร้างคานนิรภัย",
      possibleCauses: ["การเฉี่ยวชนวัตถุแข็งขณะเข้าจอด"],
      recommendedChecks: ["ตรวจเช็คเซ็นเซอร์กะระยะหน้ารถว่าทำงานปกติหรือไม่", "ตรวจเช็คขาล็อคโคมไฟตัดหมอก"],
      suggestedParts: [
        { name: "สี 2K และสารเคลือบเงา", estimatedCost: 1500, necessity: "จำเป็น" }
      ],
      estimatedLaborCost: 3500,
      estimatedTotalCost: 5270,
      estimatedRepairTimeHours: 12,
      urgencyLevel: "ทั่วไป",
      safetyWarning: "ไม่มีผลต่อความปลอดภัยในการขับขี่ แต่ควรซ่อมเพื่อป้องกันสนิมกัดกินเนื้อเหล็ก"
    },
    mechanicNotes: "ขัดแต่งรอย เคาะคืนรูปสเกิร์ต พ่นสี 2K ในห้องอบสีมาตรฐาน อบความร้อน 60 องศา เคลือบเงาเนียนเหมือนใหม่ออกจากศูนย์",
    history: [
      { id: "h1", timestamp: "2026-08-15T10:00:00.000Z", status: "pending", note: "แจ้งเคลมทำสีกันชนหน้าและสเกิร์ต", updatedBy: "นายพิชัย อารีย์มิตร" },
      { id: "h2", timestamp: "2026-08-16T09:00:00.000Z", status: "in_progress", note: "ถอดชิ้นส่วนเข้าห้องขัดแต่งและเทียบเบอร์สี", updatedBy: "ช่างสุรชัย" },
      { id: "h3", timestamp: "2026-08-18T14:00:00.000Z", status: "testing", note: "ประกอบชิ้นส่วนคืนตัวรถ ตรวจสอบความเรียบร้อยของชั้นสี", updatedBy: "ช่างสุรชัย" },
      { id: "h4", timestamp: "2026-08-19T10:30:00.000Z", status: "completed", note: "ส่งมอบรถคืนแผนกสำรวจ", updatedBy: "หัวหน้าช่างเกรียงไกร" }
    ]
  },
  {
    id: "TK-202608-008",
    ticketNumber: "REP-2026-0808",
    createdAt: "2026-08-21T09:30:00.000Z",
    updatedAt: "2026-08-21T09:40:00.000Z",
    licensePlate: "6กง-1122",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Toyota",
    vehicleModel: "Corolla Altis 1.8 Hybrid",
    vehicleType: "sedan",
    currentMileage: 60000,
    department: "ฝ่ายต้อนรับและประสานงาน VIP",
    requesterName: "นายกิตติศักดิ์ รัตนโรจน์",
    requesterPhone: "081-444-5566",
    category: "inspection",
    subCategoryId: "insp-major-pm",
    subCategoryName: "เช็คระยะใหญ่ (40,000 / 80,000 / 100,000 กม.)",
    priority: "medium",
    symptoms: "ถึงรอบตรวจเช็คระยะ 60,000 กม. เช็คระบบไฮบริด แบตเตอรี่ HV แอร์ กรองฝุ่น และตรวจสภาพช่วงล่างทั่วไป",
    issues: [
      {
        id: "iss-801",
        title: "ตรวจเช็คระยะมาตรฐาน 60,000 กม. และระบบ Hybrid",
        category: "inspection",
        subCategoryId: "insp-major-pm",
        subCategoryName: "เช็คระยะใหญ่ (40,000 / 80,000 / 100,000 กม.)",
        description: "สแกนสุขภาพแบตเตอรี่ไฮบริด HV และเปลี่ยนถ่ายของเหลว",
        urgency: "medium",
        isResolved: false
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
    ],
    status: "pending",
    partsList: [
      { id: "P-801", name: "น้ำมันเครื่องสังเคราะห์แท้ 0W-20 สำหรับไฮบริด (4 ลิตร)", quantity: 1, unitPrice: 1650, total: 1650 },
      { id: "P-802", name: "ไส้กรองน้ำมันเครื่อง Toyota แท้", quantity: 1, unitPrice: 280, total: 280 },
      { id: "P-803", name: "ไส้กรองพัดลมระบายความร้อนแบตเตอรี่ไฮบริด", quantity: 1, unitPrice: 320, total: 320 },
      { id: "P-804", name: "น้ำยาทำความสะอาดระบบหัวฉีดเชื้อเพลิง", quantity: 1, unitPrice: 390, total: 390 }
    ],
    partsCost: 2640,
    laborCost: 900,
    totalCost: 3540,
    aiDiagnosis: {
      summary: "ตรวจเช็คระยะรอบ 60,000 กม. พร้อมตรวจสอบสุขภาพระบบ Hybrid และทำความสะอาดช่องระบายความร้อนแบตเตอรี่",
      possibleCauses: ["การตรวจสภาพตามรอบระยะทางที่กำหนด"],
      recommendedChecks: ["สแกน Health Check แบตเตอรี่ HV", "ตรวจเช็คระดับน้ำยาหล่อเย็นอินเวอร์เตอร์", "ตรวจเช็คผ้าเบรกและน้ำมันเบรก"],
      suggestedParts: [
        { name: "น้ำมันเครื่องไฮบริด 0W-20", estimatedCost: 1650, necessity: "จำเป็นมาก" },
        { name: "กรองพัดลมแบตเตอรี่", estimatedCost: 320, necessity: "ควรเปลี่ยน" }
      ],
      estimatedLaborCost: 900,
      estimatedTotalCost: 3540,
      estimatedRepairTimeHours: 2,
      urgencyLevel: "ปานกลาง",
      safetyWarning: "การดูแลระบบไฮบริดตามระยะช่วยป้องกันความร้อนสะสมในแบตเตอรี่ HV"
    },
    history: [
      { id: "h1", timestamp: "2026-08-21T09:30:00.000Z", status: "pending", note: "ส่งคำขอตรวจเช็คระยะ 60,000 กม.", updatedBy: "นายกิตติศักดิ์ รัตนโรจน์" }
    ]
  },
  {
    id: "TK-202607-009",
    ticketNumber: "REP-2026-0709",
    createdAt: "2026-07-28T08:15:00.000Z",
    updatedAt: "2026-07-29T16:00:00.000Z",
    licensePlate: "1ฒข-4589",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Toyota",
    vehicleModel: "Hilux Revo 2.8 D-Cab 4WD",
    vehicleType: "pickup",
    currentMileage: 81000,
    department: "ฝ่ายโลจิสติกส์ & กระจายสินค้า",
    requesterName: "นายสมชาย ใจดี",
    requesterPhone: "081-987-6543",
    category: "lubricant",
    subCategoryId: "lub-engine-oil",
    subCategoryName: "น้ำมันเครื่อง & ไส้กรองน้ำมันเครื่อง",
    priority: "medium",
    symptoms: "เปลี่ยนถ่ายน้ำมันเครื่องระยะ 80,000 กม. และเปลี่ยนไส้กรองน้ำมันเชื้อเพลิง (กรองดีเซล)",
    issues: [
      {
        id: "iss-901",
        title: "เปลี่ยนถ่ายน้ำมันเครื่องดีเซลและกรองโซล่า",
        category: "lubricant",
        subCategoryId: "lub-engine-oil",
        subCategoryName: "น้ำมันเครื่อง & ไส้กรองน้ำมันเครื่อง",
        description: "เปลี่ยนถ่ายน้ำมันเครื่องดีเซล 80,000 กม.",
        urgency: "medium",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างอนันต์",
    estimatedCompletionDate: "2026-07-29T14:00:00.000Z",
    actualCompletionDate: "2026-07-29T15:30:00.000Z",
    partsList: [
      { id: "P-901", name: "น้ำมันเครื่องดีเซลสังเคราะห์แท้ 5W-30 (7.5 ลิตร)", quantity: 1, unitPrice: 2400, total: 2400 },
      { id: "P-902", name: "ไส้กรองน้ำมันเครื่อง Toyota แท้", quantity: 1, unitPrice: 290, total: 290 },
      { id: "P-903", name: "ไส้กรองน้ำมันโซล่าแท้ Toyota Hilux Revo", quantity: 1, unitPrice: 550, total: 550 }
    ],
    partsCost: 3240,
    laborCost: 500,
    totalCost: 3740,
    feedback: {
      id: "fb-009",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างอนันต์ทำงานไวและเรียบร้อยดีมาก รถวิ่งลื่นขึ้นเยอะครับ",
      reviewerName: "นายสมชาย ใจดี",
      createdAt: "2026-07-29T17:00:00.000Z",
      tags: ["บริการประทับใจ", "รวดเร็ว", "เครื่องยนต์วิ่งลื่น"]
    },
    history: [
      { id: "h1", timestamp: "2026-07-28T08:15:00.000Z", status: "pending", note: "เปิดใบแจ้งซ่อม", updatedBy: "นายสมชาย ใจดี" },
      { id: "h2", timestamp: "2026-07-29T15:30:00.000Z", status: "completed", note: "เปลี่ยนถ่ายของเหลวเรียบร้อย", updatedBy: "ช่างอนันต์" }
    ]
  },
  {
    id: "TK-202607-010",
    ticketNumber: "REP-2026-0710",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-22T17:00:00.000Z",
    licensePlate: "ฟล-9021",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Komatsu",
    vehicleModel: "FD30T-17 (รถโฟล์คลิฟต์ดีเซล 3 ตัน)",
    vehicleType: "forklift",
    currentMileage: 4200,
    department: "คลังสินค้าและจัดเก็บวัตถุดิบ",
    requesterName: "นายชัชวาล เลิศปัญญา",
    requesterPhone: "087-111-2233",
    category: "suspension",
    subCategoryId: "sus-steering",
    subCategoryName: "แร็คพวงมาลัย & เพลาขับหน้า/หลัง",
    priority: "high",
    symptoms: "สายไฮดรอลิกเสากระโดงยกของมีรอยแตกร้าวและน้ำมันไฮดรอลิกรั่วซึม แรงยกตกเวลายกของหนักเกิน 1.5 ตัน",
    issues: [
      {
        id: "iss-1001",
        title: "สายไฮดรอลิกเสายกแตกร้าวและแรงดันตก",
        category: "suspension",
        subCategoryId: "sus-steering",
        subCategoryName: "แร็คพวงมาลัย & เพลาขับหน้า/หลัง",
        description: "น้ำมันไฮดรอลิกรั่วซึมเวลาทำงานหนัก เสายกกระตุก",
        urgency: "high",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
    ],
    completionImages: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างประสิทธิ์",
    estimatedCompletionDate: "2026-07-22T16:00:00.000Z",
    actualCompletionDate: "2026-07-22T16:45:00.000Z",
    partsList: [
      { id: "P-1001", name: "สายไฮดรอลิกแรงดันสูง 2 ชั้น (High Pressure Hose)", quantity: 2, unitPrice: 2100, total: 4200 },
      { id: "P-1002", name: "น้ำมันไฮดรอลิก ISO VG 68 (20 ลิตร)", quantity: 1, unitPrice: 2800, total: 2800 },
      { id: "P-1003", name: "ชุดซีลกระบอกสูบไฮดรอลิกยกเสา", quantity: 1, unitPrice: 1500, total: 1500 }
    ],
    partsCost: 8500,
    laborCost: 2000,
    totalCost: 10500,
    feedback: {
      id: "fb-010",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างประสิทธิ์ซ่อมรถโฟล์คลิฟต์ได้รวดเร็วมากครับ ตอนนี้ยกพาเลท 2.5 ตันได้นิ่มนวล ไม่สะดุด",
      reviewerName: "นายชัชวาล เลิศปัญญา",
      createdAt: "2026-07-23T09:00:00.000Z",
      tags: ["ยกของได้เต็มกำลัง", "ปลอดภัย", "ซ่อมเร็วทันใจ"]
    },
    history: [
      { id: "h1", timestamp: "2026-07-20T10:00:00.000Z", status: "pending", note: "แจ้งสายไฮดรอลิกรั่ว", updatedBy: "นายชัชวาล เลิศปัญญา" },
      { id: "h2", timestamp: "2026-07-22T16:45:00.000Z", status: "completed", note: "เปลี่ยนสายไฮดรอลิกและทดสอบยกพาเลท 2.5 ตันผ่านฉลุย", updatedBy: "ช่างประสิทธิ์" }
    ]
  },
  {
    id: "TK-202607-011",
    ticketNumber: "REP-2026-0711",
    createdAt: "2026-07-14T09:00:00.000Z",
    updatedAt: "2026-07-15T15:00:00.000Z",
    licensePlate: "3ขค-1290",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "Isuzu",
    vehicleModel: "D-Max Spacecab 1.9 Ddi",
    vehicleType: "pickup",
    currentMileage: 38200,
    department: "ฝ่ายขายต่างจังหวัด (ภาคกลาง)",
    requesterName: "นางสาวศิริพร ทรัพย์มั่นคง",
    requesterPhone: "089-123-4567",
    category: "lighting",
    subCategoryId: "light-tail-brake",
    subCategoryName: "ไฟท้าย / ไฟเบรก / ไฟถอย / ไฟเลี้ยว",
    priority: "low",
    symptoms: "หลอดไฟเบรกดวงท้ายขวาขาด และไฟส่องป้ายทะเบียนไม่ติด 1 ข้าง",
    issues: [
      {
        id: "iss-1101",
        title: "เปลี่ยนหลอดไฟเบรกขวาและไฟส่องป้ายทะเบียน",
        category: "lighting",
        subCategoryId: "light-tail-brake",
        subCategoryName: "ไฟท้าย / ไฟเบรก / ไฟถอย / ไฟเลี้ยว",
        description: "หลอดไฟท้ายไส้ขาด ไม่สว่างตอนแตะเบรก",
        urgency: "low",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างธีระพงษ์",
    estimatedCompletionDate: "2026-07-15T12:00:00.000Z",
    actualCompletionDate: "2026-07-15T11:30:00.000Z",
    partsList: [
      { id: "P-1101", name: "หลอดไฟเบรกขั้วเสียบ T20 แท้", quantity: 2, unitPrice: 120, total: 240 },
      { id: "P-1102", name: "หลอดไฟส่องป้ายทะเบียน T10", quantity: 2, unitPrice: 60, total: 120 }
    ],
    partsCost: 360,
    laborCost: 200,
    totalCost: 560,
    feedback: {
      id: "fb-011",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "บริการรวดเร็วมากค่ะ มาถึงเปลี่ยนแป๊บเดียวเสร็จ ไฟสว่างชัดเจน",
      reviewerName: "นางสาวศิริพร ทรัพย์มั่นคง",
      createdAt: "2026-07-15T13:00:00.000Z",
      tags: ["เปลี่ยนไว", "ไฟสว่างชัด"]
    },
    history: [
      { id: "h1", timestamp: "2026-07-14T09:00:00.000Z", status: "pending", note: "แจ้งเปลี่ยนหลอดไฟท้าย", updatedBy: "นางสาวศิริพร ทรัพย์มั่นคง" },
      { id: "h2", timestamp: "2026-07-15T11:30:00.000Z", status: "completed", note: "เปลี่ยนหลอดไฟและเช็คระบบสว่างครบถ้วน", updatedBy: "ช่างธีระพงษ์" }
    ]
  },
  {
    id: "TK-202607-012",
    ticketNumber: "REP-2026-0712",
    createdAt: "2026-07-05T13:30:00.000Z",
    updatedAt: "2026-07-08T17:00:00.000Z",
    licensePlate: "70-8844",
    province: "พระนครศรีอยุธยา",
    vehicleBrand: "Hino",
    vehicleModel: "500 Victor 380HP (10 ล้อบรรทุก)",
    vehicleType: "truck",
    currentMileage: 192000,
    department: "ฝ่ายขนส่งสินค้าหนักโรงงาน",
    requesterName: "นายบุญเลิศ แสงทอง",
    requesterPhone: "086-777-1234",
    category: "suspension",
    subCategoryId: "sus-shocks",
    subCategoryName: "โช้คอัพ & สปริง & เบ้าโช้ค",
    priority: "high",
    symptoms: "แหนบหลังหัก 1 แผ่น และยางรองบูชหูแหนบแตกชำรุดจากการบรรทุกหนัก",
    issues: [
      {
        id: "iss-1201",
        title: "เปลี่ยนแผ่นแหนบหลังและบูชหูแหนบ",
        category: "suspension",
        subCategoryId: "sus-shocks",
        subCategoryName: "โช้คอัพ & สปริง & เบ้าโช้ค",
        description: "แผ่นแหนบตัวที่ 3 หักสองท่อน รถเอียงซ้ายขณะวิ่ง",
        urgency: "high",
        isResolved: true
      }
    ],
    attachedImages: [
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
    ],
    status: "completed",
    assignedMechanic: "ช่างวิชาญ",
    estimatedCompletionDate: "2026-07-08T16:00:00.000Z",
    actualCompletionDate: "2026-07-08T16:30:00.000Z",
    partsList: [
      { id: "P-1201", name: "แผ่นแหนบหลังแผ่นที่ 3 หนาพิเศษแท้ Hino", quantity: 2, unitPrice: 3800, total: 7600 },
      { id: "P-1202", name: "ชุดบูชหูแหนบยูรีเทนทนทานสูง", quantity: 1, unitPrice: 2400, total: 2400 },
      { id: "P-1203", name: "สาแหรกแหนบหลังพร้อมน็อตตัวเมีย", quantity: 4, unitPrice: 450, total: 1800 }
    ],
    partsCost: 11800,
    laborCost: 2500,
    totalCost: 14300,
    feedback: {
      id: "fb-012",
      rating: 5,
      technicianRating: 5,
      serviceQualityRating: 5,
      timelinessRating: 5,
      comment: "ช่างวิชาญใส่แหนบแท้หนาพิเศษให้ แข็งแรง ทรงตัวดีเยี่ยม บรรทุกของหนักได้อย่างมั่นใจครับ",
      reviewerName: "นายบุญเลิศ แสงทอง",
      createdAt: "2026-07-09T08:00:00.000Z",
      tags: ["แข็งแรงทนทาน", "ช่างช่วงล่างตัวจริง", "งานคุณภาพ"]
    },
    history: [
      { id: "h1", timestamp: "2026-07-05T13:30:00.000Z", status: "pending", note: "แจ้งแหนบหลังหัก", updatedBy: "นายบุญเลิศ แสงทอง" },
      { id: "h2", timestamp: "2026-07-08T16:30:00.000Z", status: "completed", note: "เปลี่ยนแหนบและสาแหรกใหม่ทดสอบน้ำหนักผ่านเกณฑ์", updatedBy: "ช่างวิชาญ" }
    ]
  }
];
