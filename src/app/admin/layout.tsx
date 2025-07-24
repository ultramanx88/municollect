import { UserCircle, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { municipalityConfig } from '@/config/municipality';
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card">
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Logo src={municipalityConfig.logoUrl} />
            </Link>
          <h1 className="text-xl font-bold hidden md:block">MuniCollect Admin</h1>
        </div>
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
                    <DropdownMenuLabel>การแจ้งเตือนผู้ดูแลระบบ</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>เทศบาลนครนนทบุรีส่งคำขอลงทะเบียน</DropdownMenuItem>
                    <DropdownMenuItem>API Key ของเทศบาลบางปูถูกสร้างใหม่</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">โปรไฟล์</span>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">ออกจากระบบ</span>
              </Link>
            </Button>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
