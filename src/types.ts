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

export type Priority = 'critical' | 'high' | 'medium' | 'low';

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
  attachedImages: string[];
  completionImages?: string[];
  status: RepairStatus;
  assignedMechanic?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
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
export type FuelType = 'diesel' | 'gasoline' | 'cng_ngv' | 'ev' | 'hybrid';

export interface VehicleRecord {
  id: string;
  licensePlate: string;
  oldLicensePlate?: string; // ทะเบียนเก่า
  carrierCompany?: string; // ประกอบการขนส่ง e.g. TNB, BBNP, ครูเสือ
  erpNo?: string; // No. ERP e.g. T10-NO.01, TL001
  province: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  department: string;
  driverName: string;
  driverId?: string;
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
  createdAt: string;
  updatedAt: string;
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
  pmPlanCode: string; // e.g. "PM-2026-03-001"
  isoDocNumber: string; // e.g. "TNB-MT-PLN-001-Rev.02"
  vehicleId: string;
  licensePlate: string;
  erpNo?: string;
  province?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  carrierCompany?: string;
  department?: string;
  driverName?: string;
  year: number; // e.g. 2026
  month: number; // 1 to 12
  plannedDate: string; // YYYY-MM-DD
  actualDate?: string; // YYYY-MM-DD
  pmType: PMPlanType;
  pmTypeName?: string;
  targetMileage: number;
  lastServiceMileage?: number;
  status: PMPlanStatus;
  estimatedCost: number;
  actualCost?: number;
  assignedTechnician?: string;
  ticketId?: string; // Connected Repair Ticket ID if created
  ticketNumber?: string; // e.g. "REP-2026-0801"
  checklists: PMChecklistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  overallStatus: 'pass' | 'fail' | 'skip'; // pass: all ok, fail: has defect, skip: holiday/parked
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
  positionNameTh: string;
  replacedDate: string; // YYYY-MM-DD
  replacedMileage: number;
  tireBrand: string; // e.g. "Bridgestone", "Michelin", "Deestone", "Otani", "Maxxis", "Goodyear"
  tireModel?: string; // e.g. "R156", "X Multi D", "SV402", "OH-301"
  tireSize?: string; // e.g. "11R22.5", "295/80R22.5", "215/75R17.5", "195R14C"
  tireSerial?: string; // e.g. "SN-88492041"
  dotCode?: string; // e.g. "DOT 3424" (Week 34 Year 2024)
  tireType: 'new' | 'retread' | 'cold_retread' | 'hot_retread' | 'rotate' | 'used' | string; // ยางใหม่ / ยางหล่อดอก / หล่อเย็น / หล่อร้อน / สลับยาง / ยางมือสอง / อื่นๆ
  initialTreadDepthMm: number; // e.g. 14.0 mm
  currentTreadDepthMm: number; // e.g. 9.5 mm
  costPerTire: number; // e.g. 8500
  supplierOrShop?: string; // e.g. "บริดจสโตน บอย ยางยนต์", "ศูนย์บริการ TNB อู่กลาง"
  technicianName?: string;
  reason?: 'worn_out' | 'burst_or_cut' | 'puncture_damage' | 'scheduled_rotation' | 'annual_renewal' | 'uneven_wear' | 'other';
  reasonLabelTh?: string;
  status: 'active' | 'scrapped' | 'spare_stock';
  notes?: string;
  createdAt: string;
}

export interface VehicleTireProfile {
  vehicleId: string;
  licensePlate: string;
  measurements: TirePositionMeasurement[];
  replacements: TireReplacementRecord[];
  lastInspectionDate?: string;
  overallTireStatus: 'safe' | 'warning' | 'critical';
  minTreadDepthMm: number;
  avgTreadDepthMm: number;
}

export type AppNavView = 
  | 'requester' 
  | 'worker' 
  | 'vehicles' 
  | 'daily_inspection' 
  | 'pm_plan' 
  | 'maintenance_intervals'
  | 'tire_management'
  | 'repair_history'
  | 'part_list' 
  | 'receiving' 
  | 'requisition' 
  | 'workflow';


