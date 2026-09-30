import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Truck, 
  User, 
  Calendar, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Trash2, 
  PenTool, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  DollarSign,
  Info,
  Check,
  Eye
} from "lucide-react";
import { 
  VehicleRecord, 
  VehicleSafetyHandoverRecord, 
  HandoverItemDetail, 
  SignedDocumentUpload,
  VehicleSafetyItemTemplate
} from "../../types";
import { 
  VEHICLE_SAFETY_ITEMS_TEMPLATE, 
  DEFAULT_SAFETY_LIABILITY_CLAUSE 
} from "../../data/vehicleSafetyEquipmentData";
import { SafetyItemSvgIcon } from "./SafetyItemSvgIcon";

interface SafetyHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: VehicleSafetyHandoverRecord) => void;
  vehicles: VehicleRecord[];
  initialRecord?: VehicleSafetyHandoverRecord | null;
  defaultVehicleId?: string;
  templates?: VehicleSafetyItemTemplate[];
}

export const SafetyHandoverModal: React.FC<SafetyHandoverModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicles,
  initialRecord,
  defaultVehicleId,
  templates
}) => {
  if (!isOpen) return null;

  const activeTemplates = templates && templates.length > 0 ? templates : VEHICLE_SAFETY_ITEMS_TEMPLATE;

  // Selected Vehicle
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    if (initialRecord) return initialRecord.vehicleId;
    if (defaultVehicleId) return defaultVehicleId;
    return vehicles[0]?.id || "";
  });

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Document Fields
  const [documentNumber, setDocumentNumber] = useState<string>(() => {
    if (initialRecord?.documentNumber) return initialRecord.documentNumber;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `SFT-2026-${randomSuffix}`;
  });

  const [handoverDate, setHandoverDate] = useState<string>(() => {
    return initialRecord?.handoverDate || new Date().toISOString().split("T")[0];
  });

  const [driverName, setDriverName] = useState<string>(() => {
    return initialRecord?.driverName || activeVehicle?.driverName || "";
  });

  const [driverEmployeeId, setDriverEmployeeId] = useState<string>(() => {
    return initialRecord?.driverEmployeeId || "";
  });

  const [driverPhone, setDriverPhone] = useState<string>(() => {
    return initialRecord?.driverPhone || activeVehicle?.driverPhone || "";
  });

  const [currentMileage, setCurrentMileage] = useState<number>(() => {
    return initialRecord?.currentMileage || activeVehicle?.currentMileage || 0;
  });

  const [department, setDepartment] = useState<string>(() => {
    return initialRecord?.department || activeVehicle?.department || "แผนกขนส่งสินค้า";
  });

  const [issuedBy, setIssuedBy] = useState<string>(() => {
    return initialRecord?.issuedBy || "กมลวรรณ ชัยพร (จป.วิชาชีพ)";
  });

  const [issuedByRole, setIssuedByRole] = useState<string>(() => {
    return initialRecord?.issuedByRole || "เจ้าหน้าที่ความปลอดภัยในการทำงาน (จป.)";
  });

  const [handoverReason, setHandoverReason] = useState<VehicleSafetyHandoverRecord["handoverReason"]>(() => {
    return initialRecord?.handoverReason || "annual_renewal";
  });

  const [notes, setNotes] = useState<string>(() => {
    return initialRecord?.notes || "";
  });

  // Items State (10 items)
  const [items, setItems] = useState<HandoverItemDetail[]>(() => {
    if (initialRecord?.items && initialRecord.items.length > 0) {
      return initialRecord.items;
    }

    const vType = activeVehicle?.vehicleType;
    const isTractor = vType === "tractor_6w" || vType === "tractor_10w";
    const isPickup = vType === "pickup_box" || vType === "pickup" || vType === "jumbo_4w";

    return activeTemplates.map((tpl) => {
      let isApplicable = true;
      if (isTractor) {
        isApplicable = tpl.vehicleTypes.tractor;
      } else if (isPickup) {
        isApplicable = tpl.vehicleTypes.pickup;
      } else {
        isApplicable = tpl.vehicleTypes.sixTenWheel;
      }

      return {
        templateId: tpl.id,
        itemCode: tpl.itemCode,
        nameTh: tpl.nameTh,
        quantity: isApplicable ? tpl.standardQty : 0,
        unit: tpl.unit,
        status: isApplicable ? "received" : "not_applicable",
        serialOrAssetTag: isApplicable ? `${tpl.itemCode}-${activeVehicle?.licensePlate || "TNB"}` : "",
        conditionNote: isApplicable ? "สภาพสมบูรณ์พร้อมใช้งาน" : "ไม่เข้าข่ายชนิดรถ",
        estimatedValueBaht: tpl.estimatedValueBaht
      };
    });
  });

  // When selected vehicle changes, auto update driver and vehicle items
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (targetVeh) {
      if (!initialRecord) {
        setDriverName(targetVeh.driverName || "");
        setDriverPhone(targetVeh.driverPhone || "");
        setCurrentMileage(targetVeh.currentMileage || 0);
        setDepartment(targetVeh.department || "แผนกขนส่งสินค้า");

        const targetType = targetVeh.vehicleType;
        const isTractor = targetType === "tractor_6w" || targetType === "tractor_10w";
        const isPickup = targetType === "pickup_box" || targetType === "pickup" || targetType === "jumbo_4w";

        setItems(
          activeTemplates.map((tpl) => {
            let isApplicable = true;
            if (isTractor) {
              isApplicable = tpl.vehicleTypes.tractor;
            } else if (isPickup) {
              isApplicable = tpl.vehicleTypes.pickup;
            } else {
              isApplicable = tpl.vehicleTypes.sixTenWheel;
            }

            return {
              templateId: tpl.id,
              itemCode: tpl.itemCode,
              nameTh: tpl.nameTh,
              quantity: isApplicable ? tpl.standardQty : 0,
              unit: tpl.unit,
              status: isApplicable ? "received" : "not_applicable",
              serialOrAssetTag: isApplicable ? `${tpl.itemCode}-${targetVeh.licensePlate}` : "",
              conditionNote: isApplicable ? "สภาพสมบูรณ์พร้อมใช้งาน" : "ไม่เข้าข่ายชนิดรถ",
              estimatedValueBaht: tpl.estimatedValueBaht
            };
          })
        );
      }
    }
  };

  // Liability Clause & Acceptance
  const [liabilityAccepted, setLiabilityAccepted] = useState<boolean>(() => {
    return initialRecord ? initialRecord.liabilityAgreementAccepted : true;
  });

  // Uploaded Signed Document
  const [uploadedDoc, setUploadedDoc] = useState<SignedDocumentUpload | undefined>(() => {
    return initialRecord?.signedDocumentUpload;
  });

  // Signature Canvases
  const driverCanvasRef = useRef<HTMLCanvasElement>(null);
  const officerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDriverSigning, setIsDriverSigning] = useState(false);
  const [isOfficerSigning, setIsOfficerSigning] = useState(false);
  const [hasDriverSigned, setHasDriverSigned] = useState(!!initialRecord?.driverSignatureDataUrl);
  const [hasOfficerSigned, setHasOfficerSigned] = useState(!!initialRecord?.officerSignatureDataUrl);

  // Initialize Canvas with initial signature if exists
  useEffect(() => {
    if (initialRecord?.driverSignatureDataUrl && driverCanvasRef.current) {
      const ctx = driverCanvasRef.current.getContext("2d");
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialRecord.driverSignatureDataUrl;
    }
    if (initialRecord?.officerSignatureDataUrl && officerCanvasRef.current) {
      const ctx = officerCanvasRef.current.getContext("2d");
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialRecord.officerSignatureDataUrl;
    }
  }, [initialRecord]);

  // Drawing Canvas Handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    type: "driver" | "officer"
  ) => {
    const canvas = type === "driver" ? driverCanvasRef.current : officerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = type === "driver" ? "#1D4ED8" : "#047857";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (type === "driver") setIsDriverSigning(true);
    else setIsOfficerSigning(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    type: "driver" | "officer"
  ) => {
    const isSigning = type === "driver" ? isDriverSigning : isOfficerSigning;
    if (!isSigning) return;
    const canvas = type === "driver" ? driverCanvasRef.current : officerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    if (type === "driver") setHasDriverSigned(true);
    else setHasOfficerSigned(true);
  };

  const stopDrawing = (type: "driver" | "officer") => {
    if (type === "driver") setIsDriverSigning(false);
    else setIsOfficerSigning(false);
  };

  const clearSignature = (type: "driver" | "officer") => {
    const canvas = type === "driver" ? driverCanvasRef.current : officerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (type === "driver") setHasDriverSigned(false);
    else setHasOfficerSigned(false);
  };

  // File Upload Handler (PDF or Image)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedDoc({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: issuedBy || "ผู้ดูแลระบบ",
        notes: `อัปโหลดเอกสารเซ็นรับของรถ ${activeVehicle?.licensePlate || ""}`
      });
    };
    reader.readAsDataURL(file);
  };

  // Update item field
  const handleItemChange = (index: number, patch: Partial<HandoverItemDetail>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  // Submit & Save
  const handleSave = () => {
    if (!activeVehicle) {
      alert("กรุณาเลือกรถที่ต้องการออกใบเซ็นรับ");
      return;
    }
    if (!driverName.trim()) {
      alert("กรุณาระบุชื่อพนักงานขับรถผู้รับมอบ");
      return;
    }
    if (!liabilityAccepted) {
      alert("พนักงานขับรถต้องยินยอมรับผิดชอบชดใช้ค่าเสียหายกรณีอุปกรณ์สูญหาย เพื่อบันทึกใบเซ็นรับ");
      return;
    }

    const driverSig = hasDriverSigned ? driverCanvasRef.current?.toDataURL() : initialRecord?.driverSignatureDataUrl;
    const officerSig = hasOfficerSigned ? officerCanvasRef.current?.toDataURL() : initialRecord?.officerSignatureDataUrl;

    const record: VehicleSafetyHandoverRecord = {
      id: initialRecord?.id || `sft-rec-${Date.now()}`,
      documentNumber,
      vehicleId: activeVehicle.id,
      licensePlate: activeVehicle.licensePlate,
      vehicleType: activeVehicle.vehicleType,
      vehicleBrand: activeVehicle.vehicleBrand || activeVehicle.brand || "",
      vehicleModel: activeVehicle.vehicleModel || activeVehicle.model || "",
      department,
      driverName,
      driverEmployeeId,
      driverPhone,
      handoverDate,
      currentMileage,
      issuedBy,
      issuedByRole,
      handoverReason,
      status: "active",
      items,
      liabilityAgreementAccepted: liabilityAccepted,
      liabilityClauseText: DEFAULT_SAFETY_LIABILITY_CLAUSE,
      driverSignatureDataUrl: driverSig,
      officerSignatureDataUrl: officerSig,
      managerSignatureDataUrl: initialRecord?.managerSignatureDataUrl,
      signedDocumentUpload: uploadedDoc,
      notes,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(record);
    onClose();
  };

  const totalValue = items
    .filter((i) => i.status === "received")
    .reduce((sum, i) => sum + i.estimatedValueBaht * (i.quantity || 1), 0);

  const receivedCount = items.filter((i) => i.status === "received").length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800/60 rounded-xl border border-blue-700/50">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{initialRecord ? "แก้ไขใบเซ็นรับมอบอุปกรณ์เซฟตี้" : "ออกใบเซ็นรับมอบอุปกรณ์เซฟตี้ติดรถ"}</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 bg-blue-700/60 rounded text-blue-200">
                  {documentNumber}
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                แบบฟอร์ม TNB-SHE-FRM-012 • สัญญาความรับผิดชอบและส่งมอบอุปกรณ์ประจำรถ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
          
          {/* Section 1: Vehicle & Driver Information */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>1. ข้อมูลยานพาหนะและพนักงานขับรถ (ผู้รับมอบ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Select Vehicle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลือกรถในสารระบบ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.brand} {v.model || ""} ({v.department || "กองยาน"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อพนักงานขับรถ (ผู้รับมอบ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="เช่น นายสมชาย รักษาดี"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Driver Employee ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสพนักงาน
                </label>
                <input
                  type="text"
                  value={driverEmployeeId}
                  onChange={(e) => setDriverEmployeeId(e.target.value)}
                  placeholder="เช่น DRV-1025"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Driver Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Handover Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันที่รับมอบ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Current Mileage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขไมล์ขณะส่งมอบ (กม.)
                </label>
                <input
                  type="number"
                  value={currentMileage || ""}
                  onChange={(e) => setCurrentMileage(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              {/* Handover Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สาเหตุการส่งมอบ
                </label>
                <select
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="annual_renewal">รอบตรวจรับประจำปี / ครบรอบ</option>
                  <option value="new_driver">เปลี่ยนพนักงานขับรถคนใหม่</option>
                  <option value="new_vehicle">รับมอบรถใหม่เข้าประจำการ</option>
                  <option value="replace_lost">เบิกทดแทนของเดิมที่สูญหาย/ชำรุด</option>
                  <option value="audit">สุ่มตรวจนับประจำไตรมาส (จป.)</option>
                </select>
              </div>

              {/* Issued By (จป.) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ผู้ส่งมอบ / เจ้าหน้าที่ความปลอดภัย
                </label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Inspection & Handover Checklist (10 items with pictures) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. รายการตรวจเช็คและส่งมอบอุปกรณ์เซฟตี้ ({items.length} รายการ) (มีรูปตัวอย่าง)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  ตรวจรับแล้ว: {receivedCount} / {items.length} รายการ
                </span>
                <span className="text-slate-600 font-mono">
                  มูลค่ารวม: {totalValue.toLocaleString()} บาท
                </span>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <th className="py-2.5 px-2 text-center w-10">ลำดับ</th>
                    <th className="py-2.5 px-2 text-center w-20">รูปตัวอย่าง</th>
                    <th className="py-2.5 px-3 min-w-[140px]">ชื่ออุปกรณ์</th>
                    <th className="py-2.5 px-2 text-center w-16">จำนวน</th>
                    <th className="py-2.5 px-3 min-w-[150px]">สถานะการรับมอบ</th>
                    <th className="py-2.5 px-3 min-w-[140px]">รหัสทรัพย์สิน / Serial</th>
                    <th className="py-2.5 px-3 min-w-[160px]">หมายเหตุสภาพ</th>
                    <th className="py-2.5 px-2 text-right min-w-[110px]" title="คลิกเพื่อแก้ไขราคาประเมินชดใช้สำหรับรายการนี้ได้">
                      มูลค่าชดใช้ ✏️
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const itemTemplate = activeTemplates.find((t) => t.id === item.templateId || t.itemCode === item.itemCode);
                    return (
                      <tr 
                        key={item.templateId}
                        className={`hover:bg-slate-50 transition-colors ${
                          item.status === "received" ? "bg-emerald-50/20" : item.status === "missing" ? "bg-rose-50/40" : ""
                        }`}
                      >
                        <td className="py-2 px-2 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Photo preview */}
                        <td className="py-1.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                            <SafetyItemSvgIcon itemCode={item.itemCode} imageUrl={itemTemplate?.imageUrl} className="w-10 h-10 object-contain" />
                          </div>
                        </td>

                      {/* Name */}
                      <td className="py-2 px-3 font-bold text-slate-900">
                        <div>{item.nameTh}</div>
                        <div className="text-[10px] font-mono text-slate-500">{item.itemCode}</div>
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, { quantity: Number(e.target.value) })}
                          className="w-12 text-center p-1 border border-slate-300 rounded font-bold"
                        />
                        <div className="text-[10px] text-slate-400">{item.unit}</div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleItemChange(idx, { status: e.target.value as any })}
                          className={`w-full p-1.5 rounded-md text-xs font-bold border ${
                            item.status === "received"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : item.status === "not_applicable"
                              ? "bg-slate-100 text-slate-600 border-slate-300"
                              : item.status === "missing"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="received">✅ ได้รับครบถ้วนปกติ</option>
                          <option value="not_applicable">➖ ไม่ต้องมีประจำรถ</option>
                          <option value="pending">⏳ ยังไม่ได้รับ/รอของ</option>
                          <option value="missing">❌ สูญหาย (ต้องชดใช้)</option>
                          <option value="damaged">⚠️ ชำรุด (ต้องเปลี่ยน)</option>
                        </select>
                      </td>

                      {/* Serial / Asset Tag */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.serialOrAssetTag || ""}
                          onChange={(e) => handleItemChange(idx, { serialOrAssetTag: e.target.value })}
                          placeholder="รหัส เช่น CHOCK-01"
                          className="w-full p-1 text-xs border border-slate-200 rounded font-mono"
                        />
                      </td>

                      {/* Condition Note */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.conditionNote || ""}
                          onChange={(e) => handleItemChange(idx, { conditionNote: e.target.value })}
                          placeholder="เช่น ใช้งานได้ดี"
                          className="w-full p-1 text-xs border border-slate-200 rounded"
                        />
                      </td>

                      {/* Value (Editable compensation price) */}
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min={0}
                            step={10}
                            value={item.estimatedValueBaht}
                            onChange={(e) => handleItemChange(idx, { estimatedValueBaht: Math.max(0, Number(e.target.value)) })}
                            className="w-20 text-right p-1 text-xs border border-slate-300 rounded font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            title="แก้ไขราคาประเมินชดใช้สำหรับรายการนี้"
                          />
                          <span className="text-slate-400 text-[10px]">฿</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Liability Terms & Responsibility Agreement (ข้อตกลงรับผิดชอบชดใช้) */}
          <div className="bg-amber-50 rounded-xl border-2 border-amber-300 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>3. เงื่อนไขและข้อตกลงความรับผิดชอบกรณีสูญหาย (Liability & Compensation Clause)</span>
            </div>

            <div className="bg-white/80 p-3.5 rounded-lg border border-amber-200 text-xs text-slate-800 leading-relaxed font-serif">
              "{DEFAULT_SAFETY_LIABILITY_CLAUSE}"
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={liabilityAccepted}
                  onChange={(e) => setLiabilityAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-amber-950">
                  ข้าพเจ้า (พนักงานขับรถผู้รับมอบ) ได้ตรวจสอบรายการอุปกรณ์ทั้งหมด และยินยอมผูกพันตามข้อตกลงความรับผิดชอบชดใช้ค่าเสียหายหากเกิดการสูญหายตามข้อกำหนดข้างต้นทุกประการ
                  <span className="text-rose-600 ml-1">* (จำเป็นต้องยอมรับ)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Digital Signatures (เซ็นสดบนจอ) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>4. ลายเซ็นดิจิทัล (เซ็นสดบนหน้าจอโทรศัพท์/แท็บเล็ต/เมาส์)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver Signature */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>ลายเซ็นพนักงานขับรถ (ผู้รับมอบ):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => clearSignature("driver")}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ล้างลายเซ็น</span>
                  </button>
                </div>

                <div className="bg-white border-2 border-dashed border-blue-200 rounded-lg overflow-hidden touch-none relative">
                  <canvas
                    ref={driverCanvasRef}
                    width={400}
                    height={110}
                    className="w-full h-[110px] cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, "driver")}
                    onMouseMove={(e) => draw(e, "driver")}
                    onMouseUp={() => stopDrawing("driver")}
                    onMouseLeave={() => stopDrawing("driver")}
                    onTouchStart={(e) => startDrawing(e, "driver")}
                    onTouchMove={(e) => draw(e, "driver")}
                    onTouchEnd={() => stopDrawing("driver")}
                  />
                  {!hasDriverSigned && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                      ✏️ เซ็นชื่อผู้รับมอบตรงนี้ (ด้วยนิ้วหรือเมาส์)
                    </div>
                  )}
                </div>
                <div className="text-center text-[11px] font-bold text-slate-700">
                  ({driverName || "พนักงานขับรถ"})
                </div>
              </div>

              {/* Officer Signature */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ลายเซ็นเจ้าหน้าที่ส่งมอบ (จป. / หัวหน้าช่าง):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => clearSignature("officer")}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ล้างลายเซ็น</span>
                  </button>
                </div>

                <div className="bg-white border-2 border-dashed border-emerald-200 rounded-lg overflow-hidden touch-none relative">
                  <canvas
                    ref={officerCanvasRef}
                    width={400}
                    height={110}
                    className="w-full h-[110px] cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, "officer")}
                    onMouseMove={(e) => draw(e, "officer")}
                    onMouseUp={() => stopDrawing("officer")}
                    onMouseLeave={() => stopDrawing("officer")}
                    onTouchStart={(e) => startDrawing(e, "officer")}
                    onTouchMove={(e) => draw(e, "officer")}
                    onTouchEnd={() => stopDrawing("officer")}
                  />
                  {!hasOfficerSigned && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                      ✏️ เซ็นชื่อผู้ส่งมอบตรงนี้
                    </div>
                  )}
                </div>
                <div className="text-center text-[11px] font-bold text-slate-700">
                  ({issuedBy})
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Upload Signed Document or Photo Proof (อัปโหลดใบเซ็นรับ/คนเซ็นเข้าระบบ) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>5. อัปโหลดใบเซ็นรับตัวจริง / รูปถ่ายคนขับคู่กับอุปกรณ์ (Signed Document / Photo Proof)</span>
              </div>
              <span className="text-[11px] text-slate-500">รองรับ PDF, JPG, PNG</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploadedDoc ? (
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{uploadedDoc.fileName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{(uploadedDoc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>อัปโหลดเมื่อ: {new Date(uploadedDoc.uploadedAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploadedDoc.dataUrl.startsWith("data:image") && (
                    <a
                      href={uploadedDoc.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูรูป</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    เปลี่ยนไฟล์
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadedDoc(undefined)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบไฟล์แนบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl bg-slate-50/50 hover:bg-purple-50/30 transition-all cursor-pointer text-center space-y-2"
              >
                <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-700">
                  คลิกเพื่อเลือกไฟล์เอกสารที่เซ็นรับแล้ว หรือ ลากไฟล์มาวางที่นี่
                </div>
                <p className="text-[11px] text-slate-500">
                  (สามารถใช้รูปถ่ายจากกล้องมือถือที่พนักงานขับรถเซ็นชื่อบนกระดาษ หรือรูปถ่ายตอนส่งมอบอุปกรณ์ได้ทันที)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ระบบจะบันทึกเก็บประวัติและซิงค์ข้อมูลกับคลังยานพาหนะอัตโนมัติ</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกใบเซ็นรับมอบอุปกรณ์</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
