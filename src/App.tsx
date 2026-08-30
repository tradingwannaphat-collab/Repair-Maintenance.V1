import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { RequesterPortal } from "./components/RequesterPortal";
import { WorkOperationsPortal } from "./components/WorkOperationsPortal";
import { VehicleRegistryView } from "./components/VehicleRegistryView";
import { GoodsReceiptView } from "./components/GoodsReceiptView";
import { GoodsRequisitionView } from "./components/GoodsRequisitionView";
import { PartListView } from "./components/PartListView";
import { RepairRequestModal } from "./components/RepairRequestModal";
import { TicketDetailModal } from "./components/TicketDetailModal";
import { QuickSearchModal } from "./components/QuickSearchModal";
import { PrintWorkOrderModal } from "./components/PrintWorkOrderModal";
import { DataBackupExportModal } from "./components/DataBackupExportModal";
import { WorkflowGuideView } from "./components/WorkflowGuideView";
import { PMPlanView } from "./components/PMPlanView";
import { INITIAL_TICKETS, DEMO_SAMPLE_TICKETS } from "./data/mockData";
import { 
  INITIAL_VEHICLES, 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_GOODS_RECEIPTS, 
  INITIAL_GOODS_REQUISITIONS,
  FULL_TNB_FLEET_DATA,
  DEMO_TNB_VEHICLES,
  DEMO_INVENTORY_ITEMS,
  DEMO_GOODS_RECEIPTS,
  DEMO_GOODS_REQUISITIONS
} from "./data/initialFleetData";
import { INITIAL_PM_SCHEDULES_2026, generateAnnualPMPlanForFleet, MONTH_NAMES_TH } from "./data/pmPlanData";
import { 
  RepairTicket, 
  RepairStatus, 
  RepairItemPart,
  AppNavView, 
  VehicleRecord, 
  InventoryItem, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord,
  PMMonthlyScheduleItem
} from "./types";
import { TnbLogo } from "./components/TnbLogo";
import { normalizeLicensePlate } from "./utils/excelImportExport";

