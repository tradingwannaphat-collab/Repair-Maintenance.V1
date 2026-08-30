import React from "react";
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  AlertTriangle, 
  Compass, 
  Share2, 
  Copy,
  Check
} from "lucide-react";
import { BreakdownLocation } from "../types";

interface BreakdownLocationViewProps {
  location?: BreakdownLocation;
  ticketNumber?: string;
  licensePlate?: string;
  compact?: boolean;
}

export const BreakdownLocationView: React.FC<BreakdownLocationViewProps> = ({
  location,
  ticketNumber,
  licensePlate,
  compact = false
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!location || !location.isEmergencyBreakdown) {
    return null;
  }

  const lat = location.latitude ?? 13.5976;
  const lng = location.longitude ?? 100.7891;

  // Google Maps navigation & search URLs
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-rose-900">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>🚨 จุดรถเสียฉุกเฉิน: {location.roadName || "พิกัดนอกสถานที่"}</span>
          </div>
          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-900 underline font-semibold flex items-center gap-0.5 text-[11px]"
          >
            <span>นำทาง</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {location.landmark && (
          <p className="text-slate-700 text-[11px]"><strong className="text-slate-900">จุดสังเกต:</strong> {location.landmark}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-sm overflow-hidden space-y-3">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>🚨 แผนที่จุดเกิดเหตุรถเสียฉุกเฉิน (Emergency Breakdown Map)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                พร้อมพิกัด GPS นำทาง
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              ทะเบียน: <strong>{licensePlate || "-"}</strong> • ใบงาน: <strong>{ticketNumber || "-"}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyCoordinates}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors border border-white/20"
            title="คัดลอกละติจูด ลองจิจูด"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "คัดลอกแล้ว" : "คัดลอกพิกัด"}</span>
          </button>

          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white text-rose-900 hover:bg-rose-50 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-all transform active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            <span>🗺️ เปิดนำทาง Google Maps</span>
          </a>
        </div>
      </div>

      {/* Map Content & Details */}
      <div className="p-4 space-y-3">
        {/* Interactive OpenStreetMap frame */}
        <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 h-64">
          <iframe
            title="Emergency Map Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={osmEmbedUrl}
            className="w-full h-full"
          />

          {/* Floating Coordinate Pill */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span className="font-mono font-bold text-slate-800">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-md">
            OpenStreetMap Pinpoint
          </div>
        </div>

        {/* Location Breakdown Metadata Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold block">ถนน / สายทางหลวง</span>
            <span className="font-bold text-slate-900">{location.roadName || "-"}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold block">หลักกิโลเมตร</span>
            <span className="font-bold text-rose-700">{location.kilometerMarker || "-"}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 sm:col-span-2">
            <span className="text-[10px] text-slate-500 font-semibold block">จุดสังเกตเด่น (Landmark)</span>
            <span className="font-bold text-slate-900">{location.landmark || "-"}</span>
          </div>

          {location.address && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 sm:col-span-2 md:col-span-4">
              <span className="text-[10px] text-slate-500 font-semibold block">ที่อยู่ / พื้นที่รายละเอียด</span>
              <span className="text-slate-800 font-medium">{location.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
