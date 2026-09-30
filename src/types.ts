export type RepairCategory = 
  | 'suspension' // ระบบช่วงล่าง & เบรก
  | 'lubricant'  // ระบบหล่อลื่น & ของเหลว
  | 'lighting'   // ระบบแสงสว่าง & ไฟฟ้า
  | 'engine'     // เครื่องยนต์ & ระบบส่งกำลัง
  | 'tires'      // ยาง & ล้อ
  | 'aircon'     // ระบบปรับอากาศ & แอร์
  | 'bodywork'   // ตัวถัง สี & กระจก
  | 'inspection' // ตรวจเช็คตามระยะทาง (PM)
  | 'other';     // อื่นๆ / ทั่วไป

export type RepairStatus = 
  | 'pending'       // รอดำเนินการ / รับเรื่อง
  | 'inspecting'    // กำลังตรวจเช็คประเมิน
  | 'waiting_parts' // รออะไหล่ / อนุมัติสั่งซื้อ
  | 'in_progress'   // กำลังดำเนินการซ่อม
  | 'testing'       // ทดสอบคุณภาพ (QC)
  | 'completed'     // ซ่อมเสร็จสมบูรณ์ / พร้อมส่งมอบ
  | 'cancelled';    // ยกเลิก

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'urgent';

export type VehicleType = 
  | 'tractor_6w'      // หัวลาก 6 ล้อ
  | 'tractor_10w'     // หัวลาก 10 ล้อ
  | 'trailer_2axle'   // หาง 2 เพลา
  | 'trailer_3axle'   // หาง 3 เพลา
  | 'box_truck_6w'    // 6 ล้อตู้ทึบ
  | 'jumbo_4w'        // 4 ล้อจัมโบ้
  | 'pickup_box'      // รถกระบะตู้
  | 'sedan'           // รถเก๋ง
  | 'forklift'        // รถโฟล์คลิฟท์
  | 'pickup'          // รถกระบะ (fallback)
  | 'truck'           // รถบรรทุก (fallback)
  | 'van'             // รถตู้ (fallback)
  | 'suv'             // รถ SUV (fallback)
  | 'motorcycle'      // มอเตอร์ไซค์ (fallback)
  | 'other';

export interface SubCategoryMeta {
  id: string;
  nameTh: string;
  nameEn: string;
  description?: string;
}

export type PostRepairCondition = 
  | 'repairable'   // สามารถซ่อมได้ / นำกลับมารีบิลด์ใช้งานต่อได้ (Repairable / Rebuilt)
  | 'scrap'        // เสีย / ชำรุดใช้งานไม่ได้ / จำหน่ายเป็นซาก (Scrap / Beyond Repair)
  | 'repaired'     // ซ่อมแซมเสร็จสมบูรณ์ / ใช้งานได้ปกติ (Repaired & Normal)
  | 'normal';      // ตรวจเช็คแล้วปกติ ไม่ต้องเปลี่ยน

export interface RepairItemPart {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  inventoryItemId?: string;
  itemCode?: string;
  unit?: string;
  isDeductedFromStock?: boolean;
  requisitionId?: string;
  requisitionNumber?: string;
  disbursedAt?: string;
  disbursedBy?: string;
  // Post-repair part assessment
  postRepairCondition?: PostRepairCondition; // สามารถซ่อมได้ หรือ เสีย
  postRepairNote?: string; // หมายเหตุสภาพชิ้นส่วนที่ถอดออก
  salvagedToStock?: boolean; // นำชิ้นส่วนที่ซ่อมได้กลับเข้าคลัง
}

export interface StatusHistoryLog {
  id: string;
  timestamp: string;
  status: RepairStatus;
  note: string;
  updatedBy: string;
}

export interface RepairIssueItem {
  id: string;
  title: string;
  category: RepairCategory;
  subCategoryId?: string;
  subCategoryName?: string;
  description: string;
  urgency?: Priority;
  isResolved?: boolean;
  images?: string[];
}

export interface RepairFeedback {
  id: string;
  rating?: number; // 1-5 overall
  overallRating?: number; // 1-5 overall score
  technicianRating: number; // 1-5 rating for the assigned technician
  serviceQualityRating?: number; // 1-5 rating for repair quality
  timelinessRating?: number; // 1-5 rating for speed/on-time delivery
  comment: string;
  reviewerName?: string;
  evaluatorName?: string;
  createdAt: string;
  tags?: string[];
}

export interface AiDiagnosisResult {
  summary: string;
  possibleCauses: string[];
  recommendedChecks: string[];
  suggestedParts: {
    name: string;
    estimatedCost: number;
    necessity: string;
  }[];
  estimatedLaborCost: number;
  estimatedTotalCost: number;
  estimatedRepairTimeHours: number;
  urgencyLevel: string;
  safetyWarning: string;
}

