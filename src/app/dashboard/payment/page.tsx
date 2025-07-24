'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, Droplets, QrCode, ParkingCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { municipalityConfig } from '@/config/municipality';

function PaymentComponent() {
  const searchParams = useSearchParams();
  const serviceQuery = searchParams.get('service');

  const serviceDetails = {
    waste: {
      title: 'ค่าจัดการขยะ',
      icon: <Trash2 className="h-6 w-6 text-primary" />,
    },
    water: {
      title: 'ชำระค่าน้ำประปา',
      icon: <Droplets className="h-6 w-6 text-accent" />,
    },
    parking: {
      title: 'ค่าเช่าที่จอดรถ',
      icon: <ParkingCircle className="h-6 w-6 text-orange-600" />,
    },
  };

  type ServiceKey = keyof typeof serviceDetails;

  const isValidService = (s: string | null): s is ServiceKey => s !== null && s in serviceDetails;

  const [manualService, setManualService] = useState<ServiceKey | null>(null);

  const activeServiceKey = isValidService(serviceQuery) ? serviceQuery : manualService;
  const currentService = activeServiceKey ? serviceDetails[activeServiceKey] : null;
  const showSelect = !isValidService(serviceQuery);


  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            {currentService?.icon}
            <h1 className="text-xl font-bold">{currentService?.title || 'ชำระค่าบริการ'}</h1>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>สร้าง QR Code สำหรับชำระเงิน</CardTitle>
          <CardDescription>{showSelect ? 'เลือกบริการและใส่จำนวนเงินเพื่อสร้าง QR Code' : 'ใส่จำนวนเงินเพื่อสร้าง QR Code'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {showSelect && (
              <div className="grid gap-2">
                <Label htmlFor="service-select">บริการ</Label>
                <Select onValueChange={(value) => setManualService(value as ServiceKey)} value={manualService || ''}>
                  <SelectTrigger id="service-select">
                    <SelectValue placeholder="เลือกบริการที่ต้องการชำระ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waste">ค่าจัดการขยะ</SelectItem>
                    <SelectItem value="water">ค่าน้ำประปา</SelectItem>
                    <SelectItem value="parking">ค่าเช่าที่จอดรถ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
              <Input id="amount" type="number" placeholder="เช่น 150.00" disabled={!activeServiceKey} />
            </div>
            <Button className="w-full" variant="default" disabled={!activeServiceKey}>
              <QrCode className="mr-2 h-4 w-4" /> สร้าง QR Code
            </Button>
          </div>

          {activeServiceKey && (
            <div className="mt-8 text-center border-t pt-6">
              <h3 className="font-semibold mb-4">สแกนเพื่อชำระเงิน</h3>
              <div className="flex justify-center mb-4">
                  <Image
                      src="https://placehold.co/300x300.png"
                      alt="QR Code สำหรับชำระเงิน"
                      width={300}
                      height={300}
                      className="rounded-lg shadow-md"
                      data-ai-hint="qr code"
                  />
              </div>
              <p className="text-sm text-muted-foreground">
                สำหรับ: {currentService?.title || 'ไม่มี'}<br/>
                เทศบาล: {municipalityConfig.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>กำลังโหลด...</div>}>
            <PaymentComponent />
        </Suspense>
    )
}
