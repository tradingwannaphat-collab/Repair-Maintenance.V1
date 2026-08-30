import React, { useState, useMemo } from "react";
import { 
  Search, 
  PlusCircle, 
  Car, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Star, 
  Phone, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  Calendar, 
  Filter, 
  HelpCircle,
  Eye,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  MapPin,
  Navigation,
  Compass,
  AlertTriangle
} from "lucide-react";
import { RepairTicket, RepairStatus, RepairCategory, VehicleType } from "../types";
import { CATEGORIES_CONFIG, STATUS_CONFIG, VEHICLE_TYPE_LABELS, getSubCategoryName } from "../data/categories";
import { BreakdownLocationView } from "./BreakdownLocationView";
import { TnbLogo } from "./TnbLogo";

interface RequesterPortalProps {
  tickets: RepairTicket[];
  onSelectTicket: (ticket: RepairTicket) => void;
  onOpenNewModal: () => void;
  onOpenPrint: (ticket: RepairTicket) => void;
}

const STAGES: { id: RepairStatus; label: string; shortLabel: string }[] = [
  { id: "pending", label: "1. รับเรื่องแจ้ง", shortLabel: "รับเรื่อง" },
  { id: "inspecting", label: "2. กำลังตรวจเช็ค", shortLabel: "ตรวจเช็ค" },
  { id: "waiting_parts", label: "3. รอเบิกอะไหล่", shortLabel: "รออะไหล่" },
  { id: "in_progress", label: "4. กำลังซ่อมแซม", shortLabel: "กำลังซ่อม" },
  { id: "testing", label: "5. ตรวจสอบ QC", shortLabel: "ตรวจ QC" },
  { id: "completed", label: "6. เสร็จสิ้นพร้อมส่งมอบ", shortLabel: "พร้อมส่งมอบ" }
];

const getStageIndex = (status: RepairStatus) => {
  switch (status) {
    case "pending": return 0;
    case "inspecting": return 1;
    case "waiting_parts": return 2;
    case "in_progress": return 3;
    case "testing": return 4;
    case "completed": return 5;
    default: return 0;
  }
};

