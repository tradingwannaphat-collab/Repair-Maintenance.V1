import { VehicleRecord, InventoryItem, GoodsReceiptRecord, GoodsRequisitionRecord } from "../types";
import { TNB_TRUCKS_DATA } from "./tnbTrucksData";
import { TNB_TRAILERS_DATA } from "./tnbTrailersData";

// Utility vehicles (Mobile Service, Executive, Office, Forklifts)
export const UTILITY_VEHICLES: VehicleRecord[] = [
  {
    id: "VEH-MAINT-01",
    licensePlate: "1ฒฮ-4521",
    carrierCompany: "TNB",
    erpNo: "201",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "TOYOTA",
    vehicleModel: "Hilux Revo Smart Cab โมบายเซอร์วิส",
    vehicleType: "pickup_box",
    department: "ฝ่ายซ่อมบำรุง",
    driverName: "ช่างประสิทธิ์ สายชล",
    driverId: "TNB-MNT-001",
    currentMileage: 58400,
    status: "active",
    color: "บรอนซ์เงิน",
    fuelType: "diesel",
    year: 2023,
    taxExpiryDate: "2569-07-31",
    notes: "รถหน่วยซ่อมบำรุงเคลื่อนที่เร็ว (Mobile Service Unit)",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "VEH-EXEC-01",
    licensePlate: "1กข-8920",
    carrierCompany: "TNB",
    erpNo: "301",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "TOYOTA",
    vehicleModel: "Camry 2.5 HEV Premium Luxury",
    vehicleType: "sedan",
    department: "ฝ่ายบริหาร",
    driverName: "นายเกรียงศักดิ์ วงศ์สว่าง",
    driverId: "TNB-DRV-012",
    currentMileage: 32500,
    status: "active",
    color: "ดำ",
    fuelType: "hybrid",
    year: 2024,
    taxExpiryDate: "2569-11-20",
    notes: "รถประจำตำแหน่งผู้บริหารระดับสูง",
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "VEH-OFFICE-01",
    licensePlate: "5กง-3419",
    carrierCompany: "TNB",
    erpNo: "401",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "HONDA",
    vehicleModel: "Civic 1.5 Turbo RS",
    vehicleType: "sedan",
    department: "ฝ่ายสำนักงาน",
    driverName: "น.ส.กมลวรรณ สุขใส",
    driverId: "TNB-ADM-005",
    currentMileage: 41200,
    status: "active",
    color: "ขาว",
    fuelType: "gasoline",
    year: 2023,
    taxExpiryDate: "2569-09-15",
    notes: "รถธุรการและประสานงานเอกสารฝ่ายสำนักงาน",
    createdAt: "2026-02-15T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "VEH-FL01",
    licensePlate: "FL-01",
    carrierCompany: "TNB",
    erpNo: "501",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "KOMATSU",
    vehicleModel: "FD30T-17 (โฟล์คลิฟต์ดีเซล 3 ตัน)",
    vehicleType: "forklift",
    department: "ฝ่ายคลังสินค้า",
    driverName: "นายประสิทธิ์ คลังทอง",
    driverId: "TNB-WHS-001",
    currentMileage: 3450,
    status: "active",
    color: "เหลือง",
    fuelType: "diesel",
    year: 2022,
    taxExpiryDate: "2569-12-31",
    notes: "ประจำคลังสินค้าหลัก Warehouse 1",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "VEH-FL02",
    licensePlate: "FL-02",
    carrierCompany: "TNB",
    erpNo: "502",
    province: "กรุงเทพมหานคร",
    vehicleBrand: "KOMATSU",
    vehicleModel: "FB25EX-11 (โฟล์คลิฟต์ไฟฟ้า 2.5 ตัน)",
    vehicleType: "forklift",
    department: "ฝ่ายคลังสินค้า",
    driverName: "นายธนพล สุวรรณ",
    driverId: "TNB-WHS-002",
    currentMileage: 2180,
    status: "active",
    color: "เหลือง-เขียว",
    fuelType: "ev",
    year: 2023,
    taxExpiryDate: "2569-12-31",
    notes: "ประจำคลังเก็บสินค้าแห้ง Warehouse 2",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z"
  }
];

// Full TNB Fleet Data (62 Trucks + 32 Trailers + 5 Utility = 99 Total)
export const FULL_TNB_FLEET_DATA: VehicleRecord[] = [
  ...TNB_TRUCKS_DATA,
  ...TNB_TRAILERS_DATA,
  ...UTILITY_VEHICLES
];

export const DEFAULT_TNB_VEHICLES: VehicleRecord[] = FULL_TNB_FLEET_DATA;

