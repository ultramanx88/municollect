'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { municipalityConfig } from '@/config/municipality';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const location = searchParams.get('location');
  const fee = searchParams.get('fee');
  const tenant = 'John Doe'; // This would come from user session
  const date = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const municipality = { name: municipalityConfig.name };
  const receiptId = `RCT-${Date.now()}`; // Generate a unique receipt ID

  const getTitle = () => {
    switch (type) {
      case 'parking': return 'ค่าเช่าที่จอดรถ';
      case 'market': return 'ค่าธรรมเนียมแผงตลาด';
      case 'rental': return 'ค่าเช่าพื้นที่';
      default: return 'ค่าบริการ';
    }
  }
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Screen UI */}
      <div className="p-4 md:p-6 print-hidden">
        <header className="flex items-center mb-6">
          <Button asChild variant="ghost" size="icon" className="mr-2">
            <Link href="/dashboard/services">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">สลิปยืนยันการลงทะเบียน</h1>
        </header>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">ยืนยันการลงทะเบียนสำเร็จ</CardTitle>
            <CardDescription className="text-center">โปรดแสดงสลิปนี้แก่เจ้าหน้าที่เพื่อยืนยัน</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center font-bold text-lg">{getTitle()}</p>
            <p className="text-center text-muted-foreground">{location}</p>
            <p className="text-center text-2xl font-bold mt-2">{fee ? Number(fee).toLocaleString() : '0'} บาท</p>
            <Separator className="my-4" />
            <div className="flex justify-center mb-4">
              <Image
                src={`https://placehold.co/300x100.png`}
                alt="Barcode"
                width={300}
                height={100}
                data-ai-hint="barcode"
                className="rounded-md"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">Verification ID: {id}</p>
            <p className="text-xs text-center text-muted-foreground">Receipt ID: {receiptId}</p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
              <Button onClick={handlePrint} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                พิมพ์สลิป
              </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Printable Area */}
      <div className="printable-area hidden">
        <div className="text-center p-2">
            <h2 className="font-bold text-lg">{municipality.name}</h2>
            <h3 className="font-bold text-md mt-4 underline">ใบรับชำระเงิน/สลิปยืนยัน</h3>
        </div>

        <div className="my-2 border-t border-dashed border-black"></div>

        <div className="p-2 text-xs">
            <div className="flex justify-between"><span>เลขที่ใบเสร็จ:</span> <strong>{receiptId}</strong></div>
            <div className="flex justify-between"><span>วันที่:</span> <span>{date}</span></div>
            <div className="flex justify-between"><span>ผู้ลงทะเบียน:</span> <span>{tenant}</span></div>
        </div>

        <div className="my-2 border-t border-dashed border-black"></div>

        <table className="w-full text-xs">
            <thead>
                <tr>
                    <th className="text-left p-1">รายการ</th>
                    <th className="text-right p-1">จำนวนเงิน</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="p-1">
                        {getTitle()}
                        <br/>
                        <span className="text-muted-foreground">({location})</span>
                    </td>
                    <td className="text-right p-1 align-top">{fee ? Number(fee).toFixed(2) : '0.00'}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr className="font-bold">
                    <td className="text-left p-1">รวมทั้งสิ้น</td>
                    <td className="text-right p-1">{fee ? Number(fee).toFixed(2) : '0.00'}</td>
                </tr>
            </tfoot>
        </table>

        <div className="my-2 border-t border-dashed border-black"></div>

        <div className="flex justify-center my-2">
            <Image
              src={`https://placehold.co/200x50.png`}
              alt="Barcode"
              width={200}
              height={50}
              data-ai-hint="barcode"
            />
        </div>
        <p className="text-xs text-center text-muted-foreground">Verification ID: {id}</p>

        <div className="text-center p-2 text-xs mt-4">
            <p>-- ขอบคุณที่ใช้บริการ --</p>
            <p className="mt-2">เก็บไว้เป็นหลักฐานเพื่ออ้างอิง</p>
        </div>
      </div>
    </>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">กำลังโหลด...</div>}>
      <ReceiptContent />
    </Suspense>
  )
}
