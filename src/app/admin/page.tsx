
'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { MoreHorizontal, KeyRound, Copy, RefreshCw, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

type Municipality = {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: 'Active' | 'Inactive';
  registered: string;
  province: string;
  district: string;
  subdistrict: string;
  apiKey: string;
  geminiApiKey?: string;
};

const initialMunicipalities: Municipality[] = [
  {
    id: 'MUN-001',
    name: 'เทศบาลนครนนทบุรี',
    contact: 'สมชาย ใจดี',
    email: 'contact@nont-mun.go.th',
    status: 'Active',
    registered: '2023-01-15',
    province: 'นนทบุรี',
    district: 'เมืองนนทบุรี',
    subdistrict: 'สวนใหญ่',
    apiKey: 'key_abc123xyz789',
    geminiApiKey: 'gmn_key_nont123abc',
  },
  {
    id: 'MUN-002',
    name: 'เทศบาลเมืองปากน้ำสมุทรปราการ',
    contact: 'สมหญิง รักไทย',
    email: 'info@samutprakan-city.gov',
    status: 'Active',
    registered: '2023-02-20',
    province: 'สมุทรปราการ',
    district: 'เมืองสมุทรปราการ',
    subdistrict: 'ปากน้ำ',
    apiKey: '',
    geminiApiKey: '',
  },
  {
    id: 'MUN-003',
    name: 'เทศบาลตำบลบางปู',
    contact: 'มานะ พากเพียร',
    email: 'mana.p@bangpoo.or.th',
    status: 'Inactive',
    registered: '2023-03-10',
    province: 'สมุทรปราการ',
    district: 'เมืองสมุทรปราการ',
    subdistrict: 'บางปูใหม่',
    apiKey: 'key_pqr456mno123',
    geminiApiKey: 'gmn_key_bangpoo456def',
  },
  {
    id: 'MUN-004',
    name: 'องค์การบริหารส่วนตำบลราชาเทวะ',
    contact: 'วิชัย มีสุข',
    email: 'wichai@rachathewa.go.th',
    status: 'Active',
    registered: '2023-04-05',
    province: 'สมุทรปราการ',
    district: 'บางพลี',
    subdistrict: 'ราชาเทวะ',
    apiKey: '',
    geminiApiKey: '',
  },
  {
    id: 'MUN-005',
    name: 'เทศบาลนครปากเกร็ด',
    contact: 'สุดา พาเจริญ',
    email: 'contact@pakkret-city.go.th',
    status: 'Active',
    registered: '2023-05-12',
    province: 'นนทบุรี',
    district: 'ปากเกร็ด',
    subdistrict: 'ปากเกร็ด',
    apiKey: 'key_jkl789ghi456',
    geminiApiKey: '',
  },
];


