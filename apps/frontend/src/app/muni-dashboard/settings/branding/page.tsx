'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Eye, Save, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useBranding } from '@/contexts/BrandingContext';
import { useToast } from '@/hooks/use-toast';

export default function BrandingSettingsPage() {
  const { toast } = useToast();
  const { settings, updateSettings, resetSettings } = useBranding();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [previewSettings, setPreviewSettings] = useState(settings);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (type: 'logo' | 'favicon' | 'splashBackground', file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewSettings(prev => ({
          ...prev,
          [type]: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      updateSettings(previewSettings);
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าแบรนด์ได้รับการอัปเดตแล้ว",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
      });
    }
  };

  const handleReset = () => {
    setPreviewSettings(settings);
    setShowPreview(false);
  };

  const handleResetToDefault = () => {
    resetSettings();
    setPreviewSettings(settings);
    toast({
      title: "รีเซ็ตสำเร็จ",
      description: "การตั้งค่าได้รับการรีเซ็ตเป็นค่าเริ่มต้นแล้ว",
    });
  };

  const PreviewCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-sm font-superspace-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-wrapper space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-superspace-bold text-gray-900">การตั้งค่าแบรนด์</h1>
          <p className="text-gray-600">จัดการโลโก้ ไอคอน และภาพพื้นหลังของระบบ</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="dashboard-btn"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'ซ่อนตัวอย่าง' : 'แสดงตัวอย่าง'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="dashboard-btn"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            รีเซ็ต
          </Button>
          <Button
            onClick={handleSave}
            className="dashboard-btn dashboard-btn-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            บันทึก
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="font-superspace-bold">ข้อมูลพื้นฐาน</CardTitle>
              <CardDescription>ตั้งค่าชื่อและข้อมูลพื้นฐานของเทศบาล</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="municipality-name" className="font-superspace-bold">ชื่อเทศบาล</Label>
                <Input
                  id="municipality-name"
                  value={previewSettings.municipalityName}
                  onChange={(e) => setPreviewSettings(prev => ({ ...prev, municipalityName: e.target.value }))}
                  className="dashboard-form-control"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="logo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logo">โลโก้</TabsTrigger>
              <TabsTrigger value="favicon">Favicon</TabsTrigger>
              <TabsTrigger value="background">พื้นหลัง</TabsTrigger>
            </TabsList>

            <TabsContent value="logo" className="space-y-4">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="font-superspace-bold">โลโก้หลัก</CardTitle>
                  <CardDescription>โลโก้ที่แสดงในระบบและหน้า splash screen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo-url" className="font-superspace-bold">URL โลโก้</Label>
                    <Input
                      id="logo-url"
                      value={previewSettings.logo}
                      onChange={(e) => setPreviewSettings(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="dashboard-form-control"
                    />
                  </div>
                  <div>
                    <Label className="font-superspace-bold">หรืออัปโหลดไฟล์</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="dashboard-btn"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        เลือกไฟล์
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favicon" className="space-y-4">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="font-superspace-bold">Favicon</CardTitle>
                  <CardDescription>ไอคอนที่แสดงในแท็บเบราว์เซอร์</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="favicon-url" className="font-superspace-bold">URL Favicon</Label>
                    <Input
                      id="favicon-url"
                      value={previewSettings.favicon}
                      onChange={(e) => setPreviewSettings(prev => ({ ...prev, favicon: e.target.value }))}
                      placeholder="/favicon.ico"
                      className="dashboard-form-control"
                    />
                  </div>
                  <div>
                    <Label className="font-superspace-bold">หรืออัปโหลดไฟล์</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*,.ico"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        className="dashboard-btn"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        เลือกไฟล์
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="background" className="space-y-4">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="font-superspace-bold">พื้นหลัง Splash Screen</CardTitle>
                  <CardDescription>ภาพพื้นหลังสำหรับหน้า splash screen และหน้า login</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="background-url" className="font-superspace-bold">URL ภาพพื้นหลัง</Label>
                    <Input
                      id="background-url"
                      value={previewSettings.splashBackground}
                      onChange={(e) => setPreviewSettings(prev => ({ ...prev, splashBackground: e.target.value }))}
                      placeholder="/bg-01.jpg"
                      className="dashboard-form-control"
                    />
                  </div>
                  <div>
                    <Label className="font-superspace-bold">หรืออัปโหลดไฟล์</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={backgroundInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('splashBackground', e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => backgroundInputRef.current?.click()}
                        className="dashboard-btn"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        เลือกไฟล์
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <h2 className="text-xl font-superspace-bold text-gray-900">ตัวอย่าง</h2>
            
            <PreviewCard title="โลโก้ในระบบ">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Logo src={previewSettings.logo} />
              </div>
            </PreviewCard>

            <PreviewCard title="Splash Screen">
              <div 
                className="relative h-64 rounded-lg overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage: `url(${previewSettings.splashBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-90"></div>
                <div className="relative flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Logo src={previewSettings.logo} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-superspace-bold text-lg text-purple-700">MuniCollect</h3>
                    <p className="text-purple-600 text-sm">{previewSettings.municipalityName}</p>
                  </div>
                </div>
              </div>
            </PreviewCard>

            <PreviewCard title="Header ระบบ">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Logo src={previewSettings.logo} />
                <span className="font-superspace-bold text-gray-900">{previewSettings.municipalityName}</span>
              </div>
            </PreviewCard>
          </div>
        )}
      </div>
    </div>
  );
}