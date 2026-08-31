import React, { useState, useMemo } from "react";
import { 
  History, 
  Truck, 
  DollarSign, 
  Wrench, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  User, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  FileText, 
  Plus, 
  Star, 
  ArrowUpRight, 
  Sparkles, 
  Tag, 
  Package, 
  Camera, 
  ShieldCheck,
  Eye,
  Trash2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  VehicleRecord, 
  RepairTicket, 
  RepairCategory, 
  RepairItemPart 
} from "../types";
import { VEHICLE_TYPE_LABELS, CATEGORIES_CONFIG } from "../data/categories";

interface VehicleRepairHistoryViewProps {
  vehicles: VehicleRecord[];
  tickets: RepairTicket[];
  initialLicensePlate?: string;
  initialVehicleId?: string;
  onSelectTicket?: (ticket: RepairTicket) => void;
  onOpenNewTicketForVehicle?: (vehicle: VehicleRecord) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  engine: "#EF4444",
  tires: "#F59E0B",
  brake: "#3B82F6",
  suspension: "#8B5CF6",
  lubricant: "#10B981",
  aircon: "#06B6D4",
  electrical: "#EC4899",
  bodywork: "#64748B",
  other: "#94A3B8"
};

// Robust plate matching helper
function isPlateMatch(p1?: string, p2?: string): boolean {
  if (!p1 || !p2) return false;
  const clean1 = p1.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "").toLowerCase();
  const clean2 = p2.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "").toLowerCase();
  if (clean1 === clean2) return true;
  if (clean1.length >= 4 && clean2.length >= 4 && (clean1.includes(clean2) || clean2.includes(clean1))) return true;
  return false;
}

