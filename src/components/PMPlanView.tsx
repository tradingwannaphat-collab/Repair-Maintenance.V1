import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Calendar, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  Wrench, 
  DollarSign, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  Square, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  Printer, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  RefreshCw, 
  Download, 
  HelpCircle,
  TrendingUp,
  Info,
  X,
  Upload,
  FileUp,
  Check,
  CheckCheck,
  AlertCircle
} from "lucide-react";
import { 
  PMMonthlyScheduleItem, 
  VehicleRecord, 
  PMPlanType, 
  PMPlanStatus, 
  VehicleType, 
  RepairTicket 
} from "../types";
import { PM_TYPE_CONFIG, MONTH_NAMES_TH, MONTH_SHORT_TH } from "../data/pmPlanData";
import { ISO_DOCUMENT_REGISTRY } from "../data/isoDocumentConfig";
import { VEHICLE_TYPE_LABELS } from "../data/categories";
import { 
  exportPMMonthlyScheduleToExcel, 
  exportPMMonthlyScheduleToCSV, 
  exportPMAnnualMatrixToExcel,
  parsePMScheduleFile,
  downloadPMScheduleTemplate,
  PMScheduleImportResult,
  normalizeLicensePlate
} from "../utils/excelImportExport";

interface PMPlanViewProps {
  schedules: PMMonthlyScheduleItem[];
  vehicles: VehicleRecord[];
  tickets: RepairTicket[];
  onAddSchedule: (schedule: PMMonthlyScheduleItem) => void;
  onUpdateSchedule: (schedule: PMMonthlyScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onCreateTicketFromPM: (schedule: PMMonthlyScheduleItem) => void;
  onAutoGenerateAnnualPlan: (year: number) => void;
  onReloadSamplePlan?: () => void;
  onImportSchedules?: (items: PMMonthlyScheduleItem[], mode: "append" | "replace") => void;
}

export const PMPlanView: React.FC<PMPlanViewProps> = ({
  schedules,
  vehicles,
  tickets,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onCreateTicketFromPM,
  onAutoGenerateAnnualPlan,
  onReloadSamplePlan,
  onImportSchedules
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All Months (12-Month View)
  const [viewMode, setViewMode] = useState<"monthly_list" | "annual_matrix">("annual_matrix");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedPMTypeFilter, setSelectedPMTypeFilter] = useState<string>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PMMonthlyScheduleItem | null>(null);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<PMMonthlyScheduleItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReloadConfirmModalOpen, setIsReloadConfirmModalOpen] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<PMScheduleImportResult | null>(null);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    vehicleId: string;
    year: number;
    month: number;
    plannedDate: string;
    pmType: PMPlanType;
    targetMileage: number;
    estimatedCost: number;
    assignedTechnician: string;
    notes: string;
  }>({
    vehicleId: vehicles[0]?.id || "",
    year: 2026,
    month: 1,
    plannedDate: "2026-01-15",
    pmType: "pm1_minor",
    targetMileage: 10000,
    estimatedCost: 3500,
    assignedTechnician: "ช่างวิชาญ สมานใจ",
    notes: ""
  });

  const isoInfo = ISO_DOCUMENT_REGISTRY.pm_plan;

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      if (item.year !== selectedYear) return false;
      if (selectedMonth > 0 && item.month !== selectedMonth) return false;
      
      if (selectedTypeFilter !== "all" && item.vehicleType !== selectedTypeFilter) return false;
      if (selectedStatusFilter !== "all" && item.status !== selectedStatusFilter) return false;
      if (selectedPMTypeFilter !== "all" && item.pmType !== selectedPMTypeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPlate = (item.licensePlate || "").toLowerCase().includes(q);
        const matchErp = (item.erpNo || "").toLowerCase().includes(q);
        const matchBrand = (item.vehicleBrand || "").toLowerCase().includes(q);
        const matchModel = (item.vehicleModel || "").toLowerCase().includes(q);
        const matchDriver = (item.driverName || "").toLowerCase().includes(q);
        const matchTech = (item.assignedTechnician || "").toLowerCase().includes(q);
        const matchCode = (item.pmPlanCode || "").toLowerCase().includes(q);
        if (!matchPlate && !matchErp && !matchBrand && !matchModel && !matchDriver && !matchTech && !matchCode) {
          return false;
        }
      }

      return true;
    });
  }, [schedules, selectedYear, selectedMonth, selectedTypeFilter, selectedStatusFilter, selectedPMTypeFilter, searchQuery]);

  // Statistics for Current Year
  const yearSchedules = useMemo(() => schedules.filter(s => s.year === selectedYear), [schedules, selectedYear]);
  const stats = useMemo(() => {
    const total = yearSchedules.length;
    const completed = yearSchedules.filter(s => s.status === "completed").length;
    const inProgress = yearSchedules.filter(s => s.status === "in_progress").length;
    const overdue = yearSchedules.filter(s => s.status === "overdue").length;
    const planned = yearSchedules.filter(s => s.status === "planned").length;
    const totalEstCost = yearSchedules.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
    const totalActCost = yearSchedules.reduce((sum, s) => sum + (s.actualCost || (s.status === "completed" ? s.estimatedCost : 0)), 0);
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      planned,
      totalEstCost,
      totalActCost,
      complianceRate
    };
  }, [yearSchedules]);

  // Display Vehicles (Merge vehicles from registry with any vehicles that have PM schedules)
  const displayVehicles = useMemo(() => {
    const vehicleMap = new Map<string, VehicleRecord>();
    vehicles.forEach(v => {
      const key = normalizeLicensePlate(v.licensePlate) || v.id;
      if (key) vehicleMap.set(key, v);
    });

    // Also include vehicles found in yearSchedules so no schedule is hidden
    yearSchedules.forEach(s => {
      const key = normalizeLicensePlate(s.licensePlate) || s.vehicleId;
      if (key && !vehicleMap.has(key)) {
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
          currentMileage: s.lastServiceMileage || s.targetMileage || 0,
          fuelType: "diesel",
          status: "active",
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        });
      }
    });

    let list = Array.from(vehicleMap.values());

    if (selectedTypeFilter !== "all") {
      list = list.filter(v => v.vehicleType === selectedTypeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.licensePlate || "").toLowerCase().includes(q) ||
        (v.oldLicensePlate || "").toLowerCase().includes(q) ||
        (v.erpNo || "").toLowerCase().includes(q) ||
        ((v as any).vehicleBrand || v.brand || "").toLowerCase().includes(q) ||
        ((v as any).vehicleModel || v.model || "").toLowerCase().includes(q) ||
        (v.driverName || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [vehicles, yearSchedules, selectedTypeFilter, searchQuery]);

  // File Upload Handler for PM Schedules
  const handleFileSelected = async (file: File) => {
    setImportFile(file);
    setIsParsing(true);
    setImportError(null);
    setImportResult(null);

    try {
      const result = await parsePMScheduleFile(file, vehicles, selectedYear);
      setImportResult(result);
      if (!result.success || result.data.length === 0) {
        setImportError(result.errors.join("\n") || "ไม่พบข้อมูลตาราง PM ในไฟล์ กรุณาตรวจสอบหัวตาราง");
      }
    } catch (err: any) {
      setImportError(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message || String(err)}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult || !importResult.data || importResult.data.length === 0) return;
    
    if (onImportSchedules) {
      onImportSchedules(importResult.data, importMode);
    } else {
      // Fallback if no bulk prop
      importResult.data.forEach(item => onAddSchedule(item));
    }

    showToast(`นำเข้าข้อมูลแผน PM สำเร็จ ${importResult.data.length} รายการ (${importResult.summary.vehiclesCovered} คัน)`);
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  // Handle Open Create Modal
  const handleOpenAddModal = (defaultVehicleId?: string, defaultMonth?: number) => {
    const targetVeh = defaultVehicleId ? vehicles.find(v => v.id === defaultVehicleId) : vehicles[0];
    const month = defaultMonth || (selectedMonth > 0 ? selectedMonth : 1);
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    
    setFormData({
      vehicleId: targetVeh ? targetVeh.id : "",
      year: selectedYear,
      month: month,
      plannedDate: `${selectedYear}-${monthStr}-15`,
      pmType: "pm1_minor",
      targetMileage: targetVeh ? (targetVeh.currentMileage || 0) + 10000 : 20000,
      estimatedCost: PM_TYPE_CONFIG.pm1_minor.estimatedCost,
      assignedTechnician: "ช่างวิชาญ สมานใจ",
      notes: ""
    });
    setEditingSchedule(null);
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (item: PMMonthlyScheduleItem) => {
    setEditingSchedule(item);
    setFormData({
      vehicleId: item.vehicleId,
      year: item.year,
      month: item.month,
      plannedDate: item.plannedDate,
      pmType: item.pmType,
      targetMileage: item.targetMileage,
      estimatedCost: item.estimatedCost,
      assignedTechnician: item.assignedTechnician || "",
      notes: item.notes || ""
    });
    setIsAddModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find(v => v.id === formData.vehicleId);
    if (!targetVeh) return;

    const pmConfig = PM_TYPE_CONFIG[formData.pmType];
    const defaultChecklists = pmConfig.standardChecklist.map((text, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      item: text,
      category: "ตรวจเช็คตามระยะ",
      isChecked: false
    }));

    if (editingSchedule) {
      const updated: PMMonthlyScheduleItem = {
        ...editingSchedule,
        vehicleId: targetVeh.id,
        licensePlate: targetVeh.licensePlate,
        erpNo: targetVeh.erpNo,
        province: targetVeh.province,
        vehicleBrand: targetVeh.vehicleBrand,
        vehicleModel: targetVeh.vehicleModel,
        vehicleType: targetVeh.vehicleType,
        carrierCompany: targetVeh.carrierCompany,
        department: targetVeh.department,
        driverName: targetVeh.driverName,
        year: formData.year,
        month: formData.month,
        plannedDate: formData.plannedDate,
        pmType: formData.pmType,
        pmTypeName: pmConfig.nameTh,
        targetMileage: formData.targetMileage,
        estimatedCost: formData.estimatedCost,
        assignedTechnician: formData.assignedTechnician,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };
      onUpdateSchedule(updated);
    } else {
      const codeMonth = formData.month < 10 ? `0${formData.month}` : `${formData.month}`;
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const newSchedule: PMMonthlyScheduleItem = {
        id: `PM-${formData.year}-${codeMonth}-${randomSeq}`,
        pmPlanCode: `PM-${formData.year}-${codeMonth}-${randomSeq}`,
        isoDocNumber: isoInfo.fullCode,
        vehicleId: targetVeh.id,
        licensePlate: targetVeh.licensePlate,
        erpNo: targetVeh.erpNo,
        province: targetVeh.province,
        vehicleBrand: targetVeh.vehicleBrand,
        vehicleModel: targetVeh.vehicleModel,
        vehicleType: targetVeh.vehicleType,
        carrierCompany: targetVeh.carrierCompany,
        department: targetVeh.department,
        driverName: targetVeh.driverName,
        year: formData.year,
        month: formData.month,
        plannedDate: formData.plannedDate,
        pmType: formData.pmType,
        pmTypeName: pmConfig.nameTh,
        targetMileage: formData.targetMileage,
        lastServiceMileage: targetVeh.currentMileage,
        status: "planned",
        estimatedCost: formData.estimatedCost,
        assignedTechnician: formData.assignedTechnician,
        checklists: defaultChecklists,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddSchedule(newSchedule);
    }

    setIsAddModalOpen(false);
  };

  // Toggle Checklist Item
  const handleToggleChecklist = (scheduleId: string, checkId: string) => {
    const target = schedules.find(s => s.id === scheduleId);
    if (!target) return;

    const updatedChecklists = target.checklists.map(c => 
      c.id === checkId ? { ...c, isChecked: !c.isChecked } : c
    );

    const allChecked = updatedChecklists.every(c => c.isChecked);
    const someChecked = updatedChecklists.some(c => c.isChecked);

    const newStatus: PMPlanStatus = allChecked ? "completed" : someChecked ? "in_progress" : target.status;

    const updated: PMMonthlyScheduleItem = {
      ...target,
      checklists: updatedChecklists,
      status: target.status === "completed" ? "completed" : newStatus,
      updatedAt: new Date().toISOString()
    };

    onUpdateSchedule(updated);
    if (selectedScheduleDetail?.id === scheduleId) {
      setSelectedScheduleDetail(updated);
    }
  };

  // Quick Status Change
  const handleStatusChange = (schedule: PMMonthlyScheduleItem, newStatus: PMPlanStatus) => {
    const updated: PMMonthlyScheduleItem = {
      ...schedule,
      status: newStatus,
      actualDate: newStatus === "completed" ? (schedule.actualDate || new Date().toISOString().split("T")[0]) : schedule.actualDate,
      actualCost: newStatus === "completed" ? (schedule.actualCost ?? schedule.estimatedCost) : schedule.actualCost,
      updatedAt: new Date().toISOString()
    };
    onUpdateSchedule(updated);
    if (selectedScheduleDetail?.id === schedule.id) {
      setSelectedScheduleDetail(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ISO Document Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                ISO ควบคุม: {isoInfo.fullCode}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-medium">
                {isoInfo.standardReference}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                บังคับใช้: {isoInfo.effectiveDate}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <CalendarDays className="w-6 h-6 text-blue-400" />
              แผนการบำรุงรักษาเชิงป้องกันยานพาหนะ (Preventive Maintenance Master Plan)
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              ตารางกำหนดการและควบคุมการตรวจเช็คระยะยานพาหนะประจำปีและรายเดือน (PM 1, PM 2, PM 3, Annual Inspection) 
              ตามมาตรฐานคุณภาพ ISO 9001 / ISO 39001 เพื่อลดการเกิด Breakdown และรักษาความพร้อมสูงสุดของกองรถ TNB
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {onReloadSamplePlan && (
              <button
                onClick={() => setIsReloadConfirmModalOpen(true)}
                id="btn-reload-sample-2026"
                title="โหลดชุดข้อมูลแผน PM มกราคม - ธันวาคม 2026 จากข้อมูลรถจริง"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 rounded-xl text-xs font-semibold border border-indigo-500/40 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-300" />
                <span>โหลดข้อมูลตัวอย่าง 2026</span>
              </button>
            )}

            <button
              onClick={() => setIsImportModalOpen(true)}
              id="btn-import-pm-excel"
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 rounded-xl text-xs font-semibold shadow-md transition-all border border-blue-500/40"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>นำเข้า Excel / CSV</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              id="btn-export-pm-excel"
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all border border-emerald-500/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              id="btn-add-pm-plan"
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all border border-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มแผน PM รถ</span>
            </button>

            <button
              onClick={() => setIsAutoGenerateModalOpen(true)}
              id="btn-auto-gen-pm"
              title="สร้างแผน PM อัตโนมัติสำหรับทั้งกองรถตามรอบเลขไมล์"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">จัดแผนอัตโนมัติ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div 
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border transition-all animate-bounce ${
            toastMessage.type === "success" 
              ? "bg-emerald-950 text-emerald-200 border-emerald-500" 
              : "bg-red-950 text-red-200 border-red-500"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>แผนทั้งหมด ปี {selectedYear}</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400 ml-1.5">งาน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            รถในสังกัด {vehicles.length} คัน
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>ดำเนินการเสร็จ (Done)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.completed}</span>
            <span className="text-xs text-emerald-400/80 ml-1.5">งาน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            คิดเป็น {stats.complianceRate}% ของแผน
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>กำลังทำ / รออะไหล่</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.inProgress}</span>
            <span className="text-xs text-amber-400/80 ml-1.5">งาน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ในอู่ซ่อมบำรุง
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-blue-400 text-xs">
            <span>ตามกำหนด (Scheduled)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-400 font-mono">{stats.planned}</span>
            <span className="text-xs text-blue-400/80 ml-1.5">งาน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            นัดหมายล่วงหน้า
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-red-400 text-xs">
            <span>เกินกำหนด (Overdue)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-red-400 font-mono">{stats.overdue}</span>
            <span className="text-xs text-red-400/80 ml-1.5">งาน</span>
          </div>
          <div className="text-[11px] text-red-400/80 mt-1">
            {stats.overdue > 0 ? "ต้องเร่งเปิดใบซ่อม" : "ไม่มีงานค้างตกหล่น"}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ประมาณการงบประมาณ</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white font-mono">฿{(stats.totalEstCost / 1000).toFixed(0)}k</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            จ่ายจริง ฿{(stats.totalActCost / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Year Selector & Month Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
        {/* Top Control Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              {[2025, 2026, 2027].map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedYear === yr
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ปี {yr} ({yr + 543})
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => {
                  setViewMode("annual_matrix");
                  setSelectedMonth(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "annual_matrix"
                    ? "bg-slate-800 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>แผนผัง 12 เดือน (Matrix)</span>
              </button>

              <button
                onClick={() => setViewMode("monthly_list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "monthly_list"
                    ? "bg-slate-800 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ตารางงานรายเดือน (List)</span>
              </button>
            </div>
          </div>

          {/* Quick Search & Filters */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาทะเบียน, ERP, ช่าง, รหัส PM..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedPMTypeFilter}
              onChange={(e) => setSelectedPMTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ทุกประเภท PM</option>
              <option value="pm1_minor">PM 1: เช็คระยะย่อย (A)</option>
              <option value="pm2_intermediate">PM 2: เช็คระยะกลาง (B)</option>
              <option value="pm3_major">PM 3: เช็คระยะใหญ่ (C)</option>
              <option value="pm_annual">ตรวจสภาพประจำปี</option>
            </select>
          </div>
        </div>

        {/* 12 Months Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedMonth(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedMonth === 0
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>ทั้งปี {selectedYear} (12 เดือน)</span>
            <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-mono font-normal">
              {yearSchedules.length}
            </span>
          </button>

          {MONTH_SHORT_TH.map((shortName, idx) => {
            const m = idx + 1;
            const countInMonth = yearSchedules.filter(s => s.month === m).length;
            const hasOverdue = yearSchedules.some(s => s.month === m && s.status === "overdue");
            const isCompletedAll = countInMonth > 0 && yearSchedules.filter(s => s.month === m).every(s => s.status === "completed");

            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setViewMode("monthly_list");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedMonth === m
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span>{shortName}</span>
                {countInMonth > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isCompletedAll 
                      ? "bg-emerald-500/20 text-emerald-300"
                      : hasOverdue
                      ? "bg-red-500/20 text-red-300"
                      : "bg-slate-800 text-slate-300"
                  }`}>
                    {countInMonth}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: ANNUAL 12-MONTH MATRIX VIEW (แผนผัง 12 เดือนรายคัน) */}
      {viewMode === "annual_matrix" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  ตารางแผนแม่บท PM รายคัน 12 เดือน ประจำปี {selectedYear} ({vehicles.length} คัน)
                </h2>
                <p className="text-[11px] text-slate-400">
                  คลิกที่ช่องเดือนเพื่อดูรายละเอียด หรือคลิกปุ่ม (+) เพื่อนัดหมายแผน PM ให้รถคันนั้น
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> เสร็จสิ้น
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> กำลังทำ
              </span>
              <span className="flex items-center gap-1 text-blue-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> ตามแผน
              </span>
              <span className="flex items-center gap-1 text-red-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> เกินกำหนด
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3 w-40">ข้อมูลรถ & No. ERP</th>
                  <th className="p-3 w-32">ประเภท & สังกัด</th>
                  <th className="p-3 w-28 text-right">ไมล์ล่าสุด</th>
                  {MONTH_SHORT_TH.map((mName, i) => (
                    <th key={i} className="p-2.5 text-center w-24 border-l border-slate-800/60 font-mono">
                      {mName}
                    </th>
                  ))}
                  <th className="p-3 w-24 text-center border-l border-slate-800">สรุปปี</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {displayVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <CalendarDays className="w-10 h-10 text-slate-600" />
                        <div className="text-sm font-semibold text-slate-400">
                          {searchQuery || selectedTypeFilter !== "all" 
                            ? "ไม่พบข้อมูลรถหรือแผน PM ตามตัวกรองที่เลือก" 
                            : "ยังไม่มีข้อมูลแผนงาน PM ประจำปี " + selectedYear}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          {onReloadSamplePlan && (
                            <button
                              onClick={() => setIsReloadConfirmModalOpen(true)}
                              className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors"
                            >
                              โหลดข้อมูลตัวอย่าง 2026 (รถจริง 12 เดือน)
                            </button>
                          )}
                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-semibold transition-colors"
                          >
                            นำเข้าไฟล์ Excel / CSV
                          </button>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedTypeFilter("all");
                              setSelectedStatusFilter("all");
                              setSelectedPMTypeFilter("all");
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            ล้างตัวกรอง
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayVehicles.map((veh, vIdx) => {
                    const vehNorm = normalizeLicensePlate(veh.licensePlate);
                    const vehSchedules = yearSchedules.filter(s => 
                      s.vehicleId === veh.id || 
                      (vehNorm && normalizeLicensePlate(s.licensePlate) === vehNorm)
                    );
                    const completedCount = vehSchedules.filter(s => s.status === "completed").length;

                    return (
                      <tr key={veh.id || vIdx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-mono">{vIdx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-white font-mono flex items-center gap-1.5">
                            <span>{veh.licensePlate}</span>
                            {veh.erpNo && (
                              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] rounded border border-blue-500/30">
                                {veh.erpNo}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {veh.vehicleBrand} {veh.vehicleModel}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            คนขับ: {veh.driverName || "-"}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-300 text-[11px]">
                            {VEHICLE_TYPE_LABELS[veh.vehicleType] || veh.vehicleType}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {veh.carrierCompany || "TNB"} • {veh.department}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300">
                          {veh.currentMileage ? veh.currentMileage.toLocaleString() : 0} กม.
                        </td>

                        {/* 12 Month Cells */}
                        {Array.from({ length: 12 }, (_, mIdx) => {
                          const monthNum = mIdx + 1;
                          const monthItems = vehSchedules.filter(s => s.month === monthNum);

                          return (
                            <td 
                              key={monthNum} 
                              className="p-1.5 text-center border-l border-slate-800/60 align-middle"
                            >
                              {monthItems.length === 0 ? (
                                <button
                                  onClick={() => handleOpenAddModal(veh.id, monthNum)}
                                  title={`+ เพิ่มแผน PM เดือน ${MONTH_NAMES_TH[mIdx]} ให้ ${veh.licensePlate}`}
                                  className="w-full h-8 rounded-lg border border-dashed border-slate-800 text-slate-600 hover:text-slate-300 hover:border-slate-600 hover:bg-slate-800/40 flex items-center justify-center transition-all group"
                                >
                                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </button>
                              ) : (
                                <div className="space-y-1">
                                  {monthItems.map(item => {
                                    const isDone = item.status === "completed";
                                    const isProgress = item.status === "in_progress";
                                    const isOverdue = item.status === "overdue";

                                    const typeCode = 
                                      item.pmType === "pm1_minor" ? "PM1" :
                                      item.pmType === "pm2_intermediate" ? "PM2" :
                                      item.pmType === "pm3_major" ? "PM3" :
                                      item.pmType === "pm_annual" ? "ตรวจปี" : "PM";

                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => setSelectedScheduleDetail(item)}
                                        className={`w-full px-1.5 py-1 rounded-lg text-[10px] font-semibold text-left transition-all border block shadow-xs ${
                                          isDone
                                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/90"
                                            : isProgress
                                            ? "bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/90 animate-pulse"
                                            : isOverdue
                                            ? "bg-red-950/80 text-red-300 border-red-500/40 hover:bg-red-900/90"
                                            : "bg-blue-950/80 text-blue-300 border-blue-500/40 hover:bg-blue-900/90"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between font-mono">
                                          <span className="font-bold">{typeCode}</span>
                                          <span>{item.plannedDate.substring(8, 10)}</span>
                                        </div>
                                        <div className="truncate text-[9px] opacity-80">
                                          {isDone ? "✓ เสร็จแล้ว" : isProgress ? "⚡ กำลังทำ" : isOverdue ? "⚠ เกินเวลา" : "○ นัดแล้ว"}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Summary for the year */}
                        <td className="p-3 text-center border-l border-slate-800 font-mono">
                          <span className="font-bold text-white">{completedCount}</span>
                          <span className="text-slate-500">/{vehSchedules.length}</span>
                          <div className="text-[10px] text-emerald-400">
                            {vehSchedules.length > 0 ? `${Math.round((completedCount / vehSchedules.length) * 100)}%` : "-"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY LIST & EXECUTION VIEW (ตารางงานรายเดือน & สั่งซ่อม) */}
      {viewMode === "monthly_list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>
                รายการแผน PM {selectedMonth > 0 ? `ประจำเดือน ${MONTH_NAMES_TH[selectedMonth - 1]}` : `ทั้งปี ${selectedYear}`} ({filteredSchedules.length} รายการ)
              </span>
            </h2>

            <div className="text-xs text-slate-400">
              ISO Control: <span className="font-mono text-blue-400">{isoInfo.fullCode}</span>
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">
                {searchQuery || selectedTypeFilter !== "all" || selectedStatusFilter !== "all" || selectedPMTypeFilter !== "all"
                  ? "ไม่พบรายการแผนงาน PM ตามตัวกรองที่เลือก"
                  : `ยังไม่มีข้อมูลแผนงาน PM ${selectedMonth > 0 ? `เดือน ${MONTH_NAMES_TH[selectedMonth - 1]}` : `ปี ${selectedYear}`}`}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                คุณสามารถโหลดข้อมูลตัวอย่างรถจริง 2026, นำเข้าจากไฟล์ Excel / CSV หรือสร้างแผนใหม่ได้ทันที
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {onReloadSamplePlan && (
                  <button
                    onClick={() => setIsReloadConfirmModalOpen(true)}
                    className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors"
                  >
                    โหลดข้อมูลตัวอย่าง 2026 (รถจริง 12 เดือน)
                  </button>
                )}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>นำเข้า Excel / CSV</span>
                </button>
                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มแผน PM รถ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map(item => {
                const pmMeta = PM_TYPE_CONFIG[item.pmType];
                const isCompleted = item.status === "completed";
                const isInProgress = item.status === "in_progress";
                const isOverdue = item.status === "overdue";
                const totalChecklist = item.checklists?.length || 0;
                const checkedCount = item.checklists?.filter(c => c.isChecked).length || 0;
                const checklistPercent = totalChecklist > 0 ? Math.round((checkedCount / totalChecklist) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all space-y-3"
                  >
                    {/* Card Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-base font-bold text-white">
                              {item.licensePlate}
                            </span>
                            {item.erpNo && (
                              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] font-mono rounded border border-blue-500/30">
                                {item.erpNo}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.vehicleBrand} {item.vehicleModel} • {VEHICLE_TYPE_LABELS[item.vehicleType] || item.vehicleType}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : isInProgress
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                            : isOverdue
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        }`}>
                          {isCompleted ? "✓ เสร็จสิ้น" : isInProgress ? "⚡ กำลังซ่อม" : isOverdue ? "⚠ เกินกำหนด" : "○ ตามแผน"}
                        </span>
                      </div>

                      {/* PM Type Pill */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${pmMeta?.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                          {pmMeta?.nameTh || item.pmType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.plannedDate}
                        </span>
                      </div>
                    </div>

                    {/* Target & Driver Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block">เป้าหมายเลขไมล์:</span>
                        <span className="font-mono font-bold text-slate-200">{item.targetMileage.toLocaleString()} กม.</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">นายช่างผู้รับผิดชอบ:</span>
                        <span className="font-medium text-slate-200 truncate block">{item.assignedTechnician || "-"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">ประมาณการค่าใช้จ่าย:</span>
                        <span className="font-mono font-bold text-amber-400">฿{item.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">พนักงานขับรถ:</span>
                        <span className="text-slate-300 truncate block">{item.driverName || "-"}</span>
                      </div>
                    </div>

                    {/* Checklist Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                          รายการตรวจเช็ค: {checkedCount}/{totalChecklist} ข้อ
                        </span>
                        <span className="font-mono font-bold text-slate-300">{checklistPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${checklistPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedScheduleDetail(item)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          ตรวจเช็ค/รายละเอียด
                        </button>
                        
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="แก้ไขแผนงาน"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.ticketNumber ? (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-[11px] font-mono rounded-lg border border-purple-500/30 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {item.ticketNumber}
                        </span>
                      ) : (
                        <button
                          onClick={() => onCreateTicketFromPM(item)}
                          id={`btn-open-ticket-pm-${item.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>เปิดใบสั่งซ่อม</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PM SCHEDULE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>{editingSchedule ? "แก้ไขแผนงาน PM" : "นัดหมาย / เพิ่มแผนงาน PM ใหม่"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Select Vehicle */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เลือกยานพาหนะเป้าหมาย *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => {
                    const selVeh = vehicles.find(v => v.id === e.target.value);
                    setFormData({
                      ...formData,
                      vehicleId: e.target.value,
                      targetMileage: selVeh ? (selVeh.currentMileage || 0) + 10000 : formData.targetMileage
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                  required
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} {v.erpNo ? `(${v.erpNo})` : ""} - {v.vehicleBrand} {v.vehicleModel} ({v.carrierCompany || "TNB"})
                    </option>
                  ))}
                </select>
              </div>

              {/* PM Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ประเภทงาน PM (Preventive Maintenance Level) *
                </label>
                <select
                  value={formData.pmType}
                  onChange={(e) => {
                    const type = e.target.value as PMPlanType;
                    setFormData({
                      ...formData,
                      pmType: type,
                      estimatedCost: PM_TYPE_CONFIG[type]?.estimatedCost || 3500
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="pm1_minor">PM 1: เช็คระยะย่อย (A-Service 10k-20k km)</option>
                  <option value="pm2_intermediate">PM 2: เช็คระยะกลาง (B-Service 40k-50k km)</option>
                  <option value="pm3_major">PM 3: เช็คระยะใหญ่ (C-Service 80k-100k km)</option>
                  <option value="pm_annual">PM ตรวจสภาพประจำปี (Annual / DLT)</option>
                  <option value="pm_custom">PM เฉพาะกิจ / ตรวจสภาพพิเศษ</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {PM_TYPE_CONFIG[formData.pmType]?.description}
                </p>
              </div>

              {/* Date & Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    วันที่กำหนดตามแผน (Planned Date) *
                  </label>
                  <input
                    type="date"
                    value={formData.plannedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const parsedDate = new Date(val);
                        const m = parsedDate.getMonth() + 1;
                        const yr = parsedDate.getFullYear();
                        setFormData({
                          ...formData,
                          plannedDate: val,
                          month: m,
                          year: yr
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    เป้าหมายเลขไมล์ (กม.) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetMileage}
                    onChange={(e) => setFormData({ ...formData, targetMileage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Cost & Technician */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ประมาณการค่าใช้จ่าย (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    นายช่างผู้รับผิดชอบ
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTechnician}
                    onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                    placeholder="เช่น ช่างวิชาญ, ช่างสมเกียรติ"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  หมายเหตุ / วัตถุประสงค์พิเศษ
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="เช่น ตรวจสภาพก่อนวิ่งงานขึ้นเหนือ, สั่งกรองโซล่าล่วงหน้า"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all"
                >
                  {editingSchedule ? "บันทึกการแก้ไข" : "บันทึกแผนงาน PM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE DETAIL & CHECKLIST INSPECTION */}
      {selectedScheduleDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-mono">
                    {selectedScheduleDetail.licensePlate}
                  </span>
                  {selectedScheduleDetail.erpNo && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-mono rounded border border-blue-500/30">
                      {selectedScheduleDetail.erpNo}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    ({selectedScheduleDetail.pmPlanCode})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedScheduleDetail.vehicleBrand} {selectedScheduleDetail.vehicleModel} • {selectedScheduleDetail.carrierCompany || "TNB"}
                </p>
              </div>

              <button
                onClick={() => setSelectedScheduleDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">สถานะงาน:</span>
                <select
                  value={selectedScheduleDetail.status}
                  onChange={(e) => handleStatusChange(selectedScheduleDetail, e.target.value as PMPlanStatus)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="planned">○ ตามแผนงาน (Scheduled)</option>
                  <option value="in_progress">⚡ กำลังดำเนินการซ่อมบำรุง</option>
                  <option value="completed">✓ ดำเนินการเสร็จสมบูรณ์</option>
                  <option value="overdue">⚠ เกินกำหนดเวลาแผนงาน</option>
                  <option value="cancelled">✕ ยกเลิก/เลื่อนแผน</option>
                </select>
              </div>

              <div className="text-slate-400 font-mono">
                กำหนดวันที่: <strong className="text-white">{selectedScheduleDetail.plannedDate}</strong>
              </div>
            </div>

            {/* Checklist Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <span>รายการตรวจสอบตามเกณฑ์มาตรฐาน (PM Checklist Item Inspection)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  ISO: {selectedScheduleDetail.isoDocNumber || isoInfo.fullCode}
                </span>
              </div>

              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedScheduleDetail.checklists?.map((item, idx) => (
                  <label
                    key={item.id || idx}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900/80 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => handleToggleChecklist(selectedScheduleDetail.id, item.id)}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className={`${item.isChecked ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {idx + 1}. {item.item}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes & Actions */}
            {selectedScheduleDetail.notes && (
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">หมายเหตุ:</span>
                <p className="text-slate-300">{selectedScheduleDetail.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("คุณต้องการลบแผนงาน PM นี้ใช่หรือไม่?")) {
                    onDeleteSchedule(selectedScheduleDetail.id);
                    setSelectedScheduleDetail(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบแผนงาน</span>
              </button>

              <div className="flex items-center gap-2">
                {!selectedScheduleDetail.ticketNumber && (
                  <button
                    onClick={() => {
                      onCreateTicketFromPM(selectedScheduleDetail);
                      setSelectedScheduleDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>เปิดใบสั่งซ่อม (Create Work Order)</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedScheduleDetail(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPORT EXCEL MODAL (ตามมาตรฐาน ISO) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>ส่งออกแผน PM เป็น Excel (ISO {isoInfo.docCode})</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                เลือกรูปแบบรายงานแผน PM ที่ต้องการส่งออกตามมาตรฐานเอกสารคุณภาพ ISO 9001 / ISO 39001:
              </p>

              {/* Option 1: 12-Month Matrix */}
              <button
                onClick={() => {
                  exportPMAnnualMatrixToExcel(vehicles, schedules, selectedYear);
                  setIsExportModalOpen(false);
                }}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-emerald-300">
                    1. ตารางแผนแม่บท 12 เดือน รายคัน (12-Month Annual Matrix)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    แสดงตารางภาพรวมรถทุกคัน x 12 เดือน ม.ค. - ธ.ค. พร้อมระดับ PM และสรุป % ความสำเร็จ
                  </div>
                </div>
              </button>

              {/* Option 2: Monthly List */}
              <button
                onClick={() => {
                  exportPMMonthlyScheduleToExcel(schedules, selectedYear, selectedMonth);
                  setIsExportModalOpen(false);
                }}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-300">
                    2. รายการแผนงาน PM {selectedMonth > 0 ? `เดือน ${MONTH_SHORT_TH[selectedMonth - 1]}` : `ทั้งปี ${selectedYear}`} (Detailed Schedule)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    รายละเอียดครบถ้วน รายการ Checklist, นายช่างผู้รับผิดชอบ, เลขไมล์, ประมาณการค่าใช้จ่าย
                  </div>
                </div>
              </button>

              {/* Option 3: CSV Format */}
              <button
                onClick={() => {
                  exportPMMonthlyScheduleToCSV(schedules, selectedYear, selectedMonth);
                  setIsExportModalOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-left transition-all text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>ส่งออกไฟล์แบบ Text / CSV (UTF-8)</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: AUTO-GENERATE ANNUAL PLAN MODAL */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>สร้างแผนแม่บท PM อัตโนมัติ ปี {selectedYear}</span>
              </h3>
              <button
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                ระบบจะคำนวณรอบการทำ PM สำหรับรถทุกคันในสังกัด ({vehicles.length} คัน) โดยอิงตามมาตรฐาน:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <li><strong>หัวลาก & รถบรรทุกหนัก:</strong> ทุก 3 เดือน (PM1, PM2, PM3, ตรวจประจำปี)</li>
                <li><strong>หางพ่วง & เทลเลอร์:</strong> ทุก 6 เดือน (เช็คลูกปืนล้อ, เบรกลม, คิงพิน)</li>
                <li><strong>รถกระบะ & รถตู้:</strong> ทุก 6 เดือน หรือ 10,000 กม.</li>
              </ul>
              <p className="text-amber-400 text-[11px]">
                * แผนงานที่สร้างจะถูกบันทึกพร้อมหมายเลขเอกสาร ISO: {isoInfo.fullCode}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onAutoGenerateAnnualPlan(selectedYear);
                  setIsAutoGenerateModalOpen(false);
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>ยืนยันสร้างแผนอัตโนมัติ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: IMPORT PM EXCEL / CSV MODAL (รองรับทั้ง Matrix 12 เดือน และ Detailed List) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <span>นำเข้าแผนงาน PM จากไฟล์ Excel / CSV (ปี {selectedYear})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ระบบตรวจจับโครงสร้างไฟล์อัตโนมัติ (รองรับทั้งแบบตาราง 12 เดือน Matrix และแบบรายบรรทัด List)
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportResult(null);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelected(f);
                e.target.value = "";
              }}
            />

            {/* Upload Box / Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelected(f);
              }}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                importFile 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/40 bg-slate-950/40"
              }`}
            >
              <FileUp className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              {importFile ? (
                <div>
                  <p className="text-sm font-bold text-white font-mono">{importFile.name}</p>
                  <p className="text-xs text-blue-300 mt-1">
                    {(importFile.size / 1024).toFixed(1)} KB • คลิกเพื่อเปลี่ยนไฟล์
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-400 underline">คลิกเพื่อเลือกไฟล์</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV จากโปรแกรมควบคุมบำรุงรักษา
                  </p>
                </div>
              )}
            </div>

            {/* Parsing Indicator */}
            {isParsing && (
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-blue-300 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังอ่านและประมวลผลข้อมูลแผน PM...</span>
              </div>
            )}

            {/* Error Banner */}
            {importError && (
              <div className="p-3.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>ไม่สามารถนำเข้าข้อมูลได้</span>
                </div>
                <div className="whitespace-pre-line text-[11px] text-red-300/90 font-mono bg-red-950/80 p-2.5 rounded-lg">
                  {importError}
                </div>
              </div>
            )}

            {/* Import Summary & Preview */}
            {importResult && importResult.success && importResult.data.length > 0 && (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold">
                      {importResult.detectedFormat === "matrix" ? "ตารางแม่บท 12 เดือน (Matrix)" : "รายการละเอียด (Detailed List)"}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      พบแผนงาน {importResult.data.length} รายการ ({importResult.summary.vehiclesCovered} คัน)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ครอบคลุม {importResult.summary.monthsCovered.length} เดือน
                  </span>
                </div>

                {/* Mode Selector */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">รูปแบบการบันทึก:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      importMode === "append" 
                        ? "border-blue-500 bg-blue-500/10 text-white" 
                        : "border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === "append"}
                        onChange={() => setImportMode("append")}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-200">นำเข้าเพิ่มเติม (Append)</div>
                        <div className="text-[10px] text-slate-400">เพิ่มหรืออัปเดตทับเฉพาะรายการที่ตรงกัน</div>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      importMode === "replace" 
                        ? "border-amber-500 bg-amber-500/10 text-white" 
                        : "border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="text-amber-600"
                      />
                      <div>
                        <div className="font-semibold text-xs text-amber-300">แทนที่แผนปี {selectedYear} ทั้งหมด</div>
                        <div className="text-[10px] text-slate-400">ล้างแผนเดิมของปี {selectedYear} แล้วแทนที่ด้วยไฟล์นี้</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sample Preview Table */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ตัวอย่างข้อมูล 5 รายการแรก:</span>
                    <span>ทั้งหมด {importResult.data.length} รายการ</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-slate-800/80 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-900 text-slate-400 font-mono sticky top-0">
                        <tr>
                          <th className="p-1.5">ทะเบียน</th>
                          <th className="p-1.5">เดือน/วัน</th>
                          <th className="p-1.5">ระดับ PM</th>
                          <th className="p-1.5">ไมล์เป้าหมาย</th>
                          <th className="p-1.5">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {importResult.data.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-1.5 font-bold font-mono text-white">{row.licensePlate}</td>
                            <td className="p-1.5">{MONTH_SHORT_TH[row.month - 1]} ({row.plannedDate})</td>
                            <td className="p-1.5">{row.pmTypeName || row.pmType}</td>
                            <td className="p-1.5 font-mono">{row.targetMileage?.toLocaleString()} กม.</td>
                            <td className="p-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                row.status === "completed" ? "bg-emerald-950 text-emerald-300" :
                                row.status === "in_progress" ? "bg-amber-950 text-amber-300" :
                                "bg-blue-950 text-blue-300"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Template Download Section */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>ดาวน์โหลดไฟล์แม่แบบตัวอย่าง (Template)</span>
                </span>
                <span className="text-[11px] text-slate-500">กรอกข้อมูลแล้วนำเข้าได้ทันที</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => downloadPMScheduleTemplate("matrix")}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[11px]">1. Template ตารางแม่บท 12 เดือน (Matrix)</div>
                    <div className="text-[10px] text-slate-500">คอลัมน์ ม.ค. ถึง ธ.ค. รายคัน</div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => downloadPMScheduleTemplate("list")}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[11px]">2. Template รายการแผนงาน (Detailed List)</div>
                    <div className="text-[10px] text-slate-500">ละเอียดระบุวัน, ช่าง, งบประมาณ</div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportResult(null);
                  setImportError(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!importResult || !importResult.success || importResult.data.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันนำเข้าข้อมูล ({importResult?.data?.length || 0} รายการ)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM RELOAD 2026 SAMPLE PLAN MODAL */}
      {isReloadConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
                <span>โหลดข้อมูลตัวอย่างแผน PM ปี 2026</span>
              </h3>
              <button
                onClick={() => setIsReloadConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                ระบบจะสร้างและบันทึกชุดข้อมูลแผนงานบำรุงรักษาเชิงป้องกัน (PM Plan) ประจำปี 2026 (มกราคม - ธันวาคม 2026) โดยอ้างอิงจากข้อมูลรถจริงของกองรถ TNB ทุกคัน:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <li>ครอบคลุม 12 เดือนเต็ม (ม.ค. - ธ.ค. 2026)</li>
                <li>คำนวณรอบ PM1 (ย่อย), PM2 (กลาง), PM3 (ใหญ่), ตรวจประจำปี</li>
                <li>ลงข้อมูล Checklist, นายช่างผู้รับผิดชอบ, งบประมาณ และสถานะงานจริง</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsReloadConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReloadSamplePlan) {
                    onReloadSamplePlan();
                    showToast("โหลดข้อมูลตัวอย่างแผน PM ปี 2026 (ม.ค. - ธ.ค.) ครบถ้วนเรียบร้อยแล้ว");
                  }
                  setIsReloadConfirmModalOpen(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ยืนยันโหลดข้อมูลตัวอย่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
