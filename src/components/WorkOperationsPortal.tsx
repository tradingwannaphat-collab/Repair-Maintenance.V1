import React, { useState } from "react";
import { 
  ClipboardList, 
  LayoutDashboard, 
  Wrench, 
  PlusCircle, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  FileSpreadsheet,
  Layers,
  Sparkles,
  Share2
} from "lucide-react";
import { TicketTracker } from "./TicketTracker";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { RepairTicket, RepairStatus } from "../types";

interface WorkOperationsPortalProps {
  tickets: RepairTicket[];
  onSelectTicket: (ticket: RepairTicket) => void;
  onOpenNewModal: () => void;
  onOpenBackdatedModal?: () => void;
  onOpenImportTicketsModal?: () => void;
  onQuickStatusChange: (ticketId: string, newStatus: RepairStatus) => void;
  onOpenShareModal?: () => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const WorkOperationsPortal: React.FC<WorkOperationsPortalProps> = ({
  tickets,
  onSelectTicket,
  onOpenNewModal,
  onOpenBackdatedModal,
  onOpenImportTicketsModal,
  onQuickStatusChange,
  onOpenShareModal,
  onDeleteTicket
}) => {
  const [subTab, setSubTab] = useState<"kanban" | "analytics">("kanban");

  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const inProgressCount = tickets.filter(t => t.status !== "pending" && t.status !== "completed").length;
  const completedCount = tickets.filter(t => t.status === "completed").length;
  const totalCost = tickets.reduce((sum, t) => sum + (t.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Workshop Top Operational Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Workshop Management & Operations Hub
            </span>
            <span className="text-xs text-slate-400">สำหรับช่างซ่อมบำรุงและหัวหน้าอู่</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            พื้นที่ปฏิบัติงานช่างและศูนย์ควบคุมการซ่อมบำรุง
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            จัดการมอบหมายช่าง เบิกอะไหล่ บันทึกงานซ่อม ตรวจสอบคุณภาพ QC และวิเคราะห์งบประมาณ
          </p>
        </div>

        {/* Sub-tab Navigation & Share Action */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenShareModal && (
            <button
              type="button"
              id="btn-share-hub-direct"
              onClick={onOpenShareModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white border border-blue-500/40 transition-colors shadow-xs"
              title="คัดลอกลิงก์แชร์หน้านี้ให้ทุกคนเปิดดู"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>แชร์หน้านี้ให้ทุกคน</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              id="subtab-kanban-btn"
              onClick={() => setSubTab("kanban")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subTab === "kanban"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>กระดานงานซ่อม (Kanban & ตาราง)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px]">
                {pendingCount + inProgressCount}
              </span>
            </button>

            <button
              type="button"
              id="subtab-analytics-btn"
              onClick={() => setSubTab("analytics")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subTab === "analytics"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>แดชบอร์ดสรุปผล & ผู้บริหาร</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View rendering based on subTab */}
      {subTab === "kanban" && (
        <TicketTracker
          tickets={tickets}
          onSelectTicket={onSelectTicket}
          onOpenNewModal={onOpenNewModal}
          onOpenBackdatedModal={onOpenBackdatedModal}
          onOpenImportTicketsModal={onOpenImportTicketsModal}
          onQuickStatusChange={onQuickStatusChange}
          onDeleteTicket={onDeleteTicket}
        />
      )}

      {subTab === "analytics" && (
        <ExecutiveDashboard
          tickets={tickets}
          onSelectTicket={onSelectTicket}
        />
      )}
    </div>
  );
};
