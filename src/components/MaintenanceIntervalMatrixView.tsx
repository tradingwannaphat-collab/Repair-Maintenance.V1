import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  Home, 
  Gauge, 
  Filter, 
  Search, 
  Truck, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Info, 
  Printer, 
  Download, 
  Sparkles, 
  Sliders, 
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  ArrowUpDown,
  Check,
  ChevronRight,
  Eye,
  RotateCcw,
  Layers
} from "lucide-react";
import { 
  VehicleRecord, 
  RepairTicket, 
  MaintenanceIntervalPlan, 
  MileageAlertEvaluation 
} from "../types";
import { 
  MAINTENANCE_INTERVAL_PLANS, 
  MASTER_INTERVAL_CHECKLIST_MATRIX,
  MasterMatrixItem,
  evaluateFleetMileageAlerts 
} from "../data/maintenanceIntervalMatrixData";
import { VEHICLE_TYPE_LABELS } from "../data/categories";

interface MaintenanceIntervalMatrixViewProps {
  vehicles: VehicleRecord[];
  tickets?: RepairTicket[];
  onCreateTicketFromPM?: (vehicle: VehicleRecord, plan: MaintenanceIntervalPlan) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
  onOpenVehicleRepairHistory?: (licensePlate: string) => void;
}

export const MaintenanceIntervalMatrixView: React.FC<MaintenanceIntervalMatrixViewProps> = ({
  vehicles,
  tickets = [],
  onCreateTicketFromPM,
  onRequestRepairForVehicle,
  onOpenVehicleRepairHistory
}) => {
  // Main view mode: 'master_matrix' (default), 'fleet_mileage_table', 'interval_detail'
  const [activeTab, setActiveTab] = useState<"master_matrix" | "fleet_mileage_table" | "interval_detail">("master_matrix");

  // Threshold selection (e.g., +/- 1,000 km)
  const [thresholdKm, setThresholdKm] = useState<number>(1000);

  // Tab for single interval view
  const [selectedIntervalKm, setSelectedIntervalKm] = useState<number>(10000);

  // Filters for Master Comparison Table
  const [matrixSearch, setMatrixSearch] = useState<string>("");
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>("all");
  const [matrixTypeFilter, setMatrixTypeFilter] = useState<"all" | "in_house" | "dealer">("all");

  // Filters for Fleet Mileage Table
  const [vehicleSearch, setVehicleSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "due_soon" | "normal">("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [fleetViewStyle, setFleetViewStyle] = useState<"table" | "cards">("table");

  // Evaluated mileage alerts for all vehicles
  const evaluatedAlerts: MileageAlertEvaluation[] = useMemo(() => {
    return evaluateFleetMileageAlerts(vehicles, thresholdKm);
  }, [vehicles, thresholdKm]);

  // Summary counts
  const overdueCount = evaluatedAlerts.filter((a) => a.alertStatus === "overdue").length;
  const dueSoonCount = evaluatedAlerts.filter((a) => a.alertStatus === "due_soon").length;
  const normalCount = evaluatedAlerts.filter((a) => a.alertStatus === "normal").length;

  // Filtered Master Matrix Items
  const filteredMatrixItems = useMemo(() => {
    return MASTER_INTERVAL_CHECKLIST_MATRIX.filter((item) => {
      // Search
      if (matrixSearch.trim()) {
        const q = matrixSearch.toLowerCase();
        const matchTitle = item.itemTitle.toLowerCase().includes(q);
        const matchDesc = item.itemDescription.toLowerCase().includes(q);
        const matchParts = item.standardParts.toLowerCase().includes(q);
        const matchCat = item.categoryNameTh.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchParts && !matchCat) return false;
      }
      // Category filter
      if (matrixCategoryFilter !== "all" && item.category !== matrixCategoryFilter) {
        return false;
      }
      // Execution type filter (checks if item has in_house or dealer anywhere)
      if (matrixTypeFilter === "in_house") {
        const hasInHouse = [item.pm10k, item.pm30k, item.pm80k, item.pm120k, item.pm200k].some(
          (p) => p.action === "in_house"
        );
        if (!hasInHouse) return false;
      } else if (matrixTypeFilter === "dealer") {
        const hasDealer = [item.pm10k, item.pm30k, item.pm80k, item.pm120k, item.pm200k].some(
          (p) => p.action === "dealer"
        );
        if (!hasDealer) return false;
      }
      return true;
    });
  }, [matrixSearch, matrixCategoryFilter, matrixTypeFilter]);

  // Filtered vehicle evaluations
  const filteredAlerts = useMemo(() => {
    return evaluatedAlerts.filter((item) => {
      if (vehicleSearch.trim()) {
        const q = vehicleSearch.toLowerCase();
        const matchPlate = item.licensePlate.toLowerCase().includes(q);
        const matchBrand = item.vehicleBrand.toLowerCase().includes(q);
        const matchModel = item.vehicleModel.toLowerCase().includes(q);
        if (!matchPlate && !matchBrand && !matchModel) return false;
      }
      if (statusFilter !== "all" && item.alertStatus !== statusFilter) {
        return false;
      }
      if (selectedVehicleType !== "all" && item.vehicleType !== selectedVehicleType) {
        return false;
      }
      return true;
    });
  }, [evaluatedAlerts, vehicleSearch, statusFilter, selectedVehicleType]);

  // Selected plan details for Single Interval View
  const activePlan = useMemo(() => {
    return (
      MAINTENANCE_INTERVAL_PLANS.find((p) => p.intervalKm === selectedIntervalKm) ||
      MAINTENANCE_INTERVAL_PLANS[0]
    );
  }, [selectedIntervalKm]);

  // Categories list for filter chips
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    MASTER_INTERVAL_CHECKLIST_MATRIX.forEach((it) => {
      map.set(it.category, it.categoryNameTh);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "ลำดับ",
      "หมวดหมู่",
      "รายการตรวจเช็ค / บำรุงรักษา",
      "รายละเอียด",
      "10,000 กม. (PM1)",
      "30,000 กม. (PM2)",
      "80,000 กม. (PM3)",
      "120,000 กม. (PM4)",
      "200,000+ กม. (PM5)",
      "อะไหล่ / ของเหลวที่ใช้"
    ];

    const rows = filteredMatrixItems.map((item, idx) => [
      (idx + 1).toString(),
      `"${item.categoryNameTh}"`,
      `"${item.itemTitle}"`,
      `"${item.itemDescription}"`,
      `"${item.pm10k.label}"`,
      `"${item.pm30k.label}"`,
      `"${item.pm80k.label}"`,
      `"${item.pm120k.label}"`,
      `"${item.pm200k.label}"`,
      `"${item.standardParts}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TNB_Fleet_Maintenance_Interval_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper renderer for matrix table cell
  const renderCellBadge = (cell: { action: "in_house" | "dealer" | "inspect" | "none"; label: string; detail?: string }) => {
    if (cell.action === "none") {
      return <span className="text-slate-400 font-mono text-xs">-</span>;
    }

    if (cell.action === "in_house") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
          <span>{cell.label}</span>
        </span>
      );
    }

    if (cell.action === "dealer") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
          <span>{cell.label}</span>
        </span>
      );
    }

    // inspect
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
        <span>{cell.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER & STATS */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Fleet Maintenance Interval Matrix & Master Schedule (ISO 39001)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>ตารางแผนซ่อมบำรุงตามระยะทาง</span>
              <span className="text-xs bg-blue-500/25 text-blue-300 border border-blue-400/40 px-2.5 py-0.5 rounded-full font-medium">
                10k - 200k+ กม.
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              ตารางเปรียบเทียบรายการตรวจเช็คและบำรุงรักษาทุกระยะ แยกชัดเจนระหว่าง 
              <strong className="text-emerald-300 mx-1 font-semibold">🏠 ทำเองในอู่ TNB</strong> และ 
              <strong className="text-amber-300 mx-1 font-semibold">🏢 ส่งเข้าศูนย์บริการ</strong> 
              พร้อมตรวจสอบสถานะเลขไมล์รถในกองยาน {vehicles.length} คันแบบเรียลไทม์
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 backdrop-blur-sm self-stretch lg:self-auto justify-between sm:justify-start">
            <div className="text-center px-2">
              <div className="text-[11px] text-rose-400 font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> เกินระยะ (Overdue)
              </div>
              <div className="text-lg sm:text-xl font-bold text-rose-300 mt-0.5 font-mono">{overdueCount} คัน</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ถึงรอบ (Due Soon)
              </div>
              <div className="text-lg sm:text-xl font-bold text-amber-300 mt-0.5 font-mono">{dueSoonCount} คัน</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ปกติ (Normal)
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-300 mt-0.5 font-mono">{normalCount} คัน</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("master_matrix")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "master_matrix"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <TableIcon className="w-4 h-4 text-emerald-300" />
              <span>1. ตารางเมทริกซ์รวมทุกระยะ (Master Matrix Table)</span>
            </button>

            <button
              onClick={() => setActiveTab("fleet_mileage_table")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "fleet_mileage_table"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Gauge className="w-4 h-4 text-blue-300" />
              <span>2. ตารางสถานะรถตามเลขไมล์ ({vehicles.length} คัน)</span>
              {(overdueCount + dueSoonCount > 0) && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                  {overdueCount + dueSoonCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("interval_detail")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "interval_detail"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>3. ตารางแจกแจงเฉพาะระยะ (Single Interval Detail)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="ส่งออกตารางเมทริกซ์เป็น Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ส่งออก Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="พิมพ์ตาราง"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">พิมพ์ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB 1: MASTER COMPARISON MATRIX TABLE (MAIN REQUEST)  */}
      {/* ======================================================== */}
      {activeTab === "master_matrix" && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Category Filter Pills */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารายการบำรุงรักษา เช่น น้ำมันเครื่อง, ไส้กรอง, จารบี, ผ้าเบรก..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Execution Type filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
                <button
                  onClick={() => setMatrixTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    matrixTypeFilter === "all"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ทุกประเภท ({filteredMatrixItems.length})
                </button>
                <button
                  onClick={() => setMatrixTypeFilter("in_house")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    matrixTypeFilter === "in_house"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>เฉพาะทำเองในอู่</span>
                </button>
                <button
                  onClick={() => setMatrixTypeFilter("dealer")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    matrixTypeFilter === "dealer"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>เฉพาะส่งศูนย์บริการ</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
              <span className="text-slate-500 font-bold whitespace-nowrap mr-1">หมวดหมู่:</span>
              <button
                onClick={() => setMatrixCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  matrixCategoryFilter === "all"
                    ? "bg-blue-600 text-white shadow-2xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setMatrixCategoryFilter(cat.key)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    matrixCategoryFilter === cat.key
                      ? "bg-blue-600 text-white shadow-2xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Matrix Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header Description & Legend */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  ตารางเปรียบเทียบมาตรฐานการซ่อมบำรุงตามระยะทาง 5 ช่วงระยะ (FLEET MASTER CHECKLIST MATRIX)
                </span>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> 🏠 ทำเองในอู่
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 🏢 ส่งศูนย์บริการ
                </span>
                <span className="inline-flex items-center gap-1 text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-600/40">
                  🔍 ตรวจเช็คสภาพ
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center border-r border-slate-200">#</th>
                    <th className="py-3.5 px-3 w-36 border-r border-slate-200">หมวดหมู่</th>
                    <th className="py-3.5 px-4 min-w-[260px] border-r border-slate-200">รายการตรวจเช็ค / บำรุงรักษา</th>
                    <th className="py-3.5 px-3 w-28 text-center bg-blue-50/70 border-r border-slate-200">
                      <div className="font-extrabold text-blue-900">10,000 กม.</div>
                      <div className="text-[10px] text-blue-600 font-normal">PM 1: ระยะย่อย (A)</div>
                    </th>
                    <th className="py-3.5 px-3 w-28 text-center bg-indigo-50/70 border-r border-slate-200">
                      <div className="font-extrabold text-indigo-900">30,000 กม.</div>
                      <div className="text-[10px] text-indigo-600 font-normal">PM 2: ระยะกลาง (B)</div>
                    </th>
                    <th className="py-3.5 px-3 w-28 text-center bg-purple-50/70 border-r border-slate-200">
                      <div className="font-extrabold text-purple-900">80,000 กม.</div>
                      <div className="text-[10px] text-purple-600 font-normal">PM 3: ระยะใหญ่ 1 (C)</div>
                    </th>
                    <th className="py-3.5 px-3 w-28 text-center bg-amber-50/70 border-r border-slate-200">
                      <div className="font-extrabold text-amber-900">120,000 กม.</div>
                      <div className="text-[10px] text-amber-700 font-normal">PM 4: ระยะใหญ่ 2 (D)</div>
                    </th>
                    <th className="py-3.5 px-3 w-28 text-center bg-rose-50/70 border-r border-slate-200">
                      <div className="font-extrabold text-rose-900">200,000+ กม.</div>
                      <div className="text-[10px] text-rose-700 font-normal">PM 5: ยกเครื่อง (E)</div>
                    </th>
                    <th className="py-3.5 px-4 min-w-[200px]">อะไหล่ / ของเหลวมาตรฐาน</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredMatrixItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">ไม่พบรายการบำรุงรักษาตามตัวกรอง</p>
                          <button
                            onClick={() => {
                              setMatrixSearch("");
                              setMatrixCategoryFilter("all");
                              setMatrixTypeFilter("all");
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            ล้างตัวกรองทั้งหมด
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMatrixItems.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold border-r border-slate-100">
                          {index + 1}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 border-r border-slate-100">
                          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                            {item.categoryNameTh}
                          </span>
                        </td>

                        {/* Item Title & Description */}
                        <td className="py-3 px-4 border-r border-slate-100">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.itemTitle}</span>
                            {item.isCrucialSafetyItem && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold border border-rose-200 whitespace-nowrap">
                                เซฟตี้หลัก
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {item.itemDescription}
                          </div>
                        </td>

                        {/* 10,000 km cell */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-blue-50/20 group-hover:bg-blue-100/30">
                          {renderCellBadge(item.pm10k)}
                        </td>

                        {/* 30,000 km cell */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-indigo-50/20 group-hover:bg-indigo-100/30">
                          {renderCellBadge(item.pm30k)}
                        </td>

                        {/* 80,000 km cell */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-purple-50/20 group-hover:bg-purple-100/30">
                          {renderCellBadge(item.pm80k)}
                        </td>

                        {/* 120,000 km cell */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-amber-50/20 group-hover:bg-amber-100/30">
                          {renderCellBadge(item.pm120k)}
                        </td>

                        {/* 200,000 km cell */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-rose-50/20 group-hover:bg-rose-100/30">
                          {renderCellBadge(item.pm200k)}
                        </td>

                        {/* Parts & Fluids */}
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          <div className="font-medium text-slate-700">
                            {item.standardParts}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Footer: Summary Per Interval */}
                <tfoot className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 text-right border-r border-slate-800 text-slate-300">
                      สรุปภาพรวมแผนงาน & งบประมาณต่อรอบ:
                    </td>
                    
                    {/* 10k summary */}
                    <td className="py-3.5 px-2 text-center border-r border-slate-800 bg-slate-950/60">
                      <div className="text-emerald-400 text-xs">🏠 7 ข้อ | 🏢 1 ข้อ</div>
                      <div className="text-amber-300 text-[11px] font-mono mt-0.5">~฿3,500</div>
                    </td>

                    {/* 30k summary */}
                    <td className="py-3.5 px-2 text-center border-r border-slate-800 bg-slate-950/60">
                      <div className="text-emerald-400 text-xs">🏠 10 ข้อ | 🏢 3 ข้อ</div>
                      <div className="text-amber-300 text-[11px] font-mono mt-0.5">~฿8,500</div>
                    </td>

                    {/* 80k summary */}
                    <td className="py-3.5 px-2 text-center border-r border-slate-800 bg-slate-950/60">
                      <div className="text-emerald-400 text-xs">🏠 11 ข้อ | 🏢 5 ข้อ</div>
                      <div className="text-amber-300 text-[11px] font-mono mt-0.5">~฿18,500</div>
                    </td>

                    {/* 120k summary */}
                    <td className="py-3.5 px-2 text-center border-r border-slate-800 bg-slate-950/60">
                      <div className="text-emerald-400 text-xs">🏠 12 ข้อ | 🏢 6 ข้อ</div>
                      <div className="text-amber-300 text-[11px] font-mono mt-0.5">~฿32,000</div>
                    </td>

                    {/* 200k summary */}
                    <td className="py-3.5 px-2 text-center border-r border-slate-800 bg-slate-950/60">
                      <div className="text-emerald-400 text-xs">🏠 13 ข้อ | 🏢 7 ข้อ</div>
                      <div className="text-amber-300 text-[11px] font-mono mt-0.5">~฿65,000</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      มาตรฐานอู่กลาง TNB & สัญญาเช็คศูนย์รายปี
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB 2: FLEET MILEAGE TABLE (108 VEHICLES)             */}
      {/* ======================================================== */}
      {activeTab === "fleet_mileage_table" && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Threshold Slider, Status Filter, View Toggle */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่นรถ..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ทั้งหมด ({evaluatedAlerts.length})
                </button>
                <button
                  onClick={() => setStatusFilter("overdue")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    statusFilter === "overdue" ? "bg-rose-600 text-white shadow-sm" : "text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  🔴 เกินระยะ ({overdueCount})
                </button>
                <button
                  onClick={() => setStatusFilter("due_soon")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    statusFilter === "due_soon" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  🟡 ถึงรอบ ({dueSoonCount})
                </button>
                <button
                  onClick={() => setStatusFilter("normal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    statusFilter === "normal" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  🟢 ปกติ ({normalCount})
                </button>
              </div>
            </div>

            {/* Threshold Selector Setting & View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-xs">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-blue-900">เกณฑ์เตือน (±):</span>
                <select
                  value={thresholdKm}
                  onChange={(e) => setThresholdKm(Number(e.target.value))}
                  className="bg-white border border-blue-300 text-blue-900 font-bold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value={500}>± 500 กม.</option>
                  <option value={1000}>± 1,000 กม. (มาตรฐาน)</option>
                  <option value={2000}>± 2,000 กม.</option>
                  <option value={3000}>± 3,000 กม.</option>
                  <option value={5000}>± 5,000 กม.</option>
                </select>
              </div>

              {/* Toggle Table vs Cards */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFleetViewStyle("table")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    fleetViewStyle === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="มุมมองตาราง"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFleetViewStyle("cards")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    fleetViewStyle === "cards" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="มุมมองการ์ด"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* FLEET MILEAGE TABLE VIEW */}
          {fleetViewStyle === "table" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center border-r border-slate-200">#</th>
                      <th className="py-3 px-3 w-32 border-r border-slate-200">ทะเบียนรถ</th>
                      <th className="py-3 px-3 w-40 border-r border-slate-200">ยี่ห้อ / รุ่น / ประเภท</th>
                      <th className="py-3 px-3 w-28 text-right border-r border-slate-200">ไมล์ปัจจุบัน</th>
                      <th className="py-3 px-3 w-28 text-right border-r border-slate-200">รอบบำรุงรักษา</th>
                      <th className="py-3 px-3 w-36 text-center border-r border-slate-200">สถานะ & ส่วนต่างไมล์</th>
                      <th className="py-3 px-4 border-r border-slate-200">แผน PM & รายการที่ต้องทำ</th>
                      <th className="py-3 px-3 w-24 text-right border-r border-slate-200">ประมาณการ</th>
                      <th className="py-3 px-3 w-32 text-center">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">ไม่พบข้อมูลรถตามเงื่อนไขการค้นหา</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert, index) => {
                        const isOverdue = alert.alertStatus === "overdue";
                        const isDueSoon = alert.alertStatus === "due_soon";
                        const isNormal = alert.alertStatus === "normal";

                        return (
                          <tr
                            key={alert.vehicleId}
                            className={`hover:bg-slate-50 transition-colors ${
                              isOverdue ? "bg-rose-50/30" : isDueSoon ? "bg-amber-50/25" : ""
                            }`}
                          >
                            {/* Index */}
                            <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold border-r border-slate-100">
                              {index + 1}
                            </td>

                            {/* Plate */}
                            <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-100">
                              <span className="font-mono text-sm">{alert.licensePlate}</span>
                            </td>

                            {/* Brand / Model / Type */}
                            <td className="py-3 px-3 border-r border-slate-100">
                              <div className="font-semibold text-slate-800 text-xs">
                                {alert.vehicleBrand} {alert.vehicleModel}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {VEHICLE_TYPE_LABELS[alert.vehicleType] || alert.vehicleType}
                              </div>
                            </td>

                            {/* Current Mileage */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                              {alert.currentMileage.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">กม.</span>
                            </td>

                            {/* Target Interval */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 border-r border-slate-100">
                              {alert.closestIntervalKm.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">กม.</span>
                            </td>

                            {/* Status Chip */}
                            <td className="py-3 px-3 text-center border-r border-slate-100">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isOverdue
                                  ? "bg-rose-100 text-rose-700 border-rose-300"
                                  : isDueSoon
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}>
                                {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                {isDueSoon && <Clock className="w-3 h-3 text-amber-600" />}
                                {isNormal && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                <span>
                                  {isOverdue && `เกิน +${Math.abs(alert.diffKm).toLocaleString()} กม.`}
                                  {isDueSoon && (alert.diffKm >= 0 ? `ตรงรอบ +${alert.diffKm} กม.` : `เหลือ ${Math.abs(alert.diffKm)} กม.`)}
                                  {isNormal && `เหลือ ${Math.abs(alert.diffKm).toLocaleString()} กม.`}
                                </span>
                              </span>
                            </td>

                            {/* Plan Name & Item breakdown */}
                            <td className="py-3 px-4 border-r border-slate-100">
                              <div className="font-bold text-slate-900 text-xs line-clamp-1">
                                {alert.matchedPlan.intervalNameTh}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  🏠 ทำเอง {alert.inHouseItemsCount} ข้อ
                                </span>
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  🏢 ส่งศูนย์ {alert.dealerItemsCount} ข้อ
                                </span>
                              </div>
                            </td>

                            {/* Estimated Cost */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                              ฿{alert.matchedPlan.estimatedTotalCost.toLocaleString()}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {onRequestRepairForVehicle ? (
                                  <button
                                    onClick={() => onRequestRepairForVehicle(alert.licensePlate)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                                      isOverdue
                                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                                        : isDueSoon
                                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                    title="เปิดใบแจ้งซ่อมตามรอบ PM"
                                  >
                                    <Wrench className="w-3 h-3" />
                                    <span>แจ้งซ่อม</span>
                                  </button>
                                ) : (
                                  onCreateTicketFromPM && (
                                    <button
                                      onClick={() => {
                                        const v = vehicles.find((item) => item.id === alert.vehicleId);
                                        if (v) onCreateTicketFromPM(v, alert.matchedPlan);
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-2xs"
                                    >
                                      <Wrench className="w-3 h-3" />
                                      <span>แจ้งซ่อม</span>
                                    </button>
                                  )
                                )}

                                {onOpenVehicleRepairHistory && (
                                  <button
                                    onClick={() => onOpenVehicleRepairHistory(alert.licensePlate)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                                    title="ดูประวัติการซ่อม"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
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
          ) : (
            /* FLEET MILEAGE CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAlerts.map((alert) => {
                const isOverdue = alert.alertStatus === "overdue";
                const isDueSoon = alert.alertStatus === "due_soon";
                const isNormal = alert.alertStatus === "normal";
                const progressPct = Math.min(100, Math.max(0, Math.round((alert.currentMileage / alert.closestIntervalKm) * 100)));

                return (
                  <div
                    key={alert.vehicleId}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                      isOverdue
                        ? "border-rose-300 bg-gradient-to-b from-rose-50/40 to-white ring-1 ring-rose-200"
                        : isDueSoon
                        ? "border-amber-300 bg-gradient-to-b from-amber-50/40 to-white ring-1 ring-amber-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Card Top */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            isOverdue
                              ? "bg-rose-600 text-white"
                              : isDueSoon
                              ? "bg-amber-500 text-white"
                              : "bg-slate-800 text-white"
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-base text-slate-900 tracking-tight">
                              {alert.licensePlate}
                            </div>
                            <div className="text-xs text-slate-500">
                              {alert.vehicleBrand} {alert.vehicleModel} • {VEHICLE_TYPE_LABELS[alert.vehicleType] || alert.vehicleType}
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                          isOverdue
                            ? "bg-rose-100 text-rose-700 border-rose-300"
                            : isDueSoon
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {isDueSoon && <Clock className="w-3 h-3 text-amber-600" />}
                          {isNormal && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>
                            {isOverdue && `เกิน +${Math.abs(alert.diffKm).toLocaleString()} กม.`}
                            {isDueSoon && (alert.diffKm >= 0 ? `ตรงรอบ +${alert.diffKm} กม.` : `เหลือ ${Math.abs(alert.diffKm)} กม.`)}
                            {isNormal && `เหลือ ${Math.abs(alert.diffKm).toLocaleString()} กม.`}
                          </span>
                        </div>
                      </div>

                      {/* Mileage progress */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">เลขไมล์ปัจจุบัน:</span>
                          <span className="font-extrabold text-slate-900 text-sm font-mono">
                            {alert.currentMileage.toLocaleString()} <span className="text-xs font-normal text-slate-500">กม.</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">รอบเป้าหมาย:</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {alert.closestIntervalKm.toLocaleString()} กม.
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOverdue ? "bg-rose-500" : isDueSoon ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, progressPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Matched Plan */}
                      <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          📋 {alert.matchedPlan.intervalNameTh}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            🏠 ทำเอง {alert.inHouseItemsCount} ข้อ
                          </span>
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            🏢 ส่งศูนย์ {alert.dealerItemsCount} ข้อ
                          </span>
                          <span className="ml-auto font-medium text-slate-700">
                            ~฿{alert.matchedPlan.estimatedTotalCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedIntervalKm(alert.matchedPlan.intervalKm);
                          setActiveTab("interval_detail");
                        }}
                        className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
                      >
                        ดูรายการตรวจ ({alert.matchedPlan.totalItemsCount} ข้อ)
                      </button>

                      {onRequestRepairForVehicle ? (
                        <button
                          onClick={() => onRequestRepairForVehicle(alert.licensePlate)}
                          className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                            isOverdue
                              ? "bg-rose-600 hover:bg-rose-700 text-white"
                              : isDueSoon
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>เปิดใบแจ้งซ่อม</span>
                        </button>
                      ) : (
                        onCreateTicketFromPM && (
                          <button
                            onClick={() => {
                              const v = vehicles.find((item) => item.id === alert.vehicleId);
                              if (v) onCreateTicketFromPM(v, alert.matchedPlan);
                            }}
                            className="py-1.5 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>เปิดใบแจ้งซ่อม</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 3: SINGLE INTERVAL DETAIL (DEEP-DIVE TABLE)       */}
      {/* ======================================================== */}
      {activeTab === "interval_detail" && (
        <div className="space-y-5">
          {/* Interval Selector Tabs (10k, 30k, 80k, 120k, 200k) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MAINTENANCE_INTERVAL_PLANS.map((plan) => {
              const isSelected = selectedIntervalKm === plan.intervalKm;
              return (
                <button
                  key={plan.intervalKm}
                  onClick={() => setSelectedIntervalKm(plan.intervalKm)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-300"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-100" : "text-blue-600"}`}>
                    ทุกระยะ {plan.intervalKm.toLocaleString()} กม.
                  </div>
                  <div className="font-extrabold text-sm mt-0.5 line-clamp-1">
                    {plan.intervalNameEn}
                  </div>
                  <div className={`text-xs mt-2 flex items-center justify-between ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    <span>{plan.totalItemsCount} รายการ</span>
                    <span className="font-semibold font-mono">~฿{plan.estimatedTotalCost.toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Plan Detail & Checklist Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Plan Header Overview */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>มาตรฐานการบำรุงรักษายานพาหนะ TNB Logistics Standard Checklist</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activePlan.intervalNameTh}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {activePlan.description}
                </p>
              </div>

              {/* In-House vs Dealer Center Stats */}
              <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 self-start md:self-auto">
                <div className="text-center px-2">
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> ทำเองในอู่
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    {activePlan.inHouseItemsCount} <span className="text-xs font-normal text-slate-400">ข้อ</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center px-2">
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> ส่งศูนย์บริการ
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    {activePlan.dealerItemsCount} <span className="text-xs font-normal text-slate-400">ข้อ</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center px-2">
                  <div className="text-xs text-blue-400 font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> ค่าใช้จ่ายประมาณ
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    ฿{activePlan.estimatedTotalCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                    <th className="py-3 px-4 w-36">หมวดหมู่งาน</th>
                    <th className="py-3 px-4">รายการตรวจสอบ / งานบำรุงรักษา</th>
                    <th className="py-3 px-4 w-44 text-center">ประเภทการซ่อม (ทำเอง/ศูนย์)</th>
                    <th className="py-3 px-4 w-48">อะไหล่ / ของเหลวที่ใช้</th>
                    <th className="py-3 px-4 w-28 text-right">เวลาประมาณ</th>
                    <th className="py-3 px-4 w-32 text-right">ค่าใช้จ่ายประมาณ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePlan.items.map((item, index) => {
                    const isInHouse = item.executionType === "in_house";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                            {item.categoryNameTh}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.itemTitle}</span>
                            {item.isCrucialSafetyItem && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold border border-rose-200">
                                จุดเซฟตี้หลัก
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {item.itemDescription}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isInHouse ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Home className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ทำเองในอู่ TNB</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Building2 className="w-3.5 h-3.5 text-amber-700" />
                              <span>ส่งเข้าศูนย์บริการ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {item.standardPartsUsed && item.standardPartsUsed.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5">
                              {item.standardPartsUsed.map((p, pIdx) => (
                                <li key={pIdx}>{p}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic">- ไม่มีใช้อะไหล่เพิ่ม -</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-medium font-mono">
                          {item.estimatedLaborMinutes} นาที
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                          {item.estimatedCost > 0 ? `฿${item.estimatedCost.toLocaleString()}` : <span className="text-slate-400 text-xs">ฟรี/รวมค่าแรง</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
