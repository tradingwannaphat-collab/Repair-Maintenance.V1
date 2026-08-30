import React, { useRef } from "react";
import { X, Printer, Download, Truck, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";
import { VehicleRecord, DailyVehicleInspectionRecord, InspectionCheckStatus } from "../types";
import { DAILY_INSPECTION_ITEMS_TEMPLATE } from "../data/dailyInspectionData";
import { TnbLogo } from "./TnbLogo";

interface DailyInspectionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleRecord | null;
  records: DailyVehicleInspectionRecord[];
  month: number; // 1-12
  year: number; // e.g. 2026
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
  year
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !vehicle) return null;

  // Days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // Filter records for this vehicle and month
  const monthString = String(month).padStart(2, "0");
  const monthPrefix = `${year}-${monthString}`;
  const monthRecords = records.filter(
    (r) => (r.vehicleId === vehicle.id || r.licensePlate === vehicle.licensePlate) && r.date.startsWith(monthPrefix)
  );

  // Map daily checks: { day: record }
  const dailyRecordMap: { [day: number]: DailyVehicleInspectionRecord } = {};
  monthRecords.forEach((r) => {
    const d = parseInt(r.date.split("-")[2], 10);
    if (d >= 1 && d <= 31) {
      dailyRecordMap[d] = r;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const currentYearBE = year + 543;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Bar (Non-print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                แบบฟอร์มใบรายการตรวจสอบสภาพรถบรรทุก ประจำวัน (แบบมาตรฐาน 1-31 วัน)
              </h3>
              <p className="text-xs text-slate-400">
                ทะเบียน: {vehicle.licensePlate} ({vehicle.province || "กทม"}) | ประจำเดือน {MONTH_NAMES_TH[month - 1]} พ.ศ. {currentYearBE}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              id="btn-print-inspection-sheet"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / PDF (A4 แนวนอน)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - Exact layout of the physical ISO sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 print:p-0 print:bg-white text-[11px] leading-tight">
          <div 
            ref={printAreaRef}
            className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs max-w-full mx-auto print:border-none print:shadow-none print:p-2"
          >
            
            {/* Header Document Table */}
            <div className="border border-slate-900 mb-2">
              <div className="grid grid-cols-12 border-b border-slate-900">
                {/* Left 4 cols: Vehicle info */}
                <div className="col-span-4 p-2 border-r border-slate-900 space-y-1">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800">ทะเบียนรถ:</span>
                    <span className="font-extrabold text-blue-900 border-b border-dotted border-slate-600 flex-1 px-1">
                      {vehicle.licensePlate} ({vehicle.province || "กทม"})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800">ชื่อพนักงานขับรถ:</span>
                    <span className="border-b border-dotted border-slate-600 flex-1 px-1">
                      {vehicle.driverName || "................................................"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800">หน่วยงานที่รับผิดชอบ:</span>
                    <span className="border-b border-dotted border-slate-600 flex-1 px-1">
                      {vehicle.department || "ฝ่ายขนส่ง TNB Logistics"}
                    </span>
                  </div>
                </div>

                {/* Center 4 cols: Title & Photo */}
                <div className="col-span-4 p-2 border-r border-slate-900 text-center flex flex-col items-center justify-center space-y-1">
                  <div className="font-black text-sm text-slate-900">
                    ใบรายการตรวจสอบสภาพรถบรรทุก ประจำวัน
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold">
                    (TNB LOGISTICS DAILY TRUCK PRE-TRIP CHECKLIST)
                  </div>
                  <div className="text-[10px] text-blue-800 font-bold">
                    ยี่ห้อ/รุ่น: {vehicle.vehicleBrand} {vehicle.vehicleModel} ({vehicle.vehicleType})
                  </div>
                </div>

                {/* Right 4 cols: Legend & Instructions */}
                <div className="col-span-4 p-2 space-y-1 text-[10px]">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">
                    สัญลักษณ์การตรวจเช็ค:
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-emerald-700 w-4 text-center bg-emerald-100 rounded">/</span>
                      <span>= สภาวะเช็คและบำรุงรักษาปกติ</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-rose-700 w-4 text-center bg-rose-100 rounded">x</span>
                      <span>= สภาวะเช็คพบความผิดปกติ</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-amber-700 w-4 text-center bg-amber-100 rounded">O</span>
                      <span>= งดเว้นการตรวจเช็ค (วันหยุด/จอด)</span>
                    </div>
                  </div>
                  <div className="text-[9.5px] font-bold text-rose-700 pt-0.5">
                    * หมายเหตุ: ให้ตรวจเช็คก่อนเวลา 08:00 น. ก่อนเริ่มปฏิบัติงาน
                  </div>
                </div>
              </div>

              {/* Sub-header info: Inspector, Phone, Month/Year */}
              <div className="grid grid-cols-12 bg-slate-100/80 text-[10.5px] p-1.5 border-b border-slate-900">
                <div className="col-span-4 flex items-center space-x-2">
                  <span className="font-bold">พนักงานขับรถ:</span>
                  <span>{vehicle.driverName || "......................."}</span>
                  <span className="font-bold ml-2">ผู้ตรวจสอบ:</span>
                  <span>.......................</span>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <span className="font-bold">เบอร์โทร:</span>
                  <span>{vehicle.driverPhone || "......................."}</span>
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
                      ตำแหน่งที่ตรวจเช็ค (21 รายการ)
                    </th>
                    <th className="border-b border-r border-slate-900 py-1" colSpan={31}>
                      ประจำวันที่ (1 - 31)
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
                        className={`border-r border-slate-900 p-0.5 w-5 ${d > daysInMonth ? "bg-slate-300/60" : ""}`}
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
                          return <td key={dayNum} className="border-r border-slate-900 bg-slate-200/50 p-0"></td>;
                        }

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
                            className={`border-r border-slate-900 p-0 text-center font-mono text-[11px] ${markColor}`}
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
              <div className="col-span-4 p-2 border-r border-slate-900 space-y-1">
                <div className="font-bold text-slate-800">ลายเซ็นผู้ตรวจเช็ค:</div>
                <div className="h-7 border-b border-dotted border-slate-400"></div>
                <div className="text-center text-slate-600">
                  (............................................................)
                </div>
                <div className="text-center text-[9px] text-slate-500">
                  พนักงานขับรถ / ผู้รับผิดชอบ
                </div>
              </div>

              <div className="col-span-4 p-2 border-r border-slate-900 space-y-1">
                <div className="font-bold text-slate-800">ลายเซ็นผู้ตรวจสอบ / หัวหน้างาน:</div>
                <div className="h-7 border-b border-dotted border-slate-400"></div>
                <div className="text-center text-slate-600">
                  (............................................................)
                </div>
                <div className="text-center text-[9px] text-slate-500">
                  นายช่าง / เจ้าหน้าที่ความปลอดภัย (จป.)
                </div>
              </div>

              <div className="col-span-4 p-2 space-y-1">
                <div className="font-bold text-slate-800">บันทึกหมายเหตุ & งานซ่อมที่เกิดขึ้น:</div>
                <div className="text-[9.5px] text-slate-600 space-y-0.5">
                  {monthRecords.filter((r) => r.defectCount > 0).length > 0 ? (
                    monthRecords.filter((r) => r.defectCount > 0).map((r, i) => (
                      <div key={i} className="text-rose-800 truncate">
                        • วันที่ {r.date.split("-")[2]}: พบปัญหา {r.results.filter(x => x.status === 'fail').map(x => x.name).join(", ")}
                      </div>
                    ))
                  ) : (
                    <div className="text-emerald-700 italic">
                      • ไม่พบจุดบกพร่องร้ายแรง สภาพรถยนต์พร้อมใช้งานตลอดเดือน
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document ISO Footer */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 px-1">
              <span>TNB LOGISTICS SAFETY & FLEET MANAGEMENT SYSTEM</span>
              <span>รหัสเอกสาร: TNB-SHE-FRM-007 (Rev. 03)</span>
              <span>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