export interface BreakdownLocation {
  isEmergencyBreakdown: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  locationName?: string;
  landmark?: string;
  landmarks?: string;
  highwayNumber?: string;
  kilometerMarker?: string;
  roadName?: string;
  pinLabel?: string;
  accuracy?: number;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  vehicleId?: string; // Optional vehicle ID reference
  title?: string; // Optional ticket title
  problemDescription?: string; // Optional problem description alias
  rating?: number; // Optional quick rating
  reportedAt?: string; // Optional reported date alias
  createdAt: string; // ISO date string
  updatedAt: string;
  licensePlate: string;
  province: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  currentMileage: number;
  department: string;
  requesterName: string;
  requesterPhone?: string;
  breakdownLocation?: BreakdownLocation; // GPS / Map location if emergency breakdown
  category: RepairCategory;
  subCategoryId?: string;
  subCategoryName?: string;
  priority: Priority;
  symptoms: string;
  issues?: RepairIssueItem[]; // Support for multiple issues in a single ticket
  attachedImages?: string[];
  completionImages?: string[];
  status: RepairStatus;
  assignedMechanic?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  completedAt?: string;
  partsList: RepairItemPart[];
  partsCost: number;
  laborCost: number;
  totalCost: number;
  feedback?: RepairFeedback; // Feedback and rating for completed jobs
  aiDiagnosis?: AiDiagnosisResult;
  mechanicNotes?: string;
  // Post-repair overall assessment
  postRepairEquipmentStatus?: 'repairable' | 'scrap' | 'repaired_good' | 'mixed' | 'not_applicable';
  postRepairEquipmentNote?: string;
  history: StatusHistoryLog[];
}

export interface CategoryMeta {
  id: RepairCategory;
  name?: string; // Optional name alias
  nameTh: string;
  nameEn: string;
  iconName: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
  commonSymptoms: string[];
  subCategories: SubCategoryMeta[];
}

export interface StatusMeta {
  id: RepairStatus;
  labelTh: string;
  color: string;
  textColor: string;
  bgColor: string;
  badgeBg: string;
  stepNumber: number;
  description: string;
}

export interface ExecutiveReportData {
  executiveOverview: string;
  keyHighlights: string[];
  costAnalysis: string;
  riskAndAlerts: string[];
  strategicRecommendations: string[];
  fleetHealthScore: number;
  generatedAt?: string;
}

export type VehicleStatus = 'active' | 'under_repair' | 'maintenance_due' | 'maintenance' | 'inactive';
export type FuelType = 'diesel' | 'gasoline' | 'cng_ngv' | 'ev' | 'hybrid' | string;

export interface VehicleRecord {
  id: string;
  licensePlate: string;
  oldLicensePlate?: string; // ทะเบียนเก่า
  carrierCompany?: string; // ประกอบการขนส่ง e.g. TNB, BBNP, ครูเสือ
  erpNo?: string; // No. ERP e.g. T10-NO.01, TL001
  province: string;
  vehicleBrand: string;
  vehicleModel: string;
  brand?: string; // Alias for vehicleBrand
  model?: string; // Alias for vehicleModel
  vehicleType: VehicleType;
  department: string;
  driverName: string;
  driverId?: string;
  driverPhone?: string;
  currentMileage: number;
  status: VehicleStatus;
  color?: string; // สีตัวรถ
  fuelType?: FuelType;
  year?: number;
  registrationDate?: string; // วันที่จดทะเบียน
  chassisNumber?: string; // เลขตัวถัง(คัสซี)
  engineNumber?: string; // เลขเครื่องยนต์
  taxExpiryDate?: string; // วันที่หมดอายุภาษี
  taxRate?: string; // อัตราภาษี
  actInsuranceFee?: string; // ค่าพรบ
  actInsuranceExpiry?: string; // พรบ.หมด
  actInsuranceCompany?: string; // บริษัท พรบ.
  vehicleInsuranceCompany?: string; // ชื่อประกันภัยรถ
  vehicleInsuranceType?: string; // ประเภทประกันภัยรถ e.g. ชั้น 1, ชั้น 3
  vehicleInsuranceCoverage?: string; // วงเงินประกันภัยรถ
  vehicleInsuranceStartDate?: string; // วันเริ่มคุ้มครองประกันรถ
  vehicleInsuranceEndDate?: string; // สิ้นสุดระยะเวลาประกันรถ
  vehicleInsurancePremium?: string; // ค่าเบี้ยประกันรถ
  cargoInsuranceCompany?: string; // ชื่อประกันภัยสินค้า
  cargoInsuranceCoverage?: string; // วงเงินประกันภัยสินค้า
  cargoInsuranceStartDate?: string; // วันเริ่มคุ้มครองสินค้า
  cargoInsuranceEndDate?: string; // สิ้นสุดประกันสินค้า
  cargoInsurancePremium?: string; // ค่าเบี้ยประกันสินค้า
  gpsProvider?: string; // GPS Provider e.g. CARTRACK, WAYLAR, DTC
  insuranceExpiryDate?: string;
  lastServiceDate?: string;
  notes?: string;
  // Mileage Tracking & LINE Integration
  mileageUpdateCount?: number; // จำนวนครั้งที่มีการอัปเดตเลขไมล์
  lastMileageUpdateDate?: string; // วันที่อัปเดตเลขไมล์ล่าสุด
  lastMileageSource?: string; // ช่องทางที่อัปเดตไมล์ล่าสุด
  initialMileage?: number; // เลขไมล์เริ่มต้นตอนลงทะเบียน
  createdAt?: string;
  updatedAt?: string;
}

export type MileageLogSource = 
  | 'line_webhook'        // ดึงจาก LINE Messaging API Webhook อัตโนมัติ
  | 'line_chat_import'   // นำเข้าจากข้อความแชทกลุ่ม LINE
  | 'line_ocr'           // สแกนภาพถ่ายเรือนไมล์จาก LINE ด้วย AI OCR
  | 'daily_inspection'   // จากการตรวจเช็คสภาพรถประจำวัน
  | 'repair_ticket'      // จากการเปิดใบแจ้งซ่อม
  | 'manual_update'      // เจ้าหน้าที่ปรับปรุงด้วยตนเอง
  | 'manual';

