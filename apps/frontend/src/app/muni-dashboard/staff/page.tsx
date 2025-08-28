
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialStaff, type Staff } from '@/data/mock-data';

const roleNames: Record<Staff['role'], string> = {
    'Admin': 'ผู้ดูแลระบบ',
    'Finance': 'เจ้าหน้าที่การเงิน',
    'Services': 'เจ้าหน้าที่บริการ',
    'General': 'เจ้าหน้าที่ทั่วไป',
    'Collector': 'พนักงานเก็บขยะ',
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState(initialStaff);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // State for the form, to handle both Add and Edit
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Staff['role']>('General');

    const openAddDialog = () => {
        setDialogMode('add');
        setCurrentStaff(null);
        setName('');
        setEmail('');
        setRole('General');
        setIsDialogOpen(true);
    };

    const openEditDialog = (staffMember: Staff) => {
        setDialogMode('edit');
        setCurrentStaff(staffMember);
        setName(staffMember.name);
        setEmail(staffMember.email);
        setRole(staffMember.role);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (dialogMode === 'add') {
            const newStaffMember: Staff = {
                id: `STF-${String(staffList.length + 1).padStart(3, '0')}`,
                name,
                email,
                role,
                status: 'Active',
            };
            setStaffList(prevStaff => [...prevStaff, newStaffMember]);
        } else if (dialogMode === 'edit' && currentStaff) {
            setStaffList(prevStaff => 
                prevStaff.map(s => 
                    s.id === currentStaff.id ? { ...s, name, email, role } : s
                )
            );
        }

        setIsDialogOpen(false);
    };

    const handleToggleStatus = (staffId: string) => {
        setStaffList(prevStaff =>
            prevStaff.map(s =>
                s.id === staffId
                    ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
                    : s
            )
        );
    };

    const handleDelete = (staffId: string) => {
        // Here you would typically show a confirmation dialog first
        setStaffList(prevStaff => prevStaff.filter(s => s.id !== staffId));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการบุคลากร</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มบุคลากร
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{dialogMode === 'add' ? 'เพิ่มบุคลากรใหม่' : 'แก้ไขข้อมูลบุคลากร'}</DialogTitle>
                            <DialogDescription>
                                {dialogMode === 'add' 
                                    ? 'สร้างบัญชีสำหรับเจ้าหน้าที่เพื่อเข้าใช้งานระบบ' 
                                    : 'อัปเดตข้อมูลสำหรับ ' + currentStaff?.name
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <form id="staff-form" onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="staff-name">ชื่อ-นามสกุล</Label>
                                <Input id="staff-name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="staff-email">อีเมล</Label>
                                <Input id="staff-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="staff-role">บทบาท (Role)</Label>
                                <Select value={role} onValueChange={(value) => setRole(value as Staff['role'])}>
                                    <SelectTrigger id="staff-role">
                                        <SelectValue placeholder="เลือกบทบาท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(roleNames).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">ยกเลิก</Button></DialogClose>
                            <Button type="submit" form="staff-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายชื่อบุคลากรในระบบ</CardTitle>
                    <CardDescription>
                        จัดการบัญชีและสิทธิ์การเข้าถึงของเจ้าหน้าที่
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>บทบาท</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffList.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell>{roleNames[s.role]}</TableCell>
                                <TableCell>
                                    <Badge variant={s.status === 'Active' ? 'default' : 'destructive'} className={s.status === 'Active' ? 'bg-accent text-accent-foreground' : ''}>
                                        {s.status === 'Active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openEditDialog(s)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                แก้ไขข้อมูล
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(s.id)}>
                                                {s.status === 'Active' ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                                {s.status === 'Active' ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบข้อมูล
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {staffList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    ยังไม่มีข้อมูลบุคลากร
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
