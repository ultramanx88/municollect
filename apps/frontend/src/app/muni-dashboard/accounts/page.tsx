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
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Account = {
    id: string;
    bank: string;
    accountName: string;
    accountNumber: string;
    type: string;
    isDefault: boolean;
};

const initialAccounts: Account[] = [
  {
    id: 'ACC-001',
    bank: 'ธนาคารกรุงไทย',
    accountName: 'เทศบาลเมืองเอนี่ทาวน์',
    accountNumber: '123-4-56789-0',
    type: 'ออมทรัพย์',
    isDefault: true,
  },
  {
    id: 'ACC-002',
    bank: 'ธนาคารไทยพาณิชย์',
    accountName: 'เทศบาลเมืองเอนี่ทาวน์เพื่อการประปา',
    accountNumber: '987-6-54321-0',
    type: 'กระแสรายวัน',
    isDefault: false,
  },
];

export default function AccountsPage() {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [newBank, setNewBank] = useState('ธนาคารกรุงไทย');
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newAccountType, setNewAccountType] = useState('ออมทรัพย์');

    const resetForm = () => {
        setNewBank('ธนาคารกรุงไทย');
        setNewAccountName('');
        setNewAccountNumber('');
        setNewAccountType('ออมทรัพย์');
    }

    const handleAddAccount = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newAccountName || !newAccountNumber || !newBank) return;

        const newAccount: Account = {
            id: `ACC-${String(accounts.length + 1).padStart(3, '0')}`,
            bank: newBank,
            accountName: newAccountName,
            accountNumber: newAccountNumber,
            type: newAccountType,
            isDefault: accounts.length === 0,
        };
        setAccounts([...accounts, newAccount]);
        
        resetForm();
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการบัญชีรับเงิน</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มบัญชีใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>เพิ่มบัญชีธนาคารใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดบัญชีธนาคารสำหรับรับชำระเงิน
                        </DialogDescription>
                        </DialogHeader>
                        <form id="add-account-form" onSubmit={handleAddAccount} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bank" className="text-right">
                                    ธนาคาร
                                </Label>
                                <Input id="bank" value={newBank} onChange={e => setNewBank(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-name" className="text-right">
                                    ชื่อบัญชี
                                </Label>
                                <Input id="account-name" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} placeholder="ชื่อตามหน้าสมุดบัญชี" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-number" className="text-right">
                                    เลขที่บัญชี
                                </Label>
                                <Input id="account-number" value={newAccountNumber} onChange={e => setNewAccountNumber(e.target.value)} placeholder="XXX-X-XXXXX-X" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-type" className="text-right">
                                    ประเภท
                                </Label>
                                <Select value={newAccountType} onValueChange={setNewAccountType}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="เลือกประเภทบัญชี" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ออมทรัพย์">ออมทรัพย์</SelectItem>
                                        <SelectItem value="กระแสรายวัน">กระแสรายวัน</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="submit" form="add-account-form">บันทึก</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายการบัญชีธนาคาร</CardTitle>
                    <CardDescription>
                        รายการบัญชีทั้งหมดที่ผูกกับเทศบาลของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>ธนาคาร</TableHead>
                        <TableHead>ชื่อบัญชี</TableHead>
                        <TableHead>เลขที่บัญชี</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="font-medium">{account.bank}</TableCell>
                                <TableCell>{account.accountName}</TableCell>
                                <TableCell>{account.accountNumber}</TableCell>
                                <TableCell>{account.type}</TableCell>
                                <TableCell>
                                    {account.isDefault && <Badge variant="default" className="bg-accent text-accent-foreground">ค่าเริ่มต้น</Badge>}
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
                                            <DropdownMenuItem disabled={account.isDefault}>ตั้งเป็นค่าเริ่มต้น</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบบัญชี
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {accounts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    ยังไม่มีบัญชีรับเงิน เพิ่มบัญชีแรกของคุณได้เลย
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
