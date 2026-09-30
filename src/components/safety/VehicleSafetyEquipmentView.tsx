import React, { useState, useMemo, useEffect } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Printer, 
  Upload, 
  PlusCircle, 
  Search, 
  Filter, 
  Truck, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Download, 
  Clock, 
  Check, 
  RotateCcw,
  Edit2,
  Trash2,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  Paperclip
} from "lucide-react";
import { 
  VehicleSafetyHandoverRecord, 
  VehicleRecord,
  VehicleSafetyItemTemplate,
  AppNavView 
} from "../../types";
import { 
  VEHICLE_SAFETY_ITEMS_TEMPLATE,
  SAFETY_TEMPLATES_STORAGE_KEY
} from "../../data/vehicleSafetyEquipmentData";
import { SafetyEquipmentMasterCatalog } from "./SafetyEquipmentMasterCatalog";
import { SafetyHandoverModal } from "./SafetyHandoverModal";
import { SafetyHandoverPrintModal } from "./SafetyHandoverPrintModal";
import { SafetyDocumentPreviewModal } from "./SafetyDocumentPreviewModal";
import { SafetyItemSvgIcon } from "./SafetyItemSvgIcon";

interface VehicleSafetyEquipmentViewProps {
  vehicles: VehicleRecord[];
  safetyHandovers: VehicleSafetyHandoverRecord[];
  onSaveHandover: (record: VehicleSafetyHandoverRecord) => void;
  onDeleteHandover: (id: string) => void;
  onNavigate?: (view: AppNavView) => void;
}

