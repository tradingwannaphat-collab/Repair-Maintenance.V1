import React from "react";

interface TnbLogoProps {
  className?: string;
  variant?: "light" | "dark" | "blue" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

export const TnbLogo: React.FC<TnbLogoProps> = ({
  className = "",
  variant = "blue",
  size = "md",
  showSubtitle = true,
}) => {
  // Determine color palette
  const mainColor =
    variant === "white" || variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#0F172A"
      : "#004085"; // TNB Signature Logistics Blue

  const subColor =
    variant === "white"
      ? "#93C5FD"
      : variant === "light"
      ? "#E2E8F0"
      : "#004085";

  const heightMap = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 160"
        className={`${heightMap[size]} w-auto transition-all`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 'T' Character */}
        <path
          d="M 20 28 L 90 28 L 90 52 L 64 52 L 64 125 L 38 125 L 38 52 L 20 52 Z"
          fill={mainColor}
        />

        {/* 'N' Character */}
        <path
          d="M 98 28 L 126 28 L 165 92 L 165 28 L 190 28 L 190 125 L 163 125 L 123 60 L 123 125 L 98 125 Z"
          fill={mainColor}
        />

        {/* 'B' Character with integrated forward logistics arrow */}
        <path
          d="M 198 28 L 265 28 C 285 28 298 38 298 55 C 298 67 290 74 278 78 C 294 82 304 92 304 110 C 304 128 287 140 263 140 L 198 140 Z"
          fill={mainColor}
        />
        {/* B inner cutouts */}
        <path
          d="M 224 46 L 254 46 C 265 46 272 50 272 58 C 272 66 265 70 254 70 L 224 70 Z"
          fill={variant === "white" ? "#0F172A" : "#FFFFFF"}
        />
        <path
          d="M 224 86 L 257 86 C 269 86 277 92 277 101 C 277 110 269 116 257 116 L 224 116 Z"
          fill={variant === "white" ? "#0F172A" : "#FFFFFF"}
        />

        {/* Forward Logistics Arrow through TNB center */}
        <path
          d="M 130 75 L 245 75 L 245 60 L 275 80 L 245 100 L 245 85 L 130 85 Z"
          fill={mainColor}
          stroke={variant === "white" ? "#0F172A" : "#FFFFFF"}
          strokeWidth="3"
        />

        {/* Truck Silhouette Trailer Outline extending from TNB baseline */}
        {/* Baseline Underline */}
        <line
          x1="20"
          y1="148"
          x2="480"
          y2="148"
          stroke={mainColor}
          strokeWidth="6"
          strokeLinecap="square"
        />

        {/* Semi-Trailer Box Outline */}
        <path
          d="M 315 148 L 315 65 L 430 65 L 430 148"
          stroke={mainColor}
          strokeWidth="6"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Truck Cabin Silhouette (Aerodynamic Contour) */}
        <path
          d="M 436 148 L 436 50 C 445 50 470 55 490 85 C 500 100 500 120 500 148"
          stroke={mainColor}
          strokeWidth="6"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Truck Cabin Window Outline */}
        <path
          d="M 448 128 L 448 80 C 455 76 468 76 476 88 L 488 108 L 488 128 Z"
          stroke={mainColor}
          strokeWidth="4"
          fill="none"
        />

        {/* Subtitle: logistics co., ltd. */}
        {showSubtitle && (
          <text
            x="22"
            y="180"
            fill={subColor}
            fontSize="30"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
            letterSpacing="2"
          >
            logistics co., ltd.
          </text>
        )}
      </svg>
    </div>
  );
};
