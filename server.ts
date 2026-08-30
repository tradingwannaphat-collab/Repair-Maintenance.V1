import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 vehicle images
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
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