export const VehicleSafetyEquipmentView: React.FC<VehicleSafetyEquipmentViewProps> = ({
  vehicles,
  safetyHandovers,
  onSaveHandover,
  onDeleteHandover,
  onNavigate
}) => {
  // Current Sub-Tab
  const [activeTab, setActiveTab] = useState<"catalog" | "handovers" | "uploads">("catalog");

  // Editable Safety Equipment Templates (loaded from localStorage or default)
  const [safetyTemplates, setSafetyTemplates] = useState<VehicleSafetyItemTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(SAFETY_TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading safety templates from storage:", e);
    }
    return VEHICLE_SAFETY_ITEMS_TEMPLATE;
  });

  // Persist templates changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAFETY_TEMPLATES_STORAGE_KEY, JSON.stringify(safetyTemplates));
    } catch (e) {
      console.error("Error persisting safety templates to storage:", e);
    }
  }, [safetyTemplates]);

  const handleUpdateTemplatePrice = (templateId: string, newPrice: number) => {
    setSafetyTemplates((prev) =>
      prev.map((item) =>
        item.id === templateId ? { ...item, estimatedValueBaht: Math.max(0, newPrice) } : item
      )
    );
  };

  const handleUpdateTemplateDetail = (updated: VehicleSafetyItemTemplate) => {
    setSafetyTemplates((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleAddTemplate = (newTemplate: VehicleSafetyItemTemplate) => {
    setSafetyTemplates((prev) => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setSafetyTemplates((prev) => prev.filter((item) => item.id !== templateId));
  };

  const handleResetDefaultPrices = () => {
    if (window.confirm("คุณต้องการคืนค่าราคาและข้อมูลอุปกรณ์เซฟตี้กลับเป็นมาตรฐาน ISO เริ่มต้นใช่หรือไม่?")) {
      setSafetyTemplates(VEHICLE_SAFETY_ITEMS_TEMPLATE);
      try {
        localStorage.removeItem(SAFETY_TEMPLATES_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleSafetyHandoverRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<VehicleSafetyHandoverRecord | null>(null);
  const [printModalMode, setPrintModalMode] = useState<"filled" | "blank">("filled");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [previewDocRecord, setPreviewDocRecord] = useState<VehicleSafetyHandoverRecord | null>(null);

  // Filtered Handovers
  const filteredHandovers = useMemo(() => {
    return safetyHandovers.filter((rec) => {
      const matchSearch =
        rec.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.department && rec.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedVehicleType === "all" || rec.vehicleType === selectedVehicleType;
      
      let matchStatus = true;
      if (statusFilter === "has_upload") {
        matchStatus = !!rec.signedDocumentUpload;
      } else if (statusFilter === "no_upload") {
        matchStatus = !rec.signedDocumentUpload;
      } else if (statusFilter === "missing_items") {
        matchStatus = rec.items.some((i) => i.status === "missing");
      }

      return matchSearch && matchType && matchStatus;
    });
  }, [safetyHandovers, searchTerm, selectedVehicleType, statusFilter]);

  // Key KPI Metrics
  const metrics = useMemo(() => {
    const totalFleet = vehicles.length;
    const signedCount = safetyHandovers.length;
    const uploadedFileCount = safetyHandovers.filter((h) => !!h.signedDocumentUpload).length;
    
    // Total missing items needing compensation
    let missingItemsCount = 0;
    let missingItemsValue = 0;
    safetyHandovers.forEach((h) => {
      h.items.forEach((item) => {
        if (item.status === "missing") {
          missingItemsCount += item.quantity || 1;
          missingItemsValue += item.estimatedValueBaht * (item.quantity || 1);
        }
      });
    });

    return {
      totalFleet,
      signedCount,
      uploadedFileCount,
      complianceRate: totalFleet > 0 ? Math.min(100, Math.round((signedCount / totalFleet) * 100)) : 0,
      missingItemsCount,
      missingItemsValue
    };
  }, [vehicles, safetyHandovers]);

  // Open Handover Editor
  const handleOpenEdit = (rec: VehicleSafetyHandoverRecord) => {
    setEditingRecord(rec);
    setIsNewModalOpen(true);
  };

  // Open New Handover
  const handleOpenNew = () => {
    setEditingRecord(null);
    setIsNewModalOpen(true);
  };

  // Open Print Modal with specific record
  const handleOpenPrintRecord = (rec: VehicleSafetyHandoverRecord) => {
    setPrintingRecord(rec);
    setPrintModalMode("filled");
    setIsPrintModalOpen(true);
  };

  // Open Print Modal for Blank Template
  const handleOpenPrintBlank = () => {
    setPrintingRecord(null);
    setPrintModalMode("blank");
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ระบบใบเซ็นรับอุปกรณ์ความปลอดภัยประจำรถขนส่ง
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  TNB-SHE-FRM-012
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  รับผิดชอบชดใช้กรณีสูญหาย
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                ตรวจสอบอุปกรณ์ความปลอดภัยประจำรถ 10 รายการตามมาตรฐาน พร้อมจัดทำใบเซ็นรับมอบ ดาวน์โหลดแบบฟอร์ม PDF 
                และอัปโหลดหลักฐานลายมือชื่อพนักงานขับรถเข้าสู่ระบบ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenPrintBlank}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-slate-300 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>พิมพ์แบบฟอร์มเปล่า (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNew}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ออกใบเซ็นรับมอบใหม่</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>รถที่มีใบเซ็นรับมอบ</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{metrics.signedCount}</span>
              <span className="text-xs text-slate-500">/ {metrics.totalFleet} คัน ({metrics.complianceRate}%)</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200">
            <div className="text-xs font-bold text-purple-700 flex items-center gap-1.5 mb-1">
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>มีไฟล์หลักฐานอัปโหลด</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-900">{metrics.uploadedFileCount}</span>
              <span className="text-xs text-purple-600">ใบเซ็นรับตัวจริง</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>มาตรฐานอุปกรณ์ประจำรถ</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">{safetyTemplates.length}</span>
              <span className="text-xs text-emerald-600">
                รายการ (ชุดละ {safetyTemplates.reduce((sum, item) => sum + (item.estimatedValueBaht || 0), 0).toLocaleString()} บ.)
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>อุปกรณ์สูญหาย / ต้องชดใช้</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">{metrics.missingItemsCount}</span>
              <span className="text-xs text-amber-700">
                ชิ้น ({metrics.missingItemsValue.toLocaleString()} บ.)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "catalog"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. มาตรฐานอุปกรณ์ 10 รายการ (มีรูปตัวอย่าง)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("handovers")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "handovers"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. ทะเบียนใบเซ็นรับมอบรายคัน ({safetyHandovers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("uploads")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "uploads"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>3. เอกสารที่อัปโหลด & ตรวจสอบการสูญหาย ({metrics.uploadedFileCount})</span>
        </button>
      </div>

      {/* TAB 1: Master Catalog (Matching User's Uploaded Picture) */}
      {activeTab === "catalog" && (
        <SafetyEquipmentMasterCatalog
          templates={safetyTemplates}
          onUpdateTemplatePrice={handleUpdateTemplatePrice}
          onBatchUpdateTemplates={setSafetyTemplates}
          onUpdateTemplateDetail={handleUpdateTemplateDetail}
          onAddTemplate={handleAddTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onResetDefaultPrices={handleResetDefaultPrices}
          onOpenNewHandover={handleOpenNew}
          onOpenPrintBlankForm={handleOpenPrintBlank}
        />
      )}

      {/* TAB 2: Handover Ledger & Records */}
      {activeTab === "handovers" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาทะเบียน, ชื่อคนขับ, เลขที่เอกสาร..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="has_upload">✅ มีไฟล์อัปโหลดแล้ว</option>
                  <option value="no_upload">⏳ ยังไม่ได้อัปโหลดไฟล์</option>
                  <option value="missing_items">⚠️ มีอุปกรณ์สูญหาย</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenNew}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ออกใบเซ็นรับใหม่</span>
              </button>
            </div>
          </div>

          {/* Handovers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3">เลขที่เอกสาร</th>
                    <th className="py-3 px-3">ทะเบียนรถ / ยี่ห้อ</th>
                    <th className="py-3 px-3">พนักงานขับรถ (ผู้รับมอบ)</th>
                    <th className="py-3 px-3">วันที่ส่งมอบ</th>
                    <th className="py-3 px-3 text-center">อุปกรณ์ที่รับมอบ</th>
                    <th className="py-3 px-3 text-center">สัญญาชดใช้</th>
                    <th className="py-3 px-3 text-center">ไฟล์หลักฐาน</th>
                    <th className="py-3 px-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHandovers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <div>ไม่พบรายการใบเซ็นรับมอบอุปกรณ์ตามเงื่อนไข</div>
                      </td>
                    </tr>
                  ) : (
                    filteredHandovers.map((rec) => {
                      const receivedItems = rec.items.filter((i) => i.status === "received").length;
                      const missingItems = rec.items.filter((i) => i.status === "missing");
                      const hasMissing = missingItems.length > 0;
                      const hasUpload = !!rec.signedDocumentUpload;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Document Number */}
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">
                            {rec.documentNumber}
                          </td>

                          {/* Vehicle Plate & Info */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                              <span>{rec.licensePlate}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {rec.vehicleBrand} {rec.vehicleModel}
                            </div>
                          </td>

                          {/* Driver Name */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>{rec.driverName}</span>
                            </div>
                            {rec.driverPhone && (
                              <div className="text-[11px] text-slate-500 font-mono">
                                📞 {rec.driverPhone}
                              </div>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-slate-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{new Date(rec.handoverDate).toLocaleDateString("th-TH")}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ไมล์: {rec.currentMileage ? `${rec.currentMileage.toLocaleString()} กม.` : "-"}
                            </div>
                          </td>

                          {/* Received items status */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <span>{receivedItems} / {rec.items.length} รายการ</span>
                            </div>
                            {hasMissing && (
                              <div className="mt-1 text-[10px] text-rose-700 font-bold">
                                ⚠️ สูญหาย {missingItems.length} ชิ้น
                              </div>
                            )}
                          </td>

                          {/* Liability clause accepted */}
                          <td className="py-3 px-3 text-center">
                            {rec.liabilityAgreementAccepted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>ยินยอมชดใช้</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-rose-600 font-bold">
                                ไม่ยินยอม
                              </span>
                            )}
                          </td>

                          {/* Uploaded File */}
                          <td className="py-3 px-3 text-center">
                            {hasUpload ? (
                              <button
                                type="button"
                                onClick={() => setPreviewDocRecord(rec)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold transition-colors"
                                title="คลิกเพื่อดูไฟล์ที่อัปโหลด"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>มีเอกสารแนบ</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(rec)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-purple-600 underline"
                              >
                                <Upload className="w-3 h-3" />
                                <span>อัปโหลด</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPrintRecord(rec)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                title="พิมพ์ / ดาวน์โหลด PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(rec)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                                title="แก้ไขข้อมูล / อัปโหลดไฟล์"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`คุณต้องการลบใบเซ็นรับ ${rec.documentNumber} (${rec.licensePlate}) ใช่หรือไม่?`)) {
                                    onDeleteHandover(rec.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                title="ลบรายการ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Uploaded Signed Files & Audit Log */}
      {activeTab === "uploads" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  <span>คลังเอกสารใบเซ็นรับและหลักฐานตัวจริงที่อัปโหลดเข้าระบบ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  พนักงานขับรถได้เซ็นชื่อรับผิดชอบชดใช้ค่าเสียหาย พร้อมแนบไฟล์ PDF หรือภาพถ่ายตัวจริง
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNew}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>อัปโหลดใบเซ็นรับใหม่</span>
              </button>
            </div>

            {/* Uploaded Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safetyHandovers
                .filter((h) => !!h.signedDocumentUpload)
                .map((rec) => {
                  const doc = rec.signedDocumentUpload!;
                  const isImg = doc.dataUrl.startsWith("data:image");

                  return (
                    <div 
                      key={rec.id}
                      className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-purple-300 p-4 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                            {rec.documentNumber}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(doc.uploadedAt).toLocaleDateString("th-TH")}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span>ทะเบียน {rec.licensePlate}</span>
                          </h4>
                          <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>พนักงาน: {rec.driverName}</span>
                          </div>
                        </div>

                        {/* Thumbnail preview if image */}
                        <div 
                          onClick={() => setPreviewDocRecord(rec)}
                          className="mt-3 h-32 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {isImg ? (
                            <img
                              src={doc.dataUrl}
                              alt={doc.fileName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-3">
                              <FileText className="w-10 h-10 text-red-500 mx-auto mb-1" />
                              <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                                {doc.fileName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                PDF Document ({(doc.fileSize / 1024).toFixed(0)} KB)
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setPreviewDocRecord(rec)}
                          className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>เปิดดูเอกสาร</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPrintRecord(rec)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>พิมพ์ฟอร์ม</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {metrics.uploadedFileCount === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Upload className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <div className="font-bold text-slate-700">ยังไม่มีการอัปโหลดไฟล์หลักฐานใบเซ็นรับ</div>
                <p className="text-xs text-slate-500 mt-1">
                  เมื่อพนักงานขับรถเซ็นชื่อบนกระดาษ สามารถถ่ายรูปแล้วอัปโหลดเข้ามาเก็บเป็นหลักฐานได้ทันที
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <SafetyHandoverModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={onSaveHandover}
        vehicles={vehicles}
        initialRecord={editingRecord}
        templates={safetyTemplates}
      />

      <SafetyHandoverPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={printingRecord}
        vehicle={vehicles.find((v) => v.id === printingRecord?.vehicleId) || null}
        mode={printModalMode}
        templates={safetyTemplates}
      />

      <SafetyDocumentPreviewModal
        isOpen={!!previewDocRecord}
        onClose={() => setPreviewDocRecord(null)}
        record={previewDocRecord}
      />
    </div>
  );
};
