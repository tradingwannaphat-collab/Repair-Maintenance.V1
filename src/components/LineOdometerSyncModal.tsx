import React, { useState, useMemo } from "react";
import { 
  X, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  FileText, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Truck, 
  Gauge, 
  History, 
  Camera, 
  Terminal, 
  Info,
  ExternalLink,
  Sliders,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { VehicleRecord, MileageLogEntry } from "../types";
import { 
  simulateLineMileageMessage, 
  batchImportLineMileage, 
  ocrLineOdometerPhoto 
} from "../utils/fleetSyncService";
import { parseLineOdometerMessage, parseBatchLineMessages } from "../data/initialMileageLogData";

interface LineOdometerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleRecord[];
  mileageLogs: MileageLogEntry[];
  currentBrand?: "tnb" | "koch" | "all";
  onMileageUpdated?: () => void;
  onApplyMileageUpdate?: (updatedVehicle: VehicleRecord, newLog: MileageLogEntry) => void;
  onOpenMileageHistoryForVehicle?: (vehicle: VehicleRecord) => void;
}

const LINE_SAMPLE_PRESETS = [
  {
    title: "📦 Koch (2ฒฬ-3687 ตู้ทึบส่งกล่อง)",
    text: "2ฒฬ3687 เลขไมล์ 114,250 เข้าศูนย์ตรวจเช็คระยะแล้วครับ คนขับสมศักดิ์ Koch Packaging"
  },
  {
    title: "📦 Koch (KC-02 6 ล้อตู้แห้ง)",
    text: "KC-02 3ฒข-8891 ไมล์ 87,400 ส่งกล่องกระดาษนิคมบางพลีเรียบร้อย"
  },
  {
    title: "📦 Koch (KC-04 10 ล้อหัวลาก)",
    text: "72-5544 เลขไมล์ 182,300 วิ่งงานส่งพาเลทกล่อง ชลบุรี-ระยอง"
  },
  {
    title: "🚛 TNB (65 TNB 700-7239 หัวลาก)",
    text: "65 TNB 700-7239 ไมล์ 52,300 กม. คนขับสมชาย วิ่งงานระยอง-กทม."
  },
  {
    title: "🚛 TNB (TL035 รหัส ERP)",
    text: "TL035 ไมล์ 51,200 ส่งสินค้าชลบุรีเรียบร้อย"
  },
  {
    title: "⚡ ข้อความสั้นคนขับส่งในกลุ่ม",
    text: "2ฒฬ3687 114,250"
  }
];

const BATCH_SAMPLE_TEXT = `08:30 สมศักดิ์ (Koch): 2ฒฬ3687 เลขไมล์ 114,250 ส่งกล่องอมตะนคร
08:45 ชัยวัฒน์ (Koch): 3ฒข-8891 ไมล์ 87,400 ถึงคลังบางพลี
09:12 อนันต์ (Koch): KC-04 72-5544 ไมล์ 182,300 วิ่งส่งพาเลทกล่อง
09:30 วิชาญ (TNB): 700-4755 ไมล์ 273,400 เรียบร้อยครับ
09:50 ประสิทธิ์ (TNB): 701-0707 เลขไมล์ 222,100 ส่งงานเสร็จ`;

