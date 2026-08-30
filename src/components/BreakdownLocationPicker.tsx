import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  AlertTriangle, 
  ExternalLink, 
  Check, 
  Crosshair, 
  Map as MapIcon,
  Layers,
  Info
} from "lucide-react";
import { BreakdownLocation } from "../types";

interface BreakdownLocationPickerProps {
  location: BreakdownLocation;
  onChange: (location: BreakdownLocation) => void;
}

// Preset popular transport hubs and breakdown hotspots for logistics fleet
const LOGISTICS_PRESETS = [
  {
    name: "ถนนบางนา-ตราด (ทล.34) กม.23 ขาออก",
    road: "ถนนบางนา-ตราด",
    km: "23+500",
    lat: 13.5976,
    lng: 100.7891,
    landmark: "ตรงข้ามทางเข้าโรงงานนิคมบางพลี",
    address: "ต.บางเสาธง อ.บางเสาธง จ.สมุทรปราการ"
  },
  {
    name: "มอเตอร์เวย์ สาย 7 (กทม.-ชลบุรี) กม.39",
    road: "ทางหลวงพิเศษหมายเลข 7",
    km: "39+000",
    lat: 13.5823,
    lng: 100.9123,
    landmark: "ก่อนถึงจุดพักรถมอเตอร์เวย์ 2 กม.",
    address: "อ.บางปะกง จ.ฉะเชิงเทรา"
  },
  {
    name: "ถนนพระราม 2 (ทล.35) สมุทรสาคร กม.38",
    road: "ถนนพระราม 2",
    km: "38+200",
    lat: 13.5182,
    lng: 100.2456,
    landmark: "ใกล้สะพานข้ามแม่น้ำท่าจีน ขาออก",
    address: "ต.ท่าจีน อ.เมืองสมุทรสาคร จ.สมุทรสาคร"
  },
  {
    name: "ถนนมิตรภาพ (ทล.2) สระบุรี-ปากช่อง กม.82",
    road: "ถนนมิตรภาพ",
    km: "82+000",
    lat: 14.6542,
    lng: 101.3211,
    landmark: "ช่วงขึ้นเนินเขาคลองไผ่",
    address: "อ.ปากช่อง จ.นครราชสีมา"
  },
  {
    name: "คลังสินค้าหลัก TNB Logistics Hub บางพลี",
    road: "ถนนกิ่งแก้ว",
    km: "12+000",
    lat: 13.6045,
    lng: 100.7012,
    landmark: "หน้าศูนย์จ่ายสินค้า TNB ประตู 3",
    address: "อ.บางพลี จ.สมุทรปราการ"
  },
  {
    name: "ท่าเรือแหลมฉบัง ตู้คอนเทนเนอร์ Gate 2",
    road: "ถนนสุขุมวิท (ทล.3)",
    km: "128+000",
    lat: 13.0827,
    lng: 100.8845,
    landmark: "หน้าด่านชั่งน้ำหนักแหลมฉบัง",
    address: "ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี"
  }
];

