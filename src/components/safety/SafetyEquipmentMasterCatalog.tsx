import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  PlusCircle, 
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Tag,
  Check, 
  Minus, 
  Info, 
  Pencil, 
  RotateCcw, 
  Save, 
  DollarSign, 
  Sparkles, 
  X, 
  AlertCircle,
  TrendingUp,
  Percent,
  FileSpreadsheet,
  History,
  Calendar,
  Layers,
  HelpCircle,
  FileText
} from "lucide-react";
import { VehicleSafetyItemTemplate } from "../../types";
import { VEHICLE_SAFETY_ITEMS_TEMPLATE } from "../../data/vehicleSafetyEquipmentData";
import { SafetyItemSvgIcon } from "./SafetyItemSvgIcon";

const REVISION_STORAGE_KEY = "TNB_SAFETY_PRICE_REVISION_INFO";

export interface PriceRevisionInfo {
  revisionNo: string;
  effectiveDate: string;
  reasonNote: string;
  updatedAt: string;
}

// 1-Click Quick Presets for Adding Safety Equipment
export const COMMON_SAFETY_PRESETS = [
  {
    nameTh: "กล่องปฐมพยาบาลเบื้องต้น",
    nameEn: "First Aid Kit",
    standardQty: 1,
    unit: "ชุด",
    purpose: "ปฐมพยาบาลเบื้องต้นเมื่อเกิดอุบัติเหตุหรือบาดเจ็บระหว่างปฏิบัติงานขนส่ง",
    estimatedValueBaht: 450,
    specNote: "มีชุดทำแผล ผ้าก๊อซ แอลกอฮอล์ ยาพื้นฐานครบตามมาตรฐาน จป.",
    itemCode: "SEC-11",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "เสื้อกั๊กสะท้อนแสงนิรภัย",
    nameEn: "High-Visibility Safety Vest",
    standardQty: 1,
    unit: "ตัว",
    purpose: "สวมใส่เมื่อลงจากรถในพื้นที่คลังสินค้า จุดจอด หรือข้างทางเวลากลางคืน",
    estimatedValueBaht: 250,
    specNote: "ผ้าตาข่ายสีเขียวสะท้อนแสง มีแถบสะท้อนแสงมาตรฐาน EN ISO 20471",
    itemCode: "SEC-12",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "หมวกนิรภัยเซฟตี้",
    nameEn: "Safety Hard Hat",
    standardQty: 1,
    unit: "ใบ",
    purpose: "ป้องกันศีรษะจากของตกกระแทกขณะปฏิบัติงานในพื้นที่คลังสินค้า/โรงงานลูกค้า",
    estimatedValueBaht: 380,
    specNote: "มาตรฐาน มอก. 368-2554 รองในปรับหมุน พร้อมสายรัดคาง",
    itemCode: "SEC-13",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "ผ้าห่มกันไฟฉุกเฉิน",
    nameEn: "Fire Blanket",
    standardQty: 1,
    unit: "ผืน",
    purpose: "ดับไฟขนาดเล็กหรือคลุมตัวหนีไฟในกรณีเกิดเพลิงไหม้ฉับพลัน",
    estimatedValueBaht: 550,
    specNote: "ขนาด 1.2 x 1.8 เมตร ใยแก้วทนไฟ มาตรฐาน EN 1869",
    itemCode: "SEC-14",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: false }
  },
  {
    nameTh: "แว่นตานิรภัยเซฟตี้",
    nameEn: "Safety Glasses / Goggles",
    standardQty: 1,
    unit: "อัน",
    purpose: "ป้องกันสะเก็ด ฝุ่น หรือสารเคมีกระเด็นเข้าตาระหว่างตรวจเช็ครถหรือลงสินค้า",
    estimatedValueBaht: 180,
    specNote: "เลนส์ Polycarbonate ใส กันฝ้าและรอยขีดข่วน มาตรฐาน ANSI Z87.1",
    itemCode: "SEC-15",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "ค้อนทุบกระจกพร้อมมีดตัดสายเบลท์",
    nameEn: "Emergency Hammer & Belt Cutter",
    standardQty: 1,
    unit: "อัน",
    purpose: "ใช้ทุบกระจกห้องโดยสารและตัดสายเข็มขัดนิรภัยเพื่อหนีออกจากตัวรถเมื่อเกิดอุบัติเหตุ",
    estimatedValueBaht: 220,
    specNote: "หัวค้อนเหล็กกล้า Tungsten มีใบมีดซ่อนป้องกันการบาดมือ",
    itemCode: "SEC-16",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "กล่องเครื่องมือประจำรถ",
    nameEn: "Vehicle Emergency Tool Box",
    standardQty: 1,
    unit: "กล่อง",
    purpose: "ใช้ซ่อมแซมและแก้ไขปัญหาเฉพาะหน้าฉุกเฉินระหว่างเดินทาง",
    estimatedValueBaht: 850,
    specNote: "ชุดประแจ คีม ไขควง เทปพันสายไฟ ฟิวส์สำรอง",
    itemCode: "SEC-17",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "เกจวัดแรงดันลมยาง",
    nameEn: "Tyre Pressure Gauge",
    standardQty: 1,
    unit: "อัน",
    purpose: "ตรวจเช็คแรงดันลมยางก่อนออกเดินทางตามรอบตรวจสอบ Pre-Trip",
    estimatedValueBaht: 320,
    specNote: "เกจวัดแบบเข็มหรือดิจิตอล รองรับแรงดันสูงสุด 150-160 PSI",
    itemCode: "SEC-18",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  },
  {
    nameTh: "ชุดดูดซับสารเคมีและน้ำมันรั่วไหล",
    nameEn: "Spill Kit",
    standardQty: 1,
    unit: "ชุด",
    purpose: "ควบคุมและดูดซับน้ำมันหรือสารเคมีหกรั่วไหลไม่ให้ปนเปื้อนสิ่งแวดล้อม",
    estimatedValueBaht: 1200,
    specNote: "แผ่นซับน้ำมัน ทุ่นกั้น ถุงขยะอันตราย ถุงมือไนไตรล์",
    itemCode: "SEC-19",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: false }
  },
  {
    nameTh: "ถุงมือหนังนิรภัยสำหรับงานหนัก",
    nameEn: "Heavy Duty Leather Work Gloves",
    standardQty: 1,
    unit: "คู่",
    purpose: "ป้องกันมือจากการบาด เจาะ หรือสัมผัสพื้นผิวร้อน/คม ระหว่างต่อพ่วงหรือตรวจเช็ครถ",
    estimatedValueBaht: 160,
    specNote: "หนังแท้ทนความร้อน เสริมฝ่ามือสองชั้น",
    itemCode: "SEC-20",
    vehicleTypes: { sixTenWheel: true, tractor: true, pickup: true }
  }
];

