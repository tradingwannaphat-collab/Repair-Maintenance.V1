import React, { useRef, useState } from "react";
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Truck, 
  User, 
  Gauge, 
  MapPin, 
  FileText,
  Loader2,
  Check,
  Building2,
  Wrench
} from "lucide-react";
import { DailyVehicleInspectionRecord, VehicleRecord } from "../types";
import { TnbLogo } from "./TnbLogo";
import { KochLogo } from "./KochLogo";
import { downloadElementAsPdf } from "../utils/pdfGenerator";
import { INSPECTION_CATEGORIES_CONFIG } from "../data/dailyInspectionData";

interface SingleInspectionPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DailyVehicleInspectionRecord | null;
  vehicle?: VehicleRecord | null;
  currentBrand?: "tnb" | "koch" | "all";
}

export const SingleInspectionPdfModal: React.FC<SingleInspectionPdfModalProps> = ({
  isOpen,
  onClose,
  record,
  vehicle,
  currentBrand = "tnb"
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !record) return null;

  const isKochBrand = currentBrand === "koch" || 
    (record.department || "").toLowerCase().includes("koch") ||
    (record.isoDocNumber || "").includes("KOCH") ||
    (vehicle?.carrierCompany || "").toUpperCase() === "KOCH";

  const companyNameTh = isKochBrand ? "บริษัท คอช แพคเกจจิ้ง จำกัด" : "บริษัท ทีเอ็นบี โลจิสติกส์ จำกัด";
  const docIsoCode = record.isoDocNumber || (isKochBrand ? "KOCH-SHE-FRM-007 (Rev. 01)" : "TNB-SHE-FRM-007 (Rev. 03)");

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(15);

      const brandPrefix = isKochBrand ? "KOCH" : "TNB";
      const fileName = `${brandPrefix}_Inspection_${record.docNumber}_${record.licensePlate}.pdf`;

      await downloadElementAsPdf(printAreaRef.current, fileName, {
        orientation: "portrait",
        format: "a4",
        scale: 2.2,
        marginMm: 6,
        onProgress: (percent) => setDownloadProgress(percent)
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setTimeout(() => {
        window.print();
      }, 300);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group 21 results into categories
  const resultsByCategory: { [key: string]: typeof record.results } = {};
  Object.keys(INSPECTION_CATEGORIES_CONFIG).forEach((catKey) => {
    resultsByCategory[catKey] = (record.results || []).filter((r) => r.category === catKey);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden">
        
        {/* Top Control Bar (Non-print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${isKochBrand ? "bg-rose-900/60 text-rose-400 border border-rose-600/40" : "bg-blue-900/60 text-blue-400 border border-blue-600/40"}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">
                  ใบรายการตรวจสภาพรถประจำวัน: {record.docNumber}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  record.overallStatus === "pass"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : record.overallStatus === "fail"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}>
                  {record.overallStatus === "pass" ? "สภาพปกติ 100%" : record.overallStatus === "fail" ? `พบข้อบกพร่อง ${record.defectCount} รายการ` : "งดตรวจ"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ทะเบียน: {record.licensePlate} ({record.province}) | วันที่ {record.date} เวลา {record.time} น.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer ${
                downloadSuccess 
                  ? "bg-emerald-600 ring-2 ring-emerald-400" 
                  : isKochBrand 
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"
              } ${isDownloading ? "opacity-75 cursor-wait" : ""}`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังโหลด PDF... ({downloadProgress}%)</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ดาวน์โหลด PDF แล้ว!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์ (A4 แนวตั้ง)</span>
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

        {/* Printable Area - Standard Single-Day A4 Portrait */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:p-0 print:bg-white text-xs leading-normal">
          <div 
            ref={printAreaRef}
            data-pdf-content="true"
            className="bg-white p-6 rounded-xl border border-slate-300 shadow-xs max-w-3xl mx-auto print:border-none print:shadow-none print:p-2"
          >
            {/* Header Document Table */}
            <div className="border border-slate-900 mb-3">
              <div className="grid grid-cols-12 border-b border-slate-900 p-2.5">
                <div className="col-span-3 flex items-center justify-center border-r border-slate-900 pr-2">
                  {isKochBrand ? (
                    <div className="text-center">
                      <KochLogo variant="red" size="md" showSubtitle={false} />
                      <div className="text-[10px] font-black text-rose-700 mt-1">KOCH PACKAGING</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <TnbLogo size="md" />
                      <div className="text-[10px] font-black text-blue-900 mt-1">TNB LOGISTICS</div>
                    </div>
                  )}
                </div>

                <div className="col-span-6 px-3 flex flex-col justify-center text-center border-r border-slate-900">
                  <div className="font-extrabold text-xs text-slate-700">{companyNameTh}</div>
                  <div className="font-black text-base text-slate-900 tracking-tight mt-0.5">
                    ใบรายการตรวจสอบสภาพรถบรรทุก ประจำวัน
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-semibold">
                    (DAILY VEHICLE PRE-TRIP INSPECTION REPORT)
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold mt-1">
                    มาตรฐานระบบการจัดการความปลอดภัยทางถนน ISO 39001
                  </div>
                </div>

                <div className="col-span-3 pl-2 flex flex-col justify-center text-[10px] space-y-1">
                  <div><span className="font-bold">เลขที่เอกสาร:</span> <span className="font-mono font-bold text-blue-900">{record.docNumber}</span></div>
                  <div><span className="font-bold">รหัสฟอร์ม:</span> <span className="font-mono">{docIsoCode}</span></div>
                  <div><span className="font-bold">วันที่ตรวจ:</span> <span>{record.date}</span></div>
                  <div><span className="font-bold">เวลาตรวจ:</span> <span>{record.time} น.</span></div>
                </div>
              </div>

              {/* Vehicle & Driver Metadata */}
              <div className="grid grid-cols-12 p-2 bg-slate-50 text-[10.5px] border-b border-slate-900">
                <div className="col-span-4 space-y-1">
                  <div><span className="font-bold text-slate-700">ทะเบียนรถ:</span> <span className="font-extrabold text-blue-950">{record.licensePlate} ({record.province})</span></div>
                  <div><span className="font-bold text-slate-700">ยี่ห้อ / รุ่น:</span> <span>{record.vehicleBrand} {record.vehicleModel}</span></div>
                  <div><span className="font-bold text-slate-700">ประเภทรถ:</span> <span>{record.vehicleType}</span></div>
                </div>
                <div className="col-span-4 space-y-1 border-l border-slate-200 pl-3">
                  <div><span className="font-bold text-slate-700">พนักงานขับรถ:</span> <span>{record.driverName}</span></div>
                  <div><span className="font-bold text-slate-700">เบอร์โทรศัพท์:</span> <span>{record.driverPhone || "-"}</span></div>
                  <div><span className="font-bold text-slate-700">หน่วยงาน / สายงาน:</span> <span>{record.department}</span></div>
                </div>
                <div className="col-span-4 space-y-1 border-l border-slate-200 pl-3">
                  <div><span className="font-bold text-slate-700">เลขไมล์ก่อนวิ่ง:</span> <span className="font-mono font-extrabold text-slate-900">{record.currentMileage ? record.currentMileage.toLocaleString() : "-"} กม.</span></div>
                  <div><span className="font-bold text-slate-700">ผู้ตรวจสอบ:</span> <span>{record.inspectorName}</span></div>
                  <div><span className="font-bold text-slate-700">สถานที่ตรวจ:</span> <span>{record.locationName || "-"}</span></div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-2 flex items-center justify-between text-xs font-bold ${
                record.overallStatus === "pass" 
                  ? "bg-emerald-50 text-emerald-900" 
                  : record.overallStatus === "fail" 
                  ? "bg-rose-50 text-rose-900" 
                  : "bg-amber-50 text-amber-900"
              }`}>
                <div className="flex items-center space-x-2">
                  {record.overallStatus === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : record.overallStatus === "fail" ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    สรุปผลการตรวจสภาพ: {record.overallStatus === "pass" ? "สภาพสมบูรณ์พร้อมใช้งาน 100% (Pass)" : record.overallStatus === "fail" ? `ตรวจพบจุดบกพร่อง ${record.defectCount} รายการ (Require Attention)` : "งดเว้นการตรวจเช็ค (Holiday / Parked)"}
                  </span>
                </div>
                <div className="text-[10px] font-normal text-slate-600">
                  สัญลักษณ์: [ / = ปกติ ] [ x = ผิดปกติ ] [ O = ไม่ได้ตรวจ ]
                </div>
              </div>
            </div>

            {/* Checklist Results Table (21 Items grouped by 5 Categories) */}
            <div className="border border-slate-900 mb-3 overflow-hidden">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-200 font-bold border-b border-slate-900 text-center">
                    <th className="border-r border-slate-900 p-1 w-8">ข้อ</th>
                    <th className="border-r border-slate-900 p-1 text-left">รายการตรวจสอบ (21 รายการมาตรฐาน)</th>
                    <th className="border-r border-slate-900 p-1 text-left w-48">มาตรฐานการตรวจเช็ค</th>
                    <th className="border-r border-slate-900 p-1 w-16">วิธีปฏิบัติ</th>
                    <th className="border-r border-slate-900 p-1 w-14">ผลตรวจ</th>
                    <th className="p-1 text-left w-36">หมายเหตุ / ความผิดปกติ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(INSPECTION_CATEGORIES_CONFIG).map(([catKey, catMeta]) => {
                    const itemsInCat = resultsByCategory[catKey] || [];
                    if (itemsInCat.length === 0) return null;

                    return (
                      <React.Fragment key={catKey}>
                        {/* Category Header Row */}
                        <tr className="bg-slate-100 font-bold border-b border-slate-900">
                          <td colSpan={6} className="px-2 py-1 text-left text-slate-800 text-[9.5px]">
                            หมวด: {catMeta.label}
                          </td>
                        </tr>

                        {/* Items in Category */}
                        {itemsInCat.map((item) => (
                          <tr key={item.no} className="border-b border-slate-300 hover:bg-slate-50">
                            <td className="border-r border-slate-300 p-1 text-center font-bold text-slate-700">
                              {item.no}
                            </td>
                            <td className="border-r border-slate-300 p-1 font-medium text-slate-900">
                              {item.name}
                            </td>
                            <td className="border-r border-slate-300 p-1 text-slate-600 text-[9px]">
                              {item.standard}
                            </td>
                            <td className="border-r border-slate-300 p-1 text-center text-slate-600 text-[9px]">
                              {item.method?.split(" ")[0]}
                            </td>
                            <td className={`border-r border-slate-300 p-1 text-center font-mono font-bold text-xs ${
                              item.status === "pass" 
                                ? "text-emerald-700 bg-emerald-50/50" 
                                : item.status === "fail" 
                                ? "text-rose-700 bg-rose-100" 
                                : "text-amber-700 bg-amber-50/50"
                            }`}>
                              {item.status === "pass" ? "/" : item.status === "fail" ? "x" : "O"}
                            </td>
                            <td className="p-1 text-slate-700 text-[9.5px]">
                              {item.issueDescription ? (
                                <span className="text-rose-700 font-bold">{item.issueDescription}</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Defect Log & Connected Repair Ticket if Fail */}
            {record.results?.some((r) => r.status === "fail") && (
              <div className="border border-rose-300 bg-rose-50/80 p-2.5 rounded-lg mb-3 text-[10.5px] space-y-1">
                <div className="font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>บันทึกจุดบกพร่องที่พบและมาตรการแก้ไข:</span>
                </div>
                {record.results?.filter((r) => r.status === "fail").map((d) => (
                  <div key={d.no} className="text-rose-800 pl-4">
                    • ข้อ {d.no}. {d.name}: <span className="font-bold">{d.issueDescription || "ชำรุด"}</span> (ระดับ: {d.issueUrgency || "ด่วน"})
                  </div>
                ))}
                {record.ticketNumber && (
                  <div className="font-mono text-blue-900 pt-1 font-bold pl-4">
                    🛠️ ออกใบแจ้งซ่อมเลขอ้างอิง: {record.ticketNumber}
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            {record.notes && (
              <div className="border border-slate-300 p-2 rounded-lg mb-3 text-[10px] text-slate-700 bg-slate-50">
                <span className="font-bold text-slate-900">หมายเหตุเพิ่มเติม: </span>
                <span>{record.notes}</span>
              </div>
            )}

            {/* Signatures & Certification Area */}
            <div className="grid grid-cols-2 gap-3 border border-slate-900 p-3 text-[10.5px]">
              <div className="border-r border-slate-300 pr-3 space-y-2 text-center">
                <div className="font-bold text-slate-900 text-left">พนักงานขับรถ (ผู้ตรวจเช็คสภาพยานพาหนะ):</div>
                <div className="h-10 border-b border-dotted border-slate-400 flex items-end justify-center pb-1">
                  {record.signatureDriver ? (
                    <span className="font-serif italic font-bold text-slate-900">{record.signatureDriver}</span>
                  ) : null}
                </div>
                <div className="text-slate-800 font-bold">({record.driverName || "............................................................"})</div>
                <div className="text-[9.5px] text-slate-500">วันที่ตรวจ {record.date}</div>
              </div>

              <div className="pl-3 space-y-2 text-center">
                <div className="font-bold text-slate-900 text-left">ผู้ตรวจสอบ / นายช่าง / เจ้าหน้าที่ความปลอดภัย (จป.):</div>
                <div className="h-10 border-b border-dotted border-slate-400 flex items-end justify-center pb-1">
                  {record.signatureInspector ? (
                    <span className="font-serif italic font-bold text-slate-900">{record.signatureInspector}</span>
                  ) : null}
                </div>
                <div className="text-slate-800 font-bold">({record.inspectorName || "............................................................"})</div>
                <div className="text-[9.5px] text-slate-500">เจ้าหน้าที่ตรวจสอบความปลอดภัยยานพาหนะ</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 px-1">
              <span>{companyNameTh} - ระบบบริหารจัดการกองรถและศูนย์บริการซ่อมบำรุง</span>
              <span className="font-mono">{docIsoCode}</span>
              <span>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
