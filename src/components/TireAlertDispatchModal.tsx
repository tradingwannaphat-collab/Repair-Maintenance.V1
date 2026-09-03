import React, { useState } from "react";
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Share2, 
  Clock,
  ExternalLink
} from "lucide-react";
import { TireMaintenanceAlert, TireAlertSetting } from "../types";
import { generateMaintenanceAlertText } from "../data/tireAlertConfig";

interface TireAlertDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: TireMaintenanceAlert[];
  settings: TireAlertSetting;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
}

export const TireAlertDispatchModal: React.FC<TireAlertDispatchModalProps> = ({
  isOpen,
  onClose,
  alerts,
  settings,
  onRequestRepairForVehicle
}) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<"line_group" | "technician_lead" | "all">("all");

  if (!isOpen) return null;

  const criticalCount = alerts.filter((a) => a.alertLevel === "critical").length;
  const warningCount = alerts.filter((a) => a.alertLevel === "warning").length;
  const messageText = generateMaintenanceAlertText(alerts, settings);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
      }, 3500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ส่งข้อความแจ้งเตือนอัตโนมัติหาฝ่ายซ่อมบำรุง</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium">
                  LINE Notify / Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ส่งสรุปรายงานยางต่ำกว่าเกณฑ์ความปลอดภัยถึงหัวหน้าช่างและผู้จัดการกองยาน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Group Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">กลุ่มเป้าหมายผู้รับแจ้งเตือน:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTarget("all")}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedTarget === "all"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ทุกช่องทาง (All)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">กลุ่มไลน์ช่าง + ผู้จัดการ</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget("line_group")}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedTarget === "line_group"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>กลุ่มไลน์ช่างยาง</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">TNB Maintenance Tire Team</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget("technician_lead")}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedTarget === "technician_lead"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>หัวหน้าแผนกซ่อมบำรุง</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">Direct Alert to Supervisor</div>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>วิกฤต: {criticalCount} เส้น</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>เฝ้าระวัง: {warningCount} เส้น</span>
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              เกณฑ์: &lt; {settings.criticalThresholdMm} มม. (วิกฤต) / &lt; {settings.warningThresholdMm} มม. (เฝ้าระวัง)
            </div>
          </div>

          {/* Message Preview Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>ตัวอย่างข้อความแจ้งเตือนอัตโนมัติ (Automated Payload):</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "คัดลอกแล้ว!" : "คัดลอกข้อความ"}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={11}
                value={messageText}
                className="w-full p-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 leading-relaxed focus:outline-none select-all"
              />
            </div>
          </div>

          {/* Sent Success Feedback Banner */}
          {sentSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>ส่งแจ้งเตือนสำเร็จ!</strong> ระบบได้กระจายข้อความเตือนไปยังกลุ่มไลน์ฝ่ายซ่อมบำรุงและหัวหน้าช่างเรียบร้อยแล้ว
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {new Date().toLocaleTimeString("th-TH")}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "คัดลอกสำเร็จ" : "คัดลอกข้อความนำไปวาง"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleDispatch}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังส่งข้อความ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งแจ้งเตือนฝ่ายซ่อมบำรุงทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
