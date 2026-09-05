import React, { useState, useRef, useMemo } from "react";
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  Wrench, 
  Image as ImageIcon, 
  Trash2, 
  Loader2,
  FileText,
  ShieldCheck,
  Info,
  Plus,
  Layers,
  User,
  ListPlus,
  Gauge,
  Link2,
  TrendingUp,
  RotateCcw,
  Check,
  Search,
  History,
  Calendar,
  DollarSign,
  Star,
  CheckSquare,
  Square,
  Boxes,
  Clock,
  UserCheck
} from "lucide-react";
import { 
  RepairTicket, 
  RepairCategory, 
  Priority, 
  VehicleType, 
  AiDiagnosisResult, 
  RepairIssueItem, 
  BreakdownLocation, 
  VehicleRecord,
  RepairStatus,
  RepairItemPart,
  PostRepairCondition
} from "../types";
import { CATEGORIES_CONFIG, VEHICLE_TYPE_LABELS, TNB_DEPARTMENTS, getSubCategoryName, STATUS_CONFIG, POPULAR_VEHICLE_BRANDS, normalizeVehicleBrand } from "../data/categories";
import { BreakdownLocationPicker } from "./BreakdownLocationPicker";
import { TnbLogo } from "./TnbLogo";
import confetti from "canvas-confetti";

interface RepairRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: RepairTicket) => void;
  vehicles?: VehicleRecord[];
  initialVehicle?: VehicleRecord | null;
  initialIsBackdated?: boolean;
}

const MECHANIC_OPTIONS = [
  "ช่างวิชาญ (ช่างช่วงล่าง & เบรก)",
  "ช่างอนันต์ (ช่างระบบหล่อลื่น & ของเหลว)",
  "ช่างธีระพงษ์ (ช่างระบบไฟฟ้า & กล่อง ECU)",
  "ช่างประสิทธิ์ (ช่างเครื่องยนต์ & ไฮดรอลิก)",
  "ช่างสมเกียรติ (ช่างระบบปรับอากาศ & แอร์)",
  "ช่างมนตรี (ช่างระบบยาง & ตั้งศูนย์)",
  "ช่างสุรชัย (ช่างตัวถัง & สี 2K)",
  "ช่างประจำอู่ TNB",
  "อู่ภายนอก / ศูนย์บริการตรีเพชร ISUZU",
  "อู่ภายนอก / ศูนย์บริการ HINO",
  "อู่ภายนอก / ศูนย์บริการ SCANIA"
];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: "คราบน้ำมันซึมใต้ท้องรถ",
    url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "ดอกยางสึก / ตะปูตำ",
    url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "ไฟหน้า / แผงไฟสว่าง",
    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "ห้องเครื่องยนต์ / สายพาน",
    url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
  }
];