export interface MileageLogEntry {
  id: string;
  vehicleId: string;
  licensePlate: string;
  erpNo?: string;
  previousMileage: number;
  newMileage: number;
  distanceDelta: number; // ระยะทางที่เพิ่มขึ้น (+กม.)
  recordedAt: string; // ISO string
  source: MileageLogSource;
  reporterName: string; // ชื่อคนขับ หรือผู้แจ้ง เช่น "นายสมเกียรติ (คนขับ)", "LINE Webhook Bot"
  reporterLineId?: string;
  rawMessage?: string; // ข้อความเดิมจาก LINE เช่น "1ฒข-4589 ไมล์ 84500"
  imageUrl?: string;
  notes?: string;
  isFlagged?: boolean; // เตือนกรณีไมล์ลดลง หรือเพิ่มผิดปกติ
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: RepairCategory;
  unit: string; // e.g. "ชิ้น", "ลิตร", "ชุด", "ลูก", "เส้น", "กล่อง", "ถัง"
  currentStock: number;
  minStockLevel: number;
  unitCost: number; // ราคาทุน
  unitSellingPrice?: number; // ราคาเบิก/คิดมูลค่างาน
  locationRack?: string; // ตำแหน่งชั้นวาง e.g. "A-01", "B-03"
  location?: string; // Optional alias for locationRack
  supplier?: string;
  brand?: string; // ยี่ห้อ/แบรนด์อะไหล่
  specification?: string; // สเปก/รุ่นย่อย
  compatibleVehicleTypes?: VehicleType[]; // รองรับประเภทรถ
  isRepairableCategory?: boolean; // ชิ้นส่วนประเภทนี้สามารถซ่อม/Rebuild ได้หรือไม่
  condition?: 'new' | 'rebuilt' | 'spare'; // สภาพสินค้า (ของใหม่ / รีบิลด์ซ่อมแล้ว / สำรอง)
  notes?: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  id: string;
  inventoryItemId: string;
  itemCode: string;
  itemName: string;
  category: RepairCategory;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface GoodsReceiptRecord {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-0001"
  receivedDate: string; // YYYY-MM-DD
  supplierName: string;
  poNumber?: string;
  invoiceNumber?: string;
  receivedBy: string;
  department?: string;
  items: GoodsReceiptItem[];
  totalAmount: number;
  totalQuantity: number;
  status?: string;
  notes?: string;
  createdAt: string;
}

export interface GoodsRequisitionItem {
  id: string;
  inventoryItemId: string;
  itemCode: string;
  itemName: string;
  category: RepairCategory;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface GoodsRequisitionRecord {
  id: string;
  requisitionNumber: string; // e.g. "REQ-2026-0001"
  requisitionDate: string; // YYYY-MM-DD
  requisitionType: 'repair_ticket' | 'vehicle_maintenance' | 'general_use';
  ticketId?: string; // Connected Repair Ticket ID
  ticketNumber?: string; // Connected Repair Ticket Number
  vehicleId?: string; // Connected Vehicle ID
  licensePlate?: string; // Connected Vehicle License Plate
  department: string;
  requestedBy: string; // Requester / Mechanic name
  approvedBy?: string;
  purpose: string;
  items: GoodsRequisitionItem[];
  totalAmount: number;
  totalQuantity: number;
  status: 'completed' | 'approved' | 'pending';
  notes?: string;
  createdAt: string;
}

export type PMPlanType = 
  | 'pm1_minor'        // PM 1 (A-Service: 10,000 - 20,000 km) - เปลี่ยนถ่ายน้ำมันเครื่อง ไส้กรอง ตรวจเช็คระบบไฟ เบรก ลมยาง
  | 'pm2_intermediate' // PM 2 (B-Service: 40,000 - 50,000 km) - น้ำมันเกียร์/เฟืองท้าย ช่วงล่าง สายพาน อัดจารบีลูกปืน
  | 'pm3_major'        // PM 3 (C-Service: 80,000 - 100,000 km) - ล้างหม้อน้ำ ระบบเบรกใหญ่ วาล์ว/หัวฉีด ระบบส่งกำลังสมบูรณ์
  | 'pm_annual'        // ตรวจสภาพประจำปี (Annual Inspection / พรบ. / กรมการขนส่งทางบก)
  | 'pm_custom';       // แผนเฉพาะกิจ / ตรวจเช็คพิเศษ

export type PMPlanStatus = 
  | 'planned'     // ตามแผนงาน (Scheduled)
  | 'scheduled'   // รอเข้าตรวจตามนัดหมาย
  | 'in_progress' // กำลังดำเนินการซ่อมบำรุง
  | 'completed'   // ดำเนินการเสร็จสมบูรณ์แล้ว
  | 'overdue'     // เกินกำหนดเวลาแผนงาน
  | 'cancelled';  // ยกเลิก / เลื่อนแผน

export interface PMChecklistItem {
  id: string;
  item: string;
  category: string;
  isChecked: boolean;
  notes?: string;
}

export interface PMMonthlyScheduleItem {
  id: string;
  pmPlanCode?: string; // e.g. "PM-2026-03-001"
  isoDocNumber?: string; // e.g. "TNB-MT-PLN-001-Rev.02"
  vehicleId: string;
  licensePlate: string;
  erpNo?: string;
  province?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType: VehicleType;
  carrierCompany?: string;
  department?: string;
  driverName?: string;
  year?: number; // e.g. 2026
  month?: number; // 1 to 12
  planMonth?: string | number; // Alias for month
  planYear?: number;
  plannedDate: string; // YYYY-MM-DD
  actualDate?: string; // YYYY-MM-DD
  pmType?: PMPlanType;
  pmTypeName?: string;
  serviceLevel?: string;
  plannedMileage?: number;
  actualMileage?: number;
  targetMileage?: number;
  lastServiceMileage?: number;
  status: PMPlanStatus;
  estimatedCost?: number;
  costEstimate?: number;
  actualCost?: number;
  assignedTechnician?: string;
  mechanicName?: string;
  serviceCenterName?: string;
  ticketId?: string; // Connected Repair Ticket ID if created
  ticketNumber?: string; // e.g. "REP-2026-0801"
  checklists?: PMChecklistItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PMAnnualMasterPlan {
  year: number;
  isoDocNumber: string;
  title: string;
  totalVehicles: number;
  totalPlannedJobs: number;
  completedJobs: number;
  complianceRate: number;
  schedules: PMMonthlyScheduleItem[];
  generatedAt: string;
}

// ==========================================
// DAILY VEHICLE INSPECTION (ตรวจสภาพรถประจำวัน)
// ==========================================

export type InspectionCheckStatus = 'pass' | 'fail' | 'skip' | 'untested'; // '/' = pass, 'x' = fail, 'O' = skip

export type InspectionCategory = 
  | 'engine'       // เครื่องยนต์ & ของเหลว (Engine & Fluids)
  | 'brake'        // ระบบเบรก & ลมเบรก (Brake & Air Tank)
  | 'visibility'   // ทัศนวิสัย & กระจก (Visibility & Glass)
  | 'tires'        // ยาง & ล้อ & น็อต (Tires & Wheels)
  | 'electrical'   // ระบบไฟส่องสว่าง & สัญญาณ & แตร (Lights & Electrical)
  | 'safety'       // อุปกรณ์ความปลอดภัย & ฉุกเฉิน (Safety Equipment)
  | 'bodywork';    // ตัวถัง พื้นกระบะ & โครงสร้าง (Body & Structure)

export interface DailyInspectionItemTemplate {
  no: number;
  name: string;
  standard: string;
  method: string;
  frequency: string;
  category: InspectionCategory;
  diagramZone?: 'front' | 'rear' | 'engine' | 'wheel' | 'cabin' | 'cargo' | 'underbody';
  descriptionGuide: string;
}

export interface DailyInspectionCheckResult {
  itemId: number;
  no: number;
  name: string;
  standard: string;
  method: string;
  frequency: string;
  category: InspectionCategory;
  status: InspectionCheckStatus; // 'pass' (/), 'fail' (x), 'skip' (O)
  remark?: string;
  hasIssue?: boolean;
  issueDescription?: string;
  issueUrgency?: Priority;
  images?: string[];
}

export interface TirePositionMeasurement {
  positionKey: string; // e.g. "FL", "FR", "RL1_OUT", "RL1_IN", "RR1_IN", "RR1_OUT"
  positionNameTh: string; // e.g. "หน้าซ้าย (FL)", "หน้าขวา (FR)"
  treadDepthMm: number; // e.g. 12.0, 3.2, 1.5
  pressurePsi?: number; // e.g. 115
  wearCondition: 'normal' | 'uneven_wear' | 'bulge' | 'cracks' | 'cut' | 'nail_puncture';
  isAlert: boolean;
  alertLevel: 'safe' | 'warning' | 'critical'; // < 2.0mm = critical, 2.0-3.5mm = warning, > 3.5mm = safe
  notes?: string;
}

export interface TireInspectionReport {
  measuredAt?: string;
  minTreadDepthMm: number;
  avgTreadDepthMm: number;
  overallTireStatus: 'safe' | 'warning' | 'critical';
  warningCount: number;
  criticalCount: number;
  alertMessage?: string;
  measurements: TirePositionMeasurement[];
  recommendationAction?: 'none' | 'rotate_tires' | 'replace_urgent' | 'adjust_alignment_pressure';
}

export interface DailyVehicleInspectionRecord {
  id: string;
  docNumber: string; // e.g. "DCI-2026-0830-001"
  isoDocNumber?: string; // e.g. "TNB-SHE-FRM-007-Rev.03"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (e.g. "07:30")
  vehicleId: string;
  licensePlate: string;
  erpNo?: string;
  province: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  department: string;
  driverName: string;
  driverPhone?: string;
  inspectorName: string;
  inspectorPhone?: string;
  currentMileage: number;
  startMileage?: number;
  overallStatus: 'pass' | 'fail' | 'skip' | 'warning'; // pass: all ok, fail: has defect, skip: holiday/parked, warning: minor issue
  defectCount: number;
  results: DailyInspectionCheckResult[];
  tireReport?: TireInspectionReport; // Specialized Tire Tread Depth & Wear Inspection
  notes?: string;
  ticketCreated?: boolean;
  ticketId?: string;
  ticketNumber?: string;
  locationName?: string;
  signatureDriver?: string;
  signatureInspector?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MAINTENANCE INTERVAL MATRIX & MILEAGE ALERTS (แผนบำรุงรักษาตามระยะทางและแจ้งเตือน)
// ==========================================

export type ServiceExecutionType = 'in_house' | 'dealer_center'; // ทำเองในอู่ TNB หรือ ส่งเข้าศูนย์บริการ

export interface MaintenanceIntervalCheckItem {
  id: string;
  category: RepairCategory;
  categoryNameTh: string;
  itemTitle: string;
  itemDescription: string;
  executionType: ServiceExecutionType; // 'in_house' | 'dealer_center'
  executionTypeLabelTh: string; // "ทำเองในอู่ TNB" | "ส่งเข้าศูนย์บริการ"
  standardPartsUsed?: string[]; // รายการอะไหล่/ของเหลวที่ใช้
  estimatedLaborMinutes: number;
  estimatedCost: number;
  isCrucialSafetyItem: boolean;
}

export interface MaintenanceIntervalPlan {
  intervalKm: number; // e.g. 10000, 20000, 40000, 80000, 100000, 150000, 200000
  intervalNameTh: string;
  intervalNameEn: string;
  badgeColor: string;
  targetMonths: number;
  description: string;
  totalItemsCount: number;
  inHouseItemsCount: number;
  dealerItemsCount: number;
  estimatedTotalCost: number;
  items: MaintenanceIntervalCheckItem[];
}

export interface MileageAlertEvaluation {
  vehicleId: string;
  licensePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  currentMileage: number;
  thresholdKm: number;
  closestIntervalKm: number;
  diffKm: number;
  alertStatus: 'overdue' | 'due_soon' | 'normal';
  alertTitle: string;
  alertDescription: string;
  matchedPlan: MaintenanceIntervalPlan;
  inHouseItemsCount: number;
  dealerItemsCount: number;
}

export interface MonthlyInspectionMatrixVehicle {
  vehicle: VehicleRecord;
  month: number; // 1-12
  year: number; // e.g. 2026
  days: {
    [day: number]: {
      status: InspectionCheckStatus;
      recordId?: string;
      mileage?: number;
      defectCount?: number;
      itemStatuses?: { [itemNo: number]: InspectionCheckStatus };
      inspectorName?: string;
    };
  };
  totalInspectedDays: number;
  totalDefectDays: number;
  totalSkipDays: number;
}

export interface TireReplacementRecord {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  positionKey: string; // e.g. "FL", "FR", "A2_L_OUT", "A2_L_IN", "A2_R_IN", "A2_R_OUT", "A3_L_OUT", "A3_L_IN", "A3_R_IN", "A3_R_OUT", "SPARE"
  positionNumber?: number | string; // ตำแหน่ง 1-12 ตามแบบฟอร์ม
  positionNameTh: string;
  replacedDate: string; // YYYY-MM-DD
  replacedDateTh?: string; // e.g. "5/23/2569"
  replacedMileage: number;
  tireBrand: string; // e.g. "Bridgestone", "Michelin", "Deestone", "Otani", "MARVEMAX", "DAYTON"
  tireModel?: string; // e.g. "R156", "X Multi D", "SV402", "OH-301"
  tireSize?: string; // e.g. "11R22.5", "295/80R22.5", "215/75R17.5", "195R14C"
  treadPattern?: string; // e.g. "ลายสร้อย", "Lug pattern"
  tireSerial?: string; // e.g. "B310176031", "SN-88492041"
  dotCode?: string; // e.g. "DOT 3424" (Week 34 Year 2024)
  tireType: 'new' | 'retread' | 'cold_retread' | 'hot_retread' | 'rotate' | 'used' | string; // ยางใหม่ / ยางหล่อดอก / หล่อเย็น / หล่อร้อน / สลับยาง / ยางมือสอง / อื่นๆ
  rimType?: string; // "ใหม่" / "เดิม"
  initialTreadDepthMm: number; // e.g. 16.0 mm / 14.0 mm
  currentTreadDepthMm: number; // e.g. 16.0 mm / 2.0 mm
  costPerTire: number; // e.g. 8500
  supplierOrShop?: string; // e.g. "ศูนย์บริการ บริดจสโตน บอย ยางยนต์"
  technicianName?: string;
  driverName?: string; // พขร e.g. "นาย อนุชิต", "นายพุทธิพงษ์"
  reason?: 'worn_out' | 'burst_or_cut' | 'puncture_damage' | 'scheduled_rotation' | 'annual_renewal' | 'uneven_wear' | 'other';
  reasonLabelTh?: string;
  oldTiresReturnedCount?: number; // นำยางเก่ากลับ (เส้น)
  swapSource?: string; // "ถอดจากหัว 700-4755"
  swapTarget?: string; // "นำไปใส่หาง 73-9742 ตำแหน่งที่ 5 และ 6"
  trailerLicensePlate?: string; // ทะเบียนหางคู่ (ถ้ามี)
  status: 'active' | 'scrapped' | 'spare_stock';
  notes?: string;
  createdAt: string;
}

export interface BatteryReplacementRecord {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  driverName?: string;
  replacedDate: string; // YYYY-MM-DD (e.g. 2026-01-05)
  displayDateTh: string; // e.g. "1/5/2569"
  previousReplacedDate?: string; // e.g. "มากับรถ" หรือ "8/23/2569"
  previousBrand?: string; // e.g. "SG"
  previousModelOrSize?: string; // e.g. "F135L", "N120"
  previousQuantity?: number; // e.g. 2
  batteryBrand: string; // e.g. "FB"
  batteryModelOrSize: string; // e.g. "F135L", "N120=115F511"
  batteryModel?: string; // Optional alias for batteryModelOrSize
  quantity: number; // e.g. 2
  cost: number; // e.g. 5400, 8000
  supplierOrShop: string; // e.g. "ส.รวมยนต์"
  replacedMileage?: number; // e.g. 633063
  replacedDateTh?: string; // Optional date in Thai string format
  voltageSpec?: string; // Optional voltage specification e.g. "12V 100Ah"
  voltageVolts?: number; // Optional measured voltage e.g. 12.6
  healthStatusSoh?: string; // Optional SOH status e.g. "98%"
  reason?: string; // e.g. "เกิดจากเสื่อมสภาพเก็บไฟไม่อยู่", "แบตเตอรี่ระเบิด..."
  status: 'active' | 'replaced' | 'scrapped';
  notes?: string;
  createdAt: string;
}

export interface TireAlertSetting {
  enableAutoAlert: boolean;
  criticalThresholdMm: number; // default 2.0 mm (วิกฤต - ห้ามปล่อยรถวิ่งเด็ดขาด)
  warningThresholdMm: number;  // default 3.5 mm (เฝ้าระวัง - เตรียมสลับ/เปลี่ยน)
  alertSoundEnabled: boolean;  // เสียงแจ้งเตือนเตือนภัย
  autoOpenBanner: boolean;     // แสดงแถบเตือนฉุกเฉินเด่นชัด
  lineNotifyEnabled: boolean;  // จำลองระบบส่งแจ้งเตือนกลุ่มช่าง/ไลน์
  lastModified?: string;
}

export interface TireMaintenanceAlert {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleType: VehicleType;
  department: string;
  driverName?: string;
  currentMileage: number;
  positionKey: string;
  positionNameTh: string;
  treadDepthMm: number;
  pressurePsi?: number;
  thresholdMm: number;
  differenceMm: number; // e.g. -0.6
  alertLevel: 'critical' | 'warning';
  wearCondition: TirePositionMeasurement['wearCondition'];
  riskDescription: string;
  recommendedAction: string;
  tireBrand?: string;
  tireSerial?: string;
  detectedAt: string;
}

export interface VehicleTireProfile {
  vehicleId: string;
  licensePlate: string;
  measurements: TirePositionMeasurement[];
  replacements: TireReplacementRecord[];
  battery?: BatteryReplacementRecord;
  lastInspectionDate?: string;
  overallTireStatus: 'safe' | 'warning' | 'critical';
  minTreadDepthMm: number;
  avgTreadDepthMm: number;
}

export type WeeklyPlanStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed';

export interface WeeklyTirePlanVehicle {
  vehicleId: string;
  licensePlate: string;
  vehicleType: VehicleType;
  department: string;
  driverName?: string;
  driverPhone?: string;
  currentMileage: number;
  brand?: string;
  model?: string;
  weekNumber: 1 | 2 | 3 | 4; // 1 = W1, 2 = W2, 3 = W3, 4 = W4
  weekLabel: string; // e.g. "สัปดาห์ที่ 1 (1 - 7 ก.ย.)"
  targetDate?: string; // YYYY-MM-DD
  tiresToReplace: Array<{
    alertId: string;
    positionKey: string;
    positionNameTh: string;
    treadDepthMm: number;
    thresholdMm: number;
    differenceMm: number;
    alertLevel: 'critical' | 'warning';
    wearCondition: string;
    tireBrand?: string;
    pressurePsi?: number;
  }>;
  totalTires: number;
  hasCritical: boolean;
  minTreadDepthMm: number;
  estimatedCost: number;
  status: WeeklyPlanStatus;
  assignedShopOrTechnician?: string;
  notes?: string;
}

export interface WeeklyPlanOverride {
  weekNumber?: 1 | 2 | 3 | 4;
  targetDate?: string;
  status?: WeeklyPlanStatus;
  assignedShopOrTechnician?: string;
  notes?: string;
}

export interface EngineOilRecord {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  driverName?: string;
  carrierCompany?: string;
  serviceDate: string; // YYYY-MM-DD
  serviceMileage: number; // เลขไมล์ขณะเปลี่ยนถ่าย (กม.)
  recommendedIntervalKm: number; // ระยะรอบการเปลี่ยนมาตรฐาน เช่น 20,000 กม.
  nextDueMileage: number; // เลขไมล์กำหนดเปลี่ยนถัดไป = serviceMileage + recommendedIntervalKm
  nextDueDate?: string; // วันที่คาดการณ์รอบถัดไป
  oilBrand: string; // e.g. "PTT Dynamic", "Shell Rimula", "Caltex Delo", "Mobil Delvac"
  oilViscosityGrade: string; // e.g. "15W-40", "10W-30", "20W-50"
  oilType: 'fully_synthetic' | 'semi_synthetic' | 'mineral' | 'heavy_duty' | string;
  oilQuantityLiters: number; // ปริมาณที่เติม (ลิตร)
  oilUnitCost?: number; // ราคาต่อลิตร/ถัง
  oilTotalCost: number; // ค่าน้ำมันรวม (บาท)
  filterReplaced: boolean; // เปลี่ยนไส้กรองน้ำมันเครื่องด้วยหรือไม่
  filterBrand?: string; // e.g. "ISUZU Genuine", "HINO Genuine", "Denso", "Sakura"
  filterCost?: number; // ราคาไส้กรอง (บาท)
  drainWasherReplaced?: boolean; // เปลี่ยนแหวนรองน็อตถ่าย
  fuelFilterReplaced?: boolean; // เปลี่ยนกรองโซล่า/ดักน้ำ
  airFilterChecked?: 'cleaned' | 'replaced' | 'normal' | 'none'; // ตรวจเช็คกรองอากาศ
  serviceLocationType: 'tnb_workshop' | 'authorized_center' | 'external_garage';
  serviceLocationName: string; // e.g. "ศูนย์บริการซ่อมบำรุง TNB Workshop", "ตรีเพชรอีซูซุ"
  technicianName: string; // ช่างผู้ดำเนินการ
  inspectorName?: string; // ผู้ตรวจรับงาน / หัวหน้าช่าง
  laborCost: number; // ค่าแรงบริการ (0 บาทถ้าเป็นอู่ใน)
  totalCost: number; // ค่าใช้จ่ายรวมทั้งหมด
  ticketId?: string; // เชื่อมโยงใบแจ้งซ่อม
  ticketNumber?: string; // e.g. "REP-2026-0801"
  requisitionId?: string; // เชื่อมโยงใบเบิกพัสดุ
  invoiceNumber?: string; // เลขที่ใบเสร็จ/บิล
  oilConditionRating?: 'clean' | 'normal' | 'dark' | 'sludge' | 'burnt'; // สภาพน้ำมันเก่าที่ถ่ายออก
  status: 'completed' | 'scheduled' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleOilStatus {
  vehicle: VehicleRecord;
  hasEngine: boolean; // true สำหรับหัวลาก, รถบรรทุก, กระบะ; false สำหรับหางลาก Trailer
  lastRecord?: EngineOilRecord;
  currentMileage: number;
  lastServiceMileage: number;
  lastServiceDate?: string;
  nextDueMileage: number;
  remainingKm: number; // nextDueMileage - currentMileage
  isOverdue: boolean; // remainingKm < 0
  isDueSoon: boolean; // remainingKm >= 0 && remainingKm <= 1500
  usagePercent: number; // % ของรอบการใช้งาน
  status: 'normal' | 'due_soon' | 'overdue' | 'no_record' | 'not_applicable';
  recommendedIntervalKm: number;
  oilBrand?: string;
  oilViscosityGrade?: string;
}

export interface EngineOilSummaryStats {
  totalMotorVehicles: number;
  recordedVehiclesCount: number;
  overdueCount: number;
  dueSoonCount: number;
  normalCount: number;
  noRecordCount: number;
  totalServiceCost: number;
  totalOilVolumeLiters: number;
  diyWorkshopCount: number;
  authorizedCenterCount: number;
  filterReplacementRatePercent: number;
}

export type AppNavView = 
  | 'requester' 
  | 'worker' 
  | 'vehicles' 
  | 'daily_inspection' 
  | 'safety_equipment'
  | 'pm_plan' 
  | 'maintenance_intervals'
  | 'tire_management'
  | 'oil_change_summary'
  | 'repair_history'
  | 'part_list' 
  | 'receiving' 
  | 'requisition' 
  | 'directory'
  | 'workflow';

// ==========================================
// Vehicle Safety Equipment & Handover Form Types (ISO-SHE-FRM-012)
// ==========================================

export interface VehicleSafetyItemTemplate {
  id: string;
  itemCode: string; // e.g. "SEC-01"
  nameTh: string;
  nameEn: string;
  standardQty: number;
  unit: string; // e.g. "อัน", "ถัง", "เส้น", "กระบอก", "ชุด", "ผืน", "ตัว", "ใบ", "คู่"
  purpose: string;
  vehicleTypes: {
    sixTenWheel: boolean; // หก/สิบล้อ
    tractor: boolean;     // หัวลาก
    pickup: boolean;      // กะบะ
  };
  estimatedValueBaht: number; // มูลค่าชดใช้กรณีสูญหาย
  specNote?: string;
  imageUrl?: string; // Custom uploaded image (Data URL / Image link)
  isCustomItem?: boolean; // Flag indicating if item was user-added
  category?: string; // Optional equipment category (e.g. PPE, Emergency, Chemical, Cargo Securing)
}

export type SafetyItemCheckStatus = 'received' | 'not_applicable' | 'pending' | 'missing' | 'damaged';

export interface HandoverItemDetail {
  templateId: string;
  itemCode: string;
  nameTh: string;
  quantity: number;
  unit: string;
  status: SafetyItemCheckStatus;
  serialOrAssetTag?: string;
  serialNumber?: string;
  conditionNote?: string;
  notes?: string;
  estimatedValueBaht: number;
}

export interface SignedDocumentUpload {
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface VehicleSafetyHandoverRecord {
  id: string;
  documentNumber?: string; // e.g. "SFT-2026-001"
  docNumber?: string; // Alias
  formRevision?: string;
  companyName?: string;
  vehicleId: string;
  licensePlate: string;
  erpNo?: string;
  vehicleType: VehicleType;
  vehicleBrand?: string;
  vehicleModel?: string;
  department: string;
  driverName: string;
  driverEmployeeId?: string;
  driverPhone?: string;
  handoverDate: string; // YYYY-MM-DD
  currentMileage?: number;
  issuedBy?: string;
  issuedByRole?: string;
  issuerName?: string;
  issuerRole?: string;
  totalItemsChecked?: number;
  allPassed?: boolean;
  totalEstimatedValue?: number;
  handoverReason?: 'new_vehicle' | 'new_driver' | 'annual_renewal' | 'replace_lost' | 'audit' | string;
  status: 'active' | 'returned' | 'incomplete_audit' | 'replacement_required';
  items: HandoverItemDetail[];
  liabilityAgreementAccepted?: boolean;
  liabilityClauseText?: string;
  driverSignatureDataUrl?: string;
  driverSignature?: string;
  officerSignatureDataUrl?: string;
  managerSignatureDataUrl?: string;
  signedDocumentUpload?: SignedDocumentUpload;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// Service Directory: Mechanics, Vendors & Repair Centers
// ==========================================

export type TechnicianStatus = 'active' | 'busy' | 'leave' | 'inactive';

export interface TechnicianItem {
  id: string;
  name: string; // ชื่อ-นามสกุล เช่น "วิชาญ ใจกล้า"
  nickname?: string; // ชื่อเล่น เช่น "ช่างชาญ"
  roleTitle: string; // ตำแหน่ง เช่น "หัวหน้าช่างประจำศูนย์ / Foreman"
  specialties: RepairCategory[]; // สาขาความเชี่ยวชาญ e.g. ['suspension', 'engine']
  specialtyDetails?: string; // คำอธิบายความชำนาญ เช่น "ผู้เชี่ยวชาญระบบเบรกลมและคานรับน้ำหนัก 10 ล้อ"
  phone: string;
  lineId?: string;
  status: TechnicianStatus;
  employeeId?: string; // รหัสพนักงาน
  experienceYears?: number;
  completedJobsCount?: number;
  rating?: number; // 1-5 ดาว
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type VendorStatus = 'active' | 'inactive';

export interface VendorShopItem {
  id: string;
  name: string; // ชื่อร้านค้า / บริษัท เช่น "บจก. เจริญยนต์อะไหล่บรรทุก พระราม 2"
  shortName?: string; // ชื่อเรียกสั้นๆ เช่น "เจริญยนต์"
  shopType?: string;
  productsSupplied?: string[];
  category?: string; // หมวดหมู่อะไหล่หลัก เช่น "อะไหล่ช่วงล่างและเบรกลม"
  suppliedCategories?: RepairCategory[]; // หมวดหมู่งานซ่อมที่จำหน่าย
  contactPerson?: string; // ผู้ติดต่อ / เซลล์
  phone: string;
  secondaryPhone?: string;
  taxId?: string; // เลขประจำตัวผู้เสียภาษี 13 หลัก
  email?: string;
  address: string; // ที่อยู่ร้านค้า
  creditTermDays?: number; // เครดิตเทอม (วัน) เช่น 30, 45, 60 หรือ 0 (เงินสด)
  discountPercent?: number; // ส่วนลดพิเศษตามข้อตกลง %
  status: VendorStatus;
  rating?: number;
  notes?: string;
  bankAccount?: string; // บัญชีโอนเงิน / เลขบัญชี
  updatedAt: string;
  createdAt: string;
}

export type ServiceCenterType = 
  | 'authorized_dealer'   // ศูนย์บริการมาตรฐานตัวแทนจำหน่าย (ISUZU, HINO ฯลฯ)
  | 'specialized_workshop' // อู่เฉพาะทาง (ระบบเบรกลม, ปั๊มหัวฉีด, ช่วงล่าง, ระบบแอร์)
  | 'general_garage'       // อู่ซ่อมทั่วไป / อู่ภายนอก
  | 'tire_center'          // ศูนย์บริการยางและตั้งศูนย์ถ่วงล้อ
  | 'body_paint_center';   // อู่เคาะพ่นสีและดัดคัสซี

export interface ServiceCenterItem {
  id: string;
  name: string; // ชื่อศูนย์ซ่อม / อู่ เช่น "ศูนย์บริการตรีเพชรอีซูซุ นครปฐม"
  centerType: ServiceCenterType;
  brandSpecialization?: string; // แบรนด์รถที่เชี่ยวชาญ เช่น "ISUZU, HINO"
  servicesOffered: string[]; // บริการเด่น เช่น ["ตั้งศูนย์ถ่วงล้อ 10 ล้อ", "เช็คปั๊มหัวฉีดดีเซล", "ดัดคัสซี"]
  contactPerson?: string;
  phone: string;
  emergencyPhone?: string; // เบอร์ฉุกเฉิน 24 ชม.
  address: string;
  province?: string;
  googleMapsUrl?: string;
  hasMobileService?: boolean; // มีหน่วยช่างเคลื่อนที่นอกสถานที่
  creditTermDays?: number;
  status: 'active' | 'inactive';
  rating?: number;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ServiceDirectoryState {
  technicians: TechnicianItem[];
  vendors: VendorShopItem[];
  serviceCenters: ServiceCenterItem[];
  lastUpdated?: string;
}

// ==========================================
// Multi-User Real-time Collaboration Types
// ==========================================

export interface CollabUser {
  id: string;
  name: string;
  nickname?: string;
  role: string; // e.g. "หัวหน้าช่าง", "ช่างเทคนิค", "ฝ่ายจัดซื้อ", "ผู้จัดการศูนย์", "พนักงานขับรถ"
  department: string;
  color: string; // Hex color for avatar & badge
  avatarIcon?: string;
}

export interface LivePresenceUser extends CollabUser {
  connectedAt: string;
  lastActiveAt: string;
  currentView: AppNavView;
  activeTicketId?: string;
  activeVehicleId?: string;
  isIdle?: boolean;
}

export interface LiveActivityEvent {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userColor: string;
  actionType: 
    | 'TICKET_CREATED' 
    | 'TICKET_UPDATED' 
    | 'STATUS_CHANGED' 
    | 'INVENTORY_RECEIVED' 
    | 'INVENTORY_REQUISITION' 
    | 'PM_SCHEDULED' 
    | 'INSPECTION_SUBMITTED' 
    | 'TECHNICIAN_EDITED'
    | 'VENDOR_EDITED'
    | 'CENTER_EDITED'
    | 'TIRE_UPDATED'
    | 'VEHICLE_UPDATED'
    | 'USER_JOINED';
  title: string;
  description: string;
  targetId?: string;
}


