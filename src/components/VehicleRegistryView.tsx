import React, { useState, useMemo } from "react";
import { 
  Truck, 
  Search, 
  Plus, 
  Filter, 
  Wrench, 
  Car, 
  Calendar, 
  Gauge, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Edit2, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Fuel,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Table,
  LayoutGrid,
  Radio,
  Package,
  FileSpreadsheet,
  Info,
  DollarSign,
  Printer,
  Compass,
  Upload,
  Download,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDown10,
  ArrowUp01,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal
} from "lucide-react";
import { VehicleRecord, VehicleType, VehicleStatus, RepairTicket } from "../types";
import { VEHICLE_TYPE_LABELS, TNB_DEPARTMENTS } from "../data/categories";
import { VehicleImportModal } from "./VehicleImportModal";
import { exportVehiclesToExcel, exportVehiclesToCSV, downloadVehicleTemplate, normalizeLicensePlate } from "../utils/excelImportExport";

export type VehicleSortField = 
  | "erp_asc"       // No. ERP จากน้อยไปมาก (1 -> 99, A -> Z)
  | "erp_desc"      // No. ERP จากมากไปน้อย (99 -> 1, Z -> A)
  | "plate_asc"     // ทะเบียนรถ (ก-ฮ)
  | "plate_desc"    // ทะเบียนรถ (ฮ-ก)
  | "carrier_asc"   // ผู้ประกอบการ (TNB, BBNP...)
  | "brand_asc"     // ยี่ห้อรถ (A-Z)
  | "tax_asc"       // วันหมดอายุภาษี (ใกล้หมดก่อน)
  | "created_desc"  // ล่าสุด
  | "created_asc";  // เก่าสุด

// Natural alphanumeric/numeric ERP number comparator
export const compareErpNo = (aStr?: string, bStr?: string, direction: "asc" | "desc" = "asc") => {
  const a = (aStr || "").trim();
  const b = (bStr || "").trim();

  // Empty values always go to the bottom
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // Use natural collation with numeric: true (e.g., 1, 2, 10, T10-NO.01, T10-NO.02)
  const collator = new Intl.Collator("th", { numeric: true, sensitivity: "base" });
  const cmp = collator.compare(a, b);
  return direction === "asc" ? cmp : -cmp;
};

interface VehicleRegistryViewProps {
  vehicles: VehicleRecord[];
  tickets: RepairTicket[];
  onAddVehicle: (vehicle: any) => void;
  onUpdateVehicle: (vehicle: VehicleRecord) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onRequestRepairForVehicle?: (vehicle: VehicleRecord) => void;
  onQuickRepair?: (vehicle: VehicleRecord) => void;
  onSelectTicket?: (ticket: RepairTicket) => void;
  onBulkImportVehicles?: (importedVehicles: VehicleRecord[], mode: "upsert" | "append" | "replace") => void;
  onDeleteAllVehicles?: () => void;
  onRestoreAllVehicles?: () => void;
}

