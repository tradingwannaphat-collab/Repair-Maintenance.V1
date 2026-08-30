import React, { useState, useMemo } from "react";
import { 
  Boxes, 
  Search, 
  Plus, 
  Filter, 
  Tag, 
  DollarSign, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ArrowUpRight, 
  Truck, 
  ShieldCheck, 
  SlidersHorizontal, 
  Printer, 
  RotateCcw,
  Sparkles,
  Package,
  Wrench,
  HelpCircle,
  BarChart3,
  Check,
  X,
  PlusCircle,
  Eye,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { InventoryItem, RepairCategory, VehicleType } from "../types";
import { CATEGORIES_CONFIG, VEHICLE_TYPE_LABELS } from "../data/categories";
import { TnbLogo } from "./TnbLogo";
import { StockImportModal } from "./StockImportModal";
import { exportInventoryToExcel, exportInventoryToCSV, downloadInventoryTemplate } from "../utils/excelImportExport";

interface PartListViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (itemId: string) => void;
  onNavigateToReceiving?: (prefilledItem?: InventoryItem) => void;
  onNavigateToRequisition?: (prefilledItem?: InventoryItem) => void;
  onBulkImportInventory?: (importedItems: InventoryItem[], mode: "upsert" | "append" | "replace") => void;
}

const COMMON_UNITS = ["ชิ้น", "ลิตร", "ชุด", "ลูก", "เส้น", "กล่อง", "ถัง", "คู่", "กิโลกรัม", "ม้วน", "กระป๋อง"];

const POPULAR_BRANDS = [
  "ISUZU Genuine Parts",
  "Hino Genuine Parts",
  "Toyota Genuine",
  "PTT Lubricants",
  "Castrol",
  "Bridgestone",
  "Michelin",
  "GS Battery",
  "3K Battery",
  "Denso",
  "Bosch",
  "Bendix",
  "Kayaba (KYB)",
  "SKF",
  "Gates",
  "TNB Heavy Duty"
];

const CATEGORY_CODE_PREFIX: Record<RepairCategory, string> = {
  suspension: "SUS",
  lubricant: "LUB",
  lighting: "ELE",
  engine: "ENG",
  tires: "TIR",
  aircon: "AC",
  bodywork: "BDY",
  inspection: "PM",
  other: "GEN"
};