export interface SafetyEquipmentMasterCatalogProps {
  templates: VehicleSafetyItemTemplate[];
  onUpdateTemplatePrice: (templateId: string, newPrice: number) => void;
  onBatchUpdateTemplates?: (templates: VehicleSafetyItemTemplate[]) => void;
  onUpdateTemplateDetail?: (template: VehicleSafetyItemTemplate) => void;
  onAddTemplate?: (newTemplate: VehicleSafetyItemTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onResetDefaultPrices: () => void;
  onOpenNewHandover: () => void;
  onOpenPrintBlankForm: () => void;
}

export const SafetyEquipmentMasterCatalog: React.FC<SafetyEquipmentMasterCatalogProps> = ({
  templates,
  onUpdateTemplatePrice,
  onBatchUpdateTemplates,
  onUpdateTemplateDetail,
  onAddTemplate,
  onDeleteTemplate,
  onResetDefaultPrices,
  onOpenNewHandover,
  onOpenPrintBlankForm
}) => {
  // Toggle for quick inline batch price editing mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Tools Modal (Batch adjustments, revision declaration, historical policy)
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);

  // Add Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemNameTh, setNewItemNameTh] = useState<string>("");
  const [newItemNameEn, setNewItemNameEn] = useState<string>("");
  const [newItemCode, setNewItemCode] = useState<string>("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>("อัน");
  const [newItemPrice, setNewItemPrice] = useState<number>(350);
  const [newItemPurpose, setNewItemPurpose] = useState<string>("");
  const [newItemSpecNote, setNewItemSpecNote] = useState<string>("");
  const [newItemVehicleTypes, setNewItemVehicleTypes] = useState({
    sixTenWheel: true,
    tractor: true,
    pickup: true
  });
  const [newItemImageUrl, setNewItemImageUrl] = useState<string>("");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Single item edit modal state
  const [editModalItem, setEditModalItem] = useState<VehicleSafetyItemTemplate | null>(null);
  const [modalNameTh, setModalNameTh] = useState<string>("");
  const [modalNameEn, setModalNameEn] = useState<string>("");
  const [modalItemCode, setModalItemCode] = useState<string>("");
  const [modalUnit, setModalUnit] = useState<string>("อัน");
  const [modalPrice, setModalPrice] = useState<number>(0);
  const [modalQty, setModalQty] = useState<number>(1);
  const [modalSpecNote, setModalSpecNote] = useState<string>("");
  const [modalPurpose, setModalPurpose] = useState<string>("");
  const [modalVehicleTypes, setModalVehicleTypes] = useState({
    sixTenWheel: true,
    tractor: true,
    pickup: true
  });
  const [modalImageUrl, setModalImageUrl] = useState<string>("");

  // Revision state
  const [revisionInfo, setRevisionInfo] = useState<PriceRevisionInfo>(() => {
    try {
      const saved = localStorage.getItem(REVISION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      revisionNo: "Rev. 02/2569",
      effectiveDate: "2026-09-01",
      reasonNote: "ปรับปรุงราคากลางตามมาตรฐานความปลอดภัย TNB-SHE-FRM-012 ประจำรอบปี 2569",
      updatedAt: new Date().toISOString()
    };
  });

  // Batch adjust percentage
  const [percentChange, setPercentChange] = useState<number>(5);
  const [roundToNearest10, setRoundToNearest10] = useState<boolean>(true);

  // Total value calculation
  const totalStandardKitValue = templates.reduce((sum, item) => sum + (item.estimatedValueBaht || 0), 0);

  const getNextItemCode = () => {
    let maxNum = 10;
    templates.forEach((t) => {
      const match = t.itemCode.match(/SEC-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `SEC-${String(maxNum + 1).padStart(2, "0")}`;
  };

  const handleOpenAddModal = () => {
    const nextCode = getNextItemCode();
    setNewItemNameTh("");
    setNewItemNameEn("");
    setNewItemCode(nextCode);
    setNewItemQty(1);
    setNewItemUnit("อัน");
    setNewItemPrice(350);
    setNewItemPurpose("");
    setNewItemSpecNote("");
    setNewItemVehicleTypes({ sixTenWheel: true, tractor: true, pickup: true });
    setNewItemImageUrl("");
    setSelectedPresetIndex(null);
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const handleSelectPreset = (index: number) => {
    const preset = COMMON_SAFETY_PRESETS[index];
    if (!preset) return;
    setSelectedPresetIndex(index);
    setNewItemNameTh(preset.nameTh);
    setNewItemNameEn(preset.nameEn);
    
    // Check if code is already used, if so pick next available
    const isCodeUsed = templates.some((t) => t.itemCode.toUpperCase() === preset.itemCode.toUpperCase());
    setNewItemCode(isCodeUsed ? getNextItemCode() : preset.itemCode);
    
    setNewItemQty(preset.standardQty);
    setNewItemUnit(preset.unit);
    setNewItemPrice(preset.estimatedValueBaht);
    setNewItemPurpose(preset.purpose);
    setNewItemSpecNote(preset.specNote);
    setNewItemVehicleTypes({ ...preset.vehicleTypes });
    setNewItemImageUrl("");
    setAddError(null);
  };

  const handleImageUpload = (file: File, isEdit: boolean = false) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาเลือกไฟล์ไม่เกิน 2.5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (isEdit) {
        setModalImageUrl(dataUrl);
      } else {
        setNewItemImageUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameTh.trim()) {
      setAddError("กรุณาระบุชื่ออุปกรณ์ภาษาไทย");
      return;
    }

    const codeToUse = newItemCode.trim() || getNextItemCode();
    // Verify uniqueness
    const exists = templates.some((t) => t.itemCode.toUpperCase() === codeToUse.toUpperCase());
    if (exists) {
      setAddError(`รหัสอุปกรณ์ "${codeToUse}" มีอยู่ในระบบแล้ว กรุณาระบุรหัสอื่น`);
      return;
    }

    const newTemplate: VehicleSafetyItemTemplate = {
      id: `sft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      itemCode: codeToUse,
      nameTh: newItemNameTh.trim(),
      nameEn: newItemNameEn.trim() || newItemNameTh.trim(),
      standardQty: Math.max(1, newItemQty),
      unit: newItemUnit.trim() || "อัน",
      purpose: newItemPurpose.trim() || "อุปกรณ์ความปลอดภัยประจำรถตามมาตรฐาน ISO 39001",
      vehicleTypes: { ...newItemVehicleTypes },
      estimatedValueBaht: Math.max(0, newItemPrice),
      specNote: newItemSpecNote.trim(),
      imageUrl: newItemImageUrl || undefined,
      isCustomItem: true
    };

    if (onAddTemplate) {
      onAddTemplate(newTemplate);
    }

    setSaveSuccessMsg(`เพิ่มอุปกรณ์ "${newTemplate.nameTh}" (${newTemplate.itemCode}) เข้าสู่ตารางเรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (item: VehicleSafetyItemTemplate) => {
    if (window.confirm(`คุณต้องการลบรายการ "${item.nameTh}" (${item.itemCode}) ออกจากตารางอุปกรณ์ความปลอดภัยใช่หรือไม่?`)) {
      if (onDeleteTemplate) {
        onDeleteTemplate(item.id);
        setSaveSuccessMsg(`ลบรายการ "${item.nameTh}" เรียบร้อยแล้ว`);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    }
  };

  const handleOpenEditModal = (item: VehicleSafetyItemTemplate) => {
    setEditModalItem(item);
    setModalNameTh(item.nameTh);
    setModalNameEn(item.nameEn);
    setModalItemCode(item.itemCode);
    setModalUnit(item.unit);
    setModalPrice(item.estimatedValueBaht);
    setModalQty(item.standardQty);
    setModalSpecNote(item.specNote || "");
    setModalPurpose(item.purpose || "");
    setModalVehicleTypes({ ...item.vehicleTypes });
    setModalImageUrl(item.imageUrl || "");
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;

    if (onUpdateTemplateDetail) {
      onUpdateTemplateDetail({
        ...editModalItem,
        nameTh: modalNameTh.trim() || editModalItem.nameTh,
        nameEn: modalNameEn.trim() || editModalItem.nameEn,
        itemCode: modalItemCode.trim() || editModalItem.itemCode,
        unit: modalUnit.trim() || editModalItem.unit,
        estimatedValueBaht: Math.max(0, modalPrice),
        standardQty: Math.max(1, modalQty),
        specNote: modalSpecNote,
        purpose: modalPurpose,
        vehicleTypes: { ...modalVehicleTypes },
        imageUrl: modalImageUrl || undefined
      });
    } else {
      onUpdateTemplatePrice(editModalItem.id, Math.max(0, modalPrice));
    }

    setSaveSuccessMsg(`บันทึกข้อมูลของ "${modalNameTh || editModalItem.nameTh}" เรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
    setEditModalItem(null);
  };

  const handleInlinePriceChange = (templateId: string, val: number) => {
    onUpdateTemplatePrice(templateId, Math.max(0, val));
    setSaveSuccessMsg("บันทึกราคาล่าสุดเรียบร้อยแล้ว");
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Batch adjust prices by percentage
  const handleApplyBatchPercentage = (percent: number) => {
    const factor = 1 + percent / 100;
    const updated = templates.map((tpl) => {
      let newPrice = Math.round(tpl.estimatedValueBaht * factor);
      if (roundToNearest10) {
        newPrice = Math.round(newPrice / 10) * 10;
      }
      return {
        ...tpl,
        estimatedValueBaht: Math.max(0, newPrice)
      };
    });

    if (onBatchUpdateTemplates) {
      onBatchUpdateTemplates(updated);
    } else {
      updated.forEach((item) => onUpdateTemplatePrice(item.id, item.estimatedValueBaht));
    }

    const actionText = percent >= 0 ? `ปรับราคาขึ้น +${percent}%` : `ปรับราคาลง ${percent}%`;
    setSaveSuccessMsg(`ดำเนินการ${actionText} ครบทั้ง 10 รายการเรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Save Revision Announcement
  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...revisionInfo,
      updatedAt: new Date().toISOString()
    };
    setRevisionInfo(updated);
    try {
      localStorage.setItem(REVISION_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setSaveSuccessMsg(`บันทึกประกาศปรับปรุงราคาฉบับ ${revisionInfo.revisionNo} เรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Export pricing as CSV for Excel
  const handleExportCSV = () => {
    const headers = [
      "ลำดับ",
      "รหัสอุปกรณ์",
      "ชื่ออุปกรณ์ (ไทย)",
      "ชื่ออุปกรณ์ (อังกฤษ)",
      "จำนวนมาตรฐาน",
      "หน่วยนับ",
      "หก/สิบล้อ",
      "หัวลาก",
      "กะบะ",
      "มูลค่าชดใช้ประเมิน (บาท)",
      "สเปก/คุณลักษณะ",
      "วัตถุประสงค์การใช้งาน"
    ];

    const rows = templates.map((tpl, idx) => [
      idx + 1,
      `"${tpl.itemCode}"`,
      `"${tpl.nameTh.replace(/"/g, '""')}"`,
      `"${tpl.nameEn.replace(/"/g, '""')}"`,
      tpl.standardQty,
      `"${tpl.unit}"`,
      tpl.vehicleTypes.sixTenWheel ? "มี" : "ไม่มี",
      tpl.vehicleTypes.tractor ? "มี" : "ไม่มี",
      tpl.vehicleTypes.pickup ? "มี" : "ไม่มี",
      tpl.estimatedValueBaht,
      `"${(tpl.specNote || "").replace(/"/g, '""')}"`,
      `"${tpl.purpose.replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `TNB_Safety_Equipment_Pricing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ISO Title & Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              ISO 39001 / TNB-SHE-FRM-012
            </span>
            <span className="text-xs text-slate-300">มาตรฐานอุปกรณ์ประจำรถขนส่งสินค้า</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-semibold border border-amber-400/30">
              ประกาศ: {revisionInfo.revisionNo}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>อุปกรณ์ความปลอดภัยที่ต้องจัดให้มีประจำรถขนส่งสินค้า</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            พนักงานขับรถทุกคนต้องตรวจสอบและเซ็นรับมอบอุปกรณ์ความปลอดภัยประจำรถครบถ้วน 
            พร้อมรับผิดชอบดูแลรักษาและชดใช้ค่าเสียหายกรณีสูญหายตามระเบียบบริษัทฯ (รองรับการปรับเปลี่ยนราคาตามรอบประกาศ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-400/40 shadow-md shadow-emerald-900/40 transition-all hover:scale-[1.02]"
            title="เพิ่มรายการอุปกรณ์ความปลอดภัยใหม่เข้าระบบ"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>เพิ่มรายการใหม่</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRevisionModalOpen(true)}
            className="px-4 py-2.5 bg-blue-700/80 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-500/40 transition-all shadow-xs"
            title="เครื่องมือปรับราคายกชุด บันทึกประกาศปรับราคา และจัดการความเปลี่ยนแปลงราคา"
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>จัดการราคา & ประกาศฉบับใหม่</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrintBlankForm}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-xs transition-all shadow-xs"
            title="พิมพ์หรือดาวน์โหลดแบบฟอร์มเปล่าเพื่อนำไปให้คนขับเซ็นที่หน้ารถ"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>ดาวน์โหลดแบบฟอร์มเปล่า (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewHandover}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ทำใบเซ็นรับมอบใหม่</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Official Master Table (Matching User's Uploaded Sheets) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Top Controls & Price Edit Toggle */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>ตารางกำหนดมาตรฐานอุปกรณ์ความปลอดภัยประจำรถขนส่งสินค้า ({templates.length} รายการ)</span>
                {isEditMode && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    ✏️ โหมดแก้ไขราคากำลังเปิดอยู่
                  </span>
                )}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>มูลค่ารวมทั้งชุด: <strong className="font-mono text-blue-700">{totalStandardKitValue.toLocaleString()} บาท</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">อ้างอิง: <strong className="font-mono">{revisionInfo.revisionNo}</strong> (มีผลตั้งแต่ {new Date(revisionInfo.effectiveDate).toLocaleDateString("th-TH")})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add New Item Button in table toolbar */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="เพิ่มรายการอุปกรณ์เซฟตี้ใหม่ในตาราง"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>เพิ่มรายการอุปกรณ์</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="ส่งออกตารางราคากลางและสเปกอุปกรณ์เป็นไฟล์ Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก Excel/CSV</span>
            </button>

            {/* Manage Revision / Batch */}
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(true)}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Percent className="w-3.5 h-3.5 text-purple-600" />
              <span>ปรับราคา %</span>
            </button>

            {/* Toggle Price Edit Mode */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isEditMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEditMode ? "เสร็จสิ้นการแก้ไข" : "แก้ไขราคาในตาราง"}</span>
            </button>

            {/* Reset to Default Prices */}
            <button
              type="button"
              onClick={onResetDefaultPrices}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
              title="คืนค่าราคาตามมาตรฐานดั้งเดิมของบริษัทฯ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">คืนค่าราคาเริ่มต้น</span>
            </button>
          </div>
        </div>

        {isEditMode && (
          <div className="bg-amber-50/80 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>คำแนะนำการเปลี่ยนราคา:</strong> ท่านสามารถพิมพ์ตัวเลขราคาประเมินชดใช้ใหม่ในช่องราคาด้านขวาสุดได้ทันที ระบบจะบันทึกและนำไปใช้ในใบส่งมอบฉบับใหม่อัตโนมัติ โดยจะไม่กระทบยอดชดใช้ในใบส่งมอบเดิมที่พนักงานเซ็นไปแล้ว
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
            >
              เสร็จสิ้น
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center w-12 border-r border-slate-200">ลำดับ</th>
                <th className="py-3 px-4 min-w-[140px] border-r border-slate-200">ชื่ออุปกรณ์</th>
                <th className="py-3 px-3 text-center min-w-[100px] border-r border-slate-200">ภาพอุปกรณ์</th>
                <th className="py-3 px-3 text-center w-20 border-r border-slate-200">จำนวน</th>
                <th className="py-3 px-4 min-w-[260px] border-r border-slate-200">วัตถุประสงค์การใช้งาน</th>
                <th className="py-3 px-2 text-center w-20 border-r border-slate-200 bg-blue-50/70 text-blue-900">
                  หก/สิบล้อ
                </th>
                <th className="py-3 px-2 text-center w-20 border-r border-slate-200 bg-indigo-50/70 text-indigo-900">
                  หัวลาก
                </th>
                <th className="py-3 px-2 text-center w-20 border-r border-slate-200 bg-amber-50/70 text-amber-900">
                  กะบะ
                </th>
                <th className="py-3 px-3 text-right min-w-[160px] text-slate-700 bg-slate-100/90">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>มูลค่าชดใช้ (บาท)</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {templates.map((item, index) => {
                const defaultItem = VEHICLE_SAFETY_ITEMS_TEMPLATE.find((tpl) => tpl.id === item.id);
                const isPriceCustomized = defaultItem && defaultItem.estimatedValueBaht !== item.estimatedValueBaht;
                const isCustom = item.isCustomItem || !defaultItem;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-blue-50/40 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    {/* ลำดับ */}
                    <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                      {index + 1}
                    </td>

                    {/* ชื่ออุปกรณ์ */}
                    <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{item.nameTh}</span>
                        {isCustom && (
                          <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                            รายการใหม่
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500">{item.nameEn}</div>
                      <div className="text-[10px] font-mono font-semibold text-blue-600 mt-0.5">
                        รหัส: {item.itemCode}
                      </div>
                    </td>

                    {/* ภาพอุปกรณ์ */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                      <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:scale-110 transition-transform duration-150">
                        <SafetyItemSvgIcon 
                          itemCode={item.itemCode} 
                          imageUrl={item.imageUrl}
                          className="w-16 h-16 object-contain" 
                        />
                      </div>
                    </td>

                    {/* จำนวน */}
                    <td className="py-3 px-3 text-center border-r border-slate-200 font-black text-slate-800 text-base">
                      <div>{item.standardQty}</div>
                      <div className="text-[11px] font-normal text-slate-500">{item.unit}</div>
                    </td>

                    {/* วัตถุประสงค์การใช้งาน */}
                    <td className="py-3 px-4 border-r border-slate-200 text-slate-700 leading-relaxed">
                      <div className="font-medium">{item.purpose}</div>
                      {item.specNote && (
                        <div className="mt-1 text-[11px] text-slate-500 flex items-start gap-1">
                          <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>สเปก: {item.specNote}</span>
                        </div>
                      )}
                    </td>

                    {/* หก/สิบล้อ */}
                    <td className="py-3 px-2 text-center border-r border-slate-200 bg-blue-50/30">
                      {item.vehicleTypes.sixTenWheel ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 text-slate-400">
                          <Minus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* หัวลาก */}
                    <td className="py-3 px-2 text-center border-r border-slate-200 bg-indigo-50/30">
                      {item.vehicleTypes.tractor ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 text-slate-400">
                          <Minus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* กะบะ */}
                    <td className="py-3 px-2 text-center border-r border-slate-200 bg-amber-50/30">
                      {item.vehicleTypes.pickup ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 text-slate-400">
                          <Minus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* มูลค่าชดใช้ (EDITABLE) */}
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-200 bg-slate-50/30">
                      {isEditMode ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            min={0}
                            step={10}
                            value={item.estimatedValueBaht}
                            onChange={(e) => handleInlinePriceChange(item.id, Number(e.target.value))}
                            className="w-24 text-right p-1.5 text-xs font-mono font-bold bg-white border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-blue-900 shadow-2xs"
                            title="แก้ไขราคาชดใช้"
                          />
                          <span className="text-slate-500 text-xs">฿</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {isPriceCustomized && (
                            <span className="text-[10px] font-sans font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              กำหนดเอง
                            </span>
                          )}
                          <span className="font-bold text-slate-900 text-sm">
                            {item.estimatedValueBaht.toLocaleString()} ฿
                          </span>
                        </div>
                      )}
                    </td>

                    {/* ปุ่มจัดการ / แก้ไขข้อมูล */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขราคาและสเปกอุปกรณ์นี้"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {isCustom && onDeleteTemplate && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบรายการนี้ออกจากตาราง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Quick Add Row in Table Body */}
              <tr>
                <td colSpan={10} className="p-3 bg-emerald-50/40 border-t border-dashed border-emerald-200 text-center">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-100/70 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all hover:scale-[1.01]"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>+ คลิกที่นี่เพื่อเพิ่มรายการอุปกรณ์ความปลอดภัยประจำรถรายการใหม่ (ลำดับที่ {templates.length + 1})</span>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-xs sm:text-sm">
                <td colSpan={8} className="py-3 px-4 text-right border-r border-slate-300">
                  <span>มูลค่ารวมอุปกรณ์ความปลอดภัยมาตรฐานครบชุด ({templates.length} รายการ):</span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-blue-800 text-base border-r border-slate-300">
                  {totalStandardKitValue.toLocaleString()} ฿
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footnote on Responsibility & ISO Standards */}
        <div className="p-4 bg-amber-50/80 border-t border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-800 shrink-0">⚠️ เงื่อนไขความรับผิดชอบ:</span>
            <span>
              อุปกรณ์เซฟตี้ประจำรถทุกรายการถือเป็นทรัพย์สินของบริษัทฯ พนักงานขับรถผู้รับมอบจะต้องดูแลรักษาให้อยู่ในสภาพพร้อมใช้งานเสมอ 
              <strong>กรณีสูญหายหรือเสียหายจากการละเลย พนักงานขับรถจะต้องรับผิดชอบชดใช้ค่าเสียหายตามมูลค่าอุปกรณ์</strong> (ราคาประเมินที่กำหนดไว้ข้างต้น)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPrintBlankForm}
            className="shrink-0 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>พิมพ์แบบฟอร์มตรวจสอบ</span>
          </button>
        </div>
      </div>

      {/* Tools Modal: Price Fluctuations, Batch Adjust & Revision Declaration */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  แนวทางและการจัดการเมื่อ "ราคาอาจจะมีการเปลี่ยนแปลง"
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
              {/* Policy Explanation: How the system protects historical data */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2.5">
                <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>ระบบจัดการความเปลี่ยนแปลงของราคาอย่างไร? (3 หลักการสำคัญ)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-900 mb-1">1. เอกสารเก่าคงเดิม</div>
                    <p className="text-slate-600 leading-relaxed">
                      ใบเซ็นรับที่พนักงานเซ็นไปแล้วในอดีต จะยังคงล็อกราคาเดิมตามวันที่เซ็นจริงไว้เสมอ ไม่ถูกทับ
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-900 mb-1">2. เอกสารใหม่ใช้ราคาล่าสุด</div>
                    <p className="text-slate-600 leading-relaxed">
                      เมื่อปรับราคาในหน้านี้ ใบเซ็นรับมอบฉบับถัดไปที่เปิดใหม่ จะดึงราคาประกาศใหม่ไปใช้ทันที
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-900 mb-1">3. แก้ไขเฉพาะคันได้</div>
                    <p className="text-slate-600 leading-relaxed">
                      หากอุปกรณ์บางชิ้นมีการจัดซื้อมาแพงกว่าหรือถูกกว่าปกติ สามารถแก้ราคาในใบส่งมอบคันนั้นได้
                    </p>
                  </div>
                </div>
              </div>

              {/* Tool 1: Batch Percentage Adjustment */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Percent className="w-4 h-4 text-purple-600" />
                    <span>เครื่องมือปรับราคายกชุดตามเปอร์เซ็นต์ (Batch % Adjustment)</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">เช่น ปรับตามเงินเฟ้อหรือซัพพลายเออร์</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  สำหรับกรณีต้นทุนสินค้าขยับขึ้นพร้อมกันหลายรายการ ท่านสามารถปรับราคาตาม % ได้ทันที:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyBatchPercentage(5)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg font-bold shadow-2xs transition-colors"
                  >
                    +5% ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyBatchPercentage(10)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg font-bold shadow-2xs transition-colors"
                  >
                    +10% ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyBatchPercentage(15)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg font-bold shadow-2xs transition-colors"
                  >
                    +15% ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyBatchPercentage(-5)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded-lg font-bold shadow-2xs transition-colors"
                  >
                    -5% ทั้งหมด
                  </button>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roundToNearest10}
                      onChange={(e) => setRoundToNearest10(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>ปัดเศษให้ลงท้ายหลักสิบบาทเสมอ (เช่น 1,452 ฿ → 1,450 ฿)</span>
                  </label>
                </div>
              </div>

              {/* Tool 2: Price Revision Declaration */}
              <form onSubmit={handleSaveRevision} className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-700" />
                  <span>บันทึกเลขที่ประกาศและรอบที่มีผลบังคับใช้ (Price Revision Info)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      เลขที่ประกาศ / Revision ฉบับที่
                    </label>
                    <input
                      type="text"
                      required
                      value={revisionInfo.revisionNo}
                      onChange={(e) => setRevisionInfo({ ...revisionInfo, revisionNo: e.target.value })}
                      placeholder="เช่น Rev. 03/2569"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      วันที่มีผลบังคับใช้
                    </label>
                    <input
                      type="date"
                      required
                      value={revisionInfo.effectiveDate}
                      onChange={(e) => setRevisionInfo({ ...revisionInfo, effectiveDate: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เหตุผลหรือบันทึกอ้างอิงการปรับราคา
                  </label>
                  <input
                    type="text"
                    value={revisionInfo.reasonNote}
                    onChange={(e) => setRevisionInfo({ ...revisionInfo, reasonNote: e.target.value })}
                    placeholder="เช่น ปรับตามใบเสนอราคา บ.ซัพพลายเออร์ วันที่ 15/09/2569"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกข้อมูลประกาศ</span>
                  </button>
                </div>
              </form>

              {/* Tool 3: Excel/CSV Export */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>ส่งออกตารางราคากลางไปใช้งานใน Excel</span>
                  </div>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    สำหรับนำไปจัดทำเอกสารเสนอราคา บันทึกข้อตกลง หรือส่งให้ฝ่ายจัดซื้อ/บัญชี
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ .CSV</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">
                บันทึกล่าสุดเมื่อ: {new Date(revisionInfo.updatedAt).toLocaleString("th-TH")}
              </span>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Item Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  แก้ไขข้อมูลและราคา: {editModalItem.nameTh}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 relative group">
                  <SafetyItemSvgIcon 
                    itemCode={modalItemCode || editModalItem.itemCode} 
                    imageUrl={modalImageUrl}
                    className="w-14 h-14 object-contain" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{modalNameTh || editModalItem.nameTh}</div>
                  <div className="text-slate-500 font-normal truncate">{modalNameEn || editModalItem.nameEn}</div>
                  <div className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                    รหัส: {modalItemCode || editModalItem.itemCode}
                  </div>
                </div>
              </div>

              {/* Price Field - Primary Requirement */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                <label className="block font-bold text-blue-950 text-xs">
                  💰 มูลค่าชดใช้ / ราคาประเมิน (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={modalPrice}
                    onChange={(e) => setModalPrice(Number(e.target.value))}
                    className="w-full text-base font-bold font-mono pl-3 pr-8 py-2 bg-white border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900"
                    placeholder="เช่น 750"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ฿
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  ราคานี้จะใช้เป็นเกณฑ์คิดมูลค่าชดใช้เมื่อสูญหายหรือชำรุดในแบบฟอร์ม TNB-SHE-FRM-012
                </p>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่ออุปกรณ์ (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalNameTh}
                    onChange={(e) => setModalNameTh(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่ออุปกรณ์ (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={modalNameEn}
                    onChange={(e) => setModalNameEn(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Item Code, Standard Quantity & Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสอุปกรณ์
                  </label>
                  <input
                    type="text"
                    value={modalItemCode}
                    onChange={(e) => setModalItemCode(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    จำนวนมาตรฐาน
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modalQty}
                    onChange={(e) => setModalQty(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    หน่วยนับ
                  </label>
                  <input
                    type="text"
                    value={modalUnit}
                    onChange={(e) => setModalUnit(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Vehicle Compatibility Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ประเภทรถที่ต้องจัดให้มีอุปกรณ์นี้
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalVehicleTypes.sixTenWheel}
                      onChange={(e) => setModalVehicleTypes({ ...modalVehicleTypes, sixTenWheel: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>หก/สิบล้อ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalVehicleTypes.tractor}
                      onChange={(e) => setModalVehicleTypes({ ...modalVehicleTypes, tractor: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>หัวลาก</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={modalVehicleTypes.pickup}
                      onChange={(e) => setModalVehicleTypes({ ...modalVehicleTypes, pickup: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>กะบะ</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload / Image URL */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-xs">
                  รูปภาพประกอบอุปกรณ์
                </label>
                <div className="flex items-center gap-3">
                  {modalImageUrl ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-100">
                      <img src={modalImageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setModalImageUrl("")}
                        className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:bg-rose-700"
                        title="ลบรูปภาพ"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400 bg-slate-50">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-xs border border-slate-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{modalImageUrl ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ..."}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, true);
                        }}
                      />
                    </label>
                    <div className="text-[10px] text-slate-400">
                      (รองรับไฟล์ PNG, JPG ไม่เกิน 2.5 MB หากไม่อัปโหลดจะแสดงไอคอนมาตรฐานตามรหัสอุปกรณ์)
                    </div>
                  </div>
                </div>
              </div>

              {/* Specification Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  สเปก / รายละเอียดทางเทคนิค (Spec Note)
                </label>
                <input
                  type="text"
                  value={modalSpecNote}
                  onChange={(e) => setModalSpecNote(e.target.value)}
                  placeholder="เช่น ยางหนาทึบเสริมใยเหล็ก 20 ตัน"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  วัตถุประสงค์การใช้งานตามมาตรฐาน
                </label>
                <textarea
                  rows={2}
                  value={modalPurpose}
                  onChange={(e) => setModalPurpose(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Safety Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">
                    เพิ่มรายการอุปกรณ์ความปลอดภัยประจำรถใหม่
                  </h3>
                  <div className="text-[11px] text-emerald-200 font-medium">
                    เพิ่มเข้าระบบและใบเซ็นรับมอบอุปกรณ์ตามมาตรฐาน ISO 39001
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              {/* Quick 1-Click Presets */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>เลือกจากรายการอุปกรณ์ยอดนิยม (คลิก 1 ครั้งเพื่อกรอกอัตโนมัติ):</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    10 รายการแนะนำ
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {COMMON_SAFETY_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.itemCode}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        selectedPresetIndex === idx
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-emerald-900 hover:bg-emerald-100/80 border-emerald-300"
                      }`}
                    >
                      + {preset.nameTh} ({preset.estimatedValueBaht}฿)
                    </button>
                  ))}
                </div>
              </div>

              {addError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ชื่ออุปกรณ์ (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemNameTh}
                    onChange={(e) => {
                      setNewItemNameTh(e.target.value);
                      if (addError) setAddError(null);
                    }}
                    placeholder="เช่น กล่องปฐมพยาบาลเบื้องต้น"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ชื่ออุปกรณ์ (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={newItemNameEn}
                    onChange={(e) => setNewItemNameEn(e.target.value)}
                    placeholder="เช่น First Aid Kit"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Code, Price, Qty, Unit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    รหัสอุปกรณ์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    placeholder="SEC-11"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ราคาชดใช้ (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    placeholder="350"
                    className="w-full p-2 bg-white border border-emerald-400 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    จำนวนมาตรฐาน
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    หน่วยนับ
                  </label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="อัน, ชุด, ใบ"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Vehicle Compatibility Checkboxes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  ประเภทรถที่ต้องจัดให้มีอุปกรณ์นี้ประจำรถ
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={newItemVehicleTypes.sixTenWheel}
                      onChange={(e) => setNewItemVehicleTypes({ ...newItemVehicleTypes, sixTenWheel: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>หก/สิบล้อ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={newItemVehicleTypes.tractor}
                      onChange={(e) => setNewItemVehicleTypes({ ...newItemVehicleTypes, tractor: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>หัวลาก</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={newItemVehicleTypes.pickup}
                      onChange={(e) => setNewItemVehicleTypes({ ...newItemVehicleTypes, pickup: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>กะบะ</span>
                  </label>
                </div>
              </div>

              {/* Purpose & Specification */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    วัตถุประสงค์การใช้งานตามมาตรฐาน ISO 39001
                  </label>
                  <textarea
                    rows={2}
                    value={newItemPurpose}
                    onChange={(e) => setNewItemPurpose(e.target.value)}
                    placeholder="เช่น ใช้ปฐมพยาบาลเบื้องต้นเมื่อเกิดอุบัติเหตุหรือบาดเจ็บระหว่างเดินทาง..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    สเปก / คุณลักษณะเฉพาะ (Specification Note)
                  </label>
                  <input
                    type="text"
                    value={newItemSpecNote}
                    onChange={(e) => setNewItemSpecNote(e.target.value)}
                    placeholder="เช่น มาตรฐาน มอก. หรือ ขนาดคุณลักษณะ"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-bold text-slate-800 text-xs">
                  รูปภาพประกอบอุปกรณ์
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative">
                    {newItemImageUrl ? (
                      <>
                        <img src={newItemImageUrl} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewItemImageUrl("")}
                          className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:bg-rose-700"
                          title="ลบรูปภาพ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <SafetyItemSvgIcon itemCode={newItemCode} className="w-12 h-12 object-contain" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer transition-colors text-xs border border-slate-300 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{newItemImageUrl ? "เปลี่ยนรูปภาพใหม่" : "อัปโหลดรูปภาพอุปกรณ์จริง..."}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, false);
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">
                      รองรับไฟล์ภาพ .png, .jpg (หากไม่ได้อัปโหลด ระบบจะใช้ภาพเวกเตอร์มาตรฐานตามรหัสอุปกรณ์)
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>เพิ่มอุปกรณ์เข้าสู่ตาราง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
