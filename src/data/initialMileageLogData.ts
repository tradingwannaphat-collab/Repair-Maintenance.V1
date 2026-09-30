import { MileageLogEntry, VehicleRecord, MileageLogSource } from "../types";
import { normalizeLicensePlate } from "../utils/excelImportExport";

/**
 * Parses a single LINE message text to extract license plate and odometer reading
 */
export interface ParsedLineMileageResult {
  matchedVehicle: VehicleRecord | null;
  extractedPlate: string;
  extractedMileage: number | null;
  extractedDriverName?: string;
  previousMileage: number;
  distanceDelta: number;
  isValid: boolean;
  warningNote?: string;
  rawMessage: string;
}

export function parseLineOdometerMessage(
  rawText: string,
  vehicles: VehicleRecord[]
): ParsedLineMileageResult {
  const clean = rawText.trim();
  let extractedPlate = "";
  let extractedMileage: number | null = null;
  let extractedDriverName: string | undefined = undefined;

  // 1. Try to extract driver name if pattern matches "คนขับ: ..." or "ชื่อ: ..." or "ผู้แจ้ง: ..."
  const driverMatch = clean.match(/(?:คนขับ|ผู้ขับ|คนขับรถ|ชื่อ|ผู้แจ้ง)[:\s]+([^\s\n,]+)/i);
  if (driverMatch && driverMatch[1]) {
    extractedDriverName = driverMatch[1].trim();
  }

  // 2. Try to match vehicle ERP No (e.g. TL001, TL-033, T10-NO.01, No. 65, คันที่ 1)
  const erpMatch = clean.match(/(?:no\.?|คันที่|เบอร์รถ|tl|t10)[\s:-]*([0-9a-z.-]+)/i);
  let matchedVehicle: VehicleRecord | null = null;

  if (erpMatch && erpMatch[1]) {
    const rawErp = erpMatch[1].trim().toLowerCase();
    matchedVehicle = vehicles.find(v => {
      const vErp = (v.erpNo || "").toLowerCase().trim();
      return vErp === rawErp || vErp.includes(rawErp) || rawErp.includes(vErp);
    }) || null;
  }

  // 3. Try to match license plate across vehicle list
  // Normalize license plates in vehicles
  if (!matchedVehicle) {
    // Sort vehicles by plate length descending to match longest first
    const sortedVehicles = [...vehicles].sort((a, b) => b.licensePlate.length - a.licensePlate.length);
    for (const v of sortedVehicles) {
      const normPlate = normalizeLicensePlate(v.licensePlate).toLowerCase();
      const rawPlate = v.licensePlate.toLowerCase();
      const normText = normalizeLicensePlate(clean).toLowerCase();

      if (
        clean.toLowerCase().includes(rawPlate) ||
        (normPlate.length >= 4 && normText.includes(normPlate))
      ) {
        matchedVehicle = v;
        extractedPlate = v.licensePlate;
        break;
      }
    }
  }

  // Fallback: look for common Thai plate patterns like "1ฒข-4589", "70-1234", "69-3652", "700-7239"
  if (!matchedVehicle) {
    const plateRegex = /([0-9]{1,3}[ก-ฮ]{1,2}[-\s]?[0-9]{1,4}|[0-9]{2,3}[-\s][0-9]{4}|[ก-ฮ]{2}[-\s]?[0-9]{1,4})/i;
    const plateMatch = clean.match(plateRegex);
    if (plateMatch && plateMatch[1]) {
      extractedPlate = plateMatch[1].trim();
      const normExtracted = normalizeLicensePlate(extractedPlate).toLowerCase();
      matchedVehicle = vehicles.find(v => {
        return normalizeLicensePlate(v.licensePlate).toLowerCase() === normExtracted;
      }) || null;
    }
  }

  if (matchedVehicle && !extractedPlate) {
    extractedPlate = matchedVehicle.licensePlate;
  }

  // 4. Extract mileage numbers:
  // Patterns like "ไมล์ 85400", "เลขไมล์ 120,500", "ไมล์: 75,000", "85200 กม.", "ไมค์ 95000"
  const mileageKeywords = [
    /(?:เลขไมล์|ไมล์|ไมค์|กิโล|km|odo|odometer)[:\s]*([0-9,]{3,7})/i,
    /([0-9,]{4,7})\s*(?:กม\.?|กิโลเมตร|km)/i,
    /(?:ล่าสุด|วิ่งไป|ขึ้น|แจ้งไมล์)[:\s]*([0-9,]{3,7})/i
  ];

  for (const regex of mileageKeywords) {
    const m = clean.match(regex);
    if (m && m[1]) {
      const num = parseInt(m[1].replace(/,/g, ""), 10);
      if (!isNaN(num) && num > 0) {
        extractedMileage = num;
        break;
      }
    }
  }

  // If still no mileage found, search for standalone 4-6 digit number not part of the plate
  if (extractedMileage === null) {
    const allNumbers = clean.match(/\b([0-9]{4,6})\b/g);
    if (allNumbers && allNumbers.length > 0) {
      for (const numStr of allNumbers) {
        const num = parseInt(numStr, 10);
        // check if it's not the plate digits
        if (matchedVehicle && matchedVehicle.licensePlate.includes(numStr)) {
          continue;
        }
        if (num >= 500 && num <= 999999) {
          extractedMileage = num;
          break;
        }
      }
    }
  }

  const prevMileage = matchedVehicle ? matchedVehicle.currentMileage : 0;
  const delta = (extractedMileage !== null && matchedVehicle) ? (extractedMileage - prevMileage) : 0;
  
  let warningNote: string | undefined = undefined;
  if (matchedVehicle && extractedMileage !== null) {
    if (extractedMileage < prevMileage) {
      warningNote = `⚠️ เลขไมล์ใหม่ (${extractedMileage.toLocaleString()} กม.) น้อยกว่าเลขไมล์เดิม (${prevMileage.toLocaleString()} กม.)`;
    } else if (delta > 5000) {
      warningNote = `⚠️ ระยะทางเพิ่มขึ้นสูงผิดปกติ (+${delta.toLocaleString()} กม.)`;
    }
  }

  const isValid = Boolean(matchedVehicle && extractedMileage !== null && extractedMileage > 0);

  return {
    matchedVehicle,
    extractedPlate: extractedPlate || (matchedVehicle ? matchedVehicle.licensePlate : "ไม่พบทะเบียน"),
    extractedMileage,
    extractedDriverName: extractedDriverName || (matchedVehicle ? matchedVehicle.driverName : undefined),
    previousMileage: prevMileage,
    distanceDelta: delta,
    isValid,
    warningNote,
    rawMessage: clean
  };
}

