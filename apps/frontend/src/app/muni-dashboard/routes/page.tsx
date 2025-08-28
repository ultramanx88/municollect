'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialRoutes, initialStaff, initialResidents, type Route, type Staff, type Resident } from '@/data/mock-data';

export default function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
    const [residents, setResidents] = useState<Resident[]>(initialResidents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Add/Edit Dialog state
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
    const [routeName, setRouteName] = useState('');
    const [routeArea, setRouteArea] = useState('');
    const [collectorId, setCollectorId] = useState<string | undefined>('');

    const collectors = useMemo(() => staffList.filter(s => s.role === 'Collector' && s.status === 'Active'), [staffList]);

    const getCollectorName = (collectorId?: string) => {
        return staffList.find(s => s.id === collectorId)?.name || 'ยังไม่กำหนด';
    };

    const getResidentCount = (routeId: string) => {
        return residents.filter(r => r.routeId === routeId).length;
    };

    const openAddDialog = () => {
        setDialogMode('add');
        setCurrentRoute(null);
        setRouteName('');
        setRouteArea('');
        setCollectorId(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (route: Route) => {
        setDialogMode('edit');
        setCurrentRoute(route);
        setRouteName(route.name);
        setRouteArea(route.area);
        setCollectorId(route.collectorId);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (dialogMode === 'add') {
            const newRoute: Route = {
                id: `R-${String(routes.length + 1).padStart(2, '0')}`,
                name: routeName,
                area: routeArea,
                collectorId: collectorId,
            };
            setRoutes(prev => [...prev, newRoute]);
        } else if (dialogMode === 'edit' && currentRoute) {
            setRoutes(prev => 
                prev.map(r => 
                    r.id === currentRoute.id ? { ...r, name: routeName, area: routeArea, collectorId: collectorId } : r
                )
            );
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (routeId: string) => {
        // In a real app, check if residents are assigned and handle it gracefully
        setRoutes(prev => prev.filter(r => r.id !== routeId));
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการสายเก็บขยะ</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มสายใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{dialogMode === 'add' ? 'เพิ่มสายเก็บขยะใหม่' : 'แก้ไขข้อมูลสายเก็บขยะ'}</DialogTitle>
                            <DialogDescription>
                                กำหนดเส้นทางและผู้รับผิดชอบในการจัดเก็บขยะ
                            </DialogDescription>
                        </DialogHeader>
                        <form id="route-form" onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="route-name">ชื่อสาย/รหัสสาย</Label>
                                <Input id="route-name" value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="เช่น สาย A1, สายเหนือ" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="route-area">พื้นที่รับผิดชอบ</Label>
                                <Input id="route-area" value={routeArea} onChange={(e) => setRouteArea(e.target.value)} placeholder="เช่น โซนเหนือ, ถนนสุขุมวิท" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="collector-select">เจ้าหน้าที่ผู้รับผิดชอบ</Label>
                                <Select value={collectorId} onValueChange={(value) => setCollectorId(value)}>
                                    <SelectTrigger id="collector-select">
                                        <SelectValue placeholder="เลือกเจ้าหน้าที่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=''>ไม่กำหนด</SelectItem>
                                        {collectors.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">ยกเลิก</Button></DialogClose>
                            <Button type="submit" form="route-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการสายเก็บขยะ</CardTitle>
                    <CardDescription>
                        สายการจัดเก็บขยะทั้งหมดในความดูแลของเทศบาล
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>ชื่อสาย/รหัส</TableHead>
                        <TableHead>พื้นที่รับผิดชอบ</TableHead>
                        <TableHead>ผู้รับผิดชอบ</TableHead>
                        <TableHead>จำนวนบ้าน</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route.id}>
                                <TableCell className="font-medium">{route.name}</TableCell>
                                <TableCell>{route.area}</TableCell>
                                <TableCell>{getCollectorName(route.collectorId)}</TableCell>
                                <TableCell>{getResidentCount(route.id).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(route)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                แก้ไข
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(route.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {routes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    ยังไม่มีข้อมูลสายเก็บขยะ
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
