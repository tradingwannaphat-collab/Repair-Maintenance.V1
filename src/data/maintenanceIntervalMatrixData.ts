import { 
  MaintenanceIntervalPlan, 
  MaintenanceIntervalCheckItem, 
  MileageAlertEvaluation, 
  VehicleRecord, 
  VehicleType 
} from "../types";

export const MAINTENANCE_INTERVAL_PLANS: MaintenanceIntervalPlan[] = [
  {
    intervalKm: 10000,
    intervalNameTh: "ระยะ 10,000 - 15,000 กม. (PM 1: เช็คระยะเบื้องต้น / A-Service)",
    intervalNameEn: "Minor Inspection & Oil Service",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    targetMonths: 3,
    description: "บำรุงรักษาขั้นพื้นฐาน เปลี่ยนถ่ายน้ำมันเครื่อง ไส้กรอง ตรวจระดับของเหลว ระบบเบรกเบื้องต้น และเช็คลมยาง",
    totalItemsCount: 10,
    inHouseItemsCount: 8,
    dealerItemsCount: 2,
    estimatedTotalCost: 3500,
    items: [
      {
        id: "pm1-1",
        category: "lubricant",
        categoryNameTh: "ระบบหล่อลื่น & ของเหลว",
        itemTitle: "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์เกรดงานหนัก (Heavy Duty Diesel Engine Oil 15W-40 / 10W-40)",
        itemDescription: "ถ่ายน้ำมันเก่าและเติมน้ำมันเครื่องใหม่ตามความจุเครื่องยนต์ (ประมาณ 18-24 ลิตร)",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำมันเครื่องสังเคราะห์ TNB Shell/Caltex 15W-40", "แหวนรองน็อตอ่างน้ำมันเครื่อง"],
        estimatedLaborMinutes: 30,
        estimatedCost: 2400,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-2",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "เปลี่ยนไส้กรองน้ำมันเครื่องแท้ (Engine Oil Filter)",
        itemDescription: "เปลี่ยนลูกกรองน้ำมันเครื่องและโอริงซีลกันรั่ว",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["กรองน้ำมันเครื่องแท้ Isuzu/Hino/Toyota"],
        estimatedLaborMinutes: 15,
        estimatedCost: 650,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-3",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "เป่าทำความสะอาดไส้กรองอากาศ และตรวจเช็คท่อดักอากาศ",
        itemDescription: "เป่าลมจากด้านในออกด้านนอก ตรวจดูรอยฉีกขาดของกระดาษกรอง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: false
      },
      {
        id: "pm1-4",
        category: "lubricant",
        categoryNameTh: "ระบบหล่อลื่น & ของเหลว",
        itemTitle: "ตรวจเช็คระดับน้ำยาหล่อเย็นหม้อน้ำ & ถังพักน้ำ (Coolant Level)",
        itemDescription: "ระดับต้องอยู่ระหว่าง FULL - LOW ตรวจคราบสนิมและรอยรั่วที่ท่อยางหม้อน้ำ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำยาหล่อเย็น Coolant Long Life"],
        estimatedLaborMinutes: 10,
        estimatedCost: 150,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-5",
        category: "tires",
        categoryNameTh: "ยาง & ล้อ",
        itemTitle: "ตรวจวัดแรงดันลมยางทุกล้อ และวัดความลึกร่องดอกยาง (Tire Tread & Pressure)",
        itemDescription: "วัดลมยาง 110-120 PSI ดอกยางต้องไม่ต่ำกว่า 2.0 มม. พร้อมตรวจรอยบวม/ฉีกขาด",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 20,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-6",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง & เบรก",
        itemTitle: "ขันแน่นน็อตล้อทุกล้อด้วยประแจปอนด์ (Wheel Lug Nut Torque Check)",
        itemDescription: "กวดขันน็อตล้อตามแรงบิดมาตรฐาน 550 - 600 Nm",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 20,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-7",
        category: "lighting",
        categoryNameTh: "ระบบไฟฟ้า & ส่องสว่าง",
        itemTitle: "ตรวจเช็คระบบไฟส่องสว่าง ไฟเลี้ยว ไฟเบรก ไฟฉุกเฉิน และสัญญาณแตร",
        itemDescription: "ทดสอบการทำงานของหลอดไฟทุกดวงรอบคันรถและไฟหัวลาก/หางพ่วง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-8",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง & เบรก",
        itemTitle: "ตรวจเช็คระดับน้ำมันเบรก น้ำมันคลัตช์ และดึงห่วงระบายน้ำถังลมเบรก",
        itemDescription: "ระบายน้ำสะสมใต้ถังลมเบรกลูกหน้าและลูกหลัง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm1-9",
        category: "engine",
        categoryNameTh: "เครื่องยนต์ & กล่องควบคุม",
        itemTitle: "สแกนโค้ดกล่อง ECU วิเคราะห์ระบบหัวฉีดคอมมอนเรล (OBD Diagnostic Scan)",
        itemDescription: "เชื่อมต่อเครื่องสแกนเช็คประวัติ Error Code และค่าการฉีดน้ำมัน",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 30,
        estimatedCost: 500,
        isCrucialSafetyItem: false
      },
      {
        id: "pm1-10",
        category: "tires",
        categoryNameTh: "ยาง & ล้อ",
        itemTitle: "ตรวจเช็คศูนย์ล้อหน้าและมุมแคมเบอร์/โท (Wheel Alignment Inspection)",
        itemDescription: "ขึ้นแท่นตรวจวัดมุมล้อเพื่อป้องกันปัญหายางกินข้าง",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 40,
        estimatedCost: 600,
        isCrucialSafetyItem: false
      }
    ]
  },
  {
    intervalKm: 30000,
    intervalNameTh: "ระยะ 30,000 - 40,000 กม. (PM 2: เช็คระยะปานกลาง / B-Service)",
    intervalNameEn: "Intermediate Service & Drivetrain Fluids",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    targetMonths: 6,
    description: "งาน PM1 + เปลี่ยนถ่ายน้ำมันเกียร์/เฟืองท้าย ไส้กรองอากาศ ไส้กรองดักน้ำ อัดจารบีช่วงล่าง สลับยาง และตรวจผ้าเบรก",
    totalItemsCount: 14,
    inHouseItemsCount: 11,
    dealerItemsCount: 3,
    estimatedTotalCost: 8500,
    items: [
      {
        id: "pm2-1",
        category: "lubricant",
        categoryNameTh: "ระบบหล่อลื่น & ของเหลว",
        itemTitle: "ดำเนินการครบทุกรายการตามมาตรฐาน PM 1 (น้ำมันเครื่อง+กรองเครื่อง)",
        itemDescription: "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์ ไส้กรอง และตรวจเช็คระบบพื้นฐาน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำมันเครื่องสังเคราะห์", "กรองเครื่องแท้"],
        estimatedLaborMinutes: 45,
        estimatedCost: 3050,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-2",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "เปลี่ยนไส้กรองอากาศเครื่องยนต์ใหม่ (Air Cleaner Element Replacement)",
        itemDescription: "เปลี่ยนลูกกรองอากาศใหม่ เพื่อให้อากาศเข้าห้องเผาไหม้ได้บริสุทธิ์และประหยัดน้ำมัน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ไส้กรองอากาศแท้ตรงรุ่น"],
        estimatedLaborMinutes: 15,
        estimatedCost: 850,
        isCrucialSafetyItem: false
      },
      {
        id: "pm2-3",
        category: "engine",
        categoryNameTh: "เครื่องยนต์ & เชื้อเพลิง",
        itemTitle: "เปลี่ยนไส้กรองน้ำมันดีเซล & กรองดักน้ำ (Fuel Filter & Water Separator)",
        itemDescription: "เปลี่ยนไส้กรองดักน้ำและกรองโซล่าละเอียด ป้องกันหัวฉีดตัน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["กรองโซล่าแท้", "กรองดักน้ำ"],
        estimatedLaborMinutes: 25,
        estimatedCost: 950,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-4",
        category: "lubricant",
        categoryNameTh: "ระบบส่งกำลัง & เฟืองท้าย",
        itemTitle: "เปลี่ยนถ่ายน้ำมันเกียร์และน้ำมันเฟืองท้าย (Manual Transmission & Differential Oil)",
        itemDescription: "เปลี่ยนถ่ายน้ำมันเกียร์ SAE 80W-90 / 85W-140 และน้ำมันเฟืองท้ายเบอร์ 140",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำมันเกียร์ SAE 80W-90 (8-12 ลิตร)", "น้ำมันเฟืองท้าย SAE 85W-140 (12-16 ลิตร)"],
        estimatedLaborMinutes: 45,
        estimatedCost: 2600,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-5",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง",
        itemTitle: "อัดจารบีช่วงล่าง กากบาทเพลากลาง สลักแหนบ และลูกหมาก (Chassis & Driveline Greasing)",
        itemDescription: "อัดจารบีแรงดันสูงตามจุดหัวอัด (Grease Nipples) 18-24 จุดรอบคัน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["จารบีสังเคราะห์ทนความร้อนสูง NLGI No.2"],
        estimatedLaborMinutes: 40,
        estimatedCost: 350,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-6",
        category: "suspension",
        categoryNameTh: "ระบบเบรก & ล้อ",
        itemTitle: "ตรวจเช็คความหนาผ้าเบรก จานเบรก/ดรัมเบรก และตั้งระยะแร็คปรับลมเบรก (Slack Adjuster)",
        itemDescription: "ความหนาผ้าเบรกต้องไม่ต่ำกว่า 5 มม. ปรับตั้งระยะดึงของหม้อลมเบรก",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 35,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-7",
        category: "tires",
        categoryNameTh: "ยาง & ล้อ",
        itemTitle: "สลับยางและถ่วงล้อตามรูปแบบไขว้/แนวตรง (Tire Rotation & Balancing)",
        itemDescription: "สลับยางหน้า-หลัง เพื่อให้หน้ายางสึกเรียบสม่ำเสมอ ยืดอายุยาง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 45,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-8",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "ตรวจเช็คสภาพสายพานหน้าเครื่อง สายพานพัดลม และลูกรอกตั้งสายพาน",
        itemDescription: "ตรวจรอยแตกลายงา รอยฉีก และความตึงของสายพาน (ระยะยุบ 10-15 มม.)",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-9",
        category: "lighting",
        categoryNameTh: "ระบบไฟฟ้า",
        itemTitle: "ตรวจวัดแรงดันไดชาร์จและสภาพแบตเตอรี่ (Alternator Output & Battery Health)",
        itemDescription: "วัดโวลต์ขณะสตาร์ทและขณะเร่งเครื่อง (27.5 - 28.8 V สำหรับระบบ 24V)",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: false
      },
      {
        id: "pm2-10",
        category: "aircon",
        categoryNameTh: "ระบบปรับอากาศ",
        itemTitle: "เปลี่ยนกรองแอร์ห้องโดยสารและล้างทำความสะอาดรังผึ้งคอยล์ร้อนหน้ารถ",
        itemDescription: "เปลี่ยนกรอง PM2.5 และฉีดล้างคราบฝุ่น/แมลงที่แผงคอนเดนเซอร์",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["กรองแอร์ห้องโดยสารแท้"],
        estimatedLaborMinutes: 20,
        estimatedCost: 450,
        isCrucialSafetyItem: false
      },
      {
        id: "pm2-11",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง",
        itemTitle: "ตรวจเช็คบูชหูแหนบ สาแหรกแหนบ และยางกันกระแทก",
        itemDescription: "กวดขันน็อตสาแหรกแหนบ และตรวจรอยแตกของแผ่นแหนบ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 25,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-12",
        category: "suspension",
        categoryNameTh: "ระบบเบรกลม",
        itemTitle: "ทดสอบและตั้งค่าโมดูลเลเตอร์เบรกลม ABS/EBS ด้วยเครื่องอ่านระบบเบรก",
        itemDescription: "ตรวจสอบการทำงานของเซนเซอร์ ABS ประจำแต่ละล้อ และกล่องคุมลมเบรก",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 45,
        estimatedCost: 800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm2-13",
        category: "aircon",
        categoryNameTh: "ระบบแอร์",
        itemTitle: "แวคคั่มระบบแอร์ ล้างตู้แอร์ด้วยระบบส่องกล้อง และเติมน้ำมันคอมเพรสเซอร์",
        itemDescription: "ล้างสิ่งสกปรกสะสมในตู้แอร์และเติมน้ำมันหล่อลื่นคอมเพรสเซอร์",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 60,
        estimatedCost: 900,
        isCrucialSafetyItem: false
      },
      {
        id: "pm2-14",
        category: "engine",
        categoryNameTh: "ระบบไอเสีย",
        itemTitle: "ตรวจเช็คระบบกรองไอเสีย DPF และทำความสะอาดเซนเซอร์ไอเสีย (EGR/DPF Inspection)",
        itemDescription: "ตรวจสอบระดับการอุดตันของเขม่าและสั่งฟื้นฟูสภาพกรองไอเสีย (Regeneration)",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 45,
        estimatedCost: 700,
        isCrucialSafetyItem: false
      }
    ]
  },
  {
    intervalKm: 80000,
    intervalNameTh: "ระยะ 60,000 - 80,000 กม. (PM 3: เช็คระยะใหญ่ / C-Service)",
    intervalNameEn: "Major Overhaul & Thermal System Renewal",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    targetMonths: 12,
    description: "งาน PM2 + ล้างหม้อน้ำเปลี่ยนน้ำยาหล่อเย็นทั้งระบบ เปลี่ยนชุดสายพานหน้าเครื่อง เช็คปั๊มลม วาล์วลม และปรับตั้งวาล์วเครื่องยนต์",
    totalItemsCount: 16,
    inHouseItemsCount: 11,
    dealerItemsCount: 5,
    estimatedTotalCost: 18500,
    items: [
      {
        id: "pm3-1",
        category: "lubricant",
        categoryNameTh: "ระบบหล่อลื่น & เครื่องยนต์",
        itemTitle: "ดำเนินการครบทุกรายการตามมาตรฐาน PM 1 และ PM 2 ทั้งหมด",
        itemDescription: "เปลี่ยนถ่ายน้ำมันเครื่อง, กรองเครื่อง, กรองโซล่า, กรองอากาศ, น้ำมันเกียร์ และน้ำมันเฟืองท้าย",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดน้ำมันและไส้กรองครบชุด"],
        estimatedLaborMinutes: 90,
        estimatedCost: 7500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-2",
        category: "lubricant",
        categoryNameTh: "ระบบระบายความร้อน",
        itemTitle: "ถ่ายล้างระบบหล่อเย็นหม้อน้ำ และเติมน้ำยา Coolant สังเคราะห์แท้ 100%",
        itemDescription: "Flushing หม้อน้ำ ล้างตะกรัน และเติมน้ำยาหล่อเย็นคุณภาพสูง (15-20 ลิตร)",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำยาหล่อเย็นหม้อน้ำเกรดพรีเมียม 20 ลิตร"],
        estimatedLaborMinutes: 45,
        estimatedCost: 1800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-3",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "เปลี่ยนชุดสายพานหน้าเครื่อง สายพานพัดลม และลูกรอกดันสายพานแท้ (Belt & Tensioner)",
        itemDescription: "เปลี่ยนสายพานและตลับลูกรอกตั้งสายพานอัตโนมัติยกชุด ป้องกันสายพานขาดกลางทาง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["สายพานหน้าเครื่องแท้", "ชุดลูกรอกตั้งสายพาน Auto Tensioner"],
        estimatedLaborMinutes: 60,
        estimatedCost: 3200,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-4",
        category: "suspension",
        categoryNameTh: "ระบบเบรกลม",
        itemTitle: "เปลี่ยนไส้กรองดรายเออร์ลมเบรก (Air Dryer Cartridge Filter)",
        itemDescription: "เปลี่ยนไส้กรองดูดความชื้นระบบลม ป้องกันน้ำและคราบน้ำมันเข้าหม้อลมเบรก",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ไส้กรอง Air Dryer WABCO/Knorr-Bremse แท้"],
        estimatedLaborMinutes: 25,
        estimatedCost: 1400,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-5",
        category: "suspension",
        categoryNameTh: "ระบบเบรก & ดุมล้อ",
        itemTitle: "ถอดดรัมเบรก ล้างทำความสะอาด เปลี่ยนซีลล้อ และอัดจาระบีลูกปืนล้อใหม่ (Wheel Bearing Repack)",
        itemDescription: "ถอดล้อตรวจสอบสภาพตลับลูกปืนล้อ เปลี่ยนซีลกันฝุ่น/น้ำมัน และอัดจาระบีลูกปืนใหม่ทุกล้อ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดซีลล้อแท้หน้า-หลัง", "จาระบีลูกปืนล้อทนความร้อนสูง"],
        estimatedLaborMinutes: 90,
        estimatedCost: 1800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-6",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง",
        itemTitle: "ตรวจเช็คสภาพโช้คอัพหน้า-หลัง ยางแท่นเครื่อง ยางแท่นเกียร์ และลูกหมากคันส่ง",
        itemDescription: "ตรวจเช็ครอยรั่วซึมน้ำมันโช้คอัพ และการทรุดตัวของยางแท่นเครื่อง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 30,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-7",
        category: "lubricant",
        categoryNameTh: "ระบบบังคับเลี้ยว",
        itemTitle: "เปลี่ยนถ่ายน้ำมันพวงมาลัยพาวเวอร์และล้างกระปุกกรองน้ำมันพาวเวอร์",
        itemDescription: "ถ่ายน้ำมันพาวเวอร์ ATF Dexron III และล้างตะแกรงกรอง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["น้ำมันพาวเวอร์ ATF (3 ลิตร)"],
        estimatedLaborMinutes: 30,
        estimatedCost: 550,
        isCrucialSafetyItem: false
      },
      {
        id: "pm3-8",
        category: "engine",
        categoryNameTh: "ระบบน้ำมันเชื้อเพลิง",
        itemTitle: "ล้างทำความสะอาดถังน้ำมันโซล่าและตรวจเช็ควาล์วระบายอากาศถังน้ำมัน",
        itemDescription: "ถ่ายล้างคราบตะกอนก้นถังน้ำมันดีเซลเพื่อป้องกันเชื้อเพลิงปนเปื้อน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 60,
        estimatedCost: 400,
        isCrucialSafetyItem: false
      },
      {
        id: "pm3-9",
        category: "lighting",
        categoryNameTh: "ระบบไฟฟ้า",
        itemTitle: "ตรวจเช็คแปลงถ่านและลูกปืนไดชาร์จ/ไดสตาร์ท (Starter & Alternator Inspection)",
        itemDescription: "ตรวจสภาพแปลงถ่านและชุดไดโอดเรกูเลเตอร์",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 30,
        estimatedCost: 0,
        isCrucialSafetyItem: false
      },
      {
        id: "pm3-10",
        category: "engine",
        categoryNameTh: "ระบบไอดี",
        itemTitle: "ตรวจเช็ควาล์วควบคุมแรงดันลมและท่ออินเตอร์คูลเลอร์ (Intercooler & Turbo Piping)",
        itemDescription: "ตรวจหารอยรั่วซึม แคลมป์รัดท่อลม และคราบน้ำมันในท่ออินเตอร์คูลเลอร์",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเอง in-house",
        estimatedLaborMinutes: 25,
        estimatedCost: 0,
        isCrucialSafetyItem: false
      },
      {
        id: "pm3-11",
        category: "inspection",
        categoryNameTh: "ความปลอดภัย & ขนส่ง",
        itemTitle: "ตรวจเช็คอุปกรณ์ความปลอดภัย ถังดับเพลิง กรวย และระบบตัดไฟฉุกเฉิน",
        itemDescription: "ตรวจสอบอายุสารเคมีในถังดับเพลิงและสวิตช์ตัดไฟเมน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 15,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-12",
        category: "engine",
        categoryNameTh: "เครื่องยนต์ & วาล์ว",
        itemTitle: "ปรับตั้งระยะห่างวาล์วไอดี-ไอเสียเครื่องยนต์ด้วยฟิลเลอร์เกจ (Valve Clearance Adjustment)",
        itemDescription: "ปรับตั้งระยะห่างวาล์วให้ตรงตามสเปกโรงงาน เพื่อกำลังอัดสูงสุดและลดเสียงดัง",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 90,
        estimatedCost: 1500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-13",
        category: "engine",
        categoryNameTh: "ระบบหัวฉีดคอมมอนเรล",
        itemTitle: "ทดสอบและปรับเทียบค่าปริมาณการฉีดน้ำมันหัวฉีดดีเซลคอมมอนเรล (Injector Calibration Test)",
        itemDescription: "ทดสอบการจ่ายน้ำมัน ปริมาณน้ำมันไหลกลับ และแรงดันรางคอมมอนเรล",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 75,
        estimatedCost: 1800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-14",
        category: "suspension",
        categoryNameTh: "ช่วงล่าง & แหนบ",
        itemTitle: "ตั้งศูนย์ล้อระบบเลเซอร์ 3D ครบทุกเพลา (Laser Multi-Axle Wheel Alignment)",
        itemDescription: "ตั้งศูนย์ล้อหน้า เพลาขับ และเพลาหางพ่วงด้วยระบบคอมพิวเตอร์ 3 มิติ",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 60,
        estimatedCost: 1200,
        isCrucialSafetyItem: true
      },
      {
        id: "pm3-15",
        category: "engine",
        categoryNameTh: "ระบบอากาศ & EGR",
        itemTitle: "ถอดล้างท่อร่วมไอดีและชุดวาล์ว EGR ด้วยเครื่องล้างอัลตราโซนิก (EGR & Intake De-carbon)",
        itemDescription: "ล้างคราบเขม่าสะสมในท่อร่วมไอดีเพื่อให้อากาศไหลเวียนได้เต็มประสิทธิภาพ",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 90,
        estimatedCost: 1400,
        isCrucialSafetyItem: false
      },
      {
        id: "pm3-16",
        category: "suspension",
        categoryNameTh: "ระบบเบรกลมใหญ่",
        itemTitle: "โอเวอร์ฮอลล์และเปลี่ยนชุดซ่อมวาล์วควบคุมลมเบรก (Relay Valve & Foot Brake Valve Overhaul)",
        itemDescription: "เปลี่ยนชุดยางโอริง ลูกสูบวาล์วลม และทดสอบแรงดันเบรกบนแท่นทดสอบ",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 75,
        estimatedCost: 1600,
        isCrucialSafetyItem: true
      }
    ]
  },
  {
    intervalKm: 120000,
    intervalNameTh: "ระยะ 100,000 - 120,000 กม. (PM 4: เช็คระยะรอบแสนโล / D-Service)",
    intervalNameEn: "100k Comprehensive Drivetrain & Suspension Refresh",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    targetMonths: 18,
    description: "บำรุงรักษาครั้งใหญ่รอบ 100,000 กม. เปลี่ยนสายพานไทม์มิ่ง/ปั๊มน้ำ เช็คชุดคลัตช์ ลูกหมากพวงมาลัย และระบบส่งกำลังสมบูรณ์",
    totalItemsCount: 15,
    inHouseItemsCount: 9,
    dealerItemsCount: 6,
    estimatedTotalCost: 28000,
    items: [
      {
        id: "pm4-1",
        category: "lubricant",
        categoryNameTh: "ระบบของเหลวทั้งหมด",
        itemTitle: "เปลี่ยนถ่ายของเหลวและไส้กรองครบทุกระบบ (น้ำมันเครื่อง, เกียร์, เฟืองท้าย, พาวเวอร์, น้ำยาหม้อน้ำ)",
        itemDescription: "เปลี่ยนของเหลวใหม่ 100% ทั้งคัน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดของเหลวและไส้กรองทั้งคัน"],
        estimatedLaborMinutes: 120,
        estimatedCost: 8500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-2",
        category: "engine",
        categoryNameTh: "เครื่องยนต์",
        itemTitle: "เปลี่ยนชุดสายพานไทม์มิ่ง ปั๊มน้ำเครื่องยนต์ และวาล์วน้ำ (Timing Belt & Water Pump Kit)",
        itemDescription: "เปลี่ยนสายพานราวลิ้น ปั๊มน้ำ และเทอร์โมสตัท ป้องกันเครื่องโอเวอร์ฮีต",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดสายพานไทม์มิ่งแท้", "ปั๊มน้ำเครื่องยนต์แท้", "วาล์วน้ำ Thermostat"],
        estimatedLaborMinutes: 90,
        estimatedCost: 5800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-3",
        category: "suspension",
        categoryNameTh: "ระบบเบรก",
        itemTitle: "เปลี่ยนผ้าเบรกใหม่หน้า-หลัง และเจียรจานเบรก/ดรัมเบรก (Brake Lining Replacement & Drum Resurfacing)",
        itemDescription: "เปลี่ยนผ้าเบรกใหม่ ย้ำหมุดผ้าเบรก และปรับตั้งเบรกใหม่ทุกล้อ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดผ้าเบรกแท้หน้า-หลัง", "หมุดย้ำผ้าเบรกทองแดง"],
        estimatedLaborMinutes: 90,
        estimatedCost: 4500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-4",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง",
        itemTitle: "เปลี่ยนบูชหูแหนบ สลักแหนบ บูชทอร์คร็อด และยางแท่นเครื่อง (Chassis Bushings Replacement)",
        itemDescription: "เปลี่ยนบูชยูรีเทน/ยางธรรมชาติเพื่อลดแรงกระแทกและเสียงดัง",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดบูชหูแหนบแท้", "สลักแหนบชุบแข็ง"],
        estimatedLaborMinutes: 75,
        estimatedCost: 2200,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-5",
        category: "tires",
        categoryNameTh: "ยาง & ล้อ",
        itemTitle: "เปลี่ยนยางใหม่ชุดหน้าหรือชุดขับเคลื่อนตามเกณฑ์ความสึกหรอ",
        itemDescription: "เปลี่ยนยางเรเดียลใหม่ Bridgestone/Michelin ขนาด 11R22.5 หรือ 9.5R17.5",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ยางเรเดียลรถบรรทุกใหม่"],
        estimatedLaborMinutes: 60,
        estimatedCost: 17000,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-6",
        category: "lighting",
        categoryNameTh: "ระบบไฟฟ้า",
        itemTitle: "เปลี่ยนแบตเตอรี่รถยนต์ใหม่ 2 ลูก (ชุด 24V Heavy-Duty Batteries)",
        itemDescription: "เปลี่ยนแบตเตอรี่น้ำ/กึ่งแห้ง 12V 120-150Ah x 2 ลูก",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["แบตเตอรี่ GS/FB 150Ah x 2 ลูก"],
        estimatedLaborMinutes: 30,
        estimatedCost: 6800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-7",
        category: "suspension",
        categoryNameTh: "ระบบส่งกำลัง",
        itemTitle: "เปลี่ยนกากบาทเพลากลางและลูกปืนตุ๊กตาเพลากลาง (Center Support Bearing & Universal Joints)",
        itemDescription: "เปลี่ยนกากบาทเพลากลางและลูกปืนรองรับเพลากลางเพื่อขจัดการสั่นสะท้าน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["กากบาทเพลากลางแท้", "ลูกปืนตุ๊กตาเพลากลาง"],
        estimatedLaborMinutes: 60,
        estimatedCost: 2800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-8",
        category: "aircon",
        categoryNameTh: "ระบบแอร์",
        itemTitle: "เปลี่ยนไดรเออร์แอร์ วาล์วแอร์ และตรวจเช็คแรงอัดคอมเพรสเซอร์แอร์",
        itemDescription: "เปลี่ยน Receiver Drier และ Expansion Valve พร้อมชาร์จน้ำยาใหม่",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["Receiver Drier", "Expansion Valve", "น้ำยาแอร์ R134a"],
        estimatedLaborMinutes: 45,
        estimatedCost: 1200,
        isCrucialSafetyItem: false
      },
      {
        id: "pm4-9",
        category: "lighting",
        categoryNameTh: "ระบบไฟ",
        itemTitle: "ตรวจเช็คระบบสายไฟหลัก ชุดฟิวส์ รีเลย์ และสายดินรอบคัน",
        itemDescription: "ทำความสะอาดจุดต่อสายดินและตรวจหารอยถลอกของสายไฟ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        estimatedLaborMinutes: 30,
        estimatedCost: 0,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-10",
        category: "engine",
        categoryNameTh: "ระบบส่งกำลัง & คลัตช์",
        itemTitle: "ยกเกียร์ตรวจเช็คชุดคลัตช์ หวีคลัตช์ แผ่นคลัตช์ และลูกปืนกดคลัตช์ (Clutch System Overhaul)",
        itemDescription: "ตรวจเช็คความหนาผ้าคลัตช์ สปริงจานกด และลูกปืนปลายเกียร์",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 180,
        estimatedCost: 7500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-11",
        category: "engine",
        categoryNameTh: "ระบบอัดอากาศ & เทอร์โบ",
        itemTitle: "ตรวจเช็คระยะคลอนแกนเทอร์โบชาร์จเจอร์และเวสต์เกต (Turbocharger Inspection & Radial Play Test)",
        itemDescription: "วัดระยะรุนและระยะคลอนของใบพัดเทอร์โบ ตรวจรอยรั่วซึมน้ำมันหล่อลื่นแกนเทอร์โบ",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 60,
        estimatedCost: 1500,
        isCrucialSafetyItem: false
      },
      {
        id: "pm4-12",
        category: "suspension",
        categoryNameTh: "ระบบบังคับเลี้ยว",
        itemTitle: "ตรวจเช็คและโอเวอร์ฮอลล์กระปุกพวงมาลัยพาวเวอร์ & ปั๊มพาวเวอร์ (Power Steering Gearbox Overhaul)",
        itemDescription: "เปลี่ยนชุดซีลกันรั่วกระปุกพวงมาลัยและทดสอบแรงดันไฮดรอลิก",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 90,
        estimatedCost: 2800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-13",
        category: "engine",
        categoryNameTh: "ระบบเชื้อเพลิงคอมมอนเรล",
        itemTitle: "ถอดล้างและปรับเทียบหัวฉีดคอมมอนเรลบนแท่นเทสคอมพิวเตอร์ (Common Rail Injector Bench Test)",
        itemDescription: "ปรับเปลี่ยนชุดปลายหัวฉีดและวาล์วคอนโทรลหัวฉีด",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 120,
        estimatedCost: 4800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-14",
        category: "suspension",
        categoryNameTh: "ระบบล้อ & แชสซี",
        itemTitle: "ดัดคานหน้าและตั้งศูนย์ล้อ 3D คอมพิวเตอร์เต็มระบบ",
        itemDescription: "ตรวจเช็คการบิดตัวของคานหน้าและปรับตั้งมุมล้อตามมาตรฐานโรงงาน",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 90,
        estimatedCost: 1800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm4-15",
        category: "inspection",
        categoryNameTh: "ตรวจสภาพกรมการขนส่ง",
        itemTitle: "นำรถเข้าตรวจสภาพ ณ สถานตรวจสภาพรถเอกชน (ตรอ./ขนส่ง) ทดสอบควันดำและแรงเบรก",
        itemDescription: "ทดสอบบนแท่น Roller Brake Tester และวัดค่าควันดำเพื่อต่อภาษีประจำปี",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 60,
        estimatedCost: 800,
        isCrucialSafetyItem: true
      }
    ]
  },
  {
    intervalKm: 200000,
    intervalNameTh: "ระยะ 180,000 - 200,000+ กม. (PM 5: โอเวอร์ฮอลล์ใหญ่ / Major Overhaul)",
    intervalNameEn: "Deep Engine & Chassis Rebuild",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    targetMonths: 24,
    description: "ฟื้นฟูสภาพใหญ่รอบ 2 แสนกิโลเมตร โอเวอร์ฮอลล์เครื่องยนต์/เกียร์ เปลี่ยนชุดปะเก็นใหญ่ ระบบเบรกและช่วงล่างทั้งคัน",
    totalItemsCount: 12,
    inHouseItemsCount: 6,
    dealerItemsCount: 6,
    estimatedTotalCost: 45000,
    items: [
      {
        id: "pm5-1",
        category: "lubricant",
        categoryNameTh: "ระบบของเหลวทั้งหมด",
        itemTitle: "เปลี่ยนถ่ายของเหลวและไส้กรองครบวงจร 100%",
        itemDescription: "เปลี่ยนของเหลว น้ำมันเครื่อง น้ำมันเกียร์ น้ำมันเฟืองท้าย น้ำยาหล่อเย็น และน้ำมันเบรก",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ชุดของเหลวและไส้กรองทั้งคัน"],
        estimatedLaborMinutes: 120,
        estimatedCost: 8500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-2",
        category: "suspension",
        categoryNameTh: "ระบบช่วงล่าง",
        itemTitle: "เปลี่ยนโช้คอัพหน้า-หลัง ยางกันกระแทก และชุดบูชช่วงล่างใหม่ทั้งคัน",
        itemDescription: "เปลี่ยนโช้คอัพแก๊ส/น้ำมันเกรดบรรทุกหนักทุกล้อ",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["โช้คอัพหน้า-หลังแท้ 4-6 ต้น", "ชุดบูชช่วงล่าง"],
        estimatedLaborMinutes: 90,
        estimatedCost: 8500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-3",
        category: "suspension",
        categoryNameTh: "ระบบเบรก",
        itemTitle: "เปลี่ยนผ้าเบรกใหม่ จานเบรก/ดรัมเบรกใหม่ และชุดสปริงดึงกลับผ้าเบรก",
        itemDescription: "เปลี่ยนดรัมเบรกใหม่ที่มีรอยสึกเกินพิกัด",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ดรัมเบรกใหม่", "ผ้าเบรกแท้"],
        estimatedLaborMinutes: 90,
        estimatedCost: 7500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-4",
        category: "aircon",
        categoryNameTh: "ระบบแอร์",
        itemTitle: "เปลี่ยนคอมเพรสเซอร์แอร์ใหม่ แผงคอยล์ร้อน และตู้แอร์ใหม่ (Air Con System Renewal)",
        itemDescription: "เปลี่ยนระบบปรับอากาศใหม่ยกชุด เย็นฉ่ำทนทาน",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["คอมเพรสเซอร์ Denso/Sanden แท้", "คอยล์ร้อน", "คอยล์เย็น"],
        estimatedLaborMinutes: 120,
        estimatedCost: 9500,
        isCrucialSafetyItem: false
      },
      {
        id: "pm5-5",
        category: "lighting",
        categoryNameTh: "ระบบสตาร์ทและชาร์จ",
        itemTitle: "เปลี่ยนไดชาร์จและไดสตาร์ทใหม่ (High-Output Alternator & Starter Motor)",
        itemDescription: "ติดตั้งไดชาร์จและไดสตาร์ทลูกใหม่เพื่อความเสถียรสูงสุด",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["ไดชาร์จ 24V 80A แท้", "ไดสตาร์ท Reduction"],
        estimatedLaborMinutes: 60,
        estimatedCost: 7800,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-6",
        category: "engine",
        categoryNameTh: "ระบบระบายความร้อน",
        itemTitle: "เปลี่ยนหม้อน้ำอลูมิเนียม/ทองเหลืองใหม่ และท่อยางหม้อน้ำซิลิโคนยกคัน",
        itemDescription: "เปลี่ยนรังผึ้งหม้อน้ำใหม่เพื่อการระบายความร้อน 100%",
        executionType: "in_house",
        executionTypeLabelTh: "ทำเองในอู่ TNB",
        standardPartsUsed: ["หม้อน้ำแท้ตรงรุ่น", "ชุดท่อยางซิลิโคนและเข็มขัดสแตนเลส"],
        estimatedLaborMinutes: 75,
        estimatedCost: 5500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-7",
        category: "engine",
        categoryNameTh: "เครื่องยนต์ (โอเวอร์ฮอลล์)",
        itemTitle: "เปิดฝาสูบ โอเวอร์ฮอลล์เปลี่ยนแหวนลูกสูบ ปลอกสูบ ชาร์ฟอก ชาร์ฟก้าน และชุดปะเก็นใหญ่ (Engine In-Frame Overhaul)",
        itemDescription: "ฟื้นฟูกำลังอัดเครื่องยนต์ เปลี่ยนแหวน ชาร์ฟ และบดวาล์วใหม่",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 480,
        estimatedCost: 28000,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-8",
        category: "engine",
        categoryNameTh: "ระบบหัวฉีดและปั๊มแรงดันสูง",
        itemTitle: "เปลี่ยนชุดหัวฉีดคอมมอนเรลใหม่ 4-6 หัว และโอเวอร์ฮอลล์ปั๊มแรงดันสูง (Supply Pump Overhaul)",
        itemDescription: "เปลี่ยนหัวฉีดของใหม่ศูนย์แท้และปรับตั้งแรงดันปั๊มคอมมอนเรล",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 180,
        estimatedCost: 24000,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-9",
        category: "engine",
        categoryNameTh: "ระบบอัดอากาศ",
        itemTitle: "เปลี่ยนเทอร์โบชาร์จเจอร์ลูกใหม่แท้ (Turbocharger Replacement)",
        itemDescription: "เปลี่ยนเทอร์โบแท้ศูนย์เพื่อการบูสต์ที่เสถียรและประหยัดน้ำมัน",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 90,
        estimatedCost: 16500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-10",
        category: "suspension",
        categoryNameTh: "ระบบส่งกำลัง & เกียร์",
        itemTitle: "โอเวอร์ฮอลล์เกียร์ เปลี่ยนลูกปืนเกียร์ และเปลี่ยนชุดเฟืองท้าย (Transmission & Differential Rebuild)",
        itemDescription: "เปลี่ยนชุดลูกปืน ซิงโครเมช และซีลกันน้ำมันเกียร์ทั้งลูก",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 240,
        estimatedCost: 14500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-11",
        category: "suspension",
        categoryNameTh: "ช่วงล่าง & แหนบ",
        itemTitle: "รื้อตับแหนบ ตีโค้งแหนบใหม่ หรือเปลี่ยนตับแหนบใหม่ทุกล้อ (Leaf Spring Rebuild)",
        itemDescription: "ฟื้นฟูความสูงและการรับน้ำหนักของตลับแหนบ",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 150,
        estimatedCost: 6500,
        isCrucialSafetyItem: true
      },
      {
        id: "pm5-12",
        category: "bodywork",
        categoryNameTh: "ตัวถังและแชสซี",
        itemTitle: "ตรวจเช็คและเชื่อมซ่อมคัสซี พ่นกันสนิมใต้ท้องรถ และทำสีตัวถังใหม่",
        itemDescription: "ตรวจรอยแตกร้าวของแชสซีและเคลือบกันสนิมเกรดอุตสาหกรรม",
        executionType: "dealer_center",
        executionTypeLabelTh: "ส่งเข้าศูนย์บริการ",
        estimatedLaborMinutes: 240,
        estimatedCost: 8500,
        isCrucialSafetyItem: false
      }
    ]
  }
];