/**
 * Batch parses multiple LINE messages from a copied chat group
 */
export function parseBatchLineMessages(
  batchText: string,
  vehicles: VehicleRecord[]
): ParsedLineMileageResult[] {
  const lines = batchText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 3);

  const results: ParsedLineMileageResult[] = [];

  for (const line of lines) {
    // Ignore timestamps header like "10:30 นายสมชาย: ..."
    const cleanedLine = line.replace(/^[0-9]{1,2}:[0-9]{2}\s*(?:น\.)?\s*/, "");
    if (!cleanedLine) continue;

    const res = parseLineOdometerMessage(cleanedLine, vehicles);
    if (res.extractedMileage !== null || res.matchedVehicle !== null) {
      results.push(res);
    }
  }

  return results;
}

/**
 * Generate seed mileage logs for vehicles so that all vehicles have a rich history
 */
export function generateInitialMileageLogs(vehicles: VehicleRecord[]): {
  logs: MileageLogEntry[];
  updatedVehicles: VehicleRecord[];
} {
  const logs: MileageLogEntry[] = [];
  const now = new Date("2026-09-26T10:00:00.000Z");

  const sources: MileageLogSource[] = [
    "line_webhook",
    "line_chat_import",
    "daily_inspection",
    "repair_ticket",
    "line_webhook"
  ];

  const updatedVehicles = vehicles.map((v, index) => {
    const cur = v.currentMileage || 50000;
    // Determine 2 to 6 historical update steps
    const numUpdates = 2 + (index % 5);
    const initialMileage = Math.max(0, Math.round(cur - numUpdates * (650 + (index % 400))));
    
    let runningMileage = initialMileage;
    const stepIncrease = Math.round((cur - initialMileage) / numUpdates);

    for (let step = 1; step <= numUpdates; step++) {
      const isLast = step === numUpdates;
      const stepMileage = isLast ? cur : runningMileage + stepIncrease;
      const delta = stepMileage - runningMileage;

      const daysAgo = (numUpdates - step) * 3 + 1;
      const logDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const src = sources[(index + step) % sources.length];

      logs.push({
        id: `LOG-ML-${v.id}-${step}`,
        vehicleId: v.id,
        licensePlate: v.licensePlate,
        erpNo: v.erpNo,
        previousMileage: runningMileage,
        newMileage: stepMileage,
        distanceDelta: delta,
        recordedAt: logDate.toISOString(),
        source: src,
        reporterName: v.driverName || "พนักงานขับรถประจำสาย TNB",
        rawMessage: src === "line_webhook" 
          ? `LINE Webhook: ${v.licensePlate} ไมล์ ${stepMileage.toLocaleString()} กม.`
          : src === "line_chat_import"
          ? `กลุ่มแชทขนส่ง: [${v.erpNo ? `No. ${v.erpNo} ` : ""}${v.licensePlate}] เลขไมล์ ${stepMileage}`
          : `บันทึกผ่านระบบ (${src === "daily_inspection" ? "ตรวจเช็คประจำวัน" : "ใบแจ้งซ่อม"})`,
        notes: isLast ? "อัปเดตล่าสุดตรงกับเลขไมล์สารระบบ" : undefined
      });

      runningMileage = stepMileage;
    }

    return {
      ...v,
      initialMileage: initialMileage,
      mileageUpdateCount: numUpdates,
      lastMileageUpdateDate: logs[logs.length - 1]?.recordedAt || now.toISOString(),
      lastMileageSource: logs[logs.length - 1]?.source || "line_webhook"
    };
  });

  return { logs, updatedVehicles };
}
