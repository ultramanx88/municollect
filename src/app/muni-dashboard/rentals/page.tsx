'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RentalSpace = {
    id: string;
    name: string;
    type: string;
    tenant: string;
    status: 'ว่าง' | 'มีผู้เช่า';
    rentAmount: number;
};

const initialRentals: RentalSpace[] = [
  {
    id: 'RNT-001',
    name: 'อาคารพาณิชย์ A1',
    type: 'พาณิชย์',
    tenant: 'ร้านสะดวกซื้อ',
    status: 'มีผู้เช่า',
    rentAmount: 15000,
  },
  {
    id: 'RNT-002',
    name: 'บ้านเลขที่ 123/4',
    type: 'ที่อยู่อาศัย',
    tenant: 'นายสมชาย ใจดี',
    status: 'มีผู้เช่า',
    rentAmount: 8000,
  },
  {
    id: 'RNT-003',
    name: 'อาคารพาณิชย์ B2',
    type: 'พาณิชย์',
    tenant: '',
    status: 'ว่าง',
    rentAmount: 12000,
  },
];

export default function RentalsPage() {
    const [rentals, setRentals] = useState(initialRentals);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state can be added here for adding new rentals

    const handleAddRental = (event: React.FormEvent) => {
        event.preventDefault();
        // Add logic to add new rental
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการพื้นที่เช่า</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มพื้นที่เช่า
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>เพิ่มพื้นที่เช่าใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดของพื้นที่เช่าในความดูแล
                        </DialogDescription>
                        </DialogHeader>
                        <form id="add-rental-form" onSubmit={handleAddRental} className="grid gap-4 py-4">
                           {/* Inputs for new rental */}
                           <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">ชื่อ/ที่อยู่</Label>
                                <Input id="name" placeholder="เช่น อาคาร A1" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">ประเภท</Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="เลือกประเภท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="พาณิชย์">พาณิชย์</SelectItem>
                                        <SelectItem value="ที่อยู่อาศัย">ที่อยู่อาศัย</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rent" className="text-right">ค่าเช่า (บาท/เดือน)</Label>
                                <Input id="rent" type="number" placeholder="10000" className="col-span-3" required />
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="submit" form="add-rental-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการพื้นที่เช่า</CardTitle>
                    <CardDescription>
                        พื้นที่เช่าทั้งหมดในความดูแลของเทศบาล
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>รหัส</TableHead>
                        <TableHead>ชื่อ/ที่อยู่</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>ผู้เช่า</TableHead>
                        <TableHead>ค่าเช่า (บาท)</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals.map((rental) => (
                            <TableRow key={rental.id}>
                                <TableCell className="font-medium">{rental.id}</TableCell>
                                <TableCell>{rental.name}</TableCell>
                                <TableCell>{rental.type}</TableCell>
                                <TableCell>{rental.tenant || '-'}</TableCell>
                                <TableCell>{rental.rentAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={rental.status === 'ว่าง' ? 'default' : 'secondary'} className={rental.status === 'ว่าง' ? 'bg-accent text-accent-foreground' : ''}>
                                        {rental.status}
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
                                            <DropdownMenuItem>จัดการผู้เช่า</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {rentals.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    ยังไม่มีข้อมูลพื้นที่เช่า
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
