
'use client';

import { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, FilePlus2, FileDown, Edit, Loader2, Sparkles, Search, ReceiptText, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { estimateWaste, type EstimateWasteOutput } from '@/ai/flows/estimate-waste-flow';
import { initialResidents, mockInvoices, initialRoutes, type Resident, type Invoice, type Route } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

const getResidentInvoices = (residentId: string): Invoice[] => {
    return mockInvoices[residentId] || [];
};

export default function MuniResidentsPage() {
    const [residents, setResidents] = useState(initialResidents);
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for Invoice Management Dialog
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
    const [newBillService, setNewBillService] = useState('');
    const [newBillPeriod, setNewBillPeriod] = useState('');
    const [newBillAmount, setNewBillAmount] = useState('');
    const [newBillDueDate, setNewBillDueDate] = useState('');
    const [aiDescription, setAiDescription] = useState('');
    const [aiPhotoFile, setAiPhotoFile] = useState<File | null>(null);
    const [aiPhotoPreview, setAiPhotoPreview] = useState<string | null>(null);
    const [aiEstimation, setAiEstimation] = useState<EstimateWasteOutput | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // State for Resident Form (Add/Edit) Dialog
    const [isResidentFormOpen, setIsResidentFormOpen] = useState(false);
    const [residentFormMode, setResidentFormMode] = useState<'add' | 'edit'>('add');
    const [editableResident, setEditableResident] = useState<Partial<Resident> | null>(null);


    const filteredResidents = useMemo(() => {
        if (!searchQuery) {
            return residents;
        }
        return residents.filter(resident => 
            resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resident.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, residents]);
    
    // --- Invoice Dialog Handlers ---
    const handleOpenInvoiceDialog = (resident: Resident) => {
        setSelectedResident(resident);
        setAllInvoices(getResidentInvoices(resident.id));
        setIsInvoiceDialogOpen(true);
        resetInvoiceForms();
    };

    const handleCloseInvoiceDialog = () => {
        setIsInvoiceDialogOpen(false);
        setSelectedResident(null);
        resetInvoiceForms();
    }

    const resetInvoiceForms = () => {
        setNewBillService('');
        setNewBillPeriod('');
        setNewBillAmount('');
        setNewBillDueDate('');
        setAiDescription('');
        setAiPhotoFile(null);
        setAiPhotoPreview(null);
        setAiEstimation(null);
        setIsEstimating(false);
        setAiError(null);
        setActiveAccordion(undefined);
    }
    
    // --- Resident Form (Add/Edit) Handlers ---
    const handleOpenAddResidentDialog = () => {
        setResidentFormMode('add');
        setEditableResident({ name: '', address: '', email: '', routeId: '' });
        setIsResidentFormOpen(true);
    };

    const handleOpenEditResidentDialog = (resident: Resident) => {
        setResidentFormMode('edit');
        setEditableResident(resident);
        setIsResidentFormOpen(true);
    };

    const handleCloseResidentForm = () => {
        setIsResidentFormOpen(false);
        setEditableResident(null);
    };

    const handleResidentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editableResident) return;
        const { name, value } = e.target;
        setEditableResident(prev => ({ ...prev, [name]: value }));
    };

    const handleRouteSelectChange = (value: string) => {
        if (!editableResident) return;
        setEditableResident(prev => ({ ...prev, routeId: value === 'none' ? undefined : value }));
    };

    const handleResidentFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editableResident || !editableResident.name || !editableResident.address) {
            toast({ variant: 'destructive', title: 'ข้อมูลไม่ครบถ้วน', description: 'กรุณากรอกชื่อและที่อยู่' });
            return;
        };

        if (residentFormMode === 'add') {
            const newResident: Resident = {
                id: `HH-${String(Date.now()).slice(-4)}`,
                name: editableResident.name || '',
                address: editableResident.address || '',
                email: editableResident.email || '',
                routeId: editableResident.routeId,
            };
            setResidents(prev => [...prev, newResident]);
            toast({ title: 'เพิ่มผู้พักอาศัยสำเร็จ' });
        } else { // 'edit' mode
            setResidents(prev => prev.map(r => r.id === editableResident!.id ? { ...r, ...editableResident } as Resident : r));
            toast({ title: 'แก้ไขข้อมูลสำเร็จ' });
        }
        handleCloseResidentForm();
    };

    const handleDeleteResident = (residentId: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้พักอาศัยรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            setResidents(prev => prev.filter(r => r.id !== residentId));
            // In a real app, you would also delete related invoices.
            toast({ variant: 'destructive', title: 'ลบผู้พักอาศัยแล้ว' });
        }
    };


    // --- Other Handlers ---
    const handleRecordPayment = (invoiceId: string) => {
        setAllInvoices(invoices => 
            invoices.map(inv => 
                inv.id === invoiceId 
                ? { ...inv, status: 'ชำระแล้ว (เงินสด)', paidDate: new Date().toISOString().split('T')[0] } 
                : inv
            )
        );
    };
    
    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAiPhotoFile(file);
            setAiPhotoPreview(URL.createObjectURL(file));
            setAiError(null);
            setAiEstimation(null);
        }
    };

    const handleEstimate = async () => {
        if (!aiPhotoFile) {
            setAiError('กรุณาเลือกรูปภาพ');
            return;
        }
        setIsEstimating(true);
        setAiError(null);
        setAiEstimation(null);

        const reader = new FileReader();
        reader.readAsDataURL(aiPhotoFile);
        reader.onload = async () => {
            const photoDataUri = reader.result as string;
            try {
                const result = await estimateWaste({ photoDataUri, description: aiDescription });
                setAiEstimation(result);
            } catch (error) {
                console.error(error);
                setAiError('เกิดข้อผิดพลาดในการประเมินราคาด้วย AI');
            } finally {
                setIsEstimating(false);
            }
        };
        reader.onerror = () => {
            setAiError('ไม่สามารถอ่านไฟล์รูปภาพได้');
            setIsEstimating(false);
        };
    };
    
    const handleApplyEstimation = () => {
        if (aiEstimation) {
            setNewBillService('ค่าจัดการขยะพิเศษ');
            setNewBillAmount(String(aiEstimation.estimatedCost));
            setNewBillPeriod(new Date().toLocaleString('th-TH', { month: 'long', year: 'numeric' }));
            setNewBillDueDate('');
            setActiveAccordion('add-bill-manual');
        }
    };

    const handleAddBill = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (newBillService && newBillAmount && newBillPeriod && newBillDueDate) {
            const newInvoice: Invoice = {
                id: `INV-NEW-${Math.random()}`,
                service: newBillService,
                period: newBillPeriod,
                amount: Number(newBillAmount),
                status: 'ยังไม่ได้ชำระ',
                dueDate: newBillDueDate,
            };
            setAllInvoices(invoices => [newInvoice, ...invoices]);
            
            setNewBillService('');
            setNewBillPeriod('');
            setNewBillAmount('');
            setNewBillDueDate('');
        }
    };
    
    const handleExport = () => {
        const dataToExport = residents.flatMap(resident => {
            const residentInvoices = mockInvoices[resident.id] || [];
            return residentInvoices
                .filter(inv => inv.status.startsWith('ชำระแล้ว'))
                .map(invoice => ({
                    'รหัสประจำบ้าน': resident.id,
                    'ชื่อ-นามสกุล': resident.name,
                    'ที่อยู่': resident.address,
                    'รายการ': invoice.service,
                    'รอบบิล': invoice.period,
                    'จำนวนเงิน': invoice.amount,
                    'สถานะการชำระ': invoice.status,
                    'วันที่ชำระ': invoice.paidDate,
                    'รหัสใบแจ้งหนี้': invoice.id,
                }));
        });

        if (dataToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'ไม่มีข้อมูลสำหรับส่งออก',
                description: 'ไม่พบข้อมูลใบแจ้งหนี้ที่ชำระแล้วในขณะนี้',
            });
            return;
        }
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');

        const cols = Object.keys(dataToExport[0]);
        const colWidths = cols.map(col => ({
            wch: Math.max(...dataToExport.map(row => (row as any)[col]?.toString().length ?? 0), col.length)
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `MuniCollect_Revenue_${new Date().toISOString().split('T')[0]}.xlsx`);

        toast({
            title: 'ส่งออกข้อมูลสำเร็จ',
            description: `ไฟล์ Excel ถูกสร้างเรียบร้อยแล้ว`,
        });
    };

    const getRouteName = (routeId?: string) => {
       if (!routeId) return '-';
       return routes.find(r => r.id === routeId)?.name || 'ไม่พบสาย';
    }

    const unpaidInvoices = allInvoices.filter(inv => inv.status === 'ยังไม่ได้ชำระ');
    const paidInvoices = allInvoices.filter(inv => inv.status.startsWith('ชำระแล้ว')).sort((a, b) => new Date(b.paidDate || 0).getTime() - new Date(a.paidDate || 0).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">จัดการข้อมูลผู้พักอาศัย</h1>
                 <div className="flex gap-2">
                    <Button onClick={handleOpenAddResidentDialog}>
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        เพิ่มผู้พักอาศัย
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to Excel
                    </Button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>รายชื่อผู้พักอาศัย</CardTitle>
                    <CardDescription>
                        รายชื่อผู้พักอาศัยทั้งหมดที่ลงทะเบียนในระบบของเทศบาล
                    </CardDescription>
                </CardHeader>

                <div className="px-6 pb-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาด้วยชื่อ หรือ รหัสประจำบ้าน..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                </div>

                <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>รหัสประจำบ้าน</TableHead>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>ที่อยู่</TableHead>
                        <TableHead>สายเก็บขยะ</TableHead>
                        <TableHead className="text-right">
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResidents.map((resident) => (
                            <TableRow key={resident.id}>
                                <TableCell className="font-medium">{resident.id}</TableCell>
                                <TableCell>{resident.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{resident.address}</TableCell>
                                <TableCell>{getRouteName(resident.routeId)}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleOpenInvoiceDialog(resident)}>
                                                <ReceiptText className="mr-2 h-4 w-4" />
                                                จัดการบิล
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenEditResidentDialog(resident)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                แก้ไขข้อมูล
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteResident(resident.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                ลบข้อมูล
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {filteredResidents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    {searchQuery ? "ไม่พบข้อมูลที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลผู้พักอาศัย"}
                                </TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            {/* Invoice Management Dialog */}
            <Dialog open={isInvoiceDialogOpen} onOpenChange={(open) => !open && handleCloseInvoiceDialog()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>จัดการบิลสำหรับ {selectedResident?.name}</DialogTitle>
                        <DialogDescription>
                            ที่อยู่: {selectedResident?.address}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="unpaid" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="unpaid">รายการค้างชำระ ({unpaidInvoices.length})</TabsTrigger>
                            <TabsTrigger value="history">ประวัติการชำระ ({paidInvoices.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="unpaid" className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-3">
                            <h4 className="font-semibold text-md">รายการที่ยังไม่ชำระ</h4>
                            {unpaidInvoices.length > 0 ? (
                                <div className="space-y-2">
                                    {unpaidInvoices.map(invoice => (
                                        <div key={invoice.id} className="flex items-center justify-between p-2 border rounded-md">
                                            <div>
                                                <p className="font-medium">{invoice.service} ({invoice.period})</p>
                                                <p className="text-sm text-muted-foreground">{invoice.amount.toFixed(2)} บาท | กำหนดชำระ: {invoice.dueDate}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRecordPayment(invoice.id)}
                                            >
                                                บันทึกชำระเงินสด
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีรายการค้างชำระ</p>
                            )}
                            
                            <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                                <AccordionItem value="add-bill-ai">
                                    <AccordionTrigger>
                                        <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> ประเมินค่าขยะพิเศษด้วย AI</span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid gap-4 pt-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="ai-description">คำอธิบายลักษณะขยะ</Label>
                                                <Textarea id="ai-description" value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} placeholder="เช่น ขยะจากงานเลี้ยง, กิ่งไม้, โซฟาเก่า" />
                                            </div>
                                            <div className="grid gap-2">
                                                 <Label>รูปภาพขยะ</Label>
                                                 {aiPhotoPreview && <Image src={aiPhotoPreview} alt="Preview" width={150} height={150} className="rounded-md object-cover" />}
                                                <Input id="ai-photo" ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
                                            </div>
                                            <Button onClick={handleEstimate} disabled={isEstimating || !aiPhotoFile}>
                                                {isEstimating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isEstimating ? 'กำลังประเมิน...' : 'ประเมินราคาด้วย AI'}
                                            </Button>
                                            {aiError && <Alert variant="destructive"><AlertDescription>{aiError}</AlertDescription></Alert>}
                                            {aiEstimation && (
                                                <Alert variant="default" className="border-accent">
                                                    <AlertTitle className="text-accent flex items-center gap-2">ผลการประเมิน</AlertTitle>
                                                    <AlertDescription className="space-y-2">
                                                       <p className="text-lg font-bold">ราคาประเมิน: {aiEstimation.estimatedCost.toLocaleString()} บาท</p>
                                                       <p><strong className="font-medium">เหตุผล:</strong> {aiEstimation.justification}</p>
                                                       <Button size="sm" className="mt-2" onClick={handleApplyEstimation}>ใช้ราคานี้เพื่อสร้างบิล</Button>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="add-bill-manual">
                                    <AccordionTrigger>เพิ่มใบแจ้งหนี้ด้วยตนเอง</AccordionTrigger>
                                    <AccordionContent>
                                        <form id="add-bill-form" onSubmit={handleAddBill} className="grid gap-4 pt-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="service-form" className="text-right">บริการ</Label>
                                                <Select name="service" required value={newBillService} onValueChange={setNewBillService}>
                                                    <SelectTrigger id="service-form" className="col-span-3">
                                                        <SelectValue placeholder="เลือกประเภทบริการ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ค่าจัดการขยะ">ค่าจัดการขยะ</SelectItem>
                                                        <SelectItem value="ค่าจัดการขยะพิเศษ">ค่าจัดการขยะพิเศษ</SelectItem>
                                                        <SelectItem value="ค่าน้ำประปา">ค่าน้ำประปา</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="period-form" className="text-right">รอบบิล</Label>
                                                <Input id="period-form" name="period" value={newBillPeriod} onChange={e => setNewBillPeriod(e.target.value)} placeholder="เช่น สิงหาคม 2567" className="col-span-3" required />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="amount-form" className="text-right">จำนวนเงิน</Label>
                                                <Input id="amount-form" name="amount" type="number" value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder="0.00" className="col-span-3" required />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="due-date-form" className="text-right">กำหนดชำระ</Label>
                                                <Input id="due-date-form" name="due-date" type="date" value={newBillDueDate} onChange={e => setNewBillDueDate(e.target.value)} className="col-span-3" required />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <Button type="submit">เพิ่มรายการ</Button>
                                            </div>
                                        </form>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>

                        <TabsContent value="history" className="mt-4 max-h-[65vh] overflow-y-auto pr-3">
                            {paidInvoices.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>รอบบิล</TableHead>
                                            <TableHead>รายการ</TableHead>
                                            <TableHead>จำนวนเงิน</TableHead>
                                            <TableHead>วันที่ชำระ</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paidInvoices.map(invoice => (
                                            <TableRow key={invoice.id}>
                                                <TableCell>{invoice.period}</TableCell>
                                                <TableCell>{invoice.service}</TableCell>
                                                <TableCell>{invoice.amount.toFixed(2)}</TableCell>
                                                <TableCell>{invoice.paidDate}</TableCell>
                                                <TableCell>
                                                    <Badge variant={invoice.status === 'ชำระแล้ว (เงินสด)' ? 'secondary' : 'default'} className={invoice.status === 'ชำระแล้ว (ระบบ)' ? 'bg-accent text-accent-foreground' : ''}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีประวัติการชำระเงิน</p>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-4 pt-4 border-t">
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseInvoiceDialog}>ปิด</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resident Add/Edit Dialog */}
            <Dialog open={isResidentFormOpen} onOpenChange={(open) => !open && handleCloseResidentForm()}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{residentFormMode === 'add' ? 'เพิ่มผู้พักอาศัยใหม่' : `แก้ไขข้อมูล: ${editableResident?.name}`}</DialogTitle>
                    <DialogDescription>
                        กรอกข้อมูลของผู้พักอาศัยให้ครบถ้วน
                    </DialogDescription>
                    </DialogHeader>
                    <form id="resident-form" onSubmit={handleResidentFormSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                            <Input id="name" name="name" value={editableResident?.name || ''} onChange={handleResidentFormChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">ที่อยู่</Label>
                            <Textarea id="address" name="address" value={editableResident?.address || ''} onChange={handleResidentFormChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input id="email" name="email" type="email" value={editableResident?.email || ''} onChange={handleResidentFormChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="routeId">สายเก็บขยะ</Label>
                            <Select name="routeId" value={editableResident?.routeId || 'none'} onValueChange={handleRouteSelectChange}>
                                <SelectTrigger id="routeId">
                                    <SelectValue placeholder="เลือกสายเก็บขยะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">ไม่กำหนด</SelectItem>
                                    {routes.map(route => (
                                        <SelectItem key={route.id} value={route.id}>{route.name} ({route.area})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline" onClick={handleCloseResidentForm}>ยกเลิก</Button></DialogClose>
                        <Button type="submit" form="resident-form">บันทึกข้อมูล</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
