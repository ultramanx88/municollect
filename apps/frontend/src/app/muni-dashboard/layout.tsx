'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, LayoutDashboard, Banknote, Building2, Store, Users, ParkingCircle, ScanLine, Settings, UsersRound, Route, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { municipalityConfig } from '@/config/municipality';
import packageJson from '../../../package.json';
import type { Staff } from '@/data/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';


// Mock current user. In a real app, this would come from a session/auth context.
const currentUser: { role: Staff['role'] } = {
  role: 'Admin', // Change to 'Collector', 'Finance', etc. to test role-based menu
};

const allNavItems = [
  { href: '/muni-dashboard', icon: LayoutDashboard, label: 'ภาพรวม' },
  { href: '/muni-dashboard/accounts', icon: Banknote, label: 'บัญชีรับเงิน', roles: ['Admin', 'Finance'] },
  { href: '/muni-dashboard/residents', icon: Users, label: 'ผู้พักอาศัย', roles: ['Admin', 'Services', 'Finance'] },
  { href: '/muni-dashboard/routes', icon: Route, label: 'จัดการสายเก็บขยะ', roles: ['Admin', 'Services'] },
  { href: '/muni-dashboard/chat', icon: MessageSquare, label: 'แชท', roles: ['Admin', 'Collector'] },
  { href: '/muni-dashboard/rentals', icon: Building2, label: 'พื้นที่เช่า', roles: ['Admin', 'Services'] },
  { href: '/muni-dashboard/markets', icon: Store, label: 'ตลาดและแผงค้า', roles: ['Admin', 'Services'] },
  { href: '/muni-dashboard/parking', icon: ParkingCircle, label: 'ที่จอดรถ', roles: ['Admin', 'Services'] },
  { href: '/muni-dashboard/staff', icon: UsersRound, label: 'จัดการบุคลากร', roles: ['Admin'] },
  { href: '/muni-dashboard/settings', icon: Settings, label: 'ตั้งค่า', roles: ['Admin'] },
];


export default function MuniDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { name: municipalityName, logoUrl } = municipalityConfig;
  const appVersion = packageJson.version;

  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <div className="dashboard-wrapper grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-white shadow-lg md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6 bg-gray-50">
            <Link href="/muni-dashboard" className="flex items-center gap-2 font-semibold">
              <Logo src={logoUrl} />
              <span className="font-superspace-bold">{municipalityName}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
              {navItems.map((item) => {
                const isActive = item.href === '/muni-dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-gray-600 transition-all hover:text-blue-700 hover:bg-blue-50 font-superspace-regular",
                      isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <p className="text-xs text-gray-500">Version {appVersion}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b bg-white shadow-sm px-4 lg:px-6">
            <h1 className="text-lg font-superspace-bold flex-1 text-gray-900">{municipalityName}</h1>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
                        <Bell className="h-5 w-5" />
                         <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="sr-only">การแจ้งเตือน</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 dashboard-card">
                    <DropdownMenuLabel className="font-superspace-bold">การแจ้งเตือนล่าสุด</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-superspace-bold">พนักงานเก็บขยะสาย A1 รายงานปัญหา</p>
                            <p className="text-xs text-gray-500">รถเก็บขยะยางแบนที่ซอย 5</p>
                        </div>
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-superspace-bold">มีผู้พักอาศัยรายใหม่ลงทะเบียน</p>
                            <p className="text-xs text-gray-500">รหัส HH-112, สมศรี มีสุข</p>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-superspace-bold">ได้รับชำระเงินจาก HH-002</p>
                            <p className="text-xs text-gray-500">ยอด 120.00 บาท</p>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">โปรไฟล์</span>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hover:bg-gray-100">
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">ออกจากระบบ</span>
              </Link>
            </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
