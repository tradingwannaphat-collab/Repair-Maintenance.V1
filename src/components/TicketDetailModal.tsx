import React, { useState, useMemo } from "react";
import { 
  X, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Wrench, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Printer, 
  Camera, 
  History, 
  Layers, 
  ShieldAlert,
  ArrowRight,
  Send,
  Star,
  MessageSquare,
  Award,
  CheckSquare,
  Square,
  PackageMinus,
  Box,
  Boxes,
  ExternalLink,
  ChevronDown,
  Info,
  Check
} from "lucide-react";
import { 
  RepairTicket, 
  RepairStatus, 
  RepairItemPart, 
  RepairFeedback, 
  RepairIssueItem, 
  InventoryItem, 
  GoodsRequisitionRecord, 
  GoodsRequisitionItem,
  VehicleRecord,
  PostRepairCondition
} from "../types";
import { CATEGORIES_CONFIG, STATUS_CONFIG, getSubCategoryName } from "../data/categories";
import { BreakdownLocationView } from "./BreakdownLocationView";

interface TicketDetailModalProps {
  ticket: RepairTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (updatedTicket: RepairTicket) => void;
  onOpenPrint: (ticket: RepairTicket) => void;
  inventory?: InventoryItem[];
  vehicles?: VehicleRecord[];
  onDisburseStockPart?: (
    updatedTicket: RepairTicket,
    newPart: RepairItemPart,
    updatedInventory: InventoryItem[],
    newRequisition: GoodsRequisitionRecord
  ) => void;
  onRestockPart?: (
    updatedTicket: RepairTicket,
    removedPart: RepairItemPart,
    updatedInventory: InventoryItem[]
  ) => void;
}

const MECHANIC_LIST = [
  "ช่างวิชาญ (ช่างช่วงล่าง & เบรก)",
  "ช่างอนันต์ (ช่างระบบหล่อลื่น & ของเหลว)",
  "ช่างธีระพงษ์ (ช่างระบบไฟฟ้า & กล่อง ECU)",
  "ช่างประสิทธิ์ (ช่างเครื่องยนต์ & ไฮดรอลิก)",
  "ช่างสมเกียรติ (ช่างระบบปรับอากาศ & แอร์)",
  "ช่างมนตรี (ช่างระบบยาง & ตั้งศูนย์)",
  "ช่างสุรชัย (ช่างตัวถัง & สี 2K)"
];