export const LineOdometerSyncModal: React.FC<LineOdometerSyncModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  mileageLogs,
  currentBrand = "all",
  onMileageUpdated,
  onApplyMileageUpdate,
  onOpenMileageHistoryForVehicle
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"simulator" | "batch" | "ocr" | "webhook_info" | "logs">("simulator");
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Tab 1: Simulator State
  const [simText, setSimText] = useState(
    currentBrand === "koch"
      ? "2ฒฬ3687 เลขไมล์ 114,250 เข้าศูนย์ตรวจเช็คระยะแล้วครับ คนขับสมศักดิ์ Koch Packaging"
      : "65 TNB 700-7239 ไมล์ 52,300 กม. คนขับสมชาย"
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Live preview for simulator text
  const liveParsedPreview = useMemo(() => {
    if (!simText.trim()) return null;
    return parseLineOdometerMessage(simText, vehicles);
  }, [simText, vehicles]);

  // Tab 2: Batch Chat Import State
  const [batchInput, setBatchInput] = useState(BATCH_SAMPLE_TEXT);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchAppliedMsg, setBatchAppliedMsg] = useState<string | null>(null);

  // Live preview for batch text
  const liveBatchParsed = useMemo(() => {
    if (!batchInput.trim()) return [];
    return parseBatchLineMessages(batchInput, vehicles);
  }, [batchInput, vehicles]);

  // Tab 3: OCR State
  const [ocrImageBase64, setOcrImageBase64] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Tab 5: Filtered LINE logs
  const lineLogs = useMemo(() => {
    return mileageLogs
      .filter(l => l.source === "line_webhook" || l.source === "line_chat_import" || l.source === "line_ocr")
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }, [mileageLogs]);

  // Webhook URL
  const webhookUrl = `${window.location.origin}/api/line/webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  // Run Simulator
  const handleRunSimulator = async () => {
    if (!simText.trim()) return;
    setIsSimulating(true);
    setSimSuccessMsg(null);
    try {
      // 1. Try server simulate API first
      let res: any = null;
      try {
        res = await simulateLineMileageMessage(simText, true);
      } catch (err) {
        console.warn("Server simulate API unavailable, falling back to local handler", err);
      }

      if (res && res.success && res.result?.isValid) {
        setSimResult(res);
        setSimSuccessMsg(`✅ บันทึกเลขไมล์สำเร็จ! ทะเบียน ${res.result.extractedPlate} อัปเดตเป็น ${res.result.extractedMileage?.toLocaleString()} กม. (เพิ่มขึ้น +${res.result.distanceDelta?.toLocaleString()} กม.)`);
        if (onMileageUpdated) onMileageUpdated();
      } else {
        // Fallback: direct client apply
        const parsed = parseLineOdometerMessage(simText, vehicles);
        if (parsed.isValid && parsed.matchedVehicle && parsed.extractedMileage !== null) {
          const v = parsed.matchedVehicle;
          const newMileage = parsed.extractedMileage;
          const prevMileage = v.currentMileage;
          const delta = newMileage - prevMileage;
          const newCount = (v.mileageUpdateCount || 0) + 1;
          const now = new Date().toISOString();

          const updatedVehicle: VehicleRecord = {
            ...v,
            currentMileage: newMileage,
            mileageUpdateCount: newCount,
            lastMileageUpdateDate: now,
            lastMileageSource: "line_webhook",
            updatedAt: now
          };

          const newLog: MileageLogEntry = {
            id: `LOG-ML-LINE-${Date.now()}`,
            vehicleId: v.id,
            licensePlate: v.licensePlate,
            erpNo: v.erpNo,
            previousMileage: prevMileage,
            newMileage,
            distanceDelta: delta,
            recordedAt: now,
            source: "line_webhook",
            reporterName: parsed.extractedDriverName || v.driverName || "พนักงานขับรถผ่าน LINE",
            rawMessage: simText,
            notes: parsed.warningNote || `ดึงข้อมูลอัตโนมัติจาก LINE (อัปเดตครั้งที่ ${newCount})`,
            isFlagged: Boolean(parsed.warningNote)
          };

          if (onApplyMileageUpdate) {
            onApplyMileageUpdate(updatedVehicle, newLog);
          }
          setSimResult({ success: true, result: { ...parsed, matchedVehicle: updatedVehicle } });
          setSimSuccessMsg(`✅ บันทึกเลขไมล์สำเร็จ! ทะเบียน ${parsed.extractedPlate} อัปเดตเป็น ${newMileage.toLocaleString()} กม. (เพิ่มขึ้น +${delta.toLocaleString()} กม.)`);
          if (onMileageUpdated) onMileageUpdated();
        } else {
          setSimResult(res || { success: false, result: parsed });
          alert(parsed.warningNote || res?.error || "ไม่สามารถวิเคราะห์ข้อมูลทะเบียนหรือเลขไมล์ได้");
        }
      }
    } catch (e: any) {
      alert("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run Batch Import
  const handleRunBatchImport = async () => {
    if (!batchInput.trim()) return;
    setIsBatchImporting(true);
    setBatchAppliedMsg(null);
    try {
      let res: any = null;
      try {
        res = await batchImportLineMileage(batchInput, true);
      } catch (err) {
        console.warn("Server batch import unavailable, using client fallback", err);
      }

      if (res && res.success) {
        setBatchResults(res.results || []);
        setBatchAppliedMsg(`✅ นำเข้าข้อมูลเลขไมล์จากกลุ่ม LINE สำเร็จทั้งหมด ${res.appliedCount || 0} คัน!`);
        if (onMileageUpdated) onMileageUpdated();
      } else {
        // Fallback: apply live parsed batch locally
        const validBatch = liveBatchParsed.filter(p => p.isValid && p.matchedVehicle && p.extractedMileage !== null);
        if (validBatch.length > 0) {
          const now = new Date().toISOString();
          validBatch.forEach((p, idx) => {
            const v = p.matchedVehicle!;
            const newMileage = p.extractedMileage!;
            const prevMileage = v.currentMileage;
            const delta = newMileage - prevMileage;
            const newCount = (v.mileageUpdateCount || 0) + 1;

            const updatedVehicle: VehicleRecord = {
              ...v,
              currentMileage: newMileage,
              mileageUpdateCount: newCount,
              lastMileageUpdateDate: now,
              lastMileageSource: "line_chat_import",
              updatedAt: now
            };

            const newLog: MileageLogEntry = {
              id: `LOG-ML-BATCH-${Date.now()}-${idx}`,
              vehicleId: v.id,
              licensePlate: v.licensePlate,
              erpNo: v.erpNo,
              previousMileage: prevMileage,
              newMileage,
              distanceDelta: delta,
              recordedAt: now,
              source: "line_chat_import",
              reporterName: p.extractedDriverName || v.driverName || "รายงานกลุ่มแชท LINE",
              rawMessage: p.rawMessage,
              notes: p.warningNote || `นำเข้าจากกลุ่ม LINE (อัปเดตครั้งที่ ${newCount})`,
              isFlagged: Boolean(p.warningNote)
            };

            if (onApplyMileageUpdate) {
              onApplyMileageUpdate(updatedVehicle, newLog);
            }
          });

          setBatchResults(validBatch);
          setBatchAppliedMsg(`✅ นำเข้าข้อมูลเลขไมล์จากกลุ่ม LINE สำเร็จทั้งหมด ${validBatch.length} คัน!`);
          if (onMileageUpdated) onMileageUpdated();
        } else {
          alert("ไม่พบข้อมูลทะเบียนรถและเลขไมล์ที่สมบูรณ์ในข้อความ");
        }
      }
    } catch (e: any) {
      alert("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setIsBatchImporting(false);
    }
  };

  // Handle OCR file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      setOcrImageBase64(b64);
      setIsOcrProcessing(true);
      try {
        const res = await ocrLineOdometerPhoto(b64, false);
        setOcrResult(res);
      } catch (err: any) {
        alert("OCR error: " + err.message);
      } finally {
        setIsOcrProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-[#06C755] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ระบบเชื่อมต่อ LINE ดึงเลขไมล์อัตโนมัติ (LINE Odometer Auto-Sync)
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Receiver
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                เชื่อมต่อ LINE Messaging API Webhook หรือนำเข้าข้อความจากกลุ่มแชทคนขับเพื่อบันทึกไมล์ลงระบบทันที
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 overflow-x-auto gap-2">
          {[
            { id: "simulator", label: "ทดสอบดึงไมล์จาก LINE (Simulator)", icon: Send },
            { id: "batch", label: "นำเข้าแชทกลุ่ม LINE (Batch)", icon: Layers },
            { id: "ocr", label: "AI สแกนรูปหน้าปัดไมล์ (OCR)", icon: Camera },
            { id: "webhook_info", label: "ตั้งค่า Webhook (LINE API)", icon: Sliders },
            { id: "logs", label: `ประวัติ LINE ทั้งหมด (${lineLogs.length})`, icon: History }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-emerald-800 border-emerald-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 bg-slate-50/60">
          
          {/* TAB 1: Simulator */}
          {activeTab === "simulator" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>ทดสอบจำลองข้อความที่คนขับพิมพ์ส่งมาใน LINE</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  ระบบจะทำการถอดรหัสข้อความภาษาไทย จับคู่ป้ายทะเบียนรถในสารระบบ 108 คัน และดึงตัวเลขไมล์ออกมาคำนวณระยะทางที่เพิ่มขึ้น พร้อมบันทึกอัปเดตลงกองรถทันที
                </p>
              </div>

              {/* Sample Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">หรือคลิกเลือกตัวอย่างข้อความทดสอบ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {LINE_SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSimText(p.text)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 transition-colors shadow-2xs text-left"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  ข้อความ LINE ที่ต้องการวิเคราะห์:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    placeholder="เช่น 1ฒข-4589 ไมล์ 85400 กม. คนขับสมชาย..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {simText && (
                    <button
                      type="button"
                      onClick={() => setSimText("")}
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              {liveParsedPreview && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      ผลการวิเคราะห์ข้อความอัตโนมัติ (Live Parser Preview):
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      liveParsedPreview.isValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {liveParsedPreview.isValid ? "✓ พร้อมบันทึกเลขไมล์" : "⚠️ ข้อมูลไม่ครบถ้วน"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">รถที่จับคู่ได้:</span>
                      {liveParsedPreview.matchedVehicle ? (
                        <div className="font-bold text-slate-900 mt-0.5">
                          {liveParsedPreview.matchedVehicle.licensePlate}
                          {liveParsedPreview.matchedVehicle.erpNo && (
                            <span className="ml-1 text-[10px] bg-slate-100 px-1 rounded font-mono">
                              No. {liveParsedPreview.matchedVehicle.erpNo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-rose-500 font-semibold mt-0.5 block">ไม่พบในระบบ</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 block">เลขไมล์เดิม:</span>
                      <span className="font-mono font-semibold text-slate-700 mt-0.5 block">
                        {liveParsedPreview.previousMileage.toLocaleString()} กม.
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">เลขไมล์ใหม่ที่อ่านได้:</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">
                        {liveParsedPreview.extractedMileage ? `${liveParsedPreview.extractedMileage.toLocaleString()} กม.` : "อ่านไม่ได้"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">ระยะทางที่เพิ่ม:</span>
                      <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                        {liveParsedPreview.distanceDelta > 0 ? `+${liveParsedPreview.distanceDelta.toLocaleString()} กม.` : `${liveParsedPreview.distanceDelta} กม.`}
                      </span>
                    </div>
                  </div>

                  {liveParsedPreview.warningNote && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{liveParsedPreview.warningNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Success Banner */}
              {simSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs sm:text-sm text-emerald-950 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{simSuccessMsg}</span>
                  </div>
                  {simResult?.result?.matchedVehicle && onOpenMileageHistoryForVehicle && (
                    <button
                      type="button"
                      onClick={() => {
                        const v = vehicles.find(veh => veh.id === simResult.result.matchedVehicle.id || veh.licensePlate === simResult.result.matchedVehicle.licensePlate) || simResult.result.matchedVehicle;
                        onClose();
                        onOpenMileageHistoryForVehicle(v);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <Gauge className="w-3.5 h-3.5 text-amber-300" />
                      <span>📊 เรียกดูประวัติคันนี้ทันที</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunSimulator}
                  disabled={isSimulating || !liveParsedPreview?.isValid}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSimulating ? "กำลังบันทึก..." : "🚀 บันทึกอัปเดตเลขไมล์ลงระบบทันที"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Batch Group Chat Import */}
          {activeTab === "batch" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs sm:text-sm">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>คัดลอกข้อความรายงานจากกลุ่ม LINE ของคนขับ มาวางเพื่ออัปเดตทีละหลายคัน</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  สะดวกสำหรับฝ่ายจัดการกองรถ/Dispatch ที่มีคนขับส่งรายงานเลขไมล์เข้ามาในกลุ่มแชทประจำวัน เพียงก๊อปปี้ข้อความทั้งหมดมาวาง ระบบจะแยกแยะทะเบียนและตัวเลขให้อัตโนมัติในคลิกเดียว
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    วางข้อความแชทจากกลุ่ม LINE (รองรับหลายบรรทัด):
                  </label>
                  <button
                    type="button"
                    onClick={() => setBatchInput(BATCH_SAMPLE_TEXT)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    ใส่ข้อความตัวอย่าง 5 คัน
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="วางข้อความแชทจาก LINE เช่น&#10;สมชาย: 1ฒข-4589 ไมล์ 85,200&#10;อนันต์: TL035 เลขไมล์ 52,100"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Batch Live Preview Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    รายการที่ตรวจพบจากข้อความ ({liveBatchParsed.filter(p => p.isValid).length}/{liveBatchParsed.length} คันพร้อมอัปเดต):
                  </span>
                  <span className="text-[11px] text-slate-500">ตรวจสอบความถูกต้องก่อนกดบันทึก</span>
                </div>

                {liveBatchParsed.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    ยังไม่มีข้อมูลที่ตรวจพบ กรุณาวางข้อความแชทในช่องด้านบน
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">สถานะ</th>
                          <th className="py-2 px-3">ทะเบียนรถที่พบ</th>
                          <th className="py-2 px-3 text-right">ไมล์เดิม</th>
                          <th className="py-2 px-3 text-right">ไมล์ใหม่</th>
                          <th className="py-2 px-3 text-right">เพิ่มขึ้น</th>
                          <th className="py-2 px-3">ข้อความเดิม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {liveBatchParsed.map((item, idx) => (
                          <tr key={idx} className={item.isValid ? "bg-emerald-50/30" : "bg-rose-50/30"}>
                            <td className="py-2 px-3">
                              {item.isValid ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  พร้อมบันทึก
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                                  ไม่สมบูรณ์
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {item.extractedPlate}
                              {item.matchedVehicle?.erpNo && (
                                <span className="ml-1 text-[10px] bg-slate-100 px-1 rounded font-mono">
                                  No. {item.matchedVehicle.erpNo}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">
                              {item.previousMileage.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                              {item.extractedMileage ? item.extractedMileage.toLocaleString() : "-"}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold">
                              {item.distanceDelta > 0 ? `+${item.distanceDelta.toLocaleString()}` : item.distanceDelta}
                            </td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-xs font-mono text-[11px]">
                              {item.rawMessage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {batchAppliedMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs sm:text-sm text-emerald-950 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{batchAppliedMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunBatchImport}
                  disabled={isBatchImporting || liveBatchParsed.filter(p => p.isValid).length === 0}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>
                    {isBatchImporting 
                      ? "กำลังบันทึก..." 
                      : `บันทึกอัปเดตเลขไมล์ทั้ง ${liveBatchParsed.filter(p => p.isValid).length} คันพร้อมกัน`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OCR Photo */}
          {activeTab === "ocr" && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Gemini AI Smart Odometer OCR (ดึงเลขไมล์จากภาพถ่ายหน้าปัดใน LINE)</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  กรณีคนขับส่งรูปถ่ายหน้าปัดเรือนไมล์เข้ามาใน LINE สามารถอัปโหลดหรือแคปรูปมาวางได้เลย ระบบ AI จะอ่านตัวเลขไมล์ดิจิตอล/อนาล็อกให้อัตโนมัติ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-white flex flex-col items-center justify-center space-y-3 cursor-pointer">
                  <Camera className="w-10 h-10 text-indigo-500" />
                  <div>
                    <label className="text-xs font-bold text-indigo-700 cursor-pointer hover:underline block">
                      คลิกเพื่อเลือกรูปภาพหน้าปัดไมล์
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG จาก LINE</span>
                  </div>
                </div>

                {ocrImageBase64 ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 flex items-center justify-center">
                    <img src={ocrImageBase64} alt="Odometer" className="w-full h-full object-contain" />
                    {isOcrProcessing && (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-xs font-bold">AI กำลังอ่านตัวเลขบนหน้าปัด...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-xs aspect-video">
                    ยังไม่มีภาพถ่ายหน้าปัด
                  </div>
                )}
              </div>

              {ocrResult?.ocr && (
                <div className="p-4 bg-white rounded-xl border border-indigo-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">ผลการอ่านตัวเลขด้วย AI:</span>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">เลขไมล์ที่อ่านได้:</span>
                      <span className="text-lg font-mono font-black text-indigo-700">
                        {ocrResult.ocr.odometerReading ? `${ocrResult.ocr.odometerReading.toLocaleString()} กม.` : "อ่านไม่ชัด"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ประเภทหน้าปัด:</span>
                      <span className="font-semibold text-slate-800">{ocrResult.ocr.dashboardType || "Digital"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ความมั่นใจ AI:</span>
                      <span className="font-semibold text-emerald-600">
                        {Math.round((ocrResult.ocr.confidence || 0.9) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Webhook Info */}
          {activeTab === "webhook_info" && (
            <div className="space-y-4">
              {/* Connected LINE Official Account Profiles Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-xl border border-rose-800/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-xs">
                      KC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Koch (LINE Official Account)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                          @kochpackaging
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                          Basic ID: @030avkyb
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        บัญชีทางการสำหรับรับรายงานเลขไมล์และแจ้งงานซ่อมของ Koch Packaging
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://manager.line.biz/account/@030avkyb"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>เปิด LINE OA Manager</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">LINE Messaging API Webhook URL</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HTTP 200 Ready
                  </span>
                </div>
                
                <p className="text-xs text-slate-300">
                  นำ URL นี้ไปใส่ในช่อง **Webhook URL** บนระบบ LINE Developers Console ของบัญชี LINE Official Account (ใช้ได้ทั้ง Koch @kochpackaging และ TNB Logistics) เพื่อให้ระบบรับข้อความจากคนขับอัตโนมัติ 24 ชม.:
                </p>

                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                  <span className="flex-1 truncate">{webhookUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? "คัดลอกแล้ว" : "คัดลอก URL"}</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  ขั้นตอนการเชื่อมต่อกับ LINE Official Account (LINE OA Koch & TNB):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-600">
                  <li>เข้าสู่ระบบ <a href="https://developers.line.biz/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">LINE Developers Console</a> ด้วยบัญชีเดียวกับ <a href="https://manager.line.biz/account/@030avkyb" target="_blank" rel="noreferrer" className="text-rose-600 underline font-semibold">Koch OA Manager</a></li>
                  <li>เลือก Messaging API Channel ของ <strong>Koch</strong> หรือ <strong>TNB Logistics</strong></li>
                  <li>ไปที่แท็บ <strong>Messaging API</strong> ➔ หาหัวข้อ <strong>Webhook settings</strong></li>
                  <li>วาง URL ด้านบนลงในช่อง <strong>Webhook URL</strong> แล้วกดปุ่ม <strong>Update</strong></li>
                  <li>เปิดสวิตช์ <strong>Use webhook</strong> ให้เป็นสีเขียว (ON)</li>
                  <li>เมื่อคนขับพิมพ์ส่งทะเบียนรถและเลขไมล์ใน LINE ระบบจะประมวลผลและอัปเดตข้อมูลลงฐานข้อมูลรถทันที!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: Audit Log of All LINE Incoming Updates */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    บันทึกประวัติการรับเลขไมล์จาก LINE ทั้งหมด ({lineLogs.length} รายการ)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">อัปเดตเรียลไทม์ผ่าน WebSocket</span>
              </div>

              {lineLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีประวัติการส่งข้อมูลจาก LINE
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">วัน-เวลา</th>
                        <th className="py-2.5 px-3">ทะเบียนรถ</th>
                        <th className="py-2.5 px-3 text-right">เลขไมล์เดิม</th>
                        <th className="py-2.5 px-3 text-right">เลขไมล์ใหม่</th>
                        <th className="py-2.5 px-3 text-right">ระยะทาง (+กม.)</th>
                        <th className="py-2.5 px-3">ช่องทาง</th>
                        <th className="py-2.5 px-3">ผู้รายงาน</th>
                        <th className="py-2.5 px-3">ข้อความ LINE ต้นฉบับ</th>
                        <th className="py-2.5 px-3 text-center">ดูประวัติคันนี้</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lineLogs.map((log) => {
                        const d = new Date(log.recordedAt);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{d.toLocaleDateString("th-TH")}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{d.toLocaleTimeString("th-TH")} น.</div>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {log.licensePlate}
                              {log.erpNo && (
                                <span className="ml-1 text-[10px] bg-slate-100 px-1 rounded font-mono">
                                  No. {log.erpNo}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                              {log.previousMileage.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {log.newMileage.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                              +{log.distanceDelta.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                {log.source === "line_webhook" ? "LINE Webhook" : "แชทกลุ่ม LINE"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-700">
                              {log.reporterName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-xs" title={log.rawMessage}>
                              {log.rawMessage || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {onOpenMileageHistoryForVehicle && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const v = vehicles.find(veh => veh.id === log.vehicleId || veh.licensePlate === log.licensePlate);
                                    if (v) {
                                      onClose();
                                      onOpenMileageHistoryForVehicle(v);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors shadow-2xs"
                                  title="คลิกเพื่อเรียกดูว่าคันนี้มีอัพเดทเลขไมค์ได้กี่ครั้งและดูประวัติย้อนหลังทั้งหมด"
                                >
                                  <Gauge className="w-3 h-3 text-emerald-600" />
                                  <span>ดูประวัติไมล์</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>LINE Integration พร้อมใช้งานทั้ง Webhook และนำเข้าจากกลุ่มแชท</span>
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
