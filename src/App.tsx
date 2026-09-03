import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { RequesterPortal } from "./components/RequesterPortal";
import { WorkOperationsPortal } from "./components/WorkOperationsPortal";
import { VehicleRegistryView } from "./components/VehicleRegistryView";
import { GoodsReceiptView } from "./components/GoodsReceiptView";
import { GoodsRequisitionView } from "./components/GoodsRequisitionView";
import { PartListView } from "./components/PartListView";
import { RepairRequestModal } from "./components/RepairRequestModal";
import { TicketDetailModal } from "./components/TicketDetailModal";
import { TicketImportModal } from "./components/TicketImportModal";
import { QuickSearchModal } from "./components/QuickSearchModal";
import { PrintWorkOrderModal } from "./components/PrintWorkOrderModal";
import { DataBackupExportModal } from "./components/DataBackupExportModal";
import { WorkflowGuideView } from "./components/WorkflowGuideView";
import { ServiceDirectoryView } from "./components/ServiceDirectoryView";
import { CollabModal } from "./components/CollabModal";
import { CollabNotificationToast } from "./components/CollabNotificationToast";
import { useRealtimeCollab } from "./hooks/useRealtimeCollab";
import { INITIAL_SERVICE_DIRECTORY } from "./data/initialDirectoryData";
import { PMPlanView } from "./components/PMPlanView";
import { DailyInspectionView } from "./components/DailyInspectionView";
import { MaintenanceIntervalMatrixView } from "./components/MaintenanceIntervalMatrixView";
import { VehicleRepairHistoryView } from "./components/VehicleRepairHistoryView";
import { TireManagementView } from "./components/TireManagementView";
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
import { getFleet108Vehicles } from "./data/masterFleet108";
import { INITIAL_PM_SCHEDULES_2026, generateAnnualPMPlanForFleet, MONTH_NAMES_TH } from "./data/pmPlanData";
import { INITIAL_DAILY_INSPECTIONS } from "./data/dailyInspectionData";
import { 
  RepairTicket, 
  RepairStatus, 
  RepairItemPart,
  AppNavView, 
  VehicleRecord, 
  InventoryItem, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord,
  PMMonthlyScheduleItem,
  DailyVehicleInspectionRecord,
  ServiceDirectoryState,
  CollabUser
} from "./types";
import { TnbLogo } from "./components/TnbLogo";
import { ShareModal } from "./components/ShareModal";
import { normalizeLicensePlate } from "./utils/excelImportExport";
import { 
  fetchServerFleetState, 
  pushServerFleetSync, 
  resetServerFleetState,
  getLastKnownServerUpdate 
} from "./utils/fleetSyncService";

import { TNB_STANDARD_9_TICKETS } from "./data/tnbStandardTickets9";

const TICKETS_STORAGE_KEY = "tnb_fleet_clean_tickets_v9";
const VEHICLES_STORAGE_KEY = "tnb_fleet_clean_vehicles_v108";
const INVENTORY_STORAGE_KEY = "tnb_fleet_clean_inventory_v5";
const RECEIPTS_STORAGE_KEY = "tnb_fleet_clean_receipts_v5";
const REQUISITIONS_STORAGE_KEY = "tnb_fleet_clean_requisitions_v5";
const PM_SCHEDULES_STORAGE_KEY = "tnb_fleet_clean_pm_schedules_v1";
const DAILY_INSPECTIONS_STORAGE_KEY = "tnb_fleet_clean_daily_inspections_v1";
const DIRECTORY_STORAGE_KEY = "tnb_fleet_clean_directory_v1";

