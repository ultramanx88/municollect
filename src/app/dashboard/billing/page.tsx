'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { municipalityConfig } from '@/config/municipality';

// Mock data for a more complete bill
const invoiceData = {
  id: 'INV-202408-HH001',
  period: '1 ก.ค. 2567 - 31 ก.ค. 2567',
  issueDate: '1 ส.ค. 2567',
  dueDate: '25 ส.ค. 2567',
  municipality: {
    name: municipalityConfig.name,
    address: '123 ถนนสุขุมวิท, เมือง, 10110',
    phone: '02-123-4567',
  },
  resident: {
    name: 'คุณสมชาย ใจดี',
    address: '456/78 ซอยใจดี, แขวงพระโขนง, 10260',
    id: 'HH-001',
  },
  items: [
    { service: 'ค่าจัดการขยะ', amount: 150.00 },
    { service: 'ค่าน้ำประปา', amount: 455.50 },
    { service: 'ค่าเช่าที่จอดรถ', amount: 300.00 },
  ],
  total: 905.50,
};

export default function BillingPage() {
  const [showQr, setShowQr] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* This is the main UI for screen display */}
      <div className="p-4 md:p-6 print-hidden">
        <header className="flex items-center mb-6">
          <Button asChild variant="ghost" size="icon" className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">ใบแจ้งหนี้รอบปัจจุบัน</h1>
        </header>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>สรุปยอดค้างชำระ</CardTitle>
                <CardDescription>รอบบิล: {invoiceData.period}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                พิมพ์ใบแจ้งหนี้
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="text-right">จำนวนเงิน (บาท)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.service}</TableCell>
                    <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold text-lg">รวมทั้งสิ้น</TableCell>
                  <TableCell className="text-right font-bold text-lg">{invoiceData.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            
            <Separator className="my-6" />

            {!showQr ? (
              <Button className="w-full" variant="default" onClick={() => setShowQr(true)}>
                <QrCode className="mr-2 h-4 w-4" /> ชำระเงินทั้งหมด
              </Button>
            ) : (
              <div className="text-center">
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
                  ยอดชำระ: {invoiceData.total.toFixed(2)} บาท<br/>
                  สำหรับ: {invoiceData.municipality.name}
                </p>
                <Button variant="link" onClick={() => setShowQr(false)} className="mt-4">
                  ยกเลิก
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This is the hidden layout, specifically for printing */}
      <div className="printable-area hidden">
        <div className="text-center p-2">
            <h2 className="font-bold text-lg">{invoiceData.municipality.name}</h2>
            <p className="text-xs">{invoiceData.municipality.address}</p>
            <p className="text-xs">โทร. {invoiceData.municipality.phone}</p>
            <h3 className="font-bold text-md mt-4 underline">ใบแจ้งค่าบริการ</h3>
        </div>
        
        <div className="p-2 text-xs">
            <div className="flex justify-between"><span>เลขที่อ้างอิง:</span> <strong>{invoiceData.id}</strong></div>
            <div className="flex justify-between"><span>วันที่ออก:</span> <span>{invoiceData.issueDate}</span></div>
            <div className="flex justify-between"><span>รอบบิล:</span> <span>{invoiceData.period}</span></div>
            <div className="flex justify-between"><span>กำหนดชำระ:</span> <span>{invoiceData.dueDate}</span></div>
        </div>

        <div className="my-2 border-t border-dashed border-black"></div>
        
        <div className="p-2 text-xs">
            <p><strong>สำหรับ:</strong> {invoiceData.resident.name} (รหัส: {invoiceData.resident.id})</p>
            <p><strong>ที่อยู่:</strong> {invoiceData.resident.address}</p>
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
                {invoiceData.items.map((item, index) => (
                    <tr key={index}>
                        <td className="p-1">{item.service}</td>
                        <td className="text-right p-1">{item.amount.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="my-2 border-t border-dashed border-black"></div>

        <div className="p-2 text-xs">
            <div className="flex justify-between font-bold text-sm">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{invoiceData.total.toFixed(2)} บาท</span>
            </div>
        </div>

        <div className="my-2 border-t border-dashed border-black"></div>

        <div className="text-center p-2 text-xs">
            <p>กรุณาชำระเงินภายในวันที่กำหนด หากชำระแล้วโปรดละเลยใบแจ้งนี้</p>
            <p className="font-bold mt-2">ขอขอบคุณ</p>
            <p className="mt-4">เลขที่อ้างอิง (สำหรับตรวจสอบ): {invoiceData.id}</p>
        </div>
      </div>
    </>
  );
}