export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "INV-001",
    code: "LUB-15W40-18L",
    name: "น้ำมันเครื่องดีเซลสังเคราะห์ 15W-40 (ถัง 18 ลิตร)",
    category: "lubricant",
    unit: "ถัง",
    currentStock: 24,
    minStockLevel: 5,
    unitCost: 1850,
    unitSellingPrice: 2200,
    locationRack: "A-01 (โซนของเหลว)",
    supplier: "PTT Lubricants Official",
    brand: "PTT Dynamic Super Commonrail",
    specification: "API CK-4/SN, SAE 15W-40",
    isRepairableCategory: false,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "tractor_6w", "box_truck_6w", "pickup_box"],
    notes: "เกรดพรีเมียม สำหรับหัวลาก 10 ล้อ, 6 ล้อ และกระบะตู้",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-002",
    code: "FLT-OIL-ISU-GIGA",
    name: "ไส้กรองน้ำมันเครื่องแท้ ISUZU GIGA / Forward",
    category: "lubricant",
    unit: "ลูก",
    currentStock: 18,
    minStockLevel: 4,
    unitCost: 480,
    unitSellingPrice: 650,
    locationRack: "A-02 (ไส้กรอง)",
    supplier: "ISUZU Parts Center",
    brand: "ISUZU Genuine Parts",
    specification: "1-13240-233-0",
    isRepairableCategory: false,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "box_truck_6w"],
    notes: "ตรงรุ่นเครื่องยนต์ 6UZ1 / 6WG1",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-003",
    code: "FLT-OIL-HINO-500",
    name: "ไส้กรองน้ำมันเครื่องแท้ HINO 500 / Victor",
    category: "lubricant",
    unit: "ลูก",
    currentStock: 12,
    minStockLevel: 3,
    unitCost: 450,
    unitSellingPrice: 620,
    locationRack: "A-02 (ไส้กรอง)",
    supplier: "HINO Motors Thailand",
    brand: "HINO Genuine Parts",
    specification: "S1560-72190",
    isRepairableCategory: false,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "tractor_6w"],
    notes: "ตรงรุ่นเครื่องยนต์ J08E / J07E",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-004",
    code: "BRK-PAD-ISU-HEAVY",
    name: "ผ้าเบรกหน้า Heavy Duty ISUZU 10 ล้อ (ชุด 4 ชิ้น)",
    category: "suspension",
    unit: "ชุด",
    currentStock: 8,
    minStockLevel: 2,
    unitCost: 2800,
    unitSellingPrice: 3400,
    locationRack: "B-01 (ระบบเบรกหนัก)",
    supplier: "Bendix Heavy Fleet",
    brand: "Bendix Fleet Pro",
    specification: "Heavy Duty Premium Grade",
    isRepairableCategory: false,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "trailer_3axle", "trailer_2axle"],
    notes: "ทนความร้อนสูงพิเศษ สำหรับหัวลากและหางพ่วง",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-005",
    code: "BAT-12V-150AH",
    name: "แบตเตอรี่รถบรรทุก GS 12V 150Ah (Heavy Duty)",
    category: "lighting",
    unit: "ลูก",
    currentStock: 6,
    minStockLevel: 2,
    unitCost: 4200,
    unitSellingPrice: 4800,
    locationRack: "C-01 (โซนแบตเตอรี่)",
    supplier: "GS Battery Thailand",
    brand: "GS Yuasa",
    specification: "12V 150Ah N150 Heavy Duty",
    isRepairableCategory: false,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "tractor_6w", "box_truck_6w"],
    notes: "ไฟแรง ทนทาน สำหรับหัวลาก 6 ล้อ และ 10 ล้อ",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-006",
    code: "ALT-24V-80A-ISU",
    name: "ไดชาร์จ Alternator 24V 80A แท้ ISUZU (สามารถส่ง Overhaul ได้)",
    category: "engine",
    unit: "ลูก",
    currentStock: 3,
    minStockLevel: 1,
    unitCost: 6500,
    unitSellingPrice: 7800,
    locationRack: "D-01 (ไดชาร์จ/ไดสตาร์ท)",
    supplier: "Denso Fleet Support",
    brand: "DENSO Genuine",
    specification: "24V 80A / 6HK1-TCS",
    isRepairableCategory: true,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "tractor_6w", "box_truck_6w"],
    notes: "มีชุดถ่าน/ทุ่นซ่อม Rebuild สภาพหลังถอดสามารถโอเวอร์ฮอลเก็บเป็นอะไหล่สำรองได้",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-007",
    code: "STR-24V-HINO-500",
    name: "ไดสตาร์ท Starter Motor 24V 6.0kW HINO 500 (สามารถส่ง Rebuild ได้)",
    category: "engine",
    unit: "ลูก",
    currentStock: 2,
    minStockLevel: 1,
    unitCost: 7200,
    unitSellingPrice: 8500,
    locationRack: "D-02 (ไดชาร์จ/ไดสตาร์ท)",
    supplier: "Sawafuji Electric Fleet",
    brand: "Sawafuji / Hino",
    specification: "24V 6.0kW 11T",
    isRepairableCategory: true,
    condition: "rebuilt",
    compatibleVehicleTypes: ["tractor_10w", "tractor_6w"],
    notes: "ลูกรีบิลด์ผ่านการทดสอบไดนาโมมิเตอร์เรียบร้อย รับประกัน 6 เดือน",
    updatedAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "INV-008",
    code: "AIR-COMP-WABCO-10W",
    name: "ปั๊มลมคอมเพรสเซอร์ WABCO Twin Cylinder (สามารถ Rebuild ได้)",
    category: "suspension",
    unit: "ลูก",
    currentStock: 2,
    minStockLevel: 1,
    unitCost: 14500,
    unitSellingPrice: 16800,
    locationRack: "E-01 (ระบบลมเบรก)",
    supplier: "WABCO Thailand Fleet",
    brand: "WABCO Genuine",
    specification: "Twin Cylinder 600cc",
    isRepairableCategory: true,
    condition: "new",
    compatibleVehicleTypes: ["tractor_10w", "trailer_3axle"],
    notes: "เสื้อสูบและลูกสูบมีชุดคิทโอเวอร์ฮอล (Rebuild Kit) หลังเปลี่ยนสามารถส่งช่างโอเวอร์ฮอลสำรองได้",
    updatedAt: "2026-08-20T08:00:00Z"
  }
];

