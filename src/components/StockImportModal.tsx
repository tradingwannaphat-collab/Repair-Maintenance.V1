import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Trash2, 
  Boxes, 
  RefreshCw,
  Info,
  Check
} from "lucide-react";
import { InventoryItem } from "../types";
import { parseInventoryFile, downloadInventoryTemplate } from "../utils/excelImportExport";
import { CATEGORIES_CONFIG } from "../data/categories";

interface StockImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportInventory: (items: InventoryItem[], mode: "upsert" | "append" | "replace") => void;
  currentCount: number;
}

export const StockImportModal: React.FC<StockImportModalProps> = ({
  isOpen,
  onClose,
  onImportInventory,
  currentCount
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    data: Partial<InventoryItem>[];
    errors: string[];
    rawCount: number;
  } | null>(null);
  const [importMode, setImportMode] = useState<"upsert" | "append" | "replace">("upsert");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    try {
      const result = await parseInventoryFile(selectedFile);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        success: false,
        data: [],
        errors: [`เกิดข้อผิดพลาดในการประมวลผล: ${err.message}`],
        rawCount: 0
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith(".xlsx") || 
        droppedFile.name.endsWith(".xls") || 
        droppedFile.name.endsWith(".csv")
      ) {
        handleFileProcess(droppedFile);
      } else {
        alert("กรุณาเลือกไฟล์นามสกุล .xlsx, .xls หรือ .csv เท่านั้น");
      }
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.data.length === 0) return;
    onImportInventory(parseResult.data as InventoryItem[], importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                นำเข้าข้อมูลคลังอะไหล่และสต็อก (Stock Inventory)
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-400 text-slate-950 font-bold">
                  Excel & CSV
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                รองรับไฟล์ตาราง Excel (.xlsx, .xls) และ CSV พร้อมจับคู่รหัสอะไหล่ หมวดหมู่ ราคา และจำนวนคงเหลือ
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Template Download Banner */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">ต้องการไฟล์ต้นแบบนำเข้าสต็อก (Template)?</div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  ดาวน์โหลดเทมเพลตมาตรฐานคลังอะไหล่ (รหัส, ชื่อ, หมวดหมู่, สเปก, สต็อก, ราคาทุน, ราคาเบิก, แร็คจัดเก็บ)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadInventoryTemplate("xlsx")}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>โหลด Template Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadInventoryTemplate("csv")}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template CSV</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!parseResult ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                  : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/80"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-1">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์รายการอะไหล่มาวางที่นี่
              </h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                รองรับไฟล์ตาราง <span className="font-semibold text-slate-700">.XLSX, .XLS, .CSV</span> ระบบจะอ่านข้อมูลรหัสอะไหล่, ชื่อ, หมวดหมู่, สต็อก, ราคาทุน, และตำแหน่งจัดเก็บโดยอัตโนมัติ
              </p>
              {isParsing && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังวิเคราะห์และแปลงไฟล์ข้อมูลสต็อก...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* File details bar */}
              <div className="bg-slate-100 rounded-xl p-3.5 flex items-center justify-between border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{file?.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      พบข้อมูลทั้งหมด {parseResult.rawCount} แถว • ผ่านการตรวจสอบ {parseResult.data.length} รายการ
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์ใหม่</span>
                </button>
              </div>

              {/* Errors / Warnings */}
              {parseResult.errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-800 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>แจ้งเตือน ({parseResult.errors.length} รายการ):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>ตัวอย่างรายการอะไหล่ที่พร้อมนำเข้า ({parseResult.data.length} รายการ)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">แสดงตัวอย่างแถวแรก</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">รหัสอะไหล่</th>
                        <th className="py-2 px-3">ชื่อรายการอะไหล่</th>
                        <th className="py-2 px-3">หมวดหมู่</th>
                        <th className="py-2 px-3">ยี่ห้อ</th>
                        <th className="py-2 px-3 text-right">จำนวน</th>
                        <th className="py-2 px-3 text-right">ราคาทุน (฿)</th>
                        <th className="py-2 px-3">ตำแหน่งแร็ค</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.data.slice(0, 15).map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-900">
                            {item.code}
                          </td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {CATEGORIES_CONFIG[item.category || "other"]?.name || item.category}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {item.brand || "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                            ฿{(item.unitCost || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {item.locationRack || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parseResult.data.length > 15 && (
                  <div className="text-center text-[11px] text-slate-400 mt-1">
                    ... และอีก {parseResult.data.length - 15} รายการ
                  </div>
                )}
              </div>

              {/* Import Mode Options */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <label className="block font-bold text-slate-900 text-xs">
                  เลือกรูปแบบการนำเข้าคลังสินค้า:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "upsert" ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="stockImportMode"
                      checked={importMode === "upsert"}
                      onChange={() => setImportMode("upsert")}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">อัปเดตรหัสเดิม / เพิ่มใหม่ (แนะนำ)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        หากพบรหัสอะไหล่ซ้ำจะอัปเดตสต็อกและราคา หากเป็นรหัสใหม่จะเพิ่มเข้าระบบ
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "append" ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="stockImportMode"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">เพิ่มต่อท้ายทั้งหมด (Append)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        นำเข้าทุกรายการต่อท้ายสต็อกปัจจุบัน {currentCount} รายการ
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "replace" ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="stockImportMode"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="font-bold text-rose-900 text-xs">แทนที่คลังทั้งหมด (Replace All)</div>
                      <div className="text-rose-600/80 text-[10px] mt-0.5">
                        ล้างรายการอะไหล่เดิม {currentCount} รายการ และแทนที่ด้วยไฟล์นี้
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ยกเลิก
          </button>

          {parseResult && parseResult.data.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-extrabold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center space-x-2 transition-all"
            >
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>ยืนยันการนำเข้า {parseResult.data.length} รายการ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
