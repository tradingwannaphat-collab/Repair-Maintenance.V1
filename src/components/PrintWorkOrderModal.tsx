import React from "react";
import { X, Printer, CheckCircle2, ShieldCheck, Wrench, DollarSign, MapPin, Navigation } from "lucide-react";
import { RepairTicket } from "../types";
import { CATEGORIES_CONFIG, STATUS_CONFIG } from "../data/categories";
import { TnbLogo } from "./TnbLogo";

interface PrintWorkOrderModalProps {
  ticket: RepairTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintWorkOrderModal: React.FC<PrintWorkOrderModalProps> = ({
  ticket,
  isOpen,
  onClose
}) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const catMeta = CATEGORIES_CONFIG[ticket.category];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        
        {/* Modal Controls - Hidden during print */}
        <div className="px-6 py-3 bg-[#0F172A] text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-slate-300">
            พรีวิวใบสั่งซ่อม & ใบส่งมอบงานยานพาหนะ TNB Logistics (Work Order Print Preview)
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              id="btn-trigger-print"
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Canvas */}
        <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed bg-white">
          
          {/* Header with ISO Document Control Standard */}
          <div className="border-b-2 border-slate-900 pb-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-1 border border-slate-200 rounded-lg">
                  <TnbLogo variant="blue" size="md" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                    TNB Logistics Fleet Maintenance
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">ศูนย์บริการซ่อมบำรุงและบริหารจัดการยานพาหนะขนส่ง</p>
                  <p className="text-[10px] text-slate-400">TNB Logistics Co., Ltd. • Vehicle Management & Safety System</p>
                </div>
              </div>

              {/* ISO Standard Document Control Box */}
              <div className="border border-slate-400 bg-slate-50/80 rounded-lg p-2 text-right text-[10px] font-mono leading-tight">
                <div className="font-bold text-slate-900 text-[11px]">
                  เอกสารควบคุม: <span className="text-blue-900">TNB-MT-WO-001</span>
                </div>
                <div className="text-slate-600">
                  ฉบับแก้ไข: <strong>Rev.03</strong> | มีผล: 01/01/2026
                </div>
                <div className="text-slate-500 text-[9px]">
                  มาตรฐาน: ISO 9001:2015 & ISO 39001
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-sm font-extrabold text-slate-900">
                ใบแจ้งซ่อมและใบสั่งซ่อมบำรุงยานพาหนะ (WORK ORDER & MAINTENANCE RECORD)
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-800 text-xs">
                  เลขที่ใบงาน: {ticket.ticketNumber}
                </span>
                <span className="text-[10px] text-slate-500">
                  วันที่: {new Date(ticket.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          </div>


          {/* Vehicle & Requester Information Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/50">
            <div className="space-y-1">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">
                ข้อมูลยานพาหนะ (Vehicle Details)
              </div>
              <div><strong>ทะเบียนรถ:</strong> <span className="font-mono text-sm font-bold text-slate-900">{ticket.licensePlate}</span> ({ticket.province})</div>
              <div><strong>ยี่ห้อ / รุ่น:</strong> {ticket.vehicleBrand} {ticket.vehicleModel}</div>
              <div><strong>ประเภทรถ:</strong> {ticket.vehicleType}</div>
              <div><strong>เลขไมล์ ณ วันที่แจ้ง:</strong> {ticket.currentMileage.toLocaleString()} กม.</div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">
                ข้อมูลผู้แจ้งซ่อม (Requester Details)
              </div>
              <div><strong>ผู้แจ้งซ่อม / พนักงานขับรถ:</strong> {ticket.requesterName}</div>
              <div><strong>แผนก / ฝ่ายสังกัด:</strong> {ticket.department}</div>
              <div><strong>ระดับความเร่งด่วน:</strong> {ticket.priority}</div>
              <div><strong>สถานะงาน:</strong> {STATUS_CONFIG[ticket.status].labelTh}</div>
            </div>
          </div>

          {/* Emergency Breakdown Location Box (if emergency) */}
          {ticket.breakdownLocation?.isEmergencyBreakdown && (
            <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/50 space-y-1.5">
              <div className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>พิกัดสถานที่เกิดเหตุรถเสียฉุกเฉิน (Emergency Breakdown GPS Location)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div><strong>สถานที่ / ถนน / จุดสังเกต:</strong> {ticket.breakdownLocation.locationName || "ไม่ได้ระบุ"}</div>
                <div><strong>พิกัด GPS:</strong> <span className="font-mono">{ticket.breakdownLocation.latitude.toFixed(6)}, {ticket.breakdownLocation.longitude.toFixed(6)}</span></div>
              </div>
              {ticket.breakdownLocation.landmarks && (
                <div className="text-[11px] text-slate-600"><strong>จุดสังเกตเพิ่มเติม:</strong> {ticket.breakdownLocation.landmarks}</div>
              )}
            </div>
          )}

          {/* Symptom & Category */}
          <div className="p-4 rounded-xl border border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                หมวดหมู่งานซ่อม: <span className="text-amber-800">{catMeta.nameTh}</span>
              </span>
              <span className="font-semibold text-slate-700">
                สถานะงาน: {STATUS_CONFIG[ticket.status].labelTh}
              </span>
            </div>
            <div>
              <strong>รายละเอียดอาการเสียที่ตรวจพบ:</strong>
              <p className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                {ticket.symptoms}
              </p>
            </div>
            {ticket.mechanicNotes && (
              <div>
                <strong>บันทึกผลการซ่อมแซมของช่าง:</strong>
                <p className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                  {ticket.mechanicNotes}
                </p>
              </div>
            )}
          </div>

          {/* Parts List & Cost Breakdown with Post-Repair Assessment */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2">รายการอะไหล่และค่าแรงช่าง (Parts & Labor Breakdown)</h3>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 w-10 text-center">ลำดับ</th>
                  <th className="border border-slate-300 p-2">รายการอะไหล่ / ของเหลว / ค่าบริการ</th>
                  <th className="border border-slate-300 p-2 w-28 text-center">สภาพหลังถอด/ซ่อม</th>
                  <th className="border border-slate-300 p-2 w-20 text-center">จำนวน</th>
                  <th className="border border-slate-300 p-2 w-24 text-right">ราคา/หน่วย</th>
                  <th className="border border-slate-300 p-2 w-24 text-right">จำนวนเงิน (฿)</th>
                </tr>
              </thead>
              <tbody>
                {ticket.partsList.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.isDeductedFromStock && (
                        <div className="text-[10px] text-emerald-700 font-mono">
                          ● ตัดเบิกจากคลังพัสดุ TNB (ใบเบิก: {item.requisitionNumber || "REQ-AUTO"})
                        </div>
                      )}
                      {item.postRepairNote && (
                        <div className="text-[10px] text-slate-500 italic">
                          หมายเหตุ: {item.postRepairNote}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {item.postRepairCondition === 'repairable' ? (
                        <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 text-[10px]">
                          🟢 ซ่อมได้ / Rebuild
                        </span>
                      ) : item.postRepairCondition === 'repaired' ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                          🔵 ซ่อมเสร็จใช้งานได้
                        </span>
                      ) : (
                        <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                          🔴 เสีย / จำหน่ายซาก
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {item.quantity} {item.unit || ""}
                    </td>
                    <td className="border border-slate-300 p-2 text-right">฿{item.unitPrice.toLocaleString()}</td>
                    <td className="border border-slate-300 p-2 text-right font-medium">฿{item.total.toLocaleString()}</td>
                  </tr>
                ))}
                {ticket.partsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border border-slate-300 p-3 text-center text-slate-400 italic">
                      ไม่มีรายการอะไหล่
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={5} className="border border-slate-300 p-2 text-right font-bold">
                    รวมค่าอะไหล่ทั้งสิ้น:
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-bold">
                    ฿{(ticket.partsCost || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-slate-300 p-2 text-right font-bold">
                    ค่าแรงช่างและบริการ (Labor & Service):
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-bold">
                    ฿{(ticket.laborCost || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-extrabold text-sm">
                  <td colSpan={5} className="border border-slate-300 p-2.5 text-right">
                    ยอดรวมสุทธิทั้งสิ้น (GRAND TOTAL):
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right text-amber-900">
                    ฿{(ticket.totalCost || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Post-Repair Equipment Condition Assessment Section */}
          <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">ผลการประเมินสภาพอุปกรณ์ & ชิ้นส่วนรถยนต์หลังการซ่อม:</strong>
              <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-white border border-slate-300">
                {ticket.postRepairEquipmentStatus === 'repairable' 
                  ? "🟢 มีชิ้นส่วนที่สามารถนำไปซ่อม/รีบิลด์ต่อได้ (Repairable)"
                  : ticket.postRepairEquipmentStatus === 'scrap'
                  ? "🔴 ชิ้นส่วนที่ถอดเปลี่ยนเสียสิ้นสภาพ/จำหน่ายซาก (Scrap)"
                  : ticket.postRepairEquipmentStatus === 'mixed'
                  ? "🟡 สภาพผสมผสาน (ซ่อมได้บางส่วน / เสียซากบางส่วน)"
                  : "🔵 อุปกรณ์และระบบทั้งหมดทำงานได้สมบูรณ์ (Repaired & Good)"}
              </span>
            </div>
            {ticket.postRepairEquipmentNote && (
              <p className="text-slate-700 italic">
                บันทึกสภาพและการจัดการซาก: {ticket.postRepairEquipmentNote}
              </p>
            )}
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-300 text-center text-xs">
            <div className="space-y-8">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto" />
              <div>
                <div className="font-bold text-slate-800">({ticket.requesterName})</div>
                <div className="text-slate-500 text-[10px]">ผู้แจ้งซ่อม / ผู้ส่งมอบรถ</div>
                <div className="text-slate-400 text-[9px]">วันที่: ..../..../........</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto" />
              <div>
                <div className="font-bold text-slate-800">({ticket.assignedMechanic || "ช่างผู้รับผิดชอบ"})</div>
                <div className="text-slate-500 text-[10px]">ช่างผู้ดำเนินการซ่อม</div>
                <div className="text-slate-400 text-[9px]">วันที่: ..../..../........</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto" />
              <div>
                <div className="font-bold text-slate-800">(หัวหน้าฝ่ายยานพาหนะ)</div>
                <div className="text-slate-500 text-[10px]">ผู้ตรวจสอบและอนุมัติปล่อยรถ</div>
                <div className="text-slate-400 text-[9px]">วันที่: ..../..../........</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
