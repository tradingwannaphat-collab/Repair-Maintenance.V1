import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  History,
  Info, 
  Car, 
  Wrench, 
  Layers, 
  DollarSign, 
  Sparkles,
  Calendar,
  Check
} from "lucide-react";
import { RepairTicket, VehicleRecord } from "../types";
import { parseTicketsFile, downloadTicketTemplate, TicketImportResult } from "../utils/excelImportExport";
import { CATEGORIES_CONFIG, STATUS_CONFIG } from "../data/categories";

interface TicketImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingVehicles: VehicleRecord[];
  onImportTickets: (tickets: RepairTicket[], mode: "append" | "upsert" | "replace") => void;
}

export const TicketImportModal: React.FC<TicketImportModalProps> = ({
  isOpen,
  onClose,
  existingVehicles,
  onImportTickets
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<TicketImportResult | null>(null);
  const [importMode, setImportMode] = useState<"append" | "upsert" | "replace">("append");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setImportResult(null);

    try {
      const result = await parseTicketsFile(selectedFile, existingVehicles);
      setImportResult(result);
    } catch (err: any) {
      setImportResult({
        success: false,
        data: [],
        errors: [`เกิดข้อผิดพลาด: ${err.message || String(err)}`],
        rawCount: 0,
        summary: { totalTickets: 0, completedTickets: 0, totalCost: 0, vehiclesMatched: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult || !importResult.success || importResult.data.length === 0) return;
    onImportTickets(importResult.data, importMode);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                นำเข้าประวัติใบแจ้งซ่อมย้อนหลัง (Batch Import)
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
                  Excel / CSV
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                นำเข้าประวัติการซ่อมบำรุงในอดีตเพื่อเก็บสถิติ ยอดค่าใช้จ่าย และประวัติรถยนต์แบบสมบูรณ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* Download Template Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">ดาวน์โหลดฟอร์มตัวอย่างสำหรับลงประวัติซ่อมย้อนหลัง</h4>
                <p className="text-xs text-slate-500">
                  มีคอลัมน์มาตรฐานครบถ้วน เช่น เลขที่ใบแจ้งซ่อม, ทะเบียนรถ, วันที่แจ้ง, อาการเสีย, หมวดหมู่งาน, ค่าอะไหล่, ค่าแรง ฯลฯ
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadTicketTemplate("xlsx")}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>โหลดฟอร์ม Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadTicketTemplate("csv")}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>โหลด CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* File Upload Dropzone */}
          {!importResult && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
                {isLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isLoading ? "กำลังประมวลผลไฟล์..." : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) ที่มีข้อมูลใบแจ้งซ่อมย้อนหลัง
                </p>
              </div>
            </div>
          )}

          {/* Import Preview Results */}
          {importResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">จำนวนใบแจ้งซ่อมที่พบ</span>
                  <span className="text-xl font-black text-blue-600">{importResult.summary.totalTickets}</span>
                  <span className="text-[10px] text-slate-400 ml-1">รายการ</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">สถานะเสร็จสมบูรณ์แล้ว</span>
                  <span className="text-xl font-black text-emerald-600">{importResult.summary.completedTickets}</span>
                  <span className="text-[10px] text-slate-400 ml-1">รายการ</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">ยอดค่าใช้จ่ายรวม</span>
                  <span className="text-xl font-black text-amber-600">฿{importResult.summary.totalCost.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">ตรงกับสารระบบรถ TNB</span>
                  <span className="text-xl font-black text-indigo-600">{importResult.summary.vehiclesMatched}</span>
                  <span className="text-[10px] text-slate-400 ml-1">คัน</span>
                </div>
              </div>

              {/* Errors / Warnings */}
              {importResult.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ข้อควรระวังหรือแถวที่ข้าม ({importResult.errors.length} รายการ):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto pl-1">
                    {importResult.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li className="text-amber-700 font-semibold">...และอีก {importResult.errors.length - 5} รายการ</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">ตัวอย่างข้อมูลที่จะนำเข้า (5 รายการแรก)</span>
                  <span className="text-[11px] text-slate-500">ไฟล์: {file?.name}</span>
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-bold">เลขที่เอกสาร</th>
                        <th className="py-2 px-3 font-bold">ทะเบียน</th>
                        <th className="py-2 px-3 font-bold">วันที่แจ้ง</th>
                        <th className="py-2 px-3 font-bold">หมวดหมู่</th>
                        <th className="py-2 px-3 font-bold">อาการเสีย</th>
                        <th className="py-2 px-3 font-bold">สถานะ</th>
                        <th className="py-2 px-3 font-bold text-right">ค่าใช้จ่าย (฿)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importResult.data.slice(0, 6).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-semibold text-blue-600">{t.ticketNumber}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{t.licensePlate}</td>
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(t.createdAt).toLocaleDateString("th-TH")}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {CATEGORIES_CONFIG[t.category]?.nameTh || t.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 truncate max-w-xs">{t.symptoms}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              t.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              {STATUS_CONFIG[t.status]?.labelTh || t.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                            {(t.totalCost || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Mode Options */}
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">รูปแบบการนำเข้า:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer text-xs transition-colors ${
                    importMode === "append" ? "bg-blue-50 border-blue-400 text-blue-900 font-bold" : "bg-white border-slate-200 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span>เพิ่มต่อท้าย (Append Records)</span>
                      <span className="block text-[10px] font-normal text-slate-500">เพิ่มรายการใหม่เข้าไปโดยไม่กระทบของเดิม (แนะนำ)</span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer text-xs transition-colors ${
                    importMode === "upsert" ? "bg-blue-50 border-blue-400 text-blue-900 font-bold" : "bg-white border-slate-200 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="upsert"
                      checked={importMode === "upsert"}
                      onChange={() => setImportMode("upsert")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span>อัปเดตตามเลขที่เอกสาร (Upsert by Ticket No.)</span>
                      <span className="block text-[10px] font-normal text-slate-500">ถ้ามีเลขที่เอกสารซ้ำจะอัปเดต ถ้าไม่มีจะเพิ่มใหม่</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          {importResult ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              เลือกไฟล์อื่น
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>

            {importResult && importResult.success && importResult.data.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันนำเข้า {importResult.data.length} รายการ</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
