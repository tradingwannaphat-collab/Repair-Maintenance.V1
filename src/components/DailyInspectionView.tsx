import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Printer, 
  Download, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Gauge, 
  FileText, 
  Info, 
  Eye, 
  Edit, 
  Trash2, 
  Wrench, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft,
  Smartphone,
  Table as TableIcon,
  Layers, 
  Activity, 
  Flame, 
  CheckSquare,
  HelpCircle,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { 
  VehicleRecord, 
  DailyVehicleInspectionRecord, 
  DailyInspectionCheckResult, 
  InspectionCheckStatus, 
  Priority, 
  RepairTicket 
} from "../types";
import { 
  DAILY_INSPECTION_ITEMS_TEMPLATE, 
  INSPECTION_CATEGORIES_CONFIG, 
  createDefaultInspectionResults 
} from "../data/dailyInspectionData";
import { DailyInspectionModal } from "./DailyInspectionModal";
import { DailyInspectionPrintModal } from "./DailyInspectionPrintModal";
import { SingleInspectionPdfModal } from "./SingleInspectionPdfModal";
import { exportDailyInspectionMatrixToExcel, exportDailyInspectionLogsToExcel } from "../utils/excelImportExport";

interface DailyInspectionViewProps {
  vehicles: VehicleRecord[];
  tickets: RepairTicket[];
  dailyInspections: DailyVehicleInspectionRecord[];
  currentBrand?: "tnb" | "koch" | "all";
  onAddDailyInspection: (record: DailyVehicleInspectionRecord, autoCreateTicket?: boolean) => void;
  onUpdateDailyInspection: (record: DailyVehicleInspectionRecord) => void;
  onDeleteDailyInspection: (id: string) => void;
  onRequestRepairForDefects?: (record: DailyVehicleInspectionRecord) => void;
  onLoadSampleMonthlyInspections?: () => void;
}

