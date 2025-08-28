
import { User, Payment, ServiceType, PaymentStatus } from '@municollect/shared';

export type Resident = {
    id: string;
    name: string;
    address: string;
    email: string;
    routeId?: string;
};

export type Invoice = {
    id: string;
    service: string;
    period: string;
    amount: number;
    status: 'ยังไม่ได้ชำระ' | 'ชำระแล้ว (เงินสด)' | 'ชำระแล้ว (ระบบ)';
    dueDate: string;
    paidDate?: string;
};

export type Route = {
    id: string;
    name: string;
    area: string;
    collectorId?: string; // staff id
};

export type Staff = {
    id: string;
    name:string;
    email: string;
    role: 'Admin' | 'Finance' | 'Services' | 'General' | 'Collector';
    status: 'Active' | 'Inactive';
};

export type Message = {
    id: string;
    senderId: string; // Corresponds to a Staff ID
    senderName: string;
    text: string;
    timestamp: string; // ISO 8601 format
};

export const initialResidents: Resident[] = [
  {
    id: 'HH-001',
    name: 'สมชาย ใจดี',
    address: '123/45 หมู่ 6 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270',
    email: 'somchai.j@example.com',
    routeId: 'R-01',
  },
  {
    id: 'HH-002',
    name: 'สมหญิง รักไทย',
    address: '99/1 ซ.สุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260',
    email: 'somyin.r@example.com',
    routeId: 'R-01',
  },
  {
    id: 'HH-003',
    name: 'มานะ พากเพียร',
    address: '55/5 ถนนเพชรเกษม ต.อ้อมน้อย อ.กระทุ่มแบน จ.สมุทรสาคร 74130',
    email: 'mana.p@example.com',
    routeId: 'R-02',
  },
];

export const mockInvoices: { [key: string]: Invoice[] } = {
    'HH-001': [
        { id: 'INV-S-01', service: 'ค่าจัดการขยะ', period: 'สิงหาคม 2567', amount: 150, status: 'ยังไม่ได้ชำระ', dueDate: '2024-08-25' },
        { id: 'INV-S-02', service: 'ค่าน้ำประปา', period: 'สิงหาคม 2567', amount: 455.50, status: 'ยังไม่ได้ชำระ', dueDate: '2024-08-25' },
        { id: 'INV-S-03', service: 'ค่าจัดการขยะ', period: 'กรกฎาคม 2567', amount: 150, status: 'ชำระแล้ว (ระบบ)', dueDate: '2024-07-25', paidDate: '2024-07-15' },
        { id: 'INV-S-04', service: 'ค่าน้ำประปา', period: 'กรกฎาคม 2567', amount: 450.00, status: 'ชำระแล้ว (ระบบ)', dueDate: '2024-07-25', paidDate: '2024-07-15' },
        { id: 'INV-S-05', service: 'ค่าจัดการขยะ', period: 'มิถุนายน 2567', amount: 150, status: 'ชำระแล้ว (เงินสด)', dueDate: '2024-06-25', paidDate: '2024-06-20' },
    ],
    'HH-002': [
        { id: 'INV-Y-01', service: 'ค่าจัดการขยะ', period: 'สิงหาคม 2567', amount: 120, status: 'ยังไม่ได้ชำระ', dueDate: '2024-08-25' },
        { id: 'INV-Y-02', service: 'ค่าจัดการขยะ', period: 'กรกฎาคม 2567', amount: 120, status: 'ชำระแล้ว (ระบบ)', dueDate: '2024-07-25', paidDate: '2024-07-18' },
    ],
    'HH-003': [],
};

export const initialRoutes: Route[] = [
    { id: 'R-01', name: 'สาย A1', area: 'โซนเหนือ, ถนนสุขุมวิทสายเก่า', collectorId: 'STF-005' },
    { id: 'R-02', name: 'สาย B2', area: 'โซนใต้, ถนนศรีนครินทร์', collectorId: 'STF-006' },
];

export const initialStaff: Staff[] = [
  {
    id: 'STF-001',
    name: 'นายสมชาย ใจดี',
    email: 'somchai.j@anytown-city.gov',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'STF-002',
    name: 'นางสาวสมศรี มีสุข',
    email: 'somsri.m@anytown-city.gov',
    role: 'Finance',
    status: 'Active',
  },
  {
    id: 'STF-003',
    name: 'นายมานะ พากเพียร',
    email: 'mana.p@anytown-city.gov',
    role: 'Services',
    status: 'Active',
  },
    {
    id: 'STF-004',
    name: 'นางสุดา รักสงบ',
    email: 'suda.r@anytown-city.gov',
    role: 'General',
    status: 'Inactive',
  },
  {
    id: 'STF-005',
    name: 'นายวิชัย ขยันยิ่ง',
    email: 'wichai.k@anytown-city.gov',
    role: 'Collector',
    status: 'Active',
  },
  {
    id: 'STF-006',
    name: 'นายชาติชาย ชำนาญ',
    email: 'chatchai.c@anytown-city.gov',
    role: 'Collector',
    status: 'Active',
  },
];

export const initialMessages: Message[] = [
    {
        id: 'MSG-001',
        senderId: 'STF-005', // วิชัย (Collector)
        senderName: 'วิชัย ขยันยิ่ง',
        text: 'สาย A1 มีขยะล้นถังหลายจุดครับ ขอรถเสริมด่วน',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 'MSG-002',
        senderId: 'STF-001', // สมชาย (Admin)
        senderName: 'สมชาย ใจดี',
        text: 'รับทราบ กำลังประสานงานให้ครับ',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
    {
        id: 'MSG-003',
        senderId: 'STF-006', // ชาติชาย (Collector)
        senderName: 'ชาติชาย ชำนาญ',
        text: 'รถเก็บขยะสาย B2 ยางแบนที่ซอย 5 ครับ',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
        id: 'MSG-004',
        senderId: 'STF-001', // สมชาย (Admin)
        senderName: 'สมชาย ใจดี',
        text: 'รับทราบครับ จะส่งทีมช่างเข้าไปดู',
        timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    }
];
