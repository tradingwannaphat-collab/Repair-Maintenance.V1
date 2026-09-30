import { 
  RepairTicket, 
  VehicleRecord, 
  InventoryItem, 
  GoodsReceiptRecord, 
  GoodsRequisitionRecord, 
  PMMonthlyScheduleItem, 
  DailyVehicleInspectionRecord,
  VehicleSafetyHandoverRecord,
  ServiceDirectoryState,
  MileageLogEntry 
} from "../types";

export interface SyncPayload {
  vehicles?: VehicleRecord[];
  tickets?: RepairTicket[];
  inventory?: InventoryItem[];
  receipts?: GoodsReceiptRecord[];
  requisitions?: GoodsRequisitionRecord[];
  pmSchedules?: PMMonthlyScheduleItem[];
  dailyInspections?: DailyVehicleInspectionRecord[];
  safetyHandovers?: VehicleSafetyHandoverRecord[];
  directory?: ServiceDirectoryState;
  mileageLogs?: MileageLogEntry[];
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
    safetyHandovers?: VehicleSafetyHandoverRecord[];
    directory?: ServiceDirectoryState;
    mileageLogs?: MileageLogEntry[];
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

/**
 * Send a simulated or manual LINE message to the backend LINE parser
 */
export async function simulateLineMileageMessage(
  message: string,
  apply: boolean = true
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    const res = await fetch("/api/line/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, apply, sourceClient: CLIENT_ID })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to call LINE simulate API" };
  }
}

/**
 * Batch import multi-line messages copied from a LINE group chat
 */
export async function batchImportLineMileage(
  batchText: string,
  apply: boolean = true
): Promise<{
  success: boolean;
  results?: any[];
  appliedCount?: number;
  error?: string;
}> {
  try {
    const res = await fetch("/api/line/batch-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchText, apply, sourceClient: CLIENT_ID })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to call LINE batch import API" };
  }
}

/**
 * Scan an odometer photo using server-side Gemini OCR
 */
export async function ocrLineOdometerPhoto(
  imageBase64: string,
  apply: boolean = false
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch("/api/line/ocr-odometer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, apply, sourceClient: CLIENT_ID })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to perform OCR" };
  }
}
