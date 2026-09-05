import React, { useState, useMemo } from "react";
import {
  Wrench,
  Store,
  Building2,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Briefcase,
  Award,
  ShieldCheck,
  CreditCard,
  Percent,
  Download,
  Printer,
  ChevronRight,
  UserCheck,
  Sparkles,
  Layers,
  Radio,
  X,
  FileText
} from "lucide-react";
import { 
  TechnicianItem, 
  VendorShopItem, 
  ServiceCenterItem, 
  ServiceDirectoryState, 
  RepairCategory,
  TechnicianStatus,
  VendorStatus,
  ServiceCenterType
} from "../types";

interface ServiceDirectoryViewProps {
  directory: ServiceDirectoryState;
  onUpdateDirectory: (updated: ServiceDirectoryState, actionDesc: string) => void;
  activeTicketsCountByMechanic?: Record<string, number>;
  onNavigateToWorkerWithMechanic?: (mechanicName: string) => void;
}

const CATEGORY_NAMES_TH: Record<RepairCategory, string> = {
  suspension: "ช่วงล่าง & เบรกลม",
  lubricant: "ของเหลว & หล่อลื่น",
  lighting: "ระบบไฟ & ECU",
  engine: "เครื่องยนต์ & เกียร์",
  tires: "ยาง & ล้อ 10 ล้อ",
  aircon: "แอร์ & ความเย็น",
  bodywork: "ตัวถัง & สี 2K",
  inspection: "ตรวจสภาพ & PM",
  other: "ทั่วไป & เบ็ดเตล็ด"
};

const CENTER_TYPE_LABELS: Record<ServiceCenterType, { label: string; color: string; bg: string }> = {
  authorized_dealer: {
    label: "ศูนย์ตัวแทนจำหน่ายทางการ (Authorized Dealer)",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200"
  },
  specialized_workshop: {
    label: "อู่เฉพาะทาง (Specialized Workshop)",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200"
  },
  general_garage: {
    label: "อู่ซ่อมทั่วไป (General Garage)",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200"
  },
  tire_center: {
    label: "ศูนย์บริการยางและตั้งศูนย์ (Tire Center)",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200"
  },
  body_paint_center: {
    label: "ศูนย์เคาะพ่นสีและดัดคัสซี (Body & Paint)",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200"
  }
};