export const VehicleRepairHistoryView: React.FC<VehicleRepairHistoryViewProps> = ({
  vehicles,
  tickets,
  initialLicensePlate,
  initialVehicleId,
  onSelectTicket,
  onOpenNewTicketForVehicle,
  onDeleteTicket
}) => {
  // Pre-calculate repair stats for each vehicle across the fleet
  const vehicleStatsMap = useMemo(() => {
    const map = new Map<string, { count: number; totalCost: number }>();
    vehicles.forEach((v) => {
      const vTickets = tickets.filter(
        (t) =>
          t.vehicleId === v.id ||
          isPlateMatch(t.licensePlate, v.licensePlate)
      );
      const totalCost = vTickets.reduce(
        (sum, t) => sum + (t.totalCost || (t.partsCost || 0) + (t.laborCost || 0)),
        0
      );
      map.set(v.id, { count: vTickets.length, totalCost });
    });
    return map;
  }, [vehicles, tickets]);

  // Determine smart default vehicle (prioritize vehicle with repair history or highest cost)
  const initialDefaultVehicleId = useMemo(() => {
    if (initialVehicleId) {
      const found = vehicles.find((v) => v.id === initialVehicleId);
      if (found) return found.id;
    }
    if (initialLicensePlate) {
      const found = vehicles.find((v) => isPlateMatch(v.licensePlate, initialLicensePlate));
      if (found) return found.id;
    }
    // Find vehicle with the highest repair cost or tickets
    let bestId = vehicles[0]?.id || "";
    let maxCost = -1;
    vehicles.forEach((v) => {
      const st = vehicleStatsMap.get(v.id);
      if (st && st.totalCost > maxCost && st.totalCost > 0) {
        maxCost = st.totalCost;
        bestId = v.id;
      }
    });
    return bestId;
  }, [vehicles, vehicleStatsMap, initialVehicleId, initialLicensePlate]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialDefaultVehicleId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "this_year" | "last_6_months">("all");
  const [viewMode, setViewMode] = useState<"single_vehicle" | "fleet_overview">("single_vehicle");

  // Sync when initialLicensePlate or initialVehicleId prop changes
  React.useEffect(() => {
    if (initialVehicleId) {
      const found = vehicles.find((v) => v.id === initialVehicleId);
      if (found) setSelectedVehicleId(found.id);
    } else if (initialLicensePlate) {
      const found = vehicles.find((v) => isPlateMatch(v.licensePlate, initialLicensePlate));
      if (found) setSelectedVehicleId(found.id);
    }
  }, [initialVehicleId, initialLicensePlate, vehicles]);

  // Selected vehicle object
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Tickets for selected vehicle
  const vehicleTickets = useMemo(() => {
    if (!selectedVehicle) return [];
    return tickets.filter((t) => {
      const matchVehicle =
        t.vehicleId === selectedVehicle.id ||
        isPlateMatch(t.licensePlate, selectedVehicle.licensePlate);
      if (!matchVehicle) return false;

      // Category filter
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.problemDescription?.toLowerCase().includes(q);
        const matchMechanic = t.assignedMechanic?.toLowerCase().includes(q);
        const matchNum = t.ticketNumber?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchMechanic && !matchNum) return false;
      }

      return true;
    });
  }, [tickets, selectedVehicle, categoryFilter, searchQuery]);

  // Split vehicles into: with repair records vs without repair records
  const { vehiclesWithHistory, vehiclesWithoutHistory } = useMemo(() => {
    const withHist: Array<{ vehicle: VehicleRecord; count: number; totalCost: number }> = [];
    const withoutHist: VehicleRecord[] = [];

    vehicles.forEach((v) => {
      const st = vehicleStatsMap.get(v.id) || { count: 0, totalCost: 0 };
      if (st.count > 0 || st.totalCost > 0) {
        withHist.push({ vehicle: v, count: st.count, totalCost: st.totalCost });
      } else {
        withoutHist.push(v);
      }
    });

    withHist.sort((a, b) => b.totalCost - a.totalCost || b.count - a.count);
    return { vehiclesWithHistory: withHist, vehiclesWithoutHistory: withoutHist };
  }, [vehicles, vehicleStatsMap]);

  // Statistics for selected vehicle
  const stats = useMemo(() => {
    const totalVisits = vehicleTickets.length;
    const completedVisits = vehicleTickets.filter((t) => t.status === "completed").length;
    
    let totalCost = 0;
    let totalPartsCost = 0;
    let totalLaborCost = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    vehicleTickets.forEach((t) => {
      const cost = t.totalCost || (t.partsCost || 0) + (t.laborCost || 0);
      totalCost += cost;
      totalPartsCost += t.partsCost || 0;
      totalLaborCost += t.laborCost || 0;
      if (t.rating && t.rating > 0) {
        ratingSum += t.rating;
        ratingCount++;
      }
    });

    const avgCost = totalVisits > 0 ? Math.round(totalCost / totalVisits) : 0;
    const currentMileage = selectedVehicle?.currentMileage || 1;
    const costPerKm = (totalCost / currentMileage).toFixed(2);
    const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "5.0";

    return {
      totalVisits,
      completedVisits,
      totalCost,
      totalPartsCost,
      totalLaborCost,
      avgCost,
      costPerKm,
      avgRating
    };
  }, [vehicleTickets, selectedVehicle]);

  // Category breakdown for charts
  const categoryChartData = useMemo(() => {
    const map: { [cat: string]: number } = {};
    vehicleTickets.forEach((t) => {
      const cat = t.category || "other";
      const cost = t.totalCost || (t.partsCost || 0) + (t.laborCost || 0) || 1000;
      map[cat] = (map[cat] || 0) + cost;
    });

    return Object.entries(map).map(([cat, value]) => {
      const catObj = CATEGORIES_CONFIG[cat as RepairCategory];
      return {
        name: catObj?.nameTh || cat,
        value,
        color: CATEGORY_COLORS[cat] || "#64748B"
      };
    });
  }, [vehicleTickets]);

  // Monthly cost trend data
  const monthlyChartData = useMemo(() => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const data = months.map((m) => ({ month: m, parts: 0, labor: 0, total: 0 }));

    vehicleTickets.forEach((t) => {
      if (t.reportedAt) {
        const d = new Date(t.reportedAt);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          const parts = t.partsCost || 0;
          const labor = t.laborCost || 0;
          data[mIdx].parts += parts;
          data[mIdx].labor += labor;
          data[mIdx].total += parts + labor;
        }
      }
    });

    return data;
  }, [vehicleTickets]);

  // Fleet-wide vehicle ranking by repair cost
  const fleetVehicleRanking = useMemo(() => {
    return vehicles.map((v) => {
      const vTickets = tickets.filter(
        (t) =>
          t.vehicleId === v.id ||
          isPlateMatch(t.licensePlate, v.licensePlate)
      );
      const totalCost = vTickets.reduce(
        (sum, t) => sum + (t.totalCost || (t.partsCost || 0) + (t.laborCost || 0)),
        0
      );
      const partsCost = vTickets.reduce((sum, t) => sum + (t.partsCost || 0), 0);
      const laborCost = vTickets.reduce((sum, t) => sum + (t.laborCost || 0), 0);

      return {
        vehicle: v,
        ticketCount: vTickets.length,
        totalCost,
        partsCost,
        laborCost,
        costPerKm: v.currentMileage ? (totalCost / v.currentMileage).toFixed(2) : "0.00"
      };
    }).sort((a, b) => b.totalCost - a.totalCost || b.ticketCount - a.ticketCount);
  }, [vehicles, tickets]);

  const handlePrintLogbook = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Vehicle Maintenance History & Cost Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>ประวัติการซ่อมและค่าใช้จ่ายรายคัน</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-full font-medium">
                สมุดประวัติซ่อมบำรุง
              </span>
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
              ติดตามประวัติการซ่อมบำรุงย้อนหลังทุกใบงาน บันทึกรายการอะไหล่ที่เบิกใช้ ค่าแรง ค่าอะไหล่ 
              ต้นทุนต่อกิโลเมตร (Cost/Km) และผลการประเมินคุณภาพงานซ่อมของรถทุกคันในฟลีท
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 self-stretch lg:self-auto">
            <button
              onClick={() => setViewMode("single_vehicle")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "single_vehicle"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>ดูเจาะลึกรายคัน (Single Vehicle)</span>
            </button>
            <button
              onClick={() => setViewMode("fleet_overview")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "fleet_overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>อันดับค่าใช้จ่ายทั้งฟลีท ({vehicles.length} คัน)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: SINGLE VEHICLE VIEW (ดูเจาะลึกรายคัน) */}
      {/* ======================================================== */}
      {viewMode === "single_vehicle" && (
        <div className="space-y-6">
          {/* Vehicle Selector & Search Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Vehicle Dropdown */}
                <div className="min-w-[280px] flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
                    <span>🚗 เลือกรถที่ต้องการดูประวัติ:</span>
                    {vehiclesWithHistory.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        (มีประวัติซ่อม {vehiclesWithHistory.length} คัน)
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {/* Group 1: Vehicles with repair history */}
                    {vehiclesWithHistory.length > 0 && (
                      <optgroup label={`✨ รถที่มีประวัติการซ่อมบำรุงและค่าใช้จ่าย (${vehiclesWithHistory.length} คัน)`}>
                        {vehiclesWithHistory.map((item, idx) => (
                          <option key={item.vehicle.id} value={item.vehicle.id}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🔧"} {item.vehicle.licensePlate} - {item.vehicle.vehicleBrand} {item.vehicle.vehicleModel} • {item.count} ใบงาน (฿{item.totalCost.toLocaleString()})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* Group 2: Other fleet vehicles */}
                    {vehiclesWithoutHistory.length > 0 && (
                      <optgroup label={`📋 รถอื่นๆ ในฟลีท (${vehiclesWithoutHistory.length} คัน - ยังไม่มีประวัติการซ่อม)`}>
                        {vehiclesWithoutHistory.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.licensePlate} - {v.vehicleBrand} {v.vehicleModel} ({VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}) {v.driverName ? `• ${v.driverName}` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="min-w-[160px]">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    หมวดหมู่งานซ่อม:
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="all">ทุกหมวดหมู่ ({tickets.length})</option>
                    {Object.values(CATEGORIES_CONFIG).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search in problem description */}
                <div className="min-w-[200px] flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    ค้นหารายการซ่อม/ช่าง/เลขใบงาน:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="พิมพ์คำค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-end gap-2 pt-2 md:pt-0">
                {onOpenNewTicketForVehicle && selectedVehicle && (
                  <button
                    onClick={() => onOpenNewTicketForVehicle(selectedVehicle)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>แจ้งซ่อมคันนี้</span>
                  </button>
                )}
                <button
                  onClick={handlePrintLogbook}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>พิมพ์สมุดประวัติ</span>
                </button>
              </div>
            </div>

            {/* Quick Vehicle Shortcut Chips */}
            {vehiclesWithHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  คลิกเลือกรถที่มีประวัติซ่อมบำรุง:
                </span>
                {vehiclesWithHistory.map((item, idx) => {
                  const isSel = item.vehicle.id === selectedVehicleId;
                  return (
                    <button
                      key={item.vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(item.vehicle.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSel
                          ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200"
                      }`}
                      title={`${item.vehicle.vehicleBrand} ${item.vehicle.vehicleModel} - มีประวัติ ${item.count} ใบงาน รวม ฿${item.totalCost.toLocaleString()}`}
                    >
                      <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🚗"}</span>
                      <span>{item.vehicle.licensePlate}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isSel ? "bg-white/20 text-white" : "bg-indigo-200/80 text-indigo-900"}`}>
                        ฿{item.totalCost.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vehicle Profile & KPI Summary Cards */}
          {selectedVehicle && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Profile Card */}
              <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white border border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                      {VEHICLE_TYPE_LABELS[selectedVehicle.vehicleType] || selectedVehicle.vehicleType}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      ใช้งานปกติ
                    </span>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white mb-1">
                    {selectedVehicle.licensePlate}
                  </div>
                  <div className="text-xs text-slate-300 mb-4">
                    {selectedVehicle.vehicleBrand} {selectedVehicle.vehicleModel} • {selectedVehicle.province}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-700/80 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>พนักงานขับรถ:</span>
                      <span className="font-medium text-white">{selectedVehicle.driverName || "-"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>เลขไมล์ปัจจุบัน:</span>
                      <span className="font-bold text-emerald-400">
                        {selectedVehicle.currentMileage?.toLocaleString() || 0} กม.
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>สังกัด/แผนก:</span>
                      <span className="text-white">{selectedVehicle.department || "ฝ่ายขนส่ง"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>ประเมินความพึงพอใจ:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {stats.avgRating} / 5.0
                  </span>
                </div>
              </div>

              {/* KPI 1: Total Cost */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                    <span>ค่าซ่อมบำรุงรวมสะสม</span>
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ฿{stats.totalCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>ค่าอะไหล่ ฿{stats.totalPartsCost.toLocaleString()}</span>
                    <span>•</span>
                    <span>ค่าแรง ฿{stats.totalLaborCost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>ต้นทุนค่าซ่อมต่อ กม.:</span>
                  <span className="font-bold text-indigo-700">฿{stats.costPerKm} / กม.</span>
                </div>
              </div>

              {/* KPI 2: Total Visits */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                    <span>จำนวนครั้งที่เข้าซ่อม</span>
                    <Wrench className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {stats.totalVisits} <span className="text-sm font-normal text-slate-500">ครั้ง</span>
                  </div>
                  <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ปิดงานสมบูรณ์ {stats.completedVisits} ครั้ง</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>ค่าใช้จ่ายเฉลี่ยต่อครั้ง:</span>
                  <span className="font-bold text-slate-800">฿{stats.avgCost.toLocaleString()}</span>
                </div>
              </div>

              {/* KPI 3: Category Chart Summary */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>สัดส่วนค่าใช้จ่ายตามหมวด</span>
                  <PieChartIcon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="h-28 w-full">
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={3}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, "ค่าใช้จ่าย"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      ยังไม่มีประวัติการซ่อม
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 text-center truncate">
                  {categoryChartData.map((c) => c.name).join(", ") || "ไม่มีข้อมูล"}
                </div>
              </div>
            </div>
          )}

          {/* Repair History Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>สมุดบันทึกประวัติการซ่อมบำรุง (Maintenance Ledger)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  แสดงประวัติใบแจ้งซ่อมทั้งหมด {vehicleTickets.length} รายการ ของรถ {selectedVehicle?.licensePlate}
                </p>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                รวมค่าใช้จ่าย: <strong className="text-indigo-700 font-bold">฿{stats.totalCost.toLocaleString()}</strong>
              </div>
            </div>

            {vehicleTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">ยังไม่พบประวัติการแจ้งซ่อมของรถคันนี้</p>
                <p className="text-xs mt-1">สามารถกดปุ่ม "แจ้งซ่อมคันนี้" ด้านบนเพื่อเปิดใบงานแรก</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-28">เลขที่ใบงาน</th>
                      <th className="py-3 px-4 w-28">วันที่แจ้ง/ซ่อม</th>
                      <th className="py-3 px-4 w-32">หมวดหมู่งาน</th>
                      <th className="py-3 px-4">อาการ / ปัญหาที่พบ</th>
                      <th className="py-3 px-4 w-36">ช่างผู้รับผิดชอบ</th>
                      <th className="py-3 px-4 w-44">รายการอะไหล่ที่เบิกใช้</th>
                      <th className="py-3 px-4 w-28 text-right">ค่าอะไหล่</th>
                      <th className="py-3 px-4 w-28 text-right">ค่าแรง</th>
                      <th className="py-3 px-4 w-32 text-right">รวมค่าใช้จ่าย</th>
                      <th className="py-3 px-4 w-20 text-center">ดูงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleTickets.map((ticket) => {
                      const total = ticket.totalCost || (ticket.partsCost || 0) + (ticket.laborCost || 0);
                      const catName = (ticket.category && CATEGORIES_CONFIG[ticket.category]?.nameTh) || ticket.category || "ทั่วไป";

                      return (
                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-indigo-600">
                            {ticket.ticketNumber || ticket.id.slice(0, 8)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("th-TH") : "-"}</div>
                            {ticket.currentMileage && (
                              <div className="text-[10px] text-slate-400 font-medium">{ticket.currentMileage.toLocaleString()} กม.</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                              {catName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 line-clamp-1">{ticket.symptoms || "แจ้งซ่อมบำรุง"}</div>
                            {ticket.mechanicNotes && (
                              <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{ticket.mechanicNotes}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 font-medium">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{ticket.assignedMechanic || "ทีมช่าง TNB"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-600">
                            {ticket.partsList && ticket.partsList.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {ticket.partsList.map((p, pIdx) => (
                                  <li key={pIdx} className="truncate">
                                    {p.name} ({p.quantity} {p.unit || "ชิ้น"})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-slate-400 italic">- ไม่ได้เบิกอะไหล่ -</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            ฿{(ticket.partsCost || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            ฿{(ticket.laborCost || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                            ฿{total.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {onSelectTicket && (
                                <button
                                  onClick={() => onSelectTicket(ticket)}
                                  className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                  title="ดูรายละเอียดใบแจ้งซ่อม"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteTicket && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`⚠️ ยืนยันการลบใบแจ้งซ่อม ${ticket.ticketNumber} (${ticket.licensePlate})?\n\nสำหรับกรณีที่ลงข้อมูลผิดพลาด`)) {
                                      onDeleteTicket(ticket.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                  title="ลบใบแจ้งซ่อมนี้ (สำหรับลงข้อมูลผิด)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: FLEET OVERVIEW & COST RANKING (ภาพรวมทั้งฟลีท) */}
      {/* ======================================================== */}
      {viewMode === "fleet_overview" && (
        <div className="space-y-6">
          {/* Top Spenders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>ตารางจัดอันดับค่าใช้จ่ายซ่อมบำรุงรถทุกคันในฟลีท ({vehicles.length} คัน)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  เรียงลำดับจากรถที่มีค่าใช้จ่ายในการซ่อมบำรุงรวมสูงสุด เพื่อการบริหารต้นทุนและการวางแผนเปลี่ยนถ่ายยานพาหนะ
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintLogbook}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์รายงาน</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">อันดับ</th>
                    <th className="py-3 px-4 w-36">ทะเบียนรถ</th>
                    <th className="py-3 px-4 w-36">ประเภท / ยี่ห้อ</th>
                    <th className="py-3 px-4 w-36">ผู้ขับขี่</th>
                    <th className="py-3 px-4 w-28 text-right">เลขไมล์ปัจจุบัน</th>
                    <th className="py-3 px-4 w-28 text-center">จำนวนครั้งเข้าซ่อม</th>
                    <th className="py-3 px-4 w-32 text-right">ค่าอะไหล่รวม</th>
                    <th className="py-3 px-4 w-32 text-right">ค่าแรงรวม</th>
                    <th className="py-3 px-4 w-36 text-right font-black text-slate-900">ค่าซ่อมรวมทั้งสิ้น</th>
                    <th className="py-3 px-4 w-28 text-right">บาท / กม.</th>
                    <th className="py-3 px-4 w-24 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fleetVehicleRanking.map((item, idx) => (
                    <tr key={item.vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx === 0 && "🥇 1"}
                        {idx === 1 && "🥈 2"}
                        {idx === 2 && "🥉 3"}
                        {idx > 2 && idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.vehicle.licensePlate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{item.vehicle.vehicleBrand} {item.vehicle.vehicleModel}</div>
                        <div className="text-[10px] text-slate-400">{VEHICLE_TYPE_LABELS[item.vehicle.vehicleType]}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.vehicle.driverName || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {item.vehicle.currentMileage?.toLocaleString() || 0} กม.
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {item.ticketCount} ครั้ง
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ฿{item.partsCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ฿{item.laborCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-indigo-700 text-sm">
                        ฿{item.totalCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ฿{item.costPerKm}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedVehicleId(item.vehicle.id);
                            setViewMode("single_vehicle");
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          ดูประวัติ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