export default function App() {
  // Navigation View with URL param support & default to Work Operations Hub
  const [currentView, setCurrentView] = useState<AppNavView>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get("view");
      const validViews: AppNavView[] = [
        "requester", "worker", "vehicles", "daily_inspection",
        "pm_plan", "part_list", "receiving", "requisition", "workflow", "directory",
        "maintenance_intervals", "repair_history", "tire_management"
      ];
      if (viewParam === "operations") return "worker";
      if (viewParam && validViews.includes(viewParam as AppNavView)) {
        return viewParam as AppNavView;
      }
      const hash = window.location.hash.replace("#", "");
      if (hash === "operations") return "worker";
      if (hash && validViews.includes(hash as AppNavView)) {
        return hash as AppNavView;
      }
    } catch (e) {}
    return "worker"; // Default to Work Operations Hub (หน้านี้)
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync currentView with URL query parameter
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", currentView);
      window.history.replaceState(null, "", url.toString());
    } catch (e) {}
  }, [currentView]);

  // Cloud Sync Status
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Daily Inspection Records State
  const [dailyInspections, setDailyInspections] = useState<DailyVehicleInspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(DAILY_INSPECTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading daily inspections localStorage:", e);
    }
    return INITIAL_DAILY_INSPECTIONS;
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

  // Directory State (รายชื่อช่าง ร้านค้าอะไหล่ ศูนย์ซ่อมตัวแทนจำหน่าย)
  const [directory, setDirectory] = useState<ServiceDirectoryState>(() => {
    try {
      const saved = localStorage.getItem(DIRECTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading directory localStorage:", e);
    }
    return INITIAL_SERVICE_DIRECTORY;
  });

  // Collaboration State
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // Real-Time Multi-User WebSocket Collaboration Hook
  const {
    currentUser,
    setCurrentUser,
    onlineUsers,
    recentActivities,
    isConnected: isWsConnected,
    lastNotification,
    clearNotification,
    broadcastMutation,
    broadcastStateSync
  } = useRealtimeCollab({
    currentView,
    onDataSync: (entity, data, sender, description) => {
      if (entity === "directory") {
        setDirectory(data);
      } else if (entity === "tickets") {
        setTickets(data);
      } else if (entity === "vehicles") {
        setVehicles(data);
      } else if (entity === "inventory") {
        setInventory(data);
      } else if (entity === "receipts") {
        setReceipts(data);
      } else if (entity === "requisitions") {
        setRequisitions(data);
      } else if (entity === "pmSchedules") {
        setPmSchedules(data);
      } else if (entity === "dailyInspections") {
        setDailyInspections(data);
      }
    },
    onFullStateSync: (state) => {
      if (state.directory) setDirectory(state.directory);
      if (state.tickets) setTickets(state.tickets);
      if (state.vehicles) setVehicles(state.vehicles);
      if (state.inventory) setInventory(state.inventory);
      if (state.receipts) setReceipts(state.receipts);
      if (state.requisitions) setRequisitions(state.requisitions);
      if (state.pmSchedules) setPmSchedules(state.pmSchedules);
      if (state.dailyInspections) setDailyInspections(state.dailyInspections);
    }
  });

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBackdatedModalMode, setIsBackdatedModalMode] = useState(false);
  const [isTicketImportModalOpen, setIsTicketImportModalOpen] = useState(false);
  const [selectedVehicleForRepair, setSelectedVehicleForRepair] = useState<VehicleRecord | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<RepairTicket | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportBackupModalOpen, setIsExportBackupModalOpen] = useState(false);
  const [selectedPlateForRepairHistory, setSelectedPlateForRepairHistory] = useState<string | null>(null);

  // Initial Central Server Hydration & Background Polling to keep all devices in sync
  useEffect(() => {
    let isMounted = true;

    const loadCentralData = async () => {
      setIsSyncing(true);
      try {
        const serverState = await fetchServerFleetState();
        if (serverState && serverState.success && serverState.data) {
          const { data } = serverState;
          if (Array.isArray(data.vehicles) && data.vehicles.length > 0) setVehicles(data.vehicles);
          if (Array.isArray(data.tickets)) setTickets(data.tickets);
          if (Array.isArray(data.inventory)) setInventory(data.inventory);
          if (Array.isArray(data.receipts)) setReceipts(data.receipts);
          if (Array.isArray(data.requisitions)) setRequisitions(data.requisitions);
          if (Array.isArray(data.pmSchedules)) setPmSchedules(data.pmSchedules);
          if (Array.isArray(data.dailyInspections)) setDailyInspections(data.dailyInspections);
          if (data.directory && Array.isArray(data.directory.technicians)) setDirectory(data.directory);
          setLastSyncedTime(data.lastUpdated || new Date().toISOString());
          setIsCloudConnected(true);
        }
      } catch (e) {
        console.warn("Could not fetch central fleet state on mount:", e);
        setIsCloudConnected(false);
      } finally {
        if (isMounted) setIsSyncing(false);
        isInitialMount.current = false;
      }
    };

    loadCentralData();

    // Background polling every 8 seconds to synchronize changes across browsers/users
    const pollInterval = setInterval(async () => {
      try {
        const serverState = await fetchServerFleetState();
        if (serverState && serverState.success && serverState.data) {
          const { data } = serverState;
          const knownUpdate = getLastKnownServerUpdate();
          if (data.lastUpdated && data.lastUpdated !== knownUpdate) {
            if (Array.isArray(data.vehicles) && data.vehicles.length > 0) setVehicles(data.vehicles);
            if (Array.isArray(data.tickets)) setTickets(data.tickets);
            if (Array.isArray(data.inventory)) setInventory(data.inventory);
            if (Array.isArray(data.receipts)) setReceipts(data.receipts);
            if (Array.isArray(data.requisitions)) setRequisitions(data.requisitions);
            if (Array.isArray(data.pmSchedules)) setPmSchedules(data.pmSchedules);
            if (Array.isArray(data.dailyInspections)) setDailyInspections(data.dailyInspections);
            if (data.directory && Array.isArray(data.directory.technicians)) setDirectory(data.directory);
            setLastSyncedTime(data.lastUpdated);
          }
          setIsCloudConnected(true);
        }
      } catch (e) {
        setIsCloudConnected(false);
      }
    }, 8000);

    // Sync on window focus
    const handleFocus = async () => {
      try {
        const serverState = await fetchServerFleetState();
        if (serverState && serverState.success && serverState.data) {
          const { data } = serverState;
          if (Array.isArray(data.vehicles) && data.vehicles.length > 0) setVehicles(data.vehicles);
          if (Array.isArray(data.tickets)) setTickets(data.tickets);
          if (Array.isArray(data.inventory)) setInventory(data.inventory);
          if (Array.isArray(data.receipts)) setReceipts(data.receipts);
          if (Array.isArray(data.requisitions)) setRequisitions(data.requisitions);
          if (Array.isArray(data.pmSchedules)) setPmSchedules(data.pmSchedules);
          if (Array.isArray(data.dailyInspections)) setDailyInspections(data.dailyInspections);
          if (data.directory && Array.isArray(data.directory.technicians)) setDirectory(data.directory);
          setLastSyncedTime(data.lastUpdated || new Date().toISOString());
          setIsCloudConnected(true);
        }
      } catch (e) {
        setIsCloudConnected(false);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Debounced auto-push to central server whenever any module data changes
  useEffect(() => {
    if (isInitialMount.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      const ok = await pushServerFleetSync({
        vehicles,
        tickets,
        inventory,
        receipts,
        requisitions,
        pmSchedules,
        dailyInspections,
        directory
      });
      setIsSyncing(false);
      if (ok) {
        setIsCloudConnected(true);
        setLastSyncedTime(new Date().toISOString());
      }
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [vehicles, tickets, inventory, receipts, requisitions, pmSchedules, dailyInspections, directory]);

  // Sync to local storage for offline resiliency
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

  useEffect(() => {
    try {
      localStorage.setItem(DAILY_INSPECTIONS_STORAGE_KEY, JSON.stringify(dailyInspections));
    } catch (e) {
      console.error("Error saving daily inspections localStorage:", e);
    }
  }, [dailyInspections]);

  useEffect(() => {
    try {
      localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
    } catch (e) {
      console.error("Error saving directory localStorage:", e);
    }
  }, [directory]);

  // Manual Force Synchronize Handler
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      // First push local state to ensure nothing is lost
      await pushServerFleetSync({
        vehicles,
        tickets,
        inventory,
        receipts,
        requisitions,
        pmSchedules,
        dailyInspections,
        directory
      });
      // Fetch latest state from central server
      const res = await fetchServerFleetState();
      if (res && res.success && res.data) {
        const { data } = res;
        if (Array.isArray(data.vehicles) && data.vehicles.length > 0) setVehicles(data.vehicles);
        if (Array.isArray(data.tickets)) setTickets(data.tickets);
        if (Array.isArray(data.inventory)) setInventory(data.inventory);
        if (Array.isArray(data.receipts)) setReceipts(data.receipts);
        if (Array.isArray(data.requisitions)) setRequisitions(data.requisitions);
        if (Array.isArray(data.pmSchedules)) setPmSchedules(data.pmSchedules);
        if (Array.isArray(data.dailyInspections)) setDailyInspections(data.dailyInspections);
        if (data.directory && Array.isArray(data.directory.technicians)) setDirectory(data.directory);
        setLastSyncedTime(data.lastUpdated || new Date().toISOString());
        setIsCloudConnected(true);
      }
    } catch (e) {
      console.error("Manual sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [vehicles, tickets, inventory, receipts, requisitions, pmSchedules, dailyInspections, directory]);

  // Directory Update Handler with Multi-User Realtime Broadcast
  const handleUpdateDirectory = useCallback((updated: ServiceDirectoryState, actionDesc?: string) => {
    setDirectory(updated);
    broadcastMutation("directory", updated, actionDesc || "อัปเดตข้อมูลทำเนียบช่าง/ร้านค้า/ศูนย์ซ่อม");
  }, [broadcastMutation]);

  // Count active repair tickets assigned to each mechanic
  const activeTicketsCountByMechanic = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      if (t.status !== "completed" && t.assignedMechanic) {
        counts[t.assignedMechanic] = (counts[t.assignedMechanic] || 0) + 1;
      }
    });
    return counts;
  }, [tickets]);

  // Daily Inspection Handlers
  const handleAddDailyInspection = (record: DailyVehicleInspectionRecord, autoCreateTicket = false) => {
    setDailyInspections((prev) => [record, ...prev]);

    // Update vehicle mileage if higher
    if (record.vehicleId && record.currentMileage) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === record.vehicleId
            ? { ...v, currentMileage: Math.max(v.currentMileage || 0, record.currentMileage), updatedAt: new Date().toISOString() }
            : v
        )
      );
    }

    // If autoCreateTicket requested and has defects, create a repair ticket
    if (autoCreateTicket && record.overallStatus === "fail" && record.results) {
      const defectItems = record.results.filter((r) => r.status === "fail");
      if (defectItems.length > 0) {
        const symptomDesc = defectItems
          .map((d) => `• [ข้อ ${d.no} ${d.name}]: ${d.issueDescription || "ชำรุด/ผิดปกติ"}`)
          .join("\n");

        const ticketNo = `TNB-DCI-${Date.now().toString().slice(-4)}`;
        const newTicket: RepairTicket = {
          id: `tkt-dci-${Date.now()}`,
          ticketNumber: ticketNo,
          licensePlate: record.licensePlate,
          province: record.province,
          vehicleType: record.vehicleType as any,
          vehicleBrand: record.vehicleBrand,
          vehicleModel: record.vehicleModel,
          department: record.department,
          requesterName: record.inspectorName || record.driverName,
          requesterPhone: "081-999-8888",
          priority: "high",
          category: "inspection",
          symptoms: `[ตรวจพบจากการตรวจสภาพรถประจำวัน 21 ข้อ - ${record.docNumber}]\n${symptomDesc}`,
          attachedImages: [],
          status: "pending",
          assignedMechanic: "ทีมช่างซ่อมบำรุง TNB",
          partsList: [],
          partsCost: 0,
          laborCost: 0,
          totalCost: 0,
          currentMileage: record.currentMileage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              id: `h-1-${Date.now()}`,
              timestamp: new Date().toISOString(),
              status: "pending",
              note: `แจ้งซ่อมอัตโนมัติจากผลตรวจสภาพรถประจำวัน ${record.docNumber} (พบชำรุด ${defectItems.length} รายการ)`,
              updatedBy: record.inspectorName || "ระบบตรวจสภาพรถ"
            }
          ],
          mechanicNotes: `รายการที่ตรวจไม่ผ่าน:\n${symptomDesc}`
        };
        setTickets((prev) => [newTicket, ...prev]);
      }
    }
  };

  const handleUpdateDailyInspection = (updated: DailyVehicleInspectionRecord) => {
    setDailyInspections((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const handleDeleteDailyInspection = (id: string) => {
    setDailyInspections((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetToSampleDailyInspections = () => {
    setDailyInspections(INITIAL_DAILY_INSPECTIONS);
    localStorage.setItem(DAILY_INSPECTIONS_STORAGE_KEY, JSON.stringify(INITIAL_DAILY_INSPECTIONS));
  };

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

  // Bulk Historical Tickets Import Handler (Excel/CSV)
  const handleBulkImportTickets = (
    importedList: RepairTicket[],
    mode: "upsert" | "append" | "replace"
  ) => {
    if (mode === "replace") {
      setTickets(importedList);
    } else if (mode === "append") {
      setTickets((prev) => [...importedList, ...prev]);
    } else {
      // Upsert mode
      setTickets((prev) => {
        const existingMap = new Map<string, RepairTicket>();
        prev.forEach((t) => existingMap.set(t.ticketNumber || t.id, t));
        importedList.forEach((t) => existingMap.set(t.ticketNumber || t.id, t));
        return Array.from(existingMap.values());
      });
    }

    // Auto-update vehicle mileages from imported records
    setVehicles((prev) => {
      const updatedVehicles = [...prev];
      importedList.forEach((t) => {
        if (t.currentMileage && t.currentMileage > 0) {
          const vIdx = updatedVehicles.findIndex(
            (v) => v.licensePlate.trim().toUpperCase() === t.licensePlate.trim().toUpperCase()
          );
          if (vIdx >= 0) {
            updatedVehicles[vIdx] = {
              ...updatedVehicles[vIdx],
              currentMileage: Math.max(updatedVehicles[vIdx].currentMileage, t.currentMileage),
              updatedAt: new Date().toISOString()
            };
          }
        }
      });
      return updatedVehicles;
    });
  };

  const handleOpenNewTicketModal = (isBackdated = false, vehicle: VehicleRecord | null = null) => {
    setSelectedVehicleForRepair(vehicle);
    setIsBackdatedModalMode(isBackdated);
    setIsNewModalOpen(true);
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

  // Delete Repair Ticket Handler (สำหรับลบข้อมูลใบแจ้งซ่อมกรณีลงข้อมูลผิดพลาด)
  const handleDeleteTicket = (ticketId: string) => {
    const ticketToDelete = tickets.find((t) => t.id === ticketId);
    const ticketNo = ticketToDelete?.ticketNumber || ticketId;

    const updatedTickets = tickets.filter((t) => t.id !== ticketId);
    setTickets(updatedTickets);

    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updatedTickets));
    } catch (e) {
      console.error("Error saving tickets after deletion to localStorage:", e);
    }

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(null);
      setIsDetailModalOpen(false);
    }

    // Push deletion immediately to server
    pushServerFleetSync({ tickets: updatedTickets }).catch((err) => {
      console.warn("Could not sync ticket deletion to central server:", err);
    });
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

  const handleRequestRepairForVehicle = (vehicle: VehicleRecord, isBackdated = false) => {
    handleOpenNewTicketModal(isBackdated, vehicle);
  };

  const handleRestoreAllVehicles = async () => {
    const fleet108 = getFleet108Vehicles();
    setVehicles(fleet108);
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(fleet108));
    } catch (e) {
      console.error("Error saving vehicles to localStorage:", e);
    }
    // Push immediately to server
    setIsSyncing(true);
    await pushServerFleetSync({ vehicles: fleet108 });
    setIsSyncing(false);
    setLastSyncedTime(new Date().toISOString());
  };

  const handleClearAllVehicles = async () => {
    setVehicles([]);
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error("Error clearing vehicles in localStorage:", e);
    }
    // Push immediately to server
    setIsSyncing(true);
    await pushServerFleetSync({ vehicles: [] });
    setIsSyncing(false);
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
  const handleClearAllData = async () => {
    if (window.confirm("⚠️ ยืนยันการล้างข้อมูลทั้งระบบ?\n\nระบบจะลบข้อมูลทั้งหมด ได้แก่:\n- ประวัติและใบแจ้งซ่อมทั้งหมด (0 รายการ)\n- ประวัติการรับของเข้าคลัง (0 รายการ)\n- ประวัติการเบิกของ/อะไหล่ (0 รายการ)\n- แผน PM รถยนต์ (0 รายการ)\n- ผลการตรวจสภาพรถประจำวัน (0 รายการ)\n- ข้อมูลสารระบบทะเบียนรถ (0 คัน)\n- รายการพัสดุในคลังสินค้า (0 รายการ)\n\nเพื่อให้ระบบสะอาด 100% พร้อมสำหรับการเริ่มบันทึกใช้งานจริงของบริษัท TNB Logistics")) {
      setTickets([]);
      setVehicles([]);
      setInventory([]);
      setReceipts([]);
      setRequisitions([]);
      setPmSchedules([]);
      setDailyInspections([]);
      localStorage.removeItem(TICKETS_STORAGE_KEY);
      localStorage.removeItem(VEHICLES_STORAGE_KEY);
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      localStorage.removeItem(RECEIPTS_STORAGE_KEY);
      localStorage.removeItem(REQUISITIONS_STORAGE_KEY);
      localStorage.removeItem(PM_SCHEDULES_STORAGE_KEY);
      localStorage.removeItem(DAILY_INSPECTIONS_STORAGE_KEY);
      localStorage.clear();

      setIsSyncing(true);
      await pushServerFleetSync({
        tickets: [],
        vehicles: [],
        inventory: [],
        receipts: [],
        requisitions: [],
        pmSchedules: [],
        dailyInspections: []
      });
      setIsSyncing(false);
      setLastSyncedTime(new Date().toISOString());
    }
  };

  // Restore standard 9 tickets & 108 vehicles dataset (รีเซ็ตกลับเป็น 9 ใบงานมาตรฐานและ 108 คัน)
  const handleRestoreStandard9Tickets = async () => {
    const fleet108 = getFleet108Vehicles();
    setTickets(TNB_STANDARD_9_TICKETS);
    setVehicles(fleet108);
    setInventory(INITIAL_INVENTORY_ITEMS);
    setReceipts(INITIAL_GOODS_RECEIPTS);
    setRequisitions(INITIAL_GOODS_REQUISITIONS);
    setPmSchedules(INITIAL_PM_SCHEDULES_2026);
    setDailyInspections(INITIAL_DAILY_INSPECTIONS);

    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(TNB_STANDARD_9_TICKETS));
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(fleet108));
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(INITIAL_GOODS_RECEIPTS));
    localStorage.setItem(REQUISITIONS_STORAGE_KEY, JSON.stringify(INITIAL_GOODS_REQUISITIONS));
    localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(INITIAL_PM_SCHEDULES_2026));
    localStorage.setItem(DAILY_INSPECTIONS_STORAGE_KEY, JSON.stringify(INITIAL_DAILY_INSPECTIONS));

    setIsSyncing(true);
    await pushServerFleetSync({
      tickets: TNB_STANDARD_9_TICKETS,
      vehicles: fleet108,
      inventory: INITIAL_INVENTORY_ITEMS,
      receipts: INITIAL_GOODS_RECEIPTS,
      requisitions: INITIAL_GOODS_REQUISITIONS,
      pmSchedules: INITIAL_PM_SCHEDULES_2026,
      dailyInspections: INITIAL_DAILY_INSPECTIONS
    });
    setIsSyncing(false);
    setLastSyncedTime(new Date().toISOString());
  };

  // Load demo sample dataset for testing
  const handleLoadDemoData = async () => {
    if (window.confirm("ต้องการโหลดชุดข้อมูลตัวอย่าง (Demo Data: 8 คัน, แผน PM, ผลตรวจประจำวัน, รายการอะไหล่, ใบแจ้งซ่อม, ใบรับ และใบเบิก) สำหรับการทดลองใช้งานและดูตัวอย่างรายงานสรุปหรือไม่?")) {
      setTickets(DEMO_SAMPLE_TICKETS);
      setVehicles(DEMO_TNB_VEHICLES);
      setInventory(DEMO_INVENTORY_ITEMS);
      setReceipts(DEMO_GOODS_RECEIPTS);
      setRequisitions(DEMO_GOODS_REQUISITIONS);
      setPmSchedules(INITIAL_PM_SCHEDULES_2026);
      setDailyInspections(INITIAL_DAILY_INSPECTIONS);
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(DEMO_SAMPLE_TICKETS));
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(DEMO_TNB_VEHICLES));
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(DEMO_INVENTORY_ITEMS));
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(DEMO_GOODS_RECEIPTS));
      localStorage.setItem(REQUISITIONS_STORAGE_KEY, JSON.stringify(DEMO_GOODS_REQUISITIONS));
      localStorage.setItem(PM_SCHEDULES_STORAGE_KEY, JSON.stringify(INITIAL_PM_SCHEDULES_2026));
      localStorage.setItem(DAILY_INSPECTIONS_STORAGE_KEY, JSON.stringify(INITIAL_DAILY_INSPECTIONS));

      setIsSyncing(true);
      await pushServerFleetSync({
        tickets: DEMO_SAMPLE_TICKETS,
        vehicles: DEMO_TNB_VEHICLES,
        inventory: DEMO_INVENTORY_ITEMS,
        receipts: DEMO_GOODS_RECEIPTS,
        requisitions: DEMO_GOODS_REQUISITIONS,
        pmSchedules: INITIAL_PM_SCHEDULES_2026,
        dailyInspections: INITIAL_DAILY_INSPECTIONS
      });
      setIsSyncing(false);
      setLastSyncedTime(new Date().toISOString());
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
        dailyInspectionCount={dailyInspections.length}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
        lastSyncedTime={lastSyncedTime}
        onManualSync={handleManualSync}
        onClearAllData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
        onRestoreStandardData={handleRestoreStandard9Tickets}
        onOpenNewModal={() => handleOpenNewTicketModal(false)}
        onOpenBackdatedTicketModal={() => handleOpenNewTicketModal(true)}
        onOpenImportTicketsModal={() => setIsTicketImportModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenExportBackupModal={() => setIsExportBackupModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        collabCurrentUser={currentUser}
        collabOnlineUsers={onlineUsers}
        isWsConnected={isWsConnected}
        onOpenCollabModal={() => setIsCollabModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        
        {/* Module 1: หน้าคนแจ้ง (Requester Portal) */}
        {currentView === "requester" && (
          <RequesterPortal
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onOpenNewModal={() => handleOpenNewTicketModal(false)}
            onOpenBackdatedModal={() => handleOpenNewTicketModal(true)}
            onOpenPrint={handleOpenPrint}
            onDeleteTicket={handleDeleteTicket}
          />
        )}

        {/* Module 2: หน้าทำงาน & ช่าง (Workshop Operations & Admin Hub) */}
        {currentView === "worker" && (
          <WorkOperationsPortal
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onOpenNewModal={() => handleOpenNewTicketModal(false)}
            onOpenBackdatedModal={() => handleOpenNewTicketModal(true)}
            onOpenImportTicketsModal={() => setIsTicketImportModalOpen(true)}
            onQuickStatusChange={handleQuickStatusChange}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onDeleteTicket={handleDeleteTicket}
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
            onOpenVehicleRepairHistory={(plate) => {
              setSelectedPlateForRepairHistory(plate);
              setCurrentView("repair_history");
            }}
            onBulkImportVehicles={handleBulkImportVehicles}
            onRestoreAllVehicles={handleRestoreAllVehicles}
            onDeleteAllVehicles={handleClearAllVehicles}
          />
        )}

        {/* Module 3.2: ตรวจสภาพรถประจำวัน (Daily Vehicle Inspection ISO-SHE-FRM-007) */}
        {currentView === "daily_inspection" && (
          <DailyInspectionView
            vehicles={vehicles}
            tickets={tickets}
            dailyInspections={dailyInspections}
            onAddDailyInspection={handleAddDailyInspection}
            onUpdateDailyInspection={handleUpdateDailyInspection}
            onDeleteDailyInspection={handleDeleteDailyInspection}
            onLoadSampleMonthlyInspections={handleResetToSampleDailyInspections}
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

        {/* Module 3.6: แผนบำรุงรักษาตามระยะทาง & แจ้งเตือนเลขไมล์ (Maintenance Interval Matrix: DIY vs Center) */}
        {currentView === "maintenance_intervals" && (
          <MaintenanceIntervalMatrixView
            vehicles={vehicles}
            tickets={tickets}
            onRequestRepairForVehicle={handleRequestRepairForVehicle}
            onOpenVehicleRepairHistory={(plate) => {
              setSelectedPlateForRepairHistory(plate);
              setCurrentView("repair_history");
            }}
          />
        )}

        {/* Module 3.65: ระบบตรวจสอบ & เปลี่ยนยางรายคัน (Tire Management & Tread Depth Tracking) */}
        {currentView === "tire_management" && (
          <TireManagementView
            vehicles={vehicles}
            tickets={tickets}
            onRequestRepairForVehicle={handleRequestRepairForVehicle}
            onOpenVehicleRepairHistory={(plate) => {
              setSelectedPlateForRepairHistory(plate);
              setCurrentView("repair_history");
            }}
          />
        )}

        {/* Module 3.7: สรุปประวัติการซ่อมและค่าใช้จ่ายรายคัน (Vehicle Repair History & Cost Ledger) */}
        {currentView === "repair_history" && (
          <VehicleRepairHistoryView
            vehicles={vehicles}
            tickets={tickets}
            initialLicensePlate={selectedPlateForRepairHistory || undefined}
            onSelectTicket={handleSelectTicket}
            onOpenNewTicketForVehicle={handleRequestRepairForVehicle}
            onDeleteTicket={handleDeleteTicket}
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

        {/* Module 8: ทำเนียบช่าง ร้านค้า ศูนย์ซ่อม (Service Directory: Mechanics, Suppliers, Service Centers) */}
        {currentView === "directory" && (
          <ServiceDirectoryView
            directory={directory}
            onUpdateDirectory={handleUpdateDirectory}
            activeTicketsCountByMechanic={activeTicketsCountByMechanic}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
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
      {isNewModalOpen && (
        <RepairRequestModal
          isOpen={isNewModalOpen}
          onClose={() => {
            setIsNewModalOpen(false);
            setIsBackdatedModalMode(false);
            setSelectedVehicleForRepair(null);
          }}
          onSubmitTicket={handleAddNewTicket}
          vehicles={vehicles}
          initialVehicle={selectedVehicleForRepair}
          initialIsBackdated={isBackdatedModalMode}
        />
      )}

      {isTicketImportModalOpen && (
        <TicketImportModal
          isOpen={isTicketImportModalOpen}
          onClose={() => setIsTicketImportModalOpen(false)}
          existingVehicles={vehicles}
          onImportTickets={handleBulkImportTickets}
        />
      )}

      {isDetailModalOpen && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTicket(null);
          }}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
          onOpenPrint={handleOpenPrint}
          inventory={inventory}
          vehicles={vehicles}
          availableTechnicians={directory.technicians}
          onDisburseStockPart={handleDisburseStockPart}
          onRestockPart={handleRestockPart}
        />
      )}

      {isSearchModalOpen && (
        <QuickSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          tickets={tickets}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {isPrintModalOpen && ticketToPrint && (
        <PrintWorkOrderModal
          ticket={ticketToPrint}
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setTicketToPrint(null);
          }}
        />
      )}

      {isExportBackupModalOpen && (
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
      )}

      {/* Direct Page & Real-Time Sync Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentView={currentView}
        />
      )}

      {/* Real-Time Collaboration Activity Toast */}
      <CollabNotificationToast
        notification={lastNotification}
        onDismiss={clearNotification}
      />

      {/* Real-Time Multi-User Collaboration & Presence Modal */}
      {isCollabModalOpen && (
        <CollabModal
          isOpen={isCollabModalOpen}
          onClose={() => setIsCollabModalOpen(false)}
          currentUser={currentUser}
          onSelectUser={setCurrentUser}
          onlineUsers={onlineUsers}
          recentActivities={recentActivities}
          isConnected={isWsConnected}
        />
      )}
    </div>
  );
}
