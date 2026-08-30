import React, { useState, useMemo } from "react";
import { 
  PackagePlus, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  DollarSign, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Tag, 
  Boxes, 
  ArrowDownLeft,
  Printer,
  ChevronDown,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { GoodsReceiptRecord, GoodsReceiptItem, InventoryItem, RepairCategory } from "../types";
import { CATEGORIES_CONFIG } from "../data/categories";

interface GoodsReceiptViewProps {
  receipts: GoodsReceiptRecord[];
  inventory: InventoryItem[];
  onAddReceipt: (receipt: GoodsReceiptRecord, updatedInventory: InventoryItem[]) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteReceipt?: (receiptId: string, rollbackStock: boolean) => void;
  onDeleteInventoryItem?: (itemId: string) => void;
}

export const GoodsReceiptView: React.FC<GoodsReceiptViewProps> = ({
  receipts,
  inventory,
  onAddReceipt,
  onUpdateInventoryItem,
  onDeleteReceipt,
  onDeleteInventoryItem
}) => {
  const [activeTab, setActiveTab] = useState<"receipts" | "inventory">("receipts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceiptRecord | null>(null);

  // Delete Confirmation States
  const [receiptToDelete, setReceiptToDelete] = useState<GoodsReceiptRecord | null>(null);
  const [rollbackStockOnDelete, setRollbackStockOnDelete] = useState<boolean>(true);
  const [invItemToDelete, setInvItemToDelete] = useState<InventoryItem | null>(null);

  // Form State for New Receipt
  const [supplierName, setSupplierName] = useState("PTT Lubricants Official");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [receivedBy, setReceivedBy] = useState("นายสมเกียรติ พัสดุ (เจ้าหน้าที่คลัง)");
  const [department, setDepartment] = useState("ฝ่ายบริหารยานพาหนะส่วนกลาง");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Items to receive in the modal
  const [receiptItems, setReceiptItems] = useState<Array<{
    inventoryItemId: string;
    itemCode: string;
    itemName: string;
    category: RepairCategory;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    isCustomNewItem: boolean;
  }>>([
    {
      inventoryItemId: inventory[0]?.id || "",
      itemCode: inventory[0]?.code || "LUB-15W40-18L",
      itemName: inventory[0]?.name || "น้ำมันเครื่องดีเซลสังเคราะห์ 15W-40 (ถัง 18 ลิตร)",
      category: inventory[0]?.category || "lubricant",
      quantity: 5,
      unit: inventory[0]?.unit || "ถัง",
      unitCost: inventory[0]?.unitCost || 1850,
      totalCost: (inventory[0]?.unitCost || 1850) * 5,
      isCustomNewItem: false
    }
  ]);

  // Inventory search
  const [invSearch, setInvSearch] = useState("");
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>("all");

  // Summary Metrics
  const totalReceiptsCount = receipts.length;
  const totalAmountReceived = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalItemsInStock = inventory.reduce((sum, i) => sum + i.currentStock, 0);
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0);

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const q = searchQuery.toLowerCase();
      return (
        r.receiptNumber.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        (r.poNumber && r.poNumber.toLowerCase().includes(q)) ||
        r.receivedBy.toLowerCase().includes(q) ||
        r.items.some(i => i.itemName.toLowerCase().includes(q))
      );
    });
  }, [receipts, searchQuery]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(i => {
      const q = invSearch.toLowerCase();
      const matchSearch = i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || (i.locationRack && i.locationRack.toLowerCase().includes(q));
      const matchCat = invCategoryFilter === "all" || i.category === invCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [inventory, invSearch, invCategoryFilter]);

  // Handle item change in modal
  const handleItemSelect = (index: number, itemId: string) => {
    const found = inventory.find(i => i.id === itemId);
    if (found) {
      const updated = [...receiptItems];
      updated[index] = {
        ...updated[index],
        inventoryItemId: found.id,
        itemCode: found.code,
        itemName: found.name,
        category: found.category,
        unit: found.unit,
        unitCost: found.unitCost,
        totalCost: found.unitCost * updated[index].quantity,
        isCustomNewItem: false
      };
      setReceiptItems(updated);
    }
  };

  const handleQuantityCostChange = (index: number, quantity: number, unitCost: number) => {
    const updated = [...receiptItems];
    const qty = Math.max(1, quantity);
    const cost = Math.max(0, unitCost);
    updated[index] = {
      ...updated[index],
      quantity: qty,
      unitCost: cost,
      totalCost: qty * cost
    };
    setReceiptItems(updated);
  };

  const handleAddItemRow = () => {
    const first = inventory[0];
    setReceiptItems([
      ...receiptItems,
      {
        inventoryItemId: first?.id || `INV-NEW-${Date.now()}`,
        itemCode: first?.code || "PART-NEW",
        itemName: first?.name || "อะไหล่ใหม่",
        category: first?.category || "other",
        quantity: 1,
        unit: first?.unit || "ชิ้น",
        unitCost: first?.unitCost || 500,
        totalCost: first?.unitCost || 500,
        isCustomNewItem: false
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (receiptItems.length === 1) {
      // If only 1 item, reset it cleanly
      const first = inventory[0];
      setReceiptItems([
        {
          inventoryItemId: first?.id || "",
          itemCode: first?.code || "PART-NEW",
          itemName: first?.name || "เลือกสินค้า/อะไหล่",
          category: first?.category || "other",
          quantity: 1,
          unit: first?.unit || "ชิ้น",
          unitCost: first?.unitCost || 0,
          totalCost: 0,
          isCustomNewItem: false
        }
      ]);
      return;
    }
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
  };

  // Delete Receipt Handler with In-App Confirmation
  const handleDeleteReceiptClick = (receipt: GoodsReceiptRecord) => {
    setReceiptToDelete(receipt);
    setRollbackStockOnDelete(true);
  };

  const handleConfirmDeleteReceipt = () => {
    if (!receiptToDelete) return;
    if (onDeleteReceipt) {
      onDeleteReceipt(receiptToDelete.id, rollbackStockOnDelete);
    }
    if (selectedReceipt?.id === receiptToDelete.id) {
      setSelectedReceipt(null);
    }
    setReceiptToDelete(null);
  };

  const handleConfirmDeleteInventoryItem = () => {
    if (!invItemToDelete) return;
    if (onDeleteInventoryItem) {
      onDeleteInventoryItem(invItemToDelete.id);
    }
    setInvItemToDelete(null);
  };

  const totalReceiptModalAmount = receiptItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalReceiptModalQty = receiptItems.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Receipt
  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert("กรุณาระบุชื่อผู้จำหน่าย / ซัพพลายเออร์");
      return;
    }

    const genNumber = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, "0")}`;
    
    // Construct new Receipt Record
    const newReceipt: GoodsReceiptRecord = {
      id: `REC-${Date.now()}`,
      receiptNumber: genNumber,
      receivedDate,
      supplierName,
      poNumber: poNumber || undefined,
      invoiceNumber: invoiceNumber || undefined,
      receivedBy,
      department,
      items: receiptItems.map((item, idx) => ({
        id: `RI-${Date.now()}-${idx}`,
        inventoryItemId: item.inventoryItemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.totalCost
      })),
      totalAmount: totalReceiptModalAmount,
      totalQuantity: totalReceiptModalQty,
      notes: notes || undefined,
      createdAt: new Date().toISOString()
    };

    // Update Stock in inventory
    const updatedInventory = [...inventory];
    receiptItems.forEach(item => {
      const idx = updatedInventory.findIndex(inv => inv.id === item.inventoryItemId);
      if (idx >= 0) {
        updatedInventory[idx] = {
          ...updatedInventory[idx],
          currentStock: updatedInventory[idx].currentStock + item.quantity,
          unitCost: item.unitCost, // Update latest cost
          updatedAt: new Date().toISOString()
        };
      } else {
        // New item entry
        updatedInventory.push({
          id: item.inventoryItemId || `INV-${Date.now()}`,
          code: item.itemCode || `PART-${Date.now().toString().slice(-4)}`,
          name: item.itemName,
          category: item.category,
          unit: item.unit,
          currentStock: item.quantity,
          minStockLevel: 2,
          unitCost: item.unitCost,
          supplier: supplierName,
          updatedAt: new Date().toISOString()
        });
      }
    });

    onAddReceipt(newReceipt, updatedInventory);
    setIsModalOpen(false);
    alert(`✅ บันทึกการรับของเลขที่ ${genNumber} เรียบร้อยแล้ว สต็อกคลังสินค้าได้รับการปรับยอดเพิ่มขึ้นทันที`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-emerald-600/30 p-3 rounded-xl border border-emerald-500/30 text-emerald-400">
              <PackagePlus className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">ระบบรับของเข้าคลัง (Goods Receiving / Stock In)</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  ISO: TNB-MT-GR-001-Rev.01
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ISO 9001 / 39001
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                บันทึกการรับเข้าอะไหล่ น้ำมันหล่อลื่น ยาง และพัสดุซ่อมบำรุง พร้อมปรับปรุงสต็อกคงเหลืออัตโนมัติตามมาตรฐานควบคุมพัสดุ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              id="btn-open-new-receipt"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ บันทึกรับของเข้าคลัง</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium">ใบรับของสะสม</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalReceiptsCount} <span className="text-xs font-normal text-slate-400">ใบ</span></div>
          </div>

          <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/40">
            <div className="text-[11px] text-emerald-400 font-medium">มูลค่ารับเข้ารวม</div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">฿{totalAmountReceived.toLocaleString()}</div>
          </div>

          <div className="bg-blue-950/40 p-3.5 rounded-xl border border-blue-800/40">
            <div className="text-[11px] text-blue-400 font-medium">จำนวนชิ้นในสต็อกคลัง</div>
            <div className="text-2xl font-black text-blue-300 mt-0.5">{totalItemsInStock.toLocaleString()} <span className="text-xs font-normal text-blue-400/80">หน่วย</span></div>
          </div>

          <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/40">
            <div className="text-[11px] text-amber-400 font-medium">มูลค่าสต็อกคงคลังปัจจุบัน</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">฿{totalInventoryValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("receipts")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "receipts"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ประวัติใบรับของ (Goods Receipts) ({receipts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "inventory"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>สต็อกพัสดุและอะไหล่คงคลัง ({inventory.length} รายการ)</span>
        </button>
      </div>

      {/* Tab Content 1: Receipts History */}
      {activeTab === "receipts" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ใบรับของ, ผู้จำหน่าย, เลขที่ PO, ผู้รับพัสดุ หรือชื่อสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
            >
              + บันทึกรับของ
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">เลขที่ใบรับ / วันที่</th>
                    <th className="py-3 px-4">ผู้จำหน่าย / ซัพพลายเออร์</th>
                    <th className="py-3 px-4">เลขที่ PO / Invoice</th>
                    <th className="py-3 px-4">รายการสินค้าที่รับเข้า</th>
                    <th className="py-3 px-4 text-center">จำนวนรวม</th>
                    <th className="py-3 px-4 text-right">ยอดเงินรวม</th>
                    <th className="py-3 px-4">ผู้รับของ</th>
                    <th className="py-3 px-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{rec.receiptNumber}</div>
                        <div className="text-[11px] text-slate-400">{rec.receivedDate}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {rec.supplierName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {rec.poNumber || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {rec.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 truncate">
                              • {it.itemName} ({it.quantity} {it.unit})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {rec.totalQuantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ฿{rec.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        {rec.receivedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
                            title="ดูรายละเอียดใบรับของ"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูรายละเอียด</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReceiptClick(rec)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                            title={`ลบใบรับของ ${rec.receiptNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <PackagePlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        ไม่พบประวัติการรับของเข้าคลัง
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Real-time Inventory */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัสอะไหล่, ชื่อพัสดุ, ชั้นวาง..."
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="w-full sm:w-56">
              <select
                value={invCategoryFilter}
                onChange={(e) => setInvCategoryFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">ทุกหมวดหมู่อะไหล่</option>
                {Object.values(CATEGORIES_CONFIG).map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">รหัสสินค้า / ตำแหน่งชั้นวาง</th>
                    <th className="py-3 px-4">ชื่ออะไหล่ / พัสดุ</th>
                    <th className="py-3 px-4">หมวดหมู่</th>
                    <th className="py-3 px-4 text-center">สต็อกคงเหลือ</th>
                    <th className="py-3 px-4 text-right">ราคาทุน / หน่วย</th>
                    <th className="py-3 px-4 text-right">มูลค่าสต็อกรวม</th>
                    <th className="py-3 px-4">สถานะสต็อก</th>
                    <th className="py-3 px-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minStockLevel;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900">{item.code}</div>
                          <div className="text-[10px] text-slate-400">{item.locationRack || "ไม่ระบุชั้นวาง"}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.name}
                          {item.notes && <div className="text-[10px] text-slate-400 font-normal">{item.notes}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {CATEGORIES_CONFIG[item.category]?.nameTh || item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold font-mono text-sm ${isLow ? "text-rose-600" : "text-slate-800"}`}>
                            {item.currentStock}
                          </span>{" "}
                          <span className="text-slate-400 text-[11px]">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                          ฿{item.unitCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ฿{(item.currentStock * item.unitCost).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              สต็อกใกล้หมด (เตือน &le; {item.minStockLevel})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> ปกติ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {onDeleteInventoryItem && (
                            <button
                              type="button"
                              onClick={() => setInvItemToDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                              title={`ลบ ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Goods Receipt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-2.5">
                <PackagePlus className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">บันทึกรับของเข้าคลัง TNB (Goods Receipt)</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReceipt} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้จำหน่าย / ซัพพลายเออร์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น PTT Lubricants Official, ISUZU Parts Center"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่ตรวจรับของ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เลขที่ใบสั่งซื้อ (PO Number) / ใบส่งของ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น PO-2026-0881 หรือ DO-9921"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เจ้าหน้าที่ผู้ตรวจรับพัสดุ
                  </label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    รายการสินค้าและอะไหล่ที่รับเข้า ({receiptItems.length} รายการ)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-bold border border-emerald-200 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการสินค้า</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {receiptItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        {/* Item selector */}
                        <div className="md:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">เลือกสินค้าจากสารระบบ</label>
                          <select
                            value={item.inventoryItemId}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          >
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>
                                [{inv.code}] {inv.name} (คงเหลือ {inv.currentStock} {inv.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">จำนวนรับ</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityCostChange(idx, Number(e.target.value), item.unitCost)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono text-center font-bold"
                          />
                        </div>

                        {/* Unit */}
                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">หน่วย</label>
                          <span className="block py-1.5 text-xs text-slate-600 font-medium">{item.unit}</span>
                        </div>

                        {/* Unit Cost */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ทุน/หน่วย (฿)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleQuantityCostChange(idx, item.quantity, Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono text-right"
                          />
                        </div>

                        {/* Total Cost & Delete */}
                        <div className="md:col-span-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">ราคารวม</div>
                            <div className="font-mono font-bold text-xs text-emerald-700">฿{item.totalCost.toLocaleString()}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            title={receiptItems.length === 1 ? "ล้างค่ารายการนี้" : "ลบรายการอะไหล่นี้ออกจากใบรับ"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  รวมรับเข้าทั้งหมด: {totalReceiptModalQty} ชิ้น/หน่วย
                </span>
                <span className="text-base font-black text-emerald-900 font-mono">
                  ยอดรวมทั้งสิ้น: ฿{totalReceiptModalAmount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หมายเหตุการตรวจรับ</label>
                <textarea
                  rows={2}
                  placeholder="เช่น สภาพสินค้าสมบูรณ์ 100%, จัดเก็บเข้าชั้นวาง A-01"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all"
                >
                  บันทึกรับเข้าคลังสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Receipt Details */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">ใบรับของเข้าคลัง (Goods Receipt Note)</span>
                <h3 className="text-base font-black text-slate-900">{selectedReceipt.receiptNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
              <div><strong>ผู้จำหน่าย:</strong> {selectedReceipt.supplierName}</div>
              <div><strong>วันที่รับของ:</strong> {selectedReceipt.receivedDate}</div>
              <div><strong>เลขที่ PO:</strong> {selectedReceipt.poNumber || "-"}</div>
              <div><strong>ผู้ตรวจรับ:</strong> {selectedReceipt.receivedBy}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">รายการสินค้าที่ตรวจรับ</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2 px-3">รหัส / ชื่อสินค้า</th>
                      <th className="py-2 px-3 text-center">จำนวน</th>
                      <th className="py-2 px-3 text-right">ทุน/หน่วย</th>
                      <th className="py-2 px-3 text-right">รวม (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{it.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.itemCode}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{it.quantity} {it.unit}</td>
                        <td className="py-2 px-3 text-right font-mono">฿{it.unitCost.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">฿{it.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>ยอดเงินรวมทั้งสิ้น</span>
              <span className="text-base font-black font-mono">฿{selectedReceipt.totalAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteReceiptClick(selectedReceipt)}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ลบใบรับของนี้</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Goods Receipt Confirmation Modal */}
      {receiptToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center">
              ยืนยันการลบใบรับของเข้าคลัง
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณต้องการลบข้อมูลใบรับของเลขที่ <span className="font-bold text-slate-800">{receiptToDelete.receiptNumber}</span> ใช่หรือไม่?
            </p>
            
            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">เลขที่ใบรับของ:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {receiptToDelete.receiptNumber}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">ผู้จำหน่าย:</span>
                <span className="font-bold text-slate-900 text-right">{receiptToDelete.supplierName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">วันที่รับของ:</span>
                <span className="font-medium text-slate-800">{receiptToDelete.receivedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">จำนวนสินค้า:</span>
                <span className="font-bold text-slate-900">
                  {receiptToDelete.items?.length || 0} รายการ ({receiptToDelete.totalQuantity} ชิ้น)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">มูลค่ารวม:</span>
                <span className="font-mono font-bold text-emerald-700">฿{receiptToDelete.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Rollback Stock Checkbox */}
            <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rollbackStockOnDelete}
                  onChange={(e) => setRollbackStockOnDelete(e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-amber-900">ปรับลดยอดสต็อกคงคลังคืนสภาพเดิม (Rollback)</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    นำจำนวนสินค้าในใบรับของนี้ออกจากยอดสต็อกคงเหลือปัจจุบันอัตโนมัติ
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setReceiptToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReceipt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบใบรับของ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inventory Item Confirmation Modal */}
      {invItemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center">
              ยืนยันการลบอะไหล่/พัสดุ
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณต้องการลบข้อมูลอะไหล่รายการนี้ออกจากสารระบบคลังใช่หรือไม่?
            </p>
            
            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">รหัสอะไหล่:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {invItemToDelete.code}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">ชื่อพัสดุ:</span>
                <span className="font-bold text-slate-900 text-right">{invItemToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">สต็อกคงเหลือ:</span>
                <span className="font-bold text-rose-600">
                  {invItemToDelete.currentStock} {invItemToDelete.unit}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setInvItemToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteInventoryItem}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบพัสดุ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
