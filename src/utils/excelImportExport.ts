import * as XLSX from "xlsx";
import { 
  VehicleRecord, 
  InventoryItem, 
  RepairTicket, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord, 
  PMMonthlyScheduleItem,
  PMPlanType,
  PMPlanStatus,
  RepairCategory, 
  VehicleType, 
  VehicleStatus,
  Priority,
  RepairStatus
} from "../types";
import { CATEGORIES_CONFIG, VEHICLE_TYPE_LABELS, STATUS_CONFIG } from "../data/categories";
import { PM_TYPE_CONFIG, MONTH_SHORT_TH, MONTH_NAMES_TH } from "../data/pmPlanData";
import { ISO_DOCUMENT_REGISTRY } from "../data/isoDocumentConfig";

// Helper for UTF-8 CSV download
export function downloadCSV(csvContent: string, filename: string) {
  // Add BOM for UTF-8 in Excel so Thai characters don't get garbled
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper for Excel Workbook download
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const actualFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, actualFilename);
}

// ----------------------------------------------------
// 1. VEHICLE IMPORT / EXPORT (27 Standard Columns)
// ----------------------------------------------------

export const VEHICLE_EXCEL_HEADERS = [
  "No. ERP",
  "ประกอบการขนส่ง",
  "ทะเบียนใหม่",
  "ประเภท",
  "ยี่ห้อ",
  "แบบ/รุ่น",
  "เลขตัวถัง (คัสซี)",
  "เลขเครื่องยนต์",
  "สี",
  "วันที่จดทะเบียน",
  "วันที่หมดอายุภาษี",
  "อัตราภาษี (บาท)",
  "ค่า พ.ร.บ. (บาท)",
  "พ.ร.บ. หมดอายุ",
  "บริษัท พ.ร.บ.",
  "ชื่อประกันภัยรถ",
  "ประเภทประกันภัยรถ",
  "วงเงินประกันภัยรถ (บาท)",
  "วันเริ่มคุ้มครอง ประกันภัยรถ",
  "เดือนสิ้นสุดระยะเวลาประกัน",
  "ค่าเบี้ยประกันภัยรถ (บาท)",
  "ผู้ให้บริการ GPS",
  "ชื่อประกันภัยสินค้า",
  "วงเงินประกันภัยสินค้า (บาท)",
  "วันเริ่มคุ้มครอง ประกันสินค้า",
  "สิ้นสุดระยะเวลาประกันสินค้า",
  "ค่าเบี้ยประกันสินค้า (บาท)",
  // Extra system fields
  "จังหวัด",
  "ฝ่าย/สังกัด",
  "พนักงานขับรถ",
  "เลขไมล์ปัจจุบัน (กม.)",
  "สถานะรถ (active/maintenance/inactive)"
];

export function mapVehicleToExportRow(v: VehicleRecord) {
  return {
    "No. ERP": v.erpNo || "",
    "ประกอบการขนส่ง": v.carrierCompany || "TNB",
    "ทะเบียนใหม่": v.licensePlate || "",
    "ประเภท": VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType || "",
    "ยี่ห้อ": v.vehicleBrand || "",
    "แบบ/รุ่น": v.vehicleModel || "",
    "เลขตัวถัง (คัสซี)": v.chassisNumber || "",
    "เลขเครื่องยนต์": v.engineNumber || "",
    "สี": v.color || "ขาว",
    "วันที่จดทะเบียน": v.registrationDate || "",
    "วันที่หมดอายุภาษี": v.taxExpiryDate || "",
    "อัตราภาษี (บาท)": v.taxRate || 0,
    "ค่า พ.ร.บ. (บาท)": v.actInsuranceFee || 0,
    "พ.ร.บ. หมดอายุ": v.actInsuranceExpiry || "",
    "บริษัท พ.ร.บ.": v.actInsuranceCompany || "",
    "ชื่อประกันภัยรถ": v.vehicleInsuranceCompany || "",
    "ประเภทประกันภัยรถ": v.vehicleInsuranceType || "",
    "วงเงินประกันภัยรถ (บาท)": v.vehicleInsuranceCoverage || 0,
    "วันเริ่มคุ้มครอง ประกันภัยรถ": v.vehicleInsuranceStartDate || "",
    "เดือนสิ้นสุดระยะเวลาประกัน": v.vehicleInsuranceEndDate || "",
    "ค่าเบี้ยประกันภัยรถ (บาท)": v.vehicleInsurancePremium || 0,
    "ผู้ให้บริการ GPS": v.gpsProvider || "",
    "ชื่อประกันภัยสินค้า": v.cargoInsuranceCompany || "",
    "วงเงินประกันภัยสินค้า (บาท)": v.cargoInsuranceCoverage || 0,
    "วันเริ่มคุ้มครอง ประกันสินค้า": v.cargoInsuranceStartDate || "",
    "สิ้นสุดระยะเวลาประกันสินค้า": v.cargoInsuranceEndDate || "",
    "ค่าเบี้ยประกันสินค้า (บาท)": v.cargoInsurancePremium || 0,
    "จังหวัด": v.province || "กรุงเทพมหานคร",
    "ฝ่าย/สังกัด": v.department || "ฝ่ายขนส่ง",
    "พนักงานขับรถ": v.driverName || "",
    "เลขไมล์ปัจจุบัน (กม.)": v.currentMileage || 0,
    "สถานะรถ (active/maintenance/inactive)": v.status || "active"
  };
}