export const PartListView: React.FC<PartListViewProps> = ({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onNavigateToReceiving,
  onNavigateToRequisition,
  onBulkImportInventory
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "healthy" | "low" | "out" | "repairable">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"code_asc" | "code_desc" | "name_asc" | "stock_asc" | "stock_desc" | "price_asc" | "price_desc">("code_asc");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  
  // Quick Adjust Modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("ตรวจนับสต็อกจริงประจำสัปดาห์");

  // Form State for Create / Edit
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<RepairCategory>("suspension");
  const [formBrand, setFormBrand] = useState("ISUZU Genuine Parts");
  const [formSpecification, setFormSpecification] = useState("");
  const [formUnit, setFormUnit] = useState("ชิ้น");
  const [formCurrentStock, setFormCurrentStock] = useState<number>(10);
  const [formMinStockLevel, setFormMinStockLevel] = useState<number>(3);
  const [formUnitCost, setFormUnitCost] = useState<number>(500);
  const [formUnitSellingPrice, setFormUnitSellingPrice] = useState<number>(650);
  const [formLocationRack, setFormLocationRack] = useState("A-01");
  const [formSupplier, setFormSupplier] = useState("TNB Logistics Central Workshop");
  const [formIsRepairable, setFormIsRepairable] = useState(false);
  const [formCondition, setFormCondition] = useState<"new" | "rebuilt" | "spare">("new");
  const [formCompatibleTypes, setFormCompatibleTypes] = useState<VehicleType[]>([
    "tractor_6w",
    "tractor_10w",
    "box_truck_6w"
  ]);
  const [formNotes, setFormNotes] = useState("");

  // Open Create Modal with Auto-generate Code
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    const prefix = CATEGORY_CODE_PREFIX.suspension;
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormCode(`${prefix}-${randomNum}`);
    setFormName("");
    setFormCategory("suspension");
    setFormBrand("ISUZU Genuine Parts");
    setFormSpecification("");
    setFormUnit("ชิ้น");
    setFormCurrentStock(10);
    setFormMinStockLevel(3);
    setFormUnitCost(500);
    setFormUnitSellingPrice(650);
    setFormLocationRack("A-01");
    setFormSupplier("TNB Logistics Central Workshop");
    setFormIsRepairable(false);
    setFormCondition("new");
    setFormCompatibleTypes(["tractor_6w", "tractor_10w", "box_truck_6w"]);
    setFormNotes("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormBrand(item.brand || "ISUZU Genuine Parts");
    setFormSpecification(item.specification || "");
    setFormUnit(item.unit);
    setFormCurrentStock(item.currentStock);
    setFormMinStockLevel(item.minStockLevel);
    setFormUnitCost(item.unitCost);
    setFormUnitSellingPrice(item.unitSellingPrice || item.unitCost);
    setFormLocationRack(item.locationRack || "A-01");
    setFormSupplier(item.supplier || "");
    setFormIsRepairable(item.isRepairableCategory || false);
    setFormCondition(item.condition || "new");
    setFormCompatibleTypes(item.compatibleVehicleTypes || ["tractor_6w", "tractor_10w"]);
    setFormNotes(item.notes || "");
    setIsFormModalOpen(true);
  };

  // Auto-generate code when category changes in create mode
  const handleCategoryChangeInForm = (newCat: RepairCategory) => {
    setFormCategory(newCat);
    if (!editingItem) {
      const prefix = CATEGORY_CODE_PREFIX[newCat] || "GEN";
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormCode(`${prefix}-${randomNum}`);
    }
  };

  // Toggle compatible vehicle type
  const handleToggleCompatibleType = (type: VehicleType) => {
    if (formCompatibleTypes.includes(type)) {
      setFormCompatibleTypes(formCompatibleTypes.filter(t => t !== type));
    } else {
      setFormCompatibleTypes([...formCompatibleTypes, type]);
    }
  };

  // Save Item (Create or Update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      alert("กรุณาระบุรหัสอะไหล่ (Part Code)");
      return;
    }
    if (!formName.trim()) {
      alert("กรุณาระบุชื่อรายการอะไหล่ (Part Name)");
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingItem) {
      // Update
      const updated: InventoryItem = {
        ...editingItem,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        brand: formBrand.trim(),
        specification: formSpecification.trim() || undefined,
        unit: formUnit,
        currentStock: Number(formCurrentStock) || 0,
        minStockLevel: Number(formMinStockLevel) || 0,
        unitCost: Number(formUnitCost) || 0,
        unitSellingPrice: Number(formUnitSellingPrice) || Number(formUnitCost) || 0,
        locationRack: formLocationRack.trim(),
        supplier: formSupplier.trim(),
        isRepairableCategory: formIsRepairable,
        condition: formCondition,
        compatibleVehicleTypes: formCompatibleTypes,
        notes: formNotes.trim() || undefined,
        updatedAt: nowIso
      };
      onUpdateInventoryItem(updated);
    } else {
      // Create new
      const newItem: InventoryItem = {
        id: `INV-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        brand: formBrand.trim(),
        specification: formSpecification.trim() || undefined,
        unit: formUnit,
        currentStock: Number(formCurrentStock) || 0,
        minStockLevel: Number(formMinStockLevel) || 0,
        unitCost: Number(formUnitCost) || 0,
        unitSellingPrice: Number(formUnitSellingPrice) || Number(formUnitCost) || 0,
        locationRack: formLocationRack.trim(),
        supplier: formSupplier.trim(),
        isRepairableCategory: formIsRepairable,
        condition: formCondition,
        compatibleVehicleTypes: formCompatibleTypes,
        notes: formNotes.trim() || undefined,
        updatedAt: nowIso
      };
      onAddInventoryItem(newItem);
    }

    setIsFormModalOpen(false);
  };

  // Quick Adjust Stock
  const handleSaveStockAdjustment = () => {
    if (!adjustingItem) return;
    const newQty = Number(adjustQuantity);
    if (isNaN(newQty) || newQty < 0) {
      alert("กรุณาระบุจำนวนสต็อกที่ถูกต้อง (ไม่ต่ำกว่า 0)");
      return;
    }
    const updated: InventoryItem = {
      ...adjustingItem,
      currentStock: newQty,
      notes: adjustingItem.notes 
        ? `${adjustingItem.notes} | ปรับสต็อกเมื่อ ${new Date().toLocaleDateString("th-TH")}: ${adjustReason} (${adjustingItem.currentStock} -> ${newQty} ${adjustingItem.unit})`
        : `ปรับสต็อกเมื่อ ${new Date().toLocaleDateString("th-TH")}: ${adjustReason} (${adjustingItem.currentStock} -> ${newQty} ${adjustingItem.unit})`,
      updatedAt: new Date().toISOString()
    };
    onUpdateInventoryItem(updated);
    setAdjustingItem(null);
  };

  // Delete Item
  const handleDelete = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteInventoryItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // Filter Logic
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.specification && item.specification.toLowerCase().includes(q)) ||
        (item.locationRack && item.locationRack.toLowerCase().includes(q)) ||
        (item.supplier && item.supplier.toLowerCase().includes(q))
      );

      // Category
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;

      // Vehicle Type
      const matchVehicle = selectedVehicleType === "all" || (
        item.compatibleVehicleTypes && item.compatibleVehicleTypes.includes(selectedVehicleType as VehicleType)
      );

      // Stock Status
      let matchStatus = true;
      if (stockStatusFilter === "low") {
        matchStatus = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
      } else if (stockStatusFilter === "out") {
        matchStatus = item.currentStock <= 0;
      } else if (stockStatusFilter === "healthy") {
        matchStatus = item.currentStock > item.minStockLevel;
      } else if (stockStatusFilter === "repairable") {
        matchStatus = Boolean(item.isRepairableCategory || item.condition === "rebuilt");
      }

      return matchSearch && matchCat && matchVehicle && matchStatus;
    }).sort((a, b) => {
      if (sortBy === "code_asc") {
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      }
      if (sortBy === "code_desc") {
        return b.code.localeCompare(a.code, undefined, { numeric: true });
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name, "th");
      }
      if (sortBy === "stock_asc") {
        return a.currentStock - b.currentStock;
      }
      if (sortBy === "stock_desc") {
        return b.currentStock - a.currentStock;
      }
      if (sortBy === "price_asc") {
        return a.unitCost - b.unitCost;
      }
      if (sortBy === "price_desc") {
        return b.unitCost - a.unitCost;
      }
      return 0;
    });
  }, [inventory, searchQuery, selectedCategory, selectedVehicleType, stockStatusFilter, sortBy]);

  // Summary Metrics
  const totalSKUs = inventory.length;
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const lowStockCount = inventory.filter(item => item.currentStock > 0 && item.currentStock <= item.minStockLevel).length;
  const outOfStockCount = inventory.filter(item => item.currentStock <= 0).length;
  const repairableCount = inventory.filter(item => item.isRepairableCategory || item.condition === "rebuilt").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-blue-600 p-3 rounded-xl shadow-md text-white">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Part List & แคตตาล็อกอะไหล่คลัง
                </h1>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Master Catalog
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                กำหนดรหัสอะไหล่ สร้างประเภทเข้าคลัง กำหนดจุดเตือนสต็อก และระบุประเภทอุปกรณ์ที่ซ่อมได้/รีบิลด์
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto flex-wrap gap-y-2">
            {/* Import Stock Button */}
            <button
              type="button"
              id="btn-import-stock"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 shadow-md transition-all"
              title="นำเข้าข้อมูลคลังอะไหล่จาก Excel (.xlsx, .xls) หรือ CSV"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>นำเข้าสต็อก (Import)</span>
            </button>

            {/* Export Stock Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="btn-export-stock-dropdown"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-600 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>ส่งออก (Export)</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
              </button>

              {isExportMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsExportMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      exportInventoryToExcel(filteredInventory);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 flex items-center space-x-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="font-bold">ส่งออก Excel (.xlsx)</div>
                      <div className="text-[10px] text-slate-500">คลังอะไหล่ ({filteredInventory.length} รายการ)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportInventoryToCSV(filteredInventory);
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-800 flex items-center space-x-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-bold">ส่งออก CSV (.csv)</div>
                      <div className="text-[10px] text-slate-500">UTF-8 สำหรับ Excel / POS</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      downloadInventoryTemplate("xlsx");
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-slate-800 hover:text-blue-900 flex items-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-blue-900">โหลด Template สต็อก</div>
                      <div className="text-[10px] text-blue-700">แบบฟอร์มนำเข้า Excel (.xlsx)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-create-new-part"
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 border border-blue-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างประเภท / เพิ่มอะไหล่ใหม่</span>
            </button>

            {onNavigateToReceiving && (
              <button
                type="button"
                onClick={() => onNavigateToReceiving()}
                className="hidden md:flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors"
                title="ไปยังหน้ารับของเข้าคลัง"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>รับของเข้าคลัง</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">จำนวนรายการ (SKUs)</span>
              <span className="text-lg font-black text-white">{totalSKUs}</span>
              <span className="text-[10px] text-slate-400 ml-1">ประเภท</span>
            </div>
            <Package className="w-6 h-6 text-blue-400 shrink-0 opacity-80" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">ยอดคงเหลือรวม</span>
              <span className="text-lg font-black text-emerald-400">{totalStockUnits.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 ml-1">ชิ้น</span>
            </div>
            <Boxes className="w-6 h-6 text-emerald-400 shrink-0 opacity-80" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">มูลค่าพัสดุในคลังรวม</span>
              <span className="text-lg font-black text-amber-400">฿{totalInventoryValue.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">ราคาทุนรวม</span>
            </div>
            <DollarSign className="w-6 h-6 text-amber-400 shrink-0 opacity-80" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">เตือนสต็อกต่ำ / หมด</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-rose-400">{lowStockCount + outOfStockCount}</span>
                <span className="text-[10px] text-slate-400">รายการ</span>
              </div>
              <span className="text-[10px] text-rose-300">หมด: {outOfStockCount} | ใกล้หมด: {lowStockCount}</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 opacity-80" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-slate-400 block text-[11px]">อุปกรณ์รีบิลด์ / ซ่อมได้</span>
              <span className="text-lg font-black text-purple-400">{repairableCount}</span>
              <span className="text-[10px] text-slate-400 ml-1">รายการ</span>
              <span className="text-[10px] text-purple-300 block">Rebuilt & Salvage</span>
            </div>
            <Wrench className="w-6 h-6 text-purple-400 shrink-0 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัสอะไหล่, ชื่อ, ชั้นวาง, ยี่ห้อ หรือผู้จำหน่าย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-slate-400 text-xs hidden lg:inline">สถานะสต็อก:</span>
            
            <button
              type="button"
              onClick={() => setStockStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                stockStatusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ทั้งหมด ({inventory.length})
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter("healthy")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                stockStatusFilter === "healthy"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              พร้อมใช้งาน ({inventory.filter(i => i.currentStock > i.minStockLevel).length})
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter("low")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                stockStatusFilter === "low"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              ใกล้หมด ({lowStockCount})
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter("out")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                stockStatusFilter === "out"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100"
              }`}
            >
              หมดสต็อก ({outOfStockCount})
            </button>

            <button
              type="button"
              onClick={() => setStockStatusFilter("repairable")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                stockStatusFilter === "repairable"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-800 hover:bg-purple-100"
              }`}
            >
              ซ่อมได้ / Rebuild ({repairableCount})
            </button>
          </div>
        </div>

        {/* Categories Row */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-400 shrink-0 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            หมวดหมู่:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ทุกหมวด
          </button>
          {Object.entries(CATEGORIES_CONFIG).map(([catKey, catMeta]) => {
            const count = inventory.filter(i => i.category === catKey).length;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{catMeta.nameTh}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inventory Items Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              รายการอะไหล่และพัสดุในคลัง ({filteredInventory.length} รายการ)
            </h2>
            {selectedCategory !== "all" && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
                {CATEGORIES_CONFIG[selectedCategory as RepairCategory]?.nameTh}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>แสดงผล: {filteredInventory.length} จาก {inventory.length} รายการ</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px] select-none">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th 
                  onClick={() => setSortBy(sortBy === "code_asc" ? "code_desc" : "code_asc")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="คลิกเพื่อจัดเรียงรหัสอะไหล่ (A-Z / Z-A)"
                >
                  <div className="flex items-center space-x-1">
                    <span>รหัส & ชื่อรายการอะไหล่</span>
                    {sortBy === "code_asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                    {sortBy === "code_desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                    {!sortBy.startsWith("code_") && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">รองรับประเภทรถ</th>
                <th className="py-3 px-4">ตำแหน่งจัดเก็บ</th>
                <th className="py-3 px-4 text-center">ประเภทหลังซ่อม</th>
                <th 
                  onClick={() => setSortBy(sortBy === "stock_asc" ? "stock_desc" : "stock_asc")}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  title="คลิกเพื่อจัดเรียงจำนวนสต็อก (น้อยไปมาก / มากไปน้อย)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>สต็อกคงเหลือ</span>
                    {sortBy === "stock_asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                    {sortBy === "stock_desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === "price_asc" ? "price_desc" : "price_asc")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  title="คลิกเพื่อจัดเรียงตามราคาทุน"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>ราคาทุน (฿)</span>
                    {sortBy === "price_asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                    {sortBy === "price_desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">มูลค่ารวม (฿)</th>
                <th className="py-3 px-4 text-center w-36">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item, index) => {
                const catMeta = CATEGORIES_CONFIG[item.category] || CATEGORIES_CONFIG.other;
                const isOutOfStock = item.currentStock <= 0;
                const isLowStock = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
                const stockPercent = Math.min(100, (item.currentStock / Math.max(item.minStockLevel * 2, 10)) * 100);
                const totalItemCost = item.currentStock * item.unitCost;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Code & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-2">
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                              {item.code}
                            </span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                            {item.brand && <span className="font-medium text-slate-600">แบรนด์: {item.brand}</span>}
                            {item.specification && <span>• สเปก: {item.specification}</span>}
                            {item.supplier && <span>• ผู้จำหน่าย: {item.supplier}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${catMeta.borderColor} ${catMeta.bgLight}`}>
                        {catMeta.nameTh}
                      </span>
                    </td>

                    {/* Compatible Vehicle Types */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.compatibleVehicleTypes && item.compatibleVehicleTypes.length > 0 ? (
                          item.compatibleVehicleTypes.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              {VEHICLE_TYPE_LABELS[t] || t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">ทุกประเภทรถ</span>
                        )}
                        {item.compatibleVehicleTypes && item.compatibleVehicleTypes.length > 2 && (
                          <span className="text-[10px] text-slate-500 font-semibold" title={item.compatibleVehicleTypes.map(t => VEHICLE_TYPE_LABELS[t] || t).join(", ")}>
                            +{item.compatibleVehicleTypes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rack Location */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        📍 {item.locationRack || "A-01"}
                      </span>
                    </td>

                    {/* Post-Repair / Rebuild Classification */}
                    <td className="py-3 px-4 text-center">
                      {item.isRepairableCategory || item.condition === "rebuilt" ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-purple-600" />
                            <span>ซ่อมได้ / Rebuild</span>
                          </span>
                          <span className="text-[9px] text-purple-600 mt-0.5">นำกลับมาใช้ใหม่ได้</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            อะไหล่เปลี่ยนทิ้ง
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">จำหน่ายซาก/เสีย</span>
                        </div>
                      )}
                    </td>

                    {/* Stock Count & Bar */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className={`font-mono font-bold text-sm ${
                            isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                          }`}>
                            {item.currentStock}
                          </span>
                          <span className="text-slate-500 text-xs">{item.unit}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-400">
                          ขั้นต่ำ: {item.minStockLevel} {item.unit}
                        </span>
                      </div>
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      ฿{item.unitCost.toLocaleString()}
                    </td>

                    {/* Total Value */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ฿{totalItemCost.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustQuantity(item.currentStock);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ปรับจำนวนสต็อกด่วน"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="แก้ไขรายละเอียดอะไหล่"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">ไม่พบรายการอะไหล่ที่ตรงกับเงื่อนไขการค้นหา</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "+ สร้างประเภท / เพิ่มอะไหล่ใหม่" ด้านบน</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Create or Edit Part Item & Definition */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {editingItem ? "แก้ไขประเภทและข้อมูลอะไหล่" : "สร้างประเภท & เพิ่มรายการอะไหล่เข้าคลัง"}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {editingItem ? `รหัสอะไหล่: ${editingItem.code}` : "กำหนดสเปก รหัสอะไหล่ และเงื่อนไขการซ่อมแซม/รีบิลด์"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800">
                      รหัสอะไหล่ (Part Code) <span className="text-rose-500">*</span>:
                    </label>
                    {!editingItem && (
                      <button
                        type="button"
                        onClick={() => {
                          const prefix = CATEGORY_CODE_PREFIX[formCategory] || "GEN";
                          const randomNum = Math.floor(100 + Math.random() * 900);
                          setFormCode(`${prefix}-${randomNum}`);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        ⚡ สุ่มรหัสใหม่
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="เช่น SUS-101, BRK-PAD-ISU"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    หมวดหมู่งานซ่อมบำรุง <span className="text-rose-500">*</span>:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value as RepairCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORIES_CONFIG).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.nameTh}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Part Name */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  ชื่อรายการอะไหล่ / พัสดุ <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผ้าเบรกหน้า ISUZU GIGA 10 ล้อ (Heavy Duty Ceramic), กรองน้ำมันเครื่อง..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Row 3: Brand & Specification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    ยี่ห้อ / แบรนด์ผู้ผลิต:
                  </label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    placeholder="เช่น ISUZU Genuine Parts, Bendix, PTT..."
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                  <datalist id="brand-suggestions">
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    สเปก / ขนาด / เบอร์อะไหล่:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 15W-40, เบอร์ 295/80R22.5, ขนาด 150Ah..."
                    value={formSpecification}
                    onChange={(e) => setFormSpecification(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Unit, Stock, Min Stock Level */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    หน่วยนับ:
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    สต็อกตั้งต้น:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    จุดเตือนสั่งซื้อ (Min):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinStockLevel}
                    onChange={(e) => setFormMinStockLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Unit Cost, Selling Price, Rack */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    ราคาทุน (฿):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    ราคาประเมินเบิก (฿):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formUnitSellingPrice}
                    onChange={(e) => setFormUnitSellingPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    ตำแหน่งชั้นวาง:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น A-01, Rack-B3"
                    value={formLocationRack}
                    onChange={(e) => setFormLocationRack(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Post-Repair Salvage & Rebuild Classification (Core Requirement) */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-900 text-xs">
                      การประเมินประเภทชิ้นส่วนหลังการซ่อม (Post-Repair & Rebuild Classification)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsRepairable}
                      onChange={(e) => setFormIsRepairable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {formIsRepairable 
                    ? "✓ ชิ้นส่วนประเภทนี้ **สามารถซ่อมแซมได้ / Rebuild ได้** เมื่อถอดเปลี่ยน สามารถนำไป Overhaul แล้วบันทึกกลับเข้าคลังเป็นอะไหล่มือสองได้"
                    : "○ ชิ้นส่วนประเภทนี้เป็น **อะไหล่สิ้นเปลือง / เปลี่ยนทิ้ง** เมื่อถอดเปลี่ยนแล้วให้จำหน่ายเป็นซากหรือทำลาย"}
                </p>

                {formIsRepairable && (
                  <div className="pt-2 border-t border-purple-200 flex items-center space-x-4">
                    <span className="text-[11px] font-semibold text-purple-900">สภาพพัสดุในระบบ:</span>
                    <label className="inline-flex items-center space-x-1 text-[11px] text-purple-900 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value="new"
                        checked={formCondition === "new"}
                        onChange={() => setFormCondition("new")}
                      />
                      <span>ของใหม่เบิกห้าง (New)</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 text-[11px] text-purple-900 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value="rebuilt"
                        checked={formCondition === "rebuilt"}
                        onChange={() => setFormCondition("rebuilt")}
                      />
                      <span>ผ่านการซ่อม/รีบิลด์ (Rebuilt)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Row 7: Compatible Vehicle Types */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  รองรับประเภทรถขนส่ง (เลือกได้หลายประเภท):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map((type) => {
                    const isChecked = formCompatibleTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handleToggleCompatibleType(type)}
                        className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                          isChecked
                            ? "bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="text-[11px] truncate">{VEHICLE_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 8: Notes */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  หมายเหตุ / สเปกอะไหล่เพิ่มเติม:
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น สเปกโรงงานแท้, ใช้กับรถลากพ่วงรุ่นปี 2022 ขึ้นไป..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? "บันทึกการแก้ไข" : "สร้างและบันทึกเข้าคลัง"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Quick Adjust Stock Modal */}
      {/* ========================================================================= */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">ปรับปรุงยอดสต็อกด่วน</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-mono font-bold text-blue-700">{adjustingItem.code}</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{adjustingItem.name}</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  ยอดคงเหลือปัจจุบัน: <strong className="text-slate-900">{adjustingItem.currentStock} {adjustingItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  ระบุจำนวนคงเหลือจริงใหม่ ({adjustingItem.unit}):
                </label>
                <input
                  type="number"
                  min={0}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-lg font-mono font-black text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  เหตุผลในการปรับปรุงสต็อก:
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ตรวจนับสต็อกจริงประจำสัปดาห์">ตรวจนับสต็อกจริงประจำสัปดาห์</option>
                  <option value="ตรวจนับสต็อกประจำเดือน (Cycle Count)">ตรวจนับสต็อกประจำเดือน (Cycle Count)</option>
                  <option value="นำชิ้นส่วนที่ Rebuild ซ่อมแล้วกลับเข้าสต็อก">นำชิ้นส่วนที่ Rebuild ซ่อมแล้วกลับเข้าสต็อก</option>
                  <option value="ตัดยอดชำรุดเสียหาย / เสื่อมสภาพ">ตัดยอดชำรุดเสียหาย / เสื่อมสภาพ</option>
                  <option value="แก้ไขยอดคลาดเคลื่อนจากเอกสาร">แก้ไขยอดคลาดเคลื่อนจากเอกสาร</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveStockAdjustment}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
                >
                  ยืนยันปรับสต็อก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Bulk Import Modal */}
      <StockImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentCount={inventory.length}
        onImportInventory={(importedItems, mode) => {
          if (onBulkImportInventory) {
            onBulkImportInventory(importedItems, mode);
          } else {
            // Fallback sequential add
            importedItems.forEach(item => onAddInventoryItem(item));
          }
        }}
      />

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center">
              ยืนยันการลบรายการอะไหล่
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณต้องการลบข้อมูลอะไหล่รายการนี้ออกจากสารระบบคลังสินค้าใช่หรือไม่?
            </p>
            
            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">รหัสอะไหล่:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {itemToDelete.code}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">ชื่ออะไหล่:</span>
                <span className="font-bold text-slate-900 text-right">{itemToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">จำนวนคงเหลือในคลัง:</span>
                <span className="font-bold text-rose-600">
                  {itemToDelete.currentStock} {itemToDelete.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ราคาทุน:</span>
                <span className="font-mono text-slate-800">฿{itemToDelete.unitCost.toLocaleString()}</span>
              </div>
              {itemToDelete.locationRack && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ตำแหน่งจัดเก็บ:</span>
                  <span className="font-medium text-slate-700">📍 {itemToDelete.locationRack}</span>
                </div>
              )}
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 text-center font-medium">
              ⚠️ คำเตือน: หากลบแล้ว ข้อมูลจะไม่สามารถกู้คืนได้
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบอะไหล่</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