export default function AdminDashboardPage() {
  const [municipalities, setMunicipalities] = useState(initialMunicipalities);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [selectedMuni, setSelectedMuni] = useState<Municipality | null>(null);
  const [editableGeminiKey, setEditableGeminiKey] = useState('');
  
  const { toast } = useToast();

  const provinces = useMemo(() => [...new Set(municipalities.map((m) => m.province))], [municipalities]);
  
  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    return [...new Set(municipalities.filter((m) => m.province === selectedProvince).map((m) => m.district))];
  }, [selectedProvince, municipalities]);

  const subdistricts = useMemo(() => {
    if (!selectedDistrict) return [];
    return [...new Set(municipalities.filter((m) => m.district === selectedDistrict && m.province === selectedProvince).map((m) => m.subdistrict))];
  }, [selectedDistrict, selectedProvince, municipalities]);

  const filteredMunicipalities = useMemo(() => {
    return municipalities.filter((m) => {
      const provinceMatch = selectedProvince ? m.province === selectedProvince : true;
      const districtMatch = selectedDistrict ? m.district === selectedDistrict : true;
      const subdistrictMatch = selectedSubdistrict ? m.subdistrict === selectedSubdistrict : true;
      return provinceMatch && districtMatch && subdistrictMatch;
    });
  }, [municipalities, selectedProvince, selectedDistrict, selectedSubdistrict]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict('');
    setSelectedSubdistrict('');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedSubdistrict('');
  };

  const handleReset = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedSubdistrict('');
  };

  const handleOpenApiDialog = (muni: Municipality) => {
    setSelectedMuni(muni);
    setEditableGeminiKey(muni.geminiApiKey || '');
    setIsApiDialogOpen(true);
  };
  
  const generateApiKey = () => `muni_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

  const handleGenerateKey = () => {
    if (!selectedMuni) return;
    const newApiKey = generateApiKey();
    const updatedMuni = { ...selectedMuni, apiKey: newApiKey };
    setMunicipalities(municipalities.map(m => m.id === selectedMuni.id ? updatedMuni : m));
    setSelectedMuni(updatedMuni);
    toast({ title: "สร้าง API Key ใหม่สำเร็จ", description: `Key ใหม่สำหรับ ${selectedMuni.name} ถูกสร้างแล้ว` });
  };
  
  const handleRevokeKey = () => {
    if (!selectedMuni) return;
    const updatedMuni = { ...selectedMuni, apiKey: '' };
    setMunicipalities(municipalities.map(m => m.id === selectedMuni.id ? updatedMuni : m));
    setSelectedMuni(updatedMuni);
    toast({ variant: 'destructive', title: "เพิกถอน API Key สำเร็จ", description: `การเข้าถึงด้วย API สำหรับ ${selectedMuni.name} ถูกยกเลิก` });
  };
  
  const handleSaveKeys = () => {
    if (!selectedMuni) return;
    const updatedMuni = { ...selectedMuni, geminiApiKey: editableGeminiKey };
    setMunicipalities(municipalities.map(m => m.id === selectedMuni.id ? updatedMuni : m));
    toast({ title: "บันทึกข้อมูล Key สำเร็จ" });
    setIsApiDialogOpen(false);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "คัดลอกสำเร็จ", description: "API Key ถูกคัดลอกไปยังคลิปบอร์ดแล้ว" });
  };

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ภาพรวมระบบกลาง (Superadmin)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อเทศบาลในระบบ</CardTitle>
          <CardDescription>
            ค้นหา, จัดการเทศบาล และควบคุมการเชื่อมต่อ API ระหว่างระบบได้จากที่นี่
          </CardDescription>
        </CardHeader>
        
        <div className="flex flex-wrap items-center gap-4 px-6 pb-4 border-b">
            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedProvince}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="เลือกอำเภอ" />
                </SelectTrigger>
                <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict} disabled={!selectedDistrict}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="เลือกตำบล" />
                </SelectTrigger>
                <SelectContent>
                    {subdistricts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset} disabled={!selectedProvince && !selectedDistrict && !selectedSubdistrict}>
                ล้างตัวกรอง
            </Button>
        </div>

        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อเทศบาล/รหัส</TableHead>
                <TableHead>ที่ตั้ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>API Access</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMunicipalities.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.id}</div>
                  </TableCell>
                  <TableCell>
                    <div>{m.province}</div>
                    <div className="text-sm text-muted-foreground">{m.district}, {m.subdistrict}</div>
                  </TableCell>
                  <TableCell>
                    {m.status === 'Active' ? (
                        <Badge variant="default" className="bg-accent text-accent-foreground">ใช้งาน</Badge>
                    ) : (
                        <Badge variant="destructive">ไม่ใช้งาน</Badge>
                    )}
                  </TableCell>
                   <TableCell>
                    {m.apiKey ? (
                        <Badge variant="default">เปิดใช้งาน</Badge>
                    ) : (
                        <Badge variant="secondary">ปิดใช้งาน</Badge>
                    )}
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
                        <DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem>
                        <DropdownMenuItem>แก้ไขข้อมูล</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenApiDialog(m)}>
                            <KeyRound className="mr-2 h-4 w-4"/>
                            จัดการ API Keys
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          ปิดการใช้งาน
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {filteredMunicipalities.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        ไม่พบข้อมูลเทศบาลที่ตรงกับตัวกรอง
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    
    <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>จัดการ API Keys สำหรับ {selectedMuni?.name}</DialogTitle>
                <DialogDescription>
                    จัดการ Key สำหรับการเข้าถึง Platform และการใช้งาน AI
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <Label htmlFor="api-key" className="font-semibold text-base">Platform API Key</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Key สำหรับให้ระบบภายนอกเรียกเข้ามายัง Platform (ระบบจะสร้างให้)
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleRevokeKey} disabled={!selectedMuni?.apiKey}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            เพิกถอน
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input id="api-key" value={selectedMuni?.apiKey || "ยังไม่มีการสร้าง Key"} readOnly />
                        <Button variant="outline" size="icon" disabled={!selectedMuni?.apiKey} onClick={() => copyToClipboard(selectedMuni?.apiKey || '')}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">คัดลอก</span>
                        </Button>
                    </div>
                     <Button onClick={handleGenerateKey} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {selectedMuni?.apiKey ? 'สร้าง Key ใหม่' : 'สร้าง Key แรก'}
                    </Button>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                    <Label htmlFor="gemini-api-key" className="font-semibold text-base">Gemini AI API Key</Label>
                    <p className="text-xs text-muted-foreground">
                        Key ที่เทศบาลนำมาจาก Google AI Studio (ผู้ดูแลระบบสามารถกรอก/แก้ไข Key แทนได้)
                    </p>
                    <Input 
                        id="gemini-api-key" 
                        value={editableGeminiKey}
                        onChange={(e) => setEditableGeminiKey(e.target.value)}
                        placeholder="วาง Google AI API Key ที่นี่" 
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>
                <Button onClick={handleSaveKeys}>บันทึกการเปลี่ยนแปลง</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
