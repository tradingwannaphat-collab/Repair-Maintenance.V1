import React from "react";
import { 
  Download, 
  FileSpreadsheet, 
  X, 
  Truck, 
  Boxes, 
  Wrench, 
  PackagePlus, 
  PackageMinus, 
  Database,
  CalendarDays,
  FileText
} from "lucide-react";
import { 
  VehicleRecord, 
  InventoryItem, 
  RepairTicket, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord,
  PMMonthlyScheduleItem
} from "../types";
import { 
  exportVehiclesToExcel, 
  exportVehiclesToCSV,
  exportInventoryToExcel, 
  exportInventoryToCSV,
  exportTicketsToExcel, 
  exportTicketsToCSV,
  exportReceiptsToExcel, 
  exportReceiptsToCSV,
  exportRequisitionsToExcel, 
  exportRequisitionsToCSV,
  exportPMMonthlyScheduleToExcel,
  exportPMAnnualMatrixToExcel,
  exportFullDatabaseBackupToExcel
} from "../utils/excelImportExport";

interface DataBackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleRecord[];
  inventory: InventoryItem[];
  tickets: RepairTicket[];
  receipts: GoodsReceiptRecord[];
  requisitions: GoodsRequisitionRecord[];
  pmSchedules?: PMMonthlyScheduleItem[];
}

export const DataBackupExportModal: React.FC<DataBackupExportModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  inventory,
  tickets,
  receipts,
  requisitions,
  pmSchedules = []
}) => {
  if (!isOpen) return null;

  const handleExportFullBackup = () => {
    exportFullDatabaseBackupToExcel({
      vehicles,
      inventory,
      tickets,
      receipts,
      requisitions,
      pmSchedules
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                ศูนย์ส่งออกข้อมูล & สำรองฐานข้อมูล (Export & Backup Center)
              </h2>
              <p className="text-xs text-slate-300">
                ส่งออกข้อมูลทุกหมวดหมู่เป็น Excel (.xlsx) และ CSV หรือดาวน์โหลดสำรองรวมทั้งระบบ 6-in-1 ตามมาตรฐาน ISO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Master 6-in-1 Full Database Backup */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-md border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-emerald-300 shrink-0">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm text-emerald-200">
                    ดาวน์โหลดฐานข้อมูลเต็มรูปแบบ 6-in-1 (Full Master Excel)
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px]">
                    แนะนำ
                  </span>
                </div>
                <p className="text-emerald-100/80 text-[11px] mt-1 max-w-lg">
                  รวม 6 ชีตในไฟล์เดียว: สารระบบรถ (27 รายการ), แผน PM เดือน/ปี, คลังอะไหล่, ใบแจ้งซ่อม, ประวัติรับเข้าสต็อก (GR) และประวัติเบิกจ่าย (REQ) พร้อมรหัส ISO
                </p>
              </div>
            </div>
            <button
              onClick={handleExportFullBackup}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-extrabold text-xs shadow-lg flex items-center space-x-2 shrink-0 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>ดาวน์โหลด Master Backup (.xlsx)</span>
            </button>
          </div>

          {/* Section Divider */}
          <div className="flex items-center space-x-2 text-slate-400 font-semibold text-[11px]">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span>หรือเลือกส่งออกแยกตามหมวดหมู่</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Category-by-Category Export Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Vehicles */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">สารระบบทะเบียนรถ (27 รายการ)</div>
                  <div className="text-slate-500 text-[11px]">{vehicles.length} คัน • TNB-MT-REG-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportVehiclesToExcel(vehicles)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportVehiclesToCSV(vehicles)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น CSV (UTF-8)"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* 2. PM Plan */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">แผน PM รถ เดือน/ปี (Master Plan)</div>
                  <div className="text-slate-500 text-[11px]">{pmSchedules.length} แผน • TNB-MT-PLN-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportPMAnnualMatrixToExcel(vehicles, pmSchedules, 2026)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกตาราง 12 เดือน Matrix"
                >
                  <Download className="w-3 h-3" />
                  <span>Matrix</span>
                </button>
                <button
                  onClick={() => exportPMMonthlyScheduleToExcel(pmSchedules, 2026, 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกรายการแผนงาน Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* 3. Stock Parts */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-300">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">คลังอะไหล่และสต็อก</div>
                  <div className="text-slate-500 text-[11px]">{inventory.length} รายการ • TNB-MT-INV-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportInventoryToExcel(inventory)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportInventoryToCSV(inventory)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น CSV (UTF-8)"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* 4. Repair Tickets */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 border border-indigo-300">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">ประวัติใบแจ้งซ่อมทั้งหมด</div>
                  <div className="text-slate-500 text-[11px]">{tickets.length} ใบงาน • TNB-MT-WO-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportTicketsToExcel(tickets)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportTicketsToCSV(tickets)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น CSV (UTF-8)"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* 5. Goods Receipts */}
            <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-800 border border-cyan-300">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">ประวัติรับเข้าสต็อก (GR)</div>
                  <div className="text-slate-500 text-[11px]">{receipts.length} ใบรับ • TNB-MT-GR-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportReceiptsToExcel(receipts)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportReceiptsToCSV(receipts)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น CSV (UTF-8)"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* 6. Goods Requisitions */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300">
                  <PackageMinus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">ประวัติเบิกจ่ายพัสดุ (GI)</div>
                  <div className="text-slate-500 text-[11px]">{requisitions.length} ใบเบิก • TNB-MT-GI-001</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => exportRequisitionsToExcel(requisitions)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น Excel"
                >
                  <Download className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => exportRequisitionsToCSV(requisitions)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="ส่งออกเป็น CSV (UTF-8)"
                >
                  <FileText className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