export function exportVehiclesToExcel(vehicles: VehicleRecord[], filename = "TNB_Vehicle_Master_27_Items") {
  const rows = vehicles.map(mapVehicleToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet["!cols"] = [
    { wch: 10 }, // ERP
    { wch: 16 }, // Carrier
    { wch: 15 }, // Plate
    { wch: 20 }, // Type
    { wch: 14 }, // Brand
    { wch: 26 }, // Model
    { wch: 22 }, // Chassis
    { wch: 18 }, // Engine
    { wch: 12 }, // Color
    { wch: 14 }, // Reg Date
    { wch: 16 }, // Tax Expiry
    { wch: 14 }, // Tax Rate
    { wch: 14 }, // Act Fee
    { wch: 16 }, // Act Expiry
    { wch: 22 }, // Act Co
    { wch: 22 }, // Ins Co
    { wch: 18 }, // Ins Type
    { wch: 20 }, // Ins Coverage
    { wch: 18 }, // Ins Start
    { wch: 18 }, // Ins End
    { wch: 16 }, // Ins Premium
    { wch: 16 }, // GPS
    { wch: 22 }, // Cargo Ins Co
    { wch: 20 }, // Cargo Coverage
    { wch: 18 }, // Cargo Start
    { wch: 18 }, // Cargo End
    { wch: 16 }, // Cargo Premium
    { wch: 16 }, // Province
    { wch: 18 }, // Dept
    { wch: 20 }, // Driver
    { wch: 16 }, // Mileage
    { wch: 14 }  // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "สารระบบยานพาหนะ");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function exportVehiclesToCSV(vehicles: VehicleRecord[], filename = "TNB_Vehicle_Master_27_Items") {
  const rows = vehicles.map(mapVehicleToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function downloadVehicleTemplate(format: "xlsx" | "csv" = "xlsx") {
  const sampleData: Partial<VehicleRecord>[] = [
    {
      erpNo: "1",
      carrierCompany: "TNB",
      licensePlate: "700-1122",
      vehicleType: "tractor_10w",
      vehicleBrand: "ISUZU",
      vehicleModel: "GXZ77NXXFV 360",
      chassisNumber: "MP1GXZ77N-001234",
      engineNumber: "6UZ1-987654",
      color: "ขาว",
      registrationDate: "2024-05-15",
      taxExpiryDate: "2027-05-15",
      taxRate: "4500",
      actInsuranceFee: "2050",
      actInsuranceExpiry: "2027-05-15",
      actInsuranceCompany: "วิริยะประกันภัย",
      vehicleInsuranceCompany: "วิริยะประกันภัย",
      vehicleInsuranceType: "ชั้น 1 ซ่อมห้าง",
      vehicleInsuranceCoverage: "1500000",
      vehicleInsuranceStartDate: "2026-05-15",
      vehicleInsuranceEndDate: "2027-05-15",
      vehicleInsurancePremium: "28500",
      gpsProvider: "CARTRACK",
      cargoInsuranceCompany: "ทิพยประกันภัย",
      cargoInsuranceCoverage: "3000000",
      cargoInsuranceStartDate: "2026-01-01",
      cargoInsuranceEndDate: "2026-12-31",
      cargoInsurancePremium: "12000",
      province: "กรุงเทพมหานคร",
      department: "ฝ่ายขนส่งตู้สินค้า",
      driverName: "นายสมเกียรติ มั่นคง",
      currentMileage: 85400,
      status: "active"
    },
    {
      erpNo: "2",
      carrierCompany: "TNB",
      licensePlate: "700-3344",
      vehicleType: "box_truck_6w",
      vehicleBrand: "HINO",
      vehicleModel: "FG8JP1A-JGT 240",
      chassisNumber: "JHDFG8JP1A-554433",
      engineNumber: "J08E-776655",
      color: "ขาว-น้ำเงิน",
      registrationDate: "2023-08-20",
      taxExpiryDate: "2027-08-20",
      taxRate: "3200",
      actInsuranceFee: "1650",
      actInsuranceExpiry: "2027-08-20",
      actInsuranceCompany: "อลิอันซ์ อยุธยา",
      vehicleInsuranceCompany: "กรุงเทพประกันภัย",
      vehicleInsuranceType: "ชั้น 1",
      vehicleInsuranceCoverage: "1200000",
      vehicleInsuranceStartDate: "2026-08-20",
      vehicleInsuranceEndDate: "2027-08-20",
      vehicleInsurancePremium: "22000",
      gpsProvider: "WAYLAR",
      cargoInsuranceCompany: "กรุงเทพประกันภัย",
      cargoInsuranceCoverage: "2000000",
      cargoInsuranceStartDate: "2026-01-01",
      cargoInsuranceEndDate: "2026-12-31",
      cargoInsurancePremium: "9500",
      province: "กรุงเทพมหานคร",
      department: "ฝ่ายขนส่งกระจายสินค้า",
      driverName: "นายอนันต์ ชัยวัฒน์",
      currentMileage: 112000,
      status: "active"
    }
  ];

  const rows = sampleData.map((v) => mapVehicleToExportRow(v as VehicleRecord));
  const worksheet = XLSX.utils.json_to_sheet(rows);

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadCSV(csv, "TNB_Vehicle_Import_Template.csv");
  } else {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "แบบฟอร์มนำเข้ารถ");
    downloadWorkbook(workbook, "TNB_Vehicle_Import_Template.xlsx");
  }
}

// Vehicle Type mapping from Thai/English text to VehicleType
function parseVehicleType(text: any): VehicleType {
  if (!text) return "tractor_10w";
  const str = String(text).toLowerCase().trim();
  if (str.includes("หัวลาก 10") || str.includes("tractor_10w") || str.includes("10 ล้อ หัวลาก")) return "tractor_10w";
  if (str.includes("หัวลาก 6") || str.includes("tractor_6w") || str.includes("6 ล้อ หัวลาก")) return "tractor_6w";
  if (str.includes("หาง 3") || str.includes("trailer_3axle") || str.includes("3 เพลา")) return "trailer_3axle";
  if (str.includes("หาง 2") || str.includes("trailer_2axle") || str.includes("2 เพลา")) return "trailer_2axle";
  if (str.includes("6 ล้อ") || str.includes("ตู้ทึบ") || str.includes("box_truck_6w")) return "box_truck_6w";
  if (str.includes("4 ล้อ") || str.includes("จัมโบ้") || str.includes("jumbo_4w")) return "jumbo_4w";
  if (str.includes("กระบะ") || str.includes("pickup")) return "pickup_box";
  if (str.includes("ผู้บริหาร") || str.includes("เก๋ง") || str.includes("sedan")) return "sedan";
  if (str.includes("ส่วนกลาง") || str.includes("สำนักงาน") || str.includes("van")) return "van";
  if (str.includes("โฟล์คลิฟต์") || str.includes("forklift")) return "forklift";
  return "other";
}

// Helper to normalize string lookup keys
function cleanKey(k: string): string {
  return k.replace(/[\s\t\n\r\(\)\-\_\:\.]/g, "").toLowerCase();
}

export function normalizeLicensePlate(plate: string): string {
  if (!plate) return "";
  return plate
    .replace(/\s+/g, "")
    .replace(/[-_–—]/g, "")
    .toUpperCase()
    .trim();
}

export async function parseVehicleFile(file: File): Promise<{
  success: boolean;
  data: (Partial<VehicleRecord> & { _isDuplicateInFile?: boolean; _fileDuplicateWithRow?: number; _originalRowNum?: number })[];
  errors: string[];
  rawCount: number;
  fileDuplicateCount: number;
  duplicatePlatesSummary: {
    normalizedPlate: string;
    originalPlate: string;
    count: number;
    firstRowNum: number;
  }[];
}> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!jsonRows || jsonRows.length === 0) {
      return { 
        success: false, 
        data: [], 
        errors: ["ไฟล์ไม่มีข้อมูล หรือตารางว่างเปล่า"], 
        rawCount: 0,
        fileDuplicateCount: 0,
        duplicatePlatesSummary: []
      };
    }

    const parsedVehicles: (Partial<VehicleRecord> & { _isDuplicateInFile?: boolean; _fileDuplicateWithRow?: number; _originalRowNum?: number })[] = [];
    const errors: string[] = [];
    const seenPlatesInFile = new Map<string, { firstRowNum: number; count: number; originalPlate: string }>();
    let fileDuplicateCount = 0;

    jsonRows.forEach((row, idx) => {
      const rowNum = idx + 2; // +1 for 1-index, +1 for header row
      
      // Build a map of cleaned keys to values for fuzzy header matching
      const fieldMap: Record<string, any> = {};
      Object.keys(row).forEach((k) => {
        fieldMap[cleanKey(k)] = row[k];
      });

      const getVal = (...keys: string[]): any => {
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (fieldMap[cleaned] !== undefined && fieldMap[cleaned] !== "") {
            return fieldMap[cleaned];
          }
        }
        return "";
      };

      // License Plate is required
      const licensePlate = String(getVal("ทะเบียนใหม่", "ทะเบียน", "licenseplate", "plate", "เลขทะเบียน", "ทะเบียนรถ")).trim();
      if (!licensePlate) {
        errors.push(`แถวที่ ${rowNum}: ไม่มีข้อมูลทะเบียนรถ (ข้ามแถวนี้)`);
        return;
      }

      // Check duplicate within the uploaded file
      const normPlate = normalizeLicensePlate(licensePlate);
      const existingSeen = seenPlatesInFile.get(normPlate);
      let isDuplicateInFile = false;
      let duplicateWithRowNum: number | undefined;

      if (existingSeen) {
        existingSeen.count++;
        fileDuplicateCount++;
        isDuplicateInFile = true;
        duplicateWithRowNum = existingSeen.firstRowNum;
        errors.push(`แถวที่ ${rowNum}: ทะเบียน "${licensePlate}" ซ้ำกับข้อมูลแถวที่ ${existingSeen.firstRowNum} ในไฟล์เดียวกัน`);
      } else {
        seenPlatesInFile.set(normPlate, {
          firstRowNum: rowNum,
          count: 1,
          originalPlate: licensePlate
        });
      }

      // No. ERP
      const erpNoRaw = getVal("noerp", "erpno", "erp", "no", "ลำดับ", "ลำดับerp", "เลขอ้างอิง");
      const erpNo = erpNoRaw !== "" ? String(erpNoRaw).trim() : (parsedVehicles.length + 1).toString();

      // Brand & Model
      const vehicleBrand = String(getVal("ยี่ห้อ", "vehiclebrand", "brand") || "ISUZU").trim();
      const vehicleModel = String(getVal("แบบรุ่น", "แบบ/รุ่น", "รุ่น", "vehiclemodel", "model") || "").trim();

      // Vehicle Type
      const typeRaw = getVal("ประเภท", "ประเภทรถ", "vehicletype", "type");
      const vehicleType = parseVehicleType(typeRaw);

      // Numbers parsing
      const parseNum = (v: any, fallback = 0): number => {
        if (typeof v === "number") return v;
        if (!v) return fallback;
        const cleaned = String(v).replace(/[^0-9.-]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? fallback : num;
      };

      const carrierCompany = String(getVal("ประกอบการขนส่ง", "ประกอบการ", "carriercompany", "carrier", "บริษัท") || "TNB").trim();
      const chassisNumber = String(getVal("เลขตัวถังคัสซี", "เลขตัวถัง", "คัสซี", "chassisnumber", "chassis")).trim();
      const engineNumber = String(getVal("เลขเครื่องยนต์", "เลขเครื่อง", "enginenumber", "engine")).trim();
      const color = String(getVal("สี", "color") || "ขาว").trim();

      const registrationDate = String(getVal("วันที่จดทะเบียน", "วันจดทะเบียน", "registrationdate", "regdate")).trim();
      const taxExpiryDate = String(getVal("วันที่หมดอายุภาษี", "ภาษีหมด", "วันหมดภาษี", "taxexpirydate", "taxexpiry")).trim();
      const taxRate = String(getVal("อัตราภาษีบาท", "อัตราภาษี", "taxrate") || "").trim();
      const actInsuranceFee = String(getVal("ค่าพรบบาท", "ค่าพรบ", "actinsurancefee") || "").trim();
      const actInsuranceExpiry = String(getVal("พรบหมดอายุ", "พรบหมด", "actinsuranceexpiry")).trim();
      const actInsuranceCompany = String(getVal("บริษัทพรบ", "บพรบ", "actinsurancecompany")).trim();

      const vehicleInsuranceCompany = String(getVal("ชื่อประกันภัยรถ", "ประกันภัยรถ", "vehicleinsurancecompany")).trim();
      const vehicleInsuranceType = String(getVal("ประเภทประกันภัยรถ", "ชั้นประกัน", "vehicleinsurancetype") || "ชั้น 1").trim();
      const vehicleInsuranceCoverage = String(getVal("วงเงินประกันภัยรถบาท", "วงเงินประกันภัยรถ", "vehicleinsurancecoverage") || "").trim();
      const vehicleInsuranceStartDate = String(getVal("วันเริ่มคุ้มครองประกันภัยรถ", "วันเริ่มประกันรถ", "vehicleinsurancestartdate")).trim();
      const vehicleInsuranceEndDate = String(getVal("เดือนสิ้นสุดระยะเวลาประกัน", "วันสิ้นสุดประกันรถ", "vehicleinsuranceenddate")).trim();
      const vehicleInsurancePremium = String(getVal("ค่าเบี้ยประกันภัยรถบาท", "ค่าเบี้ยประกัน", "เบี้ยประกันรถ", "vehicleinsurancepremium") || "").trim();

      const gpsProvider = String(getVal("ผู้ให้บริการgps", "gps", "gpsprovider") || "CARTRACK").trim();
      const cargoInsuranceCompany = String(getVal("ชื่อประกันภัยสินค้า", "ประกันสินค้า", "cargoinsurancecompany")).trim();
      const cargoInsuranceCoverage = String(getVal("วงเงินประกันภัยสินค้าบาท", "วงเงินประกันสินค้า", "cargoinsurancecoverage") || "").trim();
      const cargoInsuranceStartDate = String(getVal("วันเริ่มคุ้มครองตามประกันภัยสินค้า", "วันเริ่มประกันสินค้า", "cargoinsurancestartdate")).trim();
      const cargoInsuranceEndDate = String(getVal("สิ้นสุดระยะเวลาประกันสินค้า", "วันสิ้นสุดประกันสินค้า", "cargoinsuranceenddate")).trim();
      const cargoInsurancePremium = String(getVal("ค่าเบี้ยประกันสินค้าบาท", "ค่าเบี้ยประกันสินค้า", "เบี้ยประกันสินค้า", "cargoinsurancepremium") || "").trim();

      const province = String(getVal("จังหวัด", "province") || "กรุงเทพมหานคร").trim();
      const department = String(getVal("ฝ่ายสังกัด", "ฝ่าย", "สังกัด", "department") || "ฝ่ายขนส่ง").trim();
      const driverName = String(getVal("พนักงานขับรถ", "คนขับ", "พขร", "drivername", "driver")).trim();
      const currentMileage = parseNum(getVal("เลขไมล์ปัจจุบันกม", "เลขไมล์", "ไมล์", "currentmileage", "mileage"));
      
      const statusRaw = String(getVal("สถานะรถ", "สถานะ", "status")).toLowerCase();
      let status: VehicleStatus = "active";
      if (statusRaw.includes("maint") || statusRaw.includes("ซ่อม")) status = "under_repair";
      else if (statusRaw.includes("inact") || statusRaw.includes("ระงับ") || statusRaw.includes("ยกเลิก")) status = "inactive";

      (parsedVehicles as any).push({
        id: `VEH-IMP-${Date.now().toString(36)}-${idx}`,
        erpNo,
        carrierCompany,
        licensePlate,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        chassisNumber,
        engineNumber,
        color,
        registrationDate,
        taxExpiryDate,
        taxRate,
        actInsuranceFee,
        actInsuranceExpiry,
        actInsuranceCompany,
        vehicleInsuranceCompany,
        vehicleInsuranceType,
        vehicleInsuranceCoverage,
        vehicleInsuranceStartDate,
        vehicleInsuranceEndDate,
        vehicleInsurancePremium,
        gpsProvider,
        cargoInsuranceCompany,
        cargoInsuranceCoverage,
        cargoInsuranceStartDate,
        cargoInsuranceEndDate,
        cargoInsurancePremium,
        province,
        department,
        driverName,
        currentMileage,
        status,
        fuelType: "diesel",
        year: new Date().getFullYear(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isDuplicateInFile: isDuplicateInFile,
        _fileDuplicateWithRow: duplicateWithRowNum,
        _originalRowNum: rowNum
      });
    });

    return {
      success: parsedVehicles.length > 0,
      data: parsedVehicles,
      errors,
      rawCount: jsonRows.length,
      fileDuplicateCount,
      duplicatePlatesSummary: Array.from(seenPlatesInFile.entries())
        .filter(([_, v]) => v.count > 1)
        .map(([norm, v]) => ({
          normalizedPlate: norm,
          originalPlate: v.originalPlate,
          count: v.count,
          firstRowNum: v.firstRowNum
        }))
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      errors: [`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message || String(err)}`],
      rawCount: 0,
      fileDuplicateCount: 0,
      duplicatePlatesSummary: []
    };
  }
}