export const DEFAULT_GOODS_RECEIPTS: GoodsReceiptRecord[] = [
  {
    id: "REC-2026-0001",
    receiptNumber: "REC-2026-0801",
    supplierName: "PTT Lubricants Official",
    poNumber: "PO-TNB-2026-041",
    invoiceNumber: "INV-PTT-88902",
    receivedBy: "นายประสิทธิ์ คลังทอง (เจ้าหน้าที่คลัง)",
    department: "ฝ่ายคลังสินค้า",
    receivedDate: "2026-08-18",
    totalAmount: 18500,
    totalQuantity: 10,
    status: "verified",
    notes: "ตรวจรับน้ำมันเครื่องดีเซลเข้าคลังสินค้าเรียบร้อย",
    items: [
      {
        id: "RCI-001",
        inventoryItemId: "INV-001",
        itemCode: "LUB-15W40-18L",
        itemName: "น้ำมันเครื่องดีเซลสังเคราะห์ 15W-40 (ถัง 18 ลิตร)",
        category: "lubricant",
        quantity: 10,
        unit: "ถัง",
        unitCost: 1850,
        totalCost: 18500
      }
    ],
    createdAt: "2026-08-18T10:30:00Z"
  }
];

export const DEFAULT_GOODS_REQUISITIONS: GoodsRequisitionRecord[] = [
  {
    id: "REQ-2026-0001",
    requisitionNumber: "REQ-2026-0801",
    requisitionDate: "2026-08-19",
    requisitionType: "vehicle_maintenance",
    vehicleId: "VEH-T10-01",
    licensePlate: "บบ 9753",
    department: "ฝ่ายขนส่ง",
    requestedBy: "ช่างประสิทธิ์ สายชล (หัวหน้าช่าง)",
    approvedBy: "ผู้จัดการแผนกซ่อมบำรุง",
    purpose: "เบิกถ่ายน้ำมันเครื่องและเปลี่ยนไส้กรองตามรอบ PM 180,000 กม.",
    items: [
      {
        id: "RQI-001",
        inventoryItemId: "INV-001",
        itemCode: "LUB-15W40-18L",
        itemName: "น้ำมันเครื่องดีเซลสังเคราะห์ 15W-40 (ถัง 18 ลิตร)",
        category: "lubricant",
        quantity: 2,
        unit: "ถัง",
        unitCost: 1850,
        totalCost: 3700
      },
      {
        id: "RQI-002",
        inventoryItemId: "INV-002",
        itemCode: "FLT-OIL-ISU-GIGA",
        itemName: "ไส้กรองน้ำมันเครื่องแท้ ISUZU GIGA / Forward",
        category: "lubricant",
        quantity: 1,
        unit: "ลูก",
        unitCost: 480,
        totalCost: 480
      }
    ],
    totalAmount: 4180,
    totalQuantity: 3,
    status: "completed",
    notes: "ส่งมอบของให้ช่างเรียบร้อย",
    createdAt: "2026-08-19T14:15:00Z"
  }
];

// Clean initial datasets (0 records for real production deployment)
export const INITIAL_VEHICLES: VehicleRecord[] = DEFAULT_TNB_VEHICLES;
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = DEFAULT_INVENTORY_ITEMS;
export const INITIAL_GOODS_RECEIPTS: GoodsReceiptRecord[] = DEFAULT_GOODS_RECEIPTS;
export const INITIAL_GOODS_REQUISITIONS: GoodsRequisitionRecord[] = DEFAULT_GOODS_REQUISITIONS;

// Demo datasets
export const DEMO_TNB_VEHICLES = DEFAULT_TNB_VEHICLES;
export const DEMO_INVENTORY_ITEMS = DEFAULT_INVENTORY_ITEMS;
export const DEMO_GOODS_RECEIPTS = DEFAULT_GOODS_RECEIPTS;
export const DEMO_GOODS_REQUISITIONS = DEFAULT_GOODS_REQUISITIONS;
