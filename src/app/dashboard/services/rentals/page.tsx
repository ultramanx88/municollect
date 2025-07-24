'use client';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const rentalSpaces = [
  { id: 'RNT-001', name: 'อาคารพาณิชย์ A1', type: 'พาณิชย์', tenant: 'ร้านสะดวกซื้อ', status: 'มีผู้เช่า', rentAmount: 15000 },
  { id: 'RNT-002', name: 'บ้านเลขที่ 123/4', type: 'ที่อยู่อาศัย', tenant: 'นายสมชาย ใจดี', status: 'มีผู้เช่า', rentAmount: 8000 },
  { id: 'RNT-003', name: 'อาคารพาณิชย์ B2', type: 'พาณิชย์', tenant: '', status: 'ว่าง', rentAmount: 12000 },
];

const availableRentals = rentalSpaces.filter(s => s.status === 'ว่าง');

export default function AvailableRentalsPage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard/services">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">พื้นที่เช่าว่าง</h1>
      </header>

      {availableRentals.length > 0 ? (
        <div className="space-y-4">
          {availableRentals.map(space => (
            <Card key={space.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{space.name}</p>
                  <p className="text-sm text-muted-foreground">ประเภท: {space.type}</p>
                  <p className="text-sm text-muted-foreground">ค่าเช่า: {space.rentAmount.toLocaleString()} บาท/เดือน</p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/services/receipt?type=rental&id=${space.id}&location=${encodeURIComponent(space.name)}&fee=${space.rentAmount}`}>
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
          <AlertTitle>ไม่มีพื้นที่เช่าว่าง</AlertTitle>
          <AlertDescription>
            ขออภัย ขณะนี้ไม่มีพื้นที่เช่าว่างให้บริการ กรุณาตรวจสอบอีกครั้งในภายหลัง
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
