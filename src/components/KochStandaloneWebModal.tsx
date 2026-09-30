import React, { useState } from "react";
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  Layers, 
  Truck, 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  ShieldCheck, 
  MessageSquare, 
  Download, 
  Sparkles,
  ArrowRight,
  Share2,
  FileCode2,
  Info
} from "lucide-react";
import { KochLogo } from "./KochLogo";
import { KOCH_FULL_FLEET, KOCH_INITIAL_TICKETS } from "../data/kochStandardData";

interface KochStandaloneWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBrand: "tnb" | "koch" | "all";
  onSelectBrand: (brand: "tnb" | "koch" | "all") => void;
  onOpenLineSyncModal?: () => void;
}

export const KochStandaloneWebModal: React.FC<KochStandaloneWebModalProps> = ({
  isOpen,
  onClose,
  currentBrand,
  onSelectBrand,
  onOpenLineSyncModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate direct link with ?brand=koch
  const getKochUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("brand", "koch");
      return url.toString();
    } catch {
      return window.location.origin + "/?brand=koch";
    }
  };

  const kochDirectUrl = getKochUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(kochDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSwitchToKochHere = () => {
    onSelectBrand("koch");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("brand", "koch");
      window.history.replaceState(null, "", url.toString());
      document.title = "KOCH Packaging - ระบบแจ้งซ่อมบำรุงและศูนย์ปฏิบัติการกองรถ";
    } catch {}
    onClose();
  };

  const handleDownloadStandaloneConfig = () => {
    const configData = {
      appName: "KOCH Packaging Fleet & Maintenance Operations Portal",
      organization: "บริษัท คอช แพคเกจจิ้ง จำกัด (KOCH)",
      brandId: "koch",
      defaultBrand: "koch",
      lineOfficialAccount: {
        name: "Koch",
        accountHandle: "@kochpackaging",
        basicId: "@030avkyb",
        managerUrl: "https://manager.line.biz/account/@030avkyb",
        webhookEndpoint: "/api/line-webhook"
      },
      vehicles: KOCH_FULL_FLEET,
      initialTickets: KOCH_INITIAL_TICKETS,
      deploymentGuide: {
        framework: "React 19 + TypeScript + Vite + TailwindCSS",
        instructions: [
          "1. โคลนหรือนำโค้ดโปรเจกต์นี้ไปติดตั้งบนโฮสติ้งที่ต้องการ (Vercel, Netlify, Cloud Run หรือ Node.js Docker)",
          "2. ตั้งค่า Default Brand ใน App.tsx ให้เป็น 'koch'",
          "3. นำ Webhook URL ไปลงทะเบียนใน LINE Developers Console ของ LINE OA @kochpackaging (@030avkyb)",
          "4. ระบบจะทำงานเป็นเว็บ Standalone ของ Koch โดยสมบูรณ์พร้อมระบบจัดการครบวงจร"
        ]
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `koch-packaging-standalone-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white px-5 sm:px-7 py-5 flex items-center justify-between border-b border-rose-900/50">
          <div className="flex items-center space-x-3.5">
            <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
              <KochLogo variant="red" size="md" showSubtitle={false} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  เว็บระบบ KOCH Packaging (คอช แพคเกจจิ้ง)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs animate-pulse">
                  ✨ เว็บใหม่คัดลอกสมบูรณ์ 100%
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                ระบบบริหารงานซ่อมบำรุงและกองรถกระจายสินค้ากล่องบรรจุภัณฑ์ LINE OA: @kochpackaging (@030avkyb)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-slate-50">
          
          {/* Hero Banner: Choose How You Want to Use Koch Web */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-start justify-between gap-4 flex-col lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm mb-1">
                  <Globe className="w-4 h-4" />
                  <span>สร้างเว็บเพิ่มและคัดลอกฟังก์ชันทั้งหมดสำเร็จ</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  ต้องการเปิดใช้งานเว็บ Koch ในรูปแบบใด?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  ระบบนี้รองรับทั้งการสลับใช้งานทันทีในหน้าต่างเดิม, เปิดเป็นหน้าต่างเว็บแยกเดี่ยว (Dedicated Window), หรือแชร์ลิงก์ให้พนักงานฝ่ายขนส่งของ Koch เข้าใช้งานโดยตรง
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleSwitchToKochHere}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    currentBrand === "koch"
                      ? "bg-slate-800 text-white cursor-default"
                      : "bg-rose-600 hover:bg-rose-700 text-white hover:shadow-md"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{currentBrand === "koch" ? "กำลังใช้งานเว็บ Koch หน้านี้อยู่" : "สลับใช้งานเว็บ Koch ทันที"}</span>
                </button>

                <a
                  href={kochDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-rose-50 text-rose-700 border-2 border-rose-600 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md no-underline"
                >
                  <ExternalLink className="w-4 h-4 text-rose-600" />
                  <span>เปิดเว็บ Koch แยกแท็บใหม่</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Direct Link & Share Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-rose-600" />
                <h5 className="font-extrabold text-sm text-slate-900">
                  ลิงก์ตรงสำหรับเปิดเว็บ KOCH (Dedicated Direct Link)
                </h5>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                ส่งให้พนักงานขับรถหรือทีม Koch บุ๊กมาร์กไว้ได้ทันที
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 truncate select-all">
                {kochDirectUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedLink
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "คัดลอกเรียบร้อย!" : "คัดลอกลิงก์"}</span>
              </button>
            </div>
          </div>

          {/* System Comparison & Feature Checklist for Koch */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>สรุปฟังก์ชันและข้อมูลของเว็บ Koch ที่คัดลอกและจัดเตรียมไว้พร้อมใช้งาน:</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Feature 1: Fleet */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      กองยานพาหนะเฉพาะ Koch (10 คัน)
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      รถ 6 ล้อตู้ทึบ (KC-01, KC-02, KC-07), 4 ล้อจัมโบ้ (KC-03), หัวลาก 10 ล้อ (KC-04, KC-05), กระบะตู้ Revo (KC-06, KC-08) และหางพ่วงตู้ขนส่งพาเลท
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Repair Tickets */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      ระบบแจ้งซ่อมและใบงานซ่อมบำรุง Koch
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      รองรับระบบงานซ่อมลิฟท์ท้ายไฮดรอลิก (Tail Lift), เบรก, เช็คระยะ PM, ไฟฟ้า, แอร์, และเปลี่ยนยาง พร้อม AI ช่วยประเมินสาเหตุและราคา
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3: LINE OA Integration */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      เชื่อมต่อ LINE OA: @kochpackaging (@030avkyb)
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      รับข้อความรายงานเลขไมล์จากคนขับอัตโนมัติ 24 ชม., มีระบบ Simulator ทดสอบดึงไมล์ และระบบสแกนรูปหน้าปัดไมล์ (OCR)
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4: PM Schedule & Daily Check */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      แผน PM ปี 2026 & ตรวจสภาพประจำวัน 21 ข้อ
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      แผน Preventive Maintenance ประจำปีของรถ Koch พร้อมระบบบันทึกตรวจความพร้อม 21 ข้อก่อนออกปฏิบัติงาน
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 5: Safety Handover Contract */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      ใบเซ็นรับอุปกรณ์เซฟตี้ 10 รายการ & สัญญาชดใช้
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ฟอร์มเซ็นรับอุปกรณ์ประจำรถในนามบริษัท คอช แพคเกจจิ้ง จำกัด (KOCH) พร้อมลายเซ็นดิจิทัลและพิมพ์เอกสาร
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 6: Inventory & Spares */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-slate-900">
                      คลังอะไหล่เฉพาะตู้บรรทุก & ทำเนียบศูนย์ซ่อม
                    </h6>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      สายรัดพาเลทกล่อง, น้ำมันไฮดรอลิกลิฟท์ท้าย, ยางซีลขอบตู้กันฝน, ยาง 11R22.5 และศูนย์บริการคู่สัญญาแถบ บางพลี / อมตะนคร / ชลบุรี
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standalone Deployment & Export Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs mb-0.5">
                  <FileCode2 className="w-4 h-4" />
                  <span>ส่งออกระบบหรือนำไปแยกโฮสติ้งอิสระ (Optional Standalone Export)</span>
                </div>
                <h5 className="font-bold text-sm text-white">
                  ต้องการนำเว็บ Koch ไปติดตั้งแยกบนโดเมนของบริษัทหรือไม่?
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  ท่านสามารถดาวน์โหลดไฟล์ชุดตั้งค่า Standalone ของ Koch เพื่อนำไปเปิดใช้งานบนระบบคลาวด์หรือเซิร์ฟเวอร์เฉพาะของตนเองได้ทันที
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadStandaloneConfig}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-rose-400" />
                <span>{downloadSuccess ? "ดาวน์โหลดสำเร็จ!" : "ดาวน์โหลด Standalone Config"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400" />
            <span>สถานะแบรนด์ปัจจุบัน: <strong>{currentBrand === "koch" ? "🔴 KOCH Packaging" : currentBrand === "tnb" ? "🔵 TNB Logistics" : "🌐 รวม 2 บริษัท"}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLineSyncModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLineSyncModal();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>ซิงค์ไมล์ LINE @kochpackaging</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSwitchToKochHere}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              สลับเป็นเว็บ Koch ทันที
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
