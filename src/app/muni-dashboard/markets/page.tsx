'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Trash2, Pencil, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type Market = {
    id: string;
    name: string;
    location: string;
    operatingDays: string[];
    stallCount: number;
};

const initialMarkets: Market[] = [
  {
    id: 'MKT-001',
    name: 'ตลาดสดเทศบาล',
    location: 'ใจกลางเมือง',
    operatingDays: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
    stallCount: 50,
  },
  {
    id: 'MKT-002',
    name: 'ตลาดโต้รุ่ง',
    location: 'ข้างสถานีรถไฟ',
    operatingDays: ['พุธ', 'ศุกร์', 'เสาร์'],
    stallCount: 30,
  },
  {
    id: 'MKT-003',
    name: 'ตลาดนัดคลองถม',
    location: 'ลานอเนกประสงค์',
    operatingDays: ['อาทิตย์'],
    stallCount: 120,
  },
];

const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export default function MarketsListPage() {
    const [markets, setMarkets] = useState(initialMarkets);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMarketName, setNewMarketName] = useState('');
    const [newMarketLocation, setNewMarketLocation] = useState('');
    const [newOperatingDays, setNewOperatingDays] = useState<string[]>([]);

    const handleAddMarket = (event: React.FormEvent) => {
        event.preventDefault();
        const newMarket: Market = {
            id: `MKT-${String(markets.length + 1).padStart(3, '0')}`,
            name: newMarketName,
            location: newMarketLocation,
            operatingDays: newOperatingDays,
            stallCount: 0,
        };
        setMarkets([...markets, newMarket]);
        setIsDialogOpen(false);
        setNewMarketName('');
        setNewMarketLocation('');
        setNewOperatingDays([]);
    };

    const handleDayChange = (day: string) => {
        setNewOperatingDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการตลาด</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มตลาดใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>เพิ่มตลาดใหม่</DialogTitle>
                            <DialogDescription>
                                กรอกรายละเอียดของตลาดในความดูแลของเทศบาล
                            </DialogDescription>
                        </DialogHeader>
                        <form id="add-market-form" onSubmit={handleAddMarket} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="market-name">ชื่อตลาด</Label>
                                <Input id="market-name" value={newMarketName} onChange={(e) => setNewMarketName(e.target.value)} placeholder="เช่น ตลาดสดเทศบาล" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="market-location">ที่ตั้ง</Label>
                                <Input id="market-location" value={newMarketLocation} onChange={(e) => setNewMarketLocation(e.target.value)} placeholder="เช่น ใจกลางเมือง" required />
                            </div>
                            <div className="grid gap-2">
                                <Label>วันทำการ</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-md border p-2">
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${day}`}
                                                checked={newOperatingDays.includes(day)}
                                                onCheckedChange={() => handleDayChange(day)}
                                            />
                                            <Label htmlFor={`day-${day}`} className="font-normal cursor-pointer">{day}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">ยกเลิก</Button></DialogClose>
                            <Button type="submit" form="add-market-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการตลาดในความดูแล</CardTitle>
                    <CardDescription>
                        ตลาดทั้งหมดในความดูแลของเทศบาล
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>ชื่อตลาด</TableHead>
                        <TableHead>ที่ตั้ง</TableHead>
                        <TableHead className="hidden md:table-cell">วันทำการ</TableHead>
                        <TableHead>จำนวนแผง</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {markets.map((market) => (
                            <TableRow key={market.id}>
                                <TableCell className="font-medium">{market.name}</TableCell>
                                <TableCell>{market.location}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                    {market.operatingDays.length === 7 ? (
                                        <Badge variant="secondary">ทุกวัน</Badge>
                                    ) : market.operatingDays.map(day => (
                                        <Badge key={day} variant="secondary">{day}</Badge>
                                    ))}
                                    </div>
                                </TableCell>
                                <TableCell>{market.stallCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/muni-dashboard/markets/${market.id}`}>
                                                <ExternalLink className="mr-2 h-3 w-3" />
                                                จัดการแผงค้า
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    แก้ไขข้อมูล
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    ลบตลาด
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {markets.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    ยังไม่มีข้อมูลตลาด
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
