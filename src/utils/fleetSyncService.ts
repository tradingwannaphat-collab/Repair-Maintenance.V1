import { 
  RepairTicket, 
  VehicleRecord, 
  InventoryItem, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord, 
  PMMonthlyScheduleItem, 
  DailyVehicleInspectionRecord,
  ServiceDirectoryState 
} from "../types";

export interface SyncPayload {
  vehicles?: VehicleRecord[];
  tickets?: RepairTicket[];
  inventory?: InventoryItem[];
  receipts?: GoodsReceiptRecord[];
  requisitions?: GoodsRequisitionRecord[];
  pmSchedules?: PMMonthlyScheduleItem[];
  dailyInspections?: DailyVehicleInspectionRecord[];
  directory?: ServiceDirectoryState;
  timestamp?: string;
  sourceClient?: string;
}

export interface ServerStateResponse {
  success: boolean;
  data: {
    vehicles: VehicleRecord[];
    tickets: RepairTicket[];
    inventory: InventoryItem[];
    receipts: GoodsReceiptRecord[];
    requisitions: GoodsRequisitionRecord[];
    pmSchedules: PMMonthlyScheduleItem[];
    dailyInspections: DailyVehicleInspectionRecord[];
    directory?: ServiceDirectoryState;
    lastUpdated: string;
    version: number;
  };
  serverTime: string;
}

// Generate client instance ID
const CLIENT_ID = "client_" + Math.random().toString(36).substring(2, 9);

let lastKnownServerUpdate: string | null = null;
let isSyncingInProgress = false;

/**
 * Fetch the latest shared state from the central server
 */
export async function fetchServerFleetState(): Promise<ServerStateResponse | null> {
  try {
    const res = await fetch("/api/fleet/state", {
      headers: { "Cache-Control": "no-cache" }
    });
    if (!res.ok) {
      console.warn("Failed to fetch central fleet state:", res.statusText);
      return null;
    }
    const json: ServerStateResponse = await res.json();
    if (json && json.success && json.data) {
      lastKnownServerUpdate = json.data.lastUpdated;
      return json;
    }
    return null;
  } catch (error) {
    console.warn("Central server sync fetch error (operating in offline fallback mode):", error);
    return null;
  }
}

/**
 * Push current client state updates to the central server
 */
export async function pushServerFleetSync(payload: SyncPayload): Promise<boolean> {
  if (isSyncingInProgress) return false;
  isSyncingInProgress = true;

  try {
    const res = await fetch("/api/fleet/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        sourceClient: CLIENT_ID
      })
    });

    if (!res.ok) {
      console.warn("Sync push failed with status:", res.status);
      return false;
    }

    const data = await res.json();
    if (data && data.success) {
      lastKnownServerUpdate = data.lastUpdated;
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Error pushing sync to server:", error);
    return false;
  } finally {
    isSyncingInProgress = false;
  }
}

/**
 * Reset server state back to master 108 baseline
 */
export async function resetServerFleetState(): Promise<ServerStateResponse | null> {
  try {
    const res = await fetch("/api/fleet/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceClient: CLIENT_ID,
        timestamp: new Date().toISOString()
      })
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.success && json.data) {
      lastKnownServerUpdate = json.data.lastUpdated;
      return json;
    }
    return null;
  } catch (error) {
    console.error("Error resetting server fleet state:", error);
    return null;
  }
}

export function getLastKnownServerUpdate(): string | null {
  return lastKnownServerUpdate;
}
