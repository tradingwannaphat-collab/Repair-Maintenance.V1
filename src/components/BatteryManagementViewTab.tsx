import React, { useState, useMemo } from "react";
import { 
  BatteryCharging, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  Eye, 
  Info, 
  Sparkles, 
  ArrowRightLeft,
  X,
  ShieldCheck,
  Check
} from "lucide-react";
import { BatteryReplacementRecord, VehicleRecord } from "../types";
import { 
  BATTERY_BRANDS, 
  BATTERY_MODELS, 
  BATTERY_REASONS, 
  BATTERY_SUPPLIERS 
} from "../data/batteryManagementData";

interface BatteryManagementViewTabProps {
  vehicles: VehicleRecord[];
  batteryReplacements: BatteryReplacementRecord[];
  onSaveBatteryReplacements: (records: BatteryReplacementRecord[]) => void;
  onSelectVehicleForDiagram: (vehicleId: string) => void;
  onRequestRepairForVehicle?: (licensePlate: string) => void;
}

export const BatteryManagementViewTab: React.FC<BatteryManagementViewTabProps> = ({
  vehicles,
  batteryReplacements,
  onSaveBatteryReplacements,
  onSelectVehicleForDiagram,
  onRequestRepairForVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<BatteryReplacementRecord | null>(null);

  // Form State for Add Battery
  const [formVehicleId, setFormVehicleId] = useState(vehicles[0]?.id || "");
  const [formCustomPlate, setFormCustomPlate] = useState("");
  const [formDateTh, setFormDateTh] = useState("8/20/2569");
  const [formPrevDate, setFormPrevDate] = useState("มากับรถ");
  const [formPrevBrand, setFormPrevBrand] = useState("SG");
  const [formPrevModel, setFormPrevModel] = useState("N120");
  const [formBrand, setFormBrand] = useState("FB");
  const [formModel, setFormModel] = useState("N120=115F511");
  const [formQuantity, setFormQuantity] = useState(2);
  const [formCost, setFormCost] = useState(8000);
  const [formShop, setFormShop] = useState("ส.รวมยนต์");
  const [formMileage, setFormMileage] = useState<number>(270000);
  const [formDriver, setFormDriver] = useState("");
  const [formReason, setFormReason] = useState("เกิดจากเสื่อมสภาพเก็บไฟไม่อยู่ ต้องเปลี่ยน/2ลูก");
  const [formNotes, setFormNotes] = useState("");

  // Filtered list
  const filteredRecords = useMemo(() => {
    return batteryReplacements.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = 
        !q ||
        (r.licensePlate || "").toLowerCase().includes(q) ||
        (r.driverName && r.driverName.toLowerCase().includes(q)) ||
        (r.batteryBrand || "").toLowerCase().includes(q) ||
        (r.batteryModelOrSize || "").toLowerCase().includes(q) ||
        (r.supplierOrShop && r.supplierOrShop.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q));

      const matchBrand = brandFilter === "all" || r.batteryBrand === brandFilter;
      const matchModel = modelFilter === "all" || r.batteryModelOrSize === modelFilter;

      return matchSearch && matchBrand && matchModel;
    });
  }, [batteryReplacements, searchTerm, brandFilter, modelFilter]);

  // KPIs
  const totalCost = useMemo(() => {
    return batteryReplacements.reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [batteryReplacements]);

  const totalBatteries = useMemo(() => {
    return batteryReplacements.reduce((sum, r) => sum + (r.quantity || 2), 0);
  }, [batteryReplacements]);

  // Unique brands & models for filters
  const allBrands = useMemo(() => {
    const list = Array.from(new Set(batteryReplacements.map((r) => r.batteryBrand).filter(Boolean)));
    return list;
  }, [batteryReplacements]);

  const allModels = useMemo(() => {
    const list = Array.from(new Set(batteryReplacements.map((r) => r.batteryModelOrSize).filter(Boolean)));
    return list;
  }, [batteryReplacements]);

  // Handle Submit New Battery
  const handleCreateBatteryRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === formVehicleId);
    const finalPlate = formCustomPlate.trim() || veh?.licensePlate || "700-0000";

    const newRecord: BatteryReplacementRecord = {
      id: `BAT-2026-${Date.now().toString().slice(-4)}`,
      vehicleId: veh?.id || `VEH-CUSTOM-${Date.now()}`,
      licensePlate: finalPlate,
      vehicleBrand: veh?.brand,
      vehicleModel: veh?.model,
      vehicleType: veh?.vehicleType,
      driverName: formDriver.trim() || undefined,
      replacedDate: new Date().toISOString().slice(0, 10),
      displayDateTh: formDateTh.trim() || new Date().toLocaleDateString("th-TH"),
      previousReplacedDate: formPrevDate.trim() || "มากับรถ",
      previousBrand: formPrevBrand.trim() || "SG",
      previousModelOrSize: formPrevModel.trim() || "N120",
      previousQuantity: 2,
      batteryBrand: formBrand.trim(),
      batteryModelOrSize: formModel.trim(),
      quantity: Number(formQuantity) || 2,
      cost: Number(formCost) || 8000,
      supplierOrShop: formShop.trim() || "ส.รวมยนต์",
      replacedMileage: Number(formMileage) || undefined,
      reason: formReason.trim() || undefined,
      status: "active",
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...batteryReplacements];
    onSaveBatteryReplacements(updated);
    setIsAddModalOpen(false);
  };

  // Handle Delete
  const handleDeleteRecord = (id: string) => {
    if (confirm("ต้องการลบบันทึกประวัติการเปลี่ยนแบตเตอรี่รายการนี้ใช่หรือไม่?")) {
      const updated = batteryReplacements.filter((r) => r.id !== id);
      onSaveBatteryReplacements(updated);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ลำดับ",
      "วันที่เปลี่ยน",
      "ทะเบียนรถ",
      "พนักงานขับรถ (พขร)",
      "แบตเตอรี่เดิม",
      "แบตเตอรี่ใหม่",
      "จำนวน (ลูก)",
      "ราคา (บาท)",
      "ร้านค้า / ผู้จำหน่าย",
      "เลขไมล์ (กม.)",
      "สาเหตุการเปลี่ยน",
      "หมายเหตุ"
    ];

    const rows = batteryReplacements.map((r, idx) => [
      idx + 1,
      r.displayDateTh || r.replacedDate,
      r.licensePlate,
      r.driverName || "-",
      `${r.previousBrand || ""} ${r.previousModelOrSize || ""} (${r.previousReplacedDate || "มากับรถ"})`,
      `${r.batteryBrand} ${r.batteryModelOrSize}`,
      r.quantity || 2,
      r.cost || 0,
      r.supplierOrShop || "-",
      r.replacedMileage || "-",
      `"${(r.reason || "-").replace(/"/g, '""')}"`,
      `"${(r.notes || "-").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tnb_battery_replacements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">จำนวนบันทึกเปลี่ยน</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {batteryReplacements.length} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">บันทึกครบถ้วนในระบบ</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BatteryCharging className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">แบตเตอรี่ที่เปลี่ยนรวม</span>
            <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
              {totalBatteries} <span className="text-xs font-normal text-slate-500">ลูก (2 ลูก/คัน)</span>
            </div>
            <span className="text-[11px] text-blue-600 font-medium">FB F135L / FB N120</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">ค่าใช้จ่ายแบตเตอรี่รวม</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ฿{totalCost.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">5,400 - 8,000 บาท/คู่</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">ร้านค้าหลัก / ซัพพลายเออร์</span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              ส.รวมยนต์
            </div>
            <span className="text-[11px] text-purple-600 font-medium">คู่ค้าประจำกองยาน TNB</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาทะเบียน, พขร, รุ่นแบต, สาเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Brand */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">ทุกยี่ห้อ ({allBrands.length})</option>
            {allBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Filter Model */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">ทุกขนาด/รุ่น ({allModels.length})</option>
            {allModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {(searchTerm || brandFilter !== "all" || modelFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setBrandFilter("all");
                setModelFilter("all");
              }}
              className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก Excel/CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกเปลี่ยนแบตเตอรี่</span>
          </button>
        </div>
      </div>

      {/* Battery Replacements Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-800">
              ตารางบันทึกประวัติการเปลี่ยนแบตเตอรี่กองยาน (Document 2)
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full font-mono">
              {filteredRecords.length} รายการ
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            คลิกที่ปุ่ม <strong className="text-blue-600">ผังรถ</strong> เพื่อดูตำแหน่งในโครงสร้างรถ
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                <th className="py-3 px-3">วันที่เปลี่ยน</th>
                <th className="py-3 px-3">ทะเบียนรถ</th>
                <th className="py-3 px-3">พขร</th>
                <th className="py-3 px-3">แบตเตอรี่เดิม</th>
                <th className="py-3 px-3">แบตเตอรี่ใหม่ที่เปลี่ยน</th>
                <th className="py-3 px-3 text-center">จำนวน</th>
                <th className="py-3 px-3 text-right">ราคา (บ.)</th>
                <th className="py-3 px-3">ร้านค้า</th>
                <th className="py-3 px-3 text-right">ไมล์ที่เปลี่ยน</th>
                <th className="py-3 px-3 min-w-[200px]">สาเหตุการเปลี่ยน</th>
                <th className="py-3 px-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลประวัติการเปลี่ยนแบตเตอรี่ตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, index) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {r.displayDateTh || r.replacedDate}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 font-mono text-sm">
                          {r.licensePlate}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.vehicleBrand || ""} {r.vehicleModel ? r.vehicleModel.split(" ")[0] : ""}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {r.driverName || "-"}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.previousBrand || "SG"} {r.previousModelOrSize || ""} ({r.previousReplacedDate || "มากับรถ"})
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-blue-700 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                          <span>{r.batteryBrand} {r.batteryModelOrSize}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                        {r.quantity || 2} ลูก
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        ฿{(r.cost || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">
                          {r.supplierOrShop || "ส.รวมยนต์"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {r.replacedMileage ? `${r.replacedMileage.toLocaleString()} กม.` : "-"}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-700 max-w-xs">
                        {r.reason ? (
                          <span className={`${r.reason.includes("ระเบิด") ? "text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" : ""}`}>
                            {r.reason}
                          </span>
                        ) : (
                          r.notes || "-"
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectVehicleForDiagram(r.vehicleId)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                            title="เปิดดูผังรถคันนี้"
                          >
                            <Truck className="w-3 h-3 text-blue-600" />
                            <span>ผังรถ</span>
                          </button>

                          <button
                            onClick={() => setSelectedRecordForDetail(r)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Battery Replacement */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    บันทึกประวัติการเปลี่ยนแบตเตอรี่ใหม่
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึกข้อมูลแบตเตอรี่รถบรรทุกและเชื่อมโยงกับผังประจำคัน
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatteryRecord} className="space-y-4 text-xs">
              {/* Select Vehicle */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  เลือกรถในระบบ หรือ ระบุทะเบียน
                </label>
                <select
                  value={formVehicleId}
                  onChange={(e) => {
                    setFormVehicleId(e.target.value);
                    const v = vehicles.find((x) => x.id === e.target.value);
                    if (v) {
                      setFormCustomPlate(v.licensePlate);
                      setFormMileage(v.currentMileage);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.brand} {v.model} ({v.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    วันที่เปลี่ยน (ตามเอกสาร/ปฏิทินไทย)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 8/20/2569"
                    value={formDateTh}
                    onChange={(e) => setFormDateTh(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    พนักงานขับรถ (พขร)
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อพนักงานขับรถ"
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Battery Specs: New & Previous */}
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3">
                <span className="font-bold text-amber-900 block text-xs">
                  🔋 ข้อมูลแบตเตอรี่ใหม่ที่ติดตั้ง
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">ยี่ห้อ</label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      required
                      placeholder="เช่น FB, GS"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">รุ่น / ขนาด</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      required
                      placeholder="เช่น N120=115F511, F135L"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">จำนวน (ลูก)</label>
                    <input
                      type="number"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      required
                      min={1}
                      max={4}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">ราคารวม (บาท)</label>
                    <input
                      type="number"
                      value={formCost}
                      onChange={(e) => setFormCost(Number(e.target.value))}
                      required
                      min={0}
                      step={100}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Previous Battery Info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">แบตเตอรี่เดิม</label>
                  <input
                    type="text"
                    value={formPrevBrand}
                    onChange={(e) => setFormPrevBrand(e.target.value)}
                    placeholder="เช่น SG"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">รุ่นเดิม</label>
                  <input
                    type="text"
                    value={formPrevModel}
                    onChange={(e) => setFormPrevModel(e.target.value)}
                    placeholder="เช่น N120"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">วันที่เดิม</label>
                  <input
                    type="text"
                    value={formPrevDate}
                    onChange={(e) => setFormPrevDate(e.target.value)}
                    placeholder="เช่น มากับรถ"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Shop & Mileage & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ร้านค้า / ซัพพลายเออร์</label>
                  <input
                    type="text"
                    value={formShop}
                    onChange={(e) => setFormShop(e.target.value)}
                    placeholder="เช่น ส.รวมยนต์"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">เลขไมล์ที่เปลี่ยน (กม.)</label>
                  <input
                    type="number"
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    placeholder="เช่น 268395"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">สาเหตุการเปลี่ยน</label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="เช่น เกิดจากเสื่อมสภาพเก็บไฟไม่อยู่ ต้องเปลี่ยน/2ลูก"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  รายละเอียดประวัติเปลี่ยนแบตเตอรี่
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ทะเบียนรถ:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedRecordForDetail.licensePlate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">วันที่เปลี่ยน:</span>
                <span className="font-mono font-bold text-slate-800">{selectedRecordForDetail.displayDateTh}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">พขร:</span>
                <span className="font-semibold text-slate-800">{selectedRecordForDetail.driverName || "-"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">แบตเตอรี่เดิม:</span>
                <span className="text-slate-700">{selectedRecordForDetail.previousBrand} {selectedRecordForDetail.previousModelOrSize} ({selectedRecordForDetail.previousReplacedDate || "มากับรถ"})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">แบตเตอรี่ใหม่:</span>
                <span className="font-bold text-blue-700">{selectedRecordForDetail.batteryBrand} {selectedRecordForDetail.batteryModelOrSize} (จำนวน {selectedRecordForDetail.quantity} ลูก)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ราคา:</span>
                <span className="font-mono font-bold text-emerald-700">฿{(selectedRecordForDetail.cost || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ร้านค้า:</span>
                <span className="text-slate-800 font-medium">{selectedRecordForDetail.supplierOrShop}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">เลขไมล์:</span>
                <span className="font-mono text-slate-800">{selectedRecordForDetail.replacedMileage ? `${selectedRecordForDetail.replacedMileage.toLocaleString()} กม.` : "-"}</span>
              </div>
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">สาเหตุการเปลี่ยน:</span>
                <span className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg block border border-slate-200">
                  {selectedRecordForDetail.reason || "-"}
                </span>
              </div>
              {selectedRecordForDetail.notes && (
                <div className="py-1.5">
                  <span className="text-slate-500 block mb-1">หมายเหตุ:</span>
                  <span className="text-slate-700 bg-slate-50 p-2 rounded-lg block border border-slate-200">
                    {selectedRecordForDetail.notes}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  onSelectVehicleForDiagram(selectedRecordForDetail.vehicleId);
                  setSelectedRecordForDetail(null);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>เปิดดูผังรถคันนี้</span>
              </button>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
