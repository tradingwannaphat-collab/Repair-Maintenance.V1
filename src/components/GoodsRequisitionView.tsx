import React, { useState, useMemo } from "react";
import { 
  PackageMinus, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  Truck, 
  Wrench, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Boxes, 
  TrendingDown, 
  Sparkles, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { 
  GoodsRequisitionRecord, 
  GoodsRequisitionItem, 
  InventoryItem, 
  VehicleRecord, 
  RepairTicket, 
  RepairCategory 
} from "../types";
import { CATEGORIES_CONFIG } from "../data/categories";

interface GoodsRequisitionViewProps {
  requisitions: GoodsRequisitionRecord[];
  inventory: InventoryItem[];
  vehicles: VehicleRecord[];
  tickets: RepairTicket[];
  onAddRequisition: (requisition: GoodsRequisitionRecord, updatedInventory: InventoryItem[]) => void;
  onDeleteRequisition?: (requisitionId: string, restock: boolean) => void;
  onSelectTicket?: (ticket: RepairTicket) => void;
}

export const GoodsRequisitionView: React.FC<GoodsRequisitionViewProps> = ({
  requisitions,
  inventory,
  vehicles,
  tickets,
  onAddRequisition,
  onDeleteRequisition,
  onSelectTicket
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<GoodsRequisitionRecord | null>(null);

  // Delete Confirmation States
  const [reqToDelete, setReqToDelete] = useState<GoodsRequisitionRecord | null>(null);
  const [restockOnDelete, setRestockOnDelete] = useState<boolean>(true);

  // Form State for New Requisition
  const [requisitionType, setRequisitionType] = useState<"repair_ticket" | "vehicle_maintenance" | "general_use">("repair_ticket");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [department, setDepartment] = useState<string>(vehicles[0]?.department || "ฝ่ายขนส่งสินค้าหนักโรงงาน");
  const [requestedBy, setRequestedBy] = useState<string>("ช่างประสิทธิ์ สายชล (หัวหน้าช่าง)");
  const [approvedBy, setApprovedBy] = useState<string>("ผู้จัดการแผนกซ่อมบำรุง");
  const [requisitionDate, setRequisitionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [purpose, setPurpose] = useState<string>("เบิกอะไหล่เปลี่ยนถ่ายตามรอบและงานซ่อมบำรุงประจำวัน");
  const [notes, setNotes] = useState<string>("");

  // Items to disburse
  const [reqItems, setReqItems] = useState<Array<{
    inventoryItemId: string;
    itemCode: string;
    itemName: string;
    category: RepairCategory;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    availableStock: number;
  }>>([
    {
      inventoryItemId: inventory[0]?.id || "",
      itemCode: inventory[0]?.code || "LUB-15W40-18L",
      itemName: inventory[0]?.name || "น้ำมันเครื่องดีเซลสังเคราะห์ 15W-40 (ถัง 18 ลิตร)",
      category: inventory[0]?.category || "lubricant",
      quantity: 1,
      unit: inventory[0]?.unit || "ถัง",
      unitCost: inventory[0]?.unitCost || 1850,
      totalCost: (inventory[0]?.unitCost || 1850) * 1,
      availableStock: inventory[0]?.currentStock || 0
    }
  ]);

  // Selected vehicle details
  const currentSelectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Active repair tickets list
  const activeTickets = useMemo(() => {
    return tickets.filter(t => t.status !== "completed" && t.status !== "cancelled");
  }, [tickets]);

  // Handle vehicle change
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const found = vehicles.find(v => v.id === vehicleId);
    if (found) {
      setDepartment(found.department);
      // Check if this vehicle has an active ticket
      const matchedTicket = activeTickets.find(
        t => t.licensePlate.toLowerCase().trim() === found.licensePlate.toLowerCase().trim()
      );
      if (matchedTicket) {
        setSelectedTicketId(matchedTicket.id);
        setPurpose(`เบิกอะไหล่สำหรับใบแจ้งซ่อม ${matchedTicket.ticketNumber} (${matchedTicket.symptoms.slice(0, 40)})`);
      }
    }
  };

  // Handle ticket change
  const handleTicketChange = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const foundTicket = tickets.find(t => t.id === ticketId);
    if (foundTicket) {
      setDepartment(foundTicket.department);
      setPurpose(`เบิกอะไหล่สำหรับงานซ่อม: ${foundTicket.ticketNumber} - ${foundTicket.symptoms}`);
      // Find matching vehicle
      const matchVeh = vehicles.find(
        v => v.licensePlate.toLowerCase().trim() === foundTicket.licensePlate.toLowerCase().trim()
      );
      if (matchVeh) {
        setSelectedVehicleId(matchVeh.id);
      }
    }
  };

  // Handle item change in modal
  const handleItemSelect = (index: number, itemId: string) => {
    const found = inventory.find(i => i.id === itemId);
    if (found) {
      const updated = [...reqItems];
      updated[index] = {
        ...updated[index],
        inventoryItemId: found.id,
        itemCode: found.code,
        itemName: found.name,
        category: found.category,
        unit: found.unit,
        unitCost: found.unitCost,
        totalCost: found.unitCost * updated[index].quantity,
        availableStock: found.currentStock
      };
      setReqItems(updated);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...reqItems];
    const qty = Math.max(1, quantity);
    updated[index] = {
      ...updated[index],
      quantity: qty,
      totalCost: qty * updated[index].unitCost
    };
    setReqItems(updated);
  };

  const handleAddItemRow = () => {
    const first = inventory[0];
    setReqItems([
      ...reqItems,
      {
        inventoryItemId: first?.id || "",
        itemCode: first?.code || "PART-001",
        itemName: first?.name || "อะไหล่",
        category: first?.category || "other",
        quantity: 1,
        unit: first?.unit || "ชิ้น",
        unitCost: first?.unitCost || 500,
        totalCost: (first?.unitCost || 500) * 1,
        availableStock: first?.currentStock || 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (reqItems.length === 1) {
      const first = inventory[0];
      setReqItems([
        {
          inventoryItemId: first?.id || "",
          itemCode: first?.code || "PART-001",
          itemName: first?.name || "เลือกอะไหล่",
          category: first?.category || "other",
          quantity: 1,
          unit: first?.unit || "ชิ้น",
          unitCost: first?.unitCost || 0,
          totalCost: 0,
          availableStock: first?.currentStock || 0
        }
      ]);
      return;
    }
    setReqItems(reqItems.filter((_, i) => i !== index));
  };

  // Delete Requisition Handler with In-App Confirmation
  const handleDeleteRequisitionClick = (req: GoodsRequisitionRecord) => {
    setReqToDelete(req);
    setRestockOnDelete(true);
  };

  const handleConfirmDeleteRequisition = () => {
    if (!reqToDelete) return;
    if (onDeleteRequisition) {
      onDeleteRequisition(reqToDelete.id, restockOnDelete);
    }
    if (selectedRequisition?.id === reqToDelete.id) {
      setSelectedRequisition(null);
    }
    setReqToDelete(null);
  };

  // Validate if stock is sufficient
  const hasInsufficientStock = reqItems.some(item => item.quantity > item.availableStock);
  const totalRequisitionAmount = reqItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalRequisitionQty = reqItems.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      const q = searchQuery.toLowerCase();
      return (
        r.requisitionNumber.toLowerCase().includes(q) ||
        (r.licensePlate && r.licensePlate.toLowerCase().includes(q)) ||
        (r.ticketNumber && r.ticketNumber.toLowerCase().includes(q)) ||
        r.requestedBy.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.items.some(i => i.itemName.toLowerCase().includes(q))
      );
    });
  }, [requisitions, searchQuery]);

  // Submit Requisition
  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasInsufficientStock) {
      alert("⚠️ ไม่สามารถเบิกสินค้าได้ เนื่องจากมีบางรายการที่จำนวนเบิกมากกว่าสต็อกคงเหลือในคลัง");
      return;
    }

    const genNumber = `REQ-${new Date().getFullYear()}-${String(requisitions.length + 1).padStart(4, "0")}`;
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const newRequisition: GoodsRequisitionRecord = {
      id: `REQ-${Date.now()}`,
      requisitionNumber: genNumber,
      requisitionDate,
      requisitionType,
      ticketId: selectedTicketId || undefined,
      ticketNumber: selectedTicket?.ticketNumber || undefined,
      vehicleId: selectedVehicleId || undefined,
      licensePlate: currentSelectedVehicle?.licensePlate || undefined,
      department,
      requestedBy,
      approvedBy,
      purpose,
      items: reqItems.map((item, idx) => ({
        id: `RQI-${Date.now()}-${idx}`,
        inventoryItemId: item.inventoryItemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.totalCost
      })),
      totalAmount: totalRequisitionAmount,
      totalQuantity: totalRequisitionQty,
      status: "completed",
      notes: notes || undefined,
      createdAt: new Date().toISOString()
    };

    // Deduct stock in inventory
    const updatedInventory = [...inventory];
    reqItems.forEach(item => {
      const idx = updatedInventory.findIndex(inv => inv.id === item.inventoryItemId);
      if (idx >= 0) {
        updatedInventory[idx] = {
          ...updatedInventory[idx],
          currentStock: Math.max(0, updatedInventory[idx].currentStock - item.quantity),
          updatedAt: new Date().toISOString()
        };
      }
    });

    onAddRequisition(newRequisition, updatedInventory);
    setIsModalOpen(false);
    alert(`✅ บันทึกการเบิกของเลขที่ ${genNumber} เรียบร้อยแล้ว สต็อกคลังสินค้าถูกตัดยอดอัตโนมัติ`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-amber-600/30 p-3 rounded-xl border border-amber-500/30 text-amber-400">
              <PackageMinus className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">ระบบเบิกของ & อะไหล่ใช้งาน (Goods Requisition)</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  ISO: TNB-MT-GI-001-Rev.01
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ISO 9001 / 39001
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                เบิกอะไหล่ตรงเข้าทะเบียนรถหรือใบสั่งซ่อม พร้อมตรวจสอบสต็อกคงเหลือและตัดยอดอัตโนมัติตามมาตรฐานควบคุมพัสดุ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              id="btn-open-new-requisition"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ เบิกอะไหล่ / ของใช้</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium">ใบเบิกของสะสม</div>
            <div className="text-2xl font-black text-white mt-0.5">{requisitions.length} <span className="text-xs font-normal text-slate-400">ใบ</span></div>
          </div>

          <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/40">
            <div className="text-[11px] text-amber-400 font-medium">มูลค่าเบิกจ่ายรวม</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">
              ฿{requisitions.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-blue-950/40 p-3.5 rounded-xl border border-blue-800/40">
            <div className="text-[11px] text-blue-400 font-medium">ทะเบียนรถที่เบิกอะไหล่</div>
            <div className="text-2xl font-black text-blue-300 mt-0.5">
              {new Set(requisitions.map(r => r.licensePlate).filter(Boolean)).size} <span className="text-xs font-normal text-blue-400/80">คัน</span>
            </div>
          </div>

          <div className="bg-rose-950/40 p-3.5 rounded-xl border border-rose-800/40">
            <div className="text-[11px] text-rose-400 font-medium">สินค้าในคลังใกล้หมด</div>
            <div className="text-2xl font-black text-rose-300 mt-0.5">
              {inventory.filter(i => i.currentStock <= i.minStockLevel).length} <span className="text-xs font-normal text-rose-400/80">รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบเบิก, ทะเบียนรถ, เลขที่ใบแจ้งซ่อม, ผู้เบิก หรือชื่ออะไหล่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
        >
          + สร้างใบเบิกของ
        </button>
      </div>

      {/* Requisition Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">เลขที่ใบเบิก / วันที่</th>
                <th className="py-3 px-4">ทะเบียนรถ / แผนก</th>
                <th className="py-3 px-4">งานซ่อมที่เชื่อมโยง</th>
                <th className="py-3 px-4">รายการอะไหล่ที่เบิก</th>
                <th className="py-3 px-4 text-center">จำนวนชิ้น</th>
                <th className="py-3 px-4 text-right">มูลค่ารวม</th>
                <th className="py-3 px-4">ผู้เบิก / ช่าง</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequisitions.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{req.requisitionNumber}</div>
                    <div className="text-[11px] text-slate-400">{req.requisitionDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    {req.licensePlate ? (
                      <div>
                        <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {req.licensePlate}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{req.department}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">เบิกใช้ทั่วไป ({req.department})</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {req.ticketNumber ? (
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {req.ticketNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">- เบิกตรง -</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5 max-w-xs">
                      {req.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-slate-700 truncate">
                          • {it.itemName} ({it.quantity} {it.unit})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {req.totalQuantity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                    ฿{req.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    <div className="font-medium text-slate-800">{req.requestedBy}</div>
                    <div className="text-slate-400">{req.purpose}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setSelectedRequisition(req)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        title="ดูรายละเอียดใบเบิก"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ดูใบเบิก</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRequisitionClick(req)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                        title={`ลบใบเบิก ${req.requisitionNumber}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequisitions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <PackageMinus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    ไม่พบประวัติการเบิกของ / อะไหล่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Requisition Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-2.5">
                <PackageMinus className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold">สร้างใบเบิกของ & อะไหล่ (Goods Requisition)</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRequisition} className="p-6 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วัตถุประสงค์การเบิก
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequisitionType("repair_ticket")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      requisitionType === "repair_ticket"
                        ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🛠️ เบิกใส่งานซ่อม (Repair Ticket)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequisitionType("vehicle_maintenance")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      requisitionType === "vehicle_maintenance"
                        ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🚛 เบิกประจำทะเบียนรถ (Vehicle)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequisitionType("general_use")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      requisitionType === "general_use"
                        ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📦 เบิกใช้งานทั่วไปในคลัง/อู่
                  </button>
                </div>
              </div>

              {/* Vehicle & Ticket Auto-Fill Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>⚡ เลือกทะเบียนรถ TNB</span>
                    <span className="text-[10px] text-blue-600 font-bold">Auto-Fill</span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="">-- ไม่ระบุทะเบียน (เบิกทั่วไป) --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} ({v.vehicleBrand} {v.vehicleModel}) - {v.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Repair Ticket Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>เชื่อมโยงกับใบแจ้งซ่อม</span>
                    <span className="text-[10px] text-amber-700 font-bold">{activeTickets.length} งานค้าง</span>
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => handleTicketChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
                  >
                    <option value="">-- ไม่ระบุใบซ่อม (เบิกตรง) --</option>
                    {tickets.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.ticketNumber}] {t.licensePlate} - {t.symptoms.slice(0, 35)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department & Requisition Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่เบิกของ
                  </label>
                  <input
                    type="date"
                    required
                    value={requisitionDate}
                    onChange={(e) => setRequisitionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้เบิก / ช่างผู้รับผิดชอบ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ช่างประสิทธิ์ สายชล"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้อนุมัติการเบิก
                  </label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    รายการอะไหล่และพัสดุที่ต้องการเบิก ({reqItems.length} รายการ)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-xs font-bold border border-amber-200 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ เพิ่มรายการเบิก</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {reqItems.map((item, idx) => {
                    const isOver = item.quantity > item.availableStock;
                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border space-y-2 ${
                          isOver ? "bg-rose-50 border-rose-300" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          {/* Item Select */}
                          <div className="md:col-span-6">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">เลือกสินค้าในคลัง</label>
                            <select
                              value={item.inventoryItemId}
                              onChange={(e) => handleItemSelect(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            >
                              {inventory.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                  [{inv.code}] {inv.name} (คงเหลือ: {inv.currentStock} {inv.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Qty */}
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">จำนวนที่เบิก</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                              className={`w-full px-2.5 py-1.5 text-xs rounded border font-mono text-center font-bold ${
                                isOver ? "border-rose-500 bg-rose-100 text-rose-800" : "border-slate-300"
                              }`}
                            />
                          </div>

                          {/* Unit & Stock note */}
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">คงเหลือ</label>
                            <div className="text-xs font-semibold text-slate-700">
                              {item.availableStock} {item.unit}
                            </div>
                          </div>

                          {/* Subtotal & Delete */}
                          <div className="md:col-span-2 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500">มูลค่า</div>
                              <div className="font-mono font-bold text-xs text-amber-800">฿{item.totalCost.toLocaleString()}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              title={reqItems.length === 1 ? "ล้างค่ารายการนี้" : "ลบรายการอะไหล่นี้ออกจากใบเบิก"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Overstock Warning */}
                        {isOver && (
                          <div className="text-[11px] font-bold text-rose-700 flex items-center pt-1">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            จำนวนที่ขอเบิก ({item.quantity}) เกินกว่าสต็อกคงเหลือในคลัง ({item.availableStock} {item.unit}) กรุณาลดจำนวนหรือตรวจรับของเข้าคลังก่อน
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">
                  รวมรายการเบิกทั้งหมด: {totalRequisitionQty} ชิ้น
                </span>
                <span className="text-base font-black text-amber-950 font-mono">
                  มูลค่ารวม: ฿{totalRequisitionAmount.toLocaleString()}
                </span>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เหตุผลและรายละเอียดการเบิกใช้งาน</label>
                <textarea
                  rows={2}
                  placeholder="เช่น เปลี่ยนถ่ายน้ำมันเครื่องรอบ 140,000 กม. และเปลี่ยนผ้าเบรกหน้า"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              {/* Submit Buttons */}
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
                  disabled={hasInsufficientStock}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all ${
                    hasInsufficientStock
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  ยืนยันการเบิกและตัดสต็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {selectedRequisition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">ใบเบิกของ & อะไหล่ (Requisition Voucher)</span>
                <h3 className="text-base font-black text-slate-900">{selectedRequisition.requisitionNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedRequisition(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
              <div><strong>วันที่เบิก:</strong> {selectedRequisition.requisitionDate}</div>
              <div><strong>ทะเบียนรถ:</strong> {selectedRequisition.licensePlate || "เบิกใช้งานทั่วไป"}</div>
              <div><strong>ใบแจ้งซ่อม:</strong> {selectedRequisition.ticketNumber || "-"}</div>
              <div><strong>ผู้เบิก:</strong> {selectedRequisition.requestedBy}</div>
              <div className="col-span-2"><strong>วัตถุประสงค์:</strong> {selectedRequisition.purpose}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">รายการอะไหล่ที่เบิกจ่าย</div>
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
                    {selectedRequisition.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{it.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.itemCode}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{it.quantity} {it.unit}</td>
                        <td className="py-2 px-3 text-right font-mono">฿{it.unitCost.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">฿{it.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl flex items-center justify-between text-xs font-bold text-amber-950">
              <span>มูลค่าการเบิกจ่ายรวมทั้งสิ้น</span>
              <span className="text-base font-black font-mono">฿{selectedRequisition.totalAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteRequisitionClick(selectedRequisition)}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ลบใบเบิกนี้</span>
              </button>
              <button
                onClick={() => setSelectedRequisition(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Goods Requisition Confirmation Modal */}
      {reqToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center">
              ยืนยันการลบใบเบิกของ / อะไหล่
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณต้องการลบข้อมูลใบเบิกเลขที่ <span className="font-bold text-slate-800">{reqToDelete.requisitionNumber}</span> ใช่หรือไม่?
            </p>
            
            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">เลขที่ใบเบิก:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {reqToDelete.requisitionNumber}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">ผู้ขอเบิก:</span>
                <span className="font-bold text-slate-900 text-right">{reqToDelete.requestedBy}</span>
              </div>
              {reqToDelete.licensePlate && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">สำหรับทะเบียนรถ:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    🚚 {reqToDelete.licensePlate}
                  </span>
                </div>
              )}
              {reqToDelete.ticketNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ใบแจ้งซ่อม:</span>
                  <span className="font-mono text-slate-800 font-semibold">{reqToDelete.ticketNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">วันที่เบิก:</span>
                <span className="font-medium text-slate-800">{reqToDelete.requisitionDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">จำนวนอะไหล่ที่เบิก:</span>
                <span className="font-bold text-slate-900">
                  {reqToDelete.items?.length || 0} รายการ ({reqToDelete.totalQuantity} ชิ้น)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">มูลค่ารวม:</span>
                <span className="font-mono font-bold text-amber-800">฿{reqToDelete.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Restock Checkbox */}
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={restockOnDelete}
                  onChange={(e) => setRestockOnDelete(e.target.checked)}
                  className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-950">คืนสต็อกอะไหล่กลับเข้าคลังสินค้าทันที (Restock)</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    นำจำนวนอะไหล่ในใบเบิกนี้บวกเพิ่มกลับเข้าไปในยอดสต็อกคงเหลือปัจจุบันอัตโนมัติ
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setReqToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRequisition}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบใบเบิก</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
