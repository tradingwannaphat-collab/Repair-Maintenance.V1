import React, { useState } from "react";
import { 
  Users, 
  UserCheck, 
  X, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Boxes, 
  Truck, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  Edit3,
  Globe
} from "lucide-react";
import { CollabUser, LivePresenceUser, LiveActivityEvent } from "../types";
import { PRESET_COLLAB_USERS } from "../hooks/useRealtimeCollab";

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CollabUser;
  onSelectUser: (user: CollabUser) => void;
  onlineUsers: LivePresenceUser[];
  recentActivities: LiveActivityEvent[];
  isConnected: boolean;
}

const VIEW_NAMES_TH: Record<string, string> = {
  requester: "แจ้งซ่อมใหม่ (Driver / Requester)",
  worker: "รายการใบแจ้งซ่อม & ช่าง (Work Orders)",
  vehicles: "ทะเบียนรถและข้อมูลกองรถ 108 คัน",
  daily_inspection: "ตรวจเช็ครถประจำวัน (Daily Walkaround)",
  pm_plan: "แผนบำรุงรักษาเชิงป้องกัน (PM Plan)",
  maintenance_intervals: "ตารางรอบระยะทางซ่อมบำรุง",
  tire_management: "ผังยางและประวัติล้อ",
  oil_change_summary: "สรุปเปลี่ยนถ่ายน้ำมันเครื่อง",
  repair_history: "ประวัติการซ่อมบำรุงทั้งหมด",
  part_list: "คลังอะไหล่และพัสดุ",
  receiving: "รับเข้าอะไหล่ (Goods Receipt)",
  requisition: "เบิกจ่ายอะไหล่ (Requisition)",
  directory: "ทำเนียบช่าง ร้านค้า ศูนย์ซ่อม",
  workflow: "คู่มือสายงานซ่อมบำรุง"
};

export const CollabModal: React.FC<CollabModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onlineUsers,
  recentActivities,
  isConnected
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customName, setCustomName] = useState(currentUser.name);
  const [customRole, setCustomRole] = useState(currentUser.role);
  const [customDept, setCustomDept] = useState(currentUser.department);
  const [customColor, setCustomColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onSelectUser({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      role: customRole.trim() || "ช่างซ่อมบำรุง",
      department: customDept.trim() || "ศูนย์บริการ TNB",
      color: customColor || "#2563EB"
    });
    setIsEditingCustom(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="collab-modal-card"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  ระบบการทำงานร่วมกันแบบหลายคน (Live Collaboration)
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isConnected 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" 
                    : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                  {isConnected ? "เชื่อมต่อสด Real-Time" : "กำลังเชื่อมต่อ..."}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ซิงค์ข้อมูลใบแจ้งซ่อม คลังอะไหล่ และทำเนียบช่างอัตโนมัติพร้อมกันทุกอุปกรณ์ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Active User Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>ตัวตนของคุณในระบบขณะนี้</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingCustom(!isEditingCustom)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingCustom ? "ยกเลิกแก้ไข" : "กำหนดชื่อ/ตำแหน่งเอง"}
              </button>
            </div>

            {isEditingCustom ? (
              <form onSubmit={handleSaveCustom} className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ-นามสกุล หรือชื่อเล่น</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="เช่น สมชาย สุขใจ"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ตำแหน่ง / บทบาท</label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="เช่น ช่างซ่อมบำรุง, หัวหน้างาน"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">แผนก / สังกัด</label>
                    <input
                      type="text"
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      placeholder="เช่น แผนกช่วงล่าง, ฝ่ายจัดซื้อ"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">สีประจำตัว (Badge Color)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-9 h-8 p-0 border border-slate-300 rounded cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 font-mono">{customColor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                  >
                    บันทึกและใช้ชื่อนี้
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: currentUser.color || "#2563EB" }}
                  >
                    {getInitials(currentUser.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{currentUser.name}</span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium text-white shadow-xs"
                        style={{ backgroundColor: currentUser.color || "#2563EB" }}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser.department}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Switch Preset Users */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-xs font-medium text-slate-500 block mb-2">
                สลับบทบาทรวดเร็ว (สำหรับทดสอบการทำงานพร้อมกันหลายคน):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLLAB_USERS.map((preset) => {
                  const isSelected = currentUser.name === preset.name;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectUser(preset)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200 font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span>{preset.name}</span>
                      <span className="text-[10px] text-slate-400">({preset.nickname})</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Online Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h4 className="font-bold text-slate-900 text-sm">
                  ทีมงานที่กำลังออนไลน์ขณะนี้ ({onlineUsers.length} คน)
                </h4>
              </div>
              <span className="text-xs text-slate-500">อัปเดตแบบเรียลไทม์อัตโนมัติ</span>
            </div>

            {onlineUsers.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                กำลังค้นหาผู้ใช้งานในเครือข่าย...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {onlineUsers.map((user, idx) => (
                  <div
                    key={user.id || idx}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-shadow shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div 
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                          style={{ backgroundColor: user.color || "#3B82F6" }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 text-xs">{user.name}</span>
                          {user.name === currentUser.name && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-medium">คุณ</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">{user.role}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block max-w-[130px] truncate text-center">
                        {VIEW_NAMES_TH[user.currentView] || user.currentView || "หน้าหลัก"}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ออนไลน์อยู่
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Team Activity Stream */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  ไทม์ไลน์กิจกรรมล่าสุดของทีมงาน (Live Activity Stream)
                </h4>
              </div>
              <span className="text-xs text-slate-500">บันทึกล่าสุด</span>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-h-56 overflow-y-auto space-y-2.5">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  ยังไม่มีประวัติกิจกรรมล่าสุด
                </div>
              ) : (
                recentActivities.map((act) => {
                  const dateStr = new Date(act.timestamp).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  });

                  return (
                    <div 
                      key={act.id} 
                      className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-100 text-xs shadow-xs"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" 
                        style={{ backgroundColor: act.userColor || "#3B82F6" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800">
                            {act.userName} <span className="text-[11px] font-normal text-slate-500">({act.userRole})</span>
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{dateStr}</span>
                        </div>
                        <p className="text-slate-700 font-medium mt-0.5">{act.title}</p>
                        {act.description && (
                          <p className="text-slate-500 text-[11px] truncate">{act.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>โฮสต์เซิร์ฟเวอร์: AutoCare Pro Fleet Engine (TNB Logistics)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
