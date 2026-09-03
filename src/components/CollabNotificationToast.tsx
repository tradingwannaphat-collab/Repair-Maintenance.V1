import React, { useEffect } from "react";
import { Zap, X, CheckCircle } from "lucide-react";

interface CollabNotificationToastProps {
  notification: {
    title: string;
    desc: string;
    user?: {
      name?: string;
      color?: string;
    };
  } | null;
  onDismiss: () => void;
}

export const CollabNotificationToast: React.FC<CollabNotificationToastProps> = ({
  notification,
  onDismiss
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3 relative overflow-hidden backdrop-blur-md">
        {/* Left Color Indicator Accent */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: notification.user?.color || "#3B82F6" }}
        />

        <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl shrink-0 mt-0.5 border border-indigo-500/30">
          <Zap className="w-4 h-4 animate-pulse text-amber-400" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">
              {notification.user?.name || "เพื่อนร่วมงาน"}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
              ซิงค์สด
            </span>
          </div>
          <h5 className="text-sm font-semibold text-white mt-0.5">{notification.title}</h5>
          {notification.desc && (
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{notification.desc}</p>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="ปิดการแจ้งเตือน"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
