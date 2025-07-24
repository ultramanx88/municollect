import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Mail, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center justify-center mb-6 relative">
         <h1 className="text-2xl font-bold text-gray-800">โปรไฟล์</h1>
      </header>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-2">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="person avatar"/>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">John Doe</CardTitle>
            <p className="text-muted-foreground">john.doe@example.com</p>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>ข้อมูลบัญชี</span>
                </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span>ตั้งค่าการแจ้งเตือน</span>
                </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span>ความปลอดภัย</span>
                </Button>
            </div>

            <div className="mt-6 border-t pt-4">
                 <Button asChild variant="destructive" className="w-full">
                    <Link href="/">
                        <LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
