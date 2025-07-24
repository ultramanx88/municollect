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

type ParkingSpace = {
    id: string;
    location: string;
    tenant: string;
    status: 'ว่าง' | 'มีผู้เช่า';
    monthlyFee: number;
};

const initialParkingSpaces: ParkingSpace[] = [
  {
    id: 'P-001',
    location: 'ลานจอด A-01',
    tenant: 'นายสมชาย ใจดี',
    status: 'มีผู้เช่า',
    monthlyFee: 500,
  },
  {
    id: 'P-002',
    location: 'ลานจอด A-02',
    tenant: '',
    status: 'ว่าง',
    monthlyFee: 500,
  },
  {
    id: 'P-003',
    location: 'ใต้อาคาร B-05',
    tenant: 'นางสาวสมหญิง รักไทย',
    status: 'มีผู้เช่า',
    monthlyFee: 800,
  },
];

export default function ParkingPage() {
    const [parkingSpaces, setParkingSpaces] = useState(initialParkingSpaces);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newLocation, setNewLocation] = useState('');
    const [newMonthlyFee, setNewMonthlyFee] = useState('');

    const resetForm = () => {
        setNewLocation('');
        setNewMonthlyFee('');
    };
    
    const handleAddParkingSpace = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newLocation || !newMonthlyFee) return;

        const newSpace: ParkingSpace = {
            id: `P-${String(parkingSpaces.length + 1).padStart(3, '0')}`,
            location: newLocation,
            tenant: '',
            status: 'ว่าง',
            monthlyFee: Number(newMonthlyFee),
        };
        setParkingSpaces([...parkingSpaces, newSpace]);
        
        resetForm();
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการที่จอดรถ</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มที่จอดรถ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>เพิ่มที่จอดรถใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดของที่จอดรถในความดูแล
                        </DialogDescription>
                        </DialogHeader>
                        <form id="add-parking-form" onSubmit={handleAddParkingSpace} className="grid gap-4 py-4">
                           <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">ตำแหน่ง</Label>
                                <Input id="location" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="เช่น ลานจอด A-01" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rent" className="text-right">ค่าเช่า (บาท/เดือน)</Label>
                                <Input id="rent" type="number" value={newMonthlyFee} onChange={e => setNewMonthlyFee(e.target.value)} placeholder="500" className="col-span-3" required />
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="submit" form="add-parking-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการที่จอดรถ</CardTitle>
                    <CardDescription>
                        ที่จอดรถทั้งหมดในความดูแลของเทศบาล
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>รหัส/ตำแหน่ง</TableHead>
                        <TableHead>ผู้เช่า</TableHead>
                        <TableHead>ค่าเช่า (บาท/เดือน)</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parkingSpaces.map((space) => (
                            <TableRow key={space.id}>
                                <TableCell className="font-medium">{space.location} ({space.id})</TableCell>
                                <TableCell>{space.tenant || '-'}</TableCell>
                                <TableCell>{space.monthlyFee.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={space.status === 'ว่าง' ? 'default' : 'secondary'} className={space.status === 'ว่าง' ? 'bg-accent text-accent-foreground' : ''}>
                                        {space.status}
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
                         {parkingSpaces.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    ยังไม่มีข้อมูลที่จอดรถ
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
