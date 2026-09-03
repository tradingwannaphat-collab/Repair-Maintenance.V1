import React from "react";
import { Users, Radio } from "lucide-react";
import { CollabUser, LivePresenceUser } from "../types";

interface CollabHeaderWidgetProps {
  currentUser: CollabUser;
  onlineUsers: LivePresenceUser[];
  isConnected: boolean;
  onOpenModal: () => void;
}

export const CollabHeaderWidget: React.FC<CollabHeaderWidgetProps> = ({
  currentUser,
  onlineUsers,
  isConnected,
  onOpenModal
}) => {
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2);
  };

  const count = Math.max(1, onlineUsers.length);

  return (
    <button
      type="button"
      onClick={onOpenModal}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-white transition-all shadow-xs hover:shadow-md cursor-pointer group"
      title="คลิกเพื่อดูเพื่อนร่วมงานที่ออนไลน์ และสลับผู้ใช้งาน"
    >
      {/* Live Pulsing Dot */}
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
      </span>

      {/* Avatars Stack (up to 3) */}
      <div className="flex -space-x-1.5 overflow-hidden">
        {onlineUsers.slice(0, 3).map((user, idx) => (
          <div
            key={user.id || idx}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-800 text-[10px] font-bold text-white flex items-center justify-center shadow-xs"
            style={{ backgroundColor: user.color || "#3B82F6" }}
          >
            {getInitials(user.name)}
          </div>
        ))}
      </div>

      {/* Online Count & Current User label */}
      <div className="text-left hidden sm:block">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-white leading-tight">
            {count} ออนไลน์
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
        </div>
        <span className="text-[10px] text-slate-300 block truncate max-w-[80px] leading-none">
          {currentUser.nickname || currentUser.name.split(" ")[0]}
        </span>
      </div>
    </button>
  );
};
