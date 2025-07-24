import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center items-center">
          <CheckCircle className="w-16 h-16 text-accent mb-4" />
          <CardTitle className="text-2xl">ส่งคำขอลงทะเบียนสำเร็จ</CardTitle>
          <CardDescription>
            เราได้รับคำขอของท่านแล้ว และจะติดต่อกลับไปเมื่อการตรวจสอบเสร็จสิ้น
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild type="submit" className="w-full">
              <Link href="/">กลับสู่หน้าหลัก</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