// ----------------------------------------------------
// 2. STOCK / PART LIST IMPORT & EXPORT
// ----------------------------------------------------

export const INVENTORY_EXCEL_HEADERS = [
  "รหัสอะไหล่ (Part Code)",
  "ชื่อรายการอะไหล่ (Part Name)",
  "หมวดหมู่งานซ่อม",
  "ยี่ห้อ / ผู้ผลิต (Brand)",
  "สเปค / เบอร์ / สเปก (Spec)",
  "หน่วยนับ (Unit)",
  "จำนวนคงเหลือ (Stock)",
  "จุดสั่งซื้อขั้นต่ำ (Min Stock)",
  "ราคาทุนต่อหน่วย (Cost)",
  "ราคาเบิก/จำหน่าย (Price)",
  "ตำแหน่งจัดเก็บ/แร็ค (Location)",
  "ผู้จัดจำหน่าย/ร้านค้า (Supplier)",
  "อะไหล่ซ่อมได้ (Repairable: ใช่/ไม่ใช่)",
  "สภาพ (สภาพ: new/rebuilt/spare)",
  "หมายเหตุ (Notes)"
];

export function mapInventoryToExportRow(item: InventoryItem) {
  const catConfig = CATEGORIES_CONFIG[item.category];
  const catLabel = catConfig ? `${catConfig.nameTh} (${catConfig.nameEn})` : item.category;
  
  return {
    "รหัสอะไหล่ (Part Code)": item.code,
    "ชื่อรายการอะไหล่ (Part Name)": item.name,
    "หมวดหมู่งานซ่อม": catLabel,
    "ยี่ห้อ / ผู้ผลิต (Brand)": item.brand || "",
    "สเปค / เบอร์ / สเปก (Spec)": item.specification || "",
    "หน่วยนับ (Unit)": item.unit || "ชิ้น",
    "จำนวนคงเหลือ (Stock)": item.currentStock || 0,
    "จุดสั่งซื้อขั้นต่ำ (Min Stock)": item.minStockLevel || 0,
    "ราคาทุนต่อหน่วย (Cost)": item.unitCost || 0,
    "ราคาเบิก/จำหน่าย (Price)": item.unitSellingPrice || item.unitCost || 0,
    "ตำแหน่งจัดเก็บ/แร็ค (Location)": item.locationRack || "A-01",
    "ผู้จัดจำหน่าย/ร้านค้า (Supplier)": item.supplier || "",
    "อะไหล่ซ่อมได้ (Repairable: ใช่/ไม่ใช่)": item.isRepairableCategory ? "ใช่ (ซ่อม/เวียนได้)" : "ไม่ใช่ (เบิกเปลี่ยน)",
    "สภาพ (สภาพ: new/rebuilt/spare)": item.condition || "new",
    "หมายเหตุ (Notes)": item.notes || ""
  };
}

export function exportInventoryToExcel(inventory: InventoryItem[], filename = "TNB_Stock_Parts_Inventory") {
  const rows = inventory.map(mapInventoryToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 18 }, // Code
    { wch: 32 }, // Name
    { wch: 24 }, // Category
    { wch: 22 }, // Brand
    { wch: 26 }, // Spec
    { wch: 12 }, // Unit
    { wch: 14 }, // Stock
    { wch: 16 }, // Min Stock
    { wch: 14 }, // Cost
    { wch: 14 }, // Price
    { wch: 16 }, // Location
    { wch: 26 }, // Supplier
    { wch: 18 }, // Repairable
    { wch: 14 }, // Condition
    { wch: 30 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "คลังอะไหล่และสต็อก");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function exportInventoryToCSV(inventory: InventoryItem[], filename = "TNB_Stock_Parts_Inventory") {
  const rows = inventory.map(mapInventoryToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function downloadInventoryTemplate(format: "xlsx" | "csv" = "xlsx") {
  const sampleItems: Partial<InventoryItem>[] = [
    {
      code: "ENG-101",
      name: "กรองน้ำมันเครื่อง Isuzu GXZ 360",
      category: "engine",
      brand: "ISUZU Genuine Parts",
      specification: "Part No. 1-13240232-1 สำหรับเครื่อง 6UZ1",
      unit: "ลูก",
      currentStock: 24,
      minStockLevel: 5,
      unitCost: 450,
      unitSellingPrice: 580,
      locationRack: "A-01-02",
      supplier: "ตรีเพชรอีซูซุเซลส์",
      isRepairableCategory: false,
      condition: "new",
      notes: "อะไหล่แท้เปลี่ยนตามรอบระยะ PM ทุก 20,000 กม."
    },
    {
      code: "SUS-205",
      name: "แหนบหน้าแผ่นที่ 1 (Main Spring)",
      category: "suspension",
      brand: "TNB Heavy Duty",
      specification: "ความยาว 1,450 มม. หนา 14 มม. สำหรับ HINO 10 ล้อ",
      unit: "แผ่น",
      currentStock: 12,
      minStockLevel: 4,
      unitCost: 1850,
      unitSellingPrice: 2300,
      locationRack: "B-03-01",
      supplier: "โรงงานแหนบพัฒนาวิศวกรรม",
      isRepairableCategory: true,
      condition: "new",
      notes: "สามารถส่งดัดหรือโอเวอร์ฮอลล์ซ่อมได้"
    },
    {
      code: "ELE-301",
      name: "ไดชาร์จ 24V 80A โอเวอร์ฮอลล์",
      category: "lighting",
      brand: "Denso",
      specification: "24V 80A สำหรับรถบรรทุกหัวลาก ISUZU/HINO",
      unit: "ลูก",
      currentStock: 4,
      minStockLevel: 2,
      unitCost: 3800,
      unitSellingPrice: 4800,
      locationRack: "C-02-04",
      supplier: "อู่ไดนาโมและไฟฟ้ารถยนต์นครปฐม",
      isRepairableCategory: true,
      condition: "rebuilt",
      notes: "อะไหล่หมุนเวียนซ่อมแล้ว พร้อมติดตั้งทดแทน"
    }
  ];

  const rows = sampleItems.map((item) => mapInventoryToExportRow(item as InventoryItem));
  const worksheet = XLSX.utils.json_to_sheet(rows);

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadCSV(csv, "TNB_Stock_Parts_Template.csv");
  } else {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "แบบฟอร์มนำเข้าอะไหล่");
    downloadWorkbook(workbook, "TNB_Stock_Parts_Template.xlsx");
  }
}

// Category parser from Thai/English
function parseRepairCategory(text: any): RepairCategory {
  if (!text) return "other";
  const str = String(text).toLowerCase().trim();
  if (str.includes("ช่วงล่าง") || str.includes("suspension") || str.includes("เพลา") || str.includes("แหนบ") || str.includes("เบรก")) return "suspension";
  if (str.includes("น้ำมัน") || str.includes("หล่อลื่น") || str.includes("lubricant") || str.includes("ของเหลว") || str.includes("กรอง")) return "lubricant";
  if (str.includes("ไฟ") || str.includes("lighting") || str.includes("แบต") || str.includes("ไดชาร์จ") || str.includes("electric")) return "lighting";
  if (str.includes("เครื่อง") || str.includes("engine") || str.includes("สูบ") || str.includes("วาล์ว") || str.includes("สายพาน")) return "engine";
  if (str.includes("ยาง") || str.includes("tires") || str.includes("tire") || str.includes("ล้อ") || str.includes("กระทะ")) return "tires";
  if (str.includes("แอร์") || str.includes("aircon") || str.includes("คอมเพรสเซอร์") || str.includes("ตู้แอร์")) return "aircon";
  if (str.includes("ตัวถัง") || str.includes("bodywork") || str.includes("สี") || str.includes("กระจก") || str.includes("บังโคลน")) return "bodywork";
  if (str.includes("ตรวจเช็ค") || str.includes("inspection") || str.includes("pm") || str.includes("บำรุง")) return "inspection";
  return "other";
}

export async function parseInventoryFile(file: File): Promise<{
  success: boolean;
  data: Partial<InventoryItem>[];
  errors: string[];
  rawCount: number;
}> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!jsonRows || jsonRows.length === 0) {
      return { success: false, data: [], errors: ["ไฟล์ไม่มีข้อมูล หรือตารางว่างเปล่า"], rawCount: 0 };
    }

    const parsedItems: Partial<InventoryItem>[] = [];
    const errors: string[] = [];

    jsonRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const fieldMap: Record<string, any> = {};
      Object.keys(row).forEach((k) => {
        fieldMap[cleanKey(k)] = row[k];
      });

      const getVal = (...keys: string[]): any => {
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (fieldMap[cleaned] !== undefined && fieldMap[cleaned] !== "") {
            return fieldMap[cleaned];
          }
        }
        return "";
      };

      const name = String(getVal("ชื่อรายการอะไหล่", "ชื่ออะไหล่", "ชื่อรายการ", "partname", "name", "itemname")).trim();
      if (!name) {
        errors.push(`แถวที่ ${rowNum}: ไม่มีชื่อรายการอะไหล่ (ข้ามแถวนี้)`);
        return;
      }

      let code = String(getVal("รหัสอะไหล่", "partcode", "code", "itemcode", "รหัส")).trim();
      if (!code) {
        code = `PART-${Date.now().toString(36).toUpperCase()}-${idx + 1}`;
      }

      const parseNum = (v: any, fallback = 0): number => {
        if (typeof v === "number") return v;
        if (!v) return fallback;
        const cleaned = String(v).replace(/[^0-9.-]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? fallback : num;
      };

      const category = parseRepairCategory(getVal("หมวดหมู่งานซ่อม", "หมวดหมู่", "category", "หมวด"));
      const brand = String(getVal("ยี่ห้อผู้ผลิต", "ยี่ห้อ", "brand", "manufacturer") || "Generic").trim();
      const specification = String(getVal("สเปคเบอร์สเปก", "สเปค", "specification", "spec", "ขนาด")).trim();
      const unit = String(getVal("หน่วยนับ", "หน่วย", "unit") || "ชิ้น").trim();
      const currentStock = parseNum(getVal("จำนวนคงเหลือ", "สต็อกคงเหลือ", "จำนวน", "currentstock", "stock", "qty"));
      const minStockLevel = parseNum(getVal("จุดสั่งซื้อขั้นต่ำ", "จุดสั่งซื้อ", "สต็อกขั้นต่ำ", "minstocklevel", "minstock", "safetystock"), 2);
      const unitCost = parseNum(getVal("ราคาทุนต่อหน่วย", "ราคาทุน", "ทุน", "unitcost", "cost"));
      const unitSellingPrice = parseNum(getVal("ราคาเบิกจำหน่าย", "ราคาเบิก", "ราคาจำหน่าย", "ราคา", "unitsellingprice", "price"), unitCost);
      const locationRack = String(getVal("ตำแหน่งจัดเก็บแร็ค", "ตำแหน่งจัดเก็บ", "แร็ค", "locationrack", "location", "rack") || "A-01").trim();
      const supplier = String(getVal("ผู้จัดจำหน่ายร้านค้า", "ผู้จัดจำหน่าย", "ผู้จำหน่าย", "ร้านค้า", "supplier") || "TNB Central Workshop").trim();

      const repVal = String(getVal("อะไหล่ซ่อมได้", "ซ่อมได้", "isrepairable", "repairable")).toLowerCase();
      const isRepairableCategory = repVal.includes("ใช่") || repVal.includes("true") || repVal.includes("1") || repVal.includes("ซ่อมได้") || repVal.includes("เวียน");

      const condVal = String(getVal("สภาพ", "condition")).toLowerCase();
      let condition: "new" | "rebuilt" | "spare" = "new";
      if (condVal.includes("rebuilt") || condVal.includes("บิ้ว") || condVal.includes("ซ่อมแล้ว") || condVal.includes("มือสอง")) condition = "rebuilt";
      else if (condVal.includes("spare") || condVal.includes("สำรอง")) condition = "spare";

      const notes = String(getVal("หมายเหตุ", "notes", "remark")).trim();

      parsedItems.push({
        id: `INV-IMP-${Date.now().toString(36)}-${idx}`,
        code,
        name,
        category,
        brand,
        specification,
        unit,
        currentStock,
        minStockLevel,
        unitCost,
        unitSellingPrice,
        locationRack,
        supplier,
        isRepairableCategory,
        condition,
        compatibleVehicleTypes: ["tractor_6w", "tractor_10w", "box_truck_6w"],
        notes,
        updatedAt: new Date().toISOString()
      });
    });

    return {
      success: parsedItems.length > 0,
      data: parsedItems,
      errors,
      rawCount: jsonRows.length
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      errors: [`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message || String(err)}`],
      rawCount: 0
    };
  }
}

