import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Clock, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  DollarSign, 
  ChevronRight, 
  Calendar,
  Sparkles,
  PlusCircle,
  X,
  SlidersHorizontal,
  Star,
  Layers,
  RotateCcw,
  CheckSquare,
  MapPin,
  Navigation
} from "lucide-react";
import { RepairTicket, RepairCategory, RepairStatus, Priority, VehicleType } from "../types";
import { CATEGORIES_CONFIG, STATUS_CONFIG, VEHICLE_TYPE_LABELS, getSubCategoryName } from "../data/categories";

interface TicketTrackerProps {
  tickets: RepairTicket[];
  onSelectTicket: (ticket: RepairTicket) => void;
  onOpenNewModal: () => void;
  onOpenBackdatedModal?: () => void;
  onOpenImportTicketsModal?: () => void;
  onQuickStatusChange: (ticketId: string, newStatus: RepairStatus) => void;
}

const TECHNICIANS = [
  "ช่างวิชาญ",
  "ช่างอนันต์",
  "ช่างธีระพงษ์",
  "ช่างประสิทธิ์",
  "ช่างสมเกียรติ",
  "ช่างมนตรี",
  "ช่างสุรชัย"
];

export const TicketTracker: React.FC<TicketTrackerProps> = ({
  tickets,
  onSelectTicket,
  onOpenNewModal,
  onOpenBackdatedModal,
  onOpenImportTicketsModal,
  onQuickStatusChange
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Advanced Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedCarType, setSelectedCarType] = useState<string>("all");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "this_week" | "this_month" | "last_30_days">("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "rated" | "5_star" | "4_plus" | "unrated">("all");

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedCarType("all");
    setSelectedTechnician("all");
    setDateRange("all");
    setRatingFilter("all");
  };

  // Date boundary calculation
  const isWithinDateRange = (dateStr: string, range: string) => {
    if (range === "all") return true;
    const ticketDate = new Date(dateStr).getTime();
    const now = new Date();
    
    if (range === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return ticketDate >= startOfDay;
    }
    if (range === "this_week") {
      const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
      return ticketDate >= oneWeekAgo;
    }
    if (range === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return ticketDate >= startOfMonth;
    }
    if (range === "last_30_days") {
      const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
      return ticketDate >= thirtyDaysAgo;
    }
    return true;
  };

  // Active sub-categories based on selected primary category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "all") {
      // consolidate all sub-categories
      const subs: { id: string; nameTh: string; parentName: string }[] = [];
      Object.entries(CATEGORIES_CONFIG).forEach(([catKey, catMeta]) => {
        catMeta.subCategories.forEach((sub) => {
          subs.push({ ...sub, parentName: catMeta.nameTh });
        });
      });
      return subs;
    }
    const catObj = CATEGORIES_CONFIG[selectedCategory as RepairCategory];
    return catObj ? catObj.subCategories.map(s => ({ ...s, parentName: catObj.nameTh })) : [];
  }, [selectedCategory]);

  // Filter logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchSearch = 
          t.licensePlate.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.vehicleBrand.toLowerCase().includes(q) ||
          t.vehicleModel.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          (t.assignedMechanic && t.assignedMechanic.toLowerCase().includes(q)) ||
          t.symptoms.toLowerCase().includes(q) ||
          (t.subCategoryName && t.subCategoryName.toLowerCase().includes(q)) ||
          (t.issues && t.issues.some(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)));
        if (!matchSearch) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "all" && t.category !== selectedCategory) {
        return false;
      }

      // 3. Sub-Category filter
      if (selectedSubCategory !== "all") {
        const hasSubCategory = 
          t.subCategoryId === selectedSubCategory || 
          (t.issues && t.issues.some(i => i.subCategoryId === selectedSubCategory));
        if (!hasSubCategory) return false;
      }

      // 4. Status filter
      if (selectedStatus !== "all" && t.status !== selectedStatus) {
        return false;
      }

      // 5. Priority filter
      if (selectedPriority !== "all" && t.priority !== selectedPriority) {
        return false;
      }

      // 6. Car Type filter
      if (selectedCarType !== "all" && t.vehicleType !== selectedCarType) {
        return false;
      }

      // 7. Assigned Technician
      if (selectedTechnician !== "all") {
        if (selectedTechnician === "unassigned") {
          if (t.assignedMechanic) return false;
        } else {
          if (!t.assignedMechanic || !t.assignedMechanic.includes(selectedTechnician)) return false;
        }
      }

      // 8. Date Range
      if (!isWithinDateRange(t.createdAt, dateRange)) {
        return false;
      }

      // 9. Feedback Rating Filter
      if (ratingFilter !== "all") {
        if (ratingFilter === "rated" && !t.feedback) return false;
        if (ratingFilter === "unrated" && t.feedback) return false;
        if (ratingFilter === "5_star" && (!t.feedback || t.feedback.overallRating !== 5)) return false;
        if (ratingFilter === "4_plus" && (!t.feedback || (t.feedback.overallRating || 0) < 4)) return false;
      }

      return true;
    });
  }, [
    tickets, 
    searchQuery, 
    selectedCategory, 
    selectedSubCategory, 
    selectedStatus, 
    selectedPriority, 
    selectedCarType, 
    selectedTechnician, 
    dateRange, 
    ratingFilter
  ]);

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedSubCategory !== "all",
    selectedStatus !== "all",
    selectedPriority !== "all",
    selectedCarType !== "all",
    selectedTechnician !== "all",
    dateRange !== "all",
    ratingFilter !== "all"
  ].filter(Boolean).length;

  const KANBAN_COLUMNS: { id: RepairStatus; label: string; bg: string }[] = [
    { id: "pending", label: "รอดำเนินการ / รับเรื่อง", bg: "border-amber-400 bg-amber-50/50" },
    { id: "inspecting", label: "กำลังตรวจเช็ค", bg: "border-blue-400 bg-blue-50/50" },
    { id: "waiting_parts", label: "รออะไหล่", bg: "border-purple-400 bg-purple-50/50" },
    { id: "in_progress", label: "กำลังซ่อมแซม", bg: "border-sky-400 bg-sky-50/50" },
    { id: "testing", label: "ทดสอบคุณภาพ (QC)", bg: "border-emerald-400 bg-emerald-50/50" },
    { id: "completed", label: "ซ่อมเสร็จสมบูรณ์", bg: "border-green-400 bg-green-50/50" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Control Bar with Search and Filter toggles */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>ศูนย์ติดตามสถานะงานซ่อมบำรุงรถยนต์</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {filteredTickets.length} ใบงาน
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามความคืบหน้ารายชั่วโมง จัดการอะไหล่ มอบหมายช่าง และประเมินความพึงพอใจ
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                showAdvancedFilters || activeFilterCount > 0
                  ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรองขั้นสูง</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-slate-700">
              <button
                type="button"
                id="btn-view-kanban"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>บอร์ดคัมบัง</span>
              </button>
              <button
                type="button"
                id="btn-view-table"
                onClick={() => setViewMode("table")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>ตารางรายการ</span>
              </button>
            </div>

            {/* Action Buttons: Import, Backdated, and New Ticket */}
            {onOpenImportTicketsModal && (
              <button
                type="button"
                onClick={onOpenImportTicketsModal}
                id="btn-quick-import-tickets"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 transition-all flex items-center space-x-1.5"
                title="นำเข้าไฟล์ Excel ประวัติงานซ่อมย้อนหลัง"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">นำเข้า Excel</span>
              </button>
            )}

            {onOpenBackdatedModal && (
              <button
                type="button"
                onClick={onOpenBackdatedModal}
                id="btn-quick-backdated-ticket"
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                title="ลงข้อมูลใบแจ้งซ่อมย้อนหลัง"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>+ ลงย้อนหลัง</span>
              </button>
            )}

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={onOpenNewModal}
              id="btn-quick-new-ticket"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แจ้งซ่อมใหม่</span>
            </button>
          </div>
        </div>

        {/* Search & Fast Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-input-tracker"
              placeholder="ค้นหาทะเบียน, ชื่อผู้แจ้ง, อาการ, ช่าง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("all");
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="all">📁 ทุกประเภทหลัก (All Categories)</option>
              {(Object.keys(CATEGORIES_CONFIG) as RepairCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORIES_CONFIG[catKey].nameTh}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="all">🚦 ทุกสถานะงาน (All Status)</option>
              {KANBAN_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{STATUS_CONFIG[col.id].labelTh}</option>
              ))}
            </select>
          </div>

          {/* Car Type Dropdown */}
          <div>
            <select
              value={selectedCarType}
              onChange={(e) => setSelectedCarType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="all">🚗 ทุกประเภทรถยนต์ (All Vehicle Types)</option>
              {Object.entries(VEHICLE_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                ตัวกรองละเอียด (Advanced Search Filters):
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                ล้างตัวกรองทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Sub-Category Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ประเภทย่อย (Sub-Category):</label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">🔍 ทุกประเภทย่อย</option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nameTh} ({sub.parentName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Technician Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ช่างผู้รับผิดชอบ (Assigned Tech):</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">👨‍🔧 ทุกช่าง</option>
                  <option value="unassigned">⏳ ยังไม่มอบหมายช่าง</option>
                  {TECHNICIANS.map((tech) => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ช่วงเวลาที่แจ้ง (Date Range):</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">📅 ทุกช่วงเวลา</option>
                  <option value="today">วันนี้ (Today)</option>
                  <option value="this_week">สัปดาห์นี้ (This Week)</option>
                  <option value="this_month">เดือนนี้ (This Month)</option>
                  <option value="last_30_days">30 วันล่าสุด (Last 30 Days)</option>
                </select>
              </div>

              {/* Customer Rating Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">คะแนนความพึงพอใจ (Rating):</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="all">⭐ ทุกคะแนนประเมิน</option>
                  <option value="rated">มีผลประเมินแล้ว</option>
                  <option value="5_star">⭐⭐⭐⭐⭐ 5 ดาวเต็ม</option>
                  <option value="4_plus">⭐⭐⭐⭐ 4 ดาวขึ้นไป</option>
                  <option value="unrated">ยังไม่ได้ประเมิน</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubCategory("all");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทั้งหมด ({tickets.length})
          </button>
          {(Object.keys(CATEGORIES_CONFIG) as RepairCategory[]).map((catKey) => {
            const count = tickets.filter((t) => t.category === catKey).length;
            const isSel = selectedCategory === catKey;
            return (
              <button
                type="button"
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setSelectedSubCategory("all");
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSel
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{CATEGORIES_CONFIG[catKey].nameTh}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const columnTickets = filteredTickets.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[col.id].bgColor}`} />
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {col.label.split("/")[0]}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTickets.map((t) => {
                    const cat = CATEGORIES_CONFIG[t.category];
                    const subName = t.subCategoryName || getSubCategoryName(t.category, t.subCategoryId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTicket(t)}
                        id={`ticket-card-${t.id}`}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer space-y-2.5 group relative"
                      >
                        {/* Priority Badge & Category / Sub-Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cat.borderColor} ${cat.bgLight}`}>
                              {cat.nameTh}
                            </span>
                            {subName && (
                              <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 truncate max-w-[80px]">
                                {subName}
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                            t.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            t.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* License Plate & Car Model */}
                        <div>
                          <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t.licensePlate}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {t.vehicleBrand} {t.vehicleModel} • {VEHICLE_TYPE_LABELS[t.vehicleType] || t.vehicleType}
                          </div>
                        </div>

                        {/* Emergency Breakdown Location Alert */}
                        {t.breakdownLocation?.isEmergencyBreakdown && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded-md text-[10px] font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-600 animate-bounce" />
                              <span className="truncate max-w-[130px]">{t.breakdownLocation.locationName || "รถเสียฉุกเฉินนอกสถานที่"}</span>
                            </span>
                            <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">GPS</span>
                          </div>
                        )}

                        {/* Multiple Issues Summary indicator */}
                        {t.issues && t.issues.length > 1 && (
                          <div className="text-[10px] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 flex items-center justify-between font-medium">
                            <span>{t.issues.length} ปัญหาย่อย</span>
                            <span>{t.issues.filter(i => i.isResolved).length}/{t.issues.length} เสร็จแล้ว</span>
                          </div>
                        )}

                        {/* Photo Thumbnail if available */}
                        {t.attachedImages && t.attachedImages.length > 0 && (
                          <div className="rounded-lg overflow-hidden aspect-video bg-slate-900 border border-slate-200">
                            <img src={t.attachedImages[0]} alt="รูปอาการเสีย" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}

                        {/* Symptoms snippet */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {t.symptoms}
                        </p>

                        {/* Feedback Stars if present */}
                        {t.feedback && (
                          <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{t.feedback.overallRating}/5 ดาว</span>
                            <span className="text-slate-400 font-normal truncate">({t.feedback.comment})</span>
                          </div>
                        )}

                        {/* Requester, Mechanic & Cost Info */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[120px]">
                            <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{t.assignedMechanic ? t.assignedMechanic.split(" ")[0] : "รอจ่ายงาน"}</span>
                          </div>
                          <div className="font-bold text-slate-900">
                            ฿{t.totalCost > 0 ? t.totalCost.toLocaleString() : "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnTickets.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                      <span>ไม่มีงานในสถานะนี้</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table List View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">เลขที่ใบงาน</th>
                  <th className="py-3.5 px-4">ทะเบียนรถ / ยี่ห้อ</th>
                  <th className="py-3.5 px-4">หมวดหมู่ / ประเภทย่อย</th>
                  <th className="py-3.5 px-4">อาการเสีย & ปัญหา</th>
                  <th className="py-3.5 px-4">แผนก / ผู้แจ้ง</th>
                  <th className="py-3.5 px-4">ช่างผู้รับผิดชอบ</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">ประเมิน</th>
                  <th className="py-3.5 px-4 text-right">ค่าใช้จ่าย</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.map((t) => {
                  const cat = CATEGORIES_CONFIG[t.category];
                  const statusMeta = STATUS_CONFIG[t.status];
                  const subName = t.subCategoryName || getSubCategoryName(t.category, t.subCategoryId);
                  return (
                    <tr 
                      key={t.id}
                      onClick={() => onSelectTicket(t)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {t.ticketNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(t.createdAt).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{t.licensePlate}</span>
                          {t.breakdownLocation?.isEmergencyBreakdown && (
                            <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5" title={t.breakdownLocation.locationName}>
                              <MapPin className="w-2.5 h-2.5 text-rose-600" />
                              GPS เสียฉุกเฉิน
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px]">{t.vehicleBrand} {t.vehicleModel} ({VEHICLE_TYPE_LABELS[t.vehicleType] || t.vehicleType})</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${cat.borderColor} ${cat.bgLight}`}>
                            {cat.nameTh}
                          </span>
                          {subName && (
                            <span className="text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {subName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                        <div>{t.symptoms}</div>
                        {t.issues && t.issues.length > 1 && (
                          <span className="text-[10px] text-slate-400">({t.issues.length} ปัญหาย่อย)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{t.department}</div>
                        <div className="text-slate-500 text-[11px]">{t.requesterName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.assignedMechanic || <span className="text-slate-400 italic">รอจ่ายงาน</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.badgeBg}`}>
                          {statusMeta.labelTh}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.feedback ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{t.feedback.overallRating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ฿{t.totalCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-0.5">
                          ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm italic">
                ไม่พบรายการแจ้งซ่อมที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
