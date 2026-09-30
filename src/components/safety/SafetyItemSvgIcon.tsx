import React from "react";

interface SafetyItemSvgIconProps {
  itemCode: string;
  className?: string;
  size?: number | string;
  imageUrl?: string;
}

export const SafetyItemSvgIcon: React.FC<SafetyItemSvgIconProps> = ({
  itemCode,
  className = "w-16 h-16",
  size,
  imageUrl
}) => {
  const style = size ? { width: size, height: size } : undefined;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={itemCode}
        className={`${className} object-contain rounded-md`}
        style={style}
      />
    );
  }

  switch (itemCode) {
    case "SEC-01": // ที่หนุนล้อ (Wheel Chock)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wheel / Tire */}
          <circle cx="48" cy="46" r="38" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
          <circle cx="48" cy="46" r="30" fill="#334155" />
          {/* Rim */}
          <circle cx="48" cy="46" r="22" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="48" cy="46" r="10" fill="#64748B" />
          <circle cx="48" cy="46" r="4" fill="#0F172A" />
          {/* Lug nuts */}
          <circle cx="48" cy="32" r="2" fill="#0F172A" />
          <circle cx="48" cy="60" r="2" fill="#0F172A" />
          <circle cx="34" cy="46" r="2" fill="#0F172A" />
          <circle cx="62" cy="46" r="2" fill="#0F172A" />
          <circle cx="38" cy="36" r="2" fill="#0F172A" />
          <circle cx="58" cy="36" r="2" fill="#0F172A" />
          <circle cx="38" cy="56" r="2" fill="#0F172A" />
          <circle cx="58" cy="56" r="2" fill="#0F172A" />
          {/* Orange/Red Wheel Chock Wedge */}
          <path
            d="M8 88 L46 88 L34 68 Q24 74 8 88 Z"
            fill="#EF4444"
            stroke="#B91C1C"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M14 84 L40 84" stroke="#FEE2E2" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 78 L34 78" stroke="#FEE2E2" strokeWidth="1.5" strokeLinecap="round" />
          {/* Rear Chock Wedge */}
          <path
            d="M92 88 L54 88 L66 68 Q76 74 92 88 Z"
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M60 84 L86 84" stroke="#FEE2E2" strokeWidth="1.5" strokeLinecap="round" />
          {/* Ground Line */}
          <line x1="2" y1="88" x2="98" y2="88" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "SEC-02": // กรวยจราจร (Traffic Cone)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M16 88 L84 88 L80 80 L20 80 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
          <rect x="12" y="86" width="76" height="6" rx="2" fill="#C2410C" />
          {/* Cone Body Orange */}
          <path d="M22 80 L44 14 Q50 6 56 14 L78 80 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
          {/* Reflective Stripe 1 (Lower) */}
          <path d="M29 64 L35 48 L65 48 L71 64 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          {/* Reflective Stripe 2 (Upper) */}
          <path d="M38 40 L42 28 L58 28 L62 40 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Cone Top Highlight */}
          <ellipse cx="50" cy="14" rx="6" ry="2" fill="#FB923C" />
        </svg>
      );

    case "SEC-03": // ถังดับเพลิง (Fire Extinguisher)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tank Body */}
          <rect x="36" y="32" width="30" height="54" rx="8" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
          <rect x="39" y="36" width="6" height="46" rx="3" fill="#EF4444" opacity="0.6" />
          {/* Label on tank */}
          <rect x="42" y="44" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="45" y="48" width="12" height="3" fill="#DC2626" rx="1" />
          <rect x="45" y="54" width="12" height="2" fill="#1E293B" rx="0.5" />
          <rect x="45" y="58" width="8" height="2" fill="#1E293B" rx="0.5" />
          {/* Base */}
          <rect x="34" y="84" width="34" height="6" rx="3" fill="#1E293B" />
          {/* Valve / Neck */}
          <rect x="48" y="24" width="6" height="8" fill="#64748B" />
          <path d="M46 22 L56 22 L54 18 L48 18 Z" fill="#475569" />
          {/* Handle */}
          <path d="M42 20 L58 14 L50 24 Z" fill="#1E293B" />
          <path d="M40 16 L56 12" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          {/* Pressure Gauge */}
          <circle cx="44" cy="22" r="4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="44" cy="22" r="1.5" fill="#16A34A" />
          {/* Hose */}
          <path
            d="M54 22 C64 22, 68 32, 68 45 C68 58, 66 70, 68 76"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Nozzle */}
          <rect x="66" y="74" width="4" height="10" rx="1" fill="#334155" />
        </svg>
      );

    case "SEC-04": // สายรัดสินค้า (Cargo Ratchet Strap)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Coiled Orange Strap */}
          <ellipse cx="40" cy="58" rx="26" ry="18" fill="#F97316" stroke="#EA580C" strokeWidth="2.5" />
          <ellipse cx="40" cy="58" rx="18" ry="12" fill="#FB923C" stroke="#EA580C" strokeWidth="1.5" />
          <ellipse cx="40" cy="58" rx="10" ry="6" fill="#FED7AA" />
          {/* Strap Texture Lines */}
          <path d="M22 58 Q40 50 58 58" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Metal Ratchet Tensioner Mechanism */}
          <g transform="translate(48, 20)">
            <rect x="0" y="8" width="34" height="24" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
            {/* Gear teeth */}
            <circle cx="16" cy="20" r="8" fill="#CBD5E1" stroke="#334155" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="16" cy="20" r="3" fill="#1E293B" />
            {/* Lever Handle */}
            <path d="M16 20 L38 6 L42 12 L20 26 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <rect x="36" y="4" width="8" height="10" rx="2" fill="#D97706" />
            {/* Metal J-Hook */}
            <path
              d="M34 26 C38 30, 42 38, 38 44 C34 48, 28 44, 28 40"
              stroke="#475569"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          {/* Extended Strap End */}
          <path d="M16 66 L6 74 C2 78, 6 86, 12 84 L28 72 Z" fill="#EA580C" />
          {/* Metal Hook on strap end */}
          <path d="M8 82 C4 88, 12 94, 18 90" stroke="#64748B" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case "SEC-05": // ไฟฉายสปอร์ตไลท์ (Spotlight Flashlight)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Spotlight Head Bezel */}
          <rect x="10" y="30" width="16" height="42" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* Lens */}
          <ellipse cx="12" cy="51" rx="4" ry="18" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" opacity="0.8" />
          <ellipse cx="12" cy="51" rx="2" ry="10" fill="#BAE6FD" />
          {/* Spotlight Main Body Orange/Yellow */}
          <path
            d="M26 34 L72 38 C78 38, 82 42, 82 48 L82 56 C82 62, 78 66, 72 66 L26 68 Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="2.5"
          />
          {/* Ribs / Grip lines on body */}
          <line x1="42" y1="40" x2="42" y2="64" stroke="#D97706" strokeWidth="2" />
          <line x1="52" y1="41" x2="52" y2="63" stroke="#D97706" strokeWidth="2" />
          <line x1="62" y1="42" x2="62" y2="62" stroke="#D97706" strokeWidth="2" />
          {/* Top Handle */}
          <path
            d="M32 34 L32 18 C32 14, 40 14, 48 14 L64 14 C72 14, 76 18, 76 22 L76 38"
            stroke="#1E293B"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="42" y="11" width="24" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          {/* Stand / Foot */}
          <rect x="36" y="68" width="14" height="6" rx="2" fill="#1E293B" />
          <rect x="64" y="66" width="14" height="6" rx="2" fill="#1E293B" />
          {/* Power Switch */}
          <rect x="36" y="28" width="8" height="4" rx="1" fill="#DC2626" />
        </svg>
      );

    case "SEC-06": // กุญแจล็อกตู้ (Cabinet / Container Padlock)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Padlock Brass Body */}
          <rect x="18" y="44" width="46" height="44" rx="6" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          <rect x="22" y="48" width="8" height="36" rx="2" fill="#FDE68A" opacity="0.5" />
          {/* Shackle (Metal Loop) */}
          <path
            d="M28 44 L28 26 C28 14, 54 14, 54 26 L54 44"
            stroke="#64748B"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30 44 L30 26 C30 16, 52 16, 52 26 L52 44"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Keyhole */}
          <circle cx="41" cy="62" r="4.5" fill="#1E293B" />
          <polygon points="38.5,62 43.5,62 42.5,74 39.5,74" fill="#1E293B" />
          {/* Master Logo engraving */}
          <text x="41" y="82" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#92400E" fontFamily="sans-serif">
            TNB LOCK
          </text>
          {/* Brass Keys */}
          <g transform="translate(62, 38)">
            {/* Key Ring */}
            <circle cx="16" cy="16" r="10" fill="none" stroke="#D97706" strokeWidth="2" />
            {/* Key 1 */}
            <circle cx="12" cy="14" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="12" cy="14" r="2" fill="#FFFBEB" />
            <rect x="15" y="12" width="16" height="4" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <rect x="25" y="16" width="3" height="4" fill="#FBBF24" />
            <rect x="29" y="16" width="2" height="3" fill="#FBBF24" />
            {/* Key 2 */}
            <g transform="rotate(30 16 16)">
              <circle cx="12" cy="14" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="12" cy="14" r="2" fill="#FFFBEB" />
              <rect x="15" y="12" width="16" height="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              <rect x="24" y="16" width="3" height="4" fill="#F59E0B" />
              <rect x="28" y="16" width="3" height="2" fill="#F59E0B" />
            </g>
          </g>
        </svg>
      );

    case "SEC-07": // ผ้าใบคลุมสินค้า (Tarpaulin with rope)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Folded Dark Green Tarpaulin */}
          <path
            d="M10 24 L74 12 L92 34 L28 46 Z"
            fill="#15803D"
            stroke="#14532D"
            strokeWidth="2"
          />
          <path
            d="M10 24 L28 46 L28 62 L10 40 Z"
            fill="#166534"
            stroke="#14532D"
            strokeWidth="2"
          />
          <path
            d="M28 46 L92 34 L92 50 L28 62 Z"
            fill="#14532D"
            stroke="#052E16"
            strokeWidth="2"
          />
          {/* Tarpaulin Texture & Seams */}
          <line x1="40" y1="28" x2="60" y2="40" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="58" y1="20" x2="78" y2="32" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 2" />
          {/* Brass Eyelets / Grommets */}
          <circle cx="16" cy="28" r="2" fill="#FDE047" stroke="#854D0E" strokeWidth="1" />
          <circle cx="70" cy="18" r="2" fill="#FDE047" stroke="#854D0E" strokeWidth="1" />
          <circle cx="86" cy="38" r="2" fill="#FDE047" stroke="#854D0E" strokeWidth="1" />
          <circle cx="32" cy="56" r="2" fill="#FDE047" stroke="#854D0E" strokeWidth="1" />
          {/* Bundled Manila / Nylon Rope */}
          <g transform="translate(18, 54)">
            <ellipse cx="28" cy="24" rx="20" ry="12" fill="#334155" stroke="#1E293B" strokeWidth="2" />
            <path
              d="M14 20 C18 14, 38 14, 42 20 C46 26, 38 32, 28 32 C18 32, 12 24, 16 18"
              stroke="#64748B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M20 22 C24 18, 34 18, 38 22 C40 26, 34 30, 26 28"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Free rope end */}
            <path
              d="M42 22 Q54 28 50 40 Q46 44 40 40"
              stroke="#475569"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      );

    case "SEC-08": // เสื้อสะท้อนแสง (Reflective Safety Vest)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Neon Lime Vest Body */}
          <path
            d="M32 14 L20 32 L30 38 L30 84 L70 84 L70 38 L80 32 L68 14 L56 26 L44 26 Z"
            fill="#84CC16"
            stroke="#4D7C0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Black trim borders */}
          <path d="M44 26 L56 26 L50 44 Z" fill="#1E293B" />
          <line x1="50" y1="44" x2="50" y2="84" stroke="#1E293B" strokeWidth="2" />
          {/* Armhole black trim */}
          <path d="M20 32 L30 38" stroke="#1E293B" strokeWidth="3" />
          <path d="M80 32 L70 38" stroke="#1E293B" strokeWidth="3" />
          {/* Silver Reflective Stripes Vertical (Shoulders to Waist) */}
          <path d="M34 20 L34 84" stroke="#F1F5F9" strokeWidth="5" />
          <path d="M34 20 L34 84" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M66 20 L66 84" stroke="#F1F5F9" strokeWidth="5" />
          <path d="M66 20 L66 84" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
          {/* Silver Reflective Stripes Horizontal (Waist) */}
          <path d="M30 64 L70 64" stroke="#F8FAFC" strokeWidth="6" />
          <path d="M30 74 L70 74" stroke="#F8FAFC" strokeWidth="6" />
          {/* Front closure Velcro badge */}
          <rect x="47" y="52" width="6" height="10" rx="1" fill="#1E293B" />
        </svg>
      );

    case "SEC-09": // หมวกนิรภัย (Safety Helmet)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Helmet Yellow Dome */}
          <path
            d="M18 56 C18 28, 82 28, 82 56 Z"
            fill="#EAB308"
            stroke="#CA8A04"
            strokeWidth="2.5"
          />
          {/* Crown Ridge (Reinforcement spine) */}
          <path
            d="M46 29 C46 22, 54 22, 54 29 L54 54 L46 54 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="1.5"
          />
          {/* Front & Side Brim */}
          <path
            d="M12 56 L88 56 C92 56, 94 62, 88 64 L12 64 C6 62, 8 56, 12 56 Z"
            fill="#CA8A04"
            stroke="#A16207"
            strokeWidth="2"
          />
          {/* Blue TNB Safety Band with Logo */}
          <rect x="24" y="48" width="52" height="7" rx="1" fill="#1D4ED8" />
          <text x="50" y="53.5" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif">
            TNB SAFETY
          </text>
          {/* Chin Strap (สายรัดคาง) */}
          <path
            d="M26 62 C26 78, 48 88, 50 88 C52 88, 74 78, 74 62"
            stroke="#475569"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="46" y="84" width="8" height="4" rx="1" fill="#1E293B" />
        </svg>
      );

    case "SEC-10": // รองเท้านิรภัย (Safety Shoes)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Boot */}
          <g transform="translate(-2, 0)">
            {/* Upper Black Leather */}
            <path
              d="M24 38 L24 64 L10 74 C8 76, 10 82, 16 82 L46 82 C50 82, 52 76, 50 70 L42 62 L38 38 Z"
              fill="#1E293B"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Steel Toe Cap highlight */}
            <path d="M10 74 C8 76, 10 82, 16 82 L26 82 C28 76, 22 72, 16 72 Z" fill="#334155" />
            <path d="M12 75 C10 77, 12 80, 16 80" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Laces */}
            <line x1="30" y1="46" x2="36" y2="48" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="52" x2="36" y2="54" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="58" x2="38" y2="60" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" />
            {/* Rugged Sole with Cleats */}
            <rect x="8" y="82" width="42" height="6" rx="2" fill="#0F172A" />
            <line x1="14" y1="88" x2="14" y2="84" stroke="#334155" strokeWidth="2" />
            <line x1="22" y1="88" x2="22" y2="84" stroke="#334155" strokeWidth="2" />
            <line x1="30" y1="88" x2="30" y2="84" stroke="#334155" strokeWidth="2" />
            <line x1="38" y1="88" x2="38" y2="84" stroke="#334155" strokeWidth="2" />
          </g>
          {/* Right Boot (Slightly behind / shifted) */}
          <g transform="translate(38, -6)">
            <path
              d="M24 38 L24 64 L10 74 C8 76, 10 82, 16 82 L46 82 C50 82, 52 76, 50 70 L42 62 L38 38 Z"
              fill="#0F172A"
              stroke="#020617"
              strokeWidth="2"
            />
            {/* Steel Toe Cap highlight */}
            <path d="M10 74 C8 76, 10 82, 16 82 L26 82 C28 76, 22 72, 16 72 Z" fill="#1E293B" />
            {/* Laces */}
            <line x1="30" y1="46" x2="36" y2="48" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="52" x2="36" y2="54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="58" x2="38" y2="60" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sole */}
            <rect x="8" y="82" width="42" height="6" rx="2" fill="#020617" />
          </g>
        </svg>
      );

    case "SEC-11": // กล่องปฐมพยาบาล (First Aid Kit)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle */}
          <path d="M38 22 C38 16, 62 16, 62 22 L62 26 L38 26 Z" fill="#E2E8F0" stroke="#0F766E" strokeWidth="3" />
          {/* Box Body */}
          <rect x="14" y="26" width="72" height="58" rx="8" fill="#10B981" stroke="#047857" strokeWidth="4" />
          {/* Latches */}
          <rect x="26" y="24" width="8" height="6" rx="1.5" fill="#F1F5F9" stroke="#047857" strokeWidth="1.5" />
          <rect x="66" y="24" width="8" height="6" rx="1.5" fill="#F1F5F9" stroke="#047857" strokeWidth="1.5" />
          {/* White Cross Circle */}
          <circle cx="50" cy="55" r="20" fill="#FFFFFF" />
          {/* Green Cross */}
          <rect x="45" y="41" width="10" height="28" rx="2" fill="#10B981" />
          <rect x="36" y="50" width="28" height="10" rx="2" fill="#10B981" />
        </svg>
      );

    case "SEC-12": // เสื้อกั๊กสะท้อนแสง (Safety Vest)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vest Shape */}
          <path
            d="M32 14 L42 28 L50 28 L58 28 L68 14 L82 24 L76 86 L24 86 L18 24 Z"
            fill="#EAB308"
            stroke="#CA8A04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Neck cut */}
          <path d="M40 14 Q50 36 60 14" fill="#F8FAFC" stroke="#CA8A04" strokeWidth="2.5" />
          {/* Front Opening line */}
          <line x1="50" y1="36" x2="50" y2="86" stroke="#A16207" strokeWidth="2.5" />
          {/* Silver Reflective stripes */}
          <path d="M22 48 L78 48" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" />
          <path d="M22 48 L78 48" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M24 66 L76 66" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" />
          <path d="M24 66 L76 66" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          {/* Vertical shoulder reflective stripes */}
          <path d="M36 28 L36 48" stroke="#F1F5F9" strokeWidth="4" />
          <path d="M64 28 L64 48" stroke="#F1F5F9" strokeWidth="4" />
        </svg>
      );

    case "SEC-13": // หมวกนิรภัย (Hard Hat / Safety Helmet)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dome */}
          <path
            d="M16 62 C16 34, 30 22, 50 22 C70 22, 84 34, 84 62 Z"
            fill="#FACC15"
            stroke="#EAB308"
            strokeWidth="4"
          />
          {/* Center Crown Ridge */}
          <path d="M47 22 L47 58 C47 60, 53 60, 53 58 L53 22 Z" fill="#EAB308" />
          {/* Brim */}
          <path
            d="M8 64 Q50 68 92 64 C94 64, 94 70, 88 72 Q50 78 12 72 C6 70, 6 64, 8 64 Z"
            fill="#CA8A04"
            stroke="#A16207"
            strokeWidth="2.5"
          />
          {/* Chin strap hint */}
          <path d="M30 68 Q50 88 70 68" stroke="#475569" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
        </svg>
      );

    case "SEC-14": // ผ้าห่มกันไฟ (Fire Blanket)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wall mounted red container */}
          <rect x="26" y="16" width="48" height="64" rx="4" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          {/* White label box */}
          <rect x="32" y="24" width="36" height="26" rx="2" fill="#FFFFFF" />
          <text x="50" y="34" textAnchor="middle" fill="#DC2626" fontSize="7" fontWeight="bold">FIRE</text>
          <text x="50" y="44" textAnchor="middle" fill="#DC2626" fontSize="6.5" fontWeight="bold">BLANKET</text>
          {/* Pull Straps */}
          <rect x="36" y="78" width="8" height="14" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="56" y="78" width="8" height="14" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        </svg>
      );

    case "SEC-15": // แว่นตานิรภัย (Safety Glasses)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Lens Frame */}
          <rect x="14" y="38" width="32" height="26" rx="8" fill="#38BDF8" fillOpacity="0.4" stroke="#0284C7" strokeWidth="3" />
          {/* Right Lens Frame */}
          <rect x="54" y="38" width="32" height="26" rx="8" fill="#38BDF8" fillOpacity="0.4" stroke="#0284C7" strokeWidth="3" />
          {/* Bridge */}
          <path d="M46 44 Q50 40 54 44" stroke="#0284C7" strokeWidth="3.5" fill="none" />
          {/* Temple arms */}
          <path d="M14 42 L6 36" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M86 42 L94 36" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
          {/* Glare highlights */}
          <path d="M20 44 L38 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 44 L78 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "SEC-16": // ค้อนทุบกระจก & มีดตัดเบลท์ (Emergency Hammer)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Red/Orange Handle */}
          <path d="M44 32 L44 84 C44 88, 56 88, 56 84 L56 32 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="3" />
          {/* Grip grooves */}
          <line x1="46" y1="52" x2="54" y2="52" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
          <line x1="46" y1="60" x2="54" y2="60" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
          <line x1="46" y1="68" x2="54" y2="68" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
          {/* Hammer Head */}
          <rect x="28" y="20" width="44" height="14" rx="3" fill="#EA580C" stroke="#C2410C" strokeWidth="2.5" />
          {/* Steel Points */}
          <polygon points="28,22 16,27 28,32" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <polygon points="72,22 84,27 72,32" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case "SEC-17": // กล่องเครื่องมือช่าง (Tool Box)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle */}
          <path d="M38 24 C38 18, 62 18, 62 24 L62 28 L38 28 Z" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
          {/* Lid */}
          <polygon points="12,38 88,38 82,28 18,28" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          {/* Main Box */}
          <rect x="14" y="38" width="72" height="46" rx="4" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="3" />
          {/* Front Clasp/Lock */}
          <rect x="45" y="36" width="10" height="12" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
          {/* Bottom Accent */}
          <line x1="18" y1="76" x2="82" y2="76" stroke="#7F1D1D" strokeWidth="3" />
        </svg>
      );

    case "SEC-18": // เกจวัดลมยาง (Tyre Pressure Gauge)
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular dial */}
          <circle cx="50" cy="42" r="28" fill="#F8FAFC" stroke="#0F172A" strokeWidth="4" />
          <circle cx="50" cy="42" r="23" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Dial ticks */}
          <line x1="50" y1="22" x2="50" y2="27" stroke="#DC2626" strokeWidth="2" />
          <line x1="68" y1="36" x2="64" y2="38" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="32" y1="36" x2="36" y2="38" stroke="#0F172A" strokeWidth="1.5" />
          {/* Pointer needle */}
          <line x1="50" y1="42" x2="60" y2="28" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="42" r="3.5" fill="#0F172A" />
          {/* Brass connector pipe */}
          <rect x="46" y="70" width="8" height="18" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <rect x="44" y="84" width="12" height="6" rx="1" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Badge */}
          <path
            d="M50 14 L82 24 C82 56, 68 76, 50 86 C32 76, 18 56, 18 24 Z"
            fill="#F0FDF4"
            stroke="#16A34A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner circle */}
          <circle cx="50" cy="46" r="18" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2" />
          {/* Safety Checkmark */}
          <path d="M42 46 L47 51 L58 40" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Code text badge */}
          <rect x="26" y="68" width="48" height="14" rx="4" fill="#0F172A" />
          <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">
            {itemCode || "SFT"}
          </text>
        </svg>
      );
  }
};
