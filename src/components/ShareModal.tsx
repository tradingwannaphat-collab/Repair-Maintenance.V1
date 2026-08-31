import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Users, 
  Cloud, 
  Smartphone, 
  Laptop, 
  X,
  HardHat,
  Car,
  Truck,
  CalendarDays,
  Boxes,
  Sparkles
} from "lucide-react";
import { AppNavView } from "../types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppNavView;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentView
}) => {
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const currentFullUrl = `${baseUrl}?view=${currentView}`;

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkType(type);
    setTimeout(() => {
      setCopiedLinkType(null);
    }, 2500);
  };

  const quickLinks = [
    {
      id: "worker",
      label: "กระดานงานช่าง & ศูนย์ควบคุมการซ่อม (หน้านี้)",
      description: "ดูสถานะ 7 ใบงาน, มอบหมายงานช่าง, แดชบอร์ดสรุปผล",
      url: `${baseUrl}?view=worker`,
      icon: HardHat,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    {
      id: "requester",
      label: "หน้าผู้แจ้งซ่อม (สำหรับคนขับรถ/พนักงาน)",
      description: "เปิดใบแจ้งซ่อมใหม่, ปักหมุด GPS รถเสียฉุกเฉิน",
      url: `${baseUrl}?view=requester`,
      icon: Car,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30"
    },
    {
      id: "vehicles",
      label: "สารระบบทะเบียนรถ (108 คัน)",
      description: "ดูข้อมูลหัวลาก, หางพ่วง, รถบรรทุก และสถานะประกันภัย/พ.ร.บ.",
      url: `${baseUrl}?view=vehicles`,
      icon: Truck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      id: "pm_plan",
      label: "แผนบำรุงรักษา PM ประจำปี 2026",
      description: "ตารางตรวจเช็คระยะรอบเดือน 108 คัน",
      url: `${baseUrl}?view=pm_plan`,
      icon: CalendarDays,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
    }
  ];

  // SVG QR Code generator for the current URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentFullUrl)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900/60 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>แชร์ลิงก์ให้ทุกคนเห็นข้อมูลหน้านี้</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                  <Cloud className="w-2.5 h-2.5" />
                  <span>Real-Time Cloud Sync</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ส่งลิงก์นี้ให้ทีมงาน หัวหน้าอู่ คนขับรถ หรือผู้บริหาร เพื่อดูและแก้ไขข้อมูลตรงกันแบบ Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">

          {/* Primary Share Box (Current Active Page) */}
          <div className="bg-slate-800/80 border border-blue-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ลิงก์หน้านี้โดยตรง (Direct Page Link):</span>
              </span>
              {copiedLinkType === "main" && (
                <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกลงคลิปบอร์ดแล้ว!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentFullUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={() => handleCopy(currentFullUrl, "main")}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  copiedLinkType === "main"
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                }`}
              >
                {copiedLinkType === "main" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code & Multi-Device Sync Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200">
              <img 
                src={qrCodeUrl} 
                alt="QR Code สำหรับสแกนเข้าสู่ระบบ"
                className="w-32 h-32 object-contain"
                crossOrigin="anonymous"
              />
              <span className="text-[10px] text-slate-700 font-bold mt-1.5 flex items-center space-x-1">
                <Smartphone className="w-3 h-3 text-slate-600" />
                <span>สแกนด้วยมือถือ / แท็บเล็ต</span>
              </span>
            </div>

            <div className="md:col-span-2 space-y-2.5 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>คุณสมบัติการทำงานร่วมกันทุกเครื่อง (Multi-User Collaboration):</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-emerald-400">ข้อมูลเชื่อมตรงกัน:</strong> ทุกคนจะเห็น 108 ทะเบียนรถ, 7 ใบแจ้งซ่อม, แคตตาล็อกอะไหล่ และแผน PM ตรงกัน 100%</li>
                <li><strong className="text-blue-400">อัปเดตอัตโนมัติ:</strong> เมื่อใครเปิดใบแจ้งซ่อม หรือปรับปรุงสถานะงาน ระบบจะซิงค์ไปยังทุกเครื่องทันที</li>
                <li><strong className="text-amber-400">ไม่ต้องล็อกอินซับซ้อน:</strong> ส่งลิงก์เข้ากลุ่มไลน์ สามารถเปิดใช้งานได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน</li>
              </ul>
            </div>
          </div>

          {/* Quick Links to Other Important Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              เลือกลิงก์ตามบทบาทหน้าที่ (Quick Share Links)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                const isCopied = copiedLinkType === item.id;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className={`p-2 rounded-lg border ${item.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(item.url, item.id)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                        isCopied
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-700/80 hover:bg-slate-600 text-slate-200 border-slate-600"
                      }`}
                      title="คัดลอกลิงก์นี้"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ระบบ TNB Logistics Fleet Management • พร้อมใช้งานบนคลาวด์
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
