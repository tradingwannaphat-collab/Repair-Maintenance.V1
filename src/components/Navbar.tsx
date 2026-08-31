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
  CalendarDays,
  ClipboardCheck,
  Share2,
  History,
  Gauge,
  CircleDot,
  SlidersHorizontal
} from "lucide-react";
import { AppNavView } from "../types";
import { TnbLogo } from "./TnbLogo";
import { Cloud, RefreshCw, CheckCircle } from "lucide-react";

interface NavbarProps {
  currentView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  pendingCount: number;
  inProgressCount: number;
  totalTicketsCount: number;
  vehicleCount?: number;
  inventoryCount?: number;
  pmCount?: number;
  dailyInspectionCount?: number;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
  onManualSync?: () => void;
  onClearAllData: () => void;
  onLoadDemoData: () => void;
  onOpenNewModal: () => void;
  onOpenBackdatedTicketModal?: () => void;
  onOpenImportTicketsModal?: () => void;
  onOpenSearchModal: () => void;
  onOpenExportBackupModal?: () => void;
  onOpenShareModal?: () => void;
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
  dailyInspectionCount = 0,
  isCloudConnected = true,
  isSyncing = false,
  lastSyncedTime = null,
  onManualSync,
  onClearAllData,
  onLoadDemoData,
  onOpenNewModal,
  onOpenBackdatedTicketModal,
  onOpenImportTicketsModal,
  onOpenSearchModal,
  onOpenExportBackupModal,
  onOpenShareModal
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
      id: "daily_inspection" as AppNavView,
      label: "ตรวจสภาพรถประจำวัน",
      shortLabel: "ตรวจรถประจำวัน",
      icon: ClipboardCheck,
      badge: "21 ข้อ",
      badgeColor: "bg-cyan-400 text-slate-950 font-bold"
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
      id: "maintenance_intervals" as AppNavView,
      label: "แผนบำรุงรักษาตามระยะ & เลขไมล์",
      shortLabel: "ซ่อมตามระยะ",
      icon: Gauge,
      badge: "DIY/ศูนย์",
      badgeColor: "bg-amber-400 text-slate-950 font-bold"
    },
    {
      id: "tire_management" as AppNavView,
      label: "ระบบตรวจสอบ & เปลี่ยนยางรายคัน",
      shortLabel: "ตรวจ & เปลี่ยนยาง",
      icon: CircleDot,
      badge: "ยาง/ดอกยาง",
      badgeColor: "bg-rose-400 text-slate-950 font-bold"
    },
    {
      id: "repair_history" as AppNavView,
      label: "ประวัติการซ่อมและค่าใช้จ่ายรายคัน",
      shortLabel: "ประวัติซ่อม & ค่าใช้จ่าย",
      icon: History,
      badge: "สมุดประวัติ",
      badgeColor: "bg-indigo-400 text-slate-950 font-bold"
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
            {/* Cloud Real-Time Sync Status Badge & Button */}
            <button
              id="btn-cloud-sync-status"
              onClick={onManualSync}
              title={`สถานะการเชื่อมต่อฐานข้อมูลกลาง: ${isCloudConnected ? "ออนไลน์ ซิงค์ตรงกันทุกเครื่อง" : "ออฟไลน์"}${lastSyncedTime ? ` (อัปเดตล่าสุด: ${new Date(lastSyncedTime).toLocaleTimeString("th-TH")})` : ""}`}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                isSyncing
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : isCloudConnected
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40"
                  : "bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/40"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-400" : isCloudConnected ? "text-emerald-400" : "text-rose-400"}`} />
              <span className="hidden xl:inline text-[11px]">
                {isSyncing ? "กำลังซิงค์..." : isCloudConnected ? "ซิงค์ตรงกันทุกเครื่อง" : "ออฟไลน์"}
              </span>
            </button>

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
                    {onManualSync && (
                      <button
                        onClick={() => {
                          setIsDataMenuOpen(false);
                          onManualSync();
                        }}
                        id="btn-force-cloud-sync-menu"
                        className="w-full text-left px-3 py-2 text-xs text-cyan-300 hover:text-white hover:bg-cyan-600/30 rounded-lg flex items-center space-x-2.5 transition-colors font-medium border border-cyan-500/20 bg-cyan-950/20"
                      >
                        <RefreshCw className={`w-4 h-4 text-cyan-400 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
                        <div>
                          <div className="font-bold text-cyan-300">ซิงค์ฐานข้อมูลกลาง (Cloud Real-Time Sync)</div>
                          <div className="text-[10px] text-cyan-100/70">
                            {lastSyncedTime 
                              ? `ซิงค์ล่าสุดเมื่อ ${new Date(lastSyncedTime).toLocaleTimeString("th-TH")}` 
                              : "ดึงและส่งข้อมูลล่าสุดเพื่อให้ทุกเครื่องเห็นตรงกัน"}
                          </div>
                        </div>
                      </button>
                    )}

                    {onOpenBackdatedTicketModal && (
                      <button
                        onClick={() => {
                          setIsDataMenuOpen(false);
                          onOpenBackdatedTicketModal();
                        }}
                        id="btn-open-backdated-ticket-menu"
                        className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:text-white hover:bg-amber-600/30 rounded-lg flex items-center space-x-2.5 transition-colors font-medium border border-amber-500/20 bg-amber-950/20"
                      >
                        <CalendarDays className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-amber-300">เพิ่มใบแจ้งซ่อมย้อนหลัง (Backdate Work Order)</div>
                          <div className="text-[10px] text-amber-100/70">กรอกประวัติงานซ่อมในอดีต / บันทึกงานซ่อมจากอู่นอก</div>
                        </div>
                      </button>
                    )}

                    {onOpenImportTicketsModal && (
                      <button
                        onClick={() => {
                          setIsDataMenuOpen(false);
                          onOpenImportTicketsModal();
                        }}
                        id="btn-open-import-tickets-menu"
                        className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:text-white hover:bg-blue-600/30 rounded-lg flex items-center space-x-2.5 transition-colors font-medium border border-blue-500/20 bg-blue-950/20"
                      >
                        <Download className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="font-bold text-blue-300">นำเข้า Excel ประวัติงานซ่อม (Bulk Tickets)</div>
                          <div className="text-[10px] text-blue-100/70">อัปโหลดไฟล์ Excel/CSV บันทึกประวัติซ่อมหลายคันพร้อมกัน</div>
                        </div>
                      </button>
                    )}

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

            <button
              id="btn-nav-share-app"
              onClick={onOpenShareModal}
              className="px-2 sm:px-2.5 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white rounded-lg text-xs transition-colors flex items-center space-x-1.5 border border-blue-500/40 font-semibold"
              title="แชร์ลิงก์หน้านี้ให้ทุกคนเห็น"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">แชร์ให้ทุกคน</span>
            </button>

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

        {/* Mobile Slide-Out Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-white px-2 py-1 rounded-lg">
                    <TnbLogo variant="blue" size="sm" showSubtitle={false} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">TNB Logistics</h3>
                    <p className="text-[10px] text-slate-400">ระบบซ่อมบำรุง & ตรวจสภาพรถ</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions at Top of Drawer */}
              <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenNewModal();
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-900/40 active:scale-98 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ เปิดใบแจ้งซ่อมใหม่ (New Ticket)</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSearchModal();
                  }}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  <span>ค้นหาด่วนด้วยทะเบียนรถ</span>
                </button>
              </div>

              {/* Module Navigation List */}
              <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  เมนูโมดูลหลัก (Core Modules)
                </div>
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
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                          : "text-slate-300 hover:bg-slate-800/90 bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-left">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Additional Actions */}
                <div className="pt-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    ระบบจัดการข้อมูล & นำเข้า
                  </div>
                  <div className="space-y-1 mt-1">
                    {onOpenBackdatedTicketModal && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenBackdatedTicketModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 bg-amber-950/20 rounded-lg flex items-center space-x-2 border border-amber-500/20"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>เพิ่มใบแจ้งซ่อมย้อนหลัง</span>
                      </button>
                    )}

                    {onOpenImportTicketsModal && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenImportTicketsModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:bg-blue-950/40 bg-blue-950/20 rounded-lg flex items-center space-x-2 border border-blue-500/20"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>นำเข้า Excel ประวัติซ่อม</span>
                      </button>
                    )}

                    {onOpenExportBackupModal && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenExportBackupModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-950/40 bg-emerald-950/20 rounded-lg flex items-center space-x-2 border border-emerald-500/20"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>สำรองข้อมูล / ส่งออก Excel</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLoadDemoData();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 bg-slate-800/40 rounded-lg flex items-center space-x-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>โหลดข้อมูลตัวอย่าง (Demo)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onClearAllData();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 bg-rose-950/20 rounded-lg flex items-center space-x-2 border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>ล้างข้อมูลทั้งระบบ (Clear)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Status */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>ยานพาหนะ {vehicleCount} คัน</span>
                <span className="text-emerald-400 font-medium">● ระบบออนไลน์ 100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Sub-Navbar for Tablets and Mobile */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 border-t border-slate-800 space-x-1 no-scrollbar px-1">
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
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white bg-slate-800/80 active:bg-slate-700"
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

      {/* Floating Sticky Mobile Bottom Navigation Bar (Phone Screens) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around">
        {/* 1. แจ้งซ่อม (Requester) */}
        <button
          onClick={() => onSelectView("requester")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
            currentView === "requester" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Car className="w-5 h-5 mb-0.5" />
          <span>แจ้งซ่อม</span>
        </button>

        {/* 2. งานช่าง (Worker) */}
        <button
          onClick={() => onSelectView("worker")}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
            currentView === "worker" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <HardHat className="w-5 h-5 mb-0.5" />
          <span>งานช่าง</span>
          {(pendingCount + inProgressCount) > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {pendingCount + inProgressCount}
            </span>
          )}
        </button>

        {/* 3. ตรวจ 21 ข้อ (Daily Inspection) */}
        <button
          onClick={() => onSelectView("daily_inspection")}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
            currentView === "daily_inspection" ? "text-cyan-400 font-black" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mb-0.5" />
          <span>ตรวจ 21 ข้อ</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
        </button>

        {/* 4. แผน PM (PM Plan) */}
        <button
          onClick={() => onSelectView("pm_plan")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
            currentView === "pm_plan" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span>แผน PM</span>
        </button>

        {/* 5. เมนูทั้งหมด (Menu Drawer) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5 mb-0.5 text-blue-400" />
          <span>เมนู</span>
        </button>
      </nav>
    </header>
  );
};
