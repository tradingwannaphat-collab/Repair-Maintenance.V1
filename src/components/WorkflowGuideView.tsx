import React, { useState } from "react";
import { 
  Workflow, 
  Car, 
  HardHat, 
  Truck, 
  Boxes, 
  PackagePlus, 
  PackageMinus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck, 
  Wrench, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  FileText, 
  Search, 
  RefreshCw, 
  Sliders, 
  Database,
  MapPin,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  CalendarDays,
  Users,
  Settings,
  Shield,
  Gauge,
  FileCheck2
} from "lucide-react";
import { AppNavView } from "../types";
import { ISO_DOCUMENT_REGISTRY } from "../data/isoDocumentConfig";

interface WorkflowGuideViewProps {
  onNavigateToView: (view: AppNavView) => void;
  onOpenNewTicketModal: () => void;
  onOpenExportBackupModal?: () => void;
}

export const WorkflowGuideView: React.FC<WorkflowGuideViewProps> = ({
  onNavigateToView,
  onOpenNewTicketModal,
  onOpenExportBackupModal
}) => {
  const [activeTab, setActiveTab] = useState<"flow" | "pages" | "integration" | "roles" | "iso_control">("flow");
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);


  // Workflow steps definition
  const workflowSteps = [
    {
      stepNumber: "01",
      title: "แจ้งซ่อม & บันทึกปัญหา",
      subtitle: "เปิดใบแจ้งซ่อม (Create Repair Request)",
      actor: "พนักงานขับรถ / หัวหน้างานขนส่ง",
      roleIcon: Car,
      color: "from-blue-600 to-cyan-600",
      accentBorder: "border-blue-500",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      pageTarget: "requester" as AppNavView,
      pageName: "หน้าผู้แจ้งซ่อม",
      description: "เมื่อรถมีอาการผิดปกติ ชำรุด หรือถึงรอบเช็คระยะ (PM) ผู้แจ้งจะเปิดใบแจ้งซ่อมในระบบ",
      keyActions: [
        "ค้นหาหรือเลือกทะเบียนรถ / รหัส ERP จากสารระบบ (ดึงข้อมูลอัตโนมัติ)",
        "บันทึกเลขไมล์ล่าสุด (กม.) เพื่อนำไปอัปเดตทะเบียนรถ",
        "ระบุหมวดหมู่อาการเสีย (ช่วงล่าง, เครื่องยนต์, ระบบไฟ, ยาง, แอร์ ฯลฯ)",
        "แนบรูปถ่ายอาการเสีย หรือแชร์พิกัด GPS กรณีรถเสียฉุกเฉินบนทางหลวง",
        "กำหนดระดับความเร่งด่วน (ด่วนมากฉุกเฉิน / สูง / ปานกลาง / ปกติ)"
      ],
      outputDoc: "ใบแจ้งซ่อม (Repair Ticket #TNB-xxxx)",
      nextStepSummary: "ส่งต่องานไปยังหัวหน้าช่างเพื่อประเมินและจ่ายงาน"
    },
    {
      stepNumber: "02",
      title: "รับงาน & ประเมินอาการ",
      subtitle: "จ่ายงานช่าง & วางแผนซ่อม (Inspection & Assignment)",
      actor: "หัวหน้าแผนกซ่อมบำรุง / Foreman",
      roleIcon: HardHat,
      color: "from-amber-600 to-orange-600",
      accentBorder: "border-amber-500",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      pageTarget: "worker" as AppNavView,
      pageName: "หน้าทำงาน & ช่าง",
      description: "หัวหน้าช่างตรวจรับเรื่อง ประเมินระดับความเสียหาย และมอบหมายช่างผู้เชี่ยวชาญ",
      keyActions: [
        "เปลี่ยนสถานะจาก 'รอรับเรื่อง (Pending)' เป็น 'กำลังตรวจเช็ค (Inspecting)'",
        "มอบหมายนายช่างผู้รับผิดชอบงานซ่อม",
        "บันทึกผลการวินิจฉัยและชิ้นส่วนที่คาดว่าจะต้องเปลี่ยน",
        "พิมพ์ใบสั่งซ่อม (Work Order Printout) เพื่อให้ช่างนำไปปฏิบัติงาน"
      ],
      outputDoc: "ใบสั่งซ่อม (Work Order) & รายการประเมิน",
      nextStepSummary: "ตรวจเช็ค Part List และทำรายการเบิกอะไหล่"
    },
    {
      stepNumber: "03",
      title: "ตรวจสต็อก & เบิกจ่ายอะไหล่",
      subtitle: "เชื่อมคลังพัสดุ (Part List & Goods Requisition)",
      actor: "นายช่างผู้ซ่อม / เจ้าหน้าที่สโตร์ (Store Keeper)",
      roleIcon: Boxes,
      color: "from-purple-600 to-indigo-600",
      accentBorder: "border-purple-500",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      pageTarget: "part_list" as AppNavView,
      pageName: "Part List & เบิกของ",
      description: "ตรวจสอบสต็อกคงเหลือในคลัง และทำรายการเบิกจ่ายอะไหล่ตัดสต็อกอัตโนมัติ",
      keyActions: [
        "ค้นหาอะไหล่ใน Part List ดูตำแหน่งชั้นวาง (Rack Location เช่น A-01, B-02)",
        "ตรวจสอบยอดคงเหลือ (Current Stock) และสเปกตรงรุ่นรถ",
        "เลือกเบิกอะไหล่ผ่านฟอร์มงานซ่อม (ระบบจะตัดสต็อกคงเหลือทันที)",
        "สร้างประวัติใบเบิกของ (Goods Requisition - GI) เชื่อมโยงกับเลขที่ใบแจ้งซ่อมและทะเบียนรถ",
        "กรณีอะไหล่หมด สามารถเปลี่ยนสถานะเป็น 'รออะไหล่ (Waiting Parts)'"
      ],
      outputDoc: "ใบเบิกพัสดุอะไหล่ (Goods Requisition - GI)",
      nextStepSummary: "ลงมือปฏิบัติการซ่อมบำรุงและประเมินชิ้นส่วนที่ถอดออก"
    },
    {
      stepNumber: "04",
      title: "ดำเนินการซ่อม & จัดการอะไหล่เก่า",
      subtitle: "บันทึกผลงาน & สภาพอะไหล่ (Execution & Post-Repair Rebuild)",
      actor: "ช่างเทคนิคผู้ปฏิบัติงาน (Technician)",
      roleIcon: Wrench,
      color: "from-emerald-600 to-teal-600",
      accentBorder: "border-emerald-500",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      pageTarget: "worker" as AppNavView,
      pageName: "หน้าทำงาน & ช่าง",
      description: "ดำเนินการซ่อม เปลี่ยนชิ้นส่วน บันทึกค่าแรง และประเมินสภาพชิ้นส่วนที่ถอดออก",
      keyActions: [
        "อัปเดตสถานะเป็น 'กำลังดำเนินการซ่อม (In Progress)'",
        "บันทึกค่าแรง ค่าบริการช่าง และรายการวัสดุสิ้นเปลือง",
        "ประเมินสภาพอะไหล่ที่ถอดออก: ชิ้นส่วนที่ซ่อมได้ (Repairable) เช่น ไดชาร์จ/ไดสตาร์ท/ปั๊มลม ส่ง Rebuild เก็บเป็นอะไหล่สำรอง",
        "ชิ้นส่วนที่เสียหายถาวร (Scrap) บันทึกจำหน่ายเป็นเศษซาก"
      ],
      outputDoc: "บันทึกผลการซ่อม & รายการคัดแยกอะไหล่เก่า",
      nextStepSummary: "ทดสอบคุณภาพ (QC) และเตรียมส่งมอบรถ"
    },
    {
      stepNumber: "05",
      title: "ทดสอบ QC & ตรวจรับส่งมอบ",
      subtitle: "ปิดงานซ่อม & ประเมินความพึงพอใจ (Quality Control & Completion)",
      actor: "หัวหน้าช่าง / คนขับรถ / ผู้รับมอบ",
      roleIcon: CheckCircle2,
      color: "from-blue-600 to-emerald-600",
      accentBorder: "border-emerald-400",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      pageTarget: "worker" as AppNavView,
      pageName: "หน้าทำงาน & ผู้แจ้งซ่อม",
      description: "ทดสอบสมรรถนะรถยนต์หลังซ่อม ตรวจรับมอบ และบันทึกปิดงานสมบูรณ์",
      keyActions: [
        "เปลี่ยนสถานะเป็น 'ทดสอบคุณภาพ (Testing)' เพื่อตรวจเช็คความปลอดภัย",
        "เมื่อผ่านเกณฑ์ เปลี่ยนสถานะเป็น 'ซ่อมเสร็จสมบูรณ์ (Completed)'",
        "ผู้แจ้ง/คนขับรถให้คะแนนประเมินความพึงพอใจช่าง (Rating & Feedback 1-5 ดาว)",
        "ส่งมอบรถพร้อมใช้งานเข้าสู่แผนการขนส่ง"
      ],
      outputDoc: "ใบปิดงานซ่อม (Completed Ticket) & ใบประเมินผล",
      nextStepSummary: "ข้อมูลบันทึกเข้าประวัติทะเบียนรถ และบริหารสต็อกคลังต่อเนื่อง"
    },
    {
      stepNumber: "06",
      title: "อัปเดตประวัติรถ & คลังพัสดุ",
      subtitle: "ทะเบียนประวัติ & เติมสต็อก (Fleet History & Goods Receipt)",
      actor: "ฝ่ายบริหารยานพาหนะ / เจ้าหน้าที่คลัง",
      roleIcon: Truck,
      color: "from-slate-700 to-blue-900",
      accentBorder: "border-blue-400",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      pageTarget: "vehicles" as AppNavView,
      pageName: "สารระบบทะเบียนรถ & รับของเข้าคลัง",
      description: "ระบบบันทึกประวัติการซ่อมบำรุงเข้าทะเบียนรถอัตโนมัติ พร้อมตรวจรับของใหม่เข้าคลัง",
      keyActions: [
        "ประวัติการซ่อม ค่าใช้จ่าย และเลขไมล์ล่าสุด ถูกซิงค์เข้า 'สารระบบทะเบียนรถ' อัตโนมัติ",
        "ฝ่ายจัดซื้อสั่งซื้ออะไหล่ทดแทนและบันทึก 'รับของเข้าคลัง (Goods Receipt - GR)'",
        "ยอดสต็อกใน Part List เพิ่มขึ้นอัตโนมัติ พร้อมใช้งานสำหรับงานซ่อมถัดไป",
        "สามารถสำรองข้อมูล (Backup) หรือส่งออกรายงาน Excel 5-in-1 ได้ทุกเวลา"
      ],
      outputDoc: "ประวัติการซ่อมบำรุงรถ (Vehicle History) & รายงานสรุป",
      nextStepSummary: "วงจรการบริหารยานพาหนะและคลังสมบูรณ์แบบ"
    }
  ];

  // Detailed Page Explanations
  const pageGuides = [
    {
      id: "requester",
      title: "1. หน้าผู้แจ้งซ่อม (Requester Portal)",
      shortDesc: "ศูนย์กลางสำหรับคนขับรถและผู้ใช้งานทั่วไปในการเปิดใบแจ้งซ่อมและติดตามสถานะ",
      targetView: "requester" as AppNavView,
      icon: Car,
      badgeText: "สำหรับ: พนักงานขับรถ / หัวหน้าฝ่ายขนส่ง / ผู้รับผิดชอบรถ",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      accentColor: "blue",
      mainFunctions: [
        {
          name: "เปิดฟอร์มแจ้งซ่อมใหม่ (+ แจ้งซ่อม)",
          desc: "บันทึกข้อมูลอาการเสียของรถ เลือกระดับความเร่งด่วน ถ่ายรูปหรือแนบรูปชิ้นส่วนที่ชำรุด และระบุเลขไมล์ล่าสุด"
        },
        {
          name: "ค้นหาและติดตามสถานะงานซ่อม (Live Tracking)",
          desc: "ตรวจสอบว่าใบแจ้งซ่อมอยู่ในขั้นตอนใด (รอดำเนินการ, กำลังซ่อม, รออะไหล่, ซ่อมเสร็จสมบูรณ์) พร้อมระบุช่างผู้ดูแล"
        },
        {
          name: "ปักหมุดพิกัดรถเสียฉุกเฉิน (Emergency Breakdown GPS)",
          desc: "กรณีรถเสียบนเส้นทางหลวง สามารถเปิดพิกัด GPS ระบุหลักกิโลเมตร สายทางหลวง หรือจุดสังเกตเพื่อส่งหน่วยโมบายเซอร์วิสช่วยเหลือ"
        },
        {
          name: "ประเมินความพึงพอใจงานซ่อม (Rating & Feedback)",
          desc: "เมื่อซ่อมเสร็จสมบูรณ์ สามารถให้คะแนนช่างและบริการ (1-5 ดาว) พร้อมแสดงความคิดเห็นเพื่อปรับปรุงคุณภาพ"
        }
      ],
      tips: [
        "กรอกเลขไมล์ตามจริงเสมอ เพื่อให้ระบบบันทึกรอบการเช็คระยะ (PM) ได้แม่นยำ",
        "แนบรูปภาพหรือวิดีโออาการเสีย จะช่วยให้ช่างเตรียมอะไหล่และวิเคราะห์อาการได้รวดเร็วขึ้น"
      ]
    },
    {
      id: "worker",
      title: "2. หน้าทำงาน & ช่าง (Work Operations & Workshop Portal)",
      shortDesc: "แดชบอร์ดบริหารจัดการงานซ่อมสำหรับหัวหน้าช่างและทีมช่างประจำอู่ TNB",
      targetView: "worker" as AppNavView,
      icon: HardHat,
      badgeText: "สำหรับ: หัวหน้าช่าง / Foreman / ช่างเทคนิคประจำศูนย์ซ่อม",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      accentColor: "amber",
      mainFunctions: [
        {
          name: "บอร์ดจัดการงานซ่อม (Kanban & List View)",
          desc: "แสดงรายการงานซ่อมทั้งหมด แยกตามสถานะความคืบหน้า (Pending, Inspecting, Waiting Parts, In Progress, Testing, Completed) และระดับความเร่งด่วน"
        },
        {
          name: "มอบหมายช่างผู้รับผิดชอบ & บันทึกการวินิจฉัย",
          desc: "กำหนดชื่อช่างผู้ซ่อม บันทึกอาการเสียที่ตรวจพบจริง และขั้นตอนการแก้ไข"
        },
        {
          name: "เบิกใช้อะไหล่และตัดสต็อกอัตโนมัติ (Direct Part Disbursal)",
          desc: "เลือกอะไหล่จากคลังตัดยอดสต็อกคงเหลือทันที พร้อมคำนวณมูลค่ารวมและลงบัญชีต้นทุนงานซ่อม"
        },
        {
          name: "ประเมินสภาพชิ้นส่วนเก่าหลังถอด (Post-Repair Part Lifecycle)",
          desc: "คัดแยกชิ้นส่วนที่ถอดออกว่า 'สามารถนำไป Rebuild ซ่อมเป็นอะไหล่สำรองได้' หรือ 'จำหน่ายเป็นซาก (Scrap)'"
        },
        {
          name: "พิมพ์ใบสั่งซ่อมมาตรฐาน (Work Order Print)",
          desc: "สร้างเอกสารใบสั่งซ่อมพร้อมแบบฟอร์มลงนามรับมอบงานและรายละเอียดอะไหล่ที่ใช้"
        }
      ],
      tips: [
        "หากต้องรออะไหล่จากภายนอก ให้เปลี่ยนสถานะเป็น 'รออะไหล่' เพื่อให้ผู้แจ้งซ่อมทราบสถานะ",
        "บันทึกค่าแรงและค่าบริการให้ครบถ้วนเพื่อสรุปรายงานต้นทุนรายคันได้อย่างถูกต้อง"
      ]
    },
    {
      id: "vehicles",
      title: "3. สารระบบทะเบียนรถ (Vehicle Master Registry)",
      shortDesc: "ฐานข้อมูลประวัติและมาตรฐานยานพาหนะของบริษัท TNB Logistics ทั้งหมด",
      targetView: "vehicles" as AppNavView,
      icon: Truck,
      badgeText: "สำหรับ: ผู้จัดการฝ่ายยานพาหนะ / เจ้าหน้าที่ทะเบียน / แอดมิน",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accentColor: "emerald",
      mainFunctions: [
        {
          name: "จัดเก็บข้อมูลมาตรฐาน 27 ฟิลด์",
          desc: "บันทึกรหัส ERP (เช่น T10-01, TL001), ทะเบียนรถ, ยี่ห้อ, รุ่น, ประเภทรถ, เลขคัสซี, เลขเครื่องยนต์, บริษัทผู้ถือกรรมสิทธิ์ และผู้ขับขี่"
        },
        {
          name: "ระบบแจ้งเตือนวันหมดอายุภาษี / พรบ. / ประกันภัย",
          desc: "ติดตามวันต่อภาษีประจำปี วันสิ้นสุดความคุ้มครอง พรบ. ประกันภัยรถยนต์ และประกันภัยสินค้าล่วงหน้า เพื่อป้องกันการขาดต่อ"
        },
        {
          name: "ประวัติการซ่อมบำรุงเฉพาะคัน (Vehicle Service History)",
          desc: "ดูรายการงานซ่อมย้อนหลังทั้งหมดของรถแต่ละคัน ยอดค่าใช้จ่ายสะสม และประวัติการเบิกอะไหล่"
        },
        {
          name: "เปิดแจ้งซ่อมด่วนจากหน้ารถ (Quick Repair Trigger)",
          desc: "คลิกปุ่มแจ้งซ่อมจากแถวข้อมูลรถคันนั้นได้ทันที ระบบจะดึงข้อมูลรถไปกรอกในฟอร์มอัตโนมัติ"
        },
        {
          name: "นำเข้า-ส่งออกข้อมูล Excel / CSV",
          desc: "สามารถดาวน์โหลด Template เพื่อนำเข้าข้อมูลรถจำนวนมาก หรือส่งออกข้อมูลไปใช้งานต่อ"
        }
      ],
      tips: [
        "เมื่อมีงานซ่อมเกิดขึ้น ระบบจะดึงข้อมูลเลขไมล์ล่าสุดมาอัปเดตในทะเบียนรถให้อัตโนมัติ",
        "สามารถค้นหาตามทะเบียน ทะเบียนเดิม หรือรหัส ERP เพื่อเข้าถึงข้อมูลได้อย่างรวดเร็ว"
      ]
    },
    {
      id: "part_list",
      title: "4. Part List & แคตตาล็อกอะไหล่ (Inventory & Catalog)",
      shortDesc: "ศูนย์บริหารจัดการสต็อกอะไหล่ ชิ้นส่วน และของเหลวในคลังซ่อมบำรุง",
      targetView: "part_list" as AppNavView,
      icon: Boxes,
      badgeText: "สำหรับ: เจ้าหน้าที่คลังสโตร์ / ช่างผู้เบิกพัสดุ",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      accentColor: "purple",
      mainFunctions: [
        {
          name: "บัญชีรายการอะไหล่และสเปก",
          desc: "จัดเก็บรหัสอะไหล่ (Code), ชื่อชิ้นส่วน, หมวดหมู่ (ช่วงล่าง, น้ำมัน, ไฟฟ้า ฯลฯ), ยี่ห้อ, สเปก และหน่วยนับ"
        },
        {
          name: "ระบุตำแหน่งชั้นวางจัดเก็บ (Rack Location)",
          desc: "บันทึกจุดจัดเก็บในคลัง เช่น Rack A-01, B-02 เพื่อให้ช่างและเจ้าหน้าที่สโตร์หยิบชิ้นส่วนได้ทันที"
        },
        {
          name: "การแจ้งเตือนอะไหล่ใกล้หมด (Min Stock Alert)",
          desc: "ระบบแจ้งเตือนเตือนอัตโนมัติเมื่อยอดคงเหลือลดลงต่ำกว่าจุดสั่งซื้อขั้นต่ำ (Safety Stock)"
        },
        {
          name: "การบริหารจัดการอะไหล่ Rebuild / สำรอง",
          desc: "ระบุหมวดหมู่อะไหล่ที่สามารถส่งซ่อม Rebuild เก็บเป็นอะไหล่สำรองได้ เพื่อลดต้นทุนการซื้อใหม่"
        },
        {
          name: "การเชื่อมต่อระบบรับของและเบิกของ",
          desc: "ทางลัดในการสลับไปหน้า 'รับของเข้าคลัง' หรือ 'เบิกของ' เพื่อบันทึกความเคลื่อนไหวสต็อก"
        }
      ],
      tips: [
        "ตั้งค่าระดับ Minimum Stock Level ให้เหมาะสม เพื่อให้ระบบเตือนก่อนที่อะไหล่จำเป็นจะหมดคลัง",
        "อะไหล่ที่มีการตัดจ่ายในงานซ่อม ยอดสต็อกจะลดลงแบบ Real-time ทันที"
      ]
    },
    {
      id: "receiving",
      title: "5. รับของเข้าคลัง (Goods Receipt - GR)",
      shortDesc: "บันทึกการตรวจรับพัสดุ น้ำมันหล่อลื่น และอะไหล่ใหม่จากผู้จัดจำหน่ายเข้าสู่สต็อก",
      targetView: "receiving" as AppNavView,
      icon: PackagePlus,
      badgeText: "สำหรับ: เจ้าหน้าที่ตรวจรับพัสดุ / แผนกจัดซื้อ / คลังสินค้า",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accentColor: "emerald",
      mainFunctions: [
        {
          name: "บันทึกการตรวจรับสินค้าเข้าคลัง (Stock In)",
          desc: "ระบุชื่อซัพพลายเออร์, เลขที่ใบสั่งซื้อ (PO No.), เลขที่ใบกำกับภาษี/ใบส่งของ (Invoice No.) และวันที่รับของ"
        },
        {
          name: "เพิ่มสต็อกเข้า Part List อัตโนมัติ",
          desc: "เมื่อบันทึกการตรวจรับ ระบบจะเพิ่มจำนวนสินค้าเข้าสู่สต็อกคงเหลือใน Part List ทันทีโดยไม่ต้องคีย์ซ้ำ"
        },
        {
          name: "บันทึกราคาทุนและมูลค่ารวม",
          desc: "คำนวณมูลค่าการรับของแต่ละรายการและยอดรวมทั้งบิลเพื่อลงบัญชีคลัง"
        },
        {
          name: "จัดเก็บประวัติเอกสารตรวจรับ",
          desc: "สามารถค้นหาและตรวจสอบย้อนหลังได้ว่าอะไหล่แต่ละชิ้นรับเข้ามาเมื่อใด จากใคร และราคาเท่าใด"
        }
      ],
      tips: [
        "ตรวจนับจำนวนและสภาพสินค้าให้ตรงกับใบส่งของก่อนกดยืนยันตรวจรับ",
        "หากเป็นอะไหล่รายการใหม่ สามารถเพิ่มเข้าสารบบพัสดุในขณะที่รับของได้ทันที"
      ]
    },
    {
      id: "requisition",
      title: "6. เบิกของ & อะไหล่ (Goods Requisition - GI)",
      shortDesc: "บันทึกการขอเบิกอะไหล่ วัสดุสิ้นเปลือง และของเหลวเพื่อนำไปใช้งาน",
      targetView: "requisition" as AppNavView,
      icon: PackageMinus,
      badgeText: "สำหรับ: ช่างผู้เบิก / เจ้าหน้าที่จ่ายของสโตร์ / หัวหน้างาน",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      accentColor: "amber",
      mainFunctions: [
        {
          name: "สร้างใบขอเบิกพัสดุ (Goods Requisition - GI)",
          desc: "ระบุวัตถุประสงค์การเบิก เช่น เบิกเพื่องานซ่อมบำรุงรถ, เบิกตามรอบ PM หรือเบิกใช้งานทั่วไป"
        },
        {
          name: "เชื่อมโยงกับทะเบียนรถ & ใบแจ้งซ่อม",
          desc: "สามารถเลือกผูกกับการซ่อมรถคันใด หรือใบแจ้งซ่อมเลขที่ใด เพื่อให้บันทึกต้นทุนรายคันได้อย่างแม่นยำ"
        },
        {
          name: "ตัดสต็อกคงคลังอัตโนมัติ (Stock Out)",
          desc: "เมื่อบันทึกใบเบิก ระบบจะลดจำนวนคงเหลือใน Part List ทันที พร้อมแสดงจำนวนคงเหลือล่าสุด"
        },
        {
          name: "สรุปยอดการเบิกจ่ายและมูลค่ารวม",
          desc: "แสดงรายการประวัติการเบิกจ่ายทั้งหมด ยอดเงินรวม และผู้ขอเบิก/ผู้อนุมัติ"
        }
      ],
      tips: [
        "ระบุเลขที่ใบแจ้งซ่อมหรือทะเบียนรถทุกครั้ง เพื่อให้ต้นทุนผูกกับประวัติรถคันนั้นอย่างสมบูรณ์",
        "ตรวจสอบยอดคงเหลือก่อนทำการเบิกจ่ายจริง"
      ]
    },
    {
      id: "pm_plan",
      title: "7. แผน PM รถ เดือน/ปี (Preventive Maintenance Master Plan)",
      shortDesc: "วางแผนและควบคุมการบำรุงรักษาเชิงป้องกันตามระยะทาง/เวลา พร้อม Export Excel และเอกสาร ISO",
      targetView: "pm_plan" as AppNavView,
      icon: CalendarDays,
      badgeText: "สำหรับ: ผู้จัดการกองรถ / หัวหน้าช่าง / เจ้าหน้าที่วางแผน PM",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accentColor: "emerald",
      mainFunctions: [
        {
          name: "ตารางแผนแม่บท 12 เดือนรายคัน (Annual Master Matrix 12 Months)",
          desc: "แสดงแผนภาพรวมยานพาหนะทุกคัน x 12 เดือน ม.ค. - ธ.ค. พร้อมระดับ PM (PM1, PM2, PM3, ตรวจสภาพประจำปี) และสถานะความคืบหน้า"
        },
        {
          name: "ตารางงานรายเดือน & Checklist ตรวจเช็คตามมาตรฐาน ISO",
          desc: "ควบคุมรายการตรวจเช็คมาตรฐาน (น้ำมันเครื่อง, ไส้กรอง, ลูกปืนล้อ, เบรกลม, คิงพิน, ยาง ฯลฯ) พร้อมบันทึกช่างผู้รับผิดชอบ"
        },
        {
          name: "เปิดใบสั่งซ่อมจากแผน PM ด้วยคลิกเดียว (1-Click Work Order)",
          desc: "สร้างใบสั่งซ่อมบำรุงตามรอบ PM เข้าสู่ระบบงานช่างทันที พร้อมเชื่อมโยงประวัติรถยนต์"
        },
        {
          name: "จัดแผนแม่บทอัตโนมัติตามรอบไมล์ (Auto-Generate Annual PM)",
          desc: "ระบบจัดตาราง PM ล่วงหน้าสำหรับรถทั้งกองตามรอบระยะทางและประเภทรถอย่างแม่นยำ"
        },
        {
          name: "ส่งออกรายงาน Excel (ISO Control Export)",
          desc: "ส่งออกแผนแม่บท 12 เดือน และรายงาน PM รายเดือนเป็นไฟล์ Excel (.xlsx) และ CSV พร้อมเลขที่เอกสารควบคุม TNB-MT-PLN-001-Rev.02"
        }
      ],
      tips: [
        "จัดแผน PM สม่ำเสมอช่วยลดอัตราการเกิดรถเสียระหว่างทาง (Breakdown) ได้มากกว่า 80%",
        "เอกสารที่ส่งออกมีหมายเลขควบคุม ISO 9001/ISO 39001 ครบถ้วน พร้อมนำไปใช้ในการ Audit ได้ทันที"
      ]
    }
  ];

  // Integration matrix points
  const integrationPoints = [
    {
      source: "สารระบบทะเบียนรถ (Vehicle Master)",
      action: "ส่งข้อมูลรถและเลขไมล์ไปยัง",
      target: "หน้าผู้แจ้งซ่อม (Requester Portal)",
      detail: "เมื่อเปิดใบแจ้งซ่อม ระบบจะดึงรหัส ERP, ทะเบียนรถ, ยี่ห้อ, รุ่น และคนขับประจำรถมาแสดงให้อัตโนมัติ"
    },
    {
      source: "หน้าผู้แจ้งซ่อม (Requester Portal)",
      action: "สร้างและส่งใบแจ้งซ่อมไปยัง",
      target: "หน้าทำงาน & ช่าง (Workshop Operations)",
      detail: "ใบแจ้งซ่อมใหม่จะปรากฏบนกระดานงานซ่อมของช่างทันที พร้อมระดับความเร่งด่วน รูปภาพ และพิกัด GPS"
    },
    {
      source: "หน้าทำงาน & ช่าง (Workshop Operations)",
      action: "สั่งเบิกอะไหล่และตัดสต็อกใน",
      target: "Part List & เบิกของ (Inventory / GI)",
      detail: "เมื่อช่างเลือกอะไหล่ที่ใช้ในงานซ่อม ระบบจะตัดยอดคงเหลือใน Part List และสร้างประวัติใบเบิกของให้อัตโนมัติ"
    },
    {
      source: "รับของเข้าคลัง (Goods Receipt - GR)",
      action: "เพิ่มจำนวนสินค้าและอัปเดตสต็อกใน",
      target: "Part List & แคตตาล็อกอะไหล่",
      detail: "เมื่อเจ้าหน้าที่คลังบันทึกการรับของจากซัพพลายเออร์ ยอดคงเหลือใน Part List จะเพิ่มขึ้นทันทีแบบ Real-time"
    },
    {
      source: "หน้าทำงาน & ช่าง (เมื่อปิดงานซ่อม)",
      action: "บันทึกประวัติและอัปเดตเลขไมล์กลับไปยัง",
      target: "สารระบบทะเบียนรถ (Vehicle Master)",
      detail: "เมื่อซ่อมเสร็จสมบูรณ์ ประวัติงานซ่อม ค่าใช้จ่ายรวม และเลขไมล์ล่าสุดจะถูกบันทึกเข้าประวัติรถคันนั้น"
    }
  ];

  // Role guide
  const roleGuides = [
    {
      role: "พนักงานขับรถ / ผู้ดูแลรถ (Drivers & Requesters)",
      icon: Car,
      color: "border-blue-500/50 bg-blue-950/20",
      primaryDuty: "ตรวจสอบความพร้อมของรถและแจ้งปัญหาเมื่อพบอาการชำรุด",
      steps: [
        "1. เข้า 'หน้าผู้แจ้งซ่อม' -> คลิกปุ่ม '+ แจ้งซ่อมใหม่'",
        "2. เลือกทะเบียนรถของตนเอง และกรอกเลขไมล์ล่าสุด",
        "3. ระบุอาการเสีย ถ่ายรูปจุดที่ชำรุด หรือเปิด GPS หากรถเสียฉุกเฉิน",
        "4. ติดตามสถานะจนกระทั่งช่างซ่อมเสร็จ และให้คะแนนประเมินการบริการ"
      ]
    },
    {
      role: "หัวหน้าช่าง & ช่างเทคนิค (Mechanics & Workshop)",
      icon: HardHat,
      color: "border-amber-500/50 bg-amber-950/20",
      primaryDuty: "ประเมินอาการ ซ่อมบำรุงรถ เบิกอะไหล่ และควบคุมคุณภาพ",
      steps: [
        "1. เข้า 'หน้าทำงาน & ช่าง' -> ตรวจสอบรายการงานซ่อมใหม่ในคอลัมน์ Pending",
        "2. รับงาน มอบหมายช่าง และพิมพ์ใบสั่งซ่อม (Work Order)",
        "3. เบิกอะไหล่จากคลัง (ระบบตัดสต็อกอัตโนมัติ) และลงมือซ่อม",
        "4. คัดแยกอะไหล่เก่าที่ถอดออก (ส่ง Rebuild หรือขายเป็นซาก)",
        "5. ตรวจสอบคุณภาพ (QC) และเปลี่ยนสถานะเป็น 'ซ่อมเสร็จสมบูรณ์'"
      ]
    },
    {
      role: "เจ้าหน้าที่คลังพัสดุ & สโตร์ (Store & Inventory Keepers)",
      icon: Boxes,
      color: "border-purple-500/50 bg-purple-950/20",
      primaryDuty: "บริหารจัดการสต็อกอะไหล่ ตรวจรับของ และจ่ายของตามใบขอเบิก",
      steps: [
        "1. ตรวจสอบ 'Part List' ดูยอดคงเหลือ และรายการที่แจ้งเตือน Low Stock",
        "2. เมื่อมีสินค้าใหม่เข้ามา บันทึกใน 'รับของเข้าคลัง (Goods Receipt)'",
        "3. ตรวจสอบและอนุมัติการจ่ายของใน 'เบิกของ & อะไหล่ (Goods Requisition)'",
        "4. นำอะไหล่ที่ผ่านการ Rebuild กลับมาขึ้นทะเบียนเป็นอะไหล่สำรองในคลัง"
      ]
    },
    {
      role: "ผู้จัดการยานพาหนะ & ผู้บริหาร (Fleet Manager & Admin)",
      icon: ShieldCheck,
      color: "border-emerald-500/50 bg-emerald-950/20",
      primaryDuty: "กำกับดูแลภาพรวม ควบคุมต้นทุน และดูแลทะเบียนประวัติรถ",
      steps: [
        "1. ตรวจสอบ 'สารระบบทะเบียนรถ' ดูวันหมดอายุภาษี พรบ. และประกันภัย",
        "2. ตรวจสอบประวัติการซ่อมและค่าใช้จ่ายสะสมของรถแต่ละคัน",
        "3. ส่งออกรายงาน Excel 5-in-1 หรือสำรองข้อมูล (Backup) ระบบ",
        "4. นำข้อมูลไปวางแผนการซ่อมบำรุงเชิงป้องกัน (PM) เพื่อลด Downtime"
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
              <Workflow className="w-3.5 h-3.5" />
              <span>TNB Logistics Fleet & Workshop Operations Manual</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              คู่มือ & แผนผัง Flow การทำงานระบบ TNB Fleet Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              อธิบายขั้นตอนการทำงานตั้งแต่การแจ้งซ่อม, งานซ่อมบำรุง, การจัดการทะเบียนรถ, การรับ-เบิกจ่ายอะไหล่คลังสินค้า และการปิดงานแบบครบวงจร
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-guide-create-ticket"
              onClick={onOpenNewTicketModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>+ เปิดแจ้งซ่อม</span>
            </button>
            {onOpenExportBackupModal && (
              <button
                id="btn-guide-open-backup"
                onClick={onOpenExportBackupModal}
                className="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/40 shadow-sm transition-all flex items-center space-x-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>สำรอง / ส่งออก Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-700/80 pt-4">
          <button
            id="tab-workflow-flow"
            onClick={() => setActiveTab("flow")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "flow"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>1. ภาพรวม Flow การทำงาน (6 ขั้นตอน)</span>
          </button>

          <button
            id="tab-workflow-pages"
            onClick={() => setActiveTab("pages")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pages"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. คำอธิบายหน้าที่แยกตามหน้า (6 โมดูล)</span>
          </button>

          <button
            id="tab-workflow-integration"
            onClick={() => setActiveTab("integration")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "integration"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>3. การเชื่อมโยงข้อมูลระหว่างระบบ (Integration)</span>
          </button>

          <button
            id="tab-workflow-roles"
            onClick={() => setActiveTab("roles")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "roles"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. บทบาทหน้าที่ & ขั้นตอนตามตำแหน่ง (Roles & SOP)</span>
          </button>

          <button
            id="tab-workflow-iso"
            onClick={() => setActiveTab("iso_control")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "iso_control"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>5. ทะเบียนเอกสารควบคุม ISO (ISO Control TNB-MT-xxx)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: End-to-End Workflow Steps */}
      {activeTab === "flow" && (
        <div className="space-y-6">
          {/* Quick Flow Horizontal Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Workflow className="w-4 h-4 text-blue-400" />
                  <span>แผนผังวงจรงานซ่อมบำรุงและคลังอะไหล่ (End-to-End Workflow)</span>
                </h3>
                <p className="text-xs text-slate-400">คลิกที่แต่ละขั้นตอนเพื่อดูรายละเอียดการทำงานและหน้าที่รับผิดชอบ</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                6 ขั้นตอนมาตรฐาน
              </span>
            </div>

            {/* Interactive Steps Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {workflowSteps.map((step, idx) => {
                const Icon = step.roleIcon;
                const isSelected = selectedStepIndex === idx;
                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                        : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          STEP {step.stepNumber}
                        </span>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">{step.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{step.actor}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className={isSelected ? 'text-blue-400 font-semibold' : 'text-slate-500'}>
                        {step.pageName}
                      </span>
                      {idx < workflowSteps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-600 hidden lg:inline" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Step Deep Dive Card */}
          {workflowSteps[selectedStepIndex] && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${workflowSteps[selectedStepIndex].color}`}></div>

              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-blue-500 text-white">
                      ขั้นตอนที่ {workflowSteps[selectedStepIndex].stepNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${workflowSteps[selectedStepIndex].badgeColor}`}>
                      ผู้รับผิดชอบ: {workflowSteps[selectedStepIndex].actor}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      ทำงานที่: {workflowSteps[selectedStepIndex].pageName}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {workflowSteps[selectedStepIndex].title}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-400 font-medium mt-0.5">
                      {workflowSteps[selectedStepIndex].subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {workflowSteps[selectedStepIndex].description}
                    </p>
                  </div>

                  {/* Key Action Checkpoints */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>กิจกรรมหลักในขั้นตอนนี้ (Key Action Items)</span>
                    </div>
                    <ul className="space-y-2">
                      {workflowSteps[selectedStepIndex].keyActions.map((action, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Document & Handover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      <div className="text-[11px] text-slate-400">เอกสาร / ผลลัพธ์ที่ได้:</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>{workflowSteps[selectedStepIndex].outputDoc}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      <div className="text-[11px] text-slate-400">ขั้นตอนถัดไป (Next Handover):</div>
                      <div className="text-xs font-bold text-blue-300 mt-0.5 flex items-center space-x-1.5">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{workflowSteps[selectedStepIndex].nextStepSummary}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Box */}
                <div className="w-full lg:w-72 bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-4 shrink-0">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span>ไปที่หน้านี้เพื่อทดลองใช้งาน</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      กดปุ่มด้านล่างเพื่อเปิดไปยัง <strong>{workflowSteps[selectedStepIndex].pageName}</strong> และเริ่มทำรายการได้ทันที
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onNavigateToView(workflowSteps[selectedStepIndex].pageTarget)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <span>ไปยัง {workflowSteps[selectedStepIndex].pageName}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Step switchers */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
                      <button
                        disabled={selectedStepIndex === 0}
                        onClick={() => setSelectedStepIndex(prev => Math.max(0, prev - 1))}
                        className={`px-2.5 py-1 rounded font-medium ${
                          selectedStepIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        ← ขั้นตอนก่อนหน้า
                      </button>
                      <span className="text-slate-500 font-bold">{selectedStepIndex + 1} / {workflowSteps.length}</span>
                      <button
                        disabled={selectedStepIndex === workflowSteps.length - 1}
                        onClick={() => setSelectedStepIndex(prev => Math.min(workflowSteps.length - 1, prev + 1))}
                        className={`px-2.5 py-1 rounded font-medium ${
                          selectedStepIndex === workflowSteps.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        ขั้นตอนถัดไป →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Page by Page Feature Manual */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          {/* Page Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {pageGuides.map((p, idx) => {
              const Icon = p.icon;
              const isSelected = selectedPageIndex === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{p.title.split(". ")[1] || p.title}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {p.id}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Page Guide Card */}
          {pageGuides[selectedPageIndex] && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pageGuides[selectedPageIndex].badgeColor}`}>
                      {pageGuides[selectedPageIndex].badgeText}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2 pt-1">
                    <span>{pageGuides[selectedPageIndex].title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {pageGuides[selectedPageIndex].shortDesc}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToView(pageGuides[selectedPageIndex].targetView)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 self-start sm:self-center shrink-0 active:scale-95"
                >
                  <span>เปิดหน้านี้ทันที</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>ฟังก์ชันการทำงานหลักในหน้านี้ (Core Features & Operations)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {pageGuides[selectedPageIndex].mainFunctions.map((fn, fIdx) => (
                    <div key={fIdx} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-blue-300 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>{fn.name}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-4">
                        {fn.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Recommendations */}
              <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-300 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>คำแนะนำการใช้งาน (Tips & Best Practices)</span>
                </div>
                <ul className="space-y-1.5">
                  {pageGuides[selectedPageIndex].tips.map((tip, tIdx) => (
                    <li key={tIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Data Integration & Sync Flow */}
      {activeTab === "integration" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span>การเชื่อมโยงข้อมูลระหว่างโมดูล (Cross-Module Automatic Synchronization)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                ระบบ TNB Fleet Management มีการเชื่อมต่อข้อมูลแบบเรียลไทม์ระหว่างทุกหน้า เพื่อลดความซ้ำซ้อนและป้องกันข้อผิดพลาด
              </p>
            </div>

            {/* Integration Flow Cards */}
            <div className="space-y-3">
              {integrationPoints.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                        {item.source}
                      </span>
                      <span className="text-slate-400 font-medium flex items-center space-x-1">
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        <span>{item.action}</span>
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-900/40 text-emerald-300 border border-blue-700/50">
                        {item.target}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Summary Box */}
            <div className="p-4 bg-gradient-to-r from-slate-950 to-blue-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>ความสมบูรณ์แบบของระบบฐานข้อมูล (Data Consistency & Backup)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ข้อมูลทุกส่วนถูกบันทึกลงหน่วยความจำปลอดภัย (Local Storage) แบบอัตโนมัติ และรองรับการสำรองข้อมูลทั้งระบบออกเป็นไฟล์ Excel 5-in-1 (แผ่นงานรถ, อะไหล่, ใบแจ้งซ่อม, ใบรับของ, ใบเบิกของ) หรือ JSON Backup เพื่อความปลอดภัยสูงสุด
              </p>
              {onOpenExportBackupModal && (
                <button
                  onClick={onOpenExportBackupModal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>เปิดระบบส่งออก & สำรองข้อมูล (Backup Hub)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Roles & SOP Manual */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleGuides.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl border ${r.color} shadow-lg space-y-3.5 flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-slate-800 text-white border border-slate-700">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{r.role}</h3>
                        <p className="text-xs text-slate-400">{r.primaryDuty}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="text-xs font-bold text-slate-300">ขั้นตอนการปฏิบัติงานมาตรฐาน (SOP):</div>
                      <ul className="space-y-1.5">
                        {r.steps.map((step, sIdx) => (
                          <li key={sIdx} className="text-xs text-slate-300 flex items-start space-x-2">
                            <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Protocols */}
          <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">กรณีฉุกเฉิน: รถเสียระหว่างทาง (Highway Emergency Breakdown)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              หากรถเสียฉุกเฉินบนทางหลวงหรือเกิดอุบัติเหตุ พนักงานขับรถสามารถเปิดฟอร์มแจ้งซ่อม เลือกความเร่งด่วนเป็น <strong>"ด่วนมาก (ฉุกเฉิน)"</strong> พร้อมเปิดใช้งานปุ่ม <strong>"ปักหมุดพิกัด GPS รถเสียฉุกเฉิน"</strong> เพื่อส่งพิกัดดาวเทียม เลขสายทางหลวง และหลักกิโลเมตรไปยังทีมช่างโมบายเซอร์วิส (Mobile Service Unit) ได้ทันที
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: ISO Quality Document Control Register */}
      {activeTab === "iso_control" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/60 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    ทะเบียนคุมเอกสารมาตรฐานคุณภาพ ISO 9001:2015 & ISO 39001:2012
                  </h2>
                  <p className="text-xs text-slate-300">
                    TNB Logistics Fleet Maintenance Quality Document Master Control Register
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold">
                  ควบคุม 8 เอกสารหลัก
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              เอกสารและแบบฟอร์มทั้งหมดในระบบศูนย์บริการซ่อมบำรุง TNB Logistics ถูกจัดทำขึ้นตามข้อกำหนดของระบบบริหารงานคุณภาพ (ISO 9001) 
              และระบบการจัดการความปลอดภัยทางถนน (ISO 39001 - Road Traffic Safety Management) โดยมีหมายเลขควบคุมเอกสารและฉบับแก้ไข (Revision) กำกับทุกชุด
            </p>
          </div>

          {/* ISO Documents Master Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                <span>บัญชีแม่บทเอกสารควบคุมระบบงานซ่อมบำรุงยานพาหนะ (Master Document List)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                สถานะ: บังคับใช้ (Active)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-12 text-center">ลำดับ</th>
                    <th className="p-3 w-48 font-mono">รหัสเอกสาร (Doc Code)</th>
                    <th className="p-3">ชื่อเอกสาร / แบบฟอร์ม (Document Title)</th>
                    <th className="p-3 w-28">มาตรฐานอ้างอิง</th>
                    <th className="p-3 w-28">ผู้รับผิดชอบ</th>
                    <th className="p-3 w-24 text-center">มีผลบังคับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {Object.values(ISO_DOCUMENT_REGISTRY).map((doc, idx) => (
                    <tr key={doc.docCode} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 font-mono">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md font-bold text-[11px] inline-block">
                          {doc.fullCode}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{doc.titleTh}</div>
                        <div className="text-[11px] text-slate-400">{doc.titleEn}</div>
                      </td>
                      <td className="p-3 text-slate-300 text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {doc.standardReference}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 text-[11px]">
                        {doc.ownerDepartment}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] text-slate-400">
                        {doc.effectiveDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