export const BreakdownLocationPicker: React.FC<BreakdownLocationPickerProps> = ({
  location,
  onChange
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapType, setMapType] = useState<"road" | "satellite">("road");

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("เบราว์เซอร์นี้ไม่รองรับการดึงพิกัด Geolocation");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        
        onChange({
          ...location,
          isEmergencyBreakdown: true,
          latitude: lat,
          longitude: lng,
          landmark: location.landmark || "พิกัดปัจจุบันจากอุปกรณ์คนขับ",
          address: location.address || `พิกัด GPS: ${lat}, ${lng}`,
          pinLabel: "ตำแหน่งปัจจุบันของคุณ (GPS Live)"
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("กรุณากดอนุญาตการเข้าถึงตำแหน่ง GPS บนเบราว์เซอร์");
        } else {
          setGpsError("ไม่สามารถรับสัญญาณพิกัด GPS ได้ กรุณาเลือกจุดบนแผนที่หรือเลือกจากรายการเส้นทาง");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectPreset = (preset: typeof LOGISTICS_PRESETS[0]) => {
    onChange({
      ...location,
      isEmergencyBreakdown: true,
      latitude: preset.lat,
      longitude: preset.lng,
      roadName: preset.road,
      kilometerMarker: preset.km,
      landmark: preset.landmark,
      address: preset.address,
      pinLabel: preset.name
    });
  };

  const currentLat = location.latitude ?? 13.5976;
  const currentLng = location.longitude ?? 100.7891;

  // OpenStreetMap embed URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.015}%2C${currentLat - 0.01}%2C${currentLng + 0.015}%2C${currentLat + 0.01}&layer=mapnik&marker=${currentLat}%2C${currentLng}`;

  return (
    <div className="space-y-4">
      {/* Emergency Toggle Header */}
      <div className={`p-4 rounded-xl border transition-all ${
        location.isEmergencyBreakdown 
          ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20" 
          : "bg-slate-50 border-slate-200"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
              location.isEmergencyBreakdown 
                ? "bg-rose-600 text-white shadow-sm animate-pulse" 
                : "bg-slate-200 text-slate-600"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">
                  🚨 รถเสียฉุกเฉินนอกสถานที่ / บนเส้นทางขนส่ง (Roadside Emergency)
                </span>
                {location.isEmergencyBreakdown && (
                  <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    เปิดโหมดเร่งด่วน
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เปิดเพื่อปักหมุดพิกัด GPS แผนที่จุดเกิดเหตุ ให้ช่างซ่อมบำรุงและรถช่วยเหลือเดินทางไปยังจุดหมายได้แม่นยำ
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox"
              id="toggle-emergency-breakdown"
              checked={location.isEmergencyBreakdown}
              onChange={(e) => onChange({ ...location, isEmergencyBreakdown: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      </div>

      {location.isEmergencyBreakdown && (
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-rose-200 shadow-sm animate-fadeIn">
          {/* Quick Actions Bar: GPS Auto-Detect */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>พิกัดจุดเกิดเหตุบนแผนที่ (GPS Coordinates)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="btn-detect-my-gps"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? "กำลังค้นหาพิกัด GPS..." : "📍 ดึงพิกัด GPS ของฉันตอนนี้"}</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดใน Google Maps</span>
              </a>
            </div>
          </div>

          {gpsError && (
            <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Preset Location Chips for fast selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>หรือเลือกจุดพิกัดเส้นทางขนส่งหลัก TNB ที่พบบ่อย:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {LOGISTICS_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                    location.latitude === preset.lat && location.longitude === preset.lng
                      ? "bg-blue-50 border-blue-400 font-bold text-blue-900 ring-1 ring-blue-500"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="font-semibold truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.landmark}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Visual Map Preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 h-56">
            <iframe
              title="Breakdown Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={osmEmbedUrl}
              className="w-full h-full"
            />

            {/* Map Overlay Badge */}
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-bold text-slate-900">
                ละติจูด: {currentLat.toFixed(5)}, ลองจิจูด: {currentLng.toFixed(5)}
              </span>
            </div>

            <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-md">
              © OpenStreetMap Contributors
            </div>
          </div>

          {/* Location Detail Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                ถนน / สายทางหลวง / พื้นที่
              </label>
              <input
                type="text"
                id="input-road-name"
                value={location.roadName || ""}
                onChange={(e) => onChange({ ...location, roadName: e.target.value })}
                placeholder="เช่น ถนนบางนา-ตราด, มอเตอร์เวย์ สาย 7, ทล.35"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                หลักกิโลเมตรที่ (ถ้าทราบ)
              </label>
              <input
                type="text"
                id="input-km-marker"
                value={location.kilometerMarker || ""}
                onChange={(e) => onChange({ ...location, kilometerMarker: e.target.value })}
                placeholder="เช่น กม. 23+500 (ขาออกชลบุรี)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                จุดสังเกตเด่นใกล้เคียง (Landmark)
              </label>
              <input
                type="text"
                id="input-landmark"
                value={location.landmark || ""}
                onChange={(e) => onChange({ ...location, landmark: e.target.value })}
                placeholder="เช่น หน้าปั๊ม ปตท., ก่อนถึงสะพานลอยคนข้าม 100 เมตร, หน้านิคมฯ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                ที่อยู่ / ตำบล อำเภอ จังหวัด
              </label>
              <input
                type="text"
                id="input-address-detail"
                value={location.address || ""}
                onChange={(e) => onChange({ ...location, address: e.target.value })}
                placeholder="เช่น ต.บางเสาธง อ.บางเสาธง จ.สมุทรปราการ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
