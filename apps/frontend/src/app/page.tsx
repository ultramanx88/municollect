'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Mail, Lock, Home, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { municipalityConfig } from '@/config/municipality';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function LoginPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const { name: municipalityName, logoUrl } = municipalityConfig;
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [householdId, setHouseholdId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Only show the prompt if the app is not already installed.
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setInstallPrompt(e as BeforeInstallPromptEvent);
      }
    };

    // Check if the app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isAuthenticated, router]);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then(() => {
      setInstallPrompt(null);
      setIsPwaInstalled(true);
    });
  };

  const handleResidentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (householdId.trim()) {
      // In a real app, you would query Firestore to validate the household ID.
      // For this prototype, we'll just log in successfully.
      console.log("Logging in resident with ID:", householdId);
      router.push('/dashboard');
    }
  };

  const handleMunicipalityLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "กรุณากรอกอีเมลและรหัสผ่าน",
      });
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <div className="mb-4 inline-block">
            <Logo src={logoUrl} />
          </div>
          <CardTitle className="text-2xl">ยินดีต้อนรับสู่ MuniCollect</CardTitle>
          <CardDescription>
            <p>ระบบชำระค่าบริการสำหรับเทศบาล</p>
            <p className="font-semibold text-foreground mt-1">{municipalityName}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="resident" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resident">สำหรับประชาชน</TabsTrigger>
                <TabsTrigger value="municipality">สำหรับเทศบาล</TabsTrigger>
              </TabsList>
              <TabsContent value="resident" className="pt-4">
                <form className="grid gap-4" onSubmit={handleResidentLogin}>
                  <div className="grid gap-2">
                    <Label htmlFor="household-id">รหัสประจำบ้าน</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="household-id"
                        type="text"
                        placeholder="กรอกรหัสประจำบ้านของคุณ"
                        required
                        className="pl-10"
                        value={householdId}
                        onChange={(e) => setHouseholdId(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    เข้าสู่ระบบ
                  </Button>
                </form>
                 <div className="mt-4 text-center text-sm">
                  ยังไม่มีบัญชี?{" "}
                  <Link href="/resident-register" className="underline">
                    ลงทะเบียนที่นี่
                  </Link>
                </div>
              </TabsContent>
              <TabsContent value="municipality" className="pt-4">
                 <form className="grid gap-4" onSubmit={handleMunicipalityLogin}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        required
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  ยังไม่มีบัญชี?{" "}
                  <Link href="/register" className="underline">
                    ลงทะเบียนเทศบาล
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          {installPrompt && !isPwaInstalled && (
            <div className="mt-6 pt-4 border-t">
               <Button onClick={handleInstallClick} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                ติดตั้งแอปพลิเคชัน
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