// Helper to evaluate vehicle mileage against interval plans
export function evaluateVehicleMileageAlert(
  vehicle: VehicleRecord,
  thresholdKm: number = 1000
): MileageAlertEvaluation {
  const currentMileage = vehicle.currentMileage || 0;
  
  // Find closest interval multiple (e.g., if intervals are 10k, 30k, 80k, 120k, 200k)
  // Let's check which plan applies
  let matchedPlan = MAINTENANCE_INTERVAL_PLANS[0];
  let targetKm = 10000;
  let minDistance = Infinity;

  // Check all possible cycle points (e.g. 10k, 20k, 30k, 40k, 80k, 120k, 150k, 200k, 240k, 280k, 320k, etc.)
  const candidateTargetKms = [
    10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 
    110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000,
    220000, 240000, 250000, 280000, 300000, 320000, 350000, 380000, 400000
  ];

  for (const km of candidateTargetKms) {
    const diff = Math.abs(currentMileage - km);
    if (diff < minDistance) {
      minDistance = diff;
      targetKm = km;
    }
  }

  // Map targetKm to appropriate plan type
  if (targetKm % 200000 === 0 || (targetKm >= 200000 && targetKm % 100000 === 0)) {
    matchedPlan = MAINTENANCE_INTERVAL_PLANS[4]; // 200k Major Overhaul
  } else if (targetKm % 120000 === 0 || targetKm % 100000 === 0) {
    matchedPlan = MAINTENANCE_INTERVAL_PLANS[3]; // 120k D-Service
  } else if (targetKm % 80000 === 0 || targetKm % 60000 === 0) {
    matchedPlan = MAINTENANCE_INTERVAL_PLANS[2]; // 80k C-Service
  } else if (targetKm % 30000 === 0 || targetKm % 40000 === 0 || targetKm % 50000 === 0) {
    matchedPlan = MAINTENANCE_INTERVAL_PLANS[1]; // 30k B-Service
  } else {
    matchedPlan = MAINTENANCE_INTERVAL_PLANS[0]; // 10k A-Service
  }

  const diffKm = currentMileage - targetKm;
  let alertStatus: 'overdue' | 'due_soon' | 'normal' = 'normal';
  let alertTitle = "";
  let alertDescription = "";

  if (diffKm > thresholdKm) {
    // Current mileage has exceeded target + threshold
    alertStatus = 'overdue';
    alertTitle = `⚠️ เกินระยะบำรุงรักษาแล้ว (${Math.abs(diffKm).toLocaleString()} กม.)`;
    alertDescription = `เลขไมล์ปัจจุบัน ${currentMileage.toLocaleString()} กม. เกินรอบเป้าหมาย ${targetKm.toLocaleString()} กม. (เกณฑ์เตือน ±${thresholdKm.toLocaleString()} กม.) ต้องนำรถเข้าบำรุงรักษาด่วน`;
  } else if (Math.abs(diffKm) <= thresholdKm) {
    // Current mileage is within +/- threshold
    alertStatus = 'due_soon';
    if (diffKm >= 0) {
      alertTitle = `🔔 ถึงรอบบำรุงรักษาแล้ว (ตรงรอบ +${diffKm.toLocaleString()} กม.)`;
      alertDescription = `เลขไมล์ปัจจุบัน ${currentMileage.toLocaleString()} กม. อยู่ในเกณฑ์รอบ ${targetKm.toLocaleString()} กม. พอดี`;
    } else {
      alertTitle = `🔔 ใกล้ถึงรอบบำรุงรักษา (เหลืออีก ${Math.abs(diffKm).toLocaleString()} กม.)`;
      alertDescription = `เลขไมล์ปัจจุบัน ${currentMileage.toLocaleString()} กม. ใกล้ถึงรอบเป้าหมาย ${targetKm.toLocaleString()} กม.`;
    }
  } else {
    // Normal, still far
    alertStatus = 'normal';
    alertTitle = `✅ สถานะปกติ (เหลืออีก ${Math.abs(diffKm).toLocaleString()} กม.)`;
    alertDescription = `เลขไมล์ปัจจุบัน ${currentMileage.toLocaleString()} กม. ยังไม่ถึงรอบเป้าหมาย ${targetKm.toLocaleString()} กม.`;
  }

  return {
    vehicleId: vehicle.id,
    licensePlate: vehicle.licensePlate,
    vehicleBrand: vehicle.vehicleBrand || "TNB",
    vehicleModel: vehicle.vehicleModel || "Vehicle",
    vehicleType: vehicle.vehicleType,
    currentMileage,
    thresholdKm,
    closestIntervalKm: targetKm,
    diffKm,
    alertStatus,
    alertTitle,
    alertDescription,
    matchedPlan,
    inHouseItemsCount: matchedPlan.inHouseItemsCount,
    dealerItemsCount: matchedPlan.dealerItemsCount
  };
}