// ----------------------------------------------------
// 3. REPAIR TICKETS EXPORT
// ----------------------------------------------------

export function mapTicketToExportRow(t: RepairTicket) {
  const statusCfg = STATUS_CONFIG[t.status];
  const catCfg = CATEGORIES_CONFIG[t.category];
  
  return {
    "เลขที่ใบแจ้งซ่อม": t.ticketNumber,
    "ทะเบียนรถ": t.licensePlate,
    "จังหวัด": t.province,
    "ประเภทรถ": VEHICLE_TYPE_LABELS[t.vehicleType] || t.vehicleType,
    "ยี่ห้อ/รุ่น": `${t.vehicleBrand} ${t.vehicleModel}`,
    "เลขไมล์ (กม.)": t.currentMileage || 0,
    "อาการเสีย/งานซ่อม": t.symptoms,
    "หมวดหมู่งาน": catCfg ? catCfg.nameTh : t.category,
    "งานย่อย": t.subCategoryName || "-",
    "ความเร่งด่วน": t.priority === "critical" ? "ด่วนวิกฤต (ฉุกเฉิน)" : t.priority === "high" ? "ด่วนมาก" : t.priority === "medium" ? "ปานกลาง" : "ปกติ",
    "สถานะงาน": statusCfg ? statusCfg.labelTh : t.status,
    "ผู้แจ้งซ่อม": t.requesterName,
    "เบอร์โทรผู้แจ้ง": t.requesterPhone || "-",
    "สังกัด/แผนก": t.department,
    "ช่างผู้รับผิดชอบ": t.assignedMechanic || "ยังไม่ระบุ",
    "ค่าอะไหล่ (บาท)": t.partsCost || 0,
    "ค่าแรง (บาท)": t.laborCost || 0,
    "รวมค่าใช้จ่าย (บาท)": t.totalCost || 0,
    "จำนวนอะไหล่ที่ใช้ (รายการ)": t.partsList ? t.partsList.length : 0,
    "วันที่แจ้ง": t.createdAt ? new Date(t.createdAt).toLocaleString("th-TH") : "-",
    "วันที่ซ่อมเสร็จ": t.actualCompletionDate ? new Date(t.actualCompletionDate).toLocaleString("th-TH") : "-",
    "คะแนนความพึงพอใจ": t.feedback?.overallRating ? `${t.feedback.overallRating} ดาว` : "ยังไม่ได้ประเมิน",
    "ความคิดเห็นผู้ประเมิน": t.feedback?.comment || "-"
  };
}

