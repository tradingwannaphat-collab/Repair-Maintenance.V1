import React, { useState, useMemo } from "react";
import { 
  X, 
  Gauge, 
  History, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Building2, 
  Download, 
  FileSpreadsheet, 
  Plus, 
  Send,
  MessageSquare,
  Sparkles,
  Camera,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { VehicleRecord, MileageLogEntry, MileageLogSource } from "../types";

interface VehicleMileageHistoryModalProps {
  vehicle: VehicleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  mileageLogs: MileageLogEntry[];
  onAddManualMileageLog?: (vehicleId: string, newMileage: number, reporterName: string, notes?: string) => void;
  onOpenLineSyncModal?: () => void;
}

export const VehicleMileageHistoryModal: React.FC<VehicleMileageHistoryModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  mileageLogs,
  onAddManualMileageLog,
  onOpenLineSyncModal
}) => {
  if (!isOpen || !vehicle) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [manualMileageInput, setManualMileageInput] = useState<string>(String(vehicle.currentMileage || 0));
  const [manualReporterName, setManualReporterName] = useState<string>(vehicle.driverName || "เจ้าหน้าที่ขนส่ง");
  const [manualNotes, setManualNotes] = useState<string>("");

  // Filter logs for this specific vehicle and sort ascending/descending
  const vehicleLogs = useMemo(() => {
    return mileageLogs
      .filter(l => l.vehicleId === vehicle.id || l.licensePlate === vehicle.licensePlate)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }, [mileageLogs, vehicle]);

  // Total count of updates
  const totalUpdatesCount = vehicleLogs.length;

  // Initial and latest mileage
  const oldestLog = vehicleLogs[vehicleLogs.length - 1];
  const initialBaseMileage = oldestLog ? oldestLog.previousMileage : (vehicle.initialMileage || vehicle.currentMileage);
  const currentMileage = vehicle.currentMileage;
  const totalTraveled = Math.max(0, currentMileage - initialBaseMileage);
  const avgPerUpdate = totalUpdatesCount > 0 ? Math.round(totalTraveled / totalUpdatesCount) : 0;

  // Chart data sorted chronologically
  const chartData = useMemo(() => {
    const sortedAsc = [...vehicleLogs].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    
    // Add baseline
    const points: { date: string; fullDate: string; mileage: number; delta: number; source: string }[] = [];
    if (sortedAsc.length > 0) {
      points.push({
        date: "เริ่มต้น",
        fullDate: "เลขไมล์เริ่มบันทึก",
        mileage: initialBaseMileage,
        delta: 0,
        source: "สารระบบเดิม"
      });
    }

    sortedAsc.forEach((l) => {
      const d = new Date(l.recordedAt);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      points.push({
        date: label,
        fullDate: d.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }),
        mileage: l.newMileage,
        delta: l.distanceDelta,
        source: l.source === "line_webhook" ? "LINE Webhook" : l.source === "line_chat_import" ? "LINE Chat" : "ระบบทั่วไป"
      });
    });

    return points;
  }, [vehicleLogs, initialBaseMileage]);

  // Export logs to CSV
  const handleExportCSV = () => {
    const headers = ["ครั้งที่,วันที่,เวลา,ทะเบียนรถ,No. ERP,เลขไมล์เดิม,เลขไมล์ใหม่,ระยะทางที่เพิ่ม(+กม.),ช่องทาง,ผู้รายงาน,ข้อความ/หมายเหตุ"];
    const rows = vehicleLogs.map((l, i) => {
      const d = new Date(l.recordedAt);
      const dateStr = d.toLocaleDateString("th-TH");
      const timeStr = d.toLocaleTimeString("th-TH");
      const srcName = 
        l.source === "line_webhook" ? "LINE Webhook อัตโนมัติ" :
        l.source === "line_chat_import" ? "นำเข้าจากแชทกลุ่ม LINE" :
        l.source === "line_ocr" ? "LINE รูปถ่ายเรือนไมล์" :
        l.source === "daily_inspection" ? "ตรวจเช็คประจำวัน" :
        l.source === "repair_ticket" ? "ใบแจ้งซ่อม" : "ปรับปรุงด้วยตนเอง";
      
      const cleanMsg = (l.rawMessage || l.notes || "").replace(/"/g, '""');
      return `"${vehicleLogs.length - i}","${dateStr}","${timeStr}","${vehicle.licensePlate}","${vehicle.erpNo || ""}","${l.previousMileage}","${l.newMileage}","${l.distanceDelta}","${srcName}","${l.reporterName}","${cleanMsg}"`;
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Mileage_History_${vehicle.licensePlate}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualMileageInput.replace(/,/g, ""), 10);
    if (isNaN(val) || val <= 0) {
      alert("กรุณาระบุเลขไมล์ที่ถูกต้อง");
      return;
    }
    if (onAddManualMileageLog) {
      onAddManualMileageLog(vehicle.id, val, manualReporterName, manualNotes);
    }
    setShowAddForm(false);
    setManualNotes("");
  };

  const getSourceBadge = (src: MileageLogSource) => {
    switch (src) {
      case "line_webhook":
        return {
          label: "LINE Webhook อัตโนมัติ",
          bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          dot: "bg-emerald-500"
        };
      case "line_chat_import":
        return {
          label: "แชทกลุ่ม LINE",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-600"
        };
      case "line_ocr":
        return {
          label: "สแกนภาพถ่าย LINE",
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          dot: "bg-indigo-500"
        };
      case "daily_inspection":
        return {
          label: "ตรวจเช็คประจำวัน",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          dot: "bg-blue-500"
        };
      case "repair_ticket":
        return {
          label: "ใบแจ้งซ่อม",
          bg: "bg-amber-50 text-amber-900 border-amber-200",
          dot: "bg-amber-500"
        };
      default:
        return {
          label: "ปรับปรุงด้วยตนเอง",
          bg: "bg-slate-100 text-slate-800 border-slate-300",
          dot: "bg-slate-500"
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ประวัติการอัปเดตเลขไมล์ ({vehicle.licensePlate})
                </h2>
                {vehicle.erpNo && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 font-mono font-bold">
                    No. {vehicle.erpNo}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  อัปเดตไปแล้ว {totalUpdatesCount} ครั้ง
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.vehicleBrand} {vehicle.vehicleModel} • {vehicle.department} • คนขับ: {vehicle.driverName || "ยังไม่ระบุ"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="ส่งออกประวัติเป็นไฟล์ CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>

            {onOpenLineSyncModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLineSyncModal();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs"
                title="เปิดระบบดึงเลขไมล์จาก LINE"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ซิงค์กับ LINE</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* Top Metric Cards: ตอบโจทย์ "สามารถเรียกดูได้ว่าคันนี้มีอัพเดทเลขไมค์ได้กี่ครั้ง" */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Metric 1: Total Update Count */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">อัปเดตเลขไมล์ทั้งหมด</span>
                <History className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-blue-600 font-mono">
                  {totalUpdatesCount}
                </span>
                <span className="text-xs font-bold text-slate-600">ครั้ง</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {vehicleLogs[0] ? `ล่าสุด ${new Date(vehicleLogs[0].recordedAt).toLocaleDateString("th-TH")}` : "ยังไม่มีประวัติ"}
              </p>
            </div>

            {/* Metric 2: Current Mileage */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">เลขไมล์ปัจจุบัน</span>
                <Gauge className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {currentMileage.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600">กม.</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                ไมล์เริ่มต้น: {initialBaseMileage.toLocaleString()} กม.
              </p>
            </div>

            {/* Metric 3: Distance Traveled */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">ระยะทางที่วิ่งเพิ่มขึ้น</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  +{totalTraveled.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600">กม.</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                เฉลี่ย {avgPerUpdate.toLocaleString()} กม./ครั้ง
              </p>
            </div>

            {/* Metric 4: Primary Source */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">ช่องทางบันทึกหลัก</span>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                LINE Messaging
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ซิงค์อัตโนมัติจากคนขับ</span>
              </div>
            </div>
          </div>

          {/* Line Chart: Progression of Mileage Over Time */}
          {chartData.length > 1 && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    กราฟแสดงการไต่ระดับเลขไมล์ตามช่วงเวลา (Mileage Growth Curve)
                  </h4>
                  <p className="text-[11px] text-slate-500">แสดงการเพิ่มขึ้นของเลขไมล์ในการอัปเดตแต่ละครั้ง</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {chartData.length} จุดบันทึก
                </span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => [
                        `${Number(val).toLocaleString()} กม. (+${item.payload.delta.toLocaleString()} กม.)`, 
                        `เลขไมล์ (${item.payload.source})`
                      ]}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `บันทึกเมื่อ: ${item.fullDate}` : label;
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mileage" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Manual Record Row */}
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 p-4 rounded-xl border border-blue-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    บันทึกปรับปรุงเลขไมล์แบบแมนนวล (Manual Mileage Adjustment)
                  </h4>
                  <p className="text-[11px] text-slate-500">กรณีคนขับไม่ได้แจ้งผ่าน LINE หรือต้องการแก้ไขเลขไมล์หลังซ่อม</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? "ซ่อนแบบฟอร์ม" : "+ บันทึกเลขไมล์ใหม่"}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSaveManualLog} className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    เลขไมล์ใหม่ (กม.) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualMileageInput}
                    onChange={(e) => setManualMileageInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ผู้รายงาน / คนขับ
                  </label>
                  <input
                    type="text"
                    value={manualReporterName}
                    onChange={(e) => setManualReporterName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หมายเหตุ / เหตุผล
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ตรวจสอบหน้าปัดจริงที่อู่"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    บันทึกเลขไมล์
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Audit History Timeline Table: "สามารถเรียกดูได้ว่าคันนี้มีอัพเดทเลขไมค์ได้กี่ครั้ง" */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  ตารางประวัติการอัปเดตเลขไมล์เรียงตามวัน-เวลา (Audit Trail)
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {totalUpdatesCount} รายการ
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                แสดงข้อมูลการดึงจาก LINE และทุกช่องทาง
              </span>
            </div>

            {vehicleLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Gauge className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">ยังไม่มีประวัติการอัปเดตเลขไมล์สำหรับรถคันนี้</p>
                <p className="text-xs text-slate-400 mt-1">สามารถส่งข้อความจาก LINE หรือบันทึกแมนนวลผ่านปุ่มด้านบน</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">ครั้งที่</th>
                      <th className="py-2.5 px-3">วัน-เวลาที่บันทึก</th>
                      <th className="py-2.5 px-3 text-right">เลขไมล์เดิม</th>
                      <th className="py-2.5 px-3 text-right">เลขไมล์ใหม่</th>
                      <th className="py-2.5 px-3 text-right">ระยะทาง (+กม.)</th>
                      <th className="py-2.5 px-3">ช่องทางบันทึก</th>
                      <th className="py-2.5 px-3">ผู้รายงาน / คนขับ</th>
                      <th className="py-2.5 px-3">ข้อความ / หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleLogs.map((log, idx) => {
                      const badge = getSourceBadge(log.source);
                      const updateNumber = vehicleLogs.length - idx;
                      const dateObj = new Date(log.recordedAt);

                      return (
                        <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                              {updateNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {dateObj.toLocaleDateString("th-TH")}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {dateObj.toLocaleTimeString("th-TH")} น.
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {log.previousMileage.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                            {log.newMileage.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {log.distanceDelta > 0 ? (
                              <span className="text-emerald-600 font-bold">
                                +{log.distanceDelta.toLocaleString()}
                              </span>
                            ) : log.distanceDelta === 0 ? (
                              <span className="text-slate-400">-</span>
                            ) : (
                              <span className="text-rose-600 font-bold">
                                {log.distanceDelta.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {log.reporterName}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-600" title={log.rawMessage || log.notes}>
                            {log.rawMessage || log.notes || "-"}
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

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบจัดเก็บประวัติเลขไมล์อัตโนมัติจาก LINE และงานซ่อมบำรุง TNB Logistics
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
