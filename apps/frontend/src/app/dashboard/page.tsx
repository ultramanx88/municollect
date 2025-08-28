'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Landmark, Bell, UserCircle, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { municipalityConfig } from '@/config/municipality';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LogoutButton } from '@/components/LogoutButton';
import { useAuth } from '@/contexts';


export default function DashboardPage() {
  const { name: municipalityName } = municipalityConfig;
  const { user } = useAuth();
  const outstandingBalance = 905.50; // Example amount

  return (
    <ProtectedRoute allowedRoles={['resident']}>
      <div className="p-4 md:p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">MuniCollect</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="sr-only">การแจ้งเตือน</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>การแจ้งเตือนล่าสุด</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>ใบแจ้งหนี้รอบ ส.ค. 67 ออกแล้ว</DropdownMenuItem>
                    <DropdownMenuItem>เทศบาลได้เพิ่มช่องทางชำระเงินใหม่</DropdownMenuItem>
                    <DropdownMenuItem>ประกาศ: งดเก็บขยะวันที่ 12 ส.ค.</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">โปรไฟล์</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">โปรไฟล์</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton variant="ghost" size="sm" className="w-full justify-start p-0" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 p-4 bg-card rounded-lg border">
          <Landmark className="h-6 w-6 text-primary" />
          <div>
            <p className="text-muted-foreground text-sm">ยินดีต้อนรับ</p>
            <h2 className="text-lg font-semibold">{municipalityName}</h2>
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <Card className="border-primary border-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ยอดค้างชำระ</CardTitle>
                <Badge variant="destructive">รอบบิลปัจจุบัน</Badge>
              </div>
              <CardDescription>กรุณาชำระภายในวันที่ 25 ส.ค. 2567</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {outstandingBalance.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                3 รายการ: ค่าขยะ, ค่าน้ำ, ค่าที่จอดรถ
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/billing">
                  ดูรายละเอียดและชำระเงิน <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

           <Link href="/dashboard/services" className="block">
            <Card className="hover:bg-secondary transition-colors duration-200 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                 <div className="bg-blue-100 p-3 rounded-lg">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle>ค้นหาและลงทะเบียนบริการ</CardTitle>
                  <CardDescription>ค้นหาที่จอดรถ, แผงตลาด, พื้นที่เช่าที่ว่าง</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
      </div>
    </div>
    </ProtectedRoute>
  );
}
