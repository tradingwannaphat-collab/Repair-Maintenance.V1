import React from "react";

interface KochLogoProps {
  className?: string;
  variant?: "red" | "white" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

export const KochLogo: React.FC<KochLogoProps> = ({
  className = "",
  variant = "red",
  size = "md",
  showSubtitle = true,
}) => {
  const textColor =
    variant === "white" ? "#FFFFFF" : variant === "dark" ? "#0F172A" : "#111827";

  const boxRed = "#E60012"; // Vibrant Koch packaging red
  const boxShadowRed = "#CC0010"; // Deeper red for 3D depth

  const heightMap = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Koch SVG Icon & Wordmark */}
      <svg
        viewBox="0 0 520 260"
        className={`${heightMap[size]} w-auto transition-all`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3D Open Packaging Box (Red) */}
        <g transform="translate(0, 0)">
          {/* Box Bottom Left Face */}
          <polygon
            points="160,135 275,190 275,130 160,82"
            fill={boxShadowRed}
          />
          {/* Box Bottom Right Face */}
          <polygon
            points="275,190 345,120 345,70 275,130"
            fill={boxRed}
          />
          {/* Left Flap */}
          <polygon
            points="125,108 220,135 245,105 160,82"
            fill="#FFFFFF"
            stroke={boxRed}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Top Left Flap */}
          <polygon
            points="145,50 240,20 265,55 178,82"
            fill="#FFFFFF"
            stroke={boxRed}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Top Right Flap */}
          <polygon
            points="275,12 365,45 342,75 255,48"
            fill="#FFFFFF"
            stroke={boxRed}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Right Flap */}
          <polygon
            points="345,70 385,85 348,135 312,115"
            fill="#FFFFFF"
            stroke={boxRed}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Inner Cavity Floor */}
          <polygon
            points="180,82 255,50 338,72 270,125"
            fill={boxRed}
          />
          {/* Inner Cavity White Rim / Void */}
          <polygon
            points="205,82 258,60 315,74 268,110"
            fill="#FFFFFF"
          />
          {/* Inner Cavity Deep Floor */}
          <polygon
            points="225,84 260,70 298,78 268,98"
            fill={boxShadowRed}
          />
        </g>

        {/* KOCH Bold Typography */}
        <g fill={textColor} style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontWeight: 900 }}>
          {/* K */}
          <path d="M 135 208 L 158 208 L 158 228 L 180 208 L 208 208 L 175 233 L 210 258 L 180 258 L 158 238 L 158 258 L 135 258 Z" />
          {/* O */}
          <path d="M 220 208 L 265 208 C 275 208 280 215 280 233 C 280 251 275 258 265 258 L 220 258 C 210 258 205 251 205 233 C 205 215 210 208 220 208 Z M 228 224 L 228 242 L 257 242 L 257 224 Z" />
          {/* C */}
          <path d="M 330 220 L 315 220 C 310 220 305 222 305 233 C 305 244 310 246 315 246 L 330 246 L 330 258 L 315 258 C 295 258 285 248 285 233 C 285 218 295 208 315 208 L 330 208 Z" />
          {/* H */}
          <path d="M 345 208 L 368 208 L 368 226 L 387 226 L 387 208 L 410 208 L 410 258 L 387 258 L 387 238 L 368 238 L 368 258 L 345 258 Z" />
        </g>
      </svg>

      {showSubtitle && (
        <div className="flex flex-col border-l border-slate-700/60 pl-2">
          <span className={`text-[11px] font-black tracking-wider uppercase ${variant === "white" ? "text-red-400" : "text-rose-600"}`}>
            PACKAGING
          </span>
          <span className="text-[9px] font-medium text-slate-400 leading-tight">
            LINE: @kochpackaging
          </span>
        </div>
      )}
    </div>
  );
};