export const ServiceDirectoryView: React.FC<ServiceDirectoryViewProps> = ({
  directory,
  onUpdateDirectory,
  activeTicketsCountByMechanic = {},
  onNavigateToWorkerWithMechanic
}) => {
  const [activeTab, setActiveTab] = useState<"mechanics" | "vendors" | "centers">("mechanics");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals state
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechnicianItem | null>(null);

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorShopItem | null>(null);

  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenterItem | null>(null);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "tech" | "vendor" | "center";
    id: string;
    name: string;
  } | null>(null);

  // Form states for Tech
  const [techForm, setTechForm] = useState<Partial<TechnicianItem>>({
    name: "",
    nickname: "",
    roleTitle: "",
    specialties: ["suspension"],
    specialtyDetails: "",
    phone: "",
    lineId: "",
    status: "active",
    employeeId: "",
    experienceYears: 5,
    notes: ""
  });

  // Form states for Vendor
  const [vendorForm, setVendorForm] = useState<Partial<VendorShopItem>>({
    name: "",
    shortName: "",
    category: "",
    suppliedCategories: ["suspension"],
    contactPerson: "",
    phone: "",
    secondaryPhone: "",
    taxId: "",
    email: "",
    address: "",
    creditTermDays: 30,
    discountPercent: 5,
    status: "active",
    bankAccount: "",
    notes: ""
  });

  // Form states for Service Center
  const [centerForm, setCenterForm] = useState<Partial<ServiceCenterItem>>({
    name: "",
    centerType: "authorized_dealer",
    brandSpecialization: "",
    servicesOffered: [""],
    contactPerson: "",
    phone: "",
    emergencyPhone: "",
    address: "",
    province: "สมุทรสาคร",
    googleMapsUrl: "",
    hasMobileService: false,
    creditTermDays: 30,
    status: "active",
    notes: ""
  });

  // Handlers for Technician
  const handleOpenAddTech = () => {
    setEditingTech(null);
    setTechForm({
      name: "",
      nickname: "",
      roleTitle: "ช่างซ่อมบำรุงประจำศูนย์",
      specialties: ["suspension"],
      specialtyDetails: "",
      phone: "",
      lineId: "",
      status: "active",
      employeeId: `TNB-M${String((directory.technicians?.length || 0) + 1).padStart(2, "0")}`,
      experienceYears: 5,
      notes: ""
    });
    setIsTechModalOpen(true);
  };

  const handleOpenEditTech = (tech: TechnicianItem) => {
    setEditingTech(tech);
    setTechForm({ ...tech });
    setIsTechModalOpen(true);
  };

  const handleSaveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techForm.name?.trim()) return;

    let updatedList: TechnicianItem[];
    const now = new Date().toISOString();

    if (editingTech) {
      updatedList = directory.technicians.map((t) =>
        t.id === editingTech.id
          ? ({ ...t, ...techForm, updatedAt: now } as TechnicianItem)
          : t
      );
      onUpdateDirectory(
        { ...directory, technicians: updatedList },
        `แก้ไขข้อมูลช่าง: ${techForm.name}`
      );
    } else {
      const newTech: TechnicianItem = {
        id: `TECH-${Date.now().toString().slice(-4)}`,
        name: techForm.name.trim(),
        nickname: techForm.nickname?.trim() || "",
        roleTitle: techForm.roleTitle?.trim() || "ช่างประจำศูนย์",
        specialties: techForm.specialties || ["other"],
        specialtyDetails: techForm.specialtyDetails?.trim() || "",
        phone: techForm.phone?.trim() || "",
        lineId: techForm.lineId?.trim() || "",
        status: (techForm.status as TechnicianStatus) || "active",
        employeeId: techForm.employeeId?.trim() || `TNB-M${directory.technicians.length + 1}`,
        experienceYears: Number(techForm.experienceYears) || 1,
        completedJobsCount: 0,
        rating: 5.0,
        notes: techForm.notes?.trim() || "",
        createdAt: now,
        updatedAt: now
      };
      updatedList = [newTech, ...directory.technicians];
      onUpdateDirectory(
        { ...directory, technicians: updatedList },
        `เพิ่มช่างใหม่: ${newTech.name}`
      );
    }
    setIsTechModalOpen(false);
  };

  // Handlers for Vendor
  const handleOpenAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      name: "",
      shortName: "",
      category: "",
      suppliedCategories: ["suspension"],
      contactPerson: "",
      phone: "",
      secondaryPhone: "",
      taxId: "",
      email: "",
      address: "",
      creditTermDays: 30,
      discountPercent: 5,
      status: "active",
      bankAccount: "",
      notes: ""
    });
    setIsVendorModalOpen(true);
  };

  const handleOpenEditVendor = (vendor: VendorShopItem) => {
    setEditingVendor(vendor);
    setVendorForm({ ...vendor });
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name?.trim()) return;

    let updatedList: VendorShopItem[];
    const now = new Date().toISOString();

    if (editingVendor) {
      updatedList = directory.vendors.map((v) =>
        v.id === editingVendor.id
          ? ({ ...v, ...vendorForm, updatedAt: now } as VendorShopItem)
          : v
      );
      onUpdateDirectory(
        { ...directory, vendors: updatedList },
        `แก้ไขข้อมูลร้านค้า: ${vendorForm.name}`
      );
    } else {
      const newVendor: VendorShopItem = {
        id: `VEN-${Date.now().toString().slice(-4)}`,
        name: vendorForm.name.trim(),
        shortName: vendorForm.shortName?.trim() || vendorForm.name.trim().slice(0, 20),
        category: vendorForm.category?.trim() || "อะไหล่รถบรรทุก",
        suppliedCategories: vendorForm.suppliedCategories || ["other"],
        contactPerson: vendorForm.contactPerson?.trim() || "",
        phone: vendorForm.phone?.trim() || "",
        secondaryPhone: vendorForm.secondaryPhone?.trim() || "",
        taxId: vendorForm.taxId?.trim() || "",
        email: vendorForm.email?.trim() || "",
        address: vendorForm.address?.trim() || "",
        creditTermDays: Number(vendorForm.creditTermDays) || 30,
        discountPercent: Number(vendorForm.discountPercent) || 0,
        status: vendorForm.status === "inactive" ? "inactive" : "active",
        rating: 5.0,
        bankAccount: vendorForm.bankAccount?.trim() || "",
        notes: vendorForm.notes?.trim() || "",
        createdAt: now,
        updatedAt: now
      };
      updatedList = [newVendor, ...directory.vendors];
      onUpdateDirectory(
        { ...directory, vendors: updatedList },
        `เพิ่มร้านค้า/ผู้จำหน่าย: ${newVendor.name}`
      );
    }
    setIsVendorModalOpen(false);
  };

  // Handlers for Service Center
  const handleOpenAddCenter = () => {
    setEditingCenter(null);
    setCenterForm({
      name: "",
      centerType: "authorized_dealer",
      brandSpecialization: "ISUZU / HINO",
      servicesOffered: [
        "เช็คระยะใหญ่และซ่อมเครื่องยนต์",
        "ตั้งศูนย์ถ่วงล้อรถใหญ่",
        "ซ่อมระบบเบรกลม"
      ],
      contactPerson: "",
      phone: "",
      emergencyPhone: "",
      address: "",
      province: "สมุทรสาคร",
      googleMapsUrl: "",
      hasMobileService: false,
      creditTermDays: 30,
      status: "active",
      notes: ""
    });
    setIsCenterModalOpen(true);
  };

  const handleOpenEditCenter = (center: ServiceCenterItem) => {
    setEditingCenter(center);
    setCenterForm({ ...center });
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerForm.name?.trim()) return;

    let updatedList: ServiceCenterItem[];
    const now = new Date().toISOString();

    if (editingCenter) {
      updatedList = directory.serviceCenters.map((c) =>
        c.id === editingCenter.id
          ? ({ ...c, ...centerForm, updatedAt: now } as ServiceCenterItem)
          : c
      );
      onUpdateDirectory(
        { ...directory, serviceCenters: updatedList },
        `แก้ไขข้อมูลศูนย์ซ่อม: ${centerForm.name}`
      );
    } else {
      const newCenter: ServiceCenterItem = {
        id: `CTR-${Date.now().toString().slice(-4)}`,
        name: centerForm.name.trim(),
        centerType: centerForm.centerType || "authorized_dealer",
        brandSpecialization: centerForm.brandSpecialization?.trim() || "",
        servicesOffered: centerForm.servicesOffered?.filter(Boolean) || ["งานตรวจเช็คและซ่อมบำรุง"],
        contactPerson: centerForm.contactPerson?.trim() || "",
        phone: centerForm.phone?.trim() || "",
        emergencyPhone: centerForm.emergencyPhone?.trim() || "",
        address: centerForm.address?.trim() || "",
        province: centerForm.province?.trim() || "สมุทรสาคร",
        googleMapsUrl: centerForm.googleMapsUrl?.trim() || "",
        hasMobileService: Boolean(centerForm.hasMobileService),
        creditTermDays: Number(centerForm.creditTermDays) || 30,
        status: centerForm.status === "inactive" ? "inactive" : "active",
        rating: 5.0,
        notes: centerForm.notes?.trim() || "",
        createdAt: now,
        updatedAt: now
      };
      updatedList = [newCenter, ...directory.serviceCenters];
      onUpdateDirectory(
        { ...directory, serviceCenters: updatedList },
        `เพิ่มศูนย์ซ่อม/อู่ภายนอก: ${newCenter.name}`
      );
    }
    setIsCenterModalOpen(false);
  };

  // Toggle quick status
  const handleToggleTechStatus = (tech: TechnicianItem) => {
    const nextStatus: Record<TechnicianStatus, TechnicianStatus> = {
      active: "busy",
      busy: "leave",
      leave: "active",
      inactive: "active"
    };
    const updated = directory.technicians.map((t) =>
      t.id === tech.id ? { ...t, status: nextStatus[t.status] } : t
    );
    onUpdateDirectory(
      { ...directory, technicians: updated },
      `เปลี่ยนสถานะช่าง ${tech.name} เป็น ${nextStatus[tech.status]}`
    );
  };

  const handleToggleVendorStatus = (vendor: VendorShopItem) => {
    const updated: VendorShopItem[] = directory.vendors.map((v) =>
      v.id === vendor.id ? { ...v, status: (v.status === "active" ? "inactive" : "active") as VendorStatus } : v
    );
    onUpdateDirectory(
      { ...directory, vendors: updated },
      `เปลี่ยนสถานะร้านค้า ${vendor.name}`
    );
  };

  const handleToggleCenterStatus = (center: ServiceCenterItem) => {
    const updated: ServiceCenterItem[] = directory.serviceCenters.map((c) =>
      c.id === center.id ? { ...c, status: (c.status === "active" ? "inactive" : "active") as "active" | "inactive" } : c
    );
    onUpdateDirectory(
      { ...directory, serviceCenters: updated },
      `เปลี่ยนสถานะศูนย์ซ่อม ${center.name}`
    );
  };

  // Confirm delete
  const executeDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === "tech") {
      const updated = directory.technicians.filter((t) => t.id !== deleteConfirmTarget.id);
      onUpdateDirectory({ ...directory, technicians: updated }, `ลบรายชื่อช่าง: ${deleteConfirmTarget.name}`);
    } else if (deleteConfirmTarget.type === "vendor") {
      const updated = directory.vendors.filter((v) => v.id !== deleteConfirmTarget.id);
      onUpdateDirectory({ ...directory, vendors: updated }, `ลบรายชื่อร้านค้า: ${deleteConfirmTarget.name}`);
    } else if (deleteConfirmTarget.type === "center") {
      const updated = directory.serviceCenters.filter((c) => c.id !== deleteConfirmTarget.id);
      onUpdateDirectory({ ...directory, serviceCenters: updated }, `ลบรายชื่อศูนย์ซ่อม: ${deleteConfirmTarget.name}`);
    }
    setDeleteConfirmTarget(null);
  };

  // Filtered lists
  const filteredTechnicians = useMemo(() => {
    return (directory.technicians || []).filter((tech) => {
      const matchSearch =
        !searchTerm.trim() ||
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tech.nickname && tech.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tech.phone.includes(searchTerm) ||
        tech.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tech.specialtyDetails && tech.specialtyDetails.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "all" || tech.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || tech.specialties.includes(categoryFilter as RepairCategory);

      return matchSearch && matchStatus && matchCategory;
    });
  }, [directory.technicians, searchTerm, statusFilter, categoryFilter]);

  const filteredVendors = useMemo(() => {
    return (directory.vendors || []).filter((vendor) => {
      const matchSearch =
        !searchTerm.trim() ||
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.shortName && vendor.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone.includes(searchTerm) ||
        (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || vendor.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || (vendor.suppliedCategories && vendor.suppliedCategories.includes(categoryFilter as RepairCategory));

      return matchSearch && matchStatus && matchCategory;
    });
  }, [directory.vendors, searchTerm, statusFilter, categoryFilter]);

  const filteredCenters = useMemo(() => {
    return (directory.serviceCenters || []).filter((center) => {
      const matchSearch =
        !searchTerm.trim() ||
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (center.brandSpecialization && center.brandSpecialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        center.phone.includes(searchTerm) ||
        (center.emergencyPhone && center.emergencyPhone.includes(searchTerm)) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (center.servicesOffered && center.servicesOffered.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchStatus = statusFilter === "all" || center.status === statusFilter;
      const matchCategory = categoryFilter === "all" || center.centerType === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [directory.serviceCenters, searchTerm, statusFilter, categoryFilter]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = "";

    if (activeTab === "mechanics") {
      fileName = `TNB_Technicians_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "\uFEFFรหัสพนักงาน,ชื่อ-นามสกุล,ชื่อเล่น,ตำแหน่ง,ความเชี่ยวชาญ,เบอร์โทร,Line ID,สถานะ,ประสบการณ์(ปี),งานที่สำเร็จ\n";
      (directory.technicians || []).forEach((t) => {
        const specs = t.specialties.map((s) => CATEGORY_NAMES_TH[s] || s).join("; ");
        csvContent += `"${t.employeeId || ""}","${t.name}","${t.nickname || ""}","${t.roleTitle}","${specs}","${t.phone}","${t.lineId || ""}","${t.status}","${t.experienceYears || ""}","${t.completedJobsCount || 0}"\n`;
      });
    } else if (activeTab === "vendors") {
      fileName = `TNB_Vendors_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "\uFEFFรหัส,ชื่อร้านค้า,ชื่อย่อ,หมวดหมู่อะไหล่,ผู้ติดต่อ,เบอร์โทร,เครดิตเทอม(วัน),ส่วนลด(%),เลขผู้เสียภาษี,ที่อยู่\n";
      (directory.vendors || []).forEach((v) => {
        csvContent += `"${v.id}","${v.name}","${v.shortName || ""}","${v.category}","${v.contactPerson || ""}","${v.phone}","${v.creditTermDays || ""}","${v.discountPercent || 0}%","${v.taxId || ""}","${v.address.replace(/"/g, '""')}"\n`;
      });
    } else {
      fileName = `TNB_ServiceCenters_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "\uFEFFรหัส,ชื่อศูนย์ซ่อม/อู่,ประเภท,แบรนด์ที่ชำนาญ,บริการเด่น,ผู้ติดต่อ,เบอร์โทร,เบอร์ฉุกเฉิน,ที่อยู่,มีบริการนอกสถานที่\n";
      (directory.serviceCenters || []).forEach((c) => {
        const services = c.servicesOffered.join("; ");
        csvContent += `"${c.id}","${c.name}","${c.centerType}","${c.brandSpecialization || ""}","${services}","${c.contactPerson || ""}","${c.phone}","${c.emergencyPhone || ""}","${c.address.replace(/"/g, '""')}","${c.hasMobileService ? "มี" : "ไม่มี"}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>TNB Logistics • Partner & Workforce Directory</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <span>ทำเนียบช่าง ร้านค้าอะไหล่ และศูนย์ซ่อมบำรุง</span>
              <span className="text-xs bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/30 font-medium">
                ปรับแต่งได้แบบเรียลไทม์
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              จัดการฐานข้อมูลช่างประจำกองรถ ร้านค้าผู้จำหน่ายอะไหล่ และศูนย์ซ่อมภายนอก/อู่พันธมิตร 
              ข้อมูลทั้งหมดเชื่อมโยงกับใบแจ้งซ่อม การเบิกรับอะไหล่ และซิงค์พร้อมกันทุกคนอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shadow-sm"
              title="ส่งออกไฟล์ CSV สำหรับ Excel"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shadow-sm"
              title="พิมพ์เอกสารทำเนียบรายชื่อ"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>พิมพ์</span>
            </button>
            {activeTab === "mechanics" && (
              <button
                onClick={handleOpenAddTech}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มช่างใหม่</span>
              </button>
            )}
            {activeTab === "vendors" && (
              <button
                onClick={handleOpenAddVendor}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มร้านค้าใหม่</span>
              </button>
            )}
            {activeTab === "centers" && (
              <button
                onClick={handleOpenAddCenter}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มศูนย์ซ่อมใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Main Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div 
            onClick={() => setActiveTab("mechanics")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "mechanics" 
                ? "bg-white/10 border-indigo-400/60 shadow-md ring-2 ring-indigo-500/30" 
                : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ช่างประจำศูนย์</h4>
                  <p className="text-xs text-slate-400">ทีมช่างเทคนิค TNB</p>
                </div>
              </div>
              <span className="text-2xl font-black text-white">{directory.technicians?.length || 0}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 pt-2 border-t border-slate-700/40">
              <span className="text-emerald-400 font-medium">
                พร้อมปฏิบัติงาน {(directory.technicians || []).filter((t) => t.status === "active").length} ท่าน
              </span>
              <span>•</span>
              <span className="text-amber-400 font-medium">
                ติดงานซ่อม {(directory.technicians || []).filter((t) => t.status === "busy").length} ท่าน
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("vendors")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "vendors" 
                ? "bg-white/10 border-indigo-400/60 shadow-md ring-2 ring-indigo-500/30" 
                : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ร้านค้า & ผู้จำหน่าย</h4>
                  <p className="text-xs text-slate-400">คู่ค้าจัดหาอะไหล่</p>
                </div>
              </div>
              <span className="text-2xl font-black text-white">{directory.vendors?.length || 0}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 pt-2 border-t border-slate-700/40">
              <span className="text-emerald-400 font-medium">
                เครดิตเทอมเฉลี่ย 35 วัน
              </span>
              <span>•</span>
              <span className="text-indigo-300 font-medium">
                สต็อกด่วน 2 ชม.
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("centers")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "centers" 
                ? "bg-white/10 border-indigo-400/60 shadow-md ring-2 ring-indigo-500/30" 
                : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ศูนย์ซ่อม & อู่ภายนอก</h4>
                  <p className="text-xs text-slate-400">อู่พันธมิตร & บริการ 24 ชม.</p>
                </div>
              </div>
              <span className="text-2xl font-black text-white">{directory.serviceCenters?.length || 0}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 pt-2 border-t border-slate-700/40">
              <span className="text-emerald-400 font-medium">
                บริการฉุกเฉินนอกสถานที่ {(directory.serviceCenters || []).filter((c) => c.hasMobileService).length} แห่ง
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher & Search / Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("mechanics");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "mechanics"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>1. รายชื่อช่างประจำศูนย์ ({directory.technicians?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("vendors");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "vendors"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>2. ร้านค้า & ผู้จำหน่ายอะไหล่ ({directory.vendors?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("centers");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "centers"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>3. ศูนย์ซ่อม & อู่ภายนอก ({directory.serviceCenters?.length || 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "mechanics"
                  ? "ค้นหาชื่อช่าง, ชื่อเล่น, เบอร์โทร, ความเชี่ยวชาญ..."
                  : activeTab === "vendors"
                  ? "ค้นหาร้านค้า, ผู้ติดต่อ, อะไหล่ที่ขาย, เบอร์โทร..."
                  : "ค้นหาศูนย์ซ่อม, แบรนด์, บริการเด่น, อำเภอ/จังหวัด..."
              }
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Active Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>ตัวกรอง:</span>
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">ทุกสถานะ</option>
              {activeTab === "mechanics" ? (
                <>
                  <option value="active">พร้อมปฏิบัติงาน (Active)</option>
                  <option value="busy">ติดงานซ่อม (Busy)</option>
                  <option value="leave">ลางาน (On Leave)</option>
                  <option value="inactive">ไม่พร้อมปฏิบัติงาน</option>
                </>
              ) : (
                <>
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ปิดใช้งาน (Inactive)</option>
                </>
              )}
            </select>

            {/* Category / Specialty Filter */}
            {activeTab === "mechanics" && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">ทุกสายงานความชำนาญ</option>
                {Object.entries(CATEGORY_NAMES_TH).map(([cat, label]) => (
                  <option key={cat} value={cat}>
                    {label}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "centers" && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">ทุกประเภทศูนย์/อู่</option>
                {Object.entries(CENTER_TYPE_LABELS).map(([typeKey, val]) => (
                  <option key={typeKey} value={typeKey}>
                    {val.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="text-slate-500">
            แสดงผล{" "}
            <span className="font-bold text-slate-800">
              {activeTab === "mechanics"
                ? filteredTechnicians.length
                : activeTab === "vendors"
                ? filteredVendors.length
                : filteredCenters.length}
            </span>{" "}
            รายการ
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TECHNICIANS LIST */}
      {/* ======================================================== */}
      {activeTab === "mechanics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTechnicians.map((tech) => {
            const activeTickets = activeTicketsCountByMechanic[tech.name] || 0;

            const statusColors: Record<TechnicianStatus, { bg: string; text: string; dot: string; label: string }> = {
              active: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "พร้อมปฏิบัติงาน" },
              busy: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "ติดงานซ่อม" },
              leave: { bg: "bg-slate-100 border-slate-300", text: "text-slate-600", dot: "bg-slate-400", label: "ลางาน" },
              inactive: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500", label: "ปิดใช้งาน" }
            };

            const curStatus = statusColors[tech.status] || statusColors.active;

            return (
              <div
                key={tech.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {tech.nickname ? tech.nickname.slice(0, 2) : tech.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {tech.name}
                          </h4>
                        </div>
                        {tech.nickname && (
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {tech.nickname}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          รหัส: {tech.employeeId || tech.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTechStatus(tech)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform active:scale-95 cursor-pointer ${curStatus.bg} ${curStatus.text}`}
                      title="กดเพื่อสลับสถานะ"
                    >
                      <span className={`w-2 h-2 rounded-full ${curStatus.dot} animate-pulse`} />
                      <span>{curStatus.label}</span>
                    </button>
                  </div>

                  {/* Role Title */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{tech.roleTitle}</span>
                    </div>
                    {tech.specialtyDetails && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {tech.specialtyDetails}
                      </p>
                    )}
                  </div>

                  {/* Specialties Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tech.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                      >
                        {CATEGORY_NAMES_TH[spec] || spec}
                      </span>
                    ))}
                  </div>

                  {/* Experience & Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ประสบการณ์</span>
                      <span className="font-bold text-slate-700">{tech.experienceYears || 1} ปี</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">งานซ่อมเสร็จสิ้น</span>
                      <span className="font-bold text-slate-700">{tech.completedJobsCount || 0} งาน</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>โทรศัพท์:</span>
                      </span>
                      <a
                        href={`tel:${tech.phone}`}
                        className="font-bold text-slate-800 hover:text-indigo-600 hover:underline"
                      >
                        {tech.phone || "-"}
                      </a>
                    </div>
                    {tech.lineId && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                          <span>Line ID:</span>
                        </span>
                        <span className="font-medium text-slate-700">{tech.lineId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditTech(tech)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="แก้ไขข้อมูลช่าง"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: "tech", id: tech.id, name: tech.name })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบรายชื่อช่าง"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {onNavigateToWorkerWithMechanic && (
                    <button
                      onClick={() => onNavigateToWorkerWithMechanic(tech.name)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                    >
                      <span>ดูงานที่กำลังซ่อม ({activeTickets})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VENDORS & AUTO PARTS SUPPLIERS */}
      {/* ======================================================== */}
      {activeTab === "vendors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-base shadow-xs">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{vendor.name}</h4>
                      {vendor.shortName && (
                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {vendor.shortName}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        รหัส: {vendor.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleVendorStatus(vendor)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      vendor.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <span>{vendor.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
                  </button>
                </div>

                {/* Category & Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>หมวดหมู่หลัก: {vendor.category}</span>
                  </div>
                  {vendor.contactPerson && (
                    <p className="text-xs text-slate-600">
                      ผู้ติดต่อ: <span className="font-semibold text-slate-800">{vendor.contactPerson}</span>
                    </p>
                  )}
                  {vendor.taxId && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      เลขประจำตัวผู้เสียภาษี: {vendor.taxId}
                    </p>
                  )}
                </div>

                {/* Commercial Terms Badges */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-medium block">เครดิตเทอม</span>
                    <span className="font-bold text-blue-900">{vendor.creditTermDays || 0} วัน</span>
                  </div>
                  <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                    <span className="text-[10px] text-purple-600 font-medium block">ส่วนลดตามตกลง</span>
                    <span className="font-bold text-purple-900">{vendor.discountPercent || 0}%</span>
                  </div>
                </div>

                {/* Address & Bank info */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 text-slate-700">{vendor.address || "ไม่ระบุที่อยู่"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>เบอร์ติดต่อ:</span>
                    </span>
                    <a
                      href={`tel:${vendor.phone}`}
                      className="font-bold text-slate-800 hover:text-indigo-600"
                    >
                      {vendor.phone || "-"}
                    </a>
                  </div>
                  {vendor.bankAccount && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.bankAccount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditVendor(vendor)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="แก้ไขข้อมูลร้านค้า"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTarget({ type: "vendor", id: vendor.id, name: vendor.name })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบรายชื่อร้านค้า"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <a
                  href={`tel:${vendor.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทรสั่งอะไหล่</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SERVICE CENTERS & EXTERNAL WORKSHOPS */}
      {/* ======================================================== */}
      {activeTab === "centers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCenters.map((center) => {
            const typeInfo = CENTER_TYPE_LABELS[center.centerType] || {
              label: "ศูนย์บริการทั่วไป",
              color: "text-slate-700",
              bg: "bg-slate-50 border-slate-200"
            };

            return (
              <div
                key={center.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-base shadow-xs">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{center.name}</h4>
                        <span className="text-[11px] text-slate-500 block font-mono">
                          จังหวัด: {center.province || "สมุทรสาคร"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleCenterStatus(center)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        center.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${center.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{center.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
                    </button>
                  </div>

                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border inline-block ${typeInfo.bg} ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    {center.hasMobileService && (
                      <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                        <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>มีบริการนอกสถานที่ 24 ชม.</span>
                      </span>
                    )}
                  </div>

                  {/* Brand & Services */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-2">
                    {center.brandSpecialization && (
                      <div className="text-xs font-bold text-slate-800">
                        แบรนด์ที่เชี่ยวชาญ: <span className="text-indigo-600">{center.brandSpecialization}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">บริการเด่น:</span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {center.servicesOffered?.slice(0, 3).map((srv, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-600 font-bold">•</span>
                            <span className="line-clamp-1">{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Contact & Map */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 text-slate-700">{center.address}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                      <a href={`tel:${center.phone}`} className="font-bold text-slate-800 hover:text-indigo-600">
                        {center.phone}
                      </a>
                    </div>
                    {center.emergencyPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-rose-500" />
                          <span>เบอร์ฉุกเฉิน 24 ชม.:</span>
                        </span>
                        <a href={`tel:${center.emergencyPhone}`} className="font-bold text-rose-600 hover:underline">
                          {center.emergencyPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditCenter(center)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="แก้ไขข้อมูลศูนย์ซ่อม"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: "center", id: center.id, name: center.name })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบรายชื่อศูนย์ซ่อม"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {center.googleMapsUrl && (
                      <a
                        href={center.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>แผนที่</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href={`tel:${center.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>ติดต่อศูนย์</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT TECHNICIAN */}
      {/* ======================================================== */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  {editingTech ? `แก้ไขข้อมูลช่าง: ${editingTech.name}` : "เพิ่มรายชื่อช่างใหม่"}
                </h3>
              </div>
              <button
                onClick={() => setIsTechModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTech} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ช่าง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={techForm.name}
                    onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                    placeholder="เช่น สมชาย ใจกล้า"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อเล่น / ชื่อเรียกในศูนย์</label>
                  <input
                    type="text"
                    value={techForm.nickname}
                    onChange={(e) => setTechForm({ ...techForm, nickname: e.target.value })}
                    placeholder="เช่น ช่างชาญ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={techForm.employeeId}
                    onChange={(e) => setTechForm({ ...techForm, employeeId: e.target.value })}
                    placeholder="เช่น TNB-M09"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่ง / สายงาน</label>
                  <input
                    type="text"
                    required
                    value={techForm.roleTitle}
                    onChange={(e) => setTechForm({ ...techForm, roleTitle: e.target.value })}
                    placeholder="เช่น ช่างช่วงล่าง & เบรกลม"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    value={techForm.phone}
                    onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })}
                    placeholder="เช่น 089-123-4567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Line ID</label>
                  <input
                    type="text"
                    value={techForm.lineId}
                    onChange={(e) => setTechForm({ ...techForm, lineId: e.target.value })}
                    placeholder="เช่น somchai_line"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะปัจจุบัน</label>
                  <select
                    value={techForm.status}
                    onChange={(e) => setTechForm({ ...techForm, status: e.target.value as TechnicianStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="active">พร้อมปฏิบัติงาน (Active)</option>
                    <option value="busy">ติดงานซ่อม (Busy)</option>
                    <option value="leave">ลางาน (On Leave)</option>
                    <option value="inactive">ปิดใช้งาน / ลาออก</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประสบการณ์ (ปี)</label>
                  <input
                    type="number"
                    min={0}
                    value={techForm.experienceYears}
                    onChange={(e) => setTechForm({ ...techForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Specialties Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  สาขาความเชี่ยวชาญ (เลือกได้หลายข้อ)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_NAMES_TH).map(([key, label]) => {
                    const isChecked = techForm.specialties?.includes(key as RepairCategory);
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = techForm.specialties || [];
                            if (e.target.checked) {
                              setTechForm({ ...techForm, specialties: [...cur, key as RepairCategory] });
                            } else {
                              setTechForm({ ...techForm, specialties: cur.filter((c) => c !== key) });
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดความชำนาญเฉพาะทาง
                </label>
                <textarea
                  rows={2}
                  value={techForm.specialtyDetails}
                  onChange={(e) => setTechForm({ ...techForm, specialtyDetails: e.target.value })}
                  placeholder="เช่น ถนัดระบบวาล์วลมหัวลาก และการซ่อมบำรุงเพลาหางพ่วง 3 เพลา"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={techForm.notes}
                  onChange={(e) => setTechForm({ ...techForm, notes: e.target.value })}
                  placeholder="เช่น ผ่านการอบรมช่างมาตรฐาน ISUZU ประจำปี 2025"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTechModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md"
                >
                  {editingTech ? "บันทึกการแก้ไข" : "เพิ่มช่างเข้าระบบ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT VENDOR */}
      {/* ======================================================== */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  {editingVendor ? `แก้ไขข้อมูลร้านค้า: ${editingVendor.name}` : "เพิ่มร้านค้า / ผู้จำหน่ายอะไหล่"}
                </h3>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อร้านค้า / บริษัท <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    placeholder="เช่น บจก. เจริญยนต์อะไหล่บรรทุก พระราม 2"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อย่อ / ชื่อเรียกสั้นๆ</label>
                  <input
                    type="text"
                    value={vendorForm.shortName}
                    onChange={(e) => setVendorForm({ ...vendorForm, shortName: e.target.value })}
                    placeholder="เช่น เจริญยนต์"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่อะไหล่หลัก</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    placeholder="เช่น อะไหล่ช่วงล่าง เบรกลม คานแหนบ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้ติดต่อ / เซลล์</label>
                  <input
                    type="text"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    placeholder="เช่น คุณสมพงษ์"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์หลัก</label>
                  <input
                    type="tel"
                    required
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="เช่น 02-416-8899"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรสำรอง / มือถือ</label>
                  <input
                    type="tel"
                    value={vendorForm.secondaryPhone}
                    onChange={(e) => setVendorForm({ ...vendorForm, secondaryPhone: e.target.value })}
                    placeholder="เช่น 081-443-2211"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี 13 หลัก</label>
                  <input
                    type="text"
                    value={vendorForm.taxId}
                    onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })}
                    placeholder="เช่น 0105553012345"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เครดิตเทอม (วัน)</label>
                  <input
                    type="number"
                    min={0}
                    value={vendorForm.creditTermDays}
                    onChange={(e) => setVendorForm({ ...vendorForm, creditTermDays: Number(e.target.value) })}
                    placeholder="เช่น 30 หรือ 45"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ส่วนลดตามข้อตกลง (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={vendorForm.discountPercent}
                    onChange={(e) => setVendorForm({ ...vendorForm, discountPercent: Number(e.target.value) })}
                    placeholder="เช่น 10"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะร้านค้า</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ปิดใช้งาน (Inactive)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ร้านค้า / จัดส่ง</label>
                  <textarea
                    rows={2}
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                    placeholder="เช่น 88/12 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง จ.สมุทรสาคร"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ข้อมูลบัญชีธนาคารสำหรับโอนเงิน</label>
                  <input
                    type="text"
                    value={vendorForm.bankAccount}
                    onChange={(e) => setVendorForm({ ...vendorForm, bankAccount: e.target.value })}
                    placeholder="เช่น กสิกรไทย 045-2-88776-1 บจก.เจริญยนต์"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุ / เงื่อนไขจัดส่ง</label>
                  <textarea
                    rows={2}
                    value={vendorForm.notes}
                    onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                    placeholder="เช่น มีรถส่งของถึงศูนย์ TNB วันละ 2 รอบ 10:00 น. และ 14:00 น."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md"
                >
                  {editingVendor ? "บันทึกการแก้ไข" : "เพิ่มร้านค้าเข้าระบบ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SERVICE CENTER */}
      {/* ======================================================== */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">
                  {editingCenter ? `แก้ไขข้อมูลศูนย์ซ่อม: ${editingCenter.name}` : "เพิ่มศูนย์ซ่อม / อู่บริการภายนอก"}
                </h3>
              </div>
              <button
                onClick={() => setIsCenterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อศูนย์บริการ / อู่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={centerForm.name}
                    onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                    placeholder="เช่น ศูนย์บริการตรีเพชรอีซูซุ นครปฐม"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทของศูนย์บริการ</label>
                  <select
                    value={centerForm.centerType}
                    onChange={(e) => setCenterForm({ ...centerForm, centerType: e.target.value as ServiceCenterType })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="authorized_dealer">ศูนย์ตัวแทนจำหน่ายมาตรฐาน (Dealer)</option>
                    <option value="specialized_workshop">อู่เฉพาะทาง (เบรกลม, ปั๊มหัวฉีด ฯลฯ)</option>
                    <option value="tire_center">ศูนย์บริการยาง & ตั้งศูนย์</option>
                    <option value="body_paint_center">อู่เคาะพ่นสีและดัดคัสซี</option>
                    <option value="general_garage">อู่ซ่อมทั่วไป</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">แบรนด์ที่เชี่ยวชาญ</label>
                  <input
                    type="text"
                    value={centerForm.brandSpecialization}
                    onChange={(e) => setCenterForm({ ...centerForm, brandSpecialization: e.target.value })}
                    placeholder="เช่น ISUZU, HINO, FUSO, UD"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    required
                    value={centerForm.phone}
                    onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                    placeholder="เช่น 034-280-500"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์ฉุกเฉิน 24 ชม. (ถ้ามี)</label>
                  <input
                    type="tel"
                    value={centerForm.emergencyPhone}
                    onChange={(e) => setCenterForm({ ...centerForm, emergencyPhone: e.target.value })}
                    placeholder="เช่น 081-800-9999"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={centerForm.province}
                    onChange={(e) => setCenterForm({ ...centerForm, province: e.target.value })}
                    placeholder="เช่น สมุทรสาคร, นครปฐม, กรุงเทพฯ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้ติดต่อ / ประสานงาน</label>
                  <input
                    type="text"
                    value={centerForm.contactPerson}
                    onChange={(e) => setCenterForm({ ...centerForm, contactPerson: e.target.value })}
                    placeholder="เช่น คุณนเรศ (ผู้จัดการศูนย์)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={centerForm.hasMobileService}
                      onChange={(e) => setCenterForm({ ...centerForm, hasMobileService: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      มีหน่วยบริการนอกสถานที่ (Mobile Service / รถช่วยเหลือฉุกเฉิน)
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ลิงก์ Google Maps</label>
                  <input
                    type="url"
                    value={centerForm.googleMapsUrl}
                    onChange={(e) => setCenterForm({ ...centerForm, googleMapsUrl: e.target.value })}
                    placeholder="เช่น https://maps.google.com/?q=Isuzu+NakhonPathom"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ศูนย์บริการ</label>
                  <textarea
                    rows={2}
                    value={centerForm.address}
                    onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                    placeholder="เช่น 99 หมู่ 5 ถ.เพชรเกษม ต.ลำพยา อ.เมือง จ.นครปฐม"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บริการเด่น (พิมพ์คั่นด้วยเครื่องหมายจุลภาค , หรือบรรทัดใหม่)
                  </label>
                  <textarea
                    rows={3}
                    value={centerForm.servicesOffered?.join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                      setCenterForm({ ...centerForm, servicesOffered: lines });
                    }}
                    placeholder="เช่น&#10;เช็คระยะใหญ่ตามรอบ PM3&#10;ตั้งศูนย์ถ่วงล้อ 10 ล้อ&#10;เช็คปั๊มหัวฉีดคอมมอนเรล"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCenterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-md"
                >
                  {editingCenter ? "บันทึกการแก้ไข" : "เพิ่มศูนย์ซ่อมเข้าระบบ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRM DELETE DIALOG */}
      {/* ======================================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">ยืนยันการลบข้อมูล</h4>
                <p className="text-xs text-slate-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              คุณต้องการลบรายการ{" "}
              <span className="font-bold text-slate-900">"{deleteConfirmTarget.name}"</span>{" "}
              ออกจากฐานข้อมูลทำเนียบใช่หรือไม่?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