// Bulk evaluate all vehicles
export function evaluateFleetMileageAlerts(
  vehicles: VehicleRecord[],
  thresholdKm: number = 1000
): MileageAlertEvaluation[] {
  return vehicles.map((v) => evaluateVehicleMileageAlert(v, thresholdKm));
}

export interface MasterMatrixItem {
  id: string;
  category: "lubricant" | "engine" | "transmission" | "brake" | "suspension" | "tires" | "lighting" | "aircon" | "safety";
  categoryNameTh: string;
  itemTitle: string;
  itemDescription: string;
  standardParts: string;
  isCrucialSafetyItem?: boolean;
  pm10k: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string };
  pm30k: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string };
  pm80k: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string };
  pm120k: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string };
  pm200k: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string };
}

export const MASTER_INTERVAL_CHECKLIST_MATRIX: MasterMatrixItem[] = [
  // 1. ระบบหล่อลื่น & ของเหลว
  {
    id: "m-1",
    category: "lubricant",
    categoryNameTh: "ระบบหล่อลื่น & ของเหลว",
    itemTitle: "เปลี่ยนถ่ายน้ำมันเครื่องสังเคราะห์เกรดงานหนัก (Engine Oil)",
    itemDescription: "ถ่ายน้ำมันเก่าและเติมน้ำมันเครื่องใหม่ 15W-40 / 10W-40 (18-24 ลิตร)",
    standardParts: "น้ำมันเครื่องสังเคราะห์ 15W-40 (Shell/Caltex) + แหวนรอง",
    isCrucialSafetyItem: true,
    pm10k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" }
  },
  {
    id: "m-2",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & กรอง",
    itemTitle: "เปลี่ยนไส้กรองน้ำมันเครื่องแท้ (Engine Oil Filter)",
    itemDescription: "เปลี่ยนลูกกรองน้ำมันเครื่องและโอริงซีลกันรั่วซึม",
    standardParts: "กรองน้ำมันเครื่องแท้ Isuzu/Hino/Fuso/Toyota",
    isCrucialSafetyItem: true,
    pm10k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-3",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & กรอง",
    itemTitle: "ไส้กรองอากาศเครื่องยนต์ (Air Cleaner Element)",
    itemDescription: "เป่าลมทำความสะอาด หรือเปลี่ยนใหม่ตามระยะการใช้งาน",
    standardParts: "ไส้กรองอากาศแท้ตรงรุ่น",
    isCrucialSafetyItem: false,
    pm10k: { action: "inspect", label: "🔍 เป่าทำความสะอาด", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-4",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & เชื้อเพลิง",
    itemTitle: "ไส้กรองน้ำมันดีเซล & กรองดักน้ำ (Fuel Filter & Water Separator)",
    itemDescription: "ถ่ายน้ำสะสมออกจากถ้วยดักน้ำ และเปลี่ยนลูกกรองโซล่า",
    standardParts: "กรองโซล่าแท้ + กรองดักน้ำแท้",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 เดรนน้ำทิ้ง", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-5",
    category: "transmission",
    categoryNameTh: "ระบบส่งกำลัง & เกียร์",
    itemTitle: "เปลี่ยนถ่ายน้ำมันเกียร์และน้ำมันเฟืองท้าย (Transmission & Diff Oil)",
    itemDescription: "ถ่ายน้ำมันเกียร์ SAE 80W-90 และน้ำมันเฟืองท้าย SAE 85W-140",
    standardParts: "น้ำมันเกียร์ (8-12L) + น้ำมันเฟืองท้าย (12-16L)",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ตรวจระดับ/รอยรั่ว", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนถ่าย", detail: "ทำเองในอู่" }
  },
  {
    id: "m-6",
    category: "suspension",
    categoryNameTh: "ระบบช่วงล่าง",
    itemTitle: "อัดจารบีช่วงล่าง กากบาทเพลากลาง สลักแหนบ (Chassis Greasing)",
    itemDescription: "อัดจารบีแรงดันสูงตามหัวอัด 18-24 จุดรอบคันรถ",
    standardParts: "จารบีสังเคราะห์ทนความร้อนสูง NLGI No.2",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ตรวจเช็คจุดอัด", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 อัดเต็มระบบ (24 จุด)", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 อัดเต็มระบบ (24 จุด)", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 อัดเต็มระบบ (24 จุด)", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 อัดเต็มระบบ (24 จุด)", detail: "ทำเองในอู่" }
  },
  {
    id: "m-7",
    category: "tires",
    categoryNameTh: "ยาง & ล้อ",
    itemTitle: "ตรวจวัดแรงดันลมยางและวัดความลึกร่องดอกยาง (Tire Pressure & Tread)",
    itemDescription: "วัดลม 110-120 PSI และความลึกดอกยางทุกล้อ (เกณฑ์ ≥2.0 มม.)",
    standardParts: "เกจวัดลมยางมาตรฐาน + เกจวัดดอกยางดิจิตอล",
    isCrucialSafetyItem: true,
    pm10k: { action: "in_house", label: "🏠 ตรวจวัดทุกล้อ", detail: "ทำเองในอู่" },
    pm30k: { action: "in_house", label: "🏠 ตรวจวัดทุกล้อ", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 ตรวจวัดทุกล้อ", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 ตรวจวัดทุกล้อ", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 ตรวจวัดทุกล้อ", detail: "ทำเองในอู่" }
  },
  {
    id: "m-8",
    category: "tires",
    categoryNameTh: "ยาง & ล้อ",
    itemTitle: "ขันแน่นน็อตล้อทุกล้อด้วยประแจปอนด์ (Wheel Nut Torque 550-600 Nm)",
    itemDescription: "กวดขันน็อตล้อตามแรงบิดมาตรฐาน ป้องกันล้อหลุด",
    standardParts: "ประแจปอนด์แรงบิดสูง 1 นิ้ว",
    isCrucialSafetyItem: true,
    pm10k: { action: "in_house", label: "🏠 ขันทุกล้อ", detail: "ทำเองในอู่" },
    pm30k: { action: "in_house", label: "🏠 ขันทุกล้อ", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 ขันทุกล้อ", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 ขันทุกล้อ", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 ขันทุกล้อ", detail: "ทำเองในอู่" }
  },
  {
    id: "m-9",
    category: "tires",
    categoryNameTh: "ยาง & ล้อ",
    itemTitle: "สลับยางและถ่วงล้อหน้า (Tire Rotation & Front Wheel Balancing)",
    itemDescription: "สลับยางหน้า-หลัง เพื่อให้หน้ายางสึกเรียบสม่ำเสมอ",
    standardParts: "ตะกั่วถ่วงล้อรถบรรทุก",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ดูรอยสึกหน้ายาง", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 สลับยาง-ถ่วงล้อ", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 สลับยาง-ถ่วงล้อ", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 สลับยาง-ถ่วงล้อ", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนยางยกชุด", detail: "ทำเองในอู่" }
  },
  {
    id: "m-10",
    category: "lubricant",
    categoryNameTh: "ระบบหล่อเย็น & หม้อน้ำ",
    itemTitle: "ถ่ายล้างระบบหล่อเย็นหม้อน้ำ (Coolant Flush & Long-Life Coolant)",
    itemDescription: "Flushing หม้อน้ำ ล้างตะกรัน และเติมน้ำยาหล่อเย็น 100%",
    standardParts: "น้ำยาหล่อเย็นหม้อน้ำเกรดสังเคราะห์แท้ 20 ลิตร",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ตรวจระดับน้ำยา", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 ตรวจระดับน้ำยา", detail: "ตรวจเช็ค" },
    pm80k: { action: "in_house", label: "🏠 ล้างถ่ายใหม่ 100%", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 ล้างถ่ายใหม่ 100%", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนหม้อน้ำ/ถ่ายใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-11",
    category: "brake",
    categoryNameTh: "ระบบเบรกลม & ถังลม",
    itemTitle: "เปลี่ยนไส้กรองดรายเออร์ลมเบรก (Air Dryer Cartridge Filter)",
    itemDescription: "เปลี่ยนไส้กรองดูดความชื้นระบบลม ป้องกันน้ำเข้าหม้อลมเบรก",
    standardParts: "ไส้กรอง Air Dryer WABCO/Knorr-Bremse แท้",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ระบายน้ำถังลม", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 ระบายน้ำถังลม", detail: "ตรวจเช็ค" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนชุดวาล์ว+ไส้กรอง", detail: "ทำเองในอู่" }
  },
  {
    id: "m-12",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & สายพาน",
    itemTitle: "เปลี่ยนชุดสายพานหน้าเครื่องและลูกรอกดันสายพาน (Belts & Tensioners)",
    itemDescription: "เปลี่ยนสายพานพัดลม ไดชาร์จ แอร์ และตลับลูกรอกตั้งสายพาน",
    standardParts: "สายพานหน้าเครื่องแท้ + ลูกรอก Auto Tensioner",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ตรวจรอยแตกลายงา", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 ตรวจความตึงสายพาน", detail: "ตรวจเช็ค" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนยกชุด", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนยกชุด", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนยกชุด", detail: "ทำเองในอู่" }
  },
  {
    id: "m-13",
    category: "brake",
    categoryNameTh: "ระบบเบรก & ผ้าเบรก",
    itemTitle: "ตรวจเช็คความหนาผ้าเบรกและย้ำผ้าเบรกใหม่ (Brake Lining & Overhaul)",
    itemDescription: "เจียรดรัมเบรก ย้ำผ้าเบรกแท้ และปรับตั้งระยะแร็คปรับลมเบรก",
    standardParts: "ผ้าเบรกเกรดงานหนัก + หมุดย้ำทองเหลือง",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ตรวจความหนาผ้าเบรก", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 ตั้งระยะ Slack Adjuster", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 ย้ำผ้าเบรก/เจียรจาน", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 ย้ำผ้าเบรกทุกล้อ", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนดรัมเบรกยกชุด", detail: "ทำเองในอู่" }
  },
  {
    id: "m-14",
    category: "suspension",
    categoryNameTh: "ระบบลูกปืน & ดุมล้อ",
    itemTitle: "ล้างอัดจารบีลูกปืนดุมล้อและเปลี่ยนซีลกันน้ำมัน (Wheel Hub Bearing)",
    itemDescription: "ถอดดุมล้อ ล้างทำความสะอาดลูกปืน อัดจารบีใหม่ และเปลี่ยนซีล",
    standardParts: "ซีลคอดุมล้อแท้ + จารบีลูกปืนล้อทนความร้อน",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 ฟังเสียงหมุนดุมล้อ", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 โยกเช็คระยะคลอน", detail: "ตรวจเช็ค" },
    pm80k: { action: "in_house", label: "🏠 ล้างอัดจารบีใหม่", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 ล้างอัดจารบี+เปลี่ยนซีล", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนตลับลูกปืนใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-15",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & วาล์ว",
    itemTitle: "ปรับตั้งระยะห่างวาล์วไอดี-ไอเสียเครื่องยนต์ (Valve Clearance Adjustment)",
    itemDescription: "ใช้ฟิลเลอร์เกจตั้งระยะห่างวาล์ว และเปลี่ยนปะเก็นฝาครอบวาล์ว",
    standardParts: "ปะเก็นฝาครอบวาล์วแท้ + ซีลยางเบ้าหัวฉีด",
    isCrucialSafetyItem: false,
    pm10k: { action: "none", label: "-", detail: "ยังไม่ถึงรอบ" },
    pm30k: { action: "none", label: "-", detail: "ยังไม่ถึงรอบ" },
    pm80k: { action: "dealer", label: "🏢 ส่งศูนย์ตั้งวาล์ว", detail: "ส่งศูนย์บริการ" },
    pm120k: { action: "dealer", label: "🏢 ส่งศูนย์ตั้งวาล์ว", detail: "ส่งศูนย์บริการ" },
    pm200k: { action: "dealer", label: "🏢 ส่งศูนย์เจียรบ่าวาล์ว", detail: "ส่งศูนย์บริการ" }
  },
  {
    id: "m-16",
    category: "engine",
    categoryNameTh: "เครื่องยนต์ & หัวฉีด",
    itemTitle: "เทสหัวฉีดคอมมอนเรลและล้างทำความสะอาด (Injector Calibration)",
    itemDescription: "ขึ้นแท่นเทสแรงดันหัวฉีด ล้างคราบเขม่า และเปลี่ยนแหวนรองหัวฉีด",
    standardParts: "แหวนรองหัวฉีดทองแดง + โอริงหัวฉีด",
    isCrucialSafetyItem: true,
    pm10k: { action: "none", label: "-", detail: "ยังไม่ถึงรอบ" },
    pm30k: { action: "inspect", label: "🔍 สแกนค่าแรงดัน ECU", detail: "ตรวจเช็ค" },
    pm80k: { action: "dealer", label: "🏢 ส่งศูนย์เทสหัวฉีด", detail: "ส่งศูนย์บริการ" },
    pm120k: { action: "dealer", label: "🏢 ส่งศูนย์เปลี่ยนปลายหัวฉีด", detail: "ส่งศูนย์บริการ" },
    pm200k: { action: "dealer", label: "🏢 โอเวอร์ฮอลปั๊ม/หัวฉีด", detail: "ส่งศูนย์บริการ" }
  },
  {
    id: "m-17",
    category: "lighting",
    categoryNameTh: "ระบบไฟฟ้า & แบตเตอรี่",
    itemTitle: "เปลี่ยนแบตเตอรี่รถยนต์ใหม่ 2 ลูก (24V Battery Replacement)",
    itemDescription: "เปลี่ยนแบตเตอรี่น้ำ/กึ่งแห้ง 12V 120-150Ah x 2 ลูก พร้อมขั้วแบตเตอรี่",
    standardParts: "แบตเตอรี่ Heavy-Duty 12V 150Ah x 2 ลูก",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 วัดโวลต์/น้ำกลั่น", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 วัดโวลต์/น้ำกลั่น", detail: "ตรวจเช็ค" },
    pm80k: { action: "inspect", label: "🔍 โหลดเทส CCA", detail: "ตรวจเช็ค" },
    pm120k: { action: "in_house", label: "🏠 เปลี่ยนแบตเตอรี่ใหม่ 2 ลูก", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนแบตเตอรี่ใหม่ 2 ลูก", detail: "ทำเองในอู่" }
  },
  {
    id: "m-18",
    category: "lighting",
    categoryNameTh: "ระบบสตาร์ท & ไดชาร์จ",
    itemTitle: "ตรวจเช็คและเปลี่ยนไดชาร์จ/ไดสตาร์ท (Alternator & Starter Motor)",
    itemDescription: "เปลี่ยนแปลงถ่าน ลูกปืนไดชาร์จ หรือเปลี่ยนลูกใหม่ตามอายุการใช้งาน",
    standardParts: "ไดชาร์จ High-Output 24V 80A / ไดสตาร์ทแท้",
    isCrucialSafetyItem: true,
    pm10k: { action: "inspect", label: "🔍 วัดกระแสชาร์จไฟ", detail: "ตรวจเช็ค" },
    pm30k: { action: "inspect", label: "🔍 ตรวจแปลงถ่าน", detail: "ตรวจเช็ค" },
    pm80k: { action: "in_house", label: "🏠 เปลี่ยนแปลงถ่าน/ลูกปืน", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 โอเวอร์ฮอลไดชาร์จ", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนไดชาร์จ/ไดสตาร์ทใหม่", detail: "ทำเองในอู่" }
  },
  {
    id: "m-19",
    category: "engine",
    categoryNameTh: "ระบบไอเสีย & กล่อง ECU",
    itemTitle: "สแกนกล่อง ECU และล้างฟื้นฟูกรองไอเสีย DPF (Diagnostic & DPF Flush)",
    itemDescription: "สแกนโค้ดวิเคราะห์ระบบ และล้างคราบเขม่าสะสมในท่อกรองไอเสีย DPF",
    standardParts: "น้ำยาล้างทำความสะอาดไส้กรอง DPF เฉพาะทาง",
    isCrucialSafetyItem: false,
    pm10k: { action: "dealer", label: "🏢 สแกนโค้ด OBD", detail: "ส่งศูนย์บริการ" },
    pm30k: { action: "dealer", label: "🏢 สแกน & เผาเขม่า", detail: "ส่งศูนย์บริการ" },
    pm80k: { action: "dealer", label: "🏢 ถอดล้างกรอง DPF", detail: "ส่งศูนย์บริการ" },
    pm120k: { action: "dealer", label: "🏢 ส่งศูนย์ล้างระบบ DPF", detail: "ส่งศูนย์บริการ" },
    pm200k: { action: "dealer", label: "🏢 เปลี่ยนชุดกรอง DPF/EGR", detail: "ส่งศูนย์บริการ" }
  },
  {
    id: "m-20",
    category: "tires",
    categoryNameTh: "ศูนย์ล้อ & ช่วงล่างหน้า",
    itemTitle: "ขึ้นแท่นตรวจวัดและตั้งศูนย์ล้อหน้า (Computer Wheel Alignment)",
    itemDescription: "ตั้งมุมโท-อิน มุมแคมเบอร์ และแคสเตอร์ด้วยระบบเลเซอร์",
    standardParts: "แท่นตั้งศูนย์ล้อรถบรรทุกคอมพิวเตอร์",
    isCrucialSafetyItem: false,
    pm10k: { action: "dealer", label: "🏢 ขึ้นแท่นตรวจเช็ค", detail: "ส่งศูนย์บริการ" },
    pm30k: { action: "dealer", label: "🏢 ตั้งศูนย์ล้อระบบเลเซอร์", detail: "ส่งศูนย์บริการ" },
    pm80k: { action: "dealer", label: "🏢 ตั้งศูนย์ล้อระบบเลเซอร์", detail: "ส่งศูนย์บริการ" },
    pm120k: { action: "dealer", label: "🏢 ตั้งศูนย์ล้อระบบเลเซอร์", detail: "ส่งศูนย์บริการ" },
    pm200k: { action: "dealer", label: "🏢 ปรับมุมดัดคานหน้า+ตั้งศูนย์", detail: "ส่งศูนย์บริการ" }
  },
  {
    id: "m-21",
    category: "aircon",
    categoryNameTh: "ระบบแอร์ & กรองแอร์",
    itemTitle: "เปลี่ยนกรองแอร์ห้องโดยสารและล้างตู้แอร์ (Cabin Filter & AC Service)",
    itemDescription: "เปลี่ยนกรองแอร์ PM2.5 และล้างคอยล์เย็นส่องกล้อง เติมน้ำยาแอร์ R134a",
    standardParts: "กรองแอร์ PM2.5 + น้ำยาแอร์ R134a + น้ำมันคอมแอร์",
    isCrucialSafetyItem: false,
    pm10k: { action: "inspect", label: "🔍 เช็คความเย็น/พัดลม", detail: "ตรวจเช็ค" },
    pm30k: { action: "in_house", label: "🏠 เปลี่ยนกรองแอร์", detail: "ทำเองในอู่" },
    pm80k: { action: "dealer", label: "🏢 ล้างตู้แอร์ส่องกล้อง", detail: "ส่งศูนย์บริการ" },
    pm120k: { action: "dealer", label: "🏢 แวคคั่มเปลี่ยนไดรเออร์แอร์", detail: "ส่งศูนย์บริการ" },
    pm200k: { action: "dealer", label: "🏢 เปลี่ยนคอมแอร์+ตู้แอร์ใหม่", detail: "ส่งศูนย์บริการ" }
  },
  {
    id: "m-22",
    category: "safety",
    categoryNameTh: "อุปกรณ์ความปลอดภัย & ISO",
    itemTitle: "ตรวจเช็คอุปกรณ์ความปลอดภัย ถังดับเพลิง กรวย สวิตช์ตัดไฟ (Safety Equip)",
    itemDescription: "ตรวจสอบอายุสารเคมีในถังดับเพลิง สวิตช์ตัดไฟฉุกเฉิน และชุดปฐมพยาบาล",
    standardParts: "สติ๊กเกอร์ตรวจสภาพความปลอดภัยประจำปี + สารดับเพลิง",
    isCrucialSafetyItem: true,
    pm10k: { action: "in_house", label: "🏠 ตรวจเกจวัดถังดับเพลิง", detail: "ทำเองในอู่" },
    pm30k: { action: "in_house", label: "🏠 ตรวจสภาพอุปกรณ์ครบชุด", detail: "ทำเองในอู่" },
    pm80k: { action: "in_house", label: "🏠 ตรวจวันหมดอายุสารเคมี", detail: "ทำเองในอู่" },
    pm120k: { action: "in_house", label: "🏠 เติมสารดับเพลิง/เปลี่ยนใหม่", detail: "ทำเองในอู่" },
    pm200k: { action: "in_house", label: "🏠 เปลี่ยนชุดเซฟตี้ใหม่ทั้งคัน", detail: "ทำเองในอู่" }
  }
];