export const RepairRequestModal: React.FC<RepairRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitTicket,
  vehicles = [],
  initialVehicle = null,
  initialIsBackdated = false
}) => {
  // Mode State: Normal (Real-time) vs Backdated (Historical)
  const [isBackdatedMode, setIsBackdatedMode] = useState<boolean>(initialIsBackdated);

  // Sync mode when modal opens or initialIsBackdated changes
  React.useEffect(() => {
    if (isOpen) {
      setIsBackdatedMode(initialIsBackdated);
      if (initialVehicle) {
        setLicensePlate(initialVehicle.licensePlate);
        setProvince(initialVehicle.province || "กรุงเทพมหานคร");
        setVehicleBrand(normalizeVehicleBrand(initialVehicle.vehicleBrand));
        setVehicleModel(initialVehicle.vehicleModel);
        setVehicleType(initialVehicle.vehicleType);
        setCurrentMileage(String(initialVehicle.currentMileage));
        setDepartment(initialVehicle.department);
        if (initialVehicle.driverName) setRequesterName(initialVehicle.driverName);
        if (initialVehicle.driverId) setDriverId(initialVehicle.driverId);
      }
    }
  }, [isOpen, initialIsBackdated, initialVehicle]);

  const [licensePlate, setLicensePlate] = useState(initialVehicle?.licensePlate || "");
  const [province, setProvince] = useState(initialVehicle?.province || "กรุงเทพมหานคร");
  const [vehicleBrand, setVehicleBrand] = useState(initialVehicle ? normalizeVehicleBrand(initialVehicle.vehicleBrand) : "HINO");
  const [vehicleModel, setVehicleModel] = useState(initialVehicle?.vehicleModel || "");
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicle?.vehicleType || "tractor_6w");
  const [currentMileage, setCurrentMileage] = useState<string>(initialVehicle ? String(initialVehicle.currentMileage) : "65000");
  const [department, setDepartment] = useState(initialVehicle?.department || "ฝ่ายขนส่ง");
  const [requesterName, setRequesterName] = useState(initialVehicle?.driverName || "");
  const [driverId, setDriverId] = useState(initialVehicle?.driverId || "");
  const [category, setCategory] = useState<RepairCategory>("suspension");
  const [subCategoryId, setSubCategoryId] = useState<string>("sus-brakes");
  const [priority, setPriority] = useState<Priority>("medium");
  const [symptoms, setSymptoms] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  // Historical / Backdated Specific Form Fields
  const [customRequestDate, setCustomRequestDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  const [customTicketNumber, setCustomTicketNumber] = useState<string>("");
  const [customStatus, setCustomStatus] = useState<RepairStatus>("completed");
  const [customCompletionDate, setCustomCompletionDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  const [assignedMechanic, setAssignedMechanic] = useState<string>("ช่างวิชาญ (ช่างช่วงล่าง & เบรก)");
  const [historicalLaborCost, setHistoricalLaborCost] = useState<string>("500");
  const [historicalPartsCostManual, setHistoricalPartsCostManual] = useState<string>("0");
  const [historicalRating, setHistoricalRating] = useState<number>(5);
  const [historicalFeedbackComment, setHistoricalFeedbackComment] = useState<string>("ตรวจรับงานซ่อมเรียบร้อย รถพร้อมเข้าประจำการวิ่งงาน");
  const [historicalMechanicNotes, setHistoricalMechanicNotes] = useState<string>("ซ่อมบำรุงและทดสอบระบบเรียบร้อยตามมาตรฐานความปลอดภัย");
  
  // Granular historical parts list
  const [historicalParts, setHistoricalParts] = useState<RepairItemPart[]>([]);

  const [newPartName, setNewPartName] = useState("");
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(0);
  const [newPartCondition, setNewPartCondition] = useState<PostRepairCondition>("scrap");

  // Matched vehicle from TNB Master Registry
  const matchedVehicle = useMemo(() => {
    if (!licensePlate.trim()) return null;
    const cleanInput = licensePlate.trim().toLowerCase();
    return vehicles.find(v => v.licensePlate.trim().toLowerCase() === cleanInput) || null;
  }, [vehicles, licensePlate]);

  // Function to auto-fill & bind vehicle data
  const handleAutoFillVehicle = (veh: VehicleRecord) => {
    setLicensePlate(veh.licensePlate);
    setProvince(veh.province || "กรุงเทพมหานคร");
    setVehicleBrand(veh.vehicleBrand ? normalizeVehicleBrand(veh.vehicleBrand) : "HINO");
    setVehicleModel(veh.vehicleModel || "");
    setVehicleType(veh.vehicleType || "tractor_6w");
    setCurrentMileage(String(veh.currentMileage || 0));
    setDepartment(veh.department || "ฝ่ายขนส่ง");
    if (veh.driverName) setRequesterName(veh.driverName);
    if (veh.driverId) setDriverId(veh.driverId);
  };

  // Change license plate with instant matching & data binding
  const handleLicensePlateChange = (val: string) => {
    setLicensePlate(val);
    const cleanVal = val.trim().toLowerCase();
    const found = vehicles.find(v => v.licensePlate.trim().toLowerCase() === cleanVal);
    if (found) {
      handleAutoFillVehicle(found);
    }
  };

  // Quick Mileage adjustments
  const handleAddMileage = (amount: number) => {
    const current = Number(currentMileage) || 0;
    setCurrentMileage(String(current + amount));
  };

  const handleResetToBaselineMileage = () => {
    if (matchedVehicle) {
      setCurrentMileage(String(matchedVehicle.currentMileage));
    }
  };

  // Mileage difference compared to registered baseline
  const mileageDiff = useMemo(() => {
    if (!matchedVehicle) return null;
    const current = Number(currentMileage) || 0;
    return current - matchedVehicle.currentMileage;
  }, [matchedVehicle, currentMileage]);

  // Breakdown location state
  const [breakdownLocation, setBreakdownLocation] = useState<BreakdownLocation>({
    isEmergencyBreakdown: false,
    latitude: 13.5976,
    longitude: 100.7891,
    roadName: "",
    kilometerMarker: "",
    landmark: "",
    address: ""
  });

  // Multiple issues per ticket state
  const [issuesList, setIssuesList] = useState<RepairIssueItem[]>([
    {
      id: "issue-1",
      title: "",
      category: "suspension",
      subCategoryId: "sus-brakes",
      subCategoryName: "ระบบเบรก & จานเบรก & ผ้าเบรก",
      description: "",
      urgency: "medium",
      isResolved: false
    }
  ]);
  
  // AI Diagnosis State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Change category and default first sub-category
  const handleCategoryChange = (newCat: RepairCategory) => {
    setCategory(newCat);
    const firstSub = CATEGORIES_CONFIG[newCat]?.subCategories?.[0];
    if (firstSub) {
      setSubCategoryId(firstSub.id);
    } else {
      setSubCategoryId("");
    }
  };

  // Add issue item
  const handleAddIssue = () => {
    const defaultSub = CATEGORIES_CONFIG[category]?.subCategories?.[0];
    const newIssue: RepairIssueItem = {
      id: `issue-${Date.now()}`,
      title: "",
      category: category,
      subCategoryId: defaultSub ? defaultSub.id : undefined,
      subCategoryName: defaultSub ? defaultSub.nameTh : undefined,
      description: "",
      urgency: "medium",
      isResolved: false
    };
    setIssuesList(prev => [...prev, newIssue]);
  };

  // Remove issue item
  const handleRemoveIssue = (index: number) => {
    if (issuesList.length <= 1) return;
    setIssuesList(prev => prev.filter((_, i) => i !== index));
  };

  // Update specific issue item
  const handleUpdateIssue = (index: number, field: keyof RepairIssueItem, value: any) => {
    setIssuesList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-update subCategoryName if subCategoryId changed
      if (field === "subCategoryId") {
        const catObj = CATEGORIES_CONFIG[updated[index].category || category];
        const subObj = catObj?.subCategories.find(s => s.id === value);
        updated[index].subCategoryName = subObj ? subObj.nameTh : value;
      }
      return updated;
    });
  };

  // Handle file uploads (converts to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addPresetImage = (url: string) => {
    if (!attachedImages.includes(url)) {
      setAttachedImages((prev) => [...prev, url]);
    }
  };

  // AI Diagnostic Call
  const handleRunAiDiagnosis = async () => {
    const allSymptomsText = symptoms.trim() || issuesList.map((iss, i) => `ปัญหาที่ ${i+1}: ${iss.title} (${iss.description})`).join(" \n ");

    if (!allSymptomsText.trim() && attachedImages.length === 0) {
      alert("กรุณาระบุอาการเสียหรือแนบรูปภาพก่อนให้ AI วิเคราะห์");
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisError(null);

    try {
      const response = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: `${CATEGORIES_CONFIG[category].nameTh} - ${getSubCategoryName(category, subCategoryId)}`,
          vehicleInfo: `${vehicleBrand} ${vehicleModel} (ทะเบียน ${licensePlate} ${province}, ไมล์ ${currentMileage} กม., ประเภท ${vehicleType})`,
          symptoms: allSymptomsText,
          images: attachedImages
        })
      });

      const data = await response.json();
      if (data.success && data.diagnosis) {
        setAiResult(data.diagnosis);
      } else {
        throw new Error(data.error || "ไม่สามารถวิเคราะห์อาการได้");
      }
    } catch (err: any) {
      console.error("AI Diagnose error:", err);
      setDiagnosisError(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Granular Historical Parts Management
  const handleAddHistoricalPart = () => {
    if (!newPartName.trim()) {
      alert("กรุณาระบุชื่ออะไหล่");
      return;
    }
    const qty = Math.max(1, newPartQty);
    const price = Math.max(0, newPartPrice);
    const item: RepairItemPart = {
      id: `P-HIST-${Date.now()}-${historicalParts.length + 1}`,
      name: newPartName.trim(),
      quantity: qty,
      unitPrice: price,
      total: qty * price,
      postRepairCondition: newPartCondition
    };
    setHistoricalParts(prev => [...prev, item]);
    setNewPartName("");
    setNewPartQty(1);
    setNewPartPrice(0);
    setNewPartCondition("scrap");
  };

  const handleRemoveHistoricalPart = (id: string) => {
    setHistoricalParts(prev => prev.filter(p => p.id !== id));
  };

  // Calculated totals for backdated entry
  const totalItemizedPartsCost = useMemo(() => {
    return historicalParts.reduce((sum, p) => sum + (p.total || 0), 0);
  }, [historicalParts]);

  const effectiveHistoricalPartsCost = useMemo(() => {
    if (historicalParts.length > 0) return totalItemizedPartsCost;
    return Number(historicalPartsCostManual) || 0;
  }, [historicalParts, totalItemizedPartsCost, historicalPartsCostManual]);

  const effectiveHistoricalLaborCost = useMemo(() => {
    return Number(historicalLaborCost) || 0;
  }, [historicalLaborCost]);

  const effectiveHistoricalTotalCost = useMemo(() => {
    return effectiveHistoricalPartsCost + effectiveHistoricalLaborCost;
  }, [effectiveHistoricalPartsCost, effectiveHistoricalLaborCost]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!requesterName.trim()) {
      alert("กรุณาระบุชื่อผู้แจ้งซ่อม (ขอร้องระบุชื่อผู้ติดต่อชัดเจน)");
      return;
    }
    if (!licensePlate.trim()) {
      alert("กรุณากรอกทะเบียนรถยนต์");
      return;
    }

    // Build consolidated symptoms text from multiple issues if main symptom is empty
    let finalSymptoms = symptoms.trim();
    const validIssues = issuesList.filter(iss => iss.title.trim() || iss.description.trim());

    if (!finalSymptoms) {
      if (validIssues.length > 0) {
        finalSymptoms = validIssues.map((iss, i) => `${i + 1}. [${iss.subCategoryName || "ทั่วไป"}] ${iss.title}: ${iss.description}`).join(" | ");
      } else {
        alert("กรุณาระบุรายละเอียดอาการเสียหรือเพิ่มรายการปัญหาอย่างน้อย 1 รายการ");
        return;
      }
    }

    const currentSubCatObj = CATEGORIES_CONFIG[category]?.subCategories.find(s => s.id === subCategoryId);
    const subCatName = currentSubCatObj ? currentSubCatObj.nameTh : undefined;

    let timestamp = new Date().toISOString();
    let actualCompDate: string | undefined = undefined;

    if (isBackdatedMode) {
      if (customRequestDate) {
        const reqD = new Date(customRequestDate);
        if (!isNaN(reqD.getTime())) {
          reqD.setHours(9, 0, 0, 0);
          timestamp = reqD.toISOString();
        }
      }
      if (customCompletionDate) {
        const compD = new Date(customCompletionDate);
        if (!isNaN(compD.getTime())) {
          compD.setHours(17, 0, 0, 0);
          actualCompDate = compD.toISOString();
        }
      } else if (customStatus === "completed") {
        actualCompDate = timestamp;
      }
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const yearOfRecord = new Date(timestamp).getFullYear();
    const monthOfRecord = new Date(timestamp).getMonth() + 1;
    const monthStr = monthOfRecord < 10 ? `0${monthOfRecord}` : `${monthOfRecord}`;
    
    const ticketId = isBackdatedMode 
      ? `TK-HIST-${yearOfRecord}${monthStr}-${randomNum}`
      : `TK-${yearOfRecord}${monthStr}-${randomNum}`;
    
    const ticketNumber = (isBackdatedMode && customTicketNumber.trim())
      ? customTicketNumber.trim().toUpperCase()
      : `REP-${yearOfRecord}-${monthStr}${randomNum.toString().slice(0, 2)}`;

    // Build parts list
    let finalPartsList: RepairItemPart[] = [];
    if (isBackdatedMode) {
      if (historicalParts.length > 0) {
        finalPartsList = [...historicalParts];
      } else if (effectiveHistoricalPartsCost > 0) {
        finalPartsList = [{
          id: `P-HIST-${Date.now()}`,
          name: `รายการอะไหล่และอุปกรณ์งานซ่อมหมวด ${CATEGORIES_CONFIG[category]?.nameTh || category}`,
          quantity: 1,
          unitPrice: effectiveHistoricalPartsCost,
          total: effectiveHistoricalPartsCost,
          postRepairCondition: "scrap"
        }];
      }
    } else {
      finalPartsList = aiResult?.suggestedParts?.map((p, idx) => ({
        id: `P-SUGG-${idx + 1}`,
        name: p.name,
        quantity: 1,
        unitPrice: p.estimatedCost,
        total: p.estimatedCost
      })) || [];
    }

    const finalPartsCost = isBackdatedMode 
      ? effectiveHistoricalPartsCost 
      : (aiResult ? (aiResult.estimatedTotalCost - aiResult.estimatedLaborCost) : 0);
    
    const finalLaborCost = isBackdatedMode 
      ? effectiveHistoricalLaborCost 
      : (aiResult ? aiResult.estimatedLaborCost : 0);
    
    const finalTotalCost = isBackdatedMode 
      ? effectiveHistoricalTotalCost 
      : (aiResult ? aiResult.estimatedTotalCost : 0);

    const finalStatus: RepairStatus = isBackdatedMode ? customStatus : "pending";

    const newTicket: RepairTicket = {
      id: ticketId,
      ticketNumber: ticketNumber,
      createdAt: timestamp,
      updatedAt: actualCompDate || timestamp,
      licensePlate: licensePlate.trim().toUpperCase(),
      province: province,
      vehicleBrand: vehicleBrand,
      vehicleModel: vehicleModel.trim() || `${vehicleBrand} ทั่วไป`,
      vehicleType: vehicleType,
      currentMileage: Number(currentMileage) || 0,
      department: department,
      requesterName: requesterName.trim(),
      requesterPhone: "",
      breakdownLocation: breakdownLocation.isEmergencyBreakdown ? breakdownLocation : undefined,
      category: category,
      subCategoryId: subCategoryId || undefined,
      subCategoryName: subCatName,
      priority: breakdownLocation.isEmergencyBreakdown ? "urgent" : priority,
      symptoms: finalSymptoms,
      issues: validIssues.length > 0 ? validIssues.map(iss => ({
        ...iss,
        title: iss.title.trim() || "รายการแจ้งซ่อมย่อย",
        description: iss.description.trim() || finalSymptoms
      })) : undefined,
      attachedImages: attachedImages,
      status: finalStatus,
      assignedMechanic: isBackdatedMode ? assignedMechanic : undefined,
      actualCompletionDate: actualCompDate,
      partsList: finalPartsList,
      partsCost: finalPartsCost,
      laborCost: finalLaborCost,
      totalCost: finalTotalCost,
      mechanicNotes: (isBackdatedMode && historicalMechanicNotes.trim()) ? historicalMechanicNotes.trim() : undefined,
      feedback: (isBackdatedMode && historicalRating > 0) ? {
        id: `fb-${Date.now()}`,
        overallRating: historicalRating,
        technicianRating: historicalRating,
        serviceQualityRating: historicalRating,
        timelinessRating: historicalRating,
        comment: historicalFeedbackComment || "บันทึกผลการประเมินงานซ่อมย้อนหลัง",
        createdAt: actualCompDate || timestamp
      } : undefined,
      aiDiagnosis: !isBackdatedMode ? (aiResult || undefined) : undefined,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: timestamp,
          status: finalStatus,
          note: isBackdatedMode
            ? `📜 บันทึกข้อมูลใบแจ้งซ่อมย้อนหลัง (Historical Record) วันที่ ${new Date(timestamp).toLocaleDateString("th-TH")}${finalStatus === "completed" ? " - สถานะ: ซ่อมเสร็จสมบูรณ์" : ""}`
            : `สร้างใบแจ้งซ่อม TNB Logistics หมวดหมู่: ${CATEGORIES_CONFIG[category].nameTh} ${subCatName ? `(${subCatName})` : ""}${breakdownLocation.isEmergencyBreakdown ? " [🚨 แจ้งพิกัดรถเสียฉุกเฉินนอกสถานที่]" : ""}`,
          updatedBy: requesterName.trim()
        }
      ]
    };

    onSubmitTicket(newTicket);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const activeCategoryObj = CATEGORIES_CONFIG[category];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <TnbLogo variant="blue" size="sm" showSubtitle={false} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                แบบฟอร์มแจ้งซ่อมยานพาหนะ TNB Logistics
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                  Work Order Request
                </span>
              </h2>
              <p className="text-xs text-slate-400">กรอกข้อมูลผู้แจ้ง เลือกรถยนต์ ระบุอาการเสีย และปักหมุดพิกัดแผนที่กรณีฉุกเฉิน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-new-modal"
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-200/90 rounded-2xl max-w-xl mx-auto border border-slate-300 shadow-inner">
            <button
              type="button"
              onClick={() => setIsBackdatedMode(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                !isBackdatedMode
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
            >
              <span>⚡ แจ้งซ่อมปกติ (บันทึกเวลาปัจจุบัน)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBackdatedMode(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                isBackdatedMode
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
            >
              <History className="w-4 h-4 text-amber-950" />
              <span>📜 ลงข้อมูลย้อนหลัง (Backdated)</span>
            </button>
          </div>

          {/* Historical Record Banner (When in Backdated Mode) */}
          {isBackdatedMode && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-amber-300/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                    <History className="w-5 h-5 font-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                      บันทึกข้อมูลใบแจ้งซ่อมย้อนหลัง (Historical Work Order)
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full border border-amber-300">
                        สำหรับลงประวัติเก่า / อู่นอก
                      </span>
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      ระบุวันที่แจ้งซ่อมในอดีต เลขที่ใบสั่งซ่อมเดิม สถานะการปิดงาน ค่าอะไหล่ ค่าแรง และประวัติการซ่อมบำรุง
                    </p>
                  </div>
                </div>
              </div>

              {/* Historical Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    วันที่แจ้งซ่อมในอดีต <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={customRequestDate}
                    onChange={(e) => {
                      setCustomRequestDate(e.target.value);
                      if (!customCompletionDate || customCompletionDate < e.target.value) {
                        setCustomCompletionDate(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold text-slate-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    เลขที่ใบสั่งซ่อมเดิม / เอกสารอ้างอิง
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น REP-2025-0812 หรือ WO-68-005"
                    value={customTicketNumber}
                    onChange={(e) => setCustomTicketNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-semibold text-slate-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    สถานะงานซ่อมเมื่อบันทึก
                  </label>
                  <select
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value as RepairStatus)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold text-slate-900 shadow-xs"
                  >
                    <option value="completed">✅ ซ่อมเสร็จสมบูรณ์แล้ว (Completed)</option>
                    <option value="in_progress">🔧 กำลังดำเนินการซ่อม (In Progress)</option>
                    <option value="waiting_parts">📦 รอเบิก/จัดซื้ออะไหล่ (Waiting Parts)</option>
                    <option value="inspecting">🔍 กำลังตรวจเช็คสภาพ (Inspecting)</option>
                    <option value="testing">🧪 ทดสอบระบบหลังซ่อม (Testing)</option>
                    <option value="cancelled">❌ ยกเลิกงานซ่อม (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    วันที่ซ่อมเสร็จจริง (ถ้ามี)
                  </label>
                  <input
                    type="date"
                    value={customCompletionDate}
                    onChange={(e) => setCustomCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              {/* Mechanic & Cost Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-700" />
                    ช่างผู้รับผิดชอบ / อู่ซ่อม
                  </label>
                  <select
                    value={assignedMechanic}
                    onChange={(e) => setAssignedMechanic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium text-slate-900 shadow-xs"
                  >
                    {MECHANIC_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                    ค่าแรงช่าง / ค่าบริการ (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={historicalLaborCost}
                    onChange={(e) => setHistoricalLaborCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono font-bold text-slate-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    ยอดรวมค่าใช้จ่ายทั้งหมด (คำนวณอัตโนมัติ)
                  </label>
                  <div className="px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl text-xs font-mono font-black text-amber-950 flex items-center justify-between shadow-xs">
                    <span>ยอดรวมสุทธิ:</span>
                    <span className="text-sm text-blue-900 font-bold">฿{effectiveHistoricalTotalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Granular Replaced Parts Section for Backdated Order */}
              <div className="bg-white/80 rounded-xl border border-amber-300/80 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    รายการอะไหล่ที่เปลี่ยนในงานซ่อมย้อนหลัง (บันทึกรายชิ้น หรือระบุยอดรวม)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    รวมค่าอะไหล่: <strong className="text-slate-900">฿{effectiveHistoricalPartsCost.toLocaleString()}</strong>
                  </span>
                </div>

                {/* Add new part row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="ชื่ออะไหล่ เช่น ชุดผ้าเบรกหน้า, ไดชาร์จ 24V"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="จำนวน"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      placeholder="ราคา/หน่วย"
                      value={newPartPrice || ""}
                      onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-right font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1.5">
                    <select
                      value={newPartCondition}
                      onChange={(e) => setNewPartCondition(e.target.value as PostRepairCondition)}
                      className="flex-1 px-2 py-1.5 text-[11px] bg-white border border-slate-300 rounded-lg"
                      title="สภาพอะไหล่ที่เปลี่ยนออก"
                    >
                      <option value="scrap">ชำรุดจำหน่ายซาก</option>
                      <option value="repairable">ซ่อมได้เวียนคลัง</option>
                      <option value="normal">สภาพปกติ</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddHistoricalPart}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      + เพิ่ม
                    </button>
                  </div>
                </div>

                {/* List of itemized parts */}
                {historicalParts.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {historicalParts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          <span className="text-slate-500">x{p.quantity}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {p.postRepairCondition === "repairable" ? "ซ่อมได้" : p.postRepairCondition === "normal" ? "ปกติ" : "จำหน่ายซาก"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-slate-900">฿{(p.total || 0).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHistoricalPart(p.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">หรือระบุยอดค่าอะไหล่รวมแบบรวดเร็ว (บาท):</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={historicalPartsCostManual}
                      onChange={(e) => setHistoricalPartsCostManual(e.target.value)}
                      placeholder="0"
                      className="w-36 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-right font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Feedback & Satisfaction Rating for Backdated Ticket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    คะแนนประเมินความพึงพอใจย้อนหลัง (1-5 ดาว)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setHistoricalRating(star)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          historicalRating >= star
                            ? "bg-amber-100 border-amber-400 text-amber-600"
                            : "bg-white border-slate-200 text-slate-300 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${historicalRating >= star ? "fill-amber-500" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-2">({historicalRating} ดาว)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    หมายเหตุการตรวจรับ / ข้อความช่าง
                  </label>
                  <input
                    type="text"
                    value={historicalMechanicNotes}
                    onChange={(e) => setHistoricalMechanicNotes(e.target.value)}
                    placeholder="เช่น ซ่อมบำรุงและทดสอบระบบเรียบร้อยตามมาตรฐาน"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Vehicle Auto-Fill Bar from TNB Master Registry */}
          {vehicles.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 rounded-2xl text-white shadow-md border border-blue-800 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-amber-400 p-1.5 rounded-lg text-slate-950 font-black text-xs flex items-center">
                    ⚡ ด่วน
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">เลือกทะเบียนรถจากสารระบบ TNB (Auto-Fill ทันที)</h4>
                    <p className="text-[10px] text-blue-200">ระบบจะดึงข้อมูลยี่ห้อ รุ่น แผนก คนขับ และเลขไมล์ให้อัตโนมัติใน 1 คลิก</p>
                  </div>
                </div>

                {/* Quick Select Dropdown */}
                <div className="w-full sm:w-72">
                  <select
                    id="select-quick-autofill-vehicle"
                    onChange={(e) => {
                      const found = vehicles.find(v => v.id === e.target.value);
                      if (found) handleAutoFillVehicle(found);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-blue-400/40 focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold"
                  >
                    <option value="">-- เลือกรถของบริษัท TNB --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.erpNo ? `[No. ${v.erpNo}] ` : ""}{v.licensePlate} ({v.vehicleBrand} {v.vehicleModel}) - {v.driverName || v.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Chips for First 4 vehicles */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                <span className="text-[10px] text-slate-400 shrink-0">เลือกรถยอดนิยม:</span>
                {vehicles.slice(0, 5).map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleAutoFillVehicle(v)}
                    className="px-2 py-0.5 rounded-md bg-blue-800/60 hover:bg-blue-600 border border-blue-500/40 text-[10px] font-bold text-blue-100 whitespace-nowrap transition-colors flex items-center space-x-1"
                  >
                    {v.erpNo && <span className="text-amber-300 font-mono">#{v.erpNo}</span>}
                    <span>{v.licensePlate}</span>
                    <span className="text-blue-300 font-normal">({v.vehicleBrand})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: ข้อมูลผู้แจ้งซ่อม / คนขับรถ */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                ข้อมูลผู้แจ้งซ่อม / พนักงานขับรถ TNB
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium border border-blue-100 flex items-center gap-1">
                <User className="w-3 h-3" /> ระบุชื่อผู้รับผิดชอบ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้แจ้งซ่อม / คนขับ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-requester-name"
                  required
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสพนักงาน / สังกัดสายรถ (ถ้ามี)
                </label>
                <input
                  type="text"
                  id="input-driver-id"
                  placeholder="เช่น TNB-DRV-088"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แผนก / ฝ่ายงานต้นสังกัด
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {TNB_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลยานพาหนะและการผูกข้อมูลเลขไมล์ (Vehicle Details & Mileage Binding) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>ข้อมูลยานพาหนะ & การผูกข้อมูลเลขไมล์ (Vehicle Information & Mileage Binding)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {matchedVehicle ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <Link2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ผูกข้อมูลกับระบบ TNB สำเร็จ (ไมล์บันทึกล่าสุด: {matchedVehicle.currentMileage.toLocaleString()} กม.)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs">
                  <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>พิมพ์หรือเลือกทะเบียนเพื่อดึงข้อมูลและเลขไมล์</span>
                </div>
              )}
            </div>

            {/* Quick Vehicle Selector inside Section 2 */}
            {vehicles.length > 0 && (
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-blue-600 text-white rounded-md">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">ดึงข้อมูลจากสารระบบ TNB (Auto-Bind):</span>
                    <span className="text-[11px] text-blue-700">เลือกทะเบียนเพื่อดึงยี่ห้อ รุ่น และผูกเลขไมล์เดิมอัตโนมัติ</span>
                  </div>
                </div>

                <div className="w-full sm:w-80">
                  <select
                    id="select-section2-vehicle-bind"
                    value={matchedVehicle?.id || ""}
                    onChange={(e) => {
                      const found = vehicles.find(v => v.id === e.target.value);
                      if (found) handleAutoFillVehicle(found);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white text-slate-900 rounded-lg border border-blue-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                  >
                    <option value="">-- เลือกจากรถในสารระบบ TNB ({vehicles.length} คัน) --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.erpNo ? `[No. ${v.erpNo}] ` : ""}{v.licensePlate} ({v.vehicleBrand} {v.vehicleModel}) - ไมล์ {v.currentMileage.toLocaleString()} กม. [{v.driverName || v.department}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* License Plate with Autocomplete datalist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>ทะเบียนรถ <span className="text-rose-500">*</span></span>
                  {matchedVehicle && (
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> No. {matchedVehicle.erpNo || matchedVehicle.id}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="input-license-plate"
                    required
                    list="tnb-license-plates"
                    placeholder="เช่น 1ฒข-4589"
                    value={licensePlate}
                    onChange={(e) => handleLicensePlateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold uppercase tracking-wide text-slate-900"
                  />
                  <datalist id="tnb-license-plates">
                    {vehicles.map(v => (
                      <option key={v.id} value={v.licensePlate}>
                        {v.erpNo ? `No. ${v.erpNo} | ` : ""}{v.licensePlate} - {v.vehicleBrand} {v.vehicleModel} ({v.currentMileage.toLocaleString()} กม.)
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จังหวัดป้ายทะเบียน
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                >
                  <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                  <option value="ชลบุรี">ชลบุรี</option>
                  <option value="ระยอง">ระยอง</option>
                  <option value="พระนครศรีอยุธยา">พระนครศรีอยุธยา</option>
                  <option value="สมุทรปราการ">สมุทรปราการ</option>
                  <option value="เชียงใหม่">เชียงใหม่</option>
                  <option value="ขอนแก่น">ขอนแก่น</option>
                  <option value="สงขลา">สงขลา</option>
                  <option value="นครราชสีมา">นครราชสีมา</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทรถ
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                >
                  <option value="tractor_6w">หัวลาก 6 ล้อ</option>
                  <option value="tractor_10w">หัวลาก 10 ล้อ</option>
                  <option value="trailer_2axle">หาง 2 เพลา</option>
                  <option value="trailer_3axle">หาง 3 เพลา</option>
                  <option value="box_truck_6w">6 ล้อตู้ทึบ</option>
                  <option value="jumbo_4w">4 ล้อจัมโบ้</option>
                  <option value="pickup_box">รถกระบะตู้</option>
                  <option value="sedan">รถเก๋ง</option>
                  <option value="forklift">รถโฟล์คลิฟท์</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>ยี่ห้อรถ (Brand) <span className="text-rose-500">*</span></span>
                  {matchedVehicle?.vehicleBrand && (
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3 text-blue-600" />
                      ดึงยี่ห้อ: {matchedVehicle.vehicleBrand}
                    </span>
                  )}
                </label>
                <div className="space-y-1.5">
                  <select
                    id="select-vehicle-brand"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 font-bold"
                  >
                    {POPULAR_VEHICLE_BRANDS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                    {vehicleBrand && !POPULAR_VEHICLE_BRANDS.some(b => b.value.toUpperCase() === vehicleBrand.toUpperCase() || b.value === vehicleBrand) && (
                      <option value={vehicleBrand}>{vehicleBrand} (จากฐานข้อมูล)</option>
                    )}
                  </select>

                  {vehicleBrand === "อื่นๆ" && (
                    <input
                      type="text"
                      placeholder="พิมพ์ระบุยี่ห้อรถ เช่น MAN, DAF, SANY, SINOTRUK"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setVehicleBrand(e.target.value.trim());
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รุ่นรถ (Model)
                </label>
                <input
                  type="text"
                  placeholder="เช่น Hilux Revo 2.8 D-Cab"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* Enhanced Mileage Odometer & Binding Control */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl sm:col-span-1 shadow-sm border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span>เลขไมล์ปัจจุบัน (กม.)</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  {matchedVehicle && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ไมล์เดิม: {matchedVehicle.currentMileage.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="input-current-mileage-bind"
                    required
                    placeholder="เช่น 75000"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    className="w-full px-3 py-2 text-base font-black font-mono bg-slate-800 text-amber-300 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none tracking-wider"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">กม.</span>
                </div>

                {/* Real-time Mileage Difference & Quick Increase Buttons */}
                <div className="mt-2.5 space-y-1.5">
                  {matchedVehicle && mileageDiff !== null && (
                    <div className="text-[11px] font-semibold flex items-center justify-between">
                      {mileageDiff > 0 ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{mileageDiff.toLocaleString()} กม. จากประวัติเดิม</span>
                        </span>
                      ) : mileageDiff === 0 ? (
                        <span className="text-slate-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>ตรงกับเลขไมล์ล่าสุดในสารระบบ</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ต่ำกว่าประวัติเดิม ({mileageDiff.toLocaleString()} กม.)</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick increment buttons */}
                  <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => handleAddMileage(100)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded border border-slate-700 transition-colors shrink-0"
                    >
                      +100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMileage(500)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded border border-slate-700 transition-colors shrink-0"
                    >
                      +500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMileage(1000)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded border border-slate-700 transition-colors shrink-0"
                    >
                      +1,000
                    </button>
                    {matchedVehicle && (
                      <button
                        type="button"
                        onClick={handleResetToBaselineMileage}
                        title="คืนค่าเป็นเลขไมล์เดิมจากระบบ"
                        className="px-2 py-0.5 bg-blue-900/60 hover:bg-blue-800 text-[10px] font-semibold text-blue-200 rounded border border-blue-700/50 transition-colors flex items-center gap-0.5 shrink-0"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>คืนค่า</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: แผนที่พิกัดรถเสียฉุกเฉิน (Emergency Breakdown Map & GPS) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <BreakdownLocationPicker 
              location={breakdownLocation}
              onChange={setBreakdownLocation}
            />
          </div>

          {/* Section 2: หมวดหมู่งานซ่อมหลัก & ประเภทย่อย (Category & Sub-Category) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                ประเภทหลัก & ประเภทย่อยของงานซ่อม
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-500">เลือกประเภทหลักแล้วระบุประเภทย่อย</span>
            </div>

            {/* Primary Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(CATEGORIES_CONFIG) as RepairCategory[]).map((catKey) => {
                const cat = CATEGORIES_CONFIG[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    id={`cat-select-${catKey}`}
                    onClick={() => handleCategoryChange(catKey)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{cat.nameTh}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Sub-Category Selection */}
            {activeCategoryObj?.subCategories && activeCategoryObj.subCategories.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    ประเภทย่อยของ [{activeCategoryObj.nameTh}]:
                  </span>
                  <span className="text-[11px] text-slate-500">เลือกรายการที่ตรงจุดที่สุด</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCategoryObj.subCategories.map((sub) => {
                    const isSubSelected = subCategoryId === sub.id;
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => setSubCategoryId(sub.id)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          isSubSelected
                            ? "border-blue-500 bg-blue-100/60 text-blue-900 font-semibold ring-1 ring-blue-500"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{sub.nameTh}</span>
                          {isSubSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-1 shrink-0" />}
                        </div>
                        {sub.description && (
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">{sub.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: รายการปัญหาที่แจ้ง (Multiple Issues per Ticket) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                  รายการปัญหาที่ต้องการแจ้งซ่อม (แจ้งได้หลายปัญหาพร้อมกัน)
                </label>
                <p className="text-xs text-slate-500">เพิ่มรายการปัญหาแยกแต่ละจุดเพื่อความชัดเจนในการจัดช่างและอะไหล่</p>
              </div>

              <button
                type="button"
                onClick={handleAddIssue}
                id="btn-add-multiple-issue"
                className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มปัญหาอีกข้อ
              </button>
            </div>

            {/* List of Issue Items */}
            <div className="space-y-3">
              {issuesList.map((issueItem, idx) => (
                <div 
                  key={issueItem.id} 
                  className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      ปัญหาข้อที่ {idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <select
                        value={issueItem.urgency || "medium"}
                        onChange={(e) => handleUpdateIssue(idx, "urgency", e.target.value)}
                        className="text-[11px] bg-white border border-slate-300 rounded px-2 py-0.5 font-medium"
                      >
                        <option value="critical">ฉุกเฉิน</option>
                        <option value="high">เร่งด่วน</option>
                        <option value="medium">ปานกลาง</option>
                        <option value="low">ทั่วไป</option>
                      </select>

                      {issuesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIssue(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                          title="ลบปัญหานี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="หัวข้อปัญหา เช่น เบรกหน้ามีเสียงดังเอี๊ยด, แอร์หลังไม่เย็น"
                        value={issueItem.title}
                        onChange={(e) => handleUpdateIssue(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <select
                        value={issueItem.subCategoryId || subCategoryId}
                        onChange={(e) => handleUpdateIssue(idx, "subCategoryId", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        {activeCategoryObj?.subCategories.map((s) => (
                          <option key={s.id} value={s.id}>{s.nameTh}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="อธิบายอาการอย่างละเอียดเพิ่มเติม เช่น ดังเฉพาะตอนเหยียบเบรกที่ความเร็ว 60+, เกิดขึ้นมาแล้ว 3 วัน..."
                    value={issueItem.description}
                    onChange={(e) => handleUpdateIssue(idx, "description", e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Quick Symptom Chips helper */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                คลิกเลือกอาการพบบ่อยในหมวดนี้เพื่อเพิ่มเป็นปัญหาใหม่ทันที:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCategoryObj?.commonSymptoms.map((symp, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setIssuesList(prev => [
                        ...prev,
                        {
                          id: `issue-${Date.now()}-${idx}`,
                          title: symp,
                          category: category,
                          subCategoryId: subCategoryId,
                          subCategoryName: getSubCategoryName(category, subCategoryId),
                          description: `ตรวจพบอาการ: ${symp}`,
                          urgency: "medium",
                          isResolved: false
                        }
                      ]);
                    }}
                    className="text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    + {symp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: ระดับความเร่งด่วนโดยรวม & รายละเอียดเพิ่มเติม */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                ความเร่งด่วนโดยรวม & ข้อความสรุป
              </label>

              {/* Priority Pills */}
              <div className="flex items-center space-x-1">
                {[
                  { id: "critical", label: "ฉุกเฉิน/วิ่งไม่ได้", color: "bg-rose-600 text-white" },
                  { id: "high", label: "เร่งด่วน", color: "bg-orange-500 text-white" },
                  { id: "medium", label: "ปานกลาง", color: "bg-amber-500 text-slate-950" },
                  { id: "low", label: "ทั่วไป", color: "bg-emerald-600 text-white" }
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id as Priority)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      priority === p.id 
                        ? `${p.color} ring-2 ring-slate-900 shadow-xs font-bold` 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              id="input-symptoms-description"
              placeholder="สรุปภาพรวมหรือข้อความเพิ่มเติมถึงหัวหน้าช่าง (ถ้ามี)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Section 5: แนบรูปภาพ (Photo Attachments) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">6</span>
                แนบรูปภาพจุดที่เสียหาย / อาการ (Photo Attachments)
              </div>
              <span className="text-xs text-slate-500 font-normal">แนบได้หลายรูป (JPG, PNG)</span>
            </label>

            {/* Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-upload-file"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-slate-700 hover:text-blue-800 transition-all text-xs sm:text-sm font-medium"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>เลือกไฟล์รูปภาพจากอุปกรณ์</span>
              </button>

              <button
                type="button"
                id="btn-upload-camera"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-slate-700 hover:text-blue-800 transition-all text-xs sm:text-sm font-medium"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>ถ่ายภาพด้วยกล้องมือถือ</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Fast Preset Samples */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 pt-1">
              <span className="font-semibold text-slate-700">หรือคลิกใช้รูปตัวอย่างทดสอบ:</span>
              {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => addPresetImage(preset.url)}
                  className="bg-slate-100 hover:bg-amber-100 hover:text-amber-900 px-2 py-1 rounded-md border border-slate-200 transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>

            {/* Thumbnail Preview Grid */}
            {attachedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-900">
                    <img 
                      src={img} 
                      alt={`แนบรูปที่ ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 transition-colors shadow-sm"
                        title="ลบรูปนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                      รูปที่ {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: AI Diagnostic & Cost Estimator Assistant */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-slate-50 p-4 rounded-xl border border-indigo-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Gemini AI Smart Diagnostic & Cost Estimator
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded border border-indigo-300 font-semibold">
                      AI Assist
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600">วิเคราะห์อาการเสียจากภาพถ่ายและปัญหาที่ระบุ พร้อมประเมินงบประมาณ</p>
                </div>
              </div>

              <button
                type="button"
                id="btn-run-ai-diagnosis"
                onClick={handleRunAiDiagnosis}
                disabled={isDiagnosing}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังวิเคราะห์ข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ให้ AI ช่วยวิเคราะห์ & ประเมินราคา</span>
                  </>
                )}
              </button>
            </div>

            {diagnosisError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{diagnosisError}</span>
              </div>
            )}

            {/* AI Diagnosis Result Card */}
            {aiResult && (
              <div className="mt-3 bg-white p-4 rounded-xl border border-indigo-200 space-y-3 animate-in fade-in duration-300">
                <div className="p-2.5 bg-indigo-50/80 rounded-lg text-xs font-medium text-indigo-900 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">สรุปผลวิเคราะห์ AI:</span> {aiResult.summary}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">🔍 สาเหตุที่เป็นไปได้:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {aiResult.possibleCauses?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">🛠️ จุดที่ควรตรวจเช็ค:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {aiResult.recommendedChecks?.map((chk, i) => (
                        <li key={i}>{chk}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Estimated Cost Summary Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-slate-500">ค่าอะไหล่โดยประมาณ: </span>
                      <span className="font-bold text-slate-800">
                        ฿{(aiResult.estimatedTotalCost - aiResult.estimatedLaborCost).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ค่าแรงช่าง: </span>
                      <span className="font-bold text-slate-800">
                        ฿{aiResult.estimatedLaborCost.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">เวลารอซ่อม: </span>
                      <span className="font-bold text-slate-800">~{aiResult.estimatedRepairTimeHours} ชม.</span>
                    </div>
                  </div>

                  <div className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
                    รวมประเมิน: ฿{aiResult.estimatedTotalCost.toLocaleString()}
                  </div>
                </div>

                {aiResult.safetyWarning && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span><strong>ข้อควรระวัง:</strong> {aiResult.safetyWarning}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3 bg-white p-3 rounded-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs sm:text-sm transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              id="btn-submit-repair-ticket"
              className={`px-6 py-2.5 rounded-lg text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 flex items-center space-x-2 ${
                isBackdatedMode
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isBackdatedMode ? (
                <>
                  <History className="w-4 h-4 text-slate-950" />
                  <span>บันทึกข้อมูลใบแจ้งซ่อมย้อนหลัง (Save Historical Ticket)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันส่งใบแจ้งซ่อม (Submit Ticket)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
