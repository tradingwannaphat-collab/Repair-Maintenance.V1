import React, { useState } from "react";
import { 
  X, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  BellRing, 
  RefreshCw, 
  Save, 
  Info,
  CheckCircle2,
  Scale
} from "lucide-react";
import { TireAlertSetting } from "../types";
import { DEFAULT_TIRE_ALERT_SETTINGS, playTireAlertSound } from "../data/tireAlertConfig";

interface TireAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TireAlertSetting;
  onSave: (newSettings: TireAlertSetting) => void;
}

export const TireAlertSettingsModal: React.FC<TireAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<TireAlertSetting>({ ...settings });
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync state if modal reopens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setShowSavedToast(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setFormData({
      ...DEFAULT_TIRE_ALERT_SETTINGS,
      lastModified: new Date().toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 700);
  };

  const testAudio = () => {
    playTireAlertSound("critical");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ตั้งค่าเกณฑ์มาตรฐานแจ้งเตือนอัตโนมัติ</span>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-medium">
                  ISO 39001
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดค่าความลึกร่องดอกยาง (mm) ขั้นต่ำสำหรับระบบแจ้งเตือนฝ่ายซ่อมบำรุง
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Toggle 1: Enable Auto Alert */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-3">
              <BellRing className={`w-5 h-5 ${formData.enableAutoAlert ? "text-emerald-400" : "text-slate-500"}`} />
              <div>
                <div className="text-sm font-semibold text-white">เปิดระบบแจ้งเตือนอัตโนมัติ (Auto-Alert)</div>
                <div className="text-xs text-slate-400">ตรวจจับและแจ้งเตือนทันทีเมื่อความลึกดอกยางลดต่ำกว่าเกณฑ์</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoAlert}
                onChange={(e) => setFormData({ ...formData, enableAutoAlert: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Standard 1: Critical Threshold */}
          <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-rose-200">
                  🔴 เกณฑ์วิกฤต ห้ามปล่อยรถวิ่ง (Critical Threshold)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-rose-400 font-mono">
                  {formData.criticalThresholdMm}
                </span>
                <span className="text-xs text-rose-300 font-medium">มม.</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={formData.criticalThresholdMm}
                onChange={(e) => setFormData({ ...formData, criticalThresholdMm: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1.0 มม.</span>
                <span className="text-rose-400 font-bold">2.0 มม. (มาตรฐานขนส่งทางบก)</span>
                <span>3.0 มม.</span>
              </div>
            </div>

            <p className="text-xs text-rose-300/80 leading-relaxed">
              * หากดอกยางต่ำกว่าค่านี้ ระบบจะแจ้งเตือนเป็น <strong>ระดับวิกฤตสีแดง (Critical)</strong> แนะนำระงับการจ่ายงานและเปลี่ยนยางทันที
            </p>
          </div>

          {/* Standard 2: Warning Threshold */}
          <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-200">
                  🟡 เกณฑ์เฝ้าระวัง เตรียมเปลี่ยน/สลับยาง (Warning Threshold)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-amber-400 font-mono">
                  {formData.warningThresholdMm}
                </span>
                <span className="text-xs text-amber-300 font-medium">มม.</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min="2.5"
                max="5.0"
                step="0.1"
                value={formData.warningThresholdMm}
                onChange={(e) => setFormData({ ...formData, warningThresholdMm: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>2.5 มม.</span>
                <span className="text-amber-400 font-bold">3.5 มม. (ค่าแนะนำ)</span>
                <span>5.0 มม. (รถขนส่งพิเศษ)</span>
              </div>
            </div>

            <p className="text-xs text-amber-300/80 leading-relaxed">
              * ความลึกระหว่างเกณฑ์วิกฤตถึงเกณฑ์เฝ้าระวัง จะถูกจัดเป็น <strong>ระดับเฝ้าระวังสีเหลือง (Warning)</strong> เพื่อเตือนให้ฝ่ายซ่อมบำรุงเตรียมยางสำรองหรือสลับยาง
            </p>
          </div>

          {/* Sound & Visual Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {formData.alertSoundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">เสียงแจ้งเตือน (Chime)</div>
                  <div className="text-[11px] text-slate-400">ส่งเสียงเตือนเมื่อมีเคสวิกฤต</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testAudio}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] rounded font-semibold transition-colors"
                  title="ทดสอบฟังเสียง"
                >
                  ทดสอบ
                </button>
                <input
                  type="checkbox"
                  checked={formData.alertSoundEnabled}
                  onChange={(e) => setFormData({ ...formData, alertSoundEnabled: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-white">แถบแจ้งเตือนด่วนบนสุด</div>
                  <div className="text-[11px] text-slate-400">กางแถบเตือนสีแดงอัตโนมัติ</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoOpenBanner}
                onChange={(e) => setFormData({ ...formData, autoOpenBanner: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Reference standards info box */}
          <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-200/90 leading-relaxed">
            <Scale className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">ข้อกำหนดอ้างอิง:</strong> ตามระเบียบกรมการขนส่งทางบก รถบรรทุกและรถโดยสารต้องมีร่องยางลึกไม่น้อยกว่า <strong>2.0 มิลลิเมตร</strong> หากต่ำกว่าสะพานยางจะถือว่าไม่ปลอดภัยต่อการใช้งานและไม่ผ่านการตรวจสภาพประจำปี
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>คืนค่ามาตรฐาน (2.0 / 3.5 มม.)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
              >
                {showSavedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>บันทึกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>บันทึกการตั้งค่า</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