const MONTH_NAMES_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const DailyInspectionView: React.FC<DailyInspectionViewProps> = ({
  vehicles,
  tickets,
  dailyInspections,
  currentBrand = "tnb",
  onAddDailyInspection,
  onUpdateDailyInspection,
  onDeleteDailyInspection,
  onRequestRepairForDefects,
  onLoadSampleMonthlyInspections
}) => {
  // Navigation sub-tabs: matrix, records, diagram, analytics
  const [activeTab, setActiveTab] = useState<"matrix" | "records" | "diagram" | "analytics">("matrix");
  
  // Matrix view mode: single_vehicle (21 items x 31 days) vs all_fleet (vehicles x 31 days)
  const [matrixMode, setMatrixMode] = useState<"single_vehicle" | "all_fleet">("single_vehicle");

  // Selected Month & Year (Default to August 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Selected Vehicle for single-vehicle matrix
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => vehicles[0]?.id || "");

  // Mobile-friendly View Mode in Matrix Tab: 'day_card' vs 'matrix_table'
  const [matrixViewMode, setMatrixViewMode] = useState<"day_card" | "matrix_table">("day_card");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    const today = new Date().getDate();
    return today <= 31 ? today : 1;
  });
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);

  // Search & Filters for Records Tab
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printModalFormType, setPrintModalFormType] = useState<"filled" | "blank">("filled");
  const [singleInspectionPdfRecord, setSingleInspectionPdfRecord] = useState<DailyVehicleInspectionRecord | null>(null);
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<DailyVehicleInspectionRecord | null>(null);
  const [viewingRecordDetail, setViewingRecordDetail] = useState<DailyVehicleInspectionRecord | null>(null);

  // Active Vehicle Object
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Days count for selected month
  const daysInSelectedMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  }, []);

  // Filter records for selected month & year
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthRecords = useMemo(() => {
    return dailyInspections.filter((r) => r.date.startsWith(monthPrefix));
  }, [dailyInspections, monthPrefix]);

  // Today Date String
  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const todayRecords = useMemo(() => {
    return dailyInspections.filter((r) => r.date === todayStr);
  }, [dailyInspections, todayStr]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalVehiclesCount = vehicles.length;
    const inspectedToday = todayRecords.length;
    const passToday = todayRecords.filter((r) => r.overallStatus === "pass").length;
    const failToday = todayRecords.filter((r) => r.overallStatus === "fail").length;
    const skipToday = todayRecords.filter((r) => r.overallStatus === "skip").length;
    
    // On-time check before 08:00 AM
    const onTimeCount = todayRecords.filter((r) => {
      if (!r.time) return true;
      const [h, m] = r.time.split(":").map(Number);
      return h < 8 || (h === 8 && m === 0);
    }).length;

    const onTimeRate = inspectedToday > 0 ? Math.round((onTimeCount / inspectedToday) * 100) : 100;

    // Monthly total defect count
    const monthDefects = monthRecords.reduce((sum, r) => sum + (r.defectCount || 0), 0);

    return {
      totalVehiclesCount,
      inspectedToday,
      passToday,
      failToday,
      skipToday,
      onTimeRate,
      monthDefects,
      pendingToday: Math.max(0, totalVehiclesCount - inspectedToday)
    };
  }, [vehicles, todayRecords, monthRecords]);

  // Map for single vehicle 31-day records
  const singleVehicleDailyMap = useMemo(() => {
    if (!currentVehicle) return {};
    const map: { [day: number]: DailyVehicleInspectionRecord } = {};
    monthRecords.forEach((r) => {
      if (r.vehicleId === currentVehicle.id || r.licensePlate === currentVehicle.licensePlate) {
        const d = parseInt(r.date.split("-")[2], 10);
        if (d >= 1 && d <= 31) {
          map[d] = r;
        }
      }
    });
    return map;
  }, [currentVehicle, monthRecords]);

  // Filtered Inspection Records for Records Tab
  const filteredRecords = useMemo(() => {
    return dailyInspections.filter((rec) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          rec.docNumber.toLowerCase().includes(q) ||
          rec.licensePlate.toLowerCase().includes(q) ||
          rec.vehicleBrand.toLowerCase().includes(q) ||
          rec.driverName.toLowerCase().includes(q) ||
          rec.inspectorName.toLowerCase().includes(q) ||
          (rec.erpNo && rec.erpNo.toLowerCase().includes(q));
        if (!match) return false;
      }
      // Status
      if (filterStatus !== "all" && rec.overallStatus !== filterStatus) {
        return false;
      }
      // Department
      if (filterDepartment !== "all" && rec.department !== filterDepartment) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date + "T" + (b.time || "00:00")).getTime() - new Date(a.date + "T" + (a.time || "00:00")).getTime());
  }, [dailyInspections, searchQuery, filterStatus, filterDepartment]);

  // List of unique departments
  const departmentList = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.department) set.add(v.department);
    });
    return Array.from(set);
  }, [vehicles]);

  // Handle Open New Form
  const handleOpenNewModal = (preselectedVehicleId?: string, preselectedDateStr?: string) => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
    }
    setEditingRecord(null);
    setModalInitialDate(preselectedDateStr);
    setIsModalOpen(true);
  };

  // Helper for Day of Week short name
  const getDayOfWeekShort = (day: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, day);
    const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    return days[d.getDay()];
  };

  // Handle Edit Record
  const handleOpenEdit = (rec: DailyVehicleInspectionRecord) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  // Handle Export Excel Matrix
  const handleExportExcel = () => {
    if (!currentVehicle) return;
    exportDailyInspectionMatrixToExcel(
      currentVehicle,
      dailyInspections,
      selectedMonth,
      selectedYear,
      DAILY_INSPECTION_ITEMS_TEMPLATE
    );
  };

  // Handle Export Excel Logs
  const handleExportLogsExcel = () => {
    exportDailyInspectionLogsToExcel(filteredRecords);
  };

  // Generate Sample 31-day data for the entire fleet
  const handleGenerateSampleFleetData = () => {
    if (onLoadSampleMonthlyInspections) {
      onLoadSampleMonthlyInspections();
      return;
    }
    // Fallback in-component generator
    const newRecords: DailyVehicleInspectionRecord[] = [];
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    vehicles.slice(0, 10).forEach((v, vIdx) => {
      for (let day = 1; day <= daysInMonth; day++) {
        // Randomly skip Sundays or some days
        const dateObj = new Date(selectedYear, selectedMonth - 1, day);
        const isSunday = dateObj.getDay() === 0;
        
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const hasDefect = !isSunday && Math.random() < 0.08; // 8% chance of minor defect

        let results: DailyInspectionCheckResult[];
        let overallStatus: InspectionCheckStatus = "pass";
        let defectCount = 0;

        if (isSunday) {
          overallStatus = "skip";
          results = DAILY_INSPECTION_ITEMS_TEMPLATE.map((tpl) => ({
            itemId: tpl.no,
            no: tpl.no,
            name: tpl.name,
            standard: tpl.standard,
            method: tpl.method,
            frequency: tpl.frequency,
            category: tpl.category,
            status: "skip"
          }));
        } else if (hasDefect) {
          overallStatus = "fail";
          defectCount = 1;
          const defectItemNo = Math.random() > 0.5 ? 16 : 7; // lights or tire pressure
          const desc = defectItemNo === 16 ? "หลอดไฟเลี้ยวท้ายขวาขาด" : "ลมยางล้อหลังขวาตกเหลือ 80 PSI";
          results = createDefaultInspectionResults([{ itemNo: defectItemNo, description: desc }]);
        } else {
          results = createDefaultInspectionResults();
        }

        const mileage = (v.currentMileage || 100000) - (daysInMonth - day) * 120;

        newRecords.push({
          id: `sample-dci-${v.id}-${dateStr}`,
          docNumber: `DCI-${dateStr.replace(/-/g, "")}-${String(vIdx + 1).padStart(3, "0")}`,
          isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
          date: dateStr,
          time: isSunday ? "00:00" : `07:${Math.floor(15 + Math.random() * 30)}`,
          vehicleId: v.id,
          licensePlate: v.licensePlate,
          erpNo: v.erpNo,
          province: v.province || "กรุงเทพมหานคร",
          vehicleBrand: v.vehicleBrand,
          vehicleModel: v.vehicleModel,
          vehicleType: v.vehicleType,
          department: v.department,
          driverName: v.driverName || "พนักงานขับรถ TNB",
          inspectorName: "วิชัย ตรวจละเอียด",
          currentMileage: mileage,
          startMileage: mileage,
          overallStatus,
          defectCount,
          results,
          notes: isSunday ? "วันหยุดประจำสัปดาห์ / รถจอดพัก" : hasDefect ? "พบจุดบกพร่องเล็กน้อย นัดแก้ไข" : "ตรวจเช็คสภาพปกติ 100%",
          locationName: "ศูนย์กระจายสินค้า TNB ลาดกระบัง",
          createdAt: new Date(dateStr + "T07:30:00.000Z").toISOString(),
          updatedAt: new Date(dateStr + "T07:30:00.000Z").toISOString()
        });
      }
    });

    newRecords.forEach((r) => onAddDailyInspection(r, false));
    alert(`สร้างข้อมูลจำลองการตรวจเช็ค 31 วัน จำนวน ${newRecords.length} รายการ เรียบร้อยแล้ว!`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Main Title */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & ISO Badge */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    ระบบตรวจสภาพรถประจำวัน (Daily Pre-Trip Inspection)
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    ISO 39001 / SHE-FRM-007
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  แบบฟอร์มตรวจสอบความพร้อมยานพาหนะ 21 รายการมาตรฐาน ก่อนเริ่มปฏิบัติงาน (ก่อน 08:00 น.)
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => handleOpenNewModal()}
              id="btn-new-daily-inspection"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/50 flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ บันทึกตรวจสภาพรถวันนี้</span>
            </button>

            {/* Direct PDF: Blank Form */}
            <button
              type="button"
              onClick={() => {
                setPrintModalFormType("blank");
                setIsPrintModalOpen(true);
              }}
              id="btn-download-blank-pdf"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-950/40 flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer"
              title="เปิดดาวน์โหลดแบบฟอร์มเปล่า 31 วัน (ISO SHE-FRM-007) สำหรับพิมพ์แจกคนขับ"
            >
              <FileText className="w-4 h-4 text-emerald-100" />
              <span>📄 โหลดแบบฟอร์มเปล่า PDF</span>
            </button>

            {/* Direct PDF: 31-Day Matrix with Records */}
            <button
              type="button"
              onClick={() => {
                setPrintModalFormType("filled");
                setIsPrintModalOpen(true);
              }}
              id="btn-download-monthly-pdf"
              className="bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-950/40 flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer"
              title="เปิดรายงานผลตรวจสภาพ 31 วัน พร้อมดาวน์โหลด PDF และพิมพ์ (ISO 39001)"
            >
              <Download className="w-4 h-4 text-blue-100" />
              <span>📊 สรุปตรวจ 31 วัน (PDF)</span>
            </button>

            <button
              onClick={handleExportExcel}
              id="btn-export-daily-excel"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="ส่งออกตารางเมทริกซ์ 31 วัน เป็นไฟล์ Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              onClick={handleGenerateSampleFleetData}
              id="btn-gen-sample-inspections"
              className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium px-3 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="สุ่มข้อมูลการตรวจสภาพรถจำลอง 31 วัน เต็มเดือน"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>สุ่มข้อมูล 31 วัน</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-slate-800/80">
          
          {/* Card 1: Today Inspected */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">ตรวจวันนี้แล้ว</div>
              <div className="text-base sm:text-lg font-black text-white">
                {metrics.inspectedToday} <span className="text-xs font-normal text-slate-400">/ {metrics.totalVehiclesCount} คัน</span>
              </div>
            </div>
          </div>

          {/* Card 2: 100% Pass Ready */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">สภาพปกติ 100% (/)</div>
              <div className="text-base sm:text-lg font-black text-emerald-400">
                {metrics.passToday} <span className="text-xs font-normal text-slate-400">คันพร้อมวิ่ง</span>
              </div>
            </div>
          </div>

          {/* Card 3: Defect / Repairs */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${metrics.failToday > 0 ? "bg-rose-500/30 text-rose-400 animate-pulse" : "bg-slate-700 text-slate-400"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">พบจุดบกพร่อง (x)</div>
              <div className={`text-base sm:text-lg font-black ${metrics.failToday > 0 ? "text-rose-400" : "text-slate-300"}`}>
                {metrics.failToday} <span className="text-xs font-normal text-slate-400">คันต้องซ่อม</span>
              </div>
            </div>
          </div>

          {/* Card 4: Compliance On-time Rate */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">ตรวจตรงเวลา (&lt;08:00น.)</div>
              <div className="text-base sm:text-lg font-black text-cyan-400">
                {metrics.onTimeRate}% <span className="text-xs font-normal text-slate-400">Compliance</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          
          {/* Tab 1: Matrix View */}
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap transition-all min-h-[38px] shrink-0 ${
              activeTab === "matrix"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>ตาราง 31 วัน (Matrix)</span>
          </button>

          {/* Tab 2: Records Log */}
          <button
            onClick={() => setActiveTab("records")}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap transition-all min-h-[38px] shrink-0 ${
              activeTab === "records"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>ประวัติผลตรวจ ({dailyInspections.length})</span>
          </button>

          {/* Tab 3: Visual Truck Diagram */}
          <button
            onClick={() => setActiveTab("diagram")}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap transition-all min-h-[38px] shrink-0 ${
              activeTab === "diagram"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>จุดตรวจรอบคัน (Diagram)</span>
          </button>

          {/* Tab 4: Safety Analytics */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap transition-all min-h-[38px] shrink-0 ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-md shadow-blue-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>สถิติความปลอดภัย</span>
          </button>
        </div>

        {/* Month & Year Filter Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES_TH.map((name, idx) => (
                <option key={idx} value={idx + 1} className="bg-slate-900 text-white">
                  เดือน {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer border-l border-slate-700 pl-2"
            >
              <option value={2026} className="bg-slate-900 text-white">2026 (2569)</option>
              <option value={2025} className="bg-slate-900 text-white">2025 (2568)</option>
              <option value={2027} className="bg-slate-900 text-white">2027 (2570)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONTHLY MATRIX VIEW (31 DAYS x 21 ITEMS - RESPONSIVE & MOBILE-READY) */}
      {/* ========================================================================= */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          
          {/* Matrix Sub-Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            
            {/* Vehicle Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto flex-1">
              <div className="text-xs font-bold text-slate-300 shrink-0">
                เลือกรถที่ต้องการตรวจเช็ค:
              </div>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full sm:max-w-xs"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} ({v.province || "กทม"}) - {v.vehicleBrand} {v.vehicleModel} [{v.department}]
                  </option>
                ))}
              </select>

              {currentVehicle && (
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">พขร:</span> {currentVehicle.driverName || "-"}
                  <span>•</span>
                  <span className="font-semibold text-slate-300">ไมล์:</span> {(currentVehicle.currentMileage || 0).toLocaleString()} กม.
                </div>
              )}
            </div>

            {/* View Mode Toggle (Mobile Day View vs Full Matrix Table) & Actions */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
              {/* Toggle Switch */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("day_card")}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                    matrixViewMode === "day_card"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ดูรายวัน (มือถือ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("matrix_table")}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                    matrixViewMode === "matrix_table"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>ตาราง 31 วัน</span>
                </button>
              </div>

              {/* PDF and Print Buttons */}
              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPrintModalFormType("blank");
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                  title="ดาวน์โหลดแบบฟอร์มเปล่า 31 วัน (Blank Template) ไปพิมพ์"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ฟอร์มเปล่า PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrintModalFormType("filled");
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                  title="ดาวน์โหลดตารางตรวจสภาพเดือนนี้เป็นไฟล์ PDF (A4 แนวนอน)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>โหลด PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrintModalFormType("filled");
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ฟอร์ม A4</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Horizontal 1-31 Date Strip */}
          {currentVehicle && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">
                    แถบเลือกวันที่ตรวจ (1–{daysInSelectedMonth} {MONTH_NAMES_TH[selectedMonth - 1]} {selectedYear + 543}):
                  </span>
                </div>
                
                {/* Quick Jump Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().getDate();
                      if (today <= daysInSelectedMonth) {
                        setSelectedDayNumber(today);
                      }
                    }}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all"
                  >
                    วันนี้ (วันที่ {new Date().getDate()})
                  </button>
                </div>
              </div>

              {/* Scrollable Day Chips with Status Badges */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((dayNum) => {
                  const rec = singleVehicleDailyMap[dayNum];
                  const isSelected = selectedDayNumber === dayNum;
                  const isToday = dayNum === new Date().getDate() && selectedMonth === (new Date().getMonth() + 1) && selectedYear === new Date().getFullYear();
                  
                  let statusBadge = "bg-slate-800/80 border-slate-700/80 text-slate-400";
                  let statusIcon = "➖";

                  if (rec) {
                    if (rec.overallStatus === "pass") {
                      statusBadge = "bg-emerald-950/70 border-emerald-500/60 text-emerald-300";
                      statusIcon = "✓";
                    } else if (rec.overallStatus === "fail") {
                      statusBadge = "bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse";
                      statusIcon = "x";
                    } else if (rec.overallStatus === "skip") {
                      statusBadge = "bg-amber-950/70 border-amber-500/60 text-amber-300";
                      statusIcon = "O";
                    }
                  }

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => {
                        setSelectedDayNumber(dayNum);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[46px] sm:min-w-[54px] py-1.5 px-1 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/60 shadow-lg shadow-blue-900/50 scale-105 z-10"
                          : `${statusBadge} hover:bg-slate-800 hover:text-white`
                      }`}
                    >
                      <span className={`text-[9px] font-semibold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {getDayOfWeekShort(dayNum)}
                      </span>
                      <span className="text-sm sm:text-base font-black my-0.5">
                        {dayNum}
                      </span>
                      <span className={`text-[9px] px-1 rounded font-bold ${
                        isSelected ? "bg-white/20 text-white" : ""
                      }`}>
                        {statusIcon}
                      </span>
                      {isToday && (
                        <span className="text-[7px] bg-amber-400 text-slate-950 px-1 rounded font-black mt-0.5">
                          วันนี้
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 1: DAY CARD VIEW (SPECIALLY OPTIMIZED FOR MOBILE) */}
          {currentVehicle && matrixViewMode === "day_card" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Day Card Header */}
              {(() => {
                const selectedDayRecord = singleVehicleDailyMap[selectedDayNumber];
                const selectedDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDayNumber).padStart(2, "0")}`;

                return (
                  <div>
                    <div className="bg-slate-800/90 p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex flex-col items-center justify-center text-blue-400 font-bold shrink-0">
                          <span className="text-[10px] uppercase font-bold text-blue-300">{getDayOfWeekShort(selectedDayNumber)}</span>
                          <span className="text-lg font-black text-white leading-none">{selectedDayNumber}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h2 className="text-sm sm:text-base font-bold text-white">
                              วันที่ {selectedDayNumber} {MONTH_NAMES_TH[selectedMonth - 1]} {selectedYear + 543}
                            </h2>
                            {selectedDayRecord ? (
                              selectedDayRecord.overallStatus === "pass" ? (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>ผ่านการตรวจ (21/21)</span>
                                </span>
                              ) : selectedDayRecord.overallStatus === "fail" ? (
                                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>พบจุดบกพร่อง ({selectedDayRecord.defectCount || 1} รายการ)</span>
                                </span>
                              ) : (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                  งดเว้นการตรวจ (วันหยุด/จอดพัก)
                                </span>
                              )
                            ) : (
                              <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                                ยังไม่มีบันทึกผลตรวจ
                              </span>
                            )}
                          </div>

                          <div className="text-slate-400 text-xs mt-1 flex items-center space-x-2 flex-wrap gap-y-1">
                            <span>ทะเบียน: <strong className="text-white">{currentVehicle.licensePlate}</strong></span>
                            <span>•</span>
                            <span>พขร: <strong className="text-slate-300">{selectedDayRecord?.driverName || currentVehicle.driverName || "-"}</strong></span>
                            {selectedDayRecord && (
                              <>
                                <span>•</span>
                                <span>ผู้ตรวจ: <strong className="text-slate-300">{selectedDayRecord.inspectorName}</strong></span>
                                <span>•</span>
                                <span>เวลา: <strong className="text-slate-300">{selectedDayRecord.time || "-"} น.</strong></span>
                                <span>•</span>
                                <span>เลขไมล์: <strong className="text-slate-300">{(selectedDayRecord.currentMileage || 0).toLocaleString()} กม.</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Navigation & Action Buttons */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDayNumber((prev) => Math.max(1, prev - 1))}
                            disabled={selectedDayNumber <= 1}
                            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center"
                            title="วันก่อนหน้า"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDayNumber((prev) => Math.min(daysInSelectedMonth, prev + 1))}
                            disabled={selectedDayNumber >= daysInSelectedMonth}
                            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center"
                            title="วันถัดไป"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {selectedDayRecord ? (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(selectedDayRecord)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-blue-900/40"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>แก้ไขผลตรวจ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingRecordDetail(selectedDayRecord)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ดูใบเต็ม</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenNewModal(currentVehicle.id, selectedDateStr)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-900/40"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ลงผลตรวจวันที่ {selectedDayNumber}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 21 Items Checklist for this Selected Day */}
                    <div className="p-4 space-y-3">
                      {/* Tire Tread Depth Alert Card if available */}
                      {selectedDayRecord?.tireReport && (
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          selectedDayRecord.tireReport.overallTireStatus === "critical"
                            ? "bg-rose-950/70 border-rose-500 text-rose-200"
                            : selectedDayRecord.tireReport.overallTireStatus === "warning"
                            ? "bg-amber-950/60 border-amber-500/70 text-amber-200"
                            : "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Gauge className="w-4 h-4 shrink-0" />
                            <div>
                              <span className="font-bold">ผลตรวจดอกยาง: </span>
                              <span>{selectedDayRecord.tireReport.alertMessage}</span>
                            </div>
                          </div>
                          <div className="font-mono font-bold shrink-0">
                            ต่ำสุด: {selectedDayRecord.tireReport.minTreadDepthMm} mm
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                        <span className="font-bold text-slate-200">
                          รายการตรวจสอบ 21 ตำแหน่งตามมาตรฐาน ISO-SHE-007
                        </span>
                        <span>
                          {selectedDayRecord
                            ? `ตรวจแล้ว 21 รายการ`
                            : `ยังไม่มีผลตรวจสำหรับวันที่ ${selectedDayNumber}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {DAILY_INSPECTION_ITEMS_TEMPLATE.map((tpl) => {
                          const catInfo = INSPECTION_CATEGORIES_CONFIG[tpl.category];
                          const itemRes = selectedDayRecord?.results?.find((r) => r.no === tpl.no);
                          const status = itemRes?.status || (selectedDayRecord ? selectedDayRecord.overallStatus : undefined);

                          return (
                            <div
                              key={tpl.no}
                              className={`p-3 rounded-xl border transition-all ${
                                status === "fail"
                                  ? "bg-rose-950/40 border-rose-500/80 shadow-md shadow-rose-950/40"
                                  : status === "pass"
                                  ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                                  : status === "skip"
                                  ? "bg-amber-950/20 border-amber-800/40"
                                  : "bg-slate-950/30 border-slate-800/50 opacity-85"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start space-x-2.5">
                                  <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    {tpl.no}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-1.5 flex-wrap">
                                      <span className="font-bold text-white text-xs">{tpl.name}</span>
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-normal ${catInfo.color}`}>
                                        {catInfo.label.split(" ")[0]}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {tpl.standard}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="shrink-0">
                                  {status === "pass" ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>ปกติ</span>
                                    </span>
                                  ) : status === "fail" ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-600 text-white shadow-md text-xs font-bold">
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>ผิดปกติ</span>
                                    </span>
                                  ) : status === "skip" ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                                      <span>งดตรวจ</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium">
                                      <span>ยังไม่ตรวจ</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* If defect, show issue description & quick ticket action */}
                              {status === "fail" && itemRes?.issueDescription && (
                                <div className="mt-2.5 pt-2.5 border-t border-rose-800/40 bg-rose-950/60 p-2 rounded-lg text-xs">
                                  <div className="flex items-center space-x-1 text-rose-300 font-bold mb-1">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>ปัญหาที่พบ:</span>
                                  </div>
                                  <p className="text-rose-100 text-xs">{itemRes.issueDescription}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* VIEW MODE 2: MONTHLY 31-DAY MATRIX SPREADSHEET TABLE */}
          {currentVehicle && matrixViewMode === "matrix_table" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Document Header Card */}
              <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    21
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">
                      ใบรายการตรวจสอบสภาพรถบรรทุก ประจำวัน (31 วัน) — ทะเบียน {currentVehicle.licensePlate} ({currentVehicle.province || "กทม"})
                    </span>
                    <div className="text-slate-400 text-[11px]">
                      ประจำเดือน: <strong className="text-blue-300">{MONTH_NAMES_TH[selectedMonth - 1]} {selectedYear + 543}</strong> | สังกัด: {currentVehicle.department} | พนักงานขับรถ: {currentVehicle.driverName || "ไม่ระบุ"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenNewModal(currentVehicle.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ลงผลตรวจวันใหม่</span>
                  </button>
                </div>
              </div>

              {/* Mobile Scroll Hint Banner */}
              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-300 sm:hidden">
                <span className="text-blue-300 font-medium">👉 เลื่อนตารางซ้าย-ขวาเพื่อดูวันที่ 1–31</span>
                <span className="text-slate-400">คลิกที่ช่องเพื่อดู/แก้ไข</span>
              </div>

              {/* Matrix Scrollable Table (Responsive column rules) */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-center">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                      <th className="p-2 border-r border-slate-700/60 w-8 sm:w-10 text-center sm:sticky sm:left-0 bg-slate-800 z-10 text-[10px] sm:text-xs">
                        No.
                      </th>
                      <th className="p-2 border-r border-slate-700/60 w-32 sm:w-52 text-left sm:sticky sm:left-10 bg-slate-800 z-10 text-[11px] sm:text-xs">
                        ตำแหน่งที่ตรวจเช็ค (21 รายการ)
                      </th>
                      
                      {/* Days 1 to 31 */}
                      {daysArray.map((dayNum) => (
                        <th
                          key={dayNum}
                          className={`p-1.5 border-r border-slate-700/60 min-w-[32px] text-[11px] ${
                            dayNum > daysInSelectedMonth
                              ? "bg-slate-950/80 text-slate-600"
                              : singleVehicleDailyMap[dayNum]
                              ? singleVehicleDailyMap[dayNum].overallStatus === "fail"
                                ? "bg-rose-950/60 text-rose-300 font-black"
                                : "bg-slate-800/60 text-blue-300 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {dayNum}
                        </th>
                      ))}

                      <th className="p-2 border-r border-slate-700/60 w-52 text-left">
                        มาตรฐานการตรวจเช็ค
                      </th>
                      <th className="p-2 border-r border-slate-700/60 w-28 text-center">
                        วิธีการปฏิบัติ
                      </th>
                      <th className="p-2 w-20 text-center">
                        ความถี่
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {DAILY_INSPECTION_ITEMS_TEMPLATE.map((tpl) => {
                      const catInfo = INSPECTION_CATEGORIES_CONFIG[tpl.category];

                      return (
                        <tr key={tpl.no} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Item No */}
                          <td className="p-1.5 sm:p-2 border-r border-slate-800 font-bold text-slate-400 bg-slate-900 sm:sticky sm:left-0 z-10 text-[10px] sm:text-xs">
                            {tpl.no}
                          </td>

                          {/* Item Name */}
                          <td className="p-1.5 sm:p-2 border-r border-slate-800 text-left font-semibold text-white bg-slate-900 sm:sticky sm:left-10 z-10 max-w-[140px] sm:max-w-none whitespace-normal sm:whitespace-nowrap">
                            <div className="flex items-center space-x-1 sm:space-x-1.5">
                              <span className="text-[11px] sm:text-xs leading-tight">{tpl.name}</span>
                              <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded border font-normal shrink-0 ${catInfo.color}`}>
                                {catInfo.label.split(" ")[0]}
                              </span>
                            </div>
                          </td>

                          {/* Days 1-31 Cells */}
                          {daysArray.map((dayNum) => {
                            if (dayNum > daysInSelectedMonth) {
                              return (
                                <td key={dayNum} className="p-1 border-r border-slate-800/40 bg-slate-950/60 text-slate-700">
                                  -
                                </td>
                              );
                            }

                            const rec = singleVehicleDailyMap[dayNum];
                            let mark = "";
                            let cellStyle = "text-slate-600";
                            let tooltip = `วันที่ ${dayNum}: ยังไม่มีข้อมูล`;

                            if (rec) {
                              const itemResult = rec.results?.find((r) => r.no === tpl.no);
                              if (itemResult) {
                                if (itemResult.status === "pass") {
                                  mark = "/";
                                  cellStyle = "text-emerald-400 font-black bg-emerald-950/20";
                                  tooltip = `วันที่ ${dayNum}: ปกติ (ตรวจโดย ${rec.inspectorName})`;
                                } else if (itemResult.status === "fail") {
                                  mark = "x";
                                  cellStyle = "text-rose-400 font-black bg-rose-950/80 ring-1 ring-rose-500 animate-pulse";
                                  tooltip = `วันที่ ${dayNum}: พบปัญหา "${itemResult.issueDescription || "ชำรุด"}"`;
                                } else if (itemResult.status === "skip") {
                                  mark = "O";
                                  cellStyle = "text-amber-400 font-bold bg-amber-950/20";
                                  tooltip = `วันที่ ${dayNum}: งดเว้นการตรวจ (วันหยุด/จอด)`;
                                }
                              } else {
                                mark = rec.overallStatus === "pass" ? "/" : "x";
                                cellStyle = rec.overallStatus === "pass" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold bg-rose-950/40";
                              }
                            }

                            return (
                              <td
                                key={dayNum}
                                onClick={() => {
                                  if (rec) {
                                    setViewingRecordDetail(rec);
                                  } else {
                                    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                    handleOpenNewModal(currentVehicle.id, dateStr);
                                  }
                                }}
                                className={`p-1 border-r border-slate-800/40 cursor-pointer font-mono text-xs transition-all hover:bg-blue-600/30 ${cellStyle}`}
                                title={tooltip}
                              >
                                {mark || "·"}
                              </td>
                            );
                          })}

                          {/* Standard Column */}
                          <td className="p-2 border-r border-slate-800 text-left text-[11px] text-slate-300">
                            {tpl.standard}
                          </td>

                          {/* Method Column */}
                          <td className="p-2 border-r border-slate-800 text-center text-[10px] text-slate-400 font-mono">
                            {tpl.method.split(" ")[0]}
                          </td>

                          {/* Frequency Column */}
                          <td className="p-2 text-center text-[10px] text-slate-400 whitespace-nowrap">
                            {tpl.frequency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Matrix Footer Summary */}
              <div className="bg-slate-800/80 px-4 py-3 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white">สรุปผลตลอดเดือน {MONTH_NAMES_TH[selectedMonth - 1]}:</span>
                  <span className="text-emerald-400 font-bold">
                    ✓ ตรวจแล้ว {Object.keys(singleVehicleDailyMap).length} วัน
                  </span>
                  <span className="text-rose-400 font-bold">
                    ⚠️ พบจุดบกพร่อง {Object.values(singleVehicleDailyMap).filter((r: DailyVehicleInspectionRecord) => r.overallStatus === 'fail').length} วัน
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  คลิกที่ช่องวันที่เพื่อดูบันทึกรายละเอียด หรือแก้ไขผลการตรวจ
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INSPECTION RECORDS LOG (TABLE & SEARCH) */}
      {/* ========================================================================= */}
      {activeTab === "records" && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาตามทะเบียนรถ, เลขที่เอกสาร, ยี่ห้อ, พนักงานขับรถ หรือผู้ตรวจสอบ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="pass">✓ ปกติ 100%</option>
                <option value="fail">⚠️ พบจุดบกพร่อง</option>
                <option value="skip">O งดตรวจ/วันหยุด</option>
              </select>

              {/* Department Filter */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกแผนก/สาขา</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button
                onClick={handleExportLogsExcel}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
                title="ส่งออกรายการบันทึกเป็น Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel</span>
              </button>
            </div>

          </div>

          {/* Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                    <th className="p-3">เลขที่เอกสาร / วันที่</th>
                    <th className="p-3">ทะเบียนรถ & ยี่ห้อ/รุ่น</th>
                    <th className="p-3">พนักงานขับรถ & สังกัด</th>
                    <th className="p-3">เลขไมล์ (กม.)</th>
                    <th className="p-3 text-center">ผลการตรวจ 21 ข้อ</th>
                    <th className="p-3">รายการที่ชำรุด / อาการ</th>
                    <th className="p-3">ผู้ตรวจสอบ</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <CheckSquare className="w-8 h-8 text-slate-600" />
                          <p>ไม่พบรายการบันทึกการตรวจสภาพรถตามเงื่อนไข</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const hasDefect = rec.overallStatus === "fail";
                      const defectItems = rec.results?.filter((r) => r.status === "fail") || [];

                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Doc & Date */}
                          <td className="p-3 space-y-0.5">
                            <div className="font-bold text-white font-mono">{rec.docNumber}</div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-blue-400" />
                              <span>{rec.date}</span>
                              <span className="text-slate-500">•</span>
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{rec.time || "07:30"}</span>
                            </div>
                          </td>

                          {/* Vehicle */}
                          <td className="p-3 space-y-0.5">
                            <div className="font-bold text-blue-300 flex items-center space-x-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-400" />
                              <span>{rec.licensePlate} ({rec.province || "กทม"})</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rec.vehicleBrand} {rec.vehicleModel}
                            </div>
                          </td>

                          {/* Driver & Dept */}
                          <td className="p-3 space-y-0.5">
                            <div className="font-medium text-white flex items-center space-x-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{rec.driverName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rec.department}
                            </div>
                          </td>

                          {/* Mileage */}
                          <td className="p-3 font-mono font-bold text-slate-200">
                            {(rec.currentMileage || 0).toLocaleString()} กม.
                          </td>

                          {/* Result Badge */}
                          <td className="p-3 text-center">
                            {rec.overallStatus === "pass" ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>ปกติ 100% (/)</span>
                              </span>
                            ) : rec.overallStatus === "fail" ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500 text-[11px] font-bold animate-pulse">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>พบปัญหา ({rec.defectCount} จุด)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[11px]">
                                <span>งดตรวจ (O)</span>
                              </span>
                            )}
                          </td>

                          {/* Defect Description */}
                          <td className="p-3 max-w-xs">
                            {defectItems.length > 0 ? (
                              <div className="space-y-1">
                                {defectItems.map((d, i) => (
                                  <div key={i} className="text-rose-300 text-[11px]">
                                    <span className="font-bold">• {d.name}:</span> {d.issueDescription || "ชำรุด"}
                                  </div>
                                ))}
                                {rec.ticketNumber && (
                                  <div className="text-[10px] text-blue-300 font-mono">
                                    ใบแจ้งซ่อม: {rec.ticketNumber}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Inspector */}
                          <td className="p-3 text-[11px] text-slate-300">
                            <div>{rec.inspectorName}</div>
                            <div className="text-[10px] text-slate-500">{rec.locationName}</div>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSingleInspectionPdfRecord(rec)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="ดาวน์โหลด / พิมพ์รายงานผลตรวจวันนี้เป็น PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setViewingRecordDetail(rec)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                                title="ดูรายละเอียดผลตรวจ"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(rec)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไขผลตรวจ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`คุณต้องการลบบันทึกการตรวจ ${rec.docNumber} ใช่หรือไม่?`)) {
                                    onDeleteDailyInspection(rec.id);
                                  }
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="ลบบันทึก"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VISUAL TRUCK INSPECTION DIAGRAM GUIDE (MATCHES IMAGE 2) */}
      {/* ========================================================================= */}
      {activeTab === "diagram" && (
        <div className="space-y-6">
          
          {/* Diagram Title Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>แผนภาพคู่มือจุดตรวจเช็ครถบรรทุกประจำวัน (Truck Daily Check Guide)</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  คู่มือมาตรฐานการตรวจสอบจุดสำคัญ 5 หมวดหมู่รอบคันรถ HINO / ISUZU / FUSO ก่อนออกเดินทาง
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">มาตรฐาน:</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-1 rounded-lg">
                  TNB-MT-DIAG-001
                </span>
              </div>
            </div>
          </div>

          {/* 5 Main Inspection Categories Grid (Diagram Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Zone 1: เครื่องยนต์ (Engine & Fluids) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-amber-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">หมวดเครื่องยนต์ & ของเหลว</h3>
                  <p className="text-[11px] text-slate-400">Engine & Lubricants Check</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>① ระดับน้ำหล่อเย็นในหม้อน้ำ</span>
                    <span className="text-[10px] text-amber-400 font-mono">Ot5</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ระดับน้ำปกติจะต้องอยู่ระหว่างขีด "สูง (FULL)" และ "ต่ำ (LOW)" ของกระปุกพักน้ำหล่อเย็น
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>② ระดับน้ำมันเครื่อง</span>
                    <span className="text-[10px] text-amber-400 font-mono">ก้านวัด</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ดึงก้านวัดระดับน้ำมันเครื่อง ระดับน้ำมันจะต้องอยู่ระหว่างขีดบน (F) และขีดล่าง (L) ไม่ต่ำกว่าเกณฑ์
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>③ การสตาร์ทเครื่องยนต์ & สายพาน</span>
                    <span className="text-[10px] text-amber-400 font-mono">E5</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    เช็คความเร็วในการสตาร์ท เสียงการทำงานของเครื่องยนต์ และกดตรวจความตึงสายพานพัดลมยุบไม่เกิน 2 ซม.
                  </p>
                </div>
              </div>
            </div>

            {/* Zone 2: ระบบเบรก & ถังลม (Brakes & Air Tank) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-rose-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-300">หมวดระบบเบรก & ถังลม</h3>
                  <p className="text-[11px] text-slate-400">Braking & Air System</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>④ การถ่ายน้ำออกจากถังลม</span>
                    <span className="text-[10px] text-rose-400 font-mono">ดึงห่วงก๊อก</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ดึงห่วงก๊อกถ่ายน้ำใต้ถังลมเบรกทุกวัน เพื่อระบายน้ำขังและตะกอนไม่ให้เข้าไปอุดตันวาล์วเบรก
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>⑤ การทำงานของเบรกมือ & แป้นเบรก</span>
                    <span className="text-[10px] text-rose-400 font-mono">Ot3</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ดึงคันเบรกมือเพื่อตรวจเช็คระยะฟรีคันเบรก และทดสอบเหยียบแป้นเบรกเท้าต้องไม่ยุบจม
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>⑥ ระดับน้ำมันเบรก & น้ำมันคลัตช์</span>
                    <span className="text-[10px] text-rose-400 font-mono">สายตาดู</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ระดับน้ำมันเบรกและน้ำมันคลัตช์โดยปกติต้องอยู่ระหว่างขีด "สูง (MAX)" และ "ต่ำ (MIN)"
                  </p>
                </div>
              </div>
            </div>

            {/* Zone 3: ทัศนวิสัย & กระจก (Visibility) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-cyan-300">หมวดทัศนวิสัย & กระจก</h3>
                  <p className="text-[11px] text-slate-400">Visibility & Mirrors</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑧ ที่ฉีดน้ำและก้านปัดกระจก</div>
                  <p className="text-[11px] text-slate-300">
                    ตรวจเช็คระดับน้ำฉีดกระจก หัวฉีดน้ำไม่อุดตัน และยางปัดน้ำฝนไม่ฉีกขาด ปัดได้สะอาดเกลี้ยง
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑨ การแตกร้าวของกระจกบังลม</div>
                  <p className="text-[11px] text-slate-300">
                    ตรวจเช็คกระจกหน้าไม่มีรอยร้าว รอยสะเก็ดหิน หรือสิ่งเปรอะเปื้อนที่บดบังสายตา
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑩ กระจกมองข้าง & กระจกส่องท้าย</div>
                  <p className="text-[11px] text-slate-300">
                    ปรับมุมมองกระจกมองข้างซ้าย-ขวา และกระจกส่องท้ายให้เห็นชัดเจน ฝาครอบไม่หลุดหลวม
                  </p>
                </div>
              </div>
            </div>

            {/* Zone 4: ยาง & ล้อ & น็อต (Tires & Wheels) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-blue-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-300">หมวดยาง & ล้อ & น็อต</h3>
                  <p className="text-[11px] text-slate-400">Tires, Wheels & Lug Nuts</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>⑫ แรงดันลมยาง & รอยรั่วซึม</span>
                    <span className="text-[10px] text-blue-400 font-mono">W1</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ตรวจวัดแรงดันลมยาง 110-120 PSI ทุกล้อ ตรวจดูความแน่นหนาของจุ๊บลม และแก้มยางไม่บวม
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>⑬ วัตถุแปลกปลอม & ดอกยาง</span>
                    <span className="text-[10px] text-blue-400 font-mono">W2</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ตรวจเช็คเศษหิน ตะปู ที่ฝังในร่องยาง และวัดความลึกร่องยางไม่ต่ำกว่า 2 มม. ยางไม่สึกกินข้าง
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>⑭ ความแน่นของน็อตล้อ</span>
                    <span className="text-[10px] text-blue-400 font-mono">W3</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    เคาะฟังเสียงน็อตล้อทุกล้อ ต้องแน่นสนิท ไม่มีรอยสนิมแดงรอบเกลียวน็อต
                  </p>
                </div>
              </div>
            </div>

            {/* Zone 5: ระบบไฟ & สัญญาณเตือน (Electrical & Lights) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-yellow-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-yellow-300">หมวดระบบไฟ & สัญญาณเตือน</h3>
                  <p className="text-[11px] text-slate-400">Lights, Horn & Gauges</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑯ การทำงานของไฟหน้า & ไฟตัดหมอก</div>
                  <p className="text-[11px] text-slate-300">
                    ไฟหน้า (สูง/ต่ำ) และไฟตัดหมอก ติดครบทั้งสองข้าง โคมไม่แตกและสว่างเต็มกำลัง
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑰ ไฟเลี้ยว, ไฟท้าย & ไฟเบรก</div>
                  <p className="text-[11px] text-slate-300">
                    ไฟเลี้ยวซ้าย-ขวากระพริบเป็นจังหวะปกติ ไฟเบรกและไฟถอยหลังสว่างชัดเจน
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑱ สวิตช์แตร & เกจวัดหน้าปัด</div>
                  <p className="text-[11px] text-slate-300">
                    เสียงแตรดังกังวาน เกจวัดแรงดันลม 7-9 บาร์ เกจความร้อนปกติ และไม่มีไฟเตือนสีแดงค้าง
                  </p>
                </div>
              </div>
            </div>

            {/* Zone 6: อุปกรณ์ความปลอดภัย & โครงสร้าง */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">หมวดความปลอดภัย & ตัวถัง</h3>
                  <p className="text-[11px] text-slate-400">Emergency & Cargo Bed</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑳ อุปกรณ์ฉุกเฉินประจำรถ</div>
                  <p className="text-[11px] text-slate-300">
                    ถังดับเพลิงเข็มแถบเขียว, ป้ายสามเหลี่ยมสะท้อนแสง, กรวยจราจร, ไม้หมอนหนุนล้อ
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">⑧-⑩ พื้นกระบะ & ปากนกแก้ว & ผ้าใบ</div>
                  <p className="text-[11px] text-slate-300">
                    พื้นกระบะสะอาด สลักล็อคปากนกแก้วแน่นหนา และผ้าใบคลุมไม่มีรูรั่วซึม
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-white">㉑ ตรวจรอยรั่วซึมใต้ท้องรถ</div>
                  <p className="text-[11px] text-slate-300">
                    ก้มตรวจใต้ท้องรถ ไม่มีคราบน้ำมันเครื่อง น้ำมันเกียร์ หรือน้ำหล่อเย็นหยดลงพื้น
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SAFETY & COMPLIANCE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Compliance Rate Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-400">อัตราการตรวจเช็คตรงเวลาก่อน 08:00 น.</div>
              <div className="text-3xl font-black text-cyan-400">
                {metrics.onTimeRate}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${metrics.onTimeRate}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-400">
                ตามเกณฑ์มาตรฐานความปลอดภัย TNB SHE ห้ามนำรถออกวิ่งงานหากยังไม่ได้ตรวจสภาพก่อน 08:00 น.
              </p>
            </div>

            {/* Total Month Checks */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-400">จำนวนครั้งที่ตรวจสภาพในเดือนนี้</div>
              <div className="text-3xl font-black text-blue-400">
                {monthRecords.length} <span className="text-sm font-normal text-slate-400">ครั้ง</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-emerald-400 font-bold">✓ ปกติ {monthRecords.filter(r => r.overallStatus === 'pass').length}</span>
                <span className="text-rose-400 font-bold">⚠️ มีปัญหา {monthRecords.filter(r => r.overallStatus === 'fail').length}</span>
              </div>
            </div>

            {/* Defects Found */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-400">จุดบกพร่องที่ตรวจพบ & ส่งซ่อม</div>
              <div className="text-3xl font-black text-rose-400">
                {metrics.monthDefects} <span className="text-sm font-normal text-slate-400">จุด</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                ส่งต่อฝ่ายซ่อมบำรุงเปิดใบแจ้งซ่อมด่วนทันที ช่วยลดการเกิดอุบัติเหตุบนท้องถนนเป็น 0%
              </p>
            </div>

          </div>

          {/* Top Frequent Inspection Items with defects */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>สถิติจุดบกพร่องที่พบบ่อย 5 อันดับแรก (Top 5 Defect Areas)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { name: "ไฟส่องสว่าง & ไฟสัญญาณรอบคัน (ข้อ 16)", count: 12, percent: 45, category: "electrical" },
                { name: "ยางรถและแรงดันลมยาง (ข้อ 7)", count: 7, percent: 28, category: "tires" },
                { name: "ที่ฉีดน้ำและก้านปัดน้ำฝน (ข้อ 18)", count: 4, percent: 16, category: "visibility" },
                { name: "การถ่ายน้ำออกจากถังลมเบรก (ข้อ 15)", count: 3, percent: 12, category: "brake" },
                { name: "ความตึงสายพานพัดลม (ข้อ 6)", count: 2, percent: 8, category: "engine" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-semibold">#{idx + 1} {item.name}</span>
                    <span className="font-mono text-slate-400">{item.count} ครั้ง ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? "bg-rose-500" : idx === 1 ? "bg-amber-500" : "bg-blue-500"}`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD DETAIL MODAL (VIEW RESULT DETAIL) */}
      {/* ========================================================================= */}
      {viewingRecordDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>รายละเอียดผลการตรวจสภาพ {viewingRecordDetail.docNumber}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ทะเบียน: {viewingRecordDetail.licensePlate} | วันที่ {viewingRecordDetail.date} เวลา {viewingRecordDetail.time}
                </p>
              </div>
              <button
                onClick={() => setViewingRecordDetail(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              
              {/* Summary Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                viewingRecordDetail.overallStatus === "pass"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : viewingRecordDetail.overallStatus === "fail"
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}>
                <div className="flex items-center space-x-3">
                  {viewingRecordDetail.overallStatus === "pass" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : viewingRecordDetail.overallStatus === "fail" ? (
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-400" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {viewingRecordDetail.overallStatus === "pass"
                        ? "ผลการตรวจ: สภาพรถยนต์พร้อมใช้งาน 100%"
                        : viewingRecordDetail.overallStatus === "fail"
                        ? `ผลการตรวจ: พบข้อบกพร่อง ${viewingRecordDetail.defectCount} รายการ`
                        : "ผลการตรวจ: งดเว้นการตรวจเช็ค (วันหยุด/จอด)"}
                    </div>
                    <div className="text-[11px] opacity-80">
                      ผู้ตรวจสอบ: {viewingRecordDetail.inspectorName} | พนักงานขับรถ: {viewingRecordDetail.driverName}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div>เลขไมล์: {viewingRecordDetail.currentMileage?.toLocaleString()} กม.</div>
                </div>
              </div>

              {/* Defect items list */}
              {viewingRecordDetail.results?.filter(r => r.status === 'fail').length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/50 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-rose-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>รายการที่ตรวจพบความผิดปกติ:</span>
                  </div>
                  {viewingRecordDetail.results.filter(r => r.status === 'fail').map((d) => (
                    <div key={d.no} className="bg-rose-950/60 p-2.5 rounded-lg border border-rose-600/50 space-y-1">
                      <div className="flex items-center justify-between text-rose-200 font-bold">
                        <span>ข้อ {d.no}. {d.name}</span>
                        <span className="text-[10px] bg-rose-900 px-2 py-0.5 rounded text-rose-200">
                          {d.issueUrgency || "high"}
                        </span>
                      </div>
                      <p className="text-white text-[11px]">{d.issueDescription}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* All 21 Items Summary List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300">ผลการตรวจเช็ค 21 รายการ:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingRecordDetail.results?.map((item) => (
                    <div 
                      key={item.no}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        item.status === 'fail'
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                          : item.status === 'pass'
                          ? 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                          : 'bg-slate-800/20 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="truncate">
                        <strong className="font-mono text-slate-400 mr-1.5">{item.no}.</strong>
                        {item.name}
                      </span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                        item.status === 'pass'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : item.status === 'fail'
                          ? 'text-rose-300 bg-rose-900 font-black'
                          : 'text-amber-400 bg-amber-950/40'
                      }`}>
                        {item.status === 'pass' ? '/' : item.status === 'fail' ? 'x' : 'O'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {viewingRecordDetail.notes && (
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="font-bold text-slate-300 mb-1">หมายเหตุ:</div>
                  <p className="text-slate-300">{viewingRecordDetail.notes}</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-800 px-5 py-3 border-t border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setViewingRecordDetail(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                ปิด
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingRecordDetail;
                    setSingleInspectionPdfRecord(rec);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                  title="ดาวน์โหลดหรือพิมพ์ผลตรวจวันนี้เป็นเอกสาร PDF A4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PDF</span>
                </button>

                <button
                  onClick={() => {
                    const rec = viewingRecordDetail;
                    setViewingRecordDetail(null);
                    handleOpenEdit(rec);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูล</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD INPUT / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <DailyInspectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
            setModalInitialDate(undefined);
          }}
          onSubmit={(rec, autoCreateTicket) => {
            if (editingRecord) {
              onUpdateDailyInspection(rec);
            } else {
              onAddDailyInspection(rec, autoCreateTicket);
            }
            setModalInitialDate(undefined);
          }}
          vehicles={vehicles}
          initialRecord={editingRecord}
          selectedVehicleId={selectedVehicleId}
          initialDate={modalInitialDate}
        />
      )}

      {/* ========================================================================= */}
      {/* ISO 31-DAY MATRIX PRINT & PDF MODAL */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <DailyInspectionPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          vehicle={currentVehicle || vehicles[0]}
          records={dailyInspections}
          month={selectedMonth}
          year={selectedYear}
          currentBrand={currentBrand}
          initialFormType={printModalFormType}
        />
      )}

      {/* ========================================================================= */}
      {/* SINGLE DAY INSPECTION PDF EXPORT MODAL */}
      {/* ========================================================================= */}
      {singleInspectionPdfRecord && (
        <SingleInspectionPdfModal
          isOpen={Boolean(singleInspectionPdfRecord)}
          onClose={() => setSingleInspectionPdfRecord(null)}
          record={singleInspectionPdfRecord}
          vehicle={vehicles.find(v => v.id === singleInspectionPdfRecord.vehicleId || v.licensePlate === singleInspectionPdfRecord.licensePlate) || currentVehicle}
          currentBrand={currentBrand}
        />
      )}

    </div>
  );
};
