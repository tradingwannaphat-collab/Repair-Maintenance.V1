import { 
  TireAlertSetting, 
  TireMaintenanceAlert, 
  VehicleRecord, 
  TireReplacementRecord, 
  TirePositionMeasurement 
} from "../types";
import { getVehicleTireMeasurements } from "./tireManagementData";

export const DEFAULT_TIRE_ALERT_SETTINGS: TireAlertSetting = {
  enableAutoAlert: true,
  criticalThresholdMm: 2.0, // ค่ามาตรฐานตามกฎหมายกรมการขนส่งทางบก: ห้ามต่ำกว่า 2.0 มม.
  warningThresholdMm: 3.5,  // ค่ามาตรฐานแนะนำการสลับยาง/เฝ้าระวัง: 2.0 - 3.5 มม.
  alertSoundEnabled: false,
  autoOpenBanner: true,
  lineNotifyEnabled: true,
  lastModified: new Date().toISOString()
};

const STORAGE_KEY = "tnb_tire_alert_settings_v1";

export function loadTireAlertSettings(): TireAlertSetting {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_TIRE_ALERT_SETTINGS,
        ...parsed,
        // Guarantee numbers
        criticalThresholdMm: Number(parsed.criticalThresholdMm) || DEFAULT_TIRE_ALERT_SETTINGS.criticalThresholdMm,
        warningThresholdMm: Number(parsed.warningThresholdMm) || DEFAULT_TIRE_ALERT_SETTINGS.warningThresholdMm,
      };
    }
  } catch (e) {
    console.error("Failed to load tire alert settings from storage", e);
  }
  return DEFAULT_TIRE_ALERT_SETTINGS;
}

export function saveTireAlertSettings(settings: TireAlertSetting): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...settings,
      lastModified: new Date().toISOString()
    }));
  } catch (e) {
    console.error("Failed to save tire alert settings to storage", e);
  }
}

// Calculate alerts across all vehicles in the fleet based on custom settings
export function calculateFleetTireAlerts(
  vehicles: VehicleRecord[],
  replacements: TireReplacementRecord[],
  settings: TireAlertSetting = DEFAULT_TIRE_ALERT_SETTINGS
): TireMaintenanceAlert[] {
  if (!settings.enableAutoAlert) return [];

  const alerts: TireMaintenanceAlert[] = [];
  const critThreshold = settings.criticalThresholdMm;
  const warnThreshold = settings.warningThresholdMm;

  vehicles.forEach((v) => {
    const measurements: TirePositionMeasurement[] = getVehicleTireMeasurements(v, replacements);

    measurements.forEach((m) => {
      const depth = Number(m.treadDepthMm) || 0;
      const isCriticalWear = m.wearCondition === "bulge" || m.wearCondition === "cut";
      const isWarningWear = m.wearCondition === "uneven_wear" || m.wearCondition === "cracks" || m.wearCondition === "nail_puncture";

      let alertLevel: "critical" | "warning" | null = null;
      let threshold = warnThreshold;

      if (depth < critThreshold || isCriticalWear) {
        alertLevel = "critical";
        threshold = critThreshold;
      } else if (depth <= warnThreshold || isWarningWear) {
        alertLevel = "warning";
        threshold = warnThreshold;
      }

      if (alertLevel) {
        // Formulate clear preventive risk and action
        let riskDescription = "";
        let recommendedAction = "";

        if (alertLevel === "critical") {
          if (isCriticalWear) {
            riskDescription = `ตรวจพบความเสียหายรุนแรง (${m.wearCondition === "bulge" ? "แก้มยางบวม โครงสร้างภายในฉีกขาด" : "ยางมีรอยบาดลึก"}) เสี่ยงยางระเบิดขณะทำความเร็วหรือบรรทุกหนัก`;
            recommendedAction = `ระงับการปล่อยรถวิ่งทันที! ถอดเปลี่ยนยางใหม่/ยางอะไหล่ทดแทนเร่งด่วน`;
          } else {
            riskDescription = `ความลึกร่องดอกยางเหลือเพียง ${depth} มม. ต่ำกว่ามาตรฐานความปลอดภัยขั้นวิกฤต (${critThreshold} มม.) สภาพรีดน้ำลื่นไถล เสี่ยงยางระเบิด และผิดกฎหมายขนส่งทางบก`;
            recommendedAction = `เปลี่ยนยางเส้นใหม่ทันทีก่อนรอบวิ่งถัดไป ห้ามปล่อยรถวิ่งทางไกล`;
          }
        } else {
          if (isWarningWear) {
            riskDescription = `ตรวจพบสภาพยางผิดปกติ (${m.wearCondition === "uneven_wear" ? "ยางกินข้าง" : m.wearCondition === "cracks" ? "แตกลายงา" : "มีรอยตำ"}) ดอกยาง ${depth} มม.`;
            recommendedAction = `ตรวจเช็คศูนย์ล้อ/ช่วงล่าง สลับตำแหน่งยาง หรือเตรียมเบิกยางเปลี่ยน`;
          } else {
            riskDescription = `ดอกยางเหลือ ${depth} มม. เข้าใกล้ระดับวิกฤต (เกณฑ์เฝ้าระวัง ${warnThreshold} มม.) การยึดเกาะถนนลดลงอย่างมีนัยสำคัญ`;
            recommendedAction = `วางแผนสลับยางคู่ หรือเปิดใบขอซื้อยางทดแทนล่วงหน้า เพื่อป้องกันการหยุดชะงักของงานขนส่ง`;
          }
        }

        // Match brand from replacement if available
        const rep = replacements.find(
          (r) => (r.vehicleId === v.id || r.licensePlate === v.licensePlate) && r.positionKey === m.positionKey
        );

        alerts.push({
          id: `alert-${v.id}-${m.positionKey}`,
          vehicleId: v.id,
          licensePlate: v.licensePlate,
          vehicleType: v.vehicleType,
          department: v.department,
          driverName: v.driverName,
          currentMileage: v.currentMileage,
          positionKey: m.positionKey,
          positionNameTh: m.positionNameTh,
          treadDepthMm: depth,
          pressurePsi: m.pressurePsi,
          thresholdMm: threshold,
          differenceMm: Number((depth - threshold).toFixed(1)),
          alertLevel,
          wearCondition: m.wearCondition,
          riskDescription,
          recommendedAction,
          tireBrand: rep?.tireBrand,
          tireSerial: rep?.tireSerial,
          detectedAt: new Date().toISOString()
        });
      }
    });
  });

  // Sort: Critical alerts first, then lowest tread depth
  return alerts.sort((a, b) => {
    if (a.alertLevel === "critical" && b.alertLevel !== "critical") return -1;
    if (a.alertLevel !== "critical" && b.alertLevel === "critical") return 1;
    return a.treadDepthMm - b.treadDepthMm;
  });
}

