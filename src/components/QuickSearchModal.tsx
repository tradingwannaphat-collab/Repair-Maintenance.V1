import React, { useState } from "react";
import { Search, Car, Clock, Wrench, CheckCircle2, X, ChevronRight, AlertCircle } from "lucide-react";
import { RepairTicket } from "../types";
import { CATEGORIES_CONFIG, STATUS_CONFIG } from "../data/categories";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: RepairTicket[];
  onSelectTicket: (ticket: RepairTicket) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onSelectTicket
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const results = tickets.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return false;
    return (
      t.licensePlate.toLowerCase().includes(q) ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.requesterName.toLowerCase().includes(q) ||
      t.requesterPhone.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ค้นหาสถานะงานซ่อมด่วน (Quick Lookup)</h2>
              <p className="text-xs text-slate-400">พิมพ์เลขทะเบียนรถ เช่น "1ฒข-4589" หรือเบอร์โทร เพื่อเช็คสถานะทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              id="input-quick-search-plate"
              placeholder="พิมพ์ทะเบียนรถ, เลขที่ใบงาน หรือชื่อคนขับ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>

          {/* Preset quick buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">คลิกค้นหาทะเบียนตัวอย่าง:</span>
            {["1ฒข-4589", "3ขค-1290", "นข-5511", "70-8844", "ฮข-9922"].map((plate) => (
              <button
                type="button"
                key={plate}
                onClick={() => setSearchTerm(plate)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-mono"
              >
                {plate}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {searchTerm.trim() && results.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                ไม่พบข้อมูลใบแจ้งซ่อมสำหรับ "{searchTerm}"
              </div>
            )}

            {results.map((t) => {
              const cat = CATEGORIES_CONFIG[t.category];
              const statusMeta = STATUS_CONFIG[t.status];
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTicket(t);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all cursor-pointer shadow-xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600">
                        {t.licensePlate}
                      </span>
                      <span className="text-xs text-slate-500">({t.vehicleBrand} {t.vehicleModel})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusMeta.badgeBg}`}>
                      {statusMeta.labelTh}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 font-normal">
                    <strong>อาการ:</strong> {t.symptoms}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>ผู้แจ้ง: {t.requesterName} ({t.department})</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      ดูใบงาน <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
