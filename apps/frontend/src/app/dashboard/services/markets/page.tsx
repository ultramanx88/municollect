'use client';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const marketStalls: { [key: string]: { id: string; vendor: string; status: 'ว่าง' | 'มีผู้ค้า'; fee: number }[] } = {
    'MKT-001': [
        { id: 'A-01', vendor: 'ป้าสมศรี ขายผัก', status: 'มีผู้ค้า', fee: 100 },
        { id: 'A-02', vendor: '', status: 'ว่าง', fee: 100 },
        { id: 'B-12', vendor: 'ลุงโปร่ง ขายผลไม้', status: 'มีผู้ค้า', fee: 120 },
        { id: 'B-13', vendor: '', status: 'ว่าง', fee: 120 },
    ],
    'MKT-002': [
        { id: 'R-05', vendor: 'ลุงมี ขายไก่ย่าง', status: 'มีผู้ค้า', fee: 150 },
    ],
    'MKT-003': [
        { id: 'C-01', vendor: '', status: 'ว่าง', fee: 80 },
        { id: 'C-02', vendor: '', status: 'ว่าง', fee: 80 },
    ]
};
const marketNames: { [key: string]: string } = {
    'MKT-001': 'ตลาดสดเทศบาล',
    'MKT-002': 'ตลาดโต้รุ่ง',
    'MKT-003': 'ตลาดนัดคลองถม',
};

const availableStallsByMarket = Object.entries(marketStalls).map(([marketId, stalls]) => ({
  marketId,
  marketName: marketNames[marketId],
  stalls: stalls.filter(s => s.status === 'ว่าง'),
})).filter(m => m.stalls.length > 0);

export default function AvailableMarketsPage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard/services">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">แผงตลาดว่าง</h1>
      </header>

      {availableStallsByMarket.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {availableStallsByMarket.map(market => (
            <AccordionItem value={market.marketId} key={market.marketId}>
              <AccordionTrigger className="text-lg font-semibold">{market.marketName} ({market.stalls.length} แผงว่าง)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                    {market.stalls.map(stall => (
                    <Card key={stall.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">แผง {stall.id}</p>
                                <p className="text-sm text-muted-foreground">ค่าธรรมเนียม: {stall.fee.toLocaleString()} บาท/วัน</p>
                            </div>
                            <Button asChild size="sm">
                                <Link href={`/dashboard/services/receipt?type=market&id=${market.marketId}-${stall.id}&location=${encodeURIComponent(market.marketName + ', แผง ' + stall.id)}&fee=${stall.fee}`}>
                                    ลงทะเบียน
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>ไม่มีแผงตลาดว่าง</AlertTitle>
          <AlertDescription>
            ขออภัย ขณะนี้ไม่มีแผงตลาดว่างให้บริการ กรุณาตรวจสอบอีกครั้งในภายหลัง
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