// Gentle Web Audio API synthesizer for alert feedback
export function playTireAlertSound(level: "critical" | "warning"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (level === "critical") {
      // Urgent two-beep warning
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(659, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Soft single warning chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  } catch (e) {
    // Fail silently if browser blocks audio
  }
}

// Generate formatted Maintenance Alert text for LINE Notify or Email
export function generateMaintenanceAlertText(
  alerts: TireMaintenanceAlert[],
  settings: TireAlertSetting
): string {
  const criticals = alerts.filter((a) => a.alertLevel === "critical");
  const warnings = alerts.filter((a) => a.alertLevel === "warning");
  const nowStr = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  let text = `🚨 [แจ้งเตือนอัตโนมัติ: ฝ่ายซ่อมบำรุง TNB FLEET]\n`;
  text += `📅 ตรวจพบเมื่อ: ${nowStr}\n`;
  text += `⚙️ เกณฑ์ความปลอดภัย: วิกฤต < ${settings.criticalThresholdMm} มม. | เฝ้าระวัง < ${settings.warningThresholdMm} มม.\n`;
  text += `------------------------------------\n`;
  text += `📊 สรุปภาพรวม:\n`;
  text += `• 🔴 ล้อวิกฤตต้องเปลี่ยนด่วน: ${criticals.length} เส้น (${[...new Set(criticals.map((c) => c.licensePlate))].length} คัน)\n`;
  text += `• 🟡 ล้อเฝ้าระวังเตรียมสลับ/จัดซื้อ: ${warnings.length} เส้น\n\n`;

  if (criticals.length > 0) {
    text += `🔴 [รายการวิกฤตห้ามวิ่งเด็ดขาด - เปลี่ยนทันที]:\n`;
    criticals.forEach((c, idx) => {
      text += `${idx + 1}. ทะเบียน ${c.licensePlate} (${c.positionNameTh})\n`;
      text += `   - ดอกยางเหลือ: ${c.treadDepthMm} มม. (ต่ำกว่าเกณฑ์ ${Math.abs(c.differenceMm)} มม.)\n`;
      text += `   - สภาพ: ${c.wearCondition !== "normal" ? c.wearCondition : "ดอกยางหมดเกลี้ยง"}\n`;
      text += `   - แผนก: ${c.department} | คนขับ: ${c.driverName || "ไม่ระบุ"}\n`;
      text += `   - การดำเนินการ: ${c.recommendedAction}\n\n`;
    });
  }

  if (warnings.length > 0) {
    text += `🟡 [รายการเฝ้าระวัง - เตรียมสลับยาง/สั่งซื้อ]:\n`;
    warnings.slice(0, 5).forEach((w, idx) => {
      text += `${idx + 1}. ทะเบียน ${w.licensePlate} (${w.positionNameTh}) ดอกยาง ${w.treadDepthMm} มม.\n`;
    });
    if (warnings.length > 5) {
      text += `   ...และอีก ${warnings.length - 5} รายการ\n`;
    }
    text += `\n`;
  }

  text += `------------------------------------\n`;
  text += `⚠️ มาตรการความปลอดภัย ISO 39001:\n`;
  text += `กรุณาเปิดใบสั่งซ่อมบำรุงและเบิกยางใหม่ทันทีก่อนจ่ายงานวิ่งระยะไกล`;

  return text;
}
