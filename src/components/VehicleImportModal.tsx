import React, { useState, useRef, useMemo } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Trash2, 
  ArrowRight, 
  Truck, 
  RefreshCw,
  Info,
  Check,
  ShieldAlert,
  Layers,
  Sparkles,
  AlertCircle,
  Copy
} from "lucide-react";
import { VehicleRecord } from "../types";
import { parseVehicleFile, downloadVehicleTemplate, normalizeLicensePlate } from "../utils/excelImportExport";
import { VEHICLE_TYPE_LABELS } from "../data/categories";

interface VehicleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportVehicles: (vehicles: VehicleRecord[], mode: "append" | "upsert" | "replace") => void;
  currentCount: number;
  existingVehicles?: VehicleRecord[];
}

export const VehicleImportModal: React.FC<VehicleImportModalProps> = ({
  isOpen,
  onClose,
  onImportVehicles,
  currentCount,
  existingVehicles = []
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    data: (Partial<VehicleRecord> & { _isDuplicateInFile?: boolean; _fileDuplicateWithRow?: number; _originalRowNum?: number })[];
    errors: string[];
    rawCount: number;
    fileDuplicateCount: number;
    duplicatePlatesSummary: {
      normalizedPlate: string;
      originalPlate: string;
      count: number;
      firstRowNum: number;
    }[];
  } | null>(null);

  const [importMode, setImportMode] = useState<"upsert" | "append" | "replace">("upsert");
  const [isDragging, setIsDragging] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<"all" | "new" | "system_dup" | "file_dup">("all");
  const [autoDeduplicateFile, setAutoDeduplicateFile] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map existing vehicles by normalized license plate
  const existingPlateMap = useMemo(() => {
    const map = new Map<string, VehicleRecord>();
    existingVehicles.forEach(v => {
      const norm = normalizeLicensePlate(v.licensePlate);
      if (norm) map.set(norm, v);
    });
    return map;
  }, [existingVehicles]);

  // Analyze parsed rows against existing database
  const analyzedRows = useMemo(() => {
    if (!parseResult || !parseResult.data) return [];
    return parseResult.data.map((row, idx) => {
      const norm = normalizeLicensePlate(row.licensePlate || "");
      const matchingSystemVehicle = norm ? existingPlateMap.get(norm) : undefined;
      const isSystemDup = !!matchingSystemVehicle;
      const isFileDup = !!row._isDuplicateInFile;
      const isNew = !isSystemDup && !isFileDup;
      return {
        ...row,
        _idx: idx,
        _isSystemDup: isSystemDup,
        _matchingSystemVehicle: matchingSystemVehicle,
        _isFileDup: isFileDup,
        _isNew: isNew
      };
    });
  }, [parseResult, existingPlateMap]);

  // Statistical calculations
  const stats = useMemo(() => {
    const total = analyzedRows.length;
    const newCount = analyzedRows.filter(r => r._isNew).length;
    const systemDupCount = analyzedRows.filter(r => r._isSystemDup).length;
    const fileDupCount = analyzedRows.filter(r => r._isFileDup).length;
    return { total, newCount, systemDupCount, fileDupCount };
  }, [analyzedRows]);

  // Filtered rows for preview table
  const displayedRows = useMemo(() => {
    if (previewFilter === "new") return analyzedRows.filter(r => r._isNew);
    if (previewFilter === "system_dup") return analyzedRows.filter(r => r._isSystemDup);
    if (previewFilter === "file_dup") return analyzedRows.filter(r => r._isFileDup);
    return analyzedRows;
  }, [analyzedRows, previewFilter]);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    try {
      const result = await parseVehicleFile(selectedFile);
      setParseResult(result);
      setPreviewFilter("all");
    } catch (err: any) {
      setParseResult({
        success: false,
        data: [],
        errors: [`เกิดข้อผิดพลาดในการประมวลผล: ${err.message}`],
        rawCount: 0,
        fileDuplicateCount: 0,
        duplicatePlatesSummary: []
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

    let finalVehicles = parseResult.data;

    // If auto-deduplicate file is active, keep unique plates (latest row wins)
    if (autoDeduplicateFile && parseResult.fileDuplicateCount > 0) {
      const plateMap = new Map<string, any>();
      parseResult.data.forEach(v => {
        const norm = normalizeLicensePlate(v.licensePlate || "");
        if (norm) {
          plateMap.set(norm, v);
        }
      });
      finalVehicles = Array.from(plateMap.values());
    }

    onImportVehicles(finalVehicles as VehicleRecord[], importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setPreviewFilter("all");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                นำเข้าข้อมูลสารระบบทะเบียนรถ (พร้อมระบบตรวจสอบทะเบียนซ้ำ)
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                  Excel & CSV
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                ระบบจะตรวจสอบเลขทะเบียนซ้ำซ้อน ทั้งภายในไฟล์ และเทียบกับทะเบียนที่มีอยู่ในระบบ
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
          <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">ต้องการไฟล์ต้นแบบ (Template) หรือไม่?</div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  ดาวน์โหลดเทมเพลตมาตรฐาน 27 คอลัมน์พร้อมตัวอย่างข้อมูล เพื่อนำไปกรอกข้อมูลรถของท่าน
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadVehicleTemplate("xlsx")}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>โหลด Template Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadVehicleTemplate("csv")}
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
                  ? "border-amber-500 bg-amber-500/10 scale-[1.01]" 
                  : "border-slate-300 hover:border-amber-500 hover:bg-slate-50/80"
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
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-1">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                รองรับไฟล์ตารางข้อมูลรถยนต์ขนส่ง <span className="font-semibold text-slate-700">.XLSX, .XLS, .CSV</span> ระบบจะอ่านข้อมูลทะเบียน, No. ERP, ยี่ห้อ, คัสซี, ภาษี, พรบ., ประกันภัย, GPS และตรวจสอบความซ้ำซ้อนให้อัตโนมัติ
              </p>
              {isParsing && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังวิเคราะห์และตรวจสอบความถูกต้องของข้อมูล...</span>
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
                      พบข้อมูลทั้งหมด {parseResult.rawCount} แถว • ผ่านการอ่านข้อมูล {parseResult.data.length} รายการ
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

              {/* DUPLICATE VALIDATION SUMMARY CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total */}
                <button
                  type="button"
                  onClick={() => setPreviewFilter("all")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === "all"
                      ? "border-slate-800 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>รายการทั้งหมด</span>
                  </div>
                  <div className="text-xl font-black mt-1">{stats.total} <span className="text-xs font-normal opacity-80">คัน</span></div>
                  <div className="text-[10px] opacity-70 mt-0.5">ในไฟล์ที่อัปโหลด</div>
                </button>

                {/* New Vehicles */}
                <button
                  type="button"
                  onClick={() => setPreviewFilter("new")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === "new"
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-90 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ทะเบียนใหม่ (ไม่ซ้ำ)</span>
                  </div>
                  <div className="text-xl font-black mt-1">{stats.newCount} <span className="text-xs font-normal opacity-80">คัน</span></div>
                  <div className="text-[10px] opacity-80 mt-0.5">พร้อมเพิ่มเข้าระบบ</div>
                </button>

                {/* System Duplicates */}
                <button
                  type="button"
                  onClick={() => setPreviewFilter("system_dup")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === "system_dup"
                      ? "border-amber-600 bg-amber-600 text-white shadow-xs"
                      : "border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-900"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-90 flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" />
                    <span>พบในระบบแล้ว (ซ้ำ)</span>
                  </div>
                  <div className="text-xl font-black mt-1">{stats.systemDupCount} <span className="text-xs font-normal opacity-80">คัน</span></div>
                  <div className="text-[10px] opacity-80 mt-0.5">ตรงกับรถเดิมในระบบ ({currentCount} คัน)</div>
                </button>

                {/* In-File Duplicates */}
                <button
                  type="button"
                  onClick={() => setPreviewFilter("file_dup")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === "file_dup"
                      ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                      : "border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 text-rose-900"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-90 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ซ้ำกันเองในไฟล์</span>
                  </div>
                  <div className="text-xl font-black mt-1">{stats.fileDupCount} <span className="text-xs font-normal opacity-80">รายการ</span></div>
                  <div className="text-[10px] opacity-80 mt-0.5">{stats.fileDupCount > 0 ? "ตรวจพบแถวซ้ำ" : "ไม่พบทะเบียนซ้ำ"}</div>
                </button>
              </div>

              {/* DUPLICATE WARNING BANNERS */}
              {stats.fileDupCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-950">
                        ตรวจพบทะเบียนซ้ำกันเองในไฟล์ {stats.fileDupCount} รายการ!
                      </div>
                      <div className="text-rose-700 text-[11px] mt-0.5">
                        มีเลขทะเบียนที่ถูกกรอกซ้ำมากกว่า 1 แถวในไฟล์นี้ แนะนำให้เปิดตัวเลือก "ตัดรายการซ้ำออกอัตโนมัติ"
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs shrink-0">
                    <input
                      type="checkbox"
                      checked={autoDeduplicateFile}
                      onChange={(e) => setAutoDeduplicateFile(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-bold text-rose-900 text-xs">
                      ตัดแถวซ้ำออกอัตโนมัติ (เก็บแถวล่าสุด)
                    </span>
                  </label>
                </div>
              )}

              {stats.systemDupCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-950">
                      ตรวจพบ {stats.systemDupCount} คันที่มีเลขทะเบียนตรงกับรถในระบบแล้ว
                    </div>
                    <div className="text-amber-800 text-[11px] mt-0.5">
                      หากเลือกโหมด <span className="font-bold underline">อัปเดตทะเบียนเดิม / เพิ่มใหม่ (Upsert)</span> ระบบจะอัปเดตข้อมูล 27 รายการให้รถคันเดิมโดยไม่สร้างทะเบียนซ้ำซ้อน
                    </div>
                  </div>
                </div>
              )}

              {/* Errors / Parsing Warnings */}
              {parseResult.errors.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>รายงานผลการตรวจสอบข้อมูล ({parseResult.errors.length} รายการ):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
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
                    <span>ตารางตรวจสอบข้อมูลก่อนนำเข้า ({displayedRows.length} คัน)</span>
                    {previewFilter !== "all" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                        {previewFilter === "new" ? "เฉพาะทะเบียนใหม่" : previewFilter === "system_dup" ? "เฉพาะที่พบในระบบ" : "เฉพาะที่ซ้ำในไฟล์"}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">กรองดู:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter("all")}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${previewFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      ทั้งหมด ({stats.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter("new")}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${previewFilter === "new" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                    >
                      ทะเบียนใหม่ ({stats.newCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter("system_dup")}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${previewFilter === "system_dup" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                    >
                      ซ้ำกับระบบ ({stats.systemDupCount})
                    </button>
                    {stats.fileDupCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewFilter("file_dup")}
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${previewFilter === "file_dup" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
                      >
                        ซ้ำในไฟล์ ({stats.fileDupCount})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-2.5 text-center w-12">แถว</th>
                        <th className="py-2.5 px-3">สถานะตรวจสอบ</th>
                        <th className="py-2.5 px-3">ทะเบียนรถ</th>
                        <th className="py-2.5 px-2.5 text-center w-12">ERP</th>
                        <th className="py-2.5 px-3">ประกอบการ</th>
                        <th className="py-2.5 px-3">ยี่ห้อ / รุ่น</th>
                        <th className="py-2.5 px-3">ประเภท</th>
                        <th className="py-2.5 px-3">วันหมดภาษี</th>
                        <th className="py-2.5 px-3">ประกันภัยรถ</th>
                        <th className="py-2.5 px-3">GPS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.map((v, i) => (
                        <tr 
                          key={i} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            v._isFileDup 
                              ? "bg-rose-50/40" 
                              : v._isSystemDup 
                              ? "bg-amber-50/30" 
                              : ""
                          }`}
                        >
                          <td className="py-2 px-2.5 text-center font-mono text-slate-400 text-[10px]">
                            {v._originalRowNum || i + 1}
                          </td>
                          <td className="py-2 px-3">
                            {v._isFileDup ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                                ซ้ำในไฟล์ (แถว #{v._fileDuplicateWithRow})
                              </span>
                            ) : v._isSystemDup ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200" title={`ตรงกับรถเดิม: ${v._matchingSystemVehicle?.licensePlate} (ERP: ${v._matchingSystemVehicle?.erpNo || "-"})`}>
                                <Copy className="w-3 h-3 mr-1 text-amber-600" />
                                มีในระบบแล้ว (ERP {v._matchingSystemVehicle?.erpNo || "-"})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                ทะเบียนใหม่
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-black text-slate-900">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono text-[11px]">
                              {v.licensePlate}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-amber-900 bg-amber-50/50">
                            {v.erpNo || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{v.carrierCompany || "TNB"}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {v.vehicleBrand} {v.vehicleModel}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {VEHICLE_TYPE_LABELS[v.vehicleType || "tractor_10w"] || v.vehicleType}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono">
                            {v.taxExpiryDate || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[110px]">
                            {v.vehicleInsuranceCompany || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-semibold">
                            {v.gpsProvider || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Mode Options */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <label className="block font-bold text-slate-900 text-xs">
                  เลือกรูปแบบการบันทึกข้อมูลเข้าระบบ:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "upsert" ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "upsert"}
                      onChange={() => setImportMode("upsert")}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">อัปเดตทะเบียนเดิม / เพิ่มใหม่ (แนะนำ)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        หากพบเลขทะเบียนซ้ำจะอัปเดตข้อมูล 27 รายการให้รถเดิม ({stats.systemDupCount} คัน) และเพิ่มคันใหม่ ({stats.newCount} คัน)
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "append" ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">เพิ่มต่อท้ายทั้งหมด (Append)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        {stats.systemDupCount > 0 ? (
                          <span className="text-amber-700 font-semibold">
                            ⚠️ มี {stats.systemDupCount} ทะเบียนที่ซ้ำกับระบบแล้ว จะถูกเพิ่มซ้ำเป็นแถวใหม่
                          </span>
                        ) : (
                          `นำเข้าทุกแถวเข้ามาต่อท้ายรายการเดิมในระบบ ปัจจุบันมี ${currentCount} คัน`
                        )}
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    importMode === "replace" ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="font-bold text-rose-900 text-xs">แทนที่ทั้งหมด (Replace All)</div>
                      <div className="text-rose-600/80 text-[10px] mt-0.5">
                        ล้างข้อมูลรถเดิม {currentCount} คัน และแทนที่ด้วยรายการในไฟล์ใหม่นี้ทั้งหมด
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
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                {stats.fileDupCount > 0 && autoDeduplicateFile 
                  ? `(หลังตัดซ้ำเหลือ ${parseResult.data.length - stats.fileDupCount} คัน)` 
                  : `(ทั้งหมด ${parseResult.data.length} คัน)`}
              </span>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md flex items-center space-x-2 transition-all"
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>
                  ยืนยันการนำเข้า {stats.fileDupCount > 0 && autoDeduplicateFile ? parseResult.data.length - stats.fileDupCount : parseResult.data.length} คัน
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

