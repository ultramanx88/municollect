'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Clock, Sparkles, Info, ExternalLink } from 'lucide-react';
import { municipalityConfig } from '@/config/municipality';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function MuniSettingsPage() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // In a real application, you would save the data and upload the logo file.
        toast({ title: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
    }
    
    const handleSaveApiKey = () => {
        // In a real app, this would be encrypted and saved securely.
        toast({ title: 'บันทึก API Key สำเร็จ' });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">ตั้งค่าเทศบาล</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลโปรไฟล์เทศบาล</CardTitle>
                        <CardDescription>
                            จัดการข้อมูลทั่วไปและโลโก้ที่จะแสดงในระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <Label>โลโก้เทศบาล</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 rounded-md">
                                    <AvatarImage src={logoPreview || municipalityConfig.logoUrl || undefined} alt="Logo Preview" className="object-contain" />
                                    <AvatarFallback className="rounded-md bg-muted">
                                        <Upload />
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    อัปโหลดโลโก้
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">แนะนำให้ใช้ไฟล์ .png ที่มีพื้นหลังโปร่งใส</p>
                        </div>

                        <form className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="muni-name">ชื่อเทศบาล</Label>
                                <Input id="muni-name" defaultValue={municipalityConfig.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact-name">ชื่อผู้ติดต่อ</Label>
                                <Input id="contact-name" defaultValue="สมชาย ใจดี" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input id="email" type="email" defaultValue="contact@anytown-city.gov" />
                            </div>
                        </form>

                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
                        </div>

                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Link href="/muni-dashboard/settings/collection" className="block">
                        <Card className="hover:bg-secondary transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> กำหนดเวลารับชำระ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>ตั้งค่าเวลาทำการ, วันหยุด และการตัดรอบการรับชำระเงินประจำวัน</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                Gemini AI API Key
                            </CardTitle>
                            <CardDescription>
                                เชื่อมต่อกับฟีเจอร์ AI อัจฉริยะโดยใช้ API Key ของคุณเอง
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gemini-key">Your Google AI API Key</Label>
                                <Input id="gemini-key" type="password" placeholder="วาง API Key ที่นี่" />
                            </div>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>วิธีขอรับ API Key</AlertTitle>
                                <AlertDescription className="space-y-2">
                                    <p>คุณสามารถสร้างและจัดการ Gemini API Key ได้ฟรีที่ Google AI Studio เพื่อเปิดใช้งานความสามารถของ AI ในระบบ</p>
                                    <Button asChild variant="link" className="p-0 h-auto font-semibold">
                                        <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                            ไปที่ Google AI Studio <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button className="ml-auto" onClick={handleSaveApiKey}>บันทึก API Key</Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </div>
    );
}
