'use client';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const parkingSpaces = [
  { id: 'P-001', location: 'ลานจอด A-01', tenant: 'นายสมชาย ใจดี', status: 'มีผู้เช่า', monthlyFee: 500, },
  { id: 'P-002', location: 'ลานจอด A-02', tenant: '', status: 'ว่าง', monthlyFee: 500, },
  { id: 'P-003', location: 'ใต้อาคาร B-05', tenant: 'นางสาวสมหญิง รักไทย', status: 'มีผู้เช่า', monthlyFee: 800, },
  { id: 'P-004', location: 'ลานจอด A-03', tenant: '', status: 'ว่าง', monthlyFee: 500, },
];

const availableSpaces = parkingSpaces.filter(s => s.status === 'ว่าง');

export default function AvailableParkingPage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard/services">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">ที่จอดรถว่าง</h1>
      </header>

      {availableSpaces.length > 0 ? (
        <div className="space-y-4">
          {availableSpaces.map(space => (
            <Card key={space.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{space.location}</p>
                  <p className="text-sm text-muted-foreground">ค่าเช่า: {space.monthlyFee.toLocaleString()} บาท/เดือน</p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/services/receipt?type=parking&id=${space.id}&location=${encodeURIComponent(space.location)}&fee=${space.monthlyFee}`}>
                    ลงทะเบียน
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>ไม่มีที่จอดรถว่าง</AlertTitle>
          <AlertDescription>
            ขออภัย ขณะนี้ไม่มีที่จอดรถว่างให้บริการ กรุณาตรวจสอบอีกครั้งในภายหลัง
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