export const VehicleRegistryView: React.FC<VehicleRegistryViewProps> = ({
  vehicles,
  tickets,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onRequestRepairForVehicle,
  onQuickRepair,
  onSelectTicket,
  onBulkImportVehicles,
  onDeleteAllVehicles,
  onRestoreAllVehicles
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "spreadsheet">("grid");
  const [sortBy, setSortBy] = useState<VehicleSortField>("erp_asc");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<"yellow" | "pink" | "cyan" | "green">("yellow");

  // Modal State for Import & Export
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Modal State for Vehicle Detail View
  const [viewingVehicle, setViewingVehicle] = useState<VehicleRecord | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleRecord | null>(null);

  // Form State with ALL 27 items from standard image
  const [formData, setFormData] = useState({
    // Group 1: Yellow - ข้อมูลยานพาหนะหลัก (Core Vehicle Info)
    carrierCompany: "TNB",
    licensePlate: "",
    erpNo: "",
    vehicleType: "tractor_10w" as VehicleType,
    vehicleBrand: "ISUZU",
    vehicleModel: "",
    chassisNumber: "",
    engineNumber: "",
    color: "ขาว",
    province: "กรุงเทพมหานคร",
    department: "ฝ่ายขนส่ง",
    driverName: "",
    driverId: "",
    currentMileage: 0,
    status: "active" as VehicleStatus,
    fuelType: "diesel" as any,
    year: new Date().getFullYear(),

    // Group 2: Pink - ภาษี & พ.ร.บ. (Tax & Act/CMI Insurance)
    registrationDate: "",
    taxExpiryDate: "",
    taxRate: "",
    actInsuranceFee: "",
    actInsuranceExpiry: "",
    actInsuranceCompany: "วิริยะประกันภัย",

    // Group 3: Cyan - ประกันภัยรถ (Motor Vehicle Insurance)
    vehicleInsuranceCompany: "อลิอันซ์ อยุธยา",
    vehicleInsuranceType: "ชั้น 1",
    vehicleInsuranceCoverage: "1,000,000",
    vehicleInsuranceStartDate: "",
    vehicleInsuranceEndDate: "",
    vehicleInsurancePremium: "",

    // Group 4: Green - GPS & ประกันภัยสินค้า (GPS & Cargo Insurance)
    gpsProvider: "CARTRACK",
    cargoInsuranceCompany: "ทิพยประกันภัย",
    cargoInsuranceCoverage: "1,000,000",
    cargoInsuranceStartDate: "",
    cargoInsuranceEndDate: "",
    cargoInsurancePremium: "",

    notes: ""
  });

  const handleQuickRepairAction = onQuickRepair || onRequestRepairForVehicle || (() => {});

  // Detection of duplicate license plates in current system database
  const duplicatePlateInfo = useMemo(() => {
    const map = new Map<string, VehicleRecord[]>();
    vehicles.forEach(v => {
      const norm = normalizeLicensePlate(v.licensePlate);
      if (!norm) return;
      const list = map.get(norm) || [];
      list.push(v);
      map.set(norm, list);
    });

    const dupMap = new Map<string, number>(); // normalizedPlate -> count
    const dupGroups: { norm: string; samplePlate: string; count: number; vehicles: VehicleRecord[] }[] = [];
    let totalDupVehiclesCount = 0;

    map.forEach((list, norm) => {
      if (list.length > 1) {
        dupMap.set(norm, list.length);
        dupGroups.push({
          norm,
          samplePlate: list[0].licensePlate,
          count: list.length,
          vehicles: list
        });
        totalDupVehiclesCount += list.length;
      }
    });

    return {
      dupMap,
      dupGroups,
      totalDupPlatesCount: dupGroups.length,
      totalDupVehiclesCount
    };
  }, [vehicles]);

  // Calculate vehicle status based on active repair tickets + duplicate flag
  const enrichedVehicles = useMemo(() => {
    return vehicles.map(v => {
      const activeTickets = tickets.filter(
        t => t.licensePlate.toLowerCase().trim() === v.licensePlate.toLowerCase().trim() && 
             t.status !== "completed" && t.status !== "cancelled"
      );
      const isUnderRepair = activeTickets.length > 0;
      const normPlate = normalizeLicensePlate(v.licensePlate);
      const isSystemDup = duplicatePlateInfo.dupMap.has(normPlate);
      const dupCount = duplicatePlateInfo.dupMap.get(normPlate) || 1;

      return {
        ...v,
        dynamicStatus: isUnderRepair ? ("under_repair" as VehicleStatus) : v.status,
        activeTicketsCount: activeTickets.length,
        latestActiveTicket: activeTickets[0] || null,
        isSystemDup,
        dupCount
      };
    });
  }, [vehicles, tickets, duplicatePlateInfo]);

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => { if (v.department) set.add(v.department); });
    return Array.from(set);
  }, [vehicles]);

  // Filtered & Sorted vehicles
  const filteredVehicles = useMemo(() => {
    const list = enrichedVehicles.filter(v => {
      const matchSearch = 
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.erpNo && v.erpNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.carrierCompany && v.carrierCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicleBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.chassisNumber && v.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.engineNumber && v.engineNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.driverName && v.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.driverId && v.driverId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.department && v.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.gpsProvider && v.gpsProvider.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === "all" || v.vehicleType === selectedType;
      const matchStatus = 
        selectedStatus === "all" ? true :
        selectedStatus === "duplicate" ? v.isSystemDup :
        v.dynamicStatus === selectedStatus;
      const matchDept = selectedDepartment === "all" || v.department === selectedDepartment;

      return matchSearch && matchType && matchStatus && matchDept;
    });

    // Natural multi-criteria sorting
    return [...list].sort((a, b) => {
      if (sortBy === "erp_asc") {
        return compareErpNo(a.erpNo, b.erpNo, "asc");
      }
      if (sortBy === "erp_desc") {
        return compareErpNo(a.erpNo, b.erpNo, "desc");
      }
      if (sortBy === "plate_asc") {
        return (a.licensePlate || "").localeCompare(b.licensePlate || "", "th");
      }
      if (sortBy === "plate_desc") {
        return (b.licensePlate || "").localeCompare(a.licensePlate || "", "th");
      }
      if (sortBy === "carrier_asc") {
        return (a.carrierCompany || "").localeCompare(b.carrierCompany || "", "th");
      }
      if (sortBy === "brand_asc") {
        return (a.vehicleBrand || "").localeCompare(b.vehicleBrand || "");
      }
      if (sortBy === "tax_asc") {
        return (a.taxExpiryDate || "9999-99-99").localeCompare(b.taxExpiryDate || "9999-99-99");
      }
      if (sortBy === "created_asc") {
        return (a.createdAt || "").localeCompare(b.createdAt || "");
      }
      // default: created_desc
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  }, [enrichedVehicles, searchQuery, selectedType, selectedStatus, selectedDepartment, sortBy]);

  // Counts
  const totalCount = vehicles.length;
  const activeCount = enrichedVehicles.filter(v => v.dynamicStatus === "active").length;
  const repairCount = enrichedVehicles.filter(v => v.dynamicStatus === "under_repair").length;
  const maintenanceCount = enrichedVehicles.filter(v => v.dynamicStatus === "maintenance_due").length;
  const duplicateCount = duplicatePlateInfo.totalDupVehiclesCount;

  // Real-time check for duplicate license plate in add/edit form
  const duplicateFormVehicle = useMemo(() => {
    const plate = formData.licensePlate.trim();
    if (!plate) return null;
    const norm = normalizeLicensePlate(plate);
    return vehicles.find(v => {
      if (editingVehicle && v.id === editingVehicle.id) return false;
      return normalizeLicensePlate(v.licensePlate) === norm;
    });
  }, [formData.licensePlate, vehicles, editingVehicle]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setActiveFormTab("yellow");
    setFormData({
      carrierCompany: "TNB",
      licensePlate: "",
      erpNo: (vehicles.length + 1).toString(),
      vehicleType: "tractor_10w",
      vehicleBrand: "ISUZU",
      vehicleModel: "GXZ77NXXFV (หัวลาก 10 ล้อ 360)",
      chassisNumber: "",
      engineNumber: "",
      color: "ขาว",
      province: "กรุงเทพมหานคร",
      department: "ฝ่ายขนส่ง",
      driverName: "",
      driverId: "",
      currentMileage: 50000,
      status: "active",
      fuelType: "diesel",
      year: new Date().getFullYear(),
      registrationDate: "2566-01-15",
      taxExpiryDate: "2570-01-15",
      taxRate: "1,950.00",
      actInsuranceFee: "1,830.00",
      actInsuranceExpiry: "2570-01-15",
      actInsuranceCompany: "วิริยะประกันภัย",
      vehicleInsuranceCompany: "อลิอันซ์ อยุธยา",
      vehicleInsuranceType: "ชั้น 1",
      vehicleInsuranceCoverage: "1,000,000",
      vehicleInsuranceStartDate: "2569-01-15",
      vehicleInsuranceEndDate: "2570-01-15",
      vehicleInsurancePremium: "24,500.00",
      gpsProvider: "CARTRACK",
      cargoInsuranceCompany: "ทิพยประกันภัย",
      cargoInsuranceCoverage: "1,000,000",
      cargoInsuranceStartDate: "2569-01-15",
      cargoInsuranceEndDate: "2570-01-15",
      cargoInsurancePremium: "8,500.00",
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: VehicleRecord) => {
    setEditingVehicle(vehicle);
    setActiveFormTab("yellow");
    setFormData({
      carrierCompany: vehicle.carrierCompany || "TNB",
      licensePlate: vehicle.licensePlate,
      erpNo: vehicle.erpNo || "",
      vehicleType: vehicle.vehicleType,
      vehicleBrand: vehicle.vehicleBrand,
      vehicleModel: vehicle.vehicleModel,
      chassisNumber: vehicle.chassisNumber || "",
      engineNumber: vehicle.engineNumber || "",
      color: vehicle.color || "ขาว",
      province: vehicle.province || "กรุงเทพมหานคร",
      department: vehicle.department || "ฝ่ายขนส่ง",
      driverName: vehicle.driverName || "",
      driverId: vehicle.driverId || "",
      currentMileage: vehicle.currentMileage || 0,
      status: vehicle.status || "active",
      fuelType: vehicle.fuelType || "diesel",
      year: vehicle.year || new Date().getFullYear(),
      registrationDate: vehicle.registrationDate || "",
      taxExpiryDate: vehicle.taxExpiryDate || "",
      taxRate: vehicle.taxRate || "",
      actInsuranceFee: vehicle.actInsuranceFee || "",
      actInsuranceExpiry: vehicle.actInsuranceExpiry || "",
      actInsuranceCompany: vehicle.actInsuranceCompany || "",
      vehicleInsuranceCompany: vehicle.vehicleInsuranceCompany || "",
      vehicleInsuranceType: vehicle.vehicleInsuranceType || "ชั้น 1",
      vehicleInsuranceCoverage: vehicle.vehicleInsuranceCoverage || "",
      vehicleInsuranceStartDate: vehicle.vehicleInsuranceStartDate || "",
      vehicleInsuranceEndDate: vehicle.vehicleInsuranceEndDate || "",
      vehicleInsurancePremium: vehicle.vehicleInsurancePremium || "",
      gpsProvider: vehicle.gpsProvider || "CARTRACK",
      cargoInsuranceCompany: vehicle.cargoInsuranceCompany || "",
      cargoInsuranceCoverage: vehicle.cargoInsuranceCoverage || "",
      cargoInsuranceStartDate: vehicle.cargoInsuranceStartDate || "",
      cargoInsuranceEndDate: vehicle.cargoInsuranceEndDate || "",
      cargoInsurancePremium: vehicle.cargoInsurancePremium || "",
      notes: vehicle.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.licensePlate.trim() || !formData.vehicleBrand.trim()) {
      alert("กรุณากรอกข้อมูลเลขทะเบียนรถและยี่ห้อให้ครบถ้วน");
      return;
    }

    // Duplicate check confirmation
    if (duplicateFormVehicle) {
      const confirmSave = window.confirm(
        `⚠️ แจ้งเตือน: เลขทะเบียนซ้ำกับข้อมูลที่มีอยู่ในระบบ!\n\n` +
        `เลขทะเบียน "${formData.licensePlate}" ซ้ำกับ:\n` +
        `• ERP No.: ${duplicateFormVehicle.erpNo || "-"}\n` +
        `• ยี่ห้อ/รุ่น: ${duplicateFormVehicle.vehicleBrand} ${duplicateFormVehicle.vehicleModel}\n` +
        `• ผู้ประกอบการ: ${duplicateFormVehicle.carrierCompany}\n\n` +
        `คุณต้องการยืนยันการบันทึกหรือไม่?`
      );
      if (!confirmSave) {
        return;
      }
    }

    const nowIso = new Date().toISOString();

    if (editingVehicle) {
      onUpdateVehicle({
        ...editingVehicle,
        ...formData,
        updatedAt: nowIso
      });
    } else {
      const newVehicle: VehicleRecord = {
        id: `VEH-${Date.now().toString().slice(-4)}`,
        ...formData,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      onAddVehicle(newVehicle);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (vehicle: VehicleRecord) => {
    setVehicleToDelete(vehicle);
  };

  const handleConfirmDeleteVehicle = () => {
    if (vehicleToDelete) {
      onDeleteVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            พร้อมใช้งาน
          </span>
        );
      case "under_repair":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Wrench className="w-3 h-3 mr-1 text-rose-600" />
            กำลังซ่อมบำรุง
          </span>
        );
      case "maintenance_due":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            ถึงรอบตรวจเช็ค
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            ระงับใช้งาน
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Hero */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-blue-600/30 p-3 rounded-xl border border-blue-500/30 text-blue-400 shadow-inner">
              <Truck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight">สารระบบทะเบียนรถ TNB Fleet Master</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase shadow-xs">
                  มาตรฐาน 27 รายการ
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  ISO: TNB-MT-REG-001-Rev.02
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {totalCount} คันในระบบ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ศูนย์ข้อมูลทะเบียนรถ, ภาษี & พ.ร.บ., ประกันภัยรถยนต์, ประกันภัยสินค้า และระบบ GPS ครบถ้วนตามมาตรฐานงานขนส่ง ISO 39001
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap">
            {/* Import Button */}
            <button
              id="btn-import-vehicles"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 shadow-md transition-all flex items-center space-x-2"
              title="นำเข้าข้อมูลรถจากไฟล์ Excel (.xlsx, .xls) หรือ CSV"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>นำเข้าข้อมูล (Import)</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="btn-export-vehicles-dropdown"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 border border-emerald-600"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>ส่งออก (Export)</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
              </button>

              {isExportMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsExportMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      exportVehiclesToExcel(filteredVehicles);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 flex items-center space-x-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="font-bold">ส่งออก Excel (.xlsx)</div>
                      <div className="text-[10px] text-slate-500">27 รายการมาตรฐาน ({filteredVehicles.length} คัน)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportVehiclesToCSV(filteredVehicles);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-800 flex items-center space-x-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-bold">ส่งออก CSV (.csv)</div>
                      <div className="text-[10px] text-slate-500">UTF-8 สำหรับ Excel / ระบบอื่น</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      downloadVehicleTemplate("xlsx");
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-amber-50 text-slate-800 hover:text-amber-900 flex items-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-amber-900">โหลด Template Excel</div>
                      <div className="text-[10px] text-amber-700">แบบฟอร์มนำเข้า 27 รายการ</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Restore Full Fleet Button */}
            {onRestoreAllVehicles && (
              <button
                id="btn-restore-all-vehicles"
                onClick={() => {
                  if (window.confirm("คุณต้องการดึงข้อมูลรถจริงทั้งหมดของ TNB (108 คัน: หัวลาก 10 ล้อ, รถบรรทุก 6 ล้อ, หางพ่วง, รถโมบายเซอร์วิส, โฟล์คลิฟต์) พร้อมข้อมูล 27 รายการ ครบถ้วนกลับเข้าสู่ระบบหรือไม่?")) {
                    onRestoreAllVehicles();
                  }
                }}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
                title="ดึงข้อมูลสารระบบรถจริง TNB ทั้งหมด 108 คัน (หัวลาก, 6 ล้อ, หางพ่วง, โมบายเซอร์วิส, โฟล์คลิฟต์)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>ดึงข้อมูลรถทั้งหมด (108 คัน)</span>
              </button>
            )}

            {/* Add New Button */}
            <button
              id="btn-add-new-vehicle"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>+ เพิ่มทะเบียนรถใหม่ (27 รายการ)</span>
            </button>

            {/* Clear All Vehicles Button (if vehicles exist) */}
            {vehicles.length > 0 && onDeleteAllVehicles && (
              <button
                id="btn-delete-all-vehicles"
                onClick={onDeleteAllVehicles}
                className="px-3 py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-xl text-xs font-bold border border-rose-800/80 shadow-md transition-all flex items-center space-x-1.5"
                title="ลบข้อมูลทะเบียนรถทั้งหมดในระบบ"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>ลบข้อมูลรถทั้งหมด</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Standard Reference Color Categories Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0 shadow-xs"></div>
            <div>
              <div className="font-bold text-yellow-300 text-[11px]">1. ข้อมูลยานพาหนะหลัก</div>
              <div className="text-[10px] text-slate-300">ทะเบียน, ERP, ยี่ห้อ, คัสซี, เครื่องยนต์, สี</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-pink-400/10 border border-pink-400/30 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-400 shrink-0 shadow-xs"></div>
            <div>
              <div className="font-bold text-pink-300 text-[11px]">2. ภาษี & พ.ร.บ.</div>
              <div className="text-[10px] text-slate-300">วันจด, วันหมดอายุภาษี, ค่าพรบ, บ.พรบ</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shrink-0 shadow-xs"></div>
            <div>
              <div className="font-bold text-cyan-300 text-[11px]">3. ประกันภัยรถยนต์</div>
              <div className="text-[10px] text-slate-300">บ.ประกันรถ, ชั้น 1/3, วงเงิน, วันเริ่ม-สิ้นสุด, เบี้ย</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-xs"></div>
            <div>
              <div className="font-bold text-emerald-300 text-[11px]">4. GPS & ประกันสินค้า</div>
              <div className="text-[10px] text-slate-300">GPS Cartrack, บ.ประกันสินค้า, วงเงิน, เบี้ย</div>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM DUPLICATE ALERT BANNER */}
      {duplicatePlateInfo.totalDupPlatesCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-rose-950 text-sm flex items-center gap-2">
                <span>แจ้งเตือนสารระบบ: ตรวจพบเลขทะเบียนซ้ำกันในระบบ {duplicatePlateInfo.totalDupPlatesCount} ทะเบียน (รวม {duplicatePlateInfo.totalDupVehiclesCount} คัน)</span>
                <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">
                  ตรวจสอบความถูกต้อง
                </span>
              </div>
              <div className="text-xs text-rose-800 mt-1">
                มีข้อมูลรถในระบบที่ใช้เลขทะเบียนซ้ำกัน:{" "}
                <span className="font-semibold">
                  {duplicatePlateInfo.dupGroups.slice(0, 5).map(g => `${g.samplePlate} (${g.count} คัน)`).join(", ")}
                  {duplicatePlateInfo.dupGroups.length > 5 ? ` และอีก ${duplicatePlateInfo.dupGroups.length - 5} ทะเบียน` : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === "duplicate" ? "all" : "duplicate")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs transition-all ${
                selectedStatus === "duplicate" 
                  ? "bg-rose-700 text-white ring-2 ring-rose-600 shadow-md" 
                  : "bg-white text-rose-800 border border-rose-300 hover:bg-rose-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{selectedStatus === "duplicate" ? "แสดงรถทั้งหมด" : `กรองดูเฉพาะทะเบียนซ้ำ (${duplicatePlateInfo.totalDupVehiclesCount} คัน)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาทะเบียน, No. ERP, ประกอบการ, ยี่ห้อ, รุ่น, คัสซี, เครื่องยนต์, พขร., หรือ GPS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">ทุกแผนก / ฝ่ายสังกัด ({vehicles.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-60">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as VehicleSortField)}
                className="w-full py-2 pl-8 pr-3 text-xs rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 font-bold text-blue-950 shadow-xs"
              >
                <option value="erp_asc">🔢 No. ERP: จากน้อย → มาก (1, 2, 10...)</option>
                <option value="erp_desc">🔢 No. ERP: จากมาก → น้อย (...10, 2, 1)</option>
                <option value="plate_asc">🚗 ทะเบียนรถ: ก → ฮ (A → Z)</option>
                <option value="plate_desc">🚗 ทะเบียนรถ: ฮ → ก (Z → A)</option>
                <option value="carrier_asc">🏢 ประกอบการ: A → Z (TNB, BBNP...)</option>
                <option value="brand_asc">🚚 ยี่ห้อรถ: A → Z</option>
                <option value="tax_asc">📅 วันหมดอายุภาษี: ใกล้หมดก่อน</option>
                <option value="created_desc">🕒 รายการบันทึกล่าสุด</option>
                <option value="created_asc">🕒 รายการแรกสุด</option>
              </select>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ด</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>ตารางสรุป</span>
            </button>
            <button
              onClick={() => setViewMode("spreadsheet")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${
                viewMode === "spreadsheet" ? "bg-amber-400 text-slate-950 shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="ตารางมาตรฐาน 27 รายการตามสเปก Excel ขนส่ง"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ตาราง 27 รายการ</span>
            </button>
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">ประเภทรถ:</span>
          <button
            onClick={() => setSelectedType("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedType === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทั้งหมด ({vehicles.length})
          </button>
          {([
            "tractor_10w", 
            "tractor_6w", 
            "trailer_3axle", 
            "trailer_2axle", 
            "box_truck_6w", 
            "jumbo_4w", 
            "pickup_box", 
            "sedan", 
            "forklift"
          ] as VehicleType[]).map((type) => {
            const count = vehicles.filter(v => v.vehicleType === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === type ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {VEHICLE_TYPE_LABELS[type] || type} ({count})
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-2"></div>

          <span className="text-slate-400 font-medium mr-1 text-[11px]">สถานะ:</span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedStatus === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทุกสถานะ
          </button>
          <button
            onClick={() => setSelectedStatus("active")}
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedStatus === "active" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            พร้อมใช้ ({activeCount})
          </button>
          <button
            onClick={() => setSelectedStatus("under_repair")}
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedStatus === "under_repair" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            กำลังซ่อม ({repairCount})
          </button>
          {duplicateCount > 0 && (
            <button
              onClick={() => setSelectedStatus(selectedStatus === "duplicate" ? "all" : "duplicate")}
              className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedStatus === "duplicate" 
                  ? "bg-rose-700 text-white ring-2 ring-rose-500" 
                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>ทะเบียนซ้ำ ({duplicateCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content View 1: Grid Mode */}
      {viewMode === "grid" && (
        filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
            <Truck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all" || selectedDepartment !== "all"
                ? "ไม่พบข้อมูลรถตามเงื่อนไขที่เลือก"
                : "ยังไม่มีข้อมูลทะเบียนรถในระบบ"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              คุณสามารถดึงข้อมูลรถจริง TNB ทั้งหมด 99 คัน (หัวลาก 10 ล้อ, 6 ล้อ, หางพ่วง, รถโมบายเซอร์วิส), นำเข้าจากไฟล์ Excel / CSV หรือเพิ่มทะเบียนรถใหม่ได้ทันที
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onRestoreAllVehicles && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("ต้องการดึงข้อมูลรถจริง TNB ทั้งหมด 99 คัน (พร้อมข้อมูล 27 รายการ) กลับคืนสู่ระบบหรือไม่?")) {
                      onRestoreAllVehicles();
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ดึงข้อมูลรถทั้งหมด (99 คัน)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้า Excel / CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มทะเบียนรถใหม่</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                vehicle.isSystemDup
                  ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/10 hover:border-rose-400"
                  : vehicle.dynamicStatus === "under_repair"
                  ? "border-rose-200 hover:border-rose-300"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {vehicle.erpNo && (
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-500 font-mono shadow-xs">
                          #{vehicle.erpNo}
                        </span>
                      )}
                      <span className="font-extrabold text-base text-slate-900 tracking-tight">
                        {vehicle.licensePlate}
                      </span>
                      {vehicle.isSystemDup && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-0.5" title={`มีรถใช้เลขทะเบียนนี้ซ้ำกันในระบบ ${vehicle.dupCount} คัน`}>
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          ซ้ำในระบบ ({vehicle.dupCount})
                        </span>
                      )}
                      {vehicle.carrierCompany && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {vehicle.carrierCompany}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-blue-700 mt-0.5">
                      {vehicle.vehicleBrand} {vehicle.vehicleModel}
                    </div>
                  </div>
                  <div>{getStatusBadge(vehicle.dynamicStatus)}</div>
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ประเภท:</span>
                    <span className="font-semibold text-slate-800">
                      {VEHICLE_TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">สี / เชื้อเพลิง:</span>
                    <span className="font-semibold text-slate-800">
                      {vehicle.color || "ขาว"} ({vehicle.fuelType || "ดีเซล"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เลขคัสซี / เครื่อง:</span>
                    <span className="font-mono text-slate-700 text-[10px] truncate block" title={vehicle.chassisNumber || "-"}>
                      {vehicle.chassisNumber ? vehicle.chassisNumber.slice(-8) : "-"} / {vehicle.engineNumber ? vehicle.engineNumber.slice(-6) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ระบบ GPS:</span>
                    <span className="font-bold text-emerald-700 text-[10px] flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                      {vehicle.gpsProvider || "CARTRACK"}
                    </span>
                  </div>
                </div>

                {/* Tax & Insurance Mini Indicators */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                  <div className="p-1.5 rounded bg-pink-50 border border-pink-200">
                    <span className="text-pink-700 block font-bold">ภาษี / พรบ</span>
                    <span className="text-slate-600">{vehicle.taxExpiryDate || "มีผลบังคับ"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-cyan-50 border border-cyan-200">
                    <span className="text-cyan-700 block font-bold">ประกันภัยรถ</span>
                    <span className="text-slate-600">{vehicle.vehicleInsuranceType || "ชั้น 1"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 block font-bold">ประกันสินค้า</span>
                    <span className="text-slate-600">฿{vehicle.cargoInsuranceCoverage || "1M"}</span>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{vehicle.driverName || "ยังไม่ระบุ พขร."}</span>
                  </div>
                  <div className="font-mono text-slate-700 text-[11px] shrink-0">
                    {vehicle.currentMileage.toLocaleString()} กม.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRepairAction(vehicle)}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>⚡ แจ้งซ่อม</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingVehicle(vehicle)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  title="ดูรายละเอียด 27 รายการ"
                >
                  27 รายการ
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(vehicle)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors"
                    title="แก้ไขข้อมูลรถ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบทะเบียน"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Content View 2: Summary Table */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Quick Sort Bar for Table View */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                จัดเรียงตาราง:
              </span>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === "erp_asc" ? "erp_desc" : "erp_asc")}
                className={`px-2.5 py-1 rounded-md font-extrabold flex items-center space-x-1 transition-all ${
                  sortBy === "erp_asc"
                    ? "bg-amber-400 text-slate-950 shadow-xs border border-amber-500"
                    : sortBy === "erp_desc"
                    ? "bg-amber-300 text-slate-950 shadow-xs border border-amber-500"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-amber-50"
                }`}
              >
                <span>🔢 No. ERP</span>
                {sortBy === "erp_asc" && <ArrowUp className="w-3 h-3 text-slate-950" />}
                {sortBy === "erp_desc" && <ArrowDown className="w-3 h-3 text-slate-950" />}
                <span className="text-[10px] text-slate-800">({sortBy === "erp_asc" ? "น้อย→มาก" : sortBy === "erp_desc" ? "มาก→น้อย" : "เรียง ERP"})</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy(sortBy === "plate_asc" ? "plate_desc" : "plate_asc")}
                className={`px-2.5 py-1 rounded-md font-bold flex items-center space-x-1 transition-all ${
                  sortBy.startsWith("plate_")
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>🚗 ทะเบียน</span>
                {sortBy === "plate_asc" && <ArrowUp className="w-3 h-3 text-white" />}
                {sortBy === "plate_desc" && <ArrowDown className="w-3 h-3 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setSortBy(sortBy === "tax_asc" ? "created_desc" : "tax_asc")}
                className={`px-2.5 py-1 rounded-md font-bold flex items-center space-x-1 transition-all ${
                  sortBy === "tax_asc"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>📅 ภาษีใกล้หมด</span>
              </button>
            </div>

            <div className="text-slate-500 text-[11px]">
              แสดง <strong className="text-slate-900">{filteredVehicles.length}</strong> จาก {vehicles.length} คัน
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 select-none">
                <tr>
                  <th 
                    onClick={() => setSortBy(sortBy === "erp_asc" ? "erp_desc" : "erp_asc")}
                    className={`py-3 px-3 text-center w-24 cursor-pointer hover:bg-amber-100 transition-colors ${
                      sortBy.startsWith("erp_") ? "bg-amber-200/90 text-amber-950 font-black" : ""
                    }`}
                    title="คลิกเพื่อสลับการจัดเรียง No. ERP (น้อยไปมาก / มากไปน้อย)"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>No. ERP</span>
                      {sortBy === "erp_asc" && <ArrowUp className="w-3.5 h-3.5 text-amber-950" />}
                      {sortBy === "erp_desc" && <ArrowDown className="w-3.5 h-3.5 text-amber-950" />}
                      {!sortBy.startsWith("erp_") && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setSortBy(sortBy === "plate_asc" ? "plate_desc" : "plate_asc")}
                    className={`py-3 px-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                      sortBy.startsWith("plate_") ? "bg-blue-100 text-blue-950 font-bold" : ""
                    }`}
                    title="คลิกเพื่อจัดเรียงตามทะเบียนรถ"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ประกอบการ / ทะเบียน</span>
                      {sortBy === "plate_asc" && <ArrowUp className="w-3 h-3 text-blue-800" />}
                      {sortBy === "plate_desc" && <ArrowDown className="w-3 h-3 text-blue-800" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setSortBy(sortBy === "brand_asc" ? "erp_asc" : "brand_asc")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200 transition-colors"
                    title="คลิกเพื่อจัดเรียงตามยี่ห้อรถ"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ยี่ห้อ / รุ่น</span>
                      {sortBy === "brand_asc" && <ArrowUp className="w-3 h-3 text-slate-800" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">ประเภทรถ</th>
                  <th className="py-3 px-4">คัสซี / เครื่องยนต์</th>
                  <th className="py-3 px-4">พนักงานขับรถ</th>
                  <th 
                    onClick={() => setSortBy(sortBy === "tax_asc" ? "erp_asc" : "tax_asc")}
                    className={`py-3 px-4 cursor-pointer hover:bg-purple-50 transition-colors ${
                      sortBy === "tax_asc" ? "bg-purple-100 text-purple-950 font-bold" : ""
                    }`}
                    title="คลิกเพื่อจัดเรียงตามวันหมดอายุภาษี"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ภาษี & พรบ.</span>
                      {sortBy === "tax_asc" && <ArrowUp className="w-3 h-3 text-purple-800" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">ประกันภัย</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-mono font-black text-xs text-amber-950 shadow-xs">
                        {vehicle.erpNo || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-bold text-slate-900">{vehicle.licensePlate}</span>
                        {vehicle.isSystemDup && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300" title={`มีรถใช้เลขทะเบียนนี้ซ้ำกันในระบบ ${vehicle.dupCount} คัน`}>
                            ซ้ำในระบบ ({vehicle.dupCount})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold">{vehicle.carrierCompany || "TNB"} ({vehicle.province})</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {vehicle.vehicleBrand} {vehicle.vehicleModel}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {VEHICLE_TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      <div>Chassis: {vehicle.chassisNumber || "-"}</div>
                      <div>Eng: {vehicle.engineNumber || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{vehicle.driverName || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{vehicle.currentMileage.toLocaleString()} กม.</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div className="text-pink-700 font-semibold">{vehicle.actInsuranceCompany || "พรบ."}</div>
                      <div className="text-[10px] text-slate-400">หมด: {vehicle.taxExpiryDate || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div className="text-cyan-700 font-semibold">รถ: {vehicle.vehicleInsuranceType || "ชั้น 1"}</div>
                      <div className="text-emerald-700 text-[10px]">สินค้า: ฿{vehicle.cargoInsuranceCoverage || "-"}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(vehicle.dynamicStatus)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleQuickRepairAction(vehicle)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 border border-blue-200"
                          title="เปิดใบแจ้งซ่อมด่วน"
                        >
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>แจ้งซ่อม</span>
                        </button>
                        <button
                          onClick={() => setViewingVehicle(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                          title="ดูข้อมูล 27 รายการ"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <div className="font-bold text-slate-700 text-sm">ไม่พบข้อมูลรถในตาราง</div>
                      <div className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                        คุณสามารถกดปุ่มดึงข้อมูลรถจริง TNB ทั้งหมด 99 คัน หรือนำเข้าจาก Excel
                      </div>
                      {onRestoreAllVehicles && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("ต้องการดึงข้อมูลรถจริง TNB ทั้งหมด 99 คันกลับคืนสู่ระบบหรือไม่?")) {
                              onRestoreAllVehicles();
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>ดึงข้อมูลรถทั้งหมด (99 คัน)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content View 3: Full 27-Column Master Spreadsheet (Exact User Image Reference) */}
      {viewMode === "spreadsheet" && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                ตารางสารระบบทะเบียนรถ 27 รายการ (Master Logistics Fleet Spreadsheet)
              </h3>
              <p className="text-[11px] text-slate-500">
                ตารางหัวแถบสี เหลือง (ข้อมูลรถ 9 รายการ) | ชมพู (ภาษี/พรบ 6 รายการ) | ฟ้า (ประกันรถ 6 รายการ) | เขียว (GPS & ประกันสินค้า 6 รายการ)
              </p>
            </div>

            {/* Quick Sort Controls for 27-Column Spreadsheet */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
                เรียงลำดับ:
              </span>

              <button
                type="button"
                onClick={() => setSortBy("erp_asc")}
                className={`px-2.5 py-1 rounded-md text-xs font-extrabold flex items-center space-x-1 transition-all ${
                  sortBy === "erp_asc"
                    ? "bg-amber-400 text-slate-950 shadow-xs border-2 border-amber-600"
                    : "bg-slate-100 text-slate-700 hover:bg-amber-100 border border-slate-300"
                }`}
                title="จัดเรียงตาม No. ERP จากน้อยไปหามาก (1 → 99)"
              >
                <ArrowUp className="w-3 h-3 text-slate-950" />
                <span>🔢 No. ERP (น้อย → มาก)</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("erp_desc")}
                className={`px-2.5 py-1 rounded-md text-xs font-extrabold flex items-center space-x-1 transition-all ${
                  sortBy === "erp_desc"
                    ? "bg-amber-400 text-slate-950 shadow-xs border-2 border-amber-600"
                    : "bg-slate-100 text-slate-700 hover:bg-amber-100 border border-slate-300"
                }`}
                title="จัดเรียงตาม No. ERP จากมากไปหาน้อย (99 → 1)"
              >
                <ArrowDown className="w-3 h-3 text-slate-950" />
                <span>🔢 No. ERP (มาก → น้อย)</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy(sortBy === "plate_asc" ? "plate_desc" : "plate_asc")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition-all ${
                  sortBy.startsWith("plate_")
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                <span>🚗 ทะเบียน</span>
                {sortBy === "plate_asc" && <ArrowUp className="w-3 h-3 text-white" />}
                {sortBy === "plate_desc" && <ArrowDown className="w-3 h-3 text-white" />}
              </button>

              <div className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-lg border">
                แสดงผล {filteredVehicles.length} คัน
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg max-h-[650px]">
            <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
              <thead>
                {/* 4 Main Color-coded Group Super Headers */}
                <tr className="text-center font-extrabold text-slate-950">
                  <th colSpan={9} className="bg-yellow-300 border-r-2 border-b border-slate-400 py-1.5 px-2">
                    🟨 ข้อมูลยานพาหนะหลัก (Core Vehicle Master Data)
                  </th>
                  <th colSpan={6} className="bg-pink-300 border-r-2 border-b border-slate-400 py-1.5 px-2">
                    🌸 ภาษี & พ.ร.บ. คุ้มครองผู้ประสบภัย (Tax & Act/CMI)
                  </th>
                  <th colSpan={6} className="bg-cyan-300 border-r-2 border-b border-slate-400 py-1.5 px-2">
                    🔷 ประกันภัยรถยนต์ (Motor Vehicle Insurance)
                  </th>
                  <th colSpan={6} className="bg-emerald-300 border-b border-slate-400 py-1.5 px-2">
                    🟩 ระบบ GPS & ประกันภัยสินค้า (GPS & Cargo Insurance)
                  </th>
                  <th className="bg-slate-200 border-b border-slate-400 py-1.5 px-2">
                    จัดการ
                  </th>
                </tr>

                {/* 27 Exact Column Headers from Image */}
                <tr className="text-slate-950 font-bold divide-x divide-slate-300 border-b-2 border-slate-400 select-none">
                  {/* Yellow Section (1-9) - No. ERP is on the leftmost */}
                  <th 
                    onClick={() => setSortBy(sortBy === "erp_asc" ? "erp_desc" : "erp_asc")}
                    className={`py-2.5 px-3 text-center w-20 cursor-pointer transition-colors ${
                      sortBy.startsWith("erp_") 
                        ? "bg-amber-300 ring-2 ring-amber-500 text-amber-950 font-black shadow-inner" 
                        : "bg-yellow-200/90 hover:bg-yellow-300"
                    }`}
                    title="คลิกเพื่อสลับการจัดเรียง No. ERP (น้อยไปมาก / มากไปน้อย)"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>No. ERP</span>
                      {sortBy === "erp_asc" && <ArrowUp className="w-3.5 h-3.5 text-amber-950 font-black" />}
                      {sortBy === "erp_desc" && <ArrowDown className="w-3.5 h-3.5 text-amber-950 font-black" />}
                      {!sortBy.startsWith("erp_") && <ArrowUpDown className="w-3 h-3 text-amber-800/60" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setSortBy(sortBy === "carrier_asc" ? "erp_asc" : "carrier_asc")}
                    className="bg-yellow-200/90 hover:bg-yellow-300 py-2.5 px-3 cursor-pointer"
                    title="คลิกเพื่อจัดเรียงตามผู้ประกอบการ"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ประกอบการขนส่ง</span>
                      {sortBy === "carrier_asc" && <ArrowUp className="w-3 h-3 text-slate-900" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setSortBy(sortBy === "plate_asc" ? "plate_desc" : "plate_asc")}
                    className={`py-2.5 px-3 cursor-pointer transition-colors ${
                      sortBy.startsWith("plate_")
                        ? "bg-amber-300 ring-2 ring-blue-500 font-black"
                        : "bg-yellow-200/90 hover:bg-yellow-300"
                    }`}
                    title="คลิกเพื่อจัดเรียงตามทะเบียนรถ"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ทะเบียนใหม่</span>
                      {sortBy === "plate_asc" && <ArrowUp className="w-3 h-3 text-blue-900" />}
                      {sortBy === "plate_desc" && <ArrowDown className="w-3 h-3 text-blue-900" />}
                    </div>
                  </th>
                  <th className="bg-yellow-200/90 py-2.5 px-3">ประเภท</th>
                  <th 
                    onClick={() => setSortBy(sortBy === "brand_asc" ? "erp_asc" : "brand_asc")}
                    className="bg-yellow-200/90 hover:bg-yellow-300 py-2.5 px-3 cursor-pointer"
                    title="คลิกเพื่อจัดเรียงตามยี่ห้อ"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ยี่ห้อ</span>
                      {sortBy === "brand_asc" && <ArrowUp className="w-3 h-3 text-slate-900" />}
                    </div>
                  </th>
                  <th className="bg-yellow-200/90 py-2.5 px-3">แบบ/รุ่น</th>
                  <th className="bg-yellow-200/90 py-2.5 px-3">เลขตัวถัง(คัสซี)</th>
                  <th className="bg-yellow-200/90 py-2.5 px-3">เลขเครื่องยนต์</th>
                  <th className="bg-yellow-200/90 py-2.5 px-3 border-r-2 border-slate-400">สี</th>

                  {/* Pink Section (10-15) */}
                  <th className="bg-pink-200/90 py-2.5 px-3">วันที่จดทะเบียน</th>
                  <th 
                    onClick={() => setSortBy(sortBy === "tax_asc" ? "erp_asc" : "tax_asc")}
                    className={`py-2.5 px-3 cursor-pointer transition-colors ${
                      sortBy === "tax_asc"
                        ? "bg-pink-300 ring-2 ring-purple-500 font-black"
                        : "bg-pink-200/90 hover:bg-pink-300"
                    }`}
                    title="คลิกเพื่อจัดเรียงตามวันหมดอายุภาษี"
                  >
                    <div className="flex items-center space-x-1">
                      <span>วันที่หมดอายุภาษี (เดือน)</span>
                      {sortBy === "tax_asc" && <ArrowUp className="w-3 h-3 text-purple-900" />}
                    </div>
                  </th>
                  <th className="bg-pink-200/90 py-2.5 px-3">อัตราภาษี</th>
                  <th className="bg-pink-200/90 py-2.5 px-3">ค่าพรบ</th>
                  <th className="bg-pink-200/90 py-2.5 px-3">พรบ.หมด</th>
                  <th className="bg-pink-200/90 py-2.5 px-3 border-r-2 border-slate-400">บริษัท พรบ.</th>

                  {/* Cyan Section (16-21) */}
                  <th className="bg-cyan-200/90 py-2.5 px-3">ชื่อประกันภัยรถ</th>
                  <th className="bg-cyan-200/90 py-2.5 px-3">ประเภทประกันภัยรถ</th>
                  <th className="bg-cyan-200/90 py-2.5 px-3">วงเงินประกันภัยรถ</th>
                  <th className="bg-cyan-200/90 py-2.5 px-3">วันเริ่มคุ้มครอง ประกันภัยรถ</th>
                  <th className="bg-cyan-200/90 py-2.5 px-3">เดือนสิ้นสุดระยะเวลาประกัน</th>
                  <th className="bg-cyan-200/90 py-2.5 px-3 border-r-2 border-slate-400">ค่าเบี้ยประกัน</th>

                  {/* Green Section (22-27) */}
                  <th className="bg-emerald-200/90 py-2.5 px-3">GPS</th>
                  <th className="bg-emerald-200/90 py-2.5 px-3">ชื่อประกันภัยสินค้า</th>
                  <th className="bg-emerald-200/90 py-2.5 px-3">วงเงินประกันภัยสินค้า</th>
                  <th className="bg-emerald-200/90 py-2.5 px-3">วันเริ่มคุ้มครอง ตามประกันภัยสินค้า</th>
                  <th className="bg-emerald-200/90 py-2.5 px-3">สิ้นสุดระยะเวลาประกันสินค้า</th>
                  <th className="bg-emerald-200/90 py-2.5 px-3">ค่าเบี้ยประกันสินค้า</th>

                  <th className="bg-slate-100 py-2.5 px-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 divide-x divide-slate-200">
                    {/* Yellow 1-9 - No. ERP is the leftmost column */}
                    <td className="py-2 px-3 text-center bg-yellow-100/60 font-mono font-black text-xs text-yellow-950">
                      <span className="px-1.5 py-0.5 rounded bg-yellow-300 border border-yellow-400 shadow-xs">
                        {vehicle.erpNo || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-blue-900">{vehicle.carrierCompany || "TNB"}</td>
                    <td className="py-2 px-3 font-extrabold text-slate-900 bg-yellow-50/40">
                      <div className="flex items-center space-x-1">
                        <span>{vehicle.licensePlate}</span>
                        {vehicle.isSystemDup && (
                          <span className="text-[9px] font-black px-1 rounded bg-rose-100 text-rose-800 border border-rose-300" title={`ซ้ำในระบบ ${vehicle.dupCount} คัน`}>
                            ซ้ำ ({vehicle.dupCount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">{VEHICLE_TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType}</td>
                    <td className="py-2 px-3 font-bold">{vehicle.vehicleBrand}</td>
                    <td className="py-2 px-3 max-w-[200px] truncate" title={vehicle.vehicleModel}>{vehicle.vehicleModel}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{vehicle.chassisNumber || "-"}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{vehicle.engineNumber || "-"}</td>
                    <td className="py-2 px-3 border-r-2 border-slate-400 font-medium">{vehicle.color || "ขาว"}</td>

                    {/* Pink 10-15 */}
                    <td className="py-2 px-3 text-slate-700">{vehicle.registrationDate || "-"}</td>
                    <td className="py-2 px-3 font-semibold text-pink-900 bg-pink-50/40">{vehicle.taxExpiryDate || "-"}</td>
                    <td className="py-2 px-3 text-right">{vehicle.taxRate ? `฿${vehicle.taxRate}` : "-"}</td>
                    <td className="py-2 px-3 text-right">{vehicle.actInsuranceFee ? `฿${vehicle.actInsuranceFee}` : "-"}</td>
                    <td className="py-2 px-3 text-rose-700 font-semibold">{vehicle.actInsuranceExpiry || "-"}</td>
                    <td className="py-2 px-3 border-r-2 border-slate-400 text-pink-950 font-medium">{vehicle.actInsuranceCompany || "-"}</td>

                    {/* Cyan 16-21 */}
                    <td className="py-2 px-3 text-cyan-950 font-semibold">{vehicle.vehicleInsuranceCompany || "-"}</td>
                    <td className="py-2 px-3 font-bold text-cyan-800 bg-cyan-50/40">{vehicle.vehicleInsuranceType || "ชั้น 1"}</td>
                    <td className="py-2 px-3 text-right font-mono">{vehicle.vehicleInsuranceCoverage ? `฿${vehicle.vehicleInsuranceCoverage}` : "-"}</td>
                    <td className="py-2 px-3 text-slate-600">{vehicle.vehicleInsuranceStartDate || "-"}</td>
                    <td className="py-2 px-3 text-slate-700 font-semibold">{vehicle.vehicleInsuranceEndDate || "-"}</td>
                    <td className="py-2 px-3 border-r-2 border-slate-400 text-right">{vehicle.vehicleInsurancePremium ? `฿${vehicle.vehicleInsurancePremium}` : "-"}</td>

                    {/* Green 22-27 */}
                    <td className="py-2 px-3 font-bold text-emerald-800 bg-emerald-50/40">{vehicle.gpsProvider || "CARTRACK"}</td>
                    <td className="py-2 px-3 text-emerald-950 font-semibold">{vehicle.cargoInsuranceCompany || "-"}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900">{vehicle.cargoInsuranceCoverage ? `฿${vehicle.cargoInsuranceCoverage}` : "-"}</td>
                    <td className="py-2 px-3 text-slate-600">{vehicle.cargoInsuranceStartDate || "-"}</td>
                    <td className="py-2 px-3 text-slate-700 font-semibold">{vehicle.cargoInsuranceEndDate || "-"}</td>
                    <td className="py-2 px-3 text-right">{vehicle.cargoInsurancePremium ? `฿${vehicle.cargoInsurancePremium}` : "-"}</td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleQuickRepairAction(vehicle)}
                          className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                          title="แจ้งซ่อม"
                        >
                          ซ่อม
                        </button>
                        <button
                          onClick={() => handleOpenEdit(vehicle)}
                          className="p-1 text-slate-600 hover:text-blue-600"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="bg-white p-12 rounded-xl text-center border border-slate-200 space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบข้อมูลทะเบียนรถที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มทะเบียนรถใหม่" เพื่อเพิ่มข้อมูลเข้าสารระบบ TNB Logistics
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            + เพิ่มทะเบียนรถใหม่ (27 รายการ)
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Add / Edit Vehicle Modal with 4-Group Color Design (27 Fields)             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between rounded-t-2xl shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-400">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    {editingVehicle ? "แก้ไขข้อมูลทะเบียนรถ" : "เพิ่มทะเบียนรถใหม่เข้าสารระบบ TNB Logistics"}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      27 รายการ
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    กรอกข้อมูลครบถ้วนตามแบบฟอร์มมาตรฐานขนส่ง (ข้อมูลตัวรถ, ภาษี/พรบ, ประกันรถ, GPS & ประกันสินค้า)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 4 Form Category Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveFormTab("yellow")}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-all border-t-2 flex items-center gap-1.5 ${
                  activeFormTab === "yellow"
                    ? "bg-white text-slate-950 border-yellow-500 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span>1. ข้อมูลรถหลัก (9 รายการ)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab("pink")}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-all border-t-2 flex items-center gap-1.5 ${
                  activeFormTab === "pink"
                    ? "bg-white text-slate-950 border-pink-500 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
                <span>2. ภาษี & พ.ร.บ. (6 รายการ)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab("cyan")}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-all border-t-2 flex items-center gap-1.5 ${
                  activeFormTab === "cyan"
                    ? "bg-white text-slate-950 border-cyan-500 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                <span>3. ประกันภัยรถยนต์ (6 รายการ)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab("green")}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-all border-t-2 flex items-center gap-1.5 ${
                  activeFormTab === "green"
                    ? "bg-white text-slate-950 border-emerald-500 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span>4. GPS & ประกันสินค้า (6 รายการ)</span>
              </button>
            </div>

            {/* Modal Form Content Area */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: YELLOW GROUP - ข้อมูลยานพาหนะหลัก */}
              {activeFormTab === "yellow" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
                      <span className="font-bold text-xs text-yellow-900">
                        หมวดที่ 1: ข้อมูลยานพาหนะหลัก (Core Vehicle Information)
                      </span>
                    </div>
                    <span className="text-[11px] text-yellow-800 font-medium">รายการที่ 1 - 9</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 1. No. ERP */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        1. No. ERP (ลำดับตัวเลข) <span className="text-amber-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="เช่น 1, 2, 3..."
                        value={formData.erpNo}
                        onChange={(e) => setFormData({ ...formData, erpNo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-yellow-400 focus:ring-2 focus:ring-yellow-500 font-mono font-black text-slate-900 bg-yellow-50/40"
                      />
                    </div>

                    {/* 2. ประกอบการขนส่ง */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        2. ประกอบการขนส่ง <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น TNB, บีบีเอ็นพี, ครูเสือ"
                        value={formData.carrierCompany}
                        onChange={(e) => setFormData({ ...formData, carrierCompany: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 font-semibold"
                      />
                    </div>

                    {/* 3. ทะเบียนใหม่ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        3. ทะเบียนใหม่ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น 700-2739, บบ 9753, 3ฒฐ7708"
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-lg border font-extrabold text-slate-900 ${
                          duplicateFormVehicle 
                            ? "border-rose-400 focus:ring-2 focus:ring-rose-400 bg-rose-50/40" 
                            : "border-yellow-400 focus:ring-2 focus:ring-yellow-500 bg-yellow-50/30"
                        }`}
                      />
                      {duplicateFormVehicle && (
                        <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[10px] space-y-0.5 animate-in fade-in duration-150">
                          <div className="font-bold flex items-center gap-1 text-rose-900">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>ตรวจพบทะเบียนซ้ำในระบบ!</span>
                          </div>
                          <div className="text-rose-700 pl-4">
                            ตรงกับ ERP #{duplicateFormVehicle.erpNo || "-"} • {duplicateFormVehicle.vehicleBrand} {duplicateFormVehicle.vehicleModel} ({duplicateFormVehicle.carrierCompany})
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. ประเภท */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        4. ประเภทรถ <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 bg-white font-medium"
                      >
                        <option value="tractor_10w">หัวลาก 10 ล้อ</option>
                        <option value="tractor_6w">หัวลาก 6 ล้อ</option>
                        <option value="trailer_3axle">หาง 3 เพลา</option>
                        <option value="trailer_2axle">หาง 2 เพลา</option>
                        <option value="box_truck_6w">6 ล้อตู้ทึบ</option>
                        <option value="jumbo_4w">4 ล้อจัมโบ้</option>
                        <option value="pickup_box">รถกระบะตู้</option>
                        <option value="sedan">รถเก๋ง</option>
                        <option value="forklift">รถโฟล์คลิฟท์</option>
                        <option value="other">อื่นๆ</option>
                      </select>
                    </div>

                    {/* 5. ยี่ห้อ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        5. ยี่ห้อ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น ISUZU, HINO, MITSUBISHI FUSO, SCANIA"
                        value={formData.vehicleBrand}
                        onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 font-bold"
                      />
                    </div>

                    {/* 6. แบบ/รุ่น */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        6. แบบ/รุ่น
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น GXZ77NXXFV (หัวลาก 10 ล้อ 360), FG8JP1A-JGT"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 font-medium"
                      />
                    </div>

                    {/* 7. เลขตัวถัง(คัสซี) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        7. เลขตัวถัง(คัสซี)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น MP1GXZ77NMT003615, MNKFG8JP1..."
                        value={formData.chassisNumber}
                        onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 font-mono"
                      />
                    </div>

                    {/* 8. เลขเครื่องยนต์ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        8. เลขเครื่องยนต์
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 6UZ1EMM755, J08EWJH62265"
                        value={formData.engineNumber}
                        onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400 font-mono"
                      />
                    </div>

                    {/* 9. สี */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        9. สี
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ขาว, ขาว-น้ำเงิน, แดง, เหลือง"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  {/* Supporting Logistics Operations Fields */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      ข้อมูลสนับสนุนการดำเนินงาน (Logistics Operations Support)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">จังหวัดจดทะเบียน</label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">แผนก/ฝ่ายสังกัด</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        >
                          {TNB_DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">พนักงานขับรถ (พขร.)</label>
                        <input
                          type="text"
                          placeholder="ชื่อ-นามสกุล พขร."
                          value={formData.driverName}
                          onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">เลขไมล์ล่าสุด (กม.)</label>
                        <input
                          type="number"
                          value={formData.currentMileage || ""}
                          onChange={(e) => setFormData({ ...formData, currentMileage: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PINK GROUP - ภาษี & พ.ร.บ. */}
              {activeFormTab === "pink" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-pink-400"></div>
                      <span className="font-bold text-xs text-pink-900">
                        หมวดที่ 2: ภาษี & พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ (Tax & Act/CMI Insurance)
                      </span>
                    </div>
                    <span className="text-[11px] text-pink-800 font-medium">รายการที่ 10 - 15</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 10. วันที่จดทะเบียน */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        10. วันที่จดทะเบียน
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2561-09-11 หรือ 11 ก.ย. 2561"
                        value={formData.registrationDate}
                        onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    {/* 11. วันที่หมดอายุภาษี (เดือน) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        11. วันที่หมดอายุภาษี (เดือน)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2569-09-11 หรือ ก.ย. 2569"
                        value={formData.taxExpiryDate}
                        onChange={(e) => setFormData({ ...formData, taxExpiryDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-pink-300 focus:ring-2 focus:ring-pink-400 bg-pink-50/20 font-semibold"
                      />
                    </div>

                    {/* 12. อัตราภาษี */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        12. อัตราภาษี (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 1,950.00 หรือ 4,350.00"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    {/* 13. ค่าพรบ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        13. ค่าพรบ (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 1,830.00 หรือ 2,718.87"
                        value={formData.actInsuranceFee}
                        onChange={(e) => setFormData({ ...formData, actInsuranceFee: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    {/* 14. พรบ.หมด */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        14. พรบ.หมด
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2569-12-18 หรือ 18 ธ.ค. 2569"
                        value={formData.actInsuranceExpiry}
                        onChange={(e) => setFormData({ ...formData, actInsuranceExpiry: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-pink-300 focus:ring-2 focus:ring-pink-400 bg-pink-50/20 font-semibold"
                      />
                    </div>

                    {/* 15. บริษัท พรบ. */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        15. บริษัท พรบ.
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น วิริยะประกันภัย, อลิอันซ์ อยุธยา, มิตรแท้ประกันภัย"
                        value={formData.actInsuranceCompany}
                        onChange={(e) => setFormData({ ...formData, actInsuranceCompany: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CYAN GROUP - ประกันภัยรถยนต์ */}
              {activeFormTab === "cyan" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-500"></div>
                      <span className="font-bold text-xs text-cyan-900">
                        หมวดที่ 3: ประกันภัยรถยนต์ภาคสมัครใจ (Motor Vehicle Insurance)
                      </span>
                    </div>
                    <span className="text-[11px] text-cyan-800 font-medium">รายการที่ 16 - 21</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 16. ชื่อประกันภัยรถ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        16. ชื่อประกันภัยรถ (บริษัทประกัน)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น อลิอันซ์ อยุธยา, วิริยะประกันภัย, คุ้มภัยโตเกียวมารีน"
                        value={formData.vehicleInsuranceCompany}
                        onChange={(e) => setFormData({ ...formData, vehicleInsuranceCompany: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-400 font-medium"
                      />
                    </div>

                    {/* 17. ประเภทประกันภัยรถ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        17. ประเภทประกันภัยรถ
                      </label>
                      <select
                        value={formData.vehicleInsuranceType}
                        onChange={(e) => setFormData({ ...formData, vehicleInsuranceType: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-400 bg-white font-semibold text-cyan-900"
                      >
                        <option value="ชั้น 1">ประกันภัยชั้น 1 (Comprehensive)</option>
                        <option value="ชั้น 2+">ประกันภัยชั้น 2+ (2 Plus)</option>
                        <option value="ชั้น 2">ประกันภัยชั้น 2</option>
                        <option value="ชั้น 3+">ประกันภัยชั้น 3+ (3 Plus)</option>
                        <option value="ชั้น 3">ประกันภัยชั้น 3 (Third-Party)</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>

                    {/* 18. วงเงินประกันภัยรถ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        18. วงเงินประกันภัยรถ (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 500,000 หรือ 1,000,000 หรือ 2,500,000"
                        value={formData.vehicleInsuranceCoverage}
                        onChange={(e) => setFormData({ ...formData, vehicleInsuranceCoverage: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-400 font-mono font-bold"
                      />
                    </div>

                    {/* 19. วันเริ่มคุ้มครอง ประกันภัยรถ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        19. วันเริ่มคุ้มครอง ประกันภัยรถ
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2568-06-01 หรือ 1 มิ.ย. 2568"
                        value={formData.vehicleInsuranceStartDate}
                        onChange={(e) => setFormData({ ...formData, vehicleInsuranceStartDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>

                    {/* 20. เดือนสิ้นสุดระยะเวลาประกัน */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        20. เดือนสิ้นสุดระยะเวลาประกัน (หรือวันสิ้นสุด)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2569-06-01 หรือ มิ.ย. 2569"
                        value={formData.vehicleInsuranceEndDate}
                        onChange={(e) => setFormData({ ...formData, vehicleInsuranceEndDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-cyan-300 focus:ring-2 focus:ring-cyan-400 bg-cyan-50/20 font-semibold"
                      />
                    </div>

                    {/* 21. ค่าเบี้ยประกัน */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        21. ค่าเบี้ยประกันรถ (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 8,846.24 หรือ 17,300.00"
                        value={formData.vehicleInsurancePremium}
                        onChange={(e) => setFormData({ ...formData, vehicleInsurancePremium: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GREEN GROUP - GPS & ประกันภัยสินค้า */}
              {activeFormTab === "green" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-xs text-emerald-900">
                        หมวดที่ 4: ระบบ GPS & ประกันภัยสินค้า (GPS Tracking & Cargo Insurance)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-800 font-medium">รายการที่ 22 - 27</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 22. GPS */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        22. GPS (ผู้ให้บริการ / สถานะติดตาม)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น CARTRACK, WAYLAR, DTC Enterprise"
                        value={formData.gpsProvider}
                        onChange={(e) => setFormData({ ...formData, gpsProvider: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-400 bg-emerald-50/20 font-bold text-emerald-900"
                      />
                    </div>

                    {/* 23. ชื่อประกันภัยสินค้า */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        23. ชื่อประกันภัยสินค้า
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ทิพยประกันภัย, กรุงเทพประกันภัย, มิตรแท้ประกันภัย"
                        value={formData.cargoInsuranceCompany}
                        onChange={(e) => setFormData({ ...formData, cargoInsuranceCompany: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-400 font-medium"
                      />
                    </div>

                    {/* 24. วงเงินประกันภัยสินค้า */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        24. วงเงินประกันภัยสินค้า (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 500,000 หรือ 1,000,000 หรือ 3,000,000"
                        value={formData.cargoInsuranceCoverage}
                        onChange={(e) => setFormData({ ...formData, cargoInsuranceCoverage: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-400 font-mono font-bold text-emerald-900"
                      />
                    </div>

                    {/* 25. วันเริ่มคุ้มครอง ตามประกันภัยสินค้า */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        25. วันเริ่มคุ้มครอง ตามประกันภัยสินค้า
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2568-01-01 หรือ 1 ม.ค. 2568"
                        value={formData.cargoInsuranceStartDate}
                        onChange={(e) => setFormData({ ...formData, cargoInsuranceStartDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    {/* 26. สิ้นสุดระยะเวลาประกันสินค้า */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        26. สิ้นสุดระยะเวลาประกันสินค้า
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2568-12-31 หรือ 31 ธ.ค. 2568"
                        value={formData.cargoInsuranceEndDate}
                        onChange={(e) => setFormData({ ...formData, cargoInsuranceEndDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-400 bg-emerald-50/20 font-semibold"
                      />
                    </div>

                    {/* 27. ค่าเบี้ยประกันสินค้า */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        27. ค่าเบี้ยประกันสินค้า (บาท)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 6,500.25 หรือ 12,000.00"
                        value={formData.cargoInsurancePremium}
                        onChange={(e) => setFormData({ ...formData, cargoInsurancePremium: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมายเหตุเพิ่มเติม / สายวิ่งงานประจำ
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น รถประจำสายขนส่งสินค้าโรงงาน ระยอง - ชลบุรี - สมุทรปราการ"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls & Tab Stepper */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeFormTab === "pink") setActiveFormTab("yellow");
                      if (activeFormTab === "cyan") setActiveFormTab("pink");
                      if (activeFormTab === "green") setActiveFormTab("cyan");
                    }}
                    disabled={activeFormTab === "yellow"}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← ย้อนกลับ
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeFormTab === "yellow") setActiveFormTab("pink");
                      if (activeFormTab === "pink") setActiveFormTab("cyan");
                      if (activeFormTab === "cyan") setActiveFormTab("green");
                    }}
                    disabled={activeFormTab === "green"}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ถัดไป →
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingVehicle ? "บันทึกการแก้ไขทะเบียนรถ" : "บันทึกเพิ่มทะเบียนรถใหม่"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 27-Field Full Vehicle Detail Modal                                         */}
      {/* ========================================================================= */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold">{viewingVehicle.licensePlate}</h2>
                    {viewingVehicle.erpNo && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-400 text-slate-950">
                        {viewingVehicle.erpNo}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/30 text-blue-300">
                      {viewingVehicle.carrierCompany || "TNB"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {viewingVehicle.vehicleBrand} {viewingVehicle.vehicleModel} | {VEHICLE_TYPE_LABELS[viewingVehicle.vehicleType] || viewingVehicle.vehicleType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingVehicle(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Content: 4 Color-Coded Detail Cards */}
            <div className="p-6 space-y-4">
              {/* 1. Yellow Group */}
              <div className="p-4 rounded-xl bg-yellow-50/70 border border-yellow-200 space-y-3">
                <div className="flex items-center justify-between border-b border-yellow-200/80 pb-2">
                  <span className="font-extrabold text-xs text-yellow-950 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    หมวดที่ 1: ข้อมูลยานพาหนะหลัก (รายการที่ 1-9)
                  </span>
                  <span className="text-[11px] font-bold text-yellow-900 bg-yellow-200/60 px-2 py-0.5 rounded">
                    Core Vehicle Data
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">1. No. ERP:</span>
                    <strong className="text-yellow-950 font-mono font-black bg-yellow-300 px-2 py-0.5 rounded border border-yellow-400 shadow-xs inline-block">
                      {viewingVehicle.erpNo || "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">2. ประกอบการขนส่ง:</span>
                    <strong className="text-slate-900">{viewingVehicle.carrierCompany || "TNB"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">3. ทะเบียนใหม่:</span>
                    <strong className="text-slate-900 font-extrabold">{viewingVehicle.licensePlate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">4. ประเภท:</span>
                    <strong className="text-slate-800">{VEHICLE_TYPE_LABELS[viewingVehicle.vehicleType] || viewingVehicle.vehicleType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">5. ยี่ห้อ:</span>
                    <strong className="text-slate-900">{viewingVehicle.vehicleBrand}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">6. แบบ/รุ่น:</span>
                    <strong className="text-slate-800">{viewingVehicle.vehicleModel || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">7. เลขตัวถัง(คัสซี):</span>
                    <span className="font-mono text-slate-800 font-bold">{viewingVehicle.chassisNumber || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">8. เลขเครื่องยนต์:</span>
                    <span className="font-mono text-slate-800 font-bold">{viewingVehicle.engineNumber || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">9. สี:</span>
                    <strong className="text-slate-800">{viewingVehicle.color || "ขาว"}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Pink Group */}
              <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-200 space-y-3">
                <div className="flex items-center justify-between border-b border-pink-200/80 pb-2">
                  <span className="font-extrabold text-xs text-pink-950 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                    หมวดที่ 2: ภาษี & พ.ร.บ. คุ้มครองผู้ประสบภัย (รายการที่ 10-15)
                  </span>
                  <span className="text-[11px] font-bold text-pink-900 bg-pink-200/60 px-2 py-0.5 rounded">
                    Tax & Act/CMI
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">10. วันที่จดทะเบียน:</span>
                    <strong className="text-slate-800">{viewingVehicle.registrationDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">11. วันที่หมดอายุภาษี (เดือน):</span>
                    <strong className="text-pink-900 font-bold">{viewingVehicle.taxExpiryDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">12. อัตราภาษี:</span>
                    <strong className="text-slate-800">{viewingVehicle.taxRate ? `฿${viewingVehicle.taxRate}` : "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">13. ค่าพรบ:</span>
                    <strong className="text-slate-800">{viewingVehicle.actInsuranceFee ? `฿${viewingVehicle.actInsuranceFee}` : "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">14. พรบ.หมด:</span>
                    <strong className="text-rose-700 font-bold">{viewingVehicle.actInsuranceExpiry || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">15. บริษัท พรบ.:</span>
                    <strong className="text-pink-950">{viewingVehicle.actInsuranceCompany || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Cyan Group */}
              <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-200/80 pb-2">
                  <span className="font-extrabold text-xs text-cyan-950 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    หมวดที่ 3: ประกันภัยรถยนต์ (รายการที่ 16-21)
                  </span>
                  <span className="text-[11px] font-bold text-cyan-900 bg-cyan-200/60 px-2 py-0.5 rounded">
                    Motor Insurance
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">16. ชื่อประกันภัยรถ:</span>
                    <strong className="text-cyan-950">{viewingVehicle.vehicleInsuranceCompany || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">17. ประเภทประกันภัยรถ:</span>
                    <strong className="text-cyan-900 font-bold">{viewingVehicle.vehicleInsuranceType || "ชั้น 1"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">18. วงเงินประกันภัยรถ:</span>
                    <strong className="text-slate-900 font-mono">{viewingVehicle.vehicleInsuranceCoverage ? `฿${viewingVehicle.vehicleInsuranceCoverage}` : "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">19. วันเริ่มคุ้มครอง ประกันภัยรถ:</span>
                    <strong className="text-slate-800">{viewingVehicle.vehicleInsuranceStartDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">20. เดือนสิ้นสุดระยะเวลาประกัน:</span>
                    <strong className="text-cyan-900 font-bold">{viewingVehicle.vehicleInsuranceEndDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">21. ค่าเบี้ยประกัน:</span>
                    <strong className="text-slate-800">{viewingVehicle.vehicleInsurancePremium ? `฿${viewingVehicle.vehicleInsurancePremium}` : "-"}</strong>
                  </div>
                </div>
              </div>

              {/* 4. Green Group */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    หมวดที่ 4: ระบบ GPS & ประกันภัยสินค้า (รายการที่ 22-27)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded">
                    GPS & Cargo
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">22. GPS:</span>
                    <strong className="text-emerald-900 font-extrabold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      {viewingVehicle.gpsProvider || "CARTRACK"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">23. ชื่อประกันภัยสินค้า:</span>
                    <strong className="text-emerald-950">{viewingVehicle.cargoInsuranceCompany || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">24. วงเงินประกันภัยสินค้า:</span>
                    <strong className="text-emerald-950 font-mono font-bold">{viewingVehicle.cargoInsuranceCoverage ? `฿${viewingVehicle.cargoInsuranceCoverage}` : "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">25. วันเริ่มคุ้มครอง ตามประกันภัยสินค้า:</span>
                    <strong className="text-slate-800">{viewingVehicle.cargoInsuranceStartDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">26. สิ้นสุดระยะเวลาประกันสินค้า:</span>
                    <strong className="text-emerald-900 font-bold">{viewingVehicle.cargoInsuranceEndDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">27. ค่าเบี้ยประกันสินค้า:</span>
                    <strong className="text-slate-800">{viewingVehicle.cargoInsurancePremium ? `฿${viewingVehicle.cargoInsurancePremium}` : "-"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  const target = viewingVehicle;
                  setViewingVehicle(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูล 27 รายการ</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingVehicle;
                    setViewingVehicle(null);
                    handleQuickRepairAction(target);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>เปิดใบแจ้งซ่อมสำหรับรถคันนี้</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingVehicle(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Bulk Import Modal */}
      <VehicleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentCount={vehicles.length}
        existingVehicles={vehicles}
        onImportVehicles={(importedList, mode) => {
          if (onBulkImportVehicles) {
            onBulkImportVehicles(importedList, mode);
          } else {
            // Fallback to sequential add
            importedList.forEach(v => onAddVehicle(v));
          }
        }}
      />

      {/* Delete Vehicle Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center">
              ยืนยันการลบข้อมูลทะเบียนรถ
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณต้องการลบข้อมูลรถคันนี้ออกจากสารระบบทะเบียนใช่หรือไม่?
            </p>
            
            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ทะเบียนรถ:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-sm">
                  🚚 {vehicleToDelete.licensePlate} ({vehicleToDelete.province})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ลำดับ ERP:</span>
                <span className="font-mono font-bold text-slate-900">
                  {vehicleToDelete.erpNo || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ผู้ประกอบการ / สังกัด:</span>
                <span className="font-semibold text-slate-800">
                  {vehicleToDelete.carrierCompany} ({vehicleToDelete.department})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ยี่ห้อ / รุ่น:</span>
                <span className="font-medium text-slate-700">
                  {vehicleToDelete.vehicleBrand} {vehicleToDelete.vehicleModel}
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 text-center font-medium">
              ⚠️ คำเตือน: หากลบแล้ว ข้อมูลรถและประวัติจะไม่สามารถกู้คืนได้
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบข้อมูลรถ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