export const RequesterPortal: React.FC<RequesterPortalProps> = ({
  tickets,
  onSelectTicket,
  onOpenNewModal,
  onOpenPrint
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchSearch =
          t.licensePlate.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.vehicleBrand.toLowerCase().includes(q) ||
          t.vehicleModel.toLowerCase().includes(q) ||
          t.symptoms.toLowerCase().includes(q) ||
          (t.subCategoryName && t.subCategoryName.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // 2. Status Group Filter
      if (activeFilter === "pending" && t.status !== "pending") return false;
      if (activeFilter === "completed" && t.status !== "completed") return false;
      if (activeFilter === "active" && (t.status === "completed" || t.status === "pending")) return false;

      // 3. Category Filter
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

      return true;
    });
  }, [tickets, searchQuery, activeFilter, categoryFilter]);

  // Key Counts for Requester
  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const activeCount = tickets.filter(t => t.status !== "pending" && t.status !== "completed").length;
  const completedCount = tickets.filter(t => t.status === "completed").length;
  const unratedCount = tickets.filter(t => t.status === "completed" && !t.feedback).length;

  return (
    <div className="space-y-6">
      {/* Requester Hero Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#004085] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
            <div className="bg-white px-2 py-0.5 rounded">
              <TnbLogo variant="blue" size="sm" showSubtitle={false} />
            </div>
            <span>ระบบแจ้งซ่อมยานพาหนะ & แผนที่พิกัดรถเสียฉุกเฉิน TNB Logistics</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ศูนย์แจ้งซ่อมบำรุงรถยนต์และติดตามสถานะเรียลไทม์
          </h1>

          <p className="text-sm text-slate-200 leading-relaxed">
            ส่งคำขอซ่อมบำรุงพร้อมระบบ AI วินิจฉัยอาการเสียอัตโนมัติ ปักหมุดแผนที่พิกัด GPS กรณีรถเสียฉุกเฉินบนเส้นทางขนส่ง และติดตามงานซ่อม
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-requester-new-request"
              onClick={onOpenNewModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-sm transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ เปิดใบแจ้งซ่อมรถใหม่ / แจ้งจุดรถเสีย</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>รองรับการปักหมุด GPS รถเสียฉุกเฉินนอกสถานที่</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards for Requester */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active in Workshop */}
        <div 
          onClick={() => setActiveFilter("active")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "active" 
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-500/20" 
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">กำลังซ่อมในอู่</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCount} คัน</div>
          <p className="text-[11px] text-slate-500 mt-0.5">ตรวจเช็ค / รออะไหล่ / ทำการซ่อม</p>
        </div>

        {/* Card 2: Pending Approval */}
        <div 
          onClick={() => setActiveFilter("pending")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "pending" 
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500/20" 
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">รอดำเนินการ / รับเรื่อง</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingCount} รายการ</div>
          <p className="text-[11px] text-slate-500 mt-0.5">รอช่างเข้าตรวจสอบและจ่ายงาน</p>
        </div>

        {/* Card 3: Ready / Completed */}
        <div 
          onClick={() => setActiveFilter("completed")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "completed" 
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20" 
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ซ่อมเสร็จ / พร้อมรับรถ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedCount} คัน</div>
          <p className="text-[11px] text-slate-500 mt-0.5">ผ่านการทดสอบ QC เรียบร้อย</p>
        </div>

        {/* Card 4: Need Rating / Feedback */}
        <div 
          onClick={() => setActiveFilter("completed")}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">รอประเมินความพึงพอใจ</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{unratedCount} รายการ</div>
          <p className="text-[11px] text-slate-500 mt-0.5">ให้คะแนนเพื่อพัฒนาคุณภาพบริการ</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>รายการแจ้งซ่อมและสถานะรถยนต์</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {filteredTickets.length} รายการ
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาด้วยทะเบียนรถ เลขที่ใบงาน หรือชื่อผู้แจ้ง เพื่อดูความคืบหน้ารายขั้นตอน
            </p>
          </div>

          {/* Status Tab Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              ทั้งหมด ({tickets.length})
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === "active" ? "bg-white text-blue-700 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              กำลังซ่อม ({activeCount})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === "pending" ? "bg-white text-amber-700 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              รอดำเนินการ ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === "completed" ? "bg-white text-emerald-700 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              เสร็จสมบูรณ์ ({completedCount})
            </button>
          </div>
        </div>

        {/* Search Bar + Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              id="requester-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาทะเบียนรถ (เช่น 1กข-9921), เลขที่ใบงาน, ชื่อผู้แจ้ง หรืออาการ..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="all">📁 ทุกหมวดหมู่อาการ</option>
              {(Object.keys(CATEGORIES_CONFIG) as RepairCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORIES_CONFIG[catKey].nameTh}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List with Stage Tracker for Requesters */}
      <div className="space-y-4">
        {filteredTickets.map((t) => {
          const stageIdx = getStageIndex(t.status);
          const cat = CATEGORIES_CONFIG[t.category];
          const subName = t.subCategoryName || getSubCategoryName(t.category, t.subCategoryId);
          const statusMeta = STATUS_CONFIG[t.status];

          return (
            <div
              key={t.id}
              id={`requester-ticket-${t.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-slate-900">{t.licensePlate}</span>
                      <span className="text-xs text-slate-500 font-medium">({t.vehicleBrand} {t.vehicleModel})</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {VEHICLE_TYPE_LABELS[t.vehicleType] || t.vehicleType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>เลขที่ใบงาน: <strong className="font-mono text-slate-600">{t.ticketNumber}</strong></span>
                      <span>•</span>
                      <span>วันที่แจ้ง: {new Date(t.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeBg}`}>
                    {statusMeta.labelTh}
                  </span>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    t.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                    t.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    t.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    ความเร่งด่วน: {t.priority}
                  </span>
                </div>
              </div>

              {/* 6-Stage Visual Timeline */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>ขั้นตอนการซ่อมบำรุง (Maintenance Progress Timeline):</span>
                  <span className="text-blue-600 font-medium">
                    {t.status === "completed" ? "✓ ซ่อมเสร็จสมบูรณ์" : `ขั้นตอนที่ ${stageIdx + 1} จาก 6`}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-4 right-4 top-3.5 h-1 bg-slate-200 -z-0">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(stageIdx / (STAGES.length - 1)) * 100}%` }}
                    />
                  </div>

                  {STAGES.map((stg, i) => {
                    const isDone = i < stageIdx;
                    const isCurrent = i === stageIdx;
                    const isPending = i > stageIdx;

                    return (
                      <div key={stg.id} className="relative z-10 flex flex-col items-center">
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? "bg-blue-600 text-white shadow-xs"
                              : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm animate-pulse"
                              : "bg-white text-slate-400 border border-slate-300"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 text-center font-medium hidden sm:block ${
                          isCurrent ? "text-blue-700 font-bold" : isDone ? "text-slate-700" : "text-slate-400"
                        }`}>
                          {stg.shortLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Breakdown Location Map Preview (if flagged) */}
              {t.breakdownLocation?.isEmergencyBreakdown && (
                <BreakdownLocationView 
                  location={t.breakdownLocation} 
                  ticketNumber={t.ticketNumber} 
                  licensePlate={t.licensePlate}
                  compact={true} 
                />
              )}

              {/* Details & Symptoms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Category & Symptoms */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cat.borderColor} ${cat.bgLight}`}>
                      {cat.nameTh}
                    </span>
                    {subName && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {subName}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">อาการที่แจ้ง: </strong>
                    {t.symptoms}
                  </p>

                  {/* Multiple Issues list */}
                  {t.issues && t.issues.length > 1 && (
                    <div className="pt-1.5 flex flex-wrap gap-1.5">
                      {t.issues.map((iss, iIdx) => (
                        <span 
                          key={iss.id || iIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            iss.isResolved 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {iss.isResolved ? "✓" : "•"} {iss.title || iss.subCategoryName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mechanic & Requester Info */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">ช่างผู้ดูแล:</div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.assignedMechanic || "รอการจัดสรรช่าง"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    ผู้แจ้ง: {t.requesterName} ({t.department})
                  </div>
                  {t.estimatedCompletionDate && (
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      กำหนดเสร็จโดยประมาณ: {new Date(t.estimatedCompletionDate).toLocaleDateString("th-TH")}
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Summary or Action Section */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Customer rating status */}
                <div>
                  {t.feedback ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < (t.feedback?.overallRating || 5) ? 'fill-amber-500' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-bold text-slate-800">
                        {t.feedback.overallRating} / 5 ดาว
                      </span>
                      <span className="text-slate-500 italic truncate max-w-xs">
                        "{t.feedback.comment}"
                      </span>
                    </div>
                  ) : t.status === "completed" ? (
                    <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>งานซ่อมเสร็จแล้ว กรุณาประเมินความพึงพอใจการบริการ</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>อัปเดตล่าสุดเมื่อ {new Date(t.updatedAt).toLocaleTimeString("th-TH")}</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenPrint(t)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>พิมพ์ใบสั่งงาน</span>
                  </button>

                  <button
                    onClick={() => onSelectTicket(t)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียดงานซ่อม</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">ไม่พบรายการแจ้งซ่อมที่ค้นหา</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่มด้านล่างเพื่อสร้างใบแจ้งซ่อมยานพาหนะใหม่
            </p>
            <button
              onClick={onOpenNewModal}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แจ้งซ่อมรถใหม่</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency Roadside & Map Assistance Card */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>ศูนย์ช่วยเหลือและนำทางรถเสียฉุกเฉิน TNB Roadside Dispatch</span>
              <span className="text-[10px] px-2 py-0.2 bg-rose-600 text-white font-bold rounded">Live Map</span>
            </h4>
            <p className="text-xs text-slate-400">ระบุพิกัด GPS จุดรถเสียฉุกเฉินบนทางหลวง เพื่อส่งช่างเคลื่อนที่เร็วและรถสไลด์ไปยังจุดหมายทันที</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenNewModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>ปักหมุดแจ้งพิกัดรถเสียฉุกเฉิน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
