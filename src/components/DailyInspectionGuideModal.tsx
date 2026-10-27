import React, { useState, useRef } from "react";
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  Info,
  Search,
  Eye,
  Activity,
  Gauge,
  Sparkles,
  Download,
  Printer,
  ExternalLink,
  Check,
  Loader2,
  FileText,
  FileCheck2,
  Layers
} from "lucide-react";
import { DAILY_INSPECTION_ITEMS_TEMPLATE, INSPECTION_CATEGORIES_CONFIG } from "../data/dailyInspectionData";
import { TnbLogo } from "./TnbLogo";
import { KochLogo } from "./KochLogo";
import { downloadElementAsPdf } from "../utils/pdfGenerator";

interface DailyInspectionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: "tnb" | "koch" | "all";
}

export const DailyInspectionGuideModal: React.FC<DailyInspectionGuideModalProps> = ({
  isOpen,
  onClose,
  brand = "tnb"
}) => {
  const [activeTab, setActiveTab] = useState<"document" | "cards">("document");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // PDF Export States
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isKochBrand = brand === "koch";
  const docCode = isKochBrand ? "KOCH-SHE-WI-007 (Rev. 01)" : "TNB-SHE-WI-007 (Rev. 03)";
  const docRefForm = isKochBrand ? "KOCH-SHE-FRM-007" : "TNB-SHE-FRM-007";
  const companyName = isKochBrand ? "บริษัท คอช แพคเกจจิ้ง จำกัด" : "บริษัท ทีเอ็นบี โลจิสติกส์ จำกัด";
  const brandEn = isKochBrand ? "KOCH PACKAGING CO., LTD." : "TNB LOGISTICS CO., LTD.";

  // Filter items for interactive search in card view
  const filteredItems = DAILY_INSPECTION_ITEMS_TEMPLATE.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionGuide.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.no).includes(searchQuery);

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      setDownloadNotice("กำลังเรนเดอร์คู่มือวิธีตรวจสอบ 21 รายการเป็น PDF คุณภาพสูง...");

      const brandPrefix = isKochBrand ? "KOCH" : "TNB";
      const fileName = `${brandPrefix}_คู่มือวิธีตรวจสภาพรถ_21รายการ_ISO39001.pdf`;

      const blobUrl = await downloadElementAsPdf(printAreaRef.current, fileName, {
        orientation: "portrait",
        format: "a4",
        scale: 2.2,
        marginMm: 5,
        onProgress: (percent, text) => {
          setDownloadProgress(percent);
          setDownloadNotice(text);
        }
      });

      setPdfBlobUrl(blobUrl);
      setDownloadSuccess(true);
      setDownloadNotice(null);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Guide PDF Download error:", err);
      setDownloadNotice("กำลังเปิดหน้าต่างพิมพ์ เพื่อให้คุณเลือก 'บันทึกเป็น PDF (Save as PDF)' ผ่านเบราว์เซอร์");
      setTimeout(() => {
        window.print();
      }, 400);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-slate-700 overflow-hidden">
        
        {/* Top Control Bar (Non-print) */}
        <div className="bg-slate-850 px-4 sm:px-6 py-3.5 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isKochBrand ? "bg-rose-900/40 text-rose-400 border border-rose-500/30" : "bg-blue-900/40 text-blue-400 border border-blue-500/30"}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white">
                  คู่มือวิธีตรวจสอบสภาพรถประจำวัน 21 รายการ (Pre-Trip Inspection Manual)
                </h2>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  {docCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {companyName} • มาตรฐานขั้นตอนปฏิบัติงาน ISO 39001 (Road Traffic Safety System)
              </p>
            </div>
          </div>

          {/* Action Buttons: View Toggle, Download PDF, Print, Close */}
          <div className="flex items-center space-x-2 flex-wrap gap-1.5 self-end md:self-center">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("document")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeTab === "document" 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-300 hover:text-white"
                }`}
                title="ดูโครงร่างเอกสาร A4 สำหรับพิมพ์และส่งออก PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>เอกสาร A4</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cards")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeTab === "cards" 
                    ? "bg-purple-600 text-white shadow-xs" 
                    : "text-slate-300 hover:text-white"
                }`}
                title="ดูแบบการ์ดพร้อมตัวกรองค้นหา 21 รายการ"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ค้นหารายการ</span>
              </button>
            </div>

            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              id="btn-download-guide-pdf"
              className={`text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer ${
                downloadSuccess 
                  ? "bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
              } ${isDownloading ? "opacity-75 cursor-wait" : ""}`}
              title="ดาวน์โหลดคู่มือวิธีตรวจสอบ 21 รายการเป็นไฟล์ PDF (.pdf)"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังสร้าง PDF ({downloadProgress}%)...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ดาวน์โหลดสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Open in new tab link if blob is generated */}
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors no-underline cursor-pointer"
                title="เปิดไฟล์ PDF ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
                <span>เปิดดู PDF</span>
              </a>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              id="btn-print-guide-sop"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="สั่งพิมพ์คู่มือออกทางเครื่องพิมพ์ หรือบันทึกเป็น PDF ผ่านเบราว์เซอร์"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">พิมพ์ (A4)</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status progress bar if downloading */}
        {isDownloading && (
          <div className="bg-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between border-b border-slate-700 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{downloadNotice || "กำลังเรนเดอร์เอกสารคู่มือ PDF..."}</span>
            </span>
            <span className="font-mono font-bold text-blue-400">{downloadProgress}%</span>
          </div>
        )}

        {/* Notice banner if fallback print triggered */}
        {downloadNotice && !isDownloading && (
          <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 text-xs text-amber-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold">คำแนะนำ:</span>
              <span>{downloadNotice}</span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] ml-2 shrink-0 cursor-pointer"
            >
              เปิดหน้าต่างพิมพ์ (Save as PDF)
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-950/40">
          
          {/* ========================================================================= */}
          {/* TAB 1: OFFICIAL A4 DOCUMENT LAYOUT (CAPTURED FOR PDF & PRINT) */}
          {/* ========================================================================= */}
          <div className={activeTab === "document" ? "block" : "hidden"}>
            <div 
              ref={printAreaRef}
              data-guide-pdf-content="true"
              className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-md border border-slate-300 max-w-4xl mx-auto print:border-none print:shadow-none print:p-2 text-[11px] leading-relaxed"
              style={{ width: "100%", maxWidth: "840px" }}
            >
              
              {/* Document Header Table */}
              <div className="border border-slate-900 mb-4">
                <div className="grid grid-cols-12 border-b border-slate-900">
                  
                  {/* Left Logo */}
                  <div className="col-span-4 p-3 border-r border-slate-900 flex flex-col justify-center items-start space-y-1">
                    {isKochBrand ? (
                      <div className="flex items-center space-x-2">
                        <KochLogo variant="red" size="sm" showSubtitle={false} />
                        <div>
                          <div className="font-black text-xs text-rose-700">KOCH PACKAGING</div>
                          <div className="text-[9px] text-slate-500 font-semibold">{companyName}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <TnbLogo size="sm" />
                        <div>
                          <div className="font-black text-xs text-blue-900">TNB LOGISTICS</div>
                          <div className="text-[9px] text-slate-500 font-semibold">{companyName}</div>
                        </div>
                      </div>
                    )}
                    <div className="text-[9px] text-slate-500 font-medium">
                      ฝ่ายบริหารกองรถและมาตรฐานความปลอดภัย (SHE & Fleet Dept.)
                    </div>
                  </div>

                  {/* Center Title */}
                  <div className="col-span-5 p-3 border-r border-slate-900 text-center flex flex-col justify-center items-center">
                    <div className="font-black text-sm text-slate-900 tracking-tight">
                      คู่มือขั้นตอนและมาตรฐานการตรวจสอบสภาพรถ 21 รายการ
                    </div>
                    <div className="text-[10px] text-slate-600 font-bold mt-0.5">
                      DAILY PRE-TRIP VEHICLE INSPECTION STANDARD PROCEDURE (SOP)
                    </div>
                    <div className="text-[9.5px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1">
                      ระบบบริหารความปลอดภัยในการขนส่งทางถนน ISO 39001 (RTS)
                    </div>
                  </div>

                  {/* Right Document Control Box */}
                  <div className="col-span-3 p-2.5 text-[9.5px] space-y-1 flex flex-col justify-center bg-slate-50">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">รหัสเอกสาร:</span>
                      <span className="font-mono font-bold text-blue-900">{docCode.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">แก้ไขครั้งที่:</span>
                      <span className="font-mono text-slate-700">03 (มีนาคม 2569)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">อ้างอิงแบบฟอร์ม:</span>
                      <span className="font-mono text-slate-700">{docRefForm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">ความถี่การตรวจ:</span>
                      <span className="text-emerald-800 font-bold">ก่อน 08:00 น. ทุกวัน</span>
                    </div>
                  </div>
                </div>

                {/* Subheader: Objective & Target */}
                <div className="p-2 bg-slate-100/80 text-[10px] text-slate-700 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-slate-900">วัตถุประสงค์: </span>
                    <span>เพื่อให้พนักงานขับรถตรวจสอบความพร้อมของตัวรถ ระบบห้ามล้อ เครื่องยนต์ และอุปกรณ์ความปลอดภัย 100% ก่อนออกปฏิบัติงาน ป้องกันอุบัติเหตุและสินค้าเสียหาย</span>
                  </div>
                  <div className="font-bold text-rose-700 shrink-0">
                    * ข้อกำหนด: หากพบสัญลักษณ์ 'x' ต้องแจ้งซ่อมทันที
                  </div>
                </div>

                {/* Legend Header */}
                <div className="p-2 grid grid-cols-12 gap-2 text-[9.5px] bg-slate-50">
                  <div className="col-span-6 flex items-center space-x-2">
                    <span className="font-bold text-slate-900">สัญลักษณ์การบันทึก:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-1 rounded border border-emerald-300">/ = ปกติ</span>
                    <span className="font-bold text-rose-800 bg-rose-100 px-1 rounded border border-rose-300">x = พบปัญหา/แจ้งซ่อม</span>
                    <span className="font-bold text-amber-800 bg-amber-100 px-1 rounded border border-amber-300">O = วันหยุด/พักซ่อม</span>
                  </div>
                  <div className="col-span-6 flex items-center justify-end space-x-2 text-slate-600">
                    <span className="font-bold text-slate-800">เทคนิคการตรวจ:</span>
                    <span>Ot = ทดสอบระบบ | Et = ตรวจด้วยสายตา | W = เดินเคาะรอบคัน</span>
                  </div>
                </div>
              </div>

              {/* Table of 21 Inspection Items */}
              <div className="border border-slate-900">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-200/90 text-slate-900 font-bold border-b border-slate-900 text-center">
                      <th className="border-r border-slate-900 p-1.5 w-8">ข้อ</th>
                      <th className="border-r border-slate-900 p-1.5 w-36 text-left">ตำแหน่งตรวจเช็ค (21 รายการ)</th>
                      <th className="border-r border-slate-900 p-1.5 w-44 text-left">เกณฑ์มาตรฐานที่ยอมรับได้ (Standard)</th>
                      <th className="border-r border-slate-900 p-1.5 text-left">วิธีการปฏิบัติและขั้นตอนการตรวจสอบ (Inspection Procedure)</th>
                      <th className="border-r border-slate-900 p-1.5 w-16">ความถี่</th>
                      <th className="p-1.5 w-14">เกณฑ์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAILY_INSPECTION_ITEMS_TEMPLATE.map((item, index) => {
                      const isEven = index % 2 === 1;

                      return (
                        <tr 
                          key={item.no} 
                          className={`border-b border-slate-300 hover:bg-blue-50/30 ${isEven ? "bg-slate-50/70" : "bg-white"}`}
                        >
                          {/* No. */}
                          <td className="border-r border-slate-900 p-1 text-center font-bold font-mono text-slate-800">
                            {item.no}
                          </td>

                          {/* Name & Category */}
                          <td className="border-r border-slate-900 p-1 text-left font-bold text-slate-900">
                            <div>{item.name}</div>
                            <div className="text-[8.5px] font-normal text-slate-500">
                              {INSPECTION_CATEGORIES_CONFIG[item.category as keyof typeof INSPECTION_CATEGORIES_CONFIG]?.label}
                            </div>
                          </td>

                          {/* Standard */}
                          <td className="border-r border-slate-900 p-1 text-left text-slate-800 leading-tight">
                            {item.standard}
                          </td>

                          {/* Method & Detailed Procedure */}
                          <td className="border-r border-slate-900 p-1 text-left leading-tight">
                            <div className="font-bold text-blue-900">
                              👉 {item.method}
                            </div>
                            <div className="text-[9px] text-slate-600 mt-0.5">
                              {item.descriptionGuide}
                            </div>
                          </td>

                          {/* Frequency */}
                          <td className="border-r border-slate-900 p-1 text-center text-[9px] text-slate-700 whitespace-nowrap">
                            {item.frequency}
                          </td>

                          {/* Check Sign */}
                          <td className="p-1 text-center font-bold text-emerald-800 font-mono text-xs">
                            /
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Instructions and Rules */}
              <div className="border border-slate-900 mt-3 p-2.5 bg-slate-50 text-[9.5px] space-y-1">
                <div className="font-bold text-slate-900">
                  ข้อกำหนดและมาตรการด้านความปลอดภัย (ISO 39001 Road Traffic Safety Enforcement):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    1. พนักงานขับรถต้องทำการตรวจสอบสภาพรถจริงทุกเช้า ก่อนหมุนกุญแจสตาร์ทและนำรถออกจากลานจอด
                  </div>
                  <div>
                    2. หากพบข้อบกพร่องในระบบความปลอดภัยสำคัญ (เบรก, ลมยาง, ไฟส่องสว่าง) ห้ามนำรถออกเด็ดขาด
                  </div>
                  <div>
                    3. บันทึกผลการตรวจลงในแบบฟอร์มประจำรถ ({docRefForm}) และส่งให้เจ้าหน้าที่ จป. หรือหัวหน้างานลงนามทุกสิ้นเดือน
                  </div>
                  <div>
                    4. แผนกซ่อมบำรุงต้องออกเลขที่ใบแจ้งซ่อม (Repair Ticket) ภายใน 30 นาที หลังได้รับแจ้งความผิดปกติ
                  </div>
                </div>
              </div>

              {/* Signature / Approval Block */}
              <div className="grid grid-cols-3 border border-slate-900 mt-3 text-[9.5px]">
                <div className="p-2 border-r border-slate-900 space-y-1">
                  <div className="font-bold text-slate-800">ผู้จัดทำ (Prepared By):</div>
                  <div className="h-6 border-b border-dotted border-slate-400"></div>
                  <div className="text-center text-slate-600 pt-0.5">(........................................................)</div>
                  <div className="text-center text-[8.5px] text-slate-500">เจ้าหน้าที่ความปลอดภัยในการทำงาน (จป.วิชาชีพ)</div>
                </div>

                <div className="p-2 border-r border-slate-900 space-y-1">
                  <div className="font-bold text-slate-800">ผู้ทบทวน (Reviewed By):</div>
                  <div className="h-6 border-b border-dotted border-slate-400"></div>
                  <div className="text-center text-slate-600 pt-0.5">(........................................................)</div>
                  <div className="text-center text-[8.5px] text-slate-500">หัวหน้าแผนกซ่อมบำรุงและบริหารกองรถ (Fleet Manager)</div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="font-bold text-slate-800">ผู้อนุมัติ (Approved By):</div>
                  <div className="h-6 border-b border-dotted border-slate-400"></div>
                  <div className="text-center text-slate-600 pt-0.5">(........................................................)</div>
                  <div className="text-center text-[8.5px] text-slate-500">ผู้อำนวยการสายงานปฏิบัติการขนส่ง (Operations Director)</div>
                </div>
              </div>

              {/* ISO Footer */}
              <div className="flex items-center justify-between text-[8.5px] text-slate-500 mt-2 px-1">
                <span>{companyName} • {brandEn}</span>
                <span className="font-mono">รหัสเอกสาร: {docCode}</span>
                <span>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</span>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 2: INTERACTIVE CARDS & SEARCH VIEW */}
          {/* ========================================================================= */}
          <div className={activeTab === "cards" ? "space-y-4" : "hidden"}>
            
            {/* Search & Category Filter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อข้อ, คำอธิบาย, วิธีตรวจ เช่น เบรก, ลมยาง, แบตเตอรี่, น้ำมันเครื่อง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  ทั้งหมด (21 ข้อ)
                </button>
                {Object.entries(INSPECTION_CATEGORIES_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === key ? "bg-slate-700 text-white border border-slate-500 font-bold" : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of cards */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const catConfig = INSPECTION_CATEGORIES_CONFIG[item.category as keyof typeof INSPECTION_CATEGORIES_CONFIG];

                return (
                  <div 
                    key={item.no} 
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-300 font-black text-sm flex items-center justify-center font-mono">
                          {item.no}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            ข้อที่ {item.no}. {item.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        {catConfig && (
                          <span className={`px-2.5 py-0.5 rounded-md border font-semibold ${catConfig.color}`}>
                            {catConfig.label}
                          </span>
                        )}
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                          ความถี่: {item.frequency}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                      {/* Standard Criteria */}
                      <div className="md:col-span-5 bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>เกณฑ์มาตรฐานที่ยอมรับได้ (Standard Criteria):</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {item.standard}
                        </p>
                      </div>

                      {/* Method & Detailed Procedure */}
                      <div className="md:col-span-7 bg-blue-950/20 p-3 rounded-xl border border-blue-900/40 space-y-1.5">
                        <div className="font-bold text-blue-300 flex items-center space-x-1.5">
                          <Wrench className="w-4 h-4" />
                          <span>วิธีการปฏิบัติจริง (Inspection Procedure):</span>
                        </div>
                        <div className="font-bold text-white text-xs">
                          👉 {item.method}
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pt-1">
                          {item.descriptionGuide}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
                  ไม่พบรายการที่ตรงกับคำค้นหา "{searchQuery}"
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-850 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs print:hidden">
          <div className="text-slate-400 flex items-center space-x-2">
            <span className="font-bold text-white">เอกสารมาตรฐาน:</span>
            <span>{docCode}</span>
            <span>•</span>
            <span>{companyName}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
