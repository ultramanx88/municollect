import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const residents = [
  {
    id: 'HH-001',
    name: 'สมชาย ใจดี',
    address: '123/45 หมู่ 6 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270',
    email: 'somchai.j@example.com',
    phone: '081-234-5678',
  },
  {
    id: 'HH-002',
    name: 'สมหญิง รักไทย',
    address: '99/1 ซ.สุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260',
    email: 'somyin.r@example.com',
    phone: '089-876-5432',
  },
  {
    id: 'HH-003',
    name: 'มานะ พากเพียร',
    address: '55/5 ถนนเพชรเกษม ต.อ้อมน้อย อ.กระทุ่มแบน จ.สมุทรสาคร 74130',
    email: 'mana.p@example.com',
    phone: '098-111-2222',
  },
];

export default function ResidentsPage() {
  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">ข้อมูลผู้พักอาศัย</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้พักอาศัยที่ลงทะเบียน</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสประจำบ้าน</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>ที่อยู่</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทรศัพท์</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.id}</TableCell>
                    <TableCell>{resident.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{resident.address}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>{resident.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
