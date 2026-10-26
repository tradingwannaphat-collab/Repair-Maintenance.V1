import React, { useRef, useState } from "react";
import { 
  X, 
  Printer, 
  Download, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar,
  FileText,
  Sparkles,
  Loader2,
  Check,
  ToggleLeft,
  ToggleRight,
  FileCheck,
  Building2,
  ExternalLink
} from "lucide-react";
import { VehicleRecord, DailyVehicleInspectionRecord, InspectionCheckStatus } from "../types";
import { DAILY_INSPECTION_ITEMS_TEMPLATE } from "../data/dailyInspectionData";
import { TnbLogo } from "./TnbLogo";
import { KochLogo } from "./KochLogo";
import { downloadElementAsPdf } from "../utils/pdfGenerator";

interface DailyInspectionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleRecord | null;
  records: DailyVehicleInspectionRecord[];
  month: number; // 1-12
  year: number; // e.g. 2026
  currentBrand?: "tnb" | "koch" | "all";
  initialFormType?: "filled" | "blank";
}

const MONTH_NAMES_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const DailyInspectionPrintModal: React.FC<DailyInspectionPrintModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  records,
  month,
  year,
  currentBrand = "tnb",
  initialFormType = "filled"
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [formType, setFormType] = useState<"filled" | "blank">(initialFormType);
  const [isGenericBlank, setIsGenericBlank] = useState<boolean>(false); // Leave plate & driver blank for fleet-wide blank copies
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>("");
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Fallback vehicle in case vehicle is null (e.g. general blank template)
  const fallbackVehicle: VehicleRecord = {
    id: "KC-01",
    licensePlate: currentBrand === "koch" ? "2ฒฬ-3687" : "70-1764",
    carrierCompany: currentBrand === "koch" ? "KOCH" : "TNB",
    erpNo: currentBrand === "koch" ? "KC-01" : "T10-NO.01",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "ISUZU",
    vehicleModel: "GIGA 360",
    vehicleType: "box_truck_6w",
    department: currentBrand === "koch" ? "ฝ่ายจัดส่งกล่องบรรจุภัณฑ์ Koch" : "ฝ่ายขนส่งสินค้า TNB",
    driverName: currentBrand === "koch" ? "นาย สมศักดิ์ บรรจุดี" : "นาย อรรถพล ยอดกล้า",
    driverPhone: "081-456-7890",
    currentMileage: 114250,
    status: "active"
  };

  const effectiveVehicle = vehicle || fallbackVehicle;

  // Determine effective brand: if vehicle carrier is KOCH or currentBrand is koch
  const isKochBrand = currentBrand === "koch" || (effectiveVehicle.carrierCompany || "").toUpperCase() === "KOCH";

  // Days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // Filter records for this vehicle and month
  const monthString = String(month).padStart(2, "0");
  const monthPrefix = `${year}-${monthString}`;
  const monthRecords = records.filter(
    (r) => (r.vehicleId === effectiveVehicle.id || r.licensePlate === effectiveVehicle.licensePlate) && r.date.startsWith(monthPrefix)
  );

  // Map daily checks: { day: record }
  const dailyRecordMap: { [day: number]: DailyVehicleInspectionRecord } = {};
  if (formType === "filled") {
    monthRecords.forEach((r) => {
      const d = parseInt(r.date.split("-")[2], 10);
      if (d >= 1 && d <= 31) {
        dailyRecordMap[d] = r;
      }
    });
  }

  // Handle PDF Download via jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      setDownloadStatusText("กำลังประมวลผลเอกสาร PDF...");

      const brandPrefix = isKochBrand ? "KOCH" : "TNB";
      const typeLabel = formType === "blank" 
        ? (isGenericBlank ? "แบบฟอร์มเปล่ามาตรฐาน_21ข้อ" : `แบบฟอร์มเปล่า_${effectiveVehicle.licensePlate}`)
        : `บันทึกตรวจสภาพ_${effectiveVehicle.licensePlate}_${MONTH_NAMES_TH[month - 1]}_${year + 543}`;
      
      const fileName = `${brandPrefix}_DailyInspection_${typeLabel}.pdf`;

      const generatedBlobUrl = await downloadElementAsPdf(printAreaRef.current, fileName, {
        orientation: "landscape",
        format: "a4",
        scale: 2.2,
        marginMm: 5,
        onProgress: (percent, text) => {
          setDownloadProgress(percent);
          setDownloadStatusText(text);
        }
      });

      setPdfBlobUrl(generatedBlobUrl);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("PDF Download error:", err);
      alert("ไม่สามารถดาวน์โหลดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง หรือใช้ปุ่ม 'พิมพ์เอกสาร'");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentYearBE = year + 543;
  const companyNameTh = isKochBrand ? "บริษัท คอช แพคเกจจิ้ง จำกัด (KOCH Packaging)" : "บริษัท ทีเอ็นบี โลจิสติกส์ จำกัด (TNB Logistics)";
  const docIsoCode = isKochBrand ? "KOCH-SHE-FRM-007 (Rev. 01)" : "TNB-SHE-FRM-007 (Rev. 03)";
  const systemTitleEn = isKochBrand ? "KOCH PACKAGING DAILY TRUCK PRE-TRIP CHECKLIST" : "TNB LOGISTICS DAILY TRUCK PRE-TRIP CHECKLIST";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Bar (Non-print Control Center) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${isKochBrand ? "bg-rose-900/60 border border-rose-600/40" : "bg-blue-900/60 border border-blue-600/40"}`}>
              <ShieldCheck className={`w-5 h-5 ${isKochBrand ? "text-rose-400" : "text-blue-400"}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  แบบฟอร์มตรวจสอบสภาพรถประจำวัน 21 รายการ (มาตรฐาน ISO 39001)
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  formType === "blank" 
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {formType === "blank" ? "แบบฟอร์มเปล่า (Blank Form)" : "แบบฟอร์มพร้อมบันทึกผล 31 วัน"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isGenericBlank && formType === "blank" 
                  ? "เทมเพลตเปล่าทั่วไป (ไม่ระบุทะเบียน) สำหรับพิมพ์แจกทั้งกองรถ"
                  : `ทะเบียน: ${effectiveVehicle.licensePlate} (${effectiveVehicle.province || "กทม"}) | ประจำเดือน ${MONTH_NAMES_TH[month - 1]} พ.ศ. ${currentYearBE}`}
              </p>
            </div>
          </div>

          {/* Controls: Form Switcher, Download PDF, Print, Close */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            
            {/* Toggle Form Type (Filled vs Blank) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFormType("filled")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  formType === "filled" 
                    ? (isKochBrand ? "bg-rose-600 text-white shadow-xs" : "bg-blue-600 text-white shadow-xs")
                    : "text-slate-300 hover:text-white"
                }`}
                title="แสดงข้อมูลผลการตรวจที่บันทึกแล้วในเดือนนี้"
              >
                มีผลบันทึก
              </button>
              <button
                type="button"
                onClick={() => setFormType("blank")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  formType === "blank" 
                    ? "bg-amber-600 text-white shadow-xs" 
                    : "text-slate-300 hover:text-white"
                }`}
                title="แสดงแบบฟอร์มเปล่า 1-31 วัน สำหรับพิมพ์ไปตรวจเช็คหน้างาน"
              >
                แบบฟอร์มเปล่า
              </button>
            </div>

            {/* If Blank, option to toggle Generic Blank (empty plate) */}
            {formType === "blank" && (
              <button
                type="button"
                onClick={() => setIsGenericBlank(!isGenericBlank)}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl border transition-colors flex items-center space-x-1 cursor-pointer ${
                  isGenericBlank 
                    ? "bg-amber-950/80 border-amber-500/60 text-amber-300 font-bold" 
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
                title="เว้นว่างช่องทะเบียนรถและคนขับ เพื่อพิมพ์แจกได้ทุกคัน"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isGenericBlank ? "เว้นว่างทะเบียนรถ (General)" : "ใส่ทะเบียนคันนี้"}</span>
              </button>
            )}

            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              id="btn-download-inspection-pdf"
              className={`text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer ${
                downloadSuccess 
                  ? "bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400" 
                  : isKochBrand 
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"
              } ${isDownloading ? "opacity-75 cursor-wait" : ""}`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังสร้าง PDF... ({downloadProgress}%)</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ดาวน์โหลด PDF สำเร็จ!</span>
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
                title="เปิดไฟล์ PDF ในแท็บใหม่ทันที"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
                <span>เปิดดู PDF</span>
              </a>
            )}

            {/* Print Button (Print / Browser PDF) */}
            <button
              onClick={handlePrint}
              id="btn-print-inspection-sheet"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="สั่งพิมพ์ออกทางเครื่องพิมพ์ หรือบันทึกเป็น PDF ผ่านเบราว์เซอร์"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">พิมพ์ (A4 แนวนอน)</span>
            </button>

            {/* Close Button */}
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
          <div className="bg-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between border-b border-slate-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{downloadStatusText || "กำลังเรนเดอร์เอกสาร PDF คุณภาพสูง..."}</span>
            </span>
            <span className="font-mono font-bold text-blue-400">{downloadProgress}%</span>
          </div>
        )}

        {/* Printable Area - Exact layout of the physical ISO sheet (Landscape A4) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 print:p-0 print:bg-white text-[11px] leading-tight">
          <div 
            ref={printAreaRef}
            data-pdf-content="true"
            className="bg-white p-4 sm:p-5 rounded-xl border border-slate-300 shadow-sm max-w-full mx-auto print:border-none print:shadow-none print:p-1"
            style={{ minWidth: "1000px" }}
          >
            
            {/* Header Document Table */}
            <div className="border border-slate-900 mb-2">
              <div className="grid grid-cols-12 border-b border-slate-900">
                
                {/* Left 4 cols: Vehicle info & Company Logo */}
                <div className="col-span-4 p-2 border-r border-slate-900 space-y-1.5">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
                    {isKochBrand ? (
                      <div className="flex items-center space-x-1.5">
                        <KochLogo variant="red" size="sm" showSubtitle={false} />
                        <div>
                          <div className="font-black text-xs text-rose-700">KOCH PACKAGING</div>
                          <div className="text-[9px] text-slate-500 font-semibold">บริษัท คอช แพคเกจจิ้ง จำกัด</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <TnbLogo size="sm" />
                        <div>
                          <div className="font-black text-xs text-blue-900">TNB LOGISTICS</div>
                          <div className="text-[9px] text-slate-500 font-semibold">บริษัท ทีเอ็นบี โลจิสติกส์ จำกัด</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-[10.5px]">
                    <span className="font-bold text-slate-800">ทะเบียนรถ:</span>
                    <span className="font-extrabold text-blue-900 border-b border-dotted border-slate-600 flex-1 px-1">
                      {isGenericBlank && formType === "blank" ? "................................................" : `${effectiveVehicle.licensePlate} (${effectiveVehicle.province || "กทม"})`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[10.5px]">
                    <span className="font-bold text-slate-800">ชื่อพนักงานขับรถ:</span>
                    <span className="border-b border-dotted border-slate-600 flex-1 px-1">
                      {isGenericBlank && formType === "blank" ? "................................................" : (effectiveVehicle.driverName || "................................................")}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[10.5px]">
                    <span className="font-bold text-slate-800">หน่วยงาน / สายงาน:</span>
                    <span className="border-b border-dotted border-slate-600 flex-1 px-1">
                      {effectiveVehicle.department || (isKochBrand ? "ฝ่ายจัดส่งกล่องบรรจุภัณฑ์ Koch" : "ฝ่ายขนส่ง TNB Logistics")}
                    </span>
                  </div>
                </div>

                {/* Center 4 cols: Title & Photo/Model */}
                <div className="col-span-4 p-2 border-r border-slate-900 text-center flex flex-col items-center justify-center space-y-1">
                  <div className="font-black text-sm text-slate-900 tracking-tight">
                    ใบรายการตรวจสอบสภาพรถบรรทุก ประจำวัน
                  </div>
                  <div className="text-[9.5px] text-slate-600 font-bold tracking-wide">
                    ({systemTitleEn})
                  </div>
                  <div className="text-[10px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1">
                    ยี่ห้อ/รุ่น: {effectiveVehicle.vehicleBrand} {effectiveVehicle.vehicleModel} ({effectiveVehicle.vehicleType})
                  </div>
                  <div className="text-[9px] text-slate-500 font-semibold">
                    ระบบบริหารคุณภาพความปลอดภัย ISO 39001 (RTS Management System)
                  </div>
                </div>

                {/* Right 4 cols: Legend & Instructions */}
                <div className="col-span-4 p-2 space-y-1 text-[10px]">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5 flex items-center justify-between">
                    <span>สัญลักษณ์การตรวจเช็ค (Inspection Codes):</span>
                    <span className="text-[9px] font-mono text-slate-500">{docIsoCode}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pt-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-emerald-800 w-4.5 text-center bg-emerald-100 border border-emerald-300 rounded font-mono">/</span>
                      <span>= สภาวะเช็คและบำรุงรักษาปกติ (พร้อมใช้งาน 100%)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-rose-800 w-4.5 text-center bg-rose-100 border border-rose-300 rounded font-mono">x</span>
                      <span>= สภาวะเช็คพบความผิดปกติ (ต้องแจ้งซ่อมด่วน)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-amber-800 w-4.5 text-center bg-amber-100 border border-amber-300 rounded font-mono">O</span>
                      <span>= งดเว้นการตรวจเช็ค (วันหยุด / จอดพักซ่อม)</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-rose-700 pt-0.5 border-t border-slate-200 mt-1">
                    * ข้อกำหนด: พนักงานขับรถต้องตรวจเช็คก่อนเวลา 08:00 น. ก่อนนำรถออกปฏิบัติงาน
                  </div>
                </div>
              </div>

              {/* Sub-header info: Inspector, Phone, Month/Year */}
              <div className="grid grid-cols-12 bg-slate-100/90 text-[10.5px] p-1.5 border-b border-slate-900">
                <div className="col-span-4 flex items-center space-x-2">
                  <span className="font-bold">พนักงานขับรถ:</span>
                  <span>{isGenericBlank && formType === "blank" ? "................................" : (effectiveVehicle.driverName || "................................")}</span>
                  <span className="font-bold ml-2">ผู้ตรวจสอบ:</span>
                  <span>................................</span>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <span className="font-bold">เบอร์โทร:</span>
                  <span>{isGenericBlank && formType === "blank" ? "................................" : (effectiveVehicle.driverPhone || "................................")}</span>
                </div>
                <div className="col-span-5 flex items-center justify-end space-x-3 pr-2">
                  <span className="font-bold">ประจำเดือน:</span>
                  <span className="font-bold text-blue-900 border-b border-slate-400 px-2">{MONTH_NAMES_TH[month - 1]}</span>
                  <span className="font-bold">ปี พ.ศ.:</span>
                  <span className="font-bold text-blue-900 border-b border-slate-400 px-2">{currentYearBE}</span>
                </div>
              </div>
            </div>

            {/* Matrix Table (21 Items x 31 Days + Standards + Method + Frequency) */}
            <div className="overflow-x-auto border-t border-l border-slate-900">
              <table className="w-full border-collapse text-[10px] text-center border-slate-900">
                <thead>
                  <tr className="bg-slate-200 font-bold border-b border-slate-900">
                    <th className="border-r border-b border-slate-900 p-1 w-7 shrink-0" rowSpan={2}>
                      No.
                    </th>
                    <th className="border-r border-b border-slate-900 p-1 w-44 text-left" rowSpan={2}>
                      ตำแหน่งที่ตรวจเช็ค (21 รายการมาตรฐาน)
                    </th>
                    <th className="border-b border-r border-slate-900 py-1" colSpan={31}>
                      ประจำวันที่ (1 - 31) {formType === "blank" && <span className="text-[9px] font-normal text-slate-600">(ทำเครื่องหมาย /, x, O ในแต่ละวัน)</span>}
                    </th>
                    <th className="border-r border-b border-slate-900 p-1 w-32 text-left" rowSpan={2}>
                      มาตรฐานการตรวจเช็ค
                    </th>
                    <th className="border-r border-b border-slate-900 p-1 w-20 text-center" rowSpan={2}>
                      วิธีการปฏิบัติ
                    </th>
                    <th className="border-r border-b border-slate-900 p-1 w-16 text-center" rowSpan={2}>
                      ความถี่
                    </th>
                  </tr>
                  <tr className="bg-slate-100 text-[9px] font-semibold border-b border-slate-900">
                    {daysArray.map((d) => (
                      <th 
                        key={d} 
                        className={`border-r border-slate-900 p-0.5 w-5 ${d > daysInMonth ? "bg-slate-300/70" : ""}`}
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {DAILY_INSPECTION_ITEMS_TEMPLATE.map((tpl) => (
                    <tr key={tpl.no} className="hover:bg-blue-50/40 border-b border-slate-900">
                      {/* Item No */}
                      <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                        {tpl.no}
                      </td>

                      {/* Item Name */}
                      <td className="border-r border-slate-900 p-1 text-left font-semibold text-slate-900 whitespace-nowrap">
                        {tpl.name}
                      </td>

                      {/* Days 1 to 31 Cells */}
                      {daysArray.map((dayNum) => {
                        if (dayNum > daysInMonth) {
                          return <td key={dayNum} className="border-r border-slate-900 bg-slate-200/60 p-0"></td>;
                        }

                        // If Blank Form: Render empty cell with faint dotted underline for clean manual write-in
                        if (formType === "blank") {
                          return (
                            <td 
                              key={dayNum} 
                              className="border-r border-slate-900 p-0 text-center font-mono text-[11px] h-4.5 bg-white"
                            >
                              &nbsp;
                            </td>
                          );
                        }

                        // If Filled Form: Render recorded status mark
                        const dayRecord = dailyRecordMap[dayNum];
                        let mark = "";
                        let markColor = "text-slate-400";

                        if (dayRecord) {
                          const itemRes = dayRecord.results?.find((r) => r.no === tpl.no);
                          if (itemRes) {
                            if (itemRes.status === "pass") {
                              mark = "/";
                              markColor = "text-emerald-700 font-black";
                            } else if (itemRes.status === "fail") {
                              mark = "x";
                              markColor = "text-rose-700 font-black bg-rose-100";
                            } else if (itemRes.status === "skip") {
                              mark = "O";
                              markColor = "text-amber-700 font-bold";
                            }
                          } else {
                            mark = dayRecord.overallStatus === "pass" ? "/" : "x";
                            markColor = dayRecord.overallStatus === "pass" ? "text-emerald-700 font-black" : "text-rose-700 font-black bg-rose-100";
                          }
                        }

                        return (
                          <td 
                            key={dayNum} 
                            className={`border-r border-slate-900 p-0 text-center font-mono text-[11px] h-4.5 ${markColor}`}
                          >
                            {mark}
                          </td>
                        );
                      })}

                      {/* Standard */}
                      <td className="border-r border-slate-900 p-1 text-left text-[9.5px] text-slate-700">
                        {tpl.standard}
                      </td>

                      {/* Method */}
                      <td className="border-r border-slate-900 p-1 text-center text-[9px] text-slate-600">
                        {tpl.method.split(" ")[0]}
                      </td>

                      {/* Frequency */}
                      <td className="border-r border-slate-900 p-1 text-center text-[9px] text-slate-600 font-medium">
                        {tpl.frequency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Signatures and Notes Area */}
            <div className="grid grid-cols-12 border border-slate-900 mt-2 text-[10px]">
              
              {/* Signature 1: Driver */}
              <div className="col-span-4 p-2 border-r border-slate-900 space-y-1">
                <div className="font-bold text-slate-800">ลายเซ็นผู้ตรวจเช็ค:</div>
                <div className="h-7 border-b border-dotted border-slate-400"></div>
                <div className="text-center text-slate-600 pt-0.5">
                  (............................................................)
                </div>
                <div className="text-center text-[9px] text-slate-500">
                  พนักงานขับรถ / ผู้รับผิดชอบยานพาหนะ
                </div>
              </div>

              {/* Signature 2: Safety / Inspector */}
              <div className="col-span-4 p-2 border-r border-slate-900 space-y-1">
                <div className="font-bold text-slate-800">ลายเซ็นผู้ตรวจสอบ / หัวหน้างาน:</div>
                <div className="h-7 border-b border-dotted border-slate-400"></div>
                <div className="text-center text-slate-600 pt-0.5">
                  (............................................................)
                </div>
                <div className="text-center text-[9px] text-slate-500">
                  นายช่าง / เจ้าหน้าที่ความปลอดภัย (จป.วิชาชีพ)
                </div>
              </div>

              {/* Notes & Repairs */}
              <div className="col-span-4 p-2 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>บันทึกหมายเหตุ & งานซ่อมที่เกิดขึ้น:</span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {formType === "blank" ? "(บันทึกด้วยปากกา)" : "(ประวัติจริง)"}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-600 space-y-0.5 min-h-[40px]">
                  {formType === "blank" ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="border-b border-dotted border-slate-300 h-3"></div>
                      <div className="border-b border-dotted border-slate-300 h-3"></div>
                      <div className="border-b border-dotted border-slate-300 h-3"></div>
                    </div>
                  ) : monthRecords.filter((r) => r.defectCount > 0).length > 0 ? (
                    monthRecords.filter((r) => r.defectCount > 0).map((r, i) => (
                      <div key={i} className="text-rose-800 truncate">
                        • วันที่ {r.date.split("-")[2]}: พบปัญหา {r.results.filter(x => x.status === 'fail').map(x => x.name).join(", ")}
                      </div>
                    ))
                  ) : (
                    <div className="text-emerald-700 italic pt-1">
                      • ไม่พบจุดบกพร่องร้ายแรง สภาพรถยนต์พร้อมใช้งานตลอดเดือน
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document ISO Footer */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 px-1">
              <span>{companyNameTh} - แผนกบริหารกองรถและความปลอดภัย</span>
              <span className="font-mono">รหัสเอกสาร: {docIsoCode}</span>
              <span>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
