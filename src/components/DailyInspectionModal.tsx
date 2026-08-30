import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar, 
  Truck, 
  User, 
  Phone, 
  Gauge, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Upload, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Info,
  Sparkles
} from "lucide-react";
import { 
  DailyVehicleInspectionRecord, 
  DailyInspectionCheckResult, 
  InspectionCheckStatus, 
  VehicleRecord, 
  Priority,
  RepairCategory
} from "../types";
import { 
  DAILY_INSPECTION_ITEMS_TEMPLATE, 
  INSPECTION_CATEGORIES_CONFIG, 
  createDefaultInspectionResults 
} from "../data/dailyInspectionData";

interface DailyInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: DailyVehicleInspectionRecord, autoCreateTicket?: boolean) => void;
  vehicles: VehicleRecord[];
  initialRecord?: DailyVehicleInspectionRecord | null;
  selectedVehicleId?: string;
  initialDate?: string;
}

export const DailyInspectionModal: React.FC<DailyInspectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  initialRecord,
  selectedVehicleId,
  initialDate
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [date, setDate] = useState<string>(() => {
    return initialDate || new Date().toISOString().split("T")[0];
  });
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [currentMileage, setCurrentMileage] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [driverPhone, setDriverPhone] = useState<string>("");
  const [inspectorName, setInspectorName] = useState<string>("วิชัย ตรวจละเอียด");
  const [inspectorPhone, setInspectorPhone] = useState<string>("089-987-6543");
  const [locationName, setLocationName] = useState<string>("ศูนย์กระจายสินค้า TNB ลาดกระบัง");
  const [notes, setNotes] = useState<string>("");
  const [results, setResults] = useState<DailyInspectionCheckResult[]>(() => createDefaultInspectionResults());
  const [autoCreateTicket, setAutoCreateTicket] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedDefectIndexForImage, setSelectedDefectIndexForImage] = useState<number | null>(null);

  // Initialize form state
  useEffect(() => {
    if (initialRecord) {
      const v = vehicles.find((veh) => veh.id === initialRecord.vehicleId || veh.licensePlate === initialRecord.licensePlate);
      setSelectedVehicle(v || null);
      setDate(initialRecord.date);
      setTime(initialRecord.time || "07:30");
      setCurrentMileage(String(initialRecord.currentMileage || ""));
      setDriverName(initialRecord.driverName || "");
      setDriverPhone(initialRecord.driverPhone || "");
      setInspectorName(initialRecord.inspectorName || "วิชัย ตรวจละเอียด");
      setInspectorPhone(initialRecord.inspectorPhone || "");
      setLocationName(initialRecord.locationName || "ศูนย์กระจายสินค้า TNB ลาดกระบัง");
      setNotes(initialRecord.notes || "");
      setResults(initialRecord.results || createDefaultInspectionResults());
    } else {
      let targetV = vehicles[0];
      if (selectedVehicleId) {
        const found = vehicles.find((v) => v.id === selectedVehicleId);
        if (found) targetV = found;
      }
      if (targetV) {
        setSelectedVehicle(targetV);
        setCurrentMileage(String(targetV.currentMileage || ""));
        setDriverName(targetV.driverName || "");
        setDriverPhone(targetV.driverPhone || "");
      }
      setDate(initialDate || new Date().toISOString().split("T")[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setResults(createDefaultInspectionResults());
      setNotes("");
    }
  }, [isOpen, initialRecord, selectedVehicleId, vehicles, initialDate]);

  // Handle vehicle selection change
  const handleVehicleChange = (vId: string) => {
    const v = vehicles.find((veh) => veh.id === vId);
    if (v) {
      setSelectedVehicle(v);
      setCurrentMileage(String(v.currentMileage || ""));
      if (v.driverName) setDriverName(v.driverName);
      if (v.driverPhone) setDriverPhone(v.driverPhone);
    }
  };

  // Quick set all to PASS (/)
  const handleSetAllPass = () => {
    setResults((prev) =>
      prev.map((item) => ({
        ...item,
        status: "pass",
        hasIssue: false,
        issueDescription: ""
      }))
    );
  };

  // Quick set all to SKIP (O) - e.g. holiday or parked
  const handleSetAllSkip = () => {
    setResults((prev) =>
      prev.map((item) => ({
        ...item,
        status: "skip",
        hasIssue: false,
        issueDescription: ""
      }))
    );
  };

  // Update status for a specific item
  const handleItemStatusChange = (index: number, newStatus: InspectionCheckStatus) => {
    setResults((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const hasIssue = newStatus === "fail";
      updated[index] = {
        ...current,
        status: newStatus,
        hasIssue,
        issueUrgency: hasIssue ? (current.issueUrgency || "high") : undefined,
        issueDescription: hasIssue ? (current.issueDescription || "") : ""
      };
      return updated;
    });
  };

  // Update defect note for a specific item
  const handleDefectDescriptionChange = (index: number, description: string) => {
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        issueDescription: description
      };
      return updated;
    });
  };

  // Update defect urgency
  const handleDefectUrgencyChange = (index: number, urgency: Priority) => {
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        issueUrgency: urgency
      };
      return updated;
    });
  };

  // Handle image attachment for defect
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDefectIndexForImage !== null) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setResults((prev) => {
            const updated = [...prev];
            const current = updated[selectedDefectIndexForImage];
            const images = current.images ? [...current.images, base64] : [base64];
            updated[selectedDefectIndexForImage] = {
              ...current,
              images
            };
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDefectImage = (itemIndex: number, imgIndex: number) => {
    setResults((prev) => {
      const updated = [...prev];
      const current = updated[itemIndex];
      if (current.images) {
        const newImages = current.images.filter((_, i) => i !== imgIndex);
        updated[itemIndex] = { ...current, images: newImages };
      }
      return updated;
    });
  };

  // Calculate summary counts
  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const skipCount = results.filter((r) => r.status === "skip").length;
  const defectCount = failCount;
  const overallStatus = failCount > 0 ? "fail" : skipCount === results.length ? "skip" : "pass";

  // Filter items by category
  const filteredResults = results.filter((r) => {
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "defects") return r.status === "fail";
    return r.category === activeCategoryFilter;
  });

  // Handle Form Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert("กรุณาเลือกรถที่ต้องการตรวจเช็ค");
      return;
    }

    const mileageNum = parseInt(currentMileage, 10) || selectedVehicle.currentMileage || 0;
    const docNum = initialRecord?.docNumber || `DCI-${date.replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: DailyVehicleInspectionRecord = {
      id: initialRecord?.id || `dci-${Date.now()}`,
      docNumber: docNum,
      isoDocNumber: "TNB-SHE-FRM-007-Rev.03",
      date,
      time,
      vehicleId: selectedVehicle.id,
      licensePlate: selectedVehicle.licensePlate,
      erpNo: selectedVehicle.erpNo,
      province: selectedVehicle.province || "กรุงเทพมหานคร",
      vehicleBrand: selectedVehicle.vehicleBrand,
      vehicleModel: selectedVehicle.vehicleModel,
      vehicleType: selectedVehicle.vehicleType,
      department: selectedVehicle.department,
      driverName: driverName || selectedVehicle.driverName || "ไม่ระบุ",
      driverPhone: driverPhone || selectedVehicle.driverPhone,
      inspectorName: inspectorName || "วิชัย ตรวจละเอียด",
      inspectorPhone,
      currentMileage: mileageNum,
      startMileage: mileageNum,
      overallStatus,
      defectCount,
      results,
      notes,
      locationName,
      ticketCreated: initialRecord?.ticketCreated || false,
      ticketId: initialRecord?.ticketId,
      ticketNumber: initialRecord?.ticketNumber,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(newRecord, autoCreateTicket && defectCount > 0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-950 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {initialRecord ? "แก้ไขผลตรวจสภาพรถประจำวัน" : "บันทึกการตรวจสภาพรถบรรทุก ประจำวัน"}
                </h2>
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  ISO-39001 / TNB Safety
                </span>
              </div>
              <p className="text-xs text-slate-300">
                แบบฟอร์มตรวจสอบ 21 รายการมาตรฐาน ก่อนเริ่มปฏิบัติงาน (ก่อน 08:00 น.)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Section 1: Vehicle & Basic Information */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>1. ข้อมูลรถยนต์ & ผู้ตรวจสอบ</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                เวลาตรวจมาตรฐาน: ก่อน 08:00 น.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Vehicle Select */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <span>ทะเบียนรถ *</span>
                </label>
                <select
                  value={selectedVehicle?.id || ""}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  required
                >
                  <option value="">-- เลือกรถยนต์ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} ({v.province || "กทม"}) - {v.vehicleBrand} {v.vehicleModel} [{v.department}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>วันที่ตรวจเช็ค *</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Time */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>เวลาตรวจเช็ค *</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Current Mileage */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>เลขไมล์ปัจจุบัน (กม.) *</span>
                </label>
                <input
                  type="number"
                  placeholder="เช่น 185000"
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Driver Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>ชื่อพนักงานขับรถ</span>
                </label>
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล พขร."
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Inspector Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ชื่อผู้ตรวจสอบ / นายช่าง</span>
                </label>
                <input
                  type="text"
                  placeholder="ชื่อผู้ตรวจสภาพ"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location & Extra Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>สถานที่ตรวจเช็ค</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ศูนย์กระจายสินค้า TNB ลาดกระบัง"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>เบอร์โทรติดต่อ พขร. / ผู้ตรวจ</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น 081-234-5678"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rapid Quick Actions & Score bar */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-300">ผลสรุป 21 รายการ:</span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ปกติ (/) : {passCount}</span>
              </span>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold ${failCount > 0 ? "bg-rose-950 text-rose-300 border border-rose-500 animate-pulse" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>ผิดปกติ (x) : {failCount}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30">
                <span>งดตรวจ (O) : {skipCount}</span>
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSetAllPass}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✅ ติ๊กปกติทั้งหมด (Pass All)</span>
              </button>
              <button
                type="button"
                onClick={handleSetAllSkip}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                title="ตั้งค่าทุกข้อเป็นงดเว้นการตรวจ (วันหยุด/จอดซ่อม)"
              >
                <span>งดตรวจทั้งหมด (O)</span>
              </button>
            </div>
          </div>

          {/* Section 3: 21 Inspection Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>2. รายการตรวจเช็คสภาพรถบรรทุก 21 ข้อ</span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto text-[11px] pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeCategoryFilter === "all" ? "bg-blue-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  ทั้งหมด ({results.length})
                </button>
                {failCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveCategoryFilter("defects")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeCategoryFilter === "defects" ? "bg-rose-600 text-white" : "bg-rose-950/60 text-rose-300 border border-rose-500/40"}`}
                  >
                    ⚠️ พบปัญหา ({failCount})
                  </button>
                )}
                {Object.entries(INSPECTION_CATEGORIES_CONFIG).map(([catKey, catMeta]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveCategoryFilter(catKey)}
                    className={`px-2 py-1 rounded-lg whitespace-nowrap transition-all ${activeCategoryFilter === catKey ? "bg-slate-700 text-white font-bold border border-slate-500" : "bg-slate-800/60 text-slate-400 hover:text-slate-200"}`}
                  >
                    {catMeta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {filteredResults.map((item) => {
                const originalIndex = results.findIndex((r) => r.no === item.no);
                const catInfo = INSPECTION_CATEGORIES_CONFIG[item.category] || { label: item.category, color: "text-slate-300" };

                return (
                  <div
                    key={item.no}
                    className={`rounded-xl border p-3.5 transition-all ${
                      item.status === "fail"
                        ? "bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30"
                        : item.status === "pass"
                        ? "bg-slate-800/40 border-slate-700 hover:border-slate-600"
                        : "bg-slate-800/20 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left: Item info */}
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0 mt-0.5">
                          {item.no}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (ความถี่: {item.frequency})
                            </span>
                          </div>
                          <div className="text-xs text-slate-300">
                            <span className="font-semibold text-slate-400">เกณฑ์มาตรฐาน:</span> {item.standard}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Info className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>วิธีตรวจ: {item.method}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Inspection Status Toggle Buttons (Touch-friendly 3-col grid on mobile) */}
                      <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:space-x-1.5 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
                        {/* PASS (/) Button */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(originalIndex, "pass")}
                          className={`px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all min-h-[44px] ${
                            item.status === "pass"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50 ring-2 ring-emerald-400"
                              : "bg-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-700 active:bg-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>/ ปกติ</span>
                        </button>

                        {/* FAIL (x) Button */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(originalIndex, "fail")}
                          className={`px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all min-h-[44px] ${
                            item.status === "fail"
                              ? "bg-rose-600 text-white shadow-md shadow-rose-950 ring-2 ring-rose-400"
                              : "bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-700 active:bg-slate-700"
                          }`}
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>x ผิดปกติ</span>
                        </button>

                        {/* SKIP (O) Button */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(originalIndex, "skip")}
                          className={`px-2.5 py-2.5 sm:py-2 rounded-xl text-xs font-medium flex items-center justify-center transition-all min-h-[44px] ${
                            item.status === "skip"
                              ? "bg-amber-700 text-white ring-1 ring-amber-400 font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700 active:bg-slate-700"
                          }`}
                          title="งดเว้นการตรวจเช็ค"
                        >
                          <span>O งด</span>
                        </button>
                      </div>
                    </div>

                    {/* Defect Details Box when FAIL (x) */}
                    {item.status === "fail" && (
                      <div className="mt-3 pt-3 border-t border-rose-900/60 bg-rose-950/40 p-3 rounded-lg space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                          <span className="flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>รายละเอียดจุดบกพร่อง / อาการที่พบ:</span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-300 font-normal">ความเร่งด่วน:</span>
                            <select
                              value={item.issueUrgency || "high"}
                              onChange={(e) => handleDefectUrgencyChange(originalIndex, e.target.value as Priority)}
                              className="bg-slate-900 border border-rose-700 rounded px-2 py-0.5 text-xs text-white"
                            >
                              <option value="critical">🚨 ฉุกเฉินมาก (ห้ามวิ่ง)</option>
                              <option value="high">⚠️ เร่งด่วนสูง (ต้องซ่อมทันที)</option>
                              <option value="medium">⚡ ปานกลาง (ซ่อมตามรอบ)</option>
                              <option value="low">📋 เล็กน้อย (เฝ้าระวัง)</option>
                            </select>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={`ระบุอาการผิดปกติของ ${item.name} เช่น รอยแตกร้าว รั่วซึม หลุดหลวม ไฟไม่ติด...`}
                          value={item.issueDescription || ""}
                          onChange={(e) => handleDefectDescriptionChange(originalIndex, e.target.value)}
                          className="w-full bg-slate-900/90 border border-rose-600/70 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-rose-500"
                          required={item.status === "fail"}
                        />

                        {/* Defect Photo Attachment */}
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDefectIndexForImage(originalIndex);
                              cameraInputRef.current?.click();
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 flex items-center space-x-1.5 transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5 text-rose-400" />
                            <span>ถ่ายภาพ / แนบรูปหลักฐาน</span>
                          </button>

                          {/* Image previews */}
                          {item.images && item.images.length > 0 && (
                            <div className="flex items-center space-x-2">
                              {item.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-rose-500">
                                  <img src={img} alt="Defect" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeDefectImage(originalIndex, imgIdx)}
                                    className="absolute top-0 right-0 bg-rose-600 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Notes & Auto-create Repair Ticket */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>3. หมายเหตุเพิ่มเติม & การส่งต่องานซ่อม</span>
            </div>

            <textarea
              rows={2}
              placeholder="หมายเหตุเพิ่มเติมสำหรับการตรวจสภาพ เช่น สภาพอากาศ พิกัดจอด หรือคำแนะนำสำหรับคนขับ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
            />

            {/* Auto Create Repair Ticket Checkbox if any defect exists */}
            {defectCount > 0 && (
              <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/30 flex items-center justify-center text-rose-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-200">
                      สร้างใบแจ้งซ่อมด่วนทันที (Auto-Create Repair Ticket)
                    </div>
                    <div className="text-[11px] text-rose-300/80">
                      ส่งข้อมูลจุดบกพร่อง {defectCount} รายการเข้าสู่ระบบฝ่ายช่างซ่อมบำรุง TNB อัตโนมัติ
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCreateTicket}
                    onChange={(e) => setAutoCreateTicket(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
            )}
          </div>

          {/* Hidden file input for camera */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleImageCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 sticky bottom-0 bg-slate-900 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center space-x-2 transition-all transform active:scale-95 ${
                  defectCount > 0
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-950"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {initialRecord ? "บันทึกการแก้ไข" : defectCount > 0 ? "บันทึกผล & เปิดใบแจ้งซ่อม" : "บันทึกผลการตรวจสภาพ (สมบูรณ์)"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
