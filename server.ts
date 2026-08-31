import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import { getFleet108Vehicles } from "./src/data/masterFleet108";
import { 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_GOODS_RECEIPTS, 
  INITIAL_GOODS_REQUISITIONS 
} from "./src/data/initialFleetData";
import { INITIAL_TICKETS } from "./src/data/mockData";
import { INITIAL_DAILY_INSPECTIONS } from "./src/data/dailyInspectionData";
import { INITIAL_PM_SCHEDULES_2026 } from "./src/data/pmPlanData";

dotenv.config();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Data Directory & Server-Side Persistent Store
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DATA_DIR, "server_fleet_db.json");

interface FleetServerDB {
  version: number;
  lastUpdated: string;
  vehicles: any[];
  tickets: any[];
  inventory: any[];
  receipts: any[];
  requisitions: any[];
  pmSchedules: any[];
  dailyInspections: any[];
}

function getDefaultFleetDB(): FleetServerDB {
  return {
    version: 108,
    lastUpdated: new Date().toISOString(),
    vehicles: getFleet108Vehicles(),
    tickets: INITIAL_TICKETS,
    inventory: INITIAL_INVENTORY_ITEMS,
    receipts: INITIAL_GOODS_RECEIPTS,
    requisitions: INITIAL_GOODS_REQUISITIONS,
    pmSchedules: INITIAL_PM_SCHEDULES_2026,
    dailyInspections: INITIAL_DAILY_INSPECTIONS,
  };
}

let inMemoryDB: FleetServerDB = getDefaultFleetDB();

// Initialize DB from disk or default
function initServerDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
          inMemoryDB = {
            version: parsed.version || 108,
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
            vehicles: parsed.vehicles,
            tickets: (Array.isArray(parsed.tickets) && parsed.tickets.length > 0) ? parsed.tickets : INITIAL_TICKETS,
            inventory: Array.isArray(parsed.inventory) ? parsed.inventory : INITIAL_INVENTORY_ITEMS,
            receipts: Array.isArray(parsed.receipts) ? parsed.receipts : INITIAL_GOODS_RECEIPTS,
            requisitions: Array.isArray(parsed.requisitions) ? parsed.requisitions : INITIAL_GOODS_REQUISITIONS,
            pmSchedules: Array.isArray(parsed.pmSchedules) ? parsed.pmSchedules : INITIAL_PM_SCHEDULES_2026,
            dailyInspections: Array.isArray(parsed.dailyInspections) ? parsed.dailyInspections : INITIAL_DAILY_INSPECTIONS,
          };
          console.log(`[Fleet Server DB] Loaded ${inMemoryDB.vehicles.length} vehicles, ${inMemoryDB.tickets.length} tickets from disk`);
          return;
        }
      }
    }
    // If no existing file or empty, write default
    saveServerDB(inMemoryDB);
    console.log(`[Fleet Server DB] Initialized fresh master database with ${inMemoryDB.vehicles.length} vehicles`);
  } catch (err) {
    console.error("[Fleet Server DB] Error reading DB file:", err);
    inMemoryDB = getDefaultFleetDB();
  }
}

function saveServerDB(data: FleetServerDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Fleet Server DB] Error saving DB to disk:", err);
  }
}

initServerDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 vehicle images and full fleet sync
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(), 
      vehiclesCount: inMemoryDB.vehicles.length, 
      ticketsCount: inMemoryDB.tickets.length 
    });
  });

  // API Route: GET Central Shared Fleet State (All devices query this)
  app.get("/api/fleet/state", (req, res) => {
    res.json({
      success: true,
      data: inMemoryDB,
      serverTime: new Date().toISOString()
    });
  });

  // API Route: POST Synchronize / Save Updates across all clients
  app.post("/api/fleet/sync", (req, res) => {
    try {
      const { 
        vehicles, 
        tickets, 
        inventory, 
        receipts, 
        requisitions, 
        pmSchedules, 
        dailyInspections 
      } = req.body;

      let changed = false;
      const now = new Date().toISOString();

      if (Array.isArray(vehicles)) {
        inMemoryDB.vehicles = vehicles;
        changed = true;
      }
      if (Array.isArray(tickets)) {
        inMemoryDB.tickets = tickets;
        changed = true;
      }
      if (Array.isArray(inventory)) {
        inMemoryDB.inventory = inventory;
        changed = true;
      }
      if (Array.isArray(receipts)) {
        inMemoryDB.receipts = receipts;
        changed = true;
      }
      if (Array.isArray(requisitions)) {
        inMemoryDB.requisitions = requisitions;
        changed = true;
      }
      if (Array.isArray(pmSchedules)) {
        inMemoryDB.pmSchedules = pmSchedules;
        changed = true;
      }
      if (Array.isArray(dailyInspections)) {
        inMemoryDB.dailyInspections = dailyInspections;
        changed = true;
      }

      if (changed) {
        inMemoryDB.lastUpdated = now;
        inMemoryDB.version += 1;
        saveServerDB(inMemoryDB);
      }

      res.json({
        success: true,
        lastUpdated: inMemoryDB.lastUpdated,
        version: inMemoryDB.version,
        counts: {
          vehicles: inMemoryDB.vehicles.length,
          tickets: inMemoryDB.tickets.length,
          inventory: inMemoryDB.inventory.length
        }
      });
    } catch (err: any) {
      console.error("Error in /api/fleet/sync:", err);
      res.status(500).json({ success: false, error: err?.message || "Sync failed" });
    }
  });

  // API Route: POST Reset back to standard 108 Master Fleet
  app.post("/api/fleet/reset", (req, res) => {
    try {
      inMemoryDB = getDefaultFleetDB();
      saveServerDB(inMemoryDB);
      res.json({
        success: true,
        data: inMemoryDB,
        serverTime: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Error in /api/fleet/reset:", err);
      res.status(500).json({ success: false, error: err?.message || "Reset failed" });
    }
  });

  // API Route: AI Vehicle Diagnostic & Estimate
  app.post("/api/ai/diagnose", async (req, res) => {
    try {
      const { category, vehicleInfo, symptoms, images } = req.body;
      const ai = getGeminiAI();

      const prompt = `คุณคือผู้เชี่ยวชาญด้านช่างยนต์และประเมินราคางานซ่อมบำรุงยานพาหนะระดับมืออาชีพ
โปรดวิเคราะห์การแจ้งซ่อมต่อไปนี้:
- ข้อมูลรถ: ${vehicleInfo || "ไม่ระบุ"}
- ประเภทงานซ่อม: ${category || "ทั่วไป"}
- อาการที่แจ้ง: ${symptoms || "ไม่ระบุ"}

กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON ตามโครงสร้างนี้เท่านั้น:
{
  "summary": "สรุปอาการและสาเหตุที่เป็นไปได้สั้นๆ 1-2 ประโยค",
  "possibleCauses": ["สาเหตุที่ 1", "สาเหตุที่ 2", "สาเหตุที่ 3"],
  "recommendedChecks": ["จุดที่ช่างควรตรวจเช็ค 1", "จุดที่ช่างควรตรวจเช็ค 2", "จุดที่ช่างควรตรวจเช็ค 3"],
  "suggestedParts": [
    {"name": "ชื่ออะไหล่/น้ำมันที่คาดว่าต้องเปลี่ยน", "estimatedCost": 1500, "necessity": "จำเป็นมาก/ควรเปลี่ยน/ตรวจเช็คก่อน"}
  ],
  "estimatedLaborCost": 500,
  "estimatedTotalCost": 2000,
  "estimatedRepairTimeHours": 2,
  "urgencyLevel": "ฉุกเฉิน / เร่งด่วน / ปานกลาง / ทั่วไป",
  "safetyWarning": "คำเตือนด้านความปลอดภัยในการขับขี่หากยังไม่ซ่อม"
}`;

      const contents: any[] = [];
      
      // If image parts are provided (base64)
      if (Array.isArray(images) && images.length > 0) {
        const parts: any[] = [];
        for (const img of images.slice(0, 3)) {
          if (img && typeof img === 'string' && img.startsWith('data:')) {
            const matches = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2],
                }
              });
            }
          }
        }
        parts.push({ text: prompt });
        contents.push({ parts });
      } else {
        contents.push(prompt);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      res.json({ success: true, diagnosis: parsed });
    } catch (error: any) {
      console.error("Diagnostic error:", error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || "ไม่สามารถวิเคราะห์อาการผ่าน AI ได้ในขณะนี้" 
      });
    }
  });

  // API Route: AI Executive Monthly Summary Generator
  app.post("/api/ai/executive-summary", async (req, res) => {
    try {
      const { monthName, year, metrics, categoryBreakdown, frequentVehicles, highCostTickets } = req.body;
      const ai = getGeminiAI();

      const prompt = `คุณคือที่ปรึกษาด้านการบริหารจัดการยานพาหนะและงานซ่อมบำรุงระดับผู้บริหาร (Fleet Maintenance Executive Advisor)
กรุณาวิเคราะห์ข้อมูลสรุปงานซ่อมบำรุงประจำเดือน ${monthName} ${year} ดังนี้:

- สถิติภาพรวม:
  * จำนวนงานซ่อมทั้งหมด: ${metrics?.totalRequests || 0} รายการ
  * ซ่อมเสร็จสิ้นแล้ว: ${metrics?.completedRequests || 0} รายการ (${metrics?.completionRate || 0}%)
  * อยู่ระหว่างดำเนินการ/รออะไหล่: ${metrics?.inProgressRequests || 0} รายการ
  * ค่าใช้จ่ายรวมทั้งหมด: ฿${(metrics?.totalCost || 0).toLocaleString()} (ค่าอะไหล่: ฿${(metrics?.partsCost || 0).toLocaleString()}, ค่าแรง: ฿${(metrics?.laborCost || 0).toLocaleString()})
  * เวลาเฉลี่ยในการซ่อม (MTTR): ${metrics?.averageRepairHours || 0} ชั่วโมง
  * อัตรางานซ่อมตรงเวลา (SLA): ${metrics?.onTimeRate || 0}%

- สัดส่วนประเภทงานซ่อมยอดฮิต:
${JSON.stringify(categoryBreakdown || [], null, 2)}

- รถที่มีการส่งซ่อมบ่อยที่สุด:
${JSON.stringify(frequentVehicles || [], null, 2)}

- งานซ่อมที่มีค่าใช้จ่ายสูงสุด 3 อันดับ:
${JSON.stringify(highCostTickets || [], null, 2)}

กรุณาสรุปรายงานเชิงกลยุทธ์สำหรับผู้บริหารในรูปแบบ JSON:
{
  "executiveOverview": "สรุปสถานการณ์ภาพรวมการซ่อมบำรุงของกองยานพาหนะในเดือนนี้ 3-4 ประโยคที่กระชับและตรงประเด็นสำหรับระดับ C-level/ผู้บริหาร",
  "keyHighlights": [
    "ไฮไลท์สำคัญข้อที่ 1 (ด้านประสิทธิภาพหรือสถิติ)",
    "ไฮไลท์สำคัญข้อที่ 2 (ด้านค่าใช้จ่ายและงบประมาณ)",
    "ไฮไลท์สำคัญข้อที่ 3 (ด้านการบริหารจัดการอะไหล่และเวลา)"
  ],
  "costAnalysis": "วิเคราะห์แนวโน้มและโครงสร้างค่าใช้จ่าย ค่าอะไหล่เทียบกับค่าแรง และความคุ้มค่า",
  "riskAndAlerts": [
    "ความเสี่ยงหรือจุดเตือน เช่น รถที่ซ่อมบ่อยผิดปกติ หรือหมวดหมู่งานซ่อมที่เพิ่มขึ้นอย่างมีนัยสำคัญ"
  ],
  "strategicRecommendations": [
    "ข้อเสนอแนะเชิงกลยุทธ์ที่ 1 (เช่น การปรับรอบ Preventive Maintenance)",
    "ข้อเสนอแนะเชิงกลยุทธ์ที่ 2 (เช่น การเจรจาต่อรองราคาอะไหล่กลุ่มหล่อลื่น/ช่วงล่าง)",
    "ข้อเสนอแนะเชิงกลยุทธ์ที่ 3 (เช่น การประเมินปลดระวางยานพาหนะที่มีค่า TCO สูง)"
  ],
  "fleetHealthScore": 88
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      res.json({ success: true, report: parsed });
    } catch (error: any) {
      console.error("Executive summary error:", error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || "ไม่สามารถสร้างรายงานผู้บริหารผ่าน AI ได้" 
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoCare Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
