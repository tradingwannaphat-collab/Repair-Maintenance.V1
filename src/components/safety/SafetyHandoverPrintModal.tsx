import React, { useRef, useState } from "react";
import { X, Printer, Download, FileText, CheckCircle, ShieldCheck, Truck, User } from "lucide-react";
import { VehicleSafetyHandoverRecord, VehicleRecord, VehicleSafetyItemTemplate } from "../../types";
import { VEHICLE_SAFETY_ITEMS_TEMPLATE, DEFAULT_SAFETY_LIABILITY_CLAUSE } from "../../data/vehicleSafetyEquipmentData";
import { SafetyItemSvgIcon } from "./SafetyItemSvgIcon";
import { TnbLogo } from "../TnbLogo";

interface SafetyHandoverPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: VehicleSafetyHandoverRecord | null;
  vehicle?: VehicleRecord | null;
  mode?: "filled" | "blank";
  templates?: VehicleSafetyItemTemplate[];
}

export const SafetyHandoverPrintModal: React.FC<SafetyHandoverPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  vehicle,
  mode: initialMode = "filled",
  templates
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [printMode, setPrintMode] = useState<"filled" | "blank">(
    record ? initialMode : "blank"
  );

  const activeTemplates = templates && templates.length > 0 ? templates : VEHICLE_SAFETY_ITEMS_TEMPLATE;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isBlank = printMode === "blank";
  const displayPlate = isBlank ? "..................................................." : (record?.licensePlate || vehicle?.licensePlate || "700-XXXX");
  const displayBrand = isBlank ? "..................................." : (record?.vehicleBrand || vehicle?.brand || "HINO / ISUZU");
  const displayDriver = isBlank ? "..................................................." : (record?.driverName || vehicle?.driverName || "....................................");
  const displayPhone = isBlank ? "..................................." : (record?.driverPhone || vehicle?.driverPhone || "-");
  const displayDate = isBlank ? "วันที่ ........ / ........ / 2569" : (record ? new Date(record.handoverDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "วันนี้");
  const displayMileage = isBlank ? "............................ กม." : (record?.currentMileage ? `${record.currentMileage.toLocaleString()} กม.` : "-");
  const displayDocNo = isBlank ? "TNB-SHE-2569-BLANK" : (record?.documentNumber || "SFT-2026-001");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-500/30">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>แบบฟอร์มใบเซ็นรับมอบอุปกรณ์เซฟตี้ติดรถ (TNB-SHE-FRM-012)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-900 text-blue-200 rounded">
                  ISO 39001
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                พร้อมพิมพ์ออกทางเครื่องพิมพ์ หรือ บันทึกเป็น PDF (ขนาดมาตรฐาน A4)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Mode */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold mr-2">
              <button
                type="button"
                onClick={() => setPrintMode("filled")}
                disabled={!record}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printMode === "filled" && record
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
              >
                มีข้อมูลที่เซ็นแล้ว
              </button>
              <button
                type="button"
                onClick={() => setPrintMode("blank")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printMode === "blank"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                แบบฟอร์มเปล่า
              </button>
            </div>

            <button
              onClick={handlePrint}
              id="btn-print-safety-sheet"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 Sheet layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:p-0 print:bg-white text-[11px] leading-tight">
          <div 
            ref={printAreaRef}
            className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-4 print:max-w-none text-slate-900 font-sans"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-900 text-white rounded-lg font-black text-xl">
                    TNB
                  </div>
                  <div>
                    <h1 className="text-base font-black tracking-tight text-slate-950">
                      บริษัท ทีเอ็นบี โลจิสติกส์ จำกัด (TNB LOGISTICS CO., LTD.)
                    </h1>
                    <p className="text-[10px] text-slate-600">
                      ฝ่ายความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน (Safety, Health & Environment)
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] border border-slate-300 p-2 rounded bg-slate-50">
                  <div className="font-bold text-slate-800">รหัสแบบฟอร์ม: TNB-SHE-FRM-012</div>
                  <div className="text-slate-600">แก้ไขครั้งที่: 03 (ส.ค. 2569)</div>
                  <div className="text-blue-700 font-mono font-bold">เลขที่เอกสาร: {displayDocNo}</div>
                </div>
              </div>

              <div className="text-center mt-3">
                <h2 className="text-sm sm:text-base font-black text-slate-950 uppercase underline tracking-wide">
                  ใบส่งมอบและบันทึกข้อตกลงรับผิดชอบอุปกรณ์ความปลอดภัยประจำรถขนส่งสินค้า
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  (VEHICLE SAFETY EQUIPMENT HANDOVER & LIABILITY AGREEMENT FORM)
                </p>
              </div>
            </div>

            {/* Vehicle & Driver Metadata Box */}
            <div className="border border-slate-400 rounded-lg p-3 bg-slate-50/60 mb-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                <div>
                  <span className="font-bold text-slate-700">ทะเบียนรถ:</span>{" "}
                  <span className="font-mono font-bold text-slate-950">{displayPlate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">ยี่ห้อ/รุ่น:</span>{" "}
                  <span className="text-slate-900">{displayBrand}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">พนักงานขับรถ:</span>{" "}
                  <span className="font-bold text-slate-950">{displayDriver}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">เบอร์โทรศัพท์:</span>{" "}
                  <span className="font-mono text-slate-900">{displayPhone}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">วันที่ส่งมอบ:</span>{" "}
                  <span className="text-slate-900">{displayDate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">เลขไมล์รถ:</span>{" "}
                  <span className="font-mono text-slate-900">{displayMileage}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">ผู้ส่งมอบ (จป.):</span>{" "}
                  <span className="text-slate-900">{isBlank ? "...................................." : (record?.issuedBy || "กมลวรรณ ชัยพร")}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">สาเหตุ:</span>{" "}
                  <span className="text-slate-900">
                    {isBlank 
                      ? "[ ] ประจำปี [ ] รับคนใหม่ [ ] รถใหม่" 
                      : (record?.handoverReason === "annual_renewal" ? "รอบประจำปี" : "รับพนักงานใหม่")}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Table (10 items with illustrations) */}
            <div className="border border-slate-900 mb-4 overflow-hidden rounded-sm">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-950 font-black border-b border-slate-900">
                    <th className="py-2 px-1 text-center w-8 border-r border-slate-900">ที่</th>
                    <th className="py-2 px-2 min-w-[110px] border-r border-slate-900">ชื่ออุปกรณ์ความปลอดภัย</th>
                    <th className="py-2 px-1 text-center w-14 border-r border-slate-900">ภาพตัวอย่าง</th>
                    <th className="py-2 px-1 text-center w-12 border-r border-slate-900">จำนวน</th>
                    <th className="py-2 px-2 min-w-[160px] border-r border-slate-900">วัตถุประสงค์การใช้งานตามมาตรฐาน</th>
                    <th className="py-2 px-2 text-center min-w-[100px] border-r border-slate-900">
                      ผลการตรวจรับสภาพ
                    </th>
                    <th className="py-2 px-2 text-center w-24 border-r border-slate-900">รหัสทรัพย์สิน / Serial</th>
                    <th className="py-2 px-2 text-right w-18">มูลค่าชดใช้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {activeTemplates.map((tpl, idx) => {
                    const itemDetail = record?.items?.find((i) => i.templateId === tpl.id || i.itemCode === tpl.itemCode);
                    const isReceived = !isBlank && itemDetail?.status === "received";
                    const isNA = !isBlank && itemDetail?.status === "not_applicable";
                    const isMissing = !isBlank && itemDetail?.status === "missing";
                    const itemPrice = itemDetail?.estimatedValueBaht ?? tpl.estimatedValueBaht;

                    return (
                      <tr key={tpl.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-1 text-center font-bold text-slate-700 border-r border-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-1.5 px-2 font-bold text-slate-950 border-r border-slate-400">
                          <div>**{tpl.nameTh}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{tpl.itemCode}</div>
                        </td>

                        <td className="py-1 px-1 text-center border-r border-slate-400">
                          <div className="inline-flex items-center justify-center p-0.5 bg-slate-50 rounded border border-slate-300">
                            <SafetyItemSvgIcon itemCode={tpl.itemCode} imageUrl={tpl.imageUrl} className="w-8 h-8 object-contain" />
                          </div>
                        </td>

                        <td className="py-1.5 px-1 text-center font-bold text-slate-900 border-r border-slate-400">
                          {tpl.standardQty} {tpl.unit}
                        </td>

                        <td className="py-1.5 px-2 text-slate-700 border-r border-slate-400 leading-snug">
                          {tpl.purpose}
                        </td>

                        <td className="py-1.5 px-2 border-r border-slate-400 text-[9px]">
                          {isBlank ? (
                            <div className="space-y-1">
                              <div>[ ] ครบถ้วน/ปกติ</div>
                              <div>[ ] ชำรุด/เปลี่ยน</div>
                              <div>[ ] ไม่ต้องมีประจำรถ</div>
                            </div>
                          ) : (
                            <div>
                              {isReceived && (
                                <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  ✓ ตรวจรับครบถ้วน ปกติ
                                </span>
                              )}
                              {isNA && (
                                <span className="text-slate-500 font-semibold">
                                  - ไม่ต้องมีประจำรถคันนี้
                                </span>
                              )}
                              {isMissing && (
                                <span className="font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                                  ✗ สูญหาย (รอชดใช้)
                                </span>
                              )}
                              {!isReceived && !isNA && !isMissing && (
                                <span>{itemDetail?.status || "ตรวจรับ"}</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-1.5 px-2 border-r border-slate-400 font-mono text-[9px] text-center text-slate-700">
                          {isBlank ? "......................." : (itemDetail?.serialOrAssetTag || "-")}
                        </td>

                        <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                          {itemPrice.toLocaleString()} ฿
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[10px]">
                    <td colSpan={7} className="py-1.5 px-2 text-right border-r border-slate-400">
                      รวมมูลค่าประเมินชดใช้อุปกรณ์ความปลอดภัย:
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-black text-slate-950">
                      {activeTemplates.reduce((sum, tpl) => {
                        const itemDetail = record?.items?.find((i) => i.templateId === tpl.id || i.itemCode === tpl.itemCode);
                        return sum + (itemDetail ? itemDetail.estimatedValueBaht : tpl.estimatedValueBaht);
                      }, 0).toLocaleString()} ฿
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Liability Statement Clause */}
            <div className="border border-slate-900 rounded p-2.5 bg-slate-50 mb-5 text-[10px] leading-relaxed">
              <div className="font-bold text-slate-950 underline mb-1">
                ข้อตกลงและเงื่อนไขความรับผิดชอบของพนักงานขับรถ (Terms of Responsibility & Liability Agreement):
              </div>
              <p className="text-slate-800 indent-4">
                "{DEFAULT_SAFETY_LIABILITY_CLAUSE}"
              </p>
            </div>

            {/* Signature Blocks (3 Signatures) */}
            <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
              
              {/* Signature 1: Driver */}
              <div className="border border-slate-400 p-2.5 rounded bg-white flex flex-col justify-between min-h-[125px]">
                <div className="font-bold text-slate-900">
                  ผู้รับมอบ (พนักงานขับรถ)
                </div>
                <div className="my-1 h-12 flex items-center justify-center">
                  {!isBlank && record?.driverSignatureDataUrl ? (
                    <img
                      src={record.driverSignatureDataUrl}
                      alt="ลายเซ็นคนขับ"
                      className="max-h-12 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-slate-300">...................................................</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">({displayDriver})</div>
                  <div className="text-slate-500 text-[9px]">วันที่: {displayDate}</div>
                </div>
              </div>

              {/* Signature 2: Safety Officer */}
              <div className="border border-slate-400 p-2.5 rounded bg-white flex flex-col justify-between min-h-[125px]">
                <div className="font-bold text-slate-900">
                  ผู้ส่งมอบ (เจ้าหน้าที่ จป. / นายช่าง)
                </div>
                <div className="my-1 h-12 flex items-center justify-center">
                  {!isBlank && record?.officerSignatureDataUrl ? (
                    <img
                      src={record.officerSignatureDataUrl}
                      alt="ลายเซ็น จป."
                      className="max-h-12 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-slate-300">...................................................</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    ({isBlank ? "..................................................." : (record?.issuedBy || "กมลวรรณ ชัยพร")})
                  </div>
                  <div className="text-slate-500 text-[9px]">จป.วิชาชีพ / หัวหน้างานความปลอดภัย</div>
                </div>
              </div>

              {/* Signature 3: Operations Manager */}
              <div className="border border-slate-400 p-2.5 rounded bg-white flex flex-col justify-between min-h-[125px]">
                <div className="font-bold text-slate-900">
                  ผู้อนุมัติ (ผู้จัดการฝ่ายปฏิบัติการ/ยานพาหนะ)
                </div>
                <div className="my-1 h-12 flex items-center justify-center">
                  {!isBlank && record?.managerSignatureDataUrl ? (
                    <img
                      src={record.managerSignatureDataUrl}
                      alt="ลายเซ็นผู้จัดการ"
                      className="max-h-12 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-slate-300">...................................................</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    (ธีรศักดิ์ สุขสวัสดิ์)
                  </div>
                  <div className="text-slate-500 text-[9px]">ผู้จัดการฝ่ายปฏิบัติการกองยาน</div>
                </div>
              </div>
            </div>

            {/* Document Footnote */}
            <div className="mt-4 pt-2 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center">
              <span>* เอกสารต้นฉบับจัดเก็บไว้ที่ฝ่ายความปลอดภัย (SHE Dept.) และสำเนาเก็บไว้ประจำหน้ารถ</span>
              <span>พิมพ์เมื่อ: {new Date().toLocaleString("th-TH")} • ระบบบริหารจัดการกองยาน TNB Logistics</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
