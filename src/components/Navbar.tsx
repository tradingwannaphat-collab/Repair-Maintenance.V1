import React, { useState, useRef, useEffect } from "react";
import { 
  Wrench, 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  Search, 
  RotateCcw, 
  Truck, 
  Sparkles, 
  Car, 
  UserCheck, 
  HardHat, 
  Trash2, 
  Database, 
  ChevronDown, 
  CheckCircle2,
  PackagePlus,
  PackageMinus,
  Boxes,
  Menu,
  X,
  Download,
  FileSpreadsheet,
  Workflow,
  CalendarDays
} from "lucide-react";
import { AppNavView } from "../types";
import { TnbLogo } from "./TnbLogo";

interface NavbarProps {
  currentView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  pendingCount: number;
  inProgressCount: number;
  totalTicketsCount: number;
  vehicleCount?: number;
  inventoryCount?: number;
  pmCount?: number;
  onClearAllData: () => void;
  onLoadDemoData: () => void;
  onOpenNewModal: () => void;
  onOpenSearchModal: () => void;
  onOpenExportBackupModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  pendingCount,
  inProgressCount,
  totalTicketsCount,
  vehicleCount = 0,
  inventoryCount = 0,
  pmCount = 0,
  onClearAllData,
  onLoadDemoData,
  onOpenNewModal,
  onOpenSearchModal,
  onOpenExportBackupModal
}) => {
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDataMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      id: "requester" as AppNavView,
      label: "หน้าผู้แจ้งซ่อม",
      shortLabel: "แจ้งซ่อม",
      icon: Car,
      badge: null,
      badgeColor: "bg-blue-500"
    },
    {
      id: "worker" as AppNavView,
      label: "หน้าทำงาน & ช่าง",
      shortLabel: "งานซ่อม",
      icon: HardHat,
      badge: (pendingCount + inProgressCount) > 0 ? pendingCount + inProgressCount : null,
      badgeColor: "bg-amber-400 text-slate-950 font-bold"
    },
    {
      id: "vehicles" as AppNavView,
      label: "สารระบบทะเบียนรถ",
      shortLabel: "ทะเบียนรถ",
      icon: Truck,
      badge: vehicleCount > 0 ? `${vehicleCount}` : null,
      badgeColor: "bg-blue-400 text-slate-950 font-semibold"
    },
    {
      id: "pm_plan" as AppNavView,
      label: "แผน PM รถ เดือน/ปี",
      shortLabel: "แผน PM",
      icon: CalendarDays,
      badge: pmCount > 0 ? `${pmCount}` : "ISO",
      badgeColor: "bg-emerald-400 text-slate-950 font-bold"
    },
    {
      id: "part_list" as AppNavView,
      label: "Part List & แคตตาล็อกอะไหล่",
      shortLabel: "Part List",
      icon: Boxes,
      badge: inventoryCount > 0 ? `${inventoryCount}` : null,
      badgeColor: "bg-purple-400 text-slate-950 font-bold"
    },
    {
      id: "receiving" as AppNavView,
      label: "รับของเข้าคลัง",
      shortLabel: "รับของ",
      icon: PackagePlus,
      badge: null,
      badgeColor: "bg-emerald-500"
    },
    {
      id: "requisition" as AppNavView,
      label: "เบิกของ & อะไหล่",
      shortLabel: "เบิกของ",
      icon: PackageMinus,
      badge: null,
      badgeColor: "bg-amber-500"
    },
    {
      id: "workflow" as AppNavView,
      label: "Flow การทำงาน & คู่มือ",
      shortLabel: "Flow & ISO",
      icon: Workflow,
      badge: "คู่มือ",
      badgeColor: "bg-cyan-400 text-slate-950 font-extrabold"
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - TNB Logistics */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none shrink-0"
            onClick={() => onSelectView("requester")}
            id="brand-logo-btn"
          >
            <div className="bg-white px-2 py-1 rounded-lg shadow-sm flex items-center justify-center">
              <TnbLogo variant="blue" size="sm" showSubtitle={false} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">TNB Logistics</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Fleet & Workshop
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal hidden sm:block">ระบบแจ้งซ่อมบำรุง & คลังอะไหล่ยานพาหนะ</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (5 Main Modules) */}
          <div className="hidden lg:flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectView(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.shortLabel}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions: Quick Search, Data Management & New Repair Button */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <button
              id="btn-nav-quick-search"
              onClick={onOpenSearchModal}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors flex items-center space-x-1.5 border border-slate-700/60"
              title="ค้นหาด่วนด้วยทะเบียน"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline text-xs font-medium">ค้นหาทะเบียน</span>
            </button>

            {/* Data Management Menu (ล้างข้อมูลจริง / โหลดตัวอย่าง) */}
            <div className="relative" ref={menuRef}>
              <button
                id="btn-data-management-menu"
                onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                title="จัดการฐานข้อมูล (ล้างข้อมูลเพื่อเริ่มใช้งานจริง / โหลดตัวอย่าง)"
                className="px-2 sm:px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors flex items-center space-x-1.5 border border-slate-700/60"
              >
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline text-xs font-medium text-slate-300">
                  {totalTicketsCount === 0 ? "พร้อมใช้จริง" : `ข้อมูล (${totalTicketsCount})`}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDataMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>จัดการข้อมูลระบบ TNB</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        totalTicketsCount === 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {totalTicketsCount === 0 ? "Production Ready" : `${totalTicketsCount} ใบแจ้งซ่อม`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      {totalTicketsCount === 0 ? "ระบบสะอาด พร้อมสำหรับการเริ่มบันทึกงานซ่อมจริง" : "มีรายการงานซ่อมอยู่ในระบบ"}
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {onOpenExportBackupModal && (
                      <button
                        onClick={() => {
                          setIsDataMenuOpen(false);
                          onOpenExportBackupModal();
                        }}
                        id="btn-open-backup-export"
                        className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:text-white hover:bg-emerald-600/30 rounded-lg flex items-center space-x-2.5 transition-colors font-medium border border-emerald-500/20 bg-emerald-950/20"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-300">ส่งออก / สำรองข้อมูล (Export & Backup)</div>
                          <div className="text-[10px] text-emerald-100/70">ดาวน์โหลด Excel 5-in-1, ข้อมูลรถ, อะไหล่, ใบแจ้งซ่อม</div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onClearAllData();
                      }}
                      id="btn-clear-all-data"
                      className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-lg flex items-center space-x-2.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-bold">ล้างข้อมูลทั้งระบบ (Clear All Data)</div>
                        <div className="text-[10px] text-slate-400">รีเซ็ตทุกโมดูลเป็น 0 (ใบซ่อม, คลัง, ทะเบียนรถ) เพื่อเริ่มใช้งานจริง</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDataMenuOpen(false);
                        onLoadDemoData();
                      }}
                      id="btn-load-demo-data"
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center space-x-2.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-200">โหลดข้อมูลตัวอย่าง (Demo Data)</div>
                        <div className="text-[10px] text-slate-400">สำหรับทดสอบระบบและดูตัวอย่างรายงาน</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Create Repair Button */}
            <button
              id="btn-open-new-repair"
              onClick={onOpenNewModal}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">+ แจ้งซ่อมใหม่</span>
              <span className="sm:hidden">+ แจ้งซ่อม</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Sub-Navbar for Tablets and Mobile */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 border-t border-slate-800 space-x-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white bg-slate-800/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.shortLabel}</span>
                {item.badge && (
                  <span className={`px-1 py-0.1 text-[9px] rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