export function exportTicketsToExcel(tickets: RepairTicket[], filename = "TNB_Repair_Tickets_Report") {
  const rows = tickets.map(mapTicketToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 18 }, // Ticket No
    { wch: 14 }, // Plate
    { wch: 14 }, // Prov
    { wch: 18 }, // Type
    { wch: 22 }, // Model
    { wch: 14 }, // Mileage
    { wch: 34 }, // Symptoms
    { wch: 18 }, // Cat
    { wch: 18 }, // Subcat
    { wch: 16 }, // Priority
    { wch: 18 }, // Status
    { wch: 20 }, // Requester
    { wch: 16 }, // Phone
    { wch: 20 }, // Dept
    { wch: 20 }, // Tech
    { wch: 18 }, // Est Cost
    { wch: 18 }, // Act Cost
    { wch: 16 }, // Parts Count
    { wch: 22 }, // CreatedAt
    { wch: 22 }, // CompletedAt
    { wch: 16 }, // Satisfaction
    { wch: 26 }  // Feedback
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ใบแจ้งซ่อม");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function exportTicketsToCSV(tickets: RepairTicket[], filename = "TNB_Repair_Tickets_Report") {
  const rows = tickets.map(mapTicketToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

// ----------------------------------------------------
// 4. GOODS RECEIPTS EXPORT (ประวัติรับเข้าสต็อก)
// ----------------------------------------------------

export function mapReceiptToExportRows(receipt: GoodsReceiptRecord) {
  if (!receipt.items || receipt.items.length === 0) {
    return [{
      "เลขที่ใบรับสินค้า (GR No.)": receipt.receiptNumber,
      "วันที่รับเข้า": receipt.receivedDate,
      "ผู้จัดจำหน่าย/ร้านค้า": receipt.supplierName,
      "เลขที่ใบสั่งซื้อ (PO)": receipt.poNumber || "-",
      "เลขที่ใบส่งของ/ใบกำกับ": receipt.invoiceNumber || "-",
      "ผู้ตรวจรับ": receipt.receivedBy,
      "รหัสอะไหล่": "-",
      "รายการอะไหล่": "-",
      "หมวดหมู่": "-",
      "จำนวน": 0,
      "หน่วย": "-",
      "ราคาทุนต่อหน่วย (บาท)": 0,
      "รวมมูลค่า (บาท)": 0,
      "ตำแหน่งจัดเก็บ": "-",
      "ยอดรวมทั้งใบ (บาท)": receipt.totalAmount,
      "หมายเหตุ": receipt.notes || "-"
    }];
  }

  return receipt.items.map((item) => ({
    "เลขที่ใบรับสินค้า (GR No.)": receipt.receiptNumber,
    "วันที่รับเข้า": receipt.receivedDate,
    "ผู้จัดจำหน่าย/ร้านค้า": receipt.supplierName,
    "เลขที่ใบสั่งซื้อ (PO)": receipt.poNumber || "-",
    "เลขที่ใบส่งของ/ใบกำกับ": receipt.invoiceNumber || "-",
    "ผู้ตรวจรับ": receipt.receivedBy,
    "รหัสอะไหล่": item.itemCode,
    "รายการอะไหล่": item.itemName,
    "หมวดหมู่": CATEGORIES_CONFIG[item.category]?.nameTh || item.category,
    "จำนวน": item.quantity,
    "หน่วย": item.unit,
    "ราคาทุนต่อหน่วย (บาท)": item.unitCost,
    "รวมมูลค่า (บาท)": item.totalCost,
    "ตำแหน่งจัดเก็บ": "-",
    "ยอดรวมทั้งใบ (บาท)": receipt.totalAmount,
    "หมายเหตุ": receipt.notes || "-"
  }));
}

export function exportReceiptsToExcel(receipts: GoodsReceiptRecord[], filename = "TNB_Goods_Receipts_History") {
  const rows = receipts.flatMap(mapReceiptToExportRows);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ประวัติรับเข้าสต็อก");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function exportReceiptsToCSV(receipts: GoodsReceiptRecord[], filename = "TNB_Goods_Receipts_History") {
  const rows = receipts.flatMap(mapReceiptToExportRows);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

// ----------------------------------------------------
// 5. GOODS REQUISITIONS EXPORT (ประวัติเบิกจ่ายอะไหล่)
// ----------------------------------------------------

export function mapRequisitionToExportRows(req: GoodsRequisitionRecord) {
  const typeLabel = req.requisitionType === "repair_ticket" ? "ใบแจ้งซ่อม" : req.requisitionType === "vehicle_maintenance" ? "ซ่อมบำรุงรถประจำ" : "เบิกใช้งานทั่วไป";
  
  if (!req.items || req.items.length === 0) {
    return [{
      "เลขที่ใบเบิก (REQ No.)": req.requisitionNumber,
      "วันที่เบิก": req.requisitionDate,
      "ประเภทการเบิก": typeLabel,
      "ทะเบียนรถที่นำไปใช้": req.licensePlate || "-",
      "เลขที่ใบแจ้งซ่อม": req.ticketNumber || "-",
      "ผู้ขอเบิก": req.requestedBy,
      "ผู้อนุมัติ": req.approvedBy,
      "สังกัด/แผนก": req.department,
      "รหัสอะไหล่": "-",
      "รายการอะไหล่": "-",
      "จำนวน": 0,
      "หน่วย": "-",
      "ราคาต่อหน่วย (บาท)": 0,
      "รวมมูลค่า (บาท)": 0,
      "ยอดรวมทั้งใบ (บาท)": req.totalAmount,
      "วัตถุประสงค์": req.purpose || "-"
    }];
  }

  return req.items.map((item) => ({
    "เลขที่ใบเบิก (REQ No.)": req.requisitionNumber,
    "วันที่เบิก": req.requisitionDate,
    "ประเภทการเบิก": typeLabel,
    "ทะเบียนรถที่นำไปใช้": req.licensePlate || "-",
    "เลขที่ใบแจ้งซ่อม": req.ticketNumber || "-",
    "ผู้ขอเบิก": req.requestedBy,
    "ผู้อนุมัติ": req.approvedBy,
    "สังกัด/แผนก": req.department,
    "รหัสอะไหล่": item.itemCode,
    "รายการอะไหล่": item.itemName,
    "จำนวน": item.quantity,
    "หน่วย": item.unit,
    "ราคาต่อหน่วย (บาท)": item.unitCost,
    "รวมมูลค่า (บาท)": item.totalCost,
    "ยอดรวมทั้งใบ (บาท)": req.totalAmount,
    "วัตถุประสงค์": req.purpose || "-"
  }));
}

export function exportRequisitionsToExcel(requisitions: GoodsRequisitionRecord[], filename = "TNB_Goods_Requisitions_History") {
  const rows = requisitions.flatMap(mapRequisitionToExportRows);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ประวัติเบิกจ่ายอะไหล่");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

export function exportRequisitionsToCSV(requisitions: GoodsRequisitionRecord[], filename = "TNB_Goods_Requisitions_History") {
  const rows = requisitions.flatMap(mapRequisitionToExportRows);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

// ----------------------------------------------------
// 6. PM PLAN & PREVENTIVE MAINTENANCE EXPORT (ISO TNB-MT-PLN-001)
// ----------------------------------------------------

export function mapPMScheduleToExportRow(pm: PMMonthlyScheduleItem) {
  const pmConfig = PM_TYPE_CONFIG[pm.pmType];
  const typeLabel = pmConfig ? pmConfig.nameTh : pm.pmTypeName || pm.pmType;
  
  const statusLabel = 
    pm.status === "completed" ? "ดำเนินการเสร็จสมบูรณ์" :
    pm.status === "in_progress" ? "กำลังดำเนินการซ่อมบำรุง" :
    pm.status === "overdue" ? "เกินกำหนดแผนงาน" :
    pm.status === "cancelled" ? "ยกเลิก/เลื่อนแผน" : "ตามแผนงาน (Scheduled)";

  const checklistSummary = pm.checklists && pm.checklists.length > 0
    ? pm.checklists.map((c, i) => `${i + 1}. [${c.isChecked ? "✓ ตรวจแล้ว" : "รอดำเนินการ"}] ${c.item}`).join(" | ")
    : "-";

  return {
    "เลขที่เอกสารควบคุม (ISO)": pm.isoDocNumber || ISO_DOCUMENT_REGISTRY.pm_plan.fullCode,
    "รหัสแผน PM (PM Code)": pm.pmPlanCode,
    "ปี (Year)": pm.year,
    "เดือน (Month)": MONTH_NAMES_TH[pm.month - 1] || `เดือน ${pm.month}`,
    "วันที่ตามแผน (Planned Date)": pm.plannedDate,
    "วันที่ปฏิบัติจริง (Actual Date)": pm.actualDate || "-",
    "No. ERP": pm.erpNo || "-",
    "ทะเบียนรถ": pm.licensePlate,
    "จังหวัด": pm.province || "กรุงเทพมหานคร",
    "ประเภทรถ": VEHICLE_TYPE_LABELS[pm.vehicleType] || pm.vehicleType,
    "ยี่ห้อ/รุ่น": `${pm.vehicleBrand} ${pm.vehicleModel}`,
    "ประกอบการ": pm.carrierCompany || "TNB",
    "ฝ่าย/สังกัด": pm.department || "ฝ่ายขนส่ง",
    "พนักงานขับรถ": pm.driverName || "-",
    "ประเภทงาน PM": typeLabel,
    "เป้าหมายระยะทาง (กม.)": pm.targetMileage,
    "เลขไมล์เข้าซ่อมจริง (กม.)": pm.lastServiceMileage || pm.targetMileage,
    "สถานะ": statusLabel,
    "นายช่างผู้รับผิดชอบ": pm.assignedTechnician || "-",
    "ประมาณการค่าใช้จ่าย (บาท)": pm.estimatedCost,
    "ค่าใช้จ่ายจริง (บาท)": pm.actualCost ?? (pm.status === "completed" ? pm.estimatedCost : 0),
    "เลขที่ใบแจ้งซ่อมเชื่อมโยง": pm.ticketNumber || "-",
    "รายการตรวจเช็ค (Checklist)": checklistSummary,
    "หมายเหตุ": pm.notes || "-"
  };
}

export function exportPMMonthlyScheduleToExcel(
  schedules: PMMonthlyScheduleItem[],
  year: number,
  month?: number,
  filename = "TNB_PM_Monthly_Schedule"
) {
  const filtered = schedules.filter(s => {
    if (s.year !== year) return false;
    if (month && month > 0 && s.month !== month) return false;
    return true;
  });

  const rows = filtered.map(mapPMScheduleToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 24 }, // ISO Doc No
    { wch: 18 }, // PM Code
    { wch: 10 }, // Year
    { wch: 18 }, // Month
    { wch: 16 }, // Planned Date
    { wch: 16 }, // Actual Date
    { wch: 14 }, // ERP
    { wch: 14 }, // Plate
    { wch: 16 }, // Province
    { wch: 18 }, // Type
    { wch: 24 }, // Brand/Model
    { wch: 14 }, // Carrier
    { wch: 20 }, // Dept
    { wch: 20 }, // Driver
    { wch: 28 }, // PM Type
    { wch: 20 }, // Target KM
    { wch: 20 }, // Actual KM
    { wch: 20 }, // Status
    { wch: 22 }, // Tech
    { wch: 18 }, // Est Cost
    { wch: 18 }, // Act Cost
    { wch: 20 }, // Ticket No
    { wch: 50 }, // Checklist
    { wch: 24 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  const sheetName = month && month > 0 
    ? `PM_${year}_${MONTH_SHORT_TH[month - 1]}`
    : `แผน_PM_${year}_ทั้งปี`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const downloadName = month && month > 0
    ? `${filename}_${year}_M${month < 10 ? '0' + month : month}_${ISO_DOCUMENT_REGISTRY.pm_plan.docCode}`
    : `${filename}_${year}_FullYear_${ISO_DOCUMENT_REGISTRY.pm_plan.docCode}`;

  downloadWorkbook(workbook, downloadName);
}

export function exportPMMonthlyScheduleToCSV(
  schedules: PMMonthlyScheduleItem[],
  year: number,
  month?: number,
  filename = "TNB_PM_Monthly_Schedule"
) {
  const filtered = schedules.filter(s => {
    if (s.year !== year) return false;
    if (month && month > 0 && s.month !== month) return false;
    return true;
  });

  const rows = filtered.map(mapPMScheduleToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadCSV(csv, `${filename}_${year}_${ISO_DOCUMENT_REGISTRY.pm_plan.docCode}`);
}

// 12-Month Master Matrix Export (1 Sheet Matrix with all vehicles and Jan-Dec schedule)
export function exportPMAnnualMatrixToExcel(
  vehicles: VehicleRecord[],
  schedules: PMMonthlyScheduleItem[],
  year: number,
  filename = "TNB_PM_Annual_Master_Matrix"
) {
  // Ensure we have all vehicles (from vehicle records plus any present in schedules)
  const vehicleMap = new Map<string, Partial<VehicleRecord>>();
  vehicles.forEach(v => {
    vehicleMap.set(normalizeLicensePlate(v.licensePlate) || v.id, v);
  });

  schedules.filter(s => s.year === year).forEach(s => {
    const key = normalizeLicensePlate(s.licensePlate) || s.vehicleId;
    if (!vehicleMap.has(key)) {
      vehicleMap.set(key, {
        id: s.vehicleId,
        erpNo: s.erpNo || "",
        licensePlate: s.licensePlate,
        province: s.province || "กรุงเทพมหานคร",
        vehicleType: s.vehicleType,
        vehicleBrand: s.vehicleBrand,
        vehicleModel: s.vehicleModel,
        carrierCompany: s.carrierCompany || "TNB",
        department: s.department || "ฝ่ายขนส่ง",
        driverName: s.driverName || "-",
        currentMileage: s.lastServiceMileage || s.targetMileage || 0
      });
    }
  });

  const allVehiclesList = Array.from(vehicleMap.values());

  const matrixRows = allVehiclesList.map((v, index) => {
    const vNormPlate = normalizeLicensePlate(v.licensePlate || "");
    const vSchedules = schedules.filter(s => 
      s.year === year && (
        (v.id && s.vehicleId === v.id) || 
        (vNormPlate && normalizeLicensePlate(s.licensePlate) === vNormPlate)
      )
    );
    
    const row: Record<string, any> = {
      "ลำดับ": index + 1,
      "No. ERP": v.erpNo || "-",
      "ทะเบียนรถ": v.licensePlate,
      "จังหวัด": v.province || "กรุงเทพมหานคร",
      "ประเภทรถ": v.vehicleType ? (VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType) : "หัวลาก 10 ล้อ",
      "ยี่ห้อ/รุ่น": `${v.vehicleBrand || ""} ${v.vehicleModel || ""}`.trim() || "-",
      "ประกอบการ": v.carrierCompany || "TNB",
      "ฝ่าย/สังกัด": v.department || "ฝ่ายขนส่ง",
      "พนักงานขับรถ": v.driverName || "-",
      "เลขไมล์ปัจจุบัน (กม.)": v.currentMileage || 0
    };

    // Fill Jan to Dec columns
    for (let m = 1; m <= 12; m++) {
      const monthSched = vSchedules.filter(s => s.month === m);
      const colName = `${MONTH_SHORT_TH[m - 1]} (${m})`;
      if (monthSched.length === 0) {
        row[colName] = "-";
      } else {
        row[colName] = monthSched.map(s => {
          const typeCode = 
            s.pmType === "pm1_minor" ? "PM1" :
            s.pmType === "pm2_intermediate" ? "PM2" :
            s.pmType === "pm3_major" ? "PM3" :
            s.pmType === "pm_annual" ? "ตรวจประจำปี" : "PM";
          const statusIcon = s.status === "completed" ? "✓" : s.status === "in_progress" ? "⚡" : s.status === "overdue" ? "⚠" : "○";
          const day = s.plannedDate ? s.plannedDate.substring(8, 10) : "";
          return `${statusIcon} ${typeCode}${day ? ` (${day})` : ""}`;
        }).join(" | ");
      }
    }

    const totalPlanned = vSchedules.length;
    const totalCompleted = vSchedules.filter(s => s.status === "completed").length;
    row["รวมแผนทั้งปี (ครั้ง)"] = totalPlanned;
    row["ทำเสร็จแล้ว (ครั้ง)"] = totalCompleted;
    row["ความสำเร็จ (%)"] = totalPlanned > 0 ? `${Math.round((totalCompleted / totalPlanned) * 100)}%` : "-";

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(matrixRows);

  worksheet["!cols"] = [
    { wch: 8 },  // No
    { wch: 12 }, // ERP
    { wch: 14 }, // Plate
    { wch: 14 }, // Prov
    { wch: 18 }, // Type
    { wch: 22 }, // Model
    { wch: 12 }, // Carrier
    { wch: 18 }, // Dept
    { wch: 18 }, // Driver
    { wch: 16 }, // Mileage
    // 12 Months
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    // Summary
    { wch: 16 }, { wch: 16 }, { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Matrix_PM_${year}_12เดือน`);
  downloadWorkbook(workbook, `${filename}_${year}_${ISO_DOCUMENT_REGISTRY.pm_plan.fullCode}`);
}

// Download PM Plan Excel / CSV Template
export function downloadPMScheduleTemplate(
  templateType: "detailed" | "matrix" | "list" = "matrix",
  format: "xlsx" | "csv" = "xlsx"
) {
  if (templateType === "matrix") {
    // 12-Month Matrix Template
    const sampleMatrix = [
      {
        "No. ERP": "T10-01",
        "ทะเบียนรถ": "70-1122",
        "จังหวัด": "กรุงเทพมหานคร",
        "ประเภทรถ": "หัวลาก 10 ล้อ",
        "ยี่ห้อ": "ISUZU",
        "แบบ/รุ่น": "GXZ77NXXFV 360",
        "พนักงานขับรถ": "นายสมชาย สายมั่น",
        "ม.ค. (1)": "PM1 (12)",
        "ก.พ. (2)": "-",
        "มี.ค. (3)": "-",
        "เม.ย. (4)": "PM2 (15)",
        "พ.ค. (5)": "-",
        "มิ.ย. (6)": "-",
        "ก.ค. (7)": "PM1 (10)",
        "ส.ค. (8)": "-",
        "ก.ย. (9)": "-",
        "ต.ค. (10)": "PM3 (20)",
        "พ.ย. (11)": "-",
        "ธ.ค. (12)": "ตรวจประจำปี (18)"
      },
      {
        "No. ERP": "T10-02",
        "ทะเบียนรถ": "70-3344",
        "จังหวัด": "กรุงเทพมหานคร",
        "ประเภทรถ": "รถบรรทุก 6 ล้อตู้ทึบ",
        "ยี่ห้อ": "HINO",
        "แบบ/รุ่น": "FG8JP1A-JGT",
        "พนักงานขับรถ": "นายอนันต์ ชัยวัฒน์",
        "ม.ค. (1)": "-",
        "ก.พ. (2)": "PM1 (14)",
        "มี.ค. (3)": "-",
        "เม.ย. (4)": "-",
        "พ.ค. (5)": "PM2 (18)",
        "มิ.ย. (6)": "-",
        "ก.ค. (7)": "-",
        "ส.ค. (8)": "PM1 (12)",
        "ก.ย. (9)": "-",
        "ต.ค. (10)": "-",
        "พ.ย. (11)": "PM3 (22)",
        "ธ.ค. (12)": "-"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleMatrix);
    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      downloadCSV(csv, "TNB_PM_Matrix_Template_12Months.csv");
    } else {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "แบบฟอร์ม Matrix 12 เดือน");
      downloadWorkbook(workbook, "TNB_PM_Matrix_Template_12Months.xlsx");
    }
  } else {
    // Detailed PM List Template
    const sampleDetailed = [
      {
        "เลขที่เอกสารควบคุม (ISO)": "TNB-MT-PLN-001-Rev.02",
        "รหัสแผน PM (PM Code)": "PM-2026-01-001",
        "ปี (Year)": 2026,
        "เดือน (Month)": 1,
        "วันที่ตามแผน (Planned Date)": "2026-01-15",
        "No. ERP": "T10-01",
        "ทะเบียนรถ": "70-1122",
        "จังหวัด": "กรุงเทพมหานคร",
        "ประเภทรถ": "หัวลาก 10 ล้อ",
        "ยี่ห้อ/รุ่น": "ISUZU GXZ77NXXFV",
        "ประกอบการ": "TNB",
        "ฝ่าย/สังกัด": "ฝ่ายขนส่ง",
        "พนักงานขับรถ": "นายสมชาย สายมั่น",
        "ประเภทงาน PM": "PM1: เช็คระยะย่อย (A-Service)",
        "เป้าหมายระยะทาง (กม.)": 60000,
        "สถานะ": "ตามแผนงาน (Scheduled)",
        "นายช่างผู้รับผิดชอบ": "ช่างประสิทธิ์ สายชล",
        "ประมาณการค่าใช้จ่าย (บาท)": 3500,
        "หมายเหตุ": "เปลี่ยนถ่ายน้ำมันเครื่องและไส้กรองตามรอบ"
      },
      {
        "เลขที่เอกสารควบคุม (ISO)": "TNB-MT-PLN-001-Rev.02",
        "รหัสแผน PM (PM Code)": "PM-2026-04-001",
        "ปี (Year)": 2026,
        "เดือน (Month)": 4,
        "วันที่ตามแผน (Planned Date)": "2026-04-18",
        "No. ERP": "T10-01",
        "ทะเบียนรถ": "70-1122",
        "จังหวัด": "กรุงเทพมหานคร",
        "ประเภทรถ": "หัวลาก 10 ล้อ",
        "ยี่ห้อ/รุ่น": "ISUZU GXZ77NXXFV",
        "ประกอบการ": "TNB",
        "ฝ่าย/สังกัด": "ฝ่ายขนส่ง",
        "พนักงานขับรถ": "นายสมชาย สายมั่น",
        "ประเภทงาน PM": "PM2: เช็คระยะปานกลาง (B-Service)",
        "เป้าหมายระยะทาง (กม.)": 80000,
        "สถานะ": "ตามแผนงาน (Scheduled)",
        "นายช่างผู้รับผิดชอบ": "ช่างวิชาญ สมานใจ",
        "ประมาณการค่าใช้จ่าย (บาท)": 8500,
        "หมายเหตุ": "เปลี่ยนถ่ายน้ำมันเกียร์ เฟืองท้าย ไส้กรองอากาศ และอัดจารบี"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleDetailed);
    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      downloadCSV(csv, "TNB_PM_Schedule_List_Template.csv");
    } else {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "แบบฟอร์มแผน PM รายงาน");
      downloadWorkbook(workbook, "TNB_PM_Schedule_List_Template.xlsx");
    }
  }
}

// Helper to parse PM Type from text
function parsePMTypeString(text: any): { pmType: PMPlanType; pmTypeName: string; estimatedCost: number } {
  if (!text) return { pmType: "pm1_minor", pmTypeName: PM_TYPE_CONFIG.pm1_minor.nameTh, estimatedCost: 3500 };
  const str = String(text).toLowerCase().trim();

  if (str.includes("pm3") || str.includes("c-service") || str.includes("major") || str.includes("ระยะใหญ่")) {
    return { pmType: "pm3_major", pmTypeName: PM_TYPE_CONFIG.pm3_major.nameTh, estimatedCost: PM_TYPE_CONFIG.pm3_major.estimatedCost };
  }
  if (str.includes("pm2") || str.includes("b-service") || str.includes("intermediate") || str.includes("ระยะปานกลาง")) {
    return { pmType: "pm2_intermediate", pmTypeName: PM_TYPE_CONFIG.pm2_intermediate.nameTh, estimatedCost: PM_TYPE_CONFIG.pm2_intermediate.estimatedCost };
  }
  if (str.includes("annual") || str.includes("ประจำปี") || str.includes("ตรวจสภาพ") || str.includes("dlt") || str.includes("ขนส่ง")) {
    return { pmType: "pm_annual", pmTypeName: PM_TYPE_CONFIG.pm_annual.nameTh, estimatedCost: PM_TYPE_CONFIG.pm_annual.estimatedCost };
  }
  if (str.includes("custom") || str.includes("พิเศษ") || str.includes("เฉพาะกิจ")) {
    return { pmType: "pm_custom", pmTypeName: PM_TYPE_CONFIG.pm_custom.nameTh, estimatedCost: PM_TYPE_CONFIG.pm_custom.estimatedCost };
  }
  return { pmType: "pm1_minor", pmTypeName: PM_TYPE_CONFIG.pm1_minor.nameTh, estimatedCost: PM_TYPE_CONFIG.pm1_minor.estimatedCost };
}

// Helper to parse Month from text or number
function parseMonthNumber(val: any): number {
  if (!val) return 1;
  if (typeof val === "number" && val >= 1 && val <= 12) return val;
  const str = String(val).toLowerCase().trim();
  
  if (str.includes("ม.ค") || str.includes("มกรา") || str.includes("jan") || str === "1" || str === "01") return 1;
  if (str.includes("ก.พ") || str.includes("กุมภา") || str.includes("feb") || str === "2" || str === "02") return 2;
  if (str.includes("มี.ค") || str.includes("มีนา") || str.includes("mar") || str === "3" || str === "03") return 3;
  if (str.includes("เม.ย") || str.includes("เมษา") || str.includes("apr") || str === "4" || str === "04") return 4;
  if (str.includes("พ.ค") || str.includes("พฤษภา") || str.includes("may") || str === "5" || str === "05") return 5;
  if (str.includes("มิ.ย") || str.includes("มิถุนา") || str.includes("jun") || str === "6" || str === "06") return 6;
  if (str.includes("ก.ค") || str.includes("กรกฎา") || str.includes("jul") || str === "7" || str === "07") return 7;
  if (str.includes("ส.ค") || str.includes("สิงหา") || str.includes("aug") || str === "8" || str === "08") return 8;
  if (str.includes("ก.ย") || str.includes("กันยา") || str.includes("sep") || str === "9" || str === "09") return 9;
  if (str.includes("ต.ค") || str.includes("ตุลา") || str.includes("oct") || str === "10") return 10;
  if (str.includes("พ.ย") || str.includes("พฤศจิกา") || str.includes("nov") || str === "11") return 11;
  if (str.includes("ธ.ค") || str.includes("ธันวา") || str.includes("dec") || str === "12") return 12;

  const parsed = parseInt(str, 10);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 1;
}

export interface PMScheduleImportResult {
  success: boolean;
  data: PMMonthlyScheduleItem[];
  errors: string[];
  rawCount: number;
  formatType: "detailed_list" | "matrix_12months";
  summary: {
    totalSchedules: number;
    vehiclesCovered: number;
    monthsCovered: number[];
  };
}

// Master PM Excel Parser supporting both List & Matrix format
export async function parsePMScheduleFile(
  file: File,
  existingVehicles: VehicleRecord[],
  targetYear = 2026
): Promise<PMScheduleImportResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!jsonRows || jsonRows.length === 0) {
      return {
        success: false,
        data: [],
        errors: ["ไฟล์ Excel ไม่มีข้อมูล หรือตารางว่างเปล่า"],
        rawCount: 0,
        formatType: "detailed_list",
        summary: { totalSchedules: 0, vehiclesCovered: 0, monthsCovered: [] }
      };
    }

    // Build vehicle lookup map
    const vehicleLookup = new Map<string, VehicleRecord>();
    existingVehicles.forEach(v => {
      vehicleLookup.set(normalizeLicensePlate(v.licensePlate), v);
      if (v.erpNo) vehicleLookup.set(cleanKey(v.erpNo), v);
      if (v.id) vehicleLookup.set(cleanKey(v.id), v);
    });

    // Detect format type: Is this a 12-Month Matrix or a Detailed List?
    const firstRowKeys = Object.keys(jsonRows[0] || {}).map(k => cleanKey(k));
    const isMatrix = firstRowKeys.some(k => 
      k.includes("มค") || k.includes("jan") || k.includes("มกรา") ||
      k.includes("กพ") || k.includes("feb") || k.includes("กุมภา")
    );

    const parsedSchedules: PMMonthlyScheduleItem[] = [];
    const errors: string[] = [];
    const vehiclesSeen = new Set<string>();
    const monthsSeen = new Set<number>();

    if (isMatrix) {
      // Parse 12-Month Matrix
      jsonRows.forEach((row, rowIdx) => {
        const rowNum = rowIdx + 2;
        const fieldMap: Record<string, any> = {};
        Object.keys(row).forEach(k => { fieldMap[cleanKey(k)] = row[k]; });

        const getVal = (...keys: string[]): any => {
          for (const k of keys) {
            const cleaned = cleanKey(k);
            if (fieldMap[cleaned] !== undefined && fieldMap[cleaned] !== "") return fieldMap[cleaned];
          }
          return "";
        };

        const licensePlate = String(getVal("ทะเบียนรถ", "ทะเบียนใหม่", "ทะเบียน", "licenseplate", "plate") || "").trim();
        if (!licensePlate) {
          return; // Skip non-vehicle or summary rows
        }

        vehiclesSeen.add(licensePlate);
        const normPlate = normalizeLicensePlate(licensePlate);
        const matchedVehicle = vehicleLookup.get(normPlate);

        const erpNo = String(getVal("noerp", "erpno", "erp", "no", "ลำดับ") || matchedVehicle?.erpNo || `TNB-${rowIdx + 1}`);
        const brand = String(getVal("ยี่ห้อ", "brand") || matchedVehicle?.vehicleBrand || "ISUZU");
        const model = String(getVal("แบบรุ่น", "รุ่น", "model") || matchedVehicle?.vehicleModel || "GXZ77");
        const typeRaw = getVal("ประเภทรถ", "ประเภท", "type");
        const vehicleType: VehicleType = matchedVehicle?.vehicleType || parseVehicleType(typeRaw);
        const province = String(getVal("จังหวัด", "province") || matchedVehicle?.province || "กรุงเทพมหานคร");
        const driverName = String(getVal("พนักงานขับรถ", "คนขับ", "driver") || matchedVehicle?.driverName || "-");
        const department = String(getVal("ฝ่ายสังกัด", "ฝ่าย", "department") || matchedVehicle?.department || "ฝ่ายขนส่ง");
        const vehicleId = matchedVehicle?.id || `VEH-IMP-${normPlate || rowIdx}`;

        // Loop 12 months
        for (let m = 1; m <= 12; m++) {
          const monthAliases = [
            `มค${m}`, `กพ${m}`, `มีค${m}`, `เมย${m}`, `พค${m}`, `มิย${m}`, `กค${m}`, `สค${m}`, `กย${m}`, `ตค${m}`, `พย${m}`, `ธค${m}`,
            `m${m}`, `month${m}`, `เดือน${m}`
          ];
          
          let cellVal = "";
          // Check columns
          Object.keys(fieldMap).forEach(k => {
            if (m === 1 && (k.includes("มค") || k.includes("jan") || k.includes("มกรา"))) cellVal = fieldMap[k];
            else if (m === 2 && (k.includes("กพ") || k.includes("feb") || k.includes("กุมภา"))) cellVal = fieldMap[k];
            else if (m === 3 && (k.includes("มีค") || k.includes("mar") || k.includes("มีนา"))) cellVal = fieldMap[k];
            else if (m === 4 && (k.includes("เมย") || k.includes("apr") || k.includes("เมษา"))) cellVal = fieldMap[k];
            else if (m === 5 && (k.includes("พค") || k.includes("may") || k.includes("พฤษภา"))) cellVal = fieldMap[k];
            else if (m === 6 && (k.includes("มิย") || k.includes("jun") || k.includes("มิถุนา"))) cellVal = fieldMap[k];
            else if (m === 7 && (k.includes("กค") || k.includes("jul") || k.includes("กรกฎา"))) cellVal = fieldMap[k];
            else if (m === 8 && (k.includes("สค") || k.includes("aug") || k.includes("สิงหา"))) cellVal = fieldMap[k];
            else if (m === 9 && (k.includes("กย") || k.includes("sep") || k.includes("กันยา"))) cellVal = fieldMap[k];
            else if (m === 10 && (k.includes("ตค") || k.includes("oct") || k.includes("ตุลา"))) cellVal = fieldMap[k];
            else if (m === 11 && (k.includes("พย") || k.includes("nov") || k.includes("พฤศจิกา"))) cellVal = fieldMap[k];
            else if (m === 12 && (k.includes("ธค") || k.includes("dec") || k.includes("ธันวา"))) cellVal = fieldMap[k];
          });

          if (cellVal && cellVal !== "-" && String(cellVal).trim() !== "") {
            const cellStr = String(cellVal).trim();
            const { pmType, pmTypeName, estimatedCost } = parsePMTypeString(cellStr);
            monthsSeen.add(m);

            // Extract day if present in parentheses e.g. "PM1 (15)" -> day 15
            const dayMatch = cellStr.match(/\((\d{1,2})\)/);
            const day = dayMatch ? parseInt(dayMatch[1], 10) : 15;
            const safeDay = day >= 1 && day <= 28 ? String(day).padStart(2, "0") : "15";
            const plannedDate = `${targetYear}-${String(m).padStart(2, "0")}-${safeDay}`;

            let status: PMPlanStatus = "planned";
            if (cellStr.includes("✓") || cellStr.includes("เสร็จ") || cellStr.includes("comp")) status = "completed";
            else if (cellStr.includes("⚡") || cellStr.includes("กำลัง") || cellStr.includes("prog")) status = "in_progress";
            else if (cellStr.includes("⚠") || cellStr.includes("เกิน") || cellStr.includes("over")) status = "overdue";

            const code = `PM-${targetYear}-${String(m).padStart(2, "0")}-${String(parsedSchedules.length + 1).padStart(3, "0")}`;
            const cfg = PM_TYPE_CONFIG[pmType];

            const checklists = (cfg?.standardChecklist || []).map((item, cIdx) => ({
              id: `c-${m}-${cIdx}`,
              item,
              category: pmType,
              isChecked: status === "completed"
            }));

            parsedSchedules.push({
              id: `pm-imp-${targetYear}-${vehicleId}-${m}`,
              pmPlanCode: code,
              isoDocNumber: ISO_DOCUMENT_REGISTRY.pm_plan.fullCode,
              vehicleId,
              licensePlate,
              erpNo,
              province,
              vehicleBrand: brand,
              vehicleModel: model,
              vehicleType,
              carrierCompany: "TNB",
              department,
              driverName,
              year: targetYear,
              month: m,
              plannedDate,
              pmType,
              pmTypeName,
              targetMileage: (matchedVehicle?.currentMileage || 50000) + (m * 5000),
              lastServiceMileage: matchedVehicle?.currentMileage || 0,
              status,
              estimatedCost,
              actualCost: status === "completed" ? estimatedCost : undefined,
              assignedTechnician: "ทีมช่างศูนย์บริการ TNB",
              checklists,
              notes: `นำเข้าจากตาราง Matrix 12 เดือน (${cellStr})`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      });
    } else {
      // Parse Detailed List Format
      jsonRows.forEach((row, rowIdx) => {
        const rowNum = rowIdx + 2;
        const fieldMap: Record<string, any> = {};
        Object.keys(row).forEach(k => { fieldMap[cleanKey(k)] = row[k]; });

        const getVal = (...keys: string[]): any => {
          for (const k of keys) {
            const cleaned = cleanKey(k);
            if (fieldMap[cleaned] !== undefined && fieldMap[cleaned] !== "") return fieldMap[cleaned];
          }
          return "";
        };

        const licensePlate = String(getVal("ทะเบียนรถ", "ทะเบียนใหม่", "ทะเบียน", "licenseplate", "plate") || "").trim();
        if (!licensePlate) {
          errors.push(`แถวที่ ${rowNum}: ไม่มีข้อมูลทะเบียนรถ (ข้าม)`);
          return;
        }

        vehiclesSeen.add(licensePlate);
        const normPlate = normalizeLicensePlate(licensePlate);
        const matchedVehicle = vehicleLookup.get(normPlate);

        const yearRaw = getVal("ปี", "year");
        const year = parseInt(String(yearRaw), 10) || targetYear;

        const monthRaw = getVal("เดือน", "month");
        const month = parseMonthNumber(monthRaw);
        monthsSeen.add(month);

        let plannedDate = String(getVal("วันที่ตามแผน", "วันที่", "planneddate", "date") || "").trim();
        if (!plannedDate || plannedDate.length < 8) {
          plannedDate = `${year}-${String(month).padStart(2, "0")}-15`;
        }

        const typeVal = getVal("ประเภทงานpm", "ประเภทpm", "pmtype", "type", "ประเภทงาน");
        const { pmType, pmTypeName, estimatedCost: defCost } = parsePMTypeString(typeVal);

        const parseNum = (v: any, fallback = 0): number => {
          if (typeof v === "number") return v;
          if (!v) return fallback;
          const cleaned = String(v).replace(/[^0-9.-]/g, "");
          const num = parseFloat(cleaned);
          return isNaN(num) ? fallback : num;
        };

        const estimatedCost = parseNum(getVal("ประมาณการค่าใช้จ่ายบาท", "ประมาณการค่าใช้จ่าย", "estimatedcost", "cost"), defCost);
        const targetMileage = parseNum(getVal("เป้าหมายระยะทางกม", "เป้าหมายระยะทาง", "targetmileage", "mileage"), 50000);

        const pmPlanCode = String(getVal("รหัสแผนpm", "pmcode", "code") || `PM-${year}-${String(month).padStart(2, "0")}-${String(parsedSchedules.length + 1).padStart(3, "0")}`).trim();
        const isoDocNumber = String(getVal("เลขที่เอกสารควบคุมiso", "iso", "docno") || ISO_DOCUMENT_REGISTRY.pm_plan.fullCode).trim();
        const assignedTechnician = String(getVal("นายช่างผู้รับผิดชอบ", "ช่างผู้รับผิดชอบ", "ช่าง", "technician") || "ทีมช่างศูนย์บริการ TNB").trim();
        const notes = String(getVal("หมายเหตุ", "notes", "remark") || "").trim();

        const statusRaw = String(getVal("สถานะ", "status")).toLowerCase();
        let status: PMPlanStatus = "planned";
        if (statusRaw.includes("comp") || statusRaw.includes("เสร็จ") || statusRaw.includes("สำเร็จ")) status = "completed";
        else if (statusRaw.includes("prog") || statusRaw.includes("กำลัง") || statusRaw.includes("ซ่อม")) status = "in_progress";
        else if (statusRaw.includes("over") || statusRaw.includes("เกิน")) status = "overdue";
        else if (statusRaw.includes("canc") || statusRaw.includes("ยกเลิก")) status = "cancelled";

        const cfg = PM_TYPE_CONFIG[pmType];
        const checklists = (cfg?.standardChecklist || []).map((item, cIdx) => ({
          id: `c-${month}-${cIdx}`,
          item,
          category: pmType,
          isChecked: status === "completed"
        }));

        parsedSchedules.push({
          id: `pm-imp-${year}-${licensePlate}-${month}-${rowIdx}`,
          pmPlanCode,
          isoDocNumber,
          vehicleId: matchedVehicle?.id || `VEH-IMP-${normPlate || rowIdx}`,
          licensePlate,
          erpNo: String(getVal("noerp", "erpno", "erp", "no") || matchedVehicle?.erpNo || "").trim(),
          province: String(getVal("จังหวัด", "province") || matchedVehicle?.province || "กรุงเทพมหานคร").trim(),
          vehicleBrand: String(getVal("ยี่ห้อ", "brand") || matchedVehicle?.vehicleBrand || "ISUZU").trim(),
          vehicleModel: String(getVal("แบบรุ่น", "รุ่น", "model") || matchedVehicle?.vehicleModel || "GXZ77").trim(),
          vehicleType: matchedVehicle?.vehicleType || parseVehicleType(getVal("ประเภทรถ", "ประเภท")),
          carrierCompany: String(getVal("ประกอบการ", "บริษัท") || matchedVehicle?.carrierCompany || "TNB").trim(),
          department: String(getVal("ฝ่ายสังกัด", "ฝ่าย", "department") || matchedVehicle?.department || "ฝ่ายขนส่ง").trim(),
          driverName: String(getVal("พนักงานขับรถ", "คนขับ", "driver") || matchedVehicle?.driverName || "-").trim(),
          year,
          month,
          plannedDate,
          pmType,
          pmTypeName,
          targetMileage,
          lastServiceMileage: matchedVehicle?.currentMileage || 0,
          status,
          estimatedCost,
          actualCost: status === "completed" ? estimatedCost : undefined,
          assignedTechnician,
          checklists,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }

    return {
      success: parsedSchedules.length > 0,
      data: parsedSchedules,
      errors,
      rawCount: jsonRows.length,
      formatType: isMatrix ? "matrix_12months" : "detailed_list",
      summary: {
        totalSchedules: parsedSchedules.length,
        vehiclesCovered: vehiclesSeen.size,
        monthsCovered: Array.from(monthsSeen).sort((a, b) => a - b)
      }
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      errors: [`เกิดข้อผิดพลาดในการประมวลผลไฟล์ Excel: ${err.message || String(err)}`],
      rawCount: 0,
      formatType: "detailed_list",
      summary: { totalSchedules: 0, vehiclesCovered: 0, monthsCovered: [] }
    };
  }
}

// ----------------------------------------------------
// 7. MASTER FULL DATABASE BACKUP EXPORT (6-IN-1 WORKBOOK)
// ----------------------------------------------------
export function exportFullDatabaseBackupToExcel(data: {
  vehicles: VehicleRecord[];
  inventory: InventoryItem[];
  tickets: RepairTicket[];
  receipts: GoodsReceiptRecord[];
  requisitions: GoodsRequisitionRecord[];
  pmSchedules?: PMMonthlyScheduleItem[];
}, filename = "TNB_Fleet_Master_Full_Backup") {
  const workbook = XLSX.utils.book_new();

  // 1. Vehicles Sheet (TNB-MT-REG-001)
  const wsVehicles = XLSX.utils.json_to_sheet(data.vehicles.map(mapVehicleToExportRow));
  XLSX.utils.book_append_sheet(workbook, wsVehicles, "1. สารระบบรถ (27 รายการ)");

  // 2. PM Plan Sheet (TNB-MT-PLN-001)
  if (data.pmSchedules && data.pmSchedules.length > 0) {
    const wsPM = XLSX.utils.json_to_sheet(data.pmSchedules.map(mapPMScheduleToExportRow));
    XLSX.utils.book_append_sheet(workbook, wsPM, "2. แผน PM รถ (TNB-MT-PLN)");
  }

  // 3. Inventory Sheet (TNB-MT-INV-001)
  const wsInventory = XLSX.utils.json_to_sheet(data.inventory.map(mapInventoryToExportRow));
  XLSX.utils.book_append_sheet(workbook, wsInventory, "3. คลังสต็อกอะไหล่");

  // 4. Tickets Sheet (TNB-MT-WO-001)
  const wsTickets = XLSX.utils.json_to_sheet(data.tickets.map(mapTicketToExportRow));
  XLSX.utils.book_append_sheet(workbook, wsTickets, "4. ใบแจ้งซ่อม & Work Order");

  // 5. Receipts Sheet (TNB-MT-GR-001)
  const wsReceipts = XLSX.utils.json_to_sheet(data.receipts.flatMap(mapReceiptToExportRows));
  XLSX.utils.book_append_sheet(workbook, wsReceipts, "5. ประวัติรับเข้าสต็อก (GR)");

  // 6. Requisitions Sheet (TNB-MT-GI-001)
  const wsRequisitions = XLSX.utils.json_to_sheet(data.requisitions.flatMap(mapRequisitionToExportRows));
  XLSX.utils.book_append_sheet(workbook, wsRequisitions, "6. ประวัติเบิกจ่าย (REQ)");

  downloadWorkbook(workbook, `${filename}_ISO_Master_${new Date().toISOString().split("T")[0]}`);
}

