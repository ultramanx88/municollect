'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Trash2, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type MarketStall = {
    id: string;
    vendor: string;
    status: 'ว่าง' | 'มีผู้ค้า';
    fee: number;
};

const initialStalls: { [key: string]: MarketStall[] } = {
    'MKT-001': [
        { id: 'A-01', vendor: 'ป้าสมศรี ขายผัก', status: 'มีผู้ค้า', fee: 100 },
        { id: 'A-02', vendor: '', status: 'ว่าง', fee: 100 },
        { id: 'B-12', vendor: 'ลุงโปร่ง ขายผลไม้', status: 'มีผู้ค้า', fee: 120 },
    ],
    'MKT-002': [
        { id: 'R-05', vendor: 'ลุงมี ขายไก่ย่าง', status: 'มีผู้ค้า', fee: 150 },
    ],
    'MKT-003': []
};

const marketNames: { [key: string]: string } = {
    'MKT-001': 'ตลาดสดเทศบาล',
    'MKT-002': 'ตลาดโต้รุ่ง',
    'MKT-003': 'ตลาดนัดคลองถม',
};

export default function MarketStallsPage() {
    const params = useParams();
    const marketId = Array.isArray(params.marketId) ? params.marketId[0] : params.marketId;
    const marketName = marketId ? marketNames[marketId] : 'ไม่พบตลาด';
    
    const [stalls, setStalls] = useState(marketId ? (initialStalls[marketId] || []) : []);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const handleAddStall = (event: React.FormEvent) => {
        event.preventDefault();
        // Add logic to add new stall to the current market
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
                        <Link href="/muni-dashboard/markets">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับไปหน้ารายการตลาด
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">จัดการแผงค้า: {marketName}</h1>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มแผงค้า
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>เพิ่มแผงค้าใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดของแผงค้าสำหรับตลาด "{marketName}"
                        </DialogDescription>
                        </DialogHeader>
                        <form id="add-stall-form" onSubmit={handleAddStall} className="grid gap-4 py-4">
                           <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stall-id" className="text-right">รหัสแผง</Label>
                                <Input id="stall-id" placeholder="เช่น A-05" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fee" className="text-right">ค่าธรรมเนียม (บาท/วัน)</Label>
                                <Input id="fee" type="number" placeholder="100" className="col-span-3" required />
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="submit" form="add-stall-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการแผงค้า</CardTitle>
                    <CardDescription>
                        แผงค้าทั้งหมดใน {marketName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>รหัสแผง</TableHead>
                        <TableHead>ผู้ค้า</TableHead>
                        <TableHead>ค่าธรรมเนียม (บาท/วัน)</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stalls.map((stall) => (
                            <TableRow key={stall.id}>
                                <TableCell className="font-medium">{stall.id}</TableCell>
                                <TableCell>{stall.vendor || '-'}</TableCell>
                                <TableCell>{stall.fee.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={stall.status === 'ว่าง' ? 'default' : 'secondary'} className={stall.status === 'ว่าง' ? 'bg-accent text-accent-foreground' : ''}>
                                        {stall.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>แก้ไขข้อมูล</DropdownMenuItem>
                                            <DropdownMenuItem>จัดการผู้ค้า</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {stalls.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    ยังไม่มีข้อมูลแผงค้าในตลาดนี้
                                </TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    );
}