const COMPLIMENT_TAGS = [
  "งานซ่อมเรียบร้อย",
  "ตรงต่อเวลา",
  "ช่างให้คำแนะนำดี",
  "อะไหล่แท้ตรงสเปก",
  "บริการรวดเร็ว",
  "ห้องโดยสารสะอาด"
];

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket,
  onOpenPrint,
  inventory = [],
  vehicles = [],
  onDisburseStockPart,
  onRestockPart
}) => {
  if (!isOpen || !ticket) return null;

  const [currentStatus, setCurrentStatus] = useState<RepairStatus>(ticket.status);
  const [assignedMechanic, setAssignedMechanic] = useState<string>(ticket.assignedMechanic || "");
  const [mechanicNotes, setMechanicNotes] = useState<string>(ticket.mechanicNotes || "");
  const [partsList, setPartsList] = useState<RepairItemPart[]>(ticket.partsList || []);
  const [laborCost, setLaborCost] = useState<number>(ticket.laborCost || 0);
  
  // Stock Disbursal States
  const [partSourceMode, setPartSourceMode] = useState<"stock" | "custom">("stock");
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string>(inventory[0]?.id || "");
  const [stockDisburseQty, setStockDisburseQty] = useState<number>(1);
  const [stockDisbursePrice, setStockDisbursePrice] = useState<number>(inventory[0]?.unitCost || 0);
  const [disburseSuccessMessage, setDisburseSuccessMessage] = useState<string | null>(null);

  // Manual / Custom Part States
  const [newPartName, setNewPartName] = useState("");
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(0);

  const [statusLogNote, setStatusLogNote] = useState("");
  const [completionImages, setCompletionImages] = useState<string[]>(ticket.completionImages || []);
  const [issues, setIssues] = useState<RepairIssueItem[]>(ticket.issues || []);

  // Post-repair Equipment Assessment States (Requirement: เพิ่มประเภทหลังซ่อมแล้วว่าอุปกรณ์ สามารถซ่อมได้หรือเสีย)
  const [postRepairEquipmentStatus, setPostRepairEquipmentStatus] = useState<'repairable' | 'scrap' | 'repaired_good' | 'mixed' | 'not_applicable'>(
    ticket.postRepairEquipmentStatus || 'repaired_good'
  );
  const [postRepairEquipmentNote, setPostRepairEquipmentNote] = useState<string>(
    ticket.postRepairEquipmentNote || ""
  );

  // Rating & Feedback State
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [techRating, setTechRating] = useState<number>(ticket.feedback?.technicianRating || 5);
  const [overallRating, setOverallRating] = useState<number>(ticket.feedback?.overallRating || 5);
  const [timelinessRating, setTimelinessRating] = useState<number>(ticket.feedback?.timelinessRating || 5);
  const [feedbackComment, setFeedbackComment] = useState<string>(ticket.feedback?.comment || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(ticket.feedback?.tags || ["งานซ่อมเรียบร้อย", "ตรงต่อเวลา"]);
  const [evaluatorName, setEvaluatorName] = useState<string>(ticket.feedback?.evaluatorName || ticket.requesterName || "ผู้ตรวจรับงาน");

  const categoryMeta = CATEGORIES_CONFIG[ticket.category];

  // Currently selected item from inventory dropdown
  const selectedInvItem = useMemo(() => {
    return inventory.find(item => item.id === selectedInventoryItemId) || null;
  }, [inventory, selectedInventoryItemId]);

  // Sync price when inventory item changes
  const handleSelectInventoryItem = (itemId: string) => {
    setSelectedInventoryItemId(itemId);
    const found = inventory.find(i => i.id === itemId);
    if (found) {
      setStockDisbursePrice(found.unitSellingPrice || found.unitCost || 0);
      setStockDisburseQty(1);
    }
  };

  // Calculate totals
  const partsCostTotal = partsList.reduce((sum, item) => sum + item.total, 0);
  const grandTotalCost = partsCostTotal + Number(laborCost);

  // Toggle issue resolved status
  const handleToggleIssue = (issueId: string) => {
    setIssues(prev => prev.map(iss => iss.id === issueId ? { ...iss, isResolved: !iss.isResolved } : iss));
  };

  // Handler: Disburse / Deduct Stock from Warehouse into Repair Ticket
  const handleDisburseStock = () => {
    if (!selectedInvItem) {
      alert("กรุณาเลือกรายการอะไหล่จากคลังสินค้า");
      return;
    }

    if (stockDisburseQty <= 0) {
      alert("กรุณาระบุจำนวนที่ต้องการเบิก (มากกว่า 0)");
      return;
    }

    if (selectedInvItem.currentStock < stockDisburseQty) {
      alert(`สต็อกคงเหลือไม่เพียงพอ (คงเหลือในคลัง ${selectedInvItem.currentStock} ${selectedInvItem.unit}, ขอเบิก ${stockDisburseQty} ${selectedInvItem.unit})`);
      return;
    }

    const nowIso = new Date().toISOString();
    const reqYear = new Date().getFullYear();
    const reqNumber = `REQ-${reqYear}-${String(Date.now()).slice(-4)}`;
    const mechanicInCharge = assignedMechanic || "ช่างซ่อมบำรุง TNB";

    // 1. Create requisition item
    const reqItem: GoodsRequisitionItem = {
      id: `req-item-${Date.now()}`,
      inventoryItemId: selectedInvItem.id,
      itemCode: selectedInvItem.code,
      itemName: selectedInvItem.name,
      category: selectedInvItem.category,
      quantity: Number(stockDisburseQty),
      unit: selectedInvItem.unit,
      unitCost: Number(stockDisbursePrice),
      totalCost: Number(stockDisburseQty) * Number(stockDisbursePrice)
    };

    // 2. Create official GoodsRequisitionRecord
    const newRequisition: GoodsRequisitionRecord = {
      id: `req-${Date.now()}`,
      requisitionNumber: reqNumber,
      requisitionDate: nowIso.split("T")[0],
      requisitionType: "repair_ticket",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      licensePlate: ticket.licensePlate,
      department: ticket.department,
      requestedBy: mechanicInCharge,
      approvedBy: "หัวหน้าฝ่ายซ่อมบำรุง TNB",
      purpose: `ตัดเบิกอะไหล่สำหรับใบแจ้งซ่อม ${ticket.ticketNumber} (${ticket.licensePlate}) - อาการ: ${ticket.symptoms.slice(0, 40)}`,
      items: [reqItem],
      totalAmount: reqItem.totalCost,
      totalQuantity: reqItem.quantity,
      status: "completed",
      notes: `ตัดเบิกสต็อกอัตโนมัติจากใบงานช่าง ${ticket.ticketNumber}`,
      createdAt: nowIso
    };

    // 3. Deduct stock in inventory
    const updatedInventory = inventory.map(inv => {
      if (inv.id === selectedInvItem.id) {
        return {
          ...inv,
          currentStock: Math.max(0, inv.currentStock - Number(stockDisburseQty)),
          updatedAt: nowIso
        };
      }
      return inv;
    });

    // 4. Create new ticket part
    const newPart: RepairItemPart = {
      id: `P-STOCK-${Date.now()}`,
      name: `${selectedInvItem.name} (${selectedInvItem.code})`,
      quantity: Number(stockDisburseQty),
      unitPrice: Number(stockDisbursePrice),
      total: Number(stockDisburseQty) * Number(stockDisbursePrice),
      inventoryItemId: selectedInvItem.id,
      itemCode: selectedInvItem.code,
      unit: selectedInvItem.unit,
      isDeductedFromStock: true,
      requisitionId: newRequisition.id,
      requisitionNumber: newRequisition.requisitionNumber,
      disbursedAt: nowIso,
      disbursedBy: mechanicInCharge
    };

    const updatedParts = [...partsList, newPart];
    const newPartsCost = updatedParts.reduce((sum, item) => sum + item.total, 0);
    const newGrandTotal = newPartsCost + Number(laborCost);

    // 5. Add timeline history log
    const updatedHistory = [
      ...ticket.history,
      {
        id: `h-disburse-${Date.now()}`,
        timestamp: nowIso,
        status: currentStatus,
        note: `📦 ตัดเบิกอะไหล่จากคลัง: ${selectedInvItem.name} x ${stockDisburseQty} ${selectedInvItem.unit} (ใบเบิก ${newRequisition.requisitionNumber}) ยอด ฿${newPart.total.toLocaleString()}`,
        updatedBy: mechanicInCharge
      }
    ];

    const updatedTicket: RepairTicket = {
      ...ticket,
      updatedAt: nowIso,
      status: currentStatus === "pending" ? "in_progress" : currentStatus,
      assignedMechanic: assignedMechanic.trim() || undefined,
      mechanicNotes: mechanicNotes.trim() || undefined,
      partsList: updatedParts,
      partsCost: newPartsCost,
      laborCost: Number(laborCost) || 0,
      totalCost: newGrandTotal,
      completionImages: completionImages,
      issues: issues,
      history: updatedHistory
    };

    setPartsList(updatedParts);
    if (currentStatus === "pending") {
      setCurrentStatus("in_progress");
    }

    if (onDisburseStockPart) {
      onDisburseStockPart(updatedTicket, newPart, updatedInventory, newRequisition);
    } else {
      onUpdateTicket(updatedTicket);
    }

    setDisburseSuccessMessage(`ตัดเบิกและตัดสต็อก ${selectedInvItem.name} x ${stockDisburseQty} ${selectedInvItem.unit} สำเร็จ (เลขที่ใบเบิก: ${reqNumber})`);
    setTimeout(() => {
      setDisburseSuccessMessage(null);
    }, 5000);
  };

  // Add Manual/Custom Part item
  const handleAddManualPart = () => {
    if (!newPartName.trim() || newPartPrice <= 0) {
      alert("กรุณากรอกชื่ออะไหล่และราคาต่อหน่วย");
      return;
    }
    const newPart: RepairItemPart = {
      id: `P-MANUAL-${Date.now()}`,
      name: newPartName.trim(),
      quantity: Number(newPartQty) || 1,
      unitPrice: Number(newPartPrice) || 0,
      total: (Number(newPartQty) || 1) * (Number(newPartPrice) || 0),
      isDeductedFromStock: false
    };
    setPartsList([...partsList, newPart]);
    setNewPartName("");
    setNewPartQty(1);
    setNewPartPrice(0);
  };

  // Remove part and automatically restock if it was stock-disbursed
  const handleRemovePart = (id: string) => {
    const partToRemove = partsList.find(p => p.id === id);
    if (!partToRemove) return;

    if (partToRemove.isDeductedFromStock && partToRemove.inventoryItemId) {
      const nowIso = new Date().toISOString();
      const updatedInventory = inventory.map(inv => {
        if (inv.id === partToRemove.inventoryItemId) {
          return {
            ...inv,
            currentStock: inv.currentStock + partToRemove.quantity,
            updatedAt: nowIso
          };
        }
        return inv;
      });

      const updatedParts = partsList.filter(p => p.id !== id);
      const newPartsCost = updatedParts.reduce((sum, item) => sum + item.total, 0);
      const newGrandTotal = newPartsCost + Number(laborCost);

      const updatedHistory = [
        ...ticket.history,
        {
          id: `h-restock-${Date.now()}`,
          timestamp: nowIso,
          status: currentStatus,
          note: `↩️ คืนอะไหล่เข้าคลัง: ${partToRemove.name} จำนวน ${partToRemove.quantity} ${partToRemove.unit || "ชิ้น"} (ยกเลิกรายการเบิก)`,
          updatedBy: assignedMechanic || "ผู้ดูแลระบบงานซ่อม"
        }
      ];

      const updatedTicket: RepairTicket = {
        ...ticket,
        updatedAt: nowIso,
        partsList: updatedParts,
        partsCost: newPartsCost,
        totalCost: newGrandTotal,
        history: updatedHistory
      };

      setPartsList(updatedParts);

      if (onRestockPart) {
        onRestockPart(updatedTicket, partToRemove, updatedInventory);
      } else {
        onUpdateTicket(updatedTicket);
      }

      setDisburseSuccessMessage(`คืนสต็อก "${partToRemove.name}" จำนวน ${partToRemove.quantity} ${partToRemove.unit || "ชิ้น"} เข้าคลังเรียบร้อยแล้ว`);
      setTimeout(() => {
        setDisburseSuccessMessage(null);
      }, 4000);
      return;
    }

    setPartsList(partsList.filter((p) => p.id !== id));
  };

  // Add after repair completion photo
  const handleAddCompletionPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCompletionImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Toggle tag selection
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Update post-repair condition for an individual replaced part
  const handleUpdatePartCondition = (partId: string, condition: PostRepairCondition, note?: string) => {
    setPartsList(prev => prev.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          postRepairCondition: condition,
          postRepairNote: note !== undefined ? note : p.postRepairNote
        };
      }
      return p;
    }));
  };

  // Save changes
  const handleSaveTicket = (newStat?: RepairStatus, newFeedback?: RepairFeedback) => {
    const statusToSet = newStat || currentStatus;
    const nowIso = new Date().toISOString();

    const isStatusChanged = statusToSet !== ticket.status;
    const newHistory = [...ticket.history];

    if (isStatusChanged || statusLogNote.trim()) {
      newHistory.push({
        id: `h-${Date.now()}`,
        timestamp: nowIso,
        status: statusToSet,
        note: statusLogNote.trim() || `อัปเดตสถานะเป็น: ${STATUS_CONFIG[statusToSet].labelTh}`,
        updatedBy: assignedMechanic || "ผู้ดูแลระบบงานซ่อม"
      });
    }

    const updatedFeedback = newFeedback !== undefined ? newFeedback : ticket.feedback;

    const updated: RepairTicket = {
      ...ticket,
      updatedAt: nowIso,
      status: statusToSet,
      assignedMechanic: assignedMechanic.trim() || undefined,
      mechanicNotes: mechanicNotes.trim() || undefined,
      partsList: partsList,
      partsCost: partsCostTotal,
      laborCost: Number(laborCost) || 0,
      totalCost: grandTotalCost,
      completionImages: completionImages,
      issues: issues,
      feedback: updatedFeedback,
      postRepairEquipmentStatus: postRepairEquipmentStatus,
      postRepairEquipmentNote: postRepairEquipmentNote.trim() || undefined,
      actualCompletionDate: statusToSet === "completed" && !ticket.actualCompletionDate ? nowIso : ticket.actualCompletionDate,
      history: newHistory
    };

    onUpdateTicket(updated);
    setStatusLogNote("");
  };

  const handleSaveFeedback = () => {
    const fb: RepairFeedback = {
      id: ticket.feedback?.id || `FB-${Date.now()}`,
      rating: overallRating,
      overallRating: overallRating,
      technicianRating: techRating,
      timelinessRating: timelinessRating,
      comment: feedbackComment.trim() || "บริการดี เรียบร้อย ได้มาตรฐาน",
      evaluatorName: evaluatorName.trim() || ticket.requesterName || "ผู้ประเมิน",
      createdAt: ticket.feedback?.createdAt || new Date().toISOString(),
      tags: selectedTags
    };
    handleSaveTicket(currentStatus, fb);
    setShowFeedbackForm(false);
  };

  // Status Step pipeline array
  const STATUS_STEPS: RepairStatus[] = [
    "pending",
    "inspecting",
    "waiting_parts",
    "in_progress",
    "testing",
    "completed"
  ];

  const currentStepIdx = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              {ticket.licensePlate.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{ticket.licensePlate}</h2>
                <span className="text-xs text-slate-400">({ticket.province})</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                  {ticket.ticketNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {ticket.vehicleBrand} {ticket.vehicleModel} • ไมล์: {ticket.currentMileage.toLocaleString()} กม. • {ticket.department}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenPrint(ticket)}
              id="btn-print-work-order"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>พิมพ์ใบสั่งซ่อม</span>
            </button>

            <button
              onClick={onClose}
              id="btn-close-detail-modal"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Status Tracker Progress Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>สถานะงานซ่อมแบบเรียลไทม์ (Real-Time Workflow Progress):</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CONFIG[currentStatus].badgeBg}`}>
              {STATUS_CONFIG[currentStatus].labelTh}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {STATUS_STEPS.map((stepKey, idx) => {
              const stepMeta = STATUS_CONFIG[stepKey];
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <button
                  type="button"
                  key={stepKey}
                  onClick={() => {
                    setCurrentStatus(stepKey);
                    handleSaveTicket(stepKey);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? "border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20 font-bold"
                      : isPast
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold">ขั้นที่ {idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-800">
                    {stepMeta.labelTh.split("/")[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6 bg-slate-50/40">
          
          {/* Grid Layout: Left Details, Right Mechanic & Cost Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: 2 Cols */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Category, Sub-Category & Symptoms Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${categoryMeta.borderColor} ${categoryMeta.bgLight}`}>
                      {categoryMeta.nameTh}
                    </span>
                    {ticket.subCategoryName && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {ticket.subCategoryName}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      ticket.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      ความเร่งด่วน: {ticket.priority}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    แจ้งเมื่อ: {new Date(ticket.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>

                {/* Requester Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>ผู้แจ้งซ่อม: <strong className="text-slate-900">{ticket.requesterName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>แผนก / สายรถ: <strong className="text-slate-900">{ticket.department}</strong></span>
                  </div>
                </div>

                {/* Emergency Breakdown Location Map */}
                {ticket.breakdownLocation?.isEmergencyBreakdown && (
                  <div className="pt-1">
                    <BreakdownLocationView 
                      location={ticket.breakdownLocation}
                      ticketNumber={ticket.ticketNumber}
                      licensePlate={ticket.licensePlate}
                      compact={false}
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">รายละเอียดสรุปภาพรวม:</h4>
                  <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
                    {ticket.symptoms}
                  </p>
                </div>

                {/* Multiple Issues Checklist */}
                {issues.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        รายการปัญหาที่ต้องแก้ไข ({issues.filter(i => i.isResolved).length}/{issues.length} เสร็จแล้ว)
                      </h4>
                      <span className="text-[11px] text-slate-500">คลิกเพื่อเช็คว่าแก้ไขแล้ว</span>
                    </div>

                    <div className="space-y-1.5">
                      {issues.map((iss, i) => (
                        <div 
                          key={iss.id || i}
                          onClick={() => handleToggleIssue(iss.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                            iss.isResolved 
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                              : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80"
                          }`}
                        >
                          <button type="button" className="mt-0.5 shrink-0">
                            {iss.isResolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${iss.isResolved ? "line-through text-slate-500" : "text-slate-900"}`}>
                                {iss.title}
                              </span>
                              {iss.subCategoryName && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                  {iss.subCategoryName}
                                </span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                iss.urgency === 'critical' ? 'bg-rose-100 text-rose-800' :
                                iss.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {iss.urgency || "medium"}
                              </span>
                            </div>
                            {iss.description && (
                              <p className={`text-[11px] mt-0.5 ${iss.isResolved ? "text-slate-400 line-through" : "text-slate-600"}`}>
                                {iss.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Rating & Service Feedback System */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900">
                      การประเมินคุณภาพ & ความพึงพอใจ (Service Rating & Feedback)
                    </h4>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {ticket.feedback ? "แก้ไขการประเมิน" : "+ ประเมินผลงานช่าง"}
                  </button>
                </div>

                {/* Show Existing Feedback */}
                {ticket.feedback && !showFeedbackForm && (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[11px] text-slate-500 block">ฝีมือช่าง (Tech Skill)</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (ticket.feedback?.technicianRating || 5) ? 'fill-amber-500' : 'text-slate-300'}`} />
                            ))}
                            <span className="text-xs font-bold text-slate-800 ml-1">{ticket.feedback.technicianRating || 5}/5</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">ความรวดเร็ว (Speed)</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (ticket.feedback?.timelinessRating || 5) ? 'fill-amber-500' : 'text-slate-300'}`} />
                            ))}
                            <span className="text-xs font-bold text-slate-800 ml-1">{ticket.feedback.timelinessRating || 5}/5</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">ภาพรวมบริการ (Overall)</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (ticket.feedback?.overallRating || 5) ? 'fill-amber-500' : 'text-slate-300'}`} />
                            ))}
                            <span className="text-xs font-bold text-slate-800 ml-1">{ticket.feedback.overallRating || 5}/5</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-500">
                        ผู้ประเมิน: <strong>{ticket.feedback.evaluatorName}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-amber-200/60 font-medium">
                      "{ticket.feedback.comment}"
                    </p>

                    {ticket.feedback.tags && ticket.feedback.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.feedback.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Input Form */}
                {showFeedbackForm && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนนฝีมือช่าง:</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setTechRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${star <= techRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ความตรงต่อเวลา:</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setTimelinessRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${star <= timelinessRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ความพึงพอใจโดยรวม:</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setOverallRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${star <= overallRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกจุดเด่น / คำชม:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMPLIMENT_TAGS.map((tag, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleToggleTag(tag)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                              selectedTags.includes(tag)
                                ? "bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ความคิดเห็นเพิ่มเติม / ข้อเสนอแนะ:</label>
                      <textarea
                        rows={2}
                        placeholder="ระบุข้อคิดเห็นถึงทีมช่าง เช่น งานเรียบร้อยดีมาก รถพร้อมใช้งานทันเวลา..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-700">ชื่อผู้ประเมิน:</label>
                        <input
                          type="text"
                          value={evaluatorName}
                          onChange={(e) => setEvaluatorName(e.target.value)}
                          className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowFeedbackForm(false)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveFeedback}
                          className="px-3.5 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          บันทึกการประเมิน
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Gallery: Before & After Comparison */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600" />
                    รูปภาพจุดเกิดเหตุ / ภาพก่อนซ่อม (Before Photos)
                  </h4>
                  <span className="text-xs text-slate-500">{ticket.attachedImages?.length || 0} รูป</span>
                </div>

                {ticket.attachedImages && ticket.attachedImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ticket.attachedImages.map((imgUrl, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 group relative">
                        <img src={imgUrl} alt={`รูปก่อนซ่อม ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                          รูปก่อนซ่อม #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">ไม่มีรูปภาพแนบในขั้นตอนแจ้งซ่อม</p>
                )}

                {/* After Repair Photos */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      รูปภาพผลงานหลังซ่อมเสร็จ (After Repair Photos)
                    </h4>
                    <label className="cursor-pointer text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มรูปผลงาน</span>
                      <input type="file" accept="image/*" onChange={handleAddCompletionPhoto} className="hidden" />
                    </label>
                  </div>

                  {completionImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {completionImages.map((imgUrl, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-900 relative">
                          <img src={imgUrl} alt={`รูปหลังซ่อม ${i + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 bg-emerald-900/90 text-emerald-100 text-[10px] px-2 py-0.5 rounded font-bold">
                            หลังซ่อมเสร็จ #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">ยังไม่มีการแนบรูปภาพหลังซ่อม</p>
                  )}
                </div>
              </div>

              {/* Gemini AI Diagnostic Breakdown */}
              {ticket.aiDiagnosis && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-indigo-200 space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>ผลการวิเคราะห์ด้วย Gemini AI (AI Diagnostic Details)</span>
                  </div>
                  <p className="text-xs text-indigo-950 font-medium bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                    {ticket.aiDiagnosis.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
                      <span className="font-bold text-slate-800 block mb-1">สาเหตุที่เป็นไปได้:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {ticket.aiDiagnosis.possibleCauses?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
                      <span className="font-bold text-slate-800 block mb-1">จุดแนะนำตรวจเช็ค:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {ticket.aiDiagnosis.recommendedChecks?.map((chk, i) => (
                          <li key={i}>{chk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline History */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  ประวัติการติดตามงาน (Activity Log & Timeline)
                </h4>

                <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
                  {ticket.history?.map((log, i) => (
                    <div key={log.id || i} className="relative pl-4 text-xs">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">
                          {STATUS_CONFIG[log.status]?.labelTh || log.status}
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.timestamp).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.note}</p>
                      <span className="text-[10px] text-slate-400">โดย: {log.updatedBy}</span>
                    </div>
                  ))}
                </div>

                {/* Add Quick Log Note */}
                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="พิมพ์บันทึกหรือความคืบหน้าเพิ่มเติม..."
                    value={statusLogNote}
                    onChange={(e) => setStatusLogNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveTicket()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>บันทึก</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Mechanic Work Order, Parts List & Costs */}
            <div className="space-y-5">
              
              {/* Mechanic Assignment & Notes */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  ช่างผู้รับผิดชอบ & บันทึกงานซ่อม
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    มอบหมายช่างผู้รับผิดชอบ:
                  </label>
                  <select
                    value={assignedMechanic}
                    onChange={(e) => setAssignedMechanic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="">-- ยังไม่มอบหมายช่าง --</option>
                    {MECHANIC_LIST.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บันทึกผลการซ่อม / หมายเหตุช่าง:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="บันทึกรายละเอียดการตรวจเช็คหรือผลการแก้ไข..."
                    value={mechanicNotes}
                    onChange={(e) => setMechanicNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Parts & Labor Breakdown with Direct Warehouse Stock Disbursal */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    รายการอะไหล่ & การตัดเบิกพัสดุ
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {partsList.length} รายการ
                  </span>
                </div>

                {/* Disbursal Success Toast */}
                {disburseSuccessMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{disburseSuccessMessage}</span>
                  </div>
                )}

                {/* Parts Table */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {partsList.map((part) => (
                    <div 
                      key={part.id} 
                      className={`p-3 rounded-xl border text-xs space-y-2 transition-colors ${
                        part.isDeductedFromStock 
                          ? "bg-blue-50/40 border-blue-200 hover:bg-blue-50/70" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-2 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 truncate">{part.name}</span>
                            {part.isDeductedFromStock ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <Box className="w-2.5 h-2.5 text-emerald-700" />
                                <span>ตัดเบิกคลัง ({part.requisitionNumber || "REQ"})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                จัดซื้อภายนอก
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{part.quantity} {part.unit || "รายการ"} x ฿{part.unitPrice.toLocaleString()}</span>
                            {part.disbursedBy && (
                              <span className="text-[10px] text-slate-400">| ช่าง: {part.disbursedBy.split(" ")[0]}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5 shrink-0">
                          <span className="font-bold text-slate-900 text-xs">฿{part.total.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(part.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                            title={part.isDeductedFromStock ? "ลบและคืนสต็อกพัสดุ" : "ลบรายการ"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Post-Repair Part Condition Classification (User Requirement) */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 p-2 rounded-lg border">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <span className="font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-purple-600" />
                            สภาพอะไหล่เก่าหลังถอด/ซ่อม:
                          </span>
                          <select
                            value={part.postRepairCondition || "scrap"}
                            onChange={(e) => handleUpdatePartCondition(part.id, e.target.value as PostRepairCondition)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold border focus:outline-none ${
                              part.postRepairCondition === "repairable"
                                ? "bg-purple-50 text-purple-800 border-purple-300"
                                : part.postRepairCondition === "repaired"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}
                          >
                            <option value="repairable">🟢 สามารถซ่อมได้ (Repairable / Rebuild)</option>
                            <option value="scrap">🔴 เสีย / ชำรุด (Scrap / จำหน่ายซาก)</option>
                            <option value="repaired">🔵 ซ่อมเสร็จใช้งานได้ปกติ (Repaired)</option>
                            <option value="normal">⚪ สภาพปกติ (Normal)</option>
                          </select>
                        </div>

                        <div className="flex-1 min-w-0 sm:max-w-xs">
                          <input
                            type="text"
                            placeholder="หมายเหตุสภาพ เช่น นำไปโอเวอร์ฮอล, เสียหายแตกร้าว..."
                            value={part.postRepairNote || ""}
                            onChange={(e) => handleUpdatePartCondition(part.id, part.postRepairCondition || "scrap", e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {partsList.length === 0 && (
                    <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <Boxes className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-medium">ยังไม่มีรายการอะไหล่หรือการเบิกพัสดุในใบงานนี้</p>
                    </div>
                  )}
                </div>

                {/* Stock Disbursal vs Custom Part Form Tabs */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold mb-3">
                    <button
                      type="button"
                      onClick={() => setPartSourceMode("stock")}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        partSourceMode === "stock"
                          ? "bg-white text-blue-700 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <PackageMinus className="w-3.5 h-3.5" />
                      <span>📦 ตัดเบิกจากคลังพัสดุ TNB</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartSourceMode("custom")}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        partSourceMode === "custom"
                          ? "bg-white text-blue-700 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>🛒 อะไหล่ภายนอก / คีย์เอง</span>
                    </button>
                  </div>

                  {/* Mode 1: Direct Warehouse Stock Disbursal */}
                  {partSourceMode === "stock" && (
                    <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3 space-y-2.5 text-xs">
                      {inventory.length > 0 ? (
                        <>
                          <div>
                            <label className="block font-semibold text-slate-800 mb-1">
                              เลือกพัสดุ / อะไหล่ในคลัง:
                            </label>
                            <select
                              value={selectedInventoryItemId}
                              onChange={(e) => handleSelectInventoryItem(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              {inventory.map((inv) => (
                                <option key={inv.id} value={inv.id} disabled={inv.currentStock <= 0}>
                                  [{inv.code}] {inv.name} — คงเหลือ: {inv.currentStock} {inv.unit} (฿{(inv.unitSellingPrice || inv.unitCost).toLocaleString()}/{inv.unit}) {inv.currentStock <= 0 ? "(หมดสต็อก)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Selected Item Stock & Location Info Banner */}
                          {selectedInvItem && (
                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold px-1.5 py-0.2 rounded ${
                                  selectedInvItem.currentStock <= selectedInvItem.minStockLevel 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  คงเหลือ: {selectedInvItem.currentStock} {selectedInvItem.unit}
                                </span>
                                {selectedInvItem.location && (
                                  <span className="text-slate-500">📍 ชั้น: {selectedInvItem.location}</span>
                                )}
                              </div>
                              <span className="text-slate-600 font-medium">
                                ต้นทุน: ฿{selectedInvItem.unitCost.toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Quantity & Unit Price */}
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">จำนวนที่เบิก:</label>
                              <input
                                type="number"
                                min={1}
                                max={selectedInvItem?.currentStock || 999}
                                value={stockDisburseQty}
                                onChange={(e) => setStockDisburseQty(Math.max(1, Number(e.target.value)))}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">ราคา/หน่วย (฿):</label>
                              <input
                                type="number"
                                value={stockDisbursePrice}
                                onChange={(e) => setStockDisbursePrice(Number(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                              />
                            </div>
                            <div className="pt-4">
                              <button
                                type="button"
                                onClick={handleDisburseStock}
                                disabled={!selectedInvItem || selectedInvItem.currentStock <= 0}
                                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
                              >
                                <PackageMinus className="w-3.5 h-3.5" />
                                <span>ตัดเบิกทันที</span>
                              </button>
                            </div>
                          </div>

                          {selectedInvItem && selectedInvItem.currentStock <= 0 && (
                            <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>อะไหล่รายการนี้หมดสต็อก กรุณาเพิ่มสต็อกที่ "ระบบรับของเข้าคลัง"</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="py-3 text-center text-slate-500">
                          <p className="font-semibold text-xs text-slate-700">ไม่มีข้อมูลพัสดุในคลังสินค้า</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">กรุณาเพิ่มรายการพัสดุใน "ระบบรับของเข้าคลัง" หรือเลือกแท็บ "อะไหล่ภายนอก"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: Custom / External Part Form */}
                  {partSourceMode === "custom" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          ชื่อรายการอะไหล่ / น้ำมัน / ค่าบริการภายนอก:
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น น้ำมันเครื่องภายนอก, ปะเก็นชุดพิเศษ..."
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24">
                          <label className="block text-[10px] text-slate-500 mb-0.5">จำนวน:</label>
                          <input
                            type="number"
                            min={1}
                            value={newPartQty}
                            onChange={(e) => setNewPartQty(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-500 mb-0.5">ราคา/หน่วย (฿):</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={newPartPrice || ""}
                            onChange={(e) => setNewPartPrice(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div className="pt-3.5">
                          <button
                            type="button"
                            onClick={handleAddManualPart}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            + เพิ่มรายการ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Labor Cost Input */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">ค่าแรงช่าง & บริการ (Labor Cost):</label>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-500">฿</span>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
                      className="w-28 px-2 py-1.5 text-right font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Total Cost Summary */}
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-900 font-semibold block">ค่าใช้จ่ายรวมทั้งสิ้น</span>
                    <span className="text-[10px] text-blue-700">
                      อะไหล่ ฿{partsCostTotal.toLocaleString()} + ค่าแรง ฿{laborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-blue-900 font-mono">
                    ฿{grandTotalCost.toLocaleString()}
                  </div>
                </div>

                {/* Overall Post-Repair Equipment Assessment Card (Core Requirement) */}
                <div className="p-3.5 bg-gradient-to-br from-purple-50/80 to-indigo-50/60 rounded-xl border border-purple-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-purple-600" />
                      ผลการประเมินสภาพอุปกรณ์ & ชิ้นส่วนหลังซ่อม
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                      Post-Repair Check
                    </span>
                  </div>

                  {/* Condition Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPostRepairEquipmentStatus('repaired_good')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        postRepairEquipmentStatus === 'repaired_good'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs border-emerald-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold">🔵 สมบูรณ์ปกติ</div>
                      <div className="text-[9px] opacity-80">ซ่อมเสร็จใช้งานได้</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostRepairEquipmentStatus('repairable')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        postRepairEquipmentStatus === 'repairable'
                          ? 'bg-purple-600 text-white font-bold shadow-xs border-purple-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold">🟢 มีอะไหล่ซ่อมได้</div>
                      <div className="text-[9px] opacity-80">ส่ง Rebuild/สำรอง</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostRepairEquipmentStatus('scrap')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        postRepairEquipmentStatus === 'scrap'
                          ? 'bg-rose-600 text-white font-bold shadow-xs border-rose-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold">🔴 เสีย / จำหน่ายซาก</div>
                      <div className="text-[9px] opacity-80">ชิ้นส่วนสิ้นสภาพ</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostRepairEquipmentStatus('mixed')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        postRepairEquipmentStatus === 'mixed'
                          ? 'bg-amber-600 text-white font-bold shadow-xs border-amber-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold">🟡 ผสมผสาน</div>
                      <div className="text-[9px] opacity-80">ทั้งซ่อมได้และเสีย</div>
                    </button>
                  </div>

                  {/* Note for post repair */}
                  <div>
                    <input
                      type="text"
                      placeholder="บันทึกสภาพอุปกรณ์หลังซ่อม / การจัดการซาก / อะไหล่สำรอง..."
                      value={postRepairEquipmentNote}
                      onChange={(e) => setPostRepairEquipmentNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-save-ticket-changes"
                  onClick={() => {
                    handleSaveTicket();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
                >
                  บันทึกการเปลี่ยนแปลง (Save Work Order)
                </button>

                {currentStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStatus("completed");
                      handleSaveTicket("completed");
                    }}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ปิดงานซ่อมเสร็จสมบูรณ์ (Complete & Deliver)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
