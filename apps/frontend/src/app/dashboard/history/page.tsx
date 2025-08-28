import { CheckCircle2, ReceiptText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const invoices = [
  {
    id: 1,
    period: 'กรกฎาคม 2567',
    date: '2024-07-15',
    amount: '605.50 THB',
    status: 'ชำระแล้ว',
  },
  {
    id: 2,
    period: 'มิถุนายน 2567',
    date: '2024-06-15',
    amount: '548.00 THB',
    status: 'ชำระแล้ว',
  },
  {
    id: 3,
    period: 'พฤษภาคม 2567',
    date: '2024-05-15',
    amount: '552.75 THB',
    status: 'ชำระแล้ว',
  },
   {
    id: 4,
    period: 'เมษายน 2567',
    date: '2024-04-15',
    amount: '591.20 THB',
    status: 'ชำระแล้ว',
  },
];

export default function HistoryPage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800 flex-grow text-center">ประวัติการชำระเงิน</h1>
      </header>
      
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <ReceiptText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">ใบแจ้งหนี้: {invoice.period}</p>
                  <p className="text-sm text-muted-foreground">วันที่ชำระ: {invoice.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{invoice.amount}</p>
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {invoice.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
