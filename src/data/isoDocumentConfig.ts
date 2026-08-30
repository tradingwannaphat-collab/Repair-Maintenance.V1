export interface IsoDocumentMeta {
  docCode: string; // e.g. "TNB-MT-PLN-001"
  revision: string; // e.g. "Rev.02"
  fullCode: string; // e.g. "TNB-MT-PLN-001-Rev.02"
  titleTh: string;
  titleEn: string;
  category: "planning" | "operation" | "registry" | "inventory" | "quality" | "checklist";
  effectiveDate: string; // "01/01/2026"
  standardReference: string; // "ISO 9001:2015 Clause 7.1.3 / ISO 39001:2012"
  retentionPeriod: string; // "5 ปี (5 Years)"
  ownerDepartment: string; // "ฝ่ายซ่อมบำรุงและบริหารยานพาหนะ (Fleet & Maintenance Dept.)"
  approvedBy: string; // "ผู้จัดการฝ่ายซ่อมบำรุง & ผู้จัดการทั่วไป"
  description: string;
}

export const ISO_DOCUMENT_REGISTRY: Record<string, IsoDocumentMeta> = {
  pm_plan: {
    docCode: "TNB-MT-PLN-001",
    revision: "Rev.02",
    fullCode: "TNB-MT-PLN-001-Rev.02",
    titleTh: "แผนการบำรุงรักษาเชิงป้องกันยานพาหนะประจำปีและรายเดือน (Preventive Maintenance Master Plan)",
    titleEn: "Annual & Monthly Fleet Preventive Maintenance (PM) Plan",
    category: "planning",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 7.1.3 Infrastructure) & ISO 39001 (Road Traffic Safety)",
    retentionPeriod: "5 ปี (นับจากสิ้นสุดรอบปีปฏิทิน)",
    ownerDepartment: "ฝ่ายซ่อมบำรุงและบริหารยานพาหนะ (TNB Fleet & Maintenance)",
    approvedBy: "ผู้จัดการแผนกซ่อมบำรุง / ผู้อำนวยการฝ่ายปฏิบัติการ",
    description: "กำหนดแผนงานและรอบการบำรุงรักษาเชิงป้องกัน (PM 1, PM 2, PM 3, Annual Inspection) สำหรับรถทุกประเภทในสังกัด เพื่อลด Breakdown และควบคุมมาตรฐานความปลอดภัย"
  },
  work_order: {
    docCode: "TNB-MT-WO-001",
    revision: "Rev.03",
    fullCode: "TNB-MT-WO-001-Rev.03",
    titleTh: "ใบแจ้งซ่อมและใบสั่งซ่อมบำรุงยานพาหนะ (Vehicle Repair Request & Work Order)",
    titleEn: "Vehicle Repair Request, Work Order & Completion Voucher",
    category: "operation",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 8.5 Production & Service Provision)",
    retentionPeriod: "5 ปี",
    ownerDepartment: "ฝ่ายซ่อมบำรุงและศูนย์บริการ TNB Workshop",
    approvedBy: "หัวหน้าแผนกซ่อมบำรุง (Foreman) / ช่างเทคนิคอาวุโส",
    description: "เอกสารบันทึกการแจ้งซ่อม ตรวจประเมิน จ่ายงานช่าง เบิกใช้อะไหล่ บันทึกค่าแรง และตรวจรับส่งมอบงานซ่อมบำรุง"
  },
  vehicle_registry: {
    docCode: "TNB-MT-REG-001",
    revision: "Rev.02",
    fullCode: "TNB-MT-REG-001-Rev.02",
    titleTh: "สารระบบทะเบียนประวัติและมาตรฐานยานพาหนะ 27 รายการ (Vehicle Master Registry & Spec Record)",
    titleEn: "Vehicle Master Registry & 27 Technical Specification Record",
    category: "registry",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 7.5 Documented Information) & กรมการขนส่งทางบก",
    retentionPeriod: "ตลอดอายุการใช้งานของยานพาหนะ + 5 ปีหลังจำหน่าย",
    ownerDepartment: "ฝ่ายทะเบียนและบริหารยานพาหนะ (Fleet Administration)",
    approvedBy: "ผู้จัดการฝ่ายยานพาหนะและขนส่ง",
    description: "ฐานข้อมูลหลักสำหรับควบคุมและจัดเก็บรายละเอียดรถ 27 รายการ มาตรฐานภาษี พรบ. ประกันภัย และประวัติการบำรุงรักษา"
  },
  inventory_master: {
    docCode: "TNB-MT-INV-001",
    revision: "Rev.01",
    fullCode: "TNB-MT-INV-001-Rev.01",
    titleTh: "บัญชีรายการพัสดุและสต็อกอะไหล่สำรอง (Spare Parts Inventory & Safety Stock Master)",
    titleEn: "Spare Parts Catalog, Inventory Control & Safety Stock Master",
    category: "inventory",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 8.5.4 Preservation)",
    retentionPeriod: "3 ปี",
    ownerDepartment: "ฝ่ายคลังพัสดุและสโตร์ (Store & Inventory Control)",
    approvedBy: "ผู้จัดการคลังสินค้าและพัสดุ",
    description: "ควบคุมรหัสพัสดุ ตำแหน่งชั้นวาง (Rack) ระดับ Minimum Stock Level และการบริหารอะไหล่ Rebuild สำรอง"
  },
  daily_inspection: {
    docCode: "TNB-SHE-FRM-007",
    revision: "Rev.03",
    fullCode: "TNB-SHE-FRM-007-Rev.03",
    titleTh: "แบบฟอร์มตรวจสอบความพร้อมและสภาพรถประจำวัน 21 รายการ (Daily Pre-Trip Vehicle Inspection 31-Day Matrix)",
    titleEn: "Daily Pre-Trip Vehicle Inspection 21-Checkpoints 31-Day Control Sheet",
    category: "checklist",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 39001:2012 (Road Traffic Safety Management) & ISO 9001:2015",
    retentionPeriod: "3 ปี",
    ownerDepartment: "ฝ่ายความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม (SHE & Fleet Dept.)",
    approvedBy: "เจ้าหน้าที่ความปลอดภัย (จป.วิชาชีพ) & ผู้จัดการฝ่ายขนส่ง",
    description: "ตารางบันทึกการตรวจเช็คสภาพความพร้อมของยานพาหนะ 21 รายการก่อนเริ่มปฏิบัติงานประจำวัน ตลอด 31 วันในรอบเดือน เพื่อป้องกันอุบัติเหตุและการ Breakdown กลางทาง"
  },
  goods_receipt: {
    docCode: "TNB-MT-GR-001",
    revision: "Rev.01",
    fullCode: "TNB-MT-GR-001-Rev.01",
    titleTh: "ใบตรวจรับพัสดุและชิ้นส่วนอะไหล่เข้าคลัง (Goods Receipt Inspection & Stock In)",
    titleEn: "Goods Receipt Note (GR) & Receiving Inspection Record",
    category: "inventory",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 8.4 Control of Externally Provided Processes)",
    retentionPeriod: "5 ปี",
    ownerDepartment: "ฝ่ายคลังพัสดุและฝ่ายจัดซื้อ",
    approvedBy: "เจ้าหน้าที่ตรวจรับพัสดุ / หัวหน้าสโตร์",
    description: "บันทึกการตรวจรับของจากซัพพลายเออร์ ตรวจสอบคุณภาพตาม PO และเพิ่มยอดสต็อกคงคลัง"
  },
  goods_requisition: {
    docCode: "TNB-MT-GI-001",
    revision: "Rev.01",
    fullCode: "TNB-MT-GI-001-Rev.01",
    titleTh: "ใบขอเบิกพัสดุและชิ้นส่วนอะไหล่ซ่อมบำรุง (Goods Requisition & Disbursal Voucher)",
    titleEn: "Goods Requisition Note (GI) & Parts Disbursal Voucher",
    category: "inventory",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 8.5.2 Identification and Traceability)",
    retentionPeriod: "5 ปี",
    ownerDepartment: "ฝ่ายคลังพัสดุและฝ่ายซ่อมบำรุง",
    approvedBy: "ผู้ขอเบิก / หัวหน้าแผนกผู้อนุมัติ",
    description: "บันทึกการขอเบิกใช้อะไหล่และของเหลว เชื่อมโยงกับเลขที่ใบแจ้งซ่อมและทะเบียนรถ เพื่อตัดสต็อกทันที"
  },
  quality_control: {
    docCode: "TNB-MT-QC-001",
    revision: "Rev.01",
    fullCode: "TNB-MT-QC-001-Rev.01",
    titleTh: "แบบฟอร์มตรวจสอบคุณภาพหลังงานซ่อมและคัดแยกอะไหล่ (Post-Repair QC & Rebuild Inspection)",
    titleEn: "Post-Repair Quality Inspection & Parts Rebuild Assessment Record",
    category: "quality",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015 (Clause 8.6 Release of Products and Services)",
    retentionPeriod: "5 ปี",
    ownerDepartment: "ฝ่ายควบคุมคุณภาพงานซ่อม (QC & Workshop Safety)",
    approvedBy: "หัวหน้าช่างตรวจสอบคุณภาพ (QC Lead)",
    description: "แบบบันทึกการทดสอบสมรรถนะรถก่อนส่งมอบ และการคัดแยกชิ้นส่วนที่ถอดออกว่าสามารถ Rebuild หรือขายเป็นซาก"
  },
  daily_checklist: {
    docCode: "TNB-MT-CHK-001",
    revision: "Rev.02",
    fullCode: "TNB-MT-CHK-001-Rev.02",
    titleTh: "แบบบันทึกการตรวจสอบสภาพรถประจำวันก่อนปฏิบัติงาน (Daily Pre-Trip Vehicle Inspection Checklist)",
    titleEn: "Daily Pre-Trip Vehicle Safety Inspection Checklist",
    category: "checklist",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 39001 (Road Traffic Safety Management System)",
    retentionPeriod: "1 ปี",
    ownerDepartment: "ฝ่ายปฏิบัติการขนส่ง (Transport Operations)",
    approvedBy: "พนักงานขับรถ / หัวหน้าสายรถ",
    description: "ตรวจสอบความพร้อมของระบบเบรก ลมยาง ไฟส่องสว่าง ระดับน้ำมันเครื่อง ก่อนนำรถออกปฏิบัติงานบนท้องถนน"
  }
};

export function getIsoDocHeader(key: keyof typeof ISO_DOCUMENT_REGISTRY): IsoDocumentMeta {
  return ISO_DOCUMENT_REGISTRY[key] || {
    docCode: "TNB-MT-GEN-001",
    revision: "Rev.01",
    fullCode: "TNB-MT-GEN-001-Rev.01",
    titleTh: "เอกสารมาตรฐานระบบซ่อมบำรุง TNB Logistics",
    titleEn: "TNB Maintenance Standard Document",
    category: "operation",
    effectiveDate: "01/01/2026",
    standardReference: "ISO 9001:2015",
    retentionPeriod: "5 ปี",
    ownerDepartment: "ฝ่ายซ่อมบำรุง",
    approvedBy: "ผู้จัดการแผนก",
    description: "เอกสารควบคุมในระบบคุณภาพ"
  };
}