const TICKETS_STORAGE_KEY = "tnb_fleet_clean_tickets_v5";
const VEHICLES_STORAGE_KEY = "tnb_fleet_clean_vehicles_v8";
const INVENTORY_STORAGE_KEY = "tnb_fleet_clean_inventory_v5";
const RECEIPTS_STORAGE_KEY = "tnb_fleet_clean_receipts_v5";
const REQUISITIONS_STORAGE_KEY = "tnb_fleet_clean_requisitions_v5";
const PM_SCHEDULES_STORAGE_KEY = "tnb_fleet_clean_pm_schedules_v1";

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<AppNavView>("requester");

  // Tickets State
  const [tickets, setTickets] = useState<RepairTicket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading tickets localStorage:", e);
    }
    return INITIAL_TICKETS;
  });

  // PM Schedules State
  const [pmSchedules, setPmSchedules] = useState<PMMonthlyScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(PM_SCHEDULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading PM schedules localStorage:", e);
    }
    return INITIAL_PM_SCHEDULES_2026;
  });

  // Vehicles State
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading vehicles localStorage:", e);
    }
    return FULL_TNB_FLEET_DATA;
  });

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading inventory localStorage:", e);
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  // Goods Receipts State
  const [receipts, setReceipts] = useState<GoodsReceiptRecord[]>(() => {
    try {
      const saved = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading receipts localStorage:", e);
    }
    return INITIAL_GOODS_RECEIPTS;
  });

  // Goods Requisitions State
  const [requisitions, setRequisitions] = useState<GoodsRequisitionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(REQUISITIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading requisitions localStorage:", e);
    }
    return INITIAL_GOODS_REQUISITIONS;
  });

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedVehicleForRepair, setSelectedVehicleForRepair] = useState<VehicleRecord | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<RepairTicket | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportBackupModalOpen, setIsExportBackupModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error("Error saving tickets localStorage:", e);
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
      console.error("Error saving vehicles localStorage:", e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.error("Error saving inventory localStorage:", e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
    } catch (e) {
      console.error("Error saving receipts localStorage:", e);
    }
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem(REQUISITIONS_STORAGE_KEY, JSON.stringify(requisitions));
    } catch (e) {
      console.error("Error saving requisitions localStorage:", e);
    }
  }, [requisitions]);

  useEffect(() => {
    try {
      localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(pmSchedules));
    } catch (e) {
      console.error("Error saving PM schedules localStorage:", e);
    }
  }, [pmSchedules]);

  // PM Schedule Handlers
  const handleAddPMSchedule = (newSchedule: PMMonthlyScheduleItem) => {
    setPmSchedules((prev) => [newSchedule, ...prev]);
  };

  const handleUpdatePMSchedule = (updatedSchedule: PMMonthlyScheduleItem) => {
    setPmSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleDeletePMSchedule = (id: string) => {
    setPmSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Create Work Order Ticket from PM Schedule Item
  const handleCreateTicketFromPM = (schedule: PMMonthlyScheduleItem) => {
    const vehicle = vehicles.find((v) => v.id === schedule.vehicleId || v.licensePlate === schedule.licensePlate);
    const newTicketId = "ticket-pm-" + Date.now();
    const newTicketNumber = "TNB-WO-" + schedule.year + "-" + String(tickets.length + 1).padStart(4, "0");

    const newTicket: RepairTicket = {
      id: newTicketId,
      ticketNumber: newTicketNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      licensePlate: schedule.licensePlate,
      province: schedule.province || vehicle?.province || "กรุงเทพมหานคร",
      vehicleBrand: schedule.vehicleBrand || vehicle?.brand || "Hino",
      vehicleModel: schedule.vehicleModel || vehicle?.model || "Victor 500",
      vehicleType: (vehicle?.vehicleType || schedule.vehicleType || "tractor_10w") as any,
      currentMileage: schedule.targetMileage || vehicle?.currentMileage || 0,
      department: schedule.department || vehicle?.department || "ฝ่ายขนส่งตู้คอนเทนเนอร์",
      requesterName: schedule.driverName || vehicle?.driverName || "ฝ่ายบริหารงานซ่อม PM",
      requesterPhone: vehicle?.driverPhone || "02-xxx-xxxx",
      category: "inspection",
      priority: "medium",
      symptoms: `งานบำรุงรักษาเชิงป้องกัน ${schedule.pmTypeName} (${schedule.pmPlanCode}) แผนรอบเดือน ${MONTH_NAMES_TH[schedule.month - 1]} ปี ${schedule.year}`,
      attachedImages: [],
      status: "in_progress",
      assignedMechanic: schedule.assignedTechnician || "ทีมช่างซ่อมบำรุง TNB",
      partsList: [],
      partsCost: 0,
      laborCost: schedule.estimatedCost || 0,
      totalCost: schedule.estimatedCost || 0,
      history: [
        {
          id: "h-" + Date.now(),
          timestamp: new Date().toISOString(),
          status: "in_progress",
          note: `เปิดใบสั่งซ่อมจากแผนงาน PM รายเดือน ${schedule.pmPlanCode} (${schedule.isoDocNumber})`,
          updatedBy: "ระบบแผน PM อัตโนมัติ"
        }
      ],
      mechanicNotes: `รายการตรวจเช็คตามแผน PM (${schedule.pmType}):\n${
        schedule.checklists && schedule.checklists.length > 0
          ? schedule.checklists.map((c) => `- ${c.item} [${c.category}]`).join("\n")
          : "- ตรวจเช็คตามมาตรฐาน ISO 9001:2015 / ISO 39001"
      }`
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Update PM schedule with linked ticket
    const updatedSchedule: PMMonthlyScheduleItem = {
      ...schedule,
      ticketId: newTicketId,
      ticketNumber: newTicketNumber,
      status: "in_progress",
      updatedAt: new Date().toISOString()
    };
    handleUpdatePMSchedule(updatedSchedule);

    // Switch to worker view and select the new ticket
    setCurrentView("worker");
    setSelectedTicket(newTicket);
    setIsDetailModalOpen(true);
  };

  // Auto Generate 12-Month Annual Plan for entire fleet
  const handleAutoGenerateAnnualPlan = (year: number) => {
    if (vehicles.length === 0) {
      alert("ไม่พบข้อมูลยานพาหนะในระบบ กรุณาเพิ่มรถยนต์ก่อนจัดทำแผน PM");
      return;
    }
    const generated = generateAnnualPMPlanForFleet(vehicles, year);
    // Merge or replace for that year
    setPmSchedules((prev) => {
      const otherYears = prev.filter((s) => s.year !== year);
      return [...otherYears, ...generated];
    });
  };

  // Reload the complete 2026 real fleet sample PM Plan
  const handleResetToSamplePMSchedules = () => {
    setPmSchedules(INITIAL_PM_SCHEDULES_2026);
    try {
      localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(INITIAL_PM_SCHEDULES_2026));
    } catch (e) {
      console.error("Error persisting sample PM schedules:", e);
    }
  };

  // Bulk PM Schedule Import Handler (Append or Replace)
  const handleBulkImportPMSchedules = (
    importedList: PMMonthlyScheduleItem[],
    mode: "append" | "replace"
  ) => {
    setPmSchedules((prev) => {
      let updated: PMMonthlyScheduleItem[];
      if (mode === "replace") {
        updated = importedList;
      } else {
        const existingMap = new Map<string, PMMonthlyScheduleItem>();
        prev.forEach((s) => existingMap.set(s.id, s));
        importedList.forEach((s) => existingMap.set(s.id, s));
        updated = Array.from(existingMap.values());
      }
      try {
        localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving PM schedules to storage:", e);
      }
      return updated;
    });
  };

  // Handle new repair request with automatic vehicle mileage binding & sync
  const handleAddNewTicket = (newTicket: RepairTicket) => {
    setTickets((prev) => [newTicket, ...prev]);

    // Automatically update and bind vehicle mileage in Vehicle Master Registry
    if (newTicket.currentMileage && newTicket.currentMileage > 0) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.licensePlate.trim().toUpperCase() === newTicket.licensePlate.trim().toUpperCase()) {
            return {
              ...v,
              currentMileage: Math.max(v.currentMileage, newTicket.currentMileage),
              updatedAt: new Date().toISOString()
            };
          }
          return v;
        })
      );
    }
  };

  // Handle update ticket
  const handleUpdateTicket = (updatedTicket: RepairTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket(updatedTicket);
    }

    // Sync mileage if updated in ticket
    if (updatedTicket.currentMileage && updatedTicket.currentMileage > 0) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.licensePlate.trim().toUpperCase() === updatedTicket.licensePlate.trim().toUpperCase()) {
            return {
              ...v,
              currentMileage: Math.max(v.currentMileage, updatedTicket.currentMileage),
              updatedAt: new Date().toISOString()
            };
          }
          return v;
        })
      );
    }
  };

  // Quick Status change from card
  const handleQuickStatusChange = (ticketId: string, newStatus: RepairStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const nowIso = new Date().toISOString();
          return {
            ...t,
            status: newStatus,
            updatedAt: nowIso,
            history: [
              ...t.history,
              {
                id: `h-${Date.now()}`,
                timestamp: nowIso,
                status: newStatus,
                note: `อัปเดตสถานะเป็น ${newStatus}`,
                updatedBy: "ผู้ดูแลระบบงานซ่อม"
              }
            ]
          };
        }
        return t;
      })
    );
  };

  // Vehicle Management Handlers
  const handleAddVehicle = (newVehicle: VehicleRecord) => {
    setVehicles((prev) => [newVehicle, ...prev]);
  };

  const handleUpdateVehicle = (updatedVehicle: VehicleRecord) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  const handleRestoreAllVehicles = () => {
    setVehicles(FULL_TNB_FLEET_DATA);
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(FULL_TNB_FLEET_DATA));
    } catch (e) {
      console.error("Error saving vehicles to localStorage:", e);
    }
  };

  const handleClearAllVehicles = () => {
    setVehicles([]);
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error("Error clearing vehicles in localStorage:", e);
    }
  };

  // Bulk Vehicle Import Handler
  const handleBulkImportVehicles = (
    importedList: VehicleRecord[], 
    mode: "upsert" | "append" | "replace"
  ) => {
    if (mode === "replace") {
      setVehicles(importedList);
    } else if (mode === "append") {
      setVehicles((prev) => [...importedList, ...prev]);
    } else {
      // Upsert mode: match by normalized licensePlate
      setVehicles((prev) => {
        const existingMap = new Map<string, VehicleRecord>();
        prev.forEach((v) => {
          const key = normalizeLicensePlate(v.licensePlate);
          if (key) existingMap.set(key, v);
        });

        const updated = [...prev];
        importedList.forEach((incoming) => {
          const key = normalizeLicensePlate(incoming.licensePlate);
          if (key && existingMap.has(key)) {
            const oldIdx = updated.findIndex(
              (v) => normalizeLicensePlate(v.licensePlate) === key
            );
            if (oldIdx >= 0) {
              updated[oldIdx] = {
                ...updated[oldIdx],
                ...incoming,
                id: updated[oldIdx].id, // preserve existing ID
                updatedAt: new Date().toISOString()
              };
            }
          } else {
            updated.unshift(incoming);
          }
        });
        return updated;
      });
    }
  };

  // Quick Repair for a specific vehicle from Registry
  const handleRequestRepairForVehicle = (vehicle: VehicleRecord) => {
    setSelectedVehicleForRepair(vehicle);
    setIsNewModalOpen(true);
  };

  // Goods Receipt Handlers
  const handleAddReceipt = (newReceipt: GoodsReceiptRecord, updatedInventory: InventoryItem[]) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    setInventory(updatedInventory);
  };

  const handleDeleteReceipt = (receiptId: string, rollbackStock: boolean = false) => {
    const receiptToDelete = receipts.find((r) => r.id === receiptId);
    if (!receiptToDelete) return;

    if (rollbackStock && receiptToDelete.items && receiptToDelete.items.length > 0) {
      setInventory((prev) => {
        const updated = [...prev];
        receiptToDelete.items.forEach((item) => {
          const idx = updated.findIndex((inv) => inv.id === item.inventoryItemId);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              currentStock: Math.max(0, updated[idx].currentStock - item.quantity),
              updatedAt: new Date().toISOString()
            };
          }
        });
        return updated;
      });
    }

    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
  };

  // Inventory & Part List Handlers
  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Bulk Inventory Import Handler
  const handleBulkImportInventory = (
    importedList: InventoryItem[], 
    mode: "upsert" | "append" | "replace"
  ) => {
    if (mode === "replace") {
      setInventory(importedList);
    } else if (mode === "append") {
      setInventory((prev) => [...importedList, ...prev]);
    } else {
      // Upsert mode: match by item.code
      setInventory((prev) => {
        const existingMap = new Map<string, InventoryItem>();
        prev.forEach((item) => {
          const key = item.code ? item.code.trim().toUpperCase() : "";
          if (key) existingMap.set(key, item);
        });

        const updated = [...prev];
        importedList.forEach((incoming) => {
          const key = incoming.code ? incoming.code.trim().toUpperCase() : "";
          if (key && existingMap.has(key)) {
            const oldIdx = updated.findIndex(
              (item) => (item.code ? item.code.trim().toUpperCase() : "") === key
            );
            if (oldIdx >= 0) {
              updated[oldIdx] = {
                ...updated[oldIdx],
                ...incoming,
                id: updated[oldIdx].id, // preserve existing ID
                updatedAt: new Date().toISOString()
              };
            }
          } else {
            updated.unshift(incoming);
          }
        });
        return updated;
      });
    }
  };

  // Goods Requisition Handlers
  const handleAddRequisition = (newRequisition: GoodsRequisitionRecord, updatedInventory: InventoryItem[]) => {
    setRequisitions((prev) => [newRequisition, ...prev]);
    setInventory(updatedInventory);
  };

  const handleDeleteRequisition = (requisitionId: string, restock: boolean = false) => {
    const reqToDelete = requisitions.find((r) => r.id === requisitionId);
    if (!reqToDelete) return;

    if (restock && reqToDelete.items && reqToDelete.items.length > 0) {
      setInventory((prev) => {
        const updated = [...prev];
        reqToDelete.items.forEach((item) => {
          const idx = updated.findIndex((inv) => inv.id === item.inventoryItemId);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              currentStock: updated[idx].currentStock + item.quantity,
              updatedAt: new Date().toISOString()
            };
          }
        });
        return updated;
      });
    }

    setRequisitions((prev) => prev.filter((r) => r.id !== requisitionId));
  };

  // Disburse Stock Part directly from Repair Ticket (ตัดเบิกของจากใบแจ้งซ่อมเมื่อช่างทำการซ่อม)
  const handleDisburseStockPart = (
    updatedTicket: RepairTicket,
    _newPart: RepairItemPart,
    updatedInventory: InventoryItem[],
    newRequisition: GoodsRequisitionRecord
  ) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setSelectedTicket(updatedTicket);
    setInventory(updatedInventory);
    setRequisitions((prev) => [newRequisition, ...prev]);
  };

  // Restock Part if removed from Repair Ticket
  const handleRestockPart = (
    updatedTicket: RepairTicket,
    _removedPart: RepairItemPart,
    updatedInventory: InventoryItem[]
  ) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setSelectedTicket(updatedTicket);
    setInventory(updatedInventory);
  };

  // Clear all data for production real operation (ล้างระบบทั้งหมดเป็น 0 เพื่อเริ่มใช้งานจริง)
  const handleClearAllData = () => {
    if (window.confirm("⚠️ ยืนยันการล้างข้อมูลทั้งระบบ?\n\nระบบจะลบข้อมูลทั้งหมด ได้แก่:\n- ประวัติและใบแจ้งซ่อมทั้งหมด (0 รายการ)\n- ประวัติการรับของเข้าคลัง (0 รายการ)\n- ประวัติการเบิกของ/อะไหล่ (0 รายการ)\n- แผน PM รถยนต์ (0 รายการ)\n- ข้อมูลสารระบบทะเบียนรถ (0 คัน)\n- รายการพัสดุในคลังสินค้า (0 รายการ)\n\nเพื่อให้ระบบสะอาด 100% พร้อมสำหรับการเริ่มบันทึกใช้งานจริงของบริษัท TNB Logistics")) {
      setTickets([]);
      setVehicles([]);
      setInventory([]);
      setReceipts([]);
      setRequisitions([]);
      setPmSchedules([]);
      localStorage.removeItem(TICKETS_STORAGE_KEY);
      localStorage.removeItem(VEHICLES_STORAGE_KEY);
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      localStorage.removeItem(RECEIPTS_STORAGE_KEY);
      localStorage.removeItem(REQUISITIONS_STORAGE_KEY);
      localStorage.removeItem(PM_SCHEDULES_STORAGE_KEY);
      localStorage.clear();
    }
  };

  // Load demo sample dataset for testing
  const handleLoadDemoData = () => {
    if (window.confirm("ต้องการโหลดชุดข้อมูลตัวอย่าง (Demo Data: 8 คัน, แผน PM, รายการอะไหล่, ใบแจ้งซ่อม, ใบรับ และใบเบิก) สำหรับการทดลองใช้งานและดูตัวอย่างรายงานสรุปหรือไม่?")) {
      setTickets(DEMO_SAMPLE_TICKETS);
      setVehicles(DEMO_TNB_VEHICLES);
      setInventory(DEMO_INVENTORY_ITEMS);
      setReceipts(DEMO_GOODS_RECEIPTS);
      setRequisitions(DEMO_GOODS_REQUISITIONS);
      setPmSchedules(INITIAL_PM_SCHEDULES_2026);
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEMO_SAMPLE_TICKETS));
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(DEMO_TNB_VEHICLES));
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(DEMO_INVENTORY_ITEMS));
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(DEMO_GOODS_RECEIPTS));
      localStorage.setItem(REQUISITIONS_STORAGE_KEY, JSON.stringify(DEMO_GOODS_REQUISITIONS));
      localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(INITIAL_PM_SCHEDULES_2026));
    }
  };

  // Open detail modal
  const handleSelectTicket = (ticket: RepairTicket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  // Open Print Modal
  const handleOpenPrint = (ticket: RepairTicket) => {
    setTicketToPrint(ticket);
    setIsPrintModalOpen(true);
  };

  // Counts for badge
  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "in_progress" || t.status === "inspecting" || t.status === "waiting_parts" || t.status === "testing"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar with Main Integrated Modules */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        totalTicketsCount={tickets.length}
        vehicleCount={vehicles.length}
        inventoryCount={inventory.length}
        pmCount={pmSchedules.length}
        onClearAllData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
        onOpenNewModal={() => {
          setSelectedVehicleForRepair(null);
          setIsNewModalOpen(true);
        }}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenExportBackupModal={() => setIsExportBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Module 1: หน้าคนแจ้ง (Requester Portal) */}
        {currentView === "requester" && (
          <RequesterPortal
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onOpenNewModal={() => {
              setSelectedVehicleForRepair(null);
              setIsNewModalOpen(true);
            }}
            onOpenPrint={handleOpenPrint}
          />
        )}

        {/* Module 2: หน้าทำงาน & ช่าง (Workshop Operations & Admin Hub) */}
        {currentView === "worker" && (
          <WorkOperationsPortal
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onOpenNewModal={() => {
              setSelectedVehicleForRepair(null);
              setIsNewModalOpen(true);
            }}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {/* Module 3: สารระบบทะเบียนรถ (Vehicle Master Registry) */}
        {currentView === "vehicles" && (
          <VehicleRegistryView
            vehicles={vehicles}
            tickets={tickets}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onRequestRepairForVehicle={handleRequestRepairForVehicle}
            onBulkImportVehicles={handleBulkImportVehicles}
            onRestoreAllVehicles={handleRestoreAllVehicles}
            onDeleteAllVehicles={handleClearAllVehicles}
          />
        )}

        {/* Module 3.5: แผน PM รถ เดือน/ปี (Preventive Maintenance Master Plan) */}
        {currentView === "pm_plan" && (
          <PMPlanView
            schedules={pmSchedules}
            vehicles={vehicles}
            tickets={tickets}
            onAddSchedule={handleAddPMSchedule}
            onUpdateSchedule={handleUpdatePMSchedule}
            onDeleteSchedule={handleDeletePMSchedule}
            onCreateTicketFromPM={handleCreateTicketFromPM}
            onAutoGenerateAnnualPlan={handleAutoGenerateAnnualPlan}
            onReloadSamplePlan={handleResetToSamplePMSchedules}
            onImportSchedules={handleBulkImportPMSchedules}
          />
        )}

        {/* Module 4: ระบบรายการอะไหล่ & แคตตาล็อกคลัง (Part List & Inventory Catalog) */}
        {currentView === "part_list" && (
          <PartListView
            inventory={inventory}
            onAddInventoryItem={handleAddInventoryItem}
            onUpdateInventoryItem={handleUpdateInventoryItem}
            onDeleteInventoryItem={handleDeleteInventoryItem}
            onNavigateToReceiving={() => setCurrentView("receiving")}
            onNavigateToRequisition={() => setCurrentView("requisition")}
            onBulkImportInventory={handleBulkImportInventory}
          />
        )}

        {/* Module 5: ระบบรับของเข้าคลัง (Goods Receiving) */}
        {currentView === "receiving" && (
          <GoodsReceiptView
            receipts={receipts}
            inventory={inventory}
            onAddReceipt={handleAddReceipt}
            onUpdateInventoryItem={handleUpdateInventoryItem}
            onDeleteReceipt={handleDeleteReceipt}
            onDeleteInventoryItem={handleDeleteInventoryItem}
          />
        )}

        {/* Module 6: ระบบเบิกของ & อะไหล่ใช้งาน (Goods Requisition) */}
        {currentView === "requisition" && (
          <GoodsRequisitionView
            requisitions={requisitions}
            inventory={inventory}
            vehicles={vehicles}
            tickets={tickets}
            onAddRequisition={handleAddRequisition}
            onDeleteRequisition={handleDeleteRequisition}
            onSelectTicket={handleSelectTicket}
          />
        )}

        {/* Module 7: แผนผัง Flow การทำงาน & คู่มือระบบ (Workflow Guide & Operations Manual) */}
        {currentView === "workflow" && (
          <WorkflowGuideView
            onNavigateToView={(view) => setCurrentView(view)}
            onOpenNewTicketModal={() => {
              setSelectedVehicleForRepair(null);
              setIsNewModalOpen(true);
            }}
            onOpenExportBackupModal={() => setIsExportBackupModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white px-1.5 py-0.5 rounded">
              <TnbLogo variant="blue" size="sm" showSubtitle={false} />
            </div>
            <span className="font-bold text-white">TNB Logistics Fleet Management System</span>
            <span className="hidden md:inline">— ระบบแจ้งซ่อมยานพาหนะ คลังอะไหล่ & แผนที่พิกัดรถเสียฉุกเฉิน</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="text-emerald-400 font-semibold">● ระบบออนไลน์พร้อมใช้งาน</span>
            <span>•</span>
            <span>Version 2.4.0 Production</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RepairRequestModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setSelectedVehicleForRepair(null);
        }}
        onSubmitTicket={handleAddNewTicket}
        vehicles={vehicles}
        initialVehicle={selectedVehicleForRepair}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdateTicket={handleUpdateTicket}
        onOpenPrint={handleOpenPrint}
        inventory={inventory}
        vehicles={vehicles}
        onDisburseStockPart={handleDisburseStockPart}
        onRestockPart={handleRestockPart}
      />

      <QuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        tickets={tickets}
        onSelectTicket={handleSelectTicket}
      />

      <PrintWorkOrderModal
        ticket={ticketToPrint}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setTicketToPrint(null);
        }}
      />

      <DataBackupExportModal
        isOpen={isExportBackupModalOpen}
        onClose={() => setIsExportBackupModalOpen(false)}
        vehicles={vehicles}
        inventory={inventory}
        tickets={tickets}
        receipts={receipts}
        requisitions={requisitions}
        pmSchedules={pmSchedules}
      />
    </div>
  );
}
