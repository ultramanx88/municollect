'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Mail, Lock, Home, Download } from "lucide-react";


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
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="login-card w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="login-form-logo mb-6">
            <Logo src={logoUrl} />
          </div>
          <h1 className="login-form-title mb-4">ยินดีต้อนรับสู่ MuniCollect</h1>
          <p className="text-white/80 text-sm">ระบบชำระค่าบริการสำหรับเทศบาล</p>
          <p className="text-white font-semibold mt-1">{municipalityName}</p>
        </div>
        <div>
           <Tabs defaultValue="resident" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/20 border-0">
                <TabsTrigger value="resident" className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">สำหรับประชาชน</TabsTrigger>
                <TabsTrigger value="municipality" className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">สำหรับเทศบาล</TabsTrigger>
              </TabsList>
              <TabsContent value="resident" className="pt-6">
                <form className="space-y-6" onSubmit={handleResidentLogin}>
                  <div className="login-input-wrapper">
                    <Home className="login-icon" />
                    <input
                      id="household-id"
                      type="text"
                      placeholder="กรอกรหัสประจำบ้านของคุณ"
                      required
                      className="login-input"
                      value={householdId}
                      onChange={(e) => setHouseholdId(e.target.value)}
                    />
                    <span className="login-input-focus"></span>
                  </div>
                  <div className="flex justify-center">
                    <button type="submit" className="login-btn">
                      เข้าสู่ระบบ
                    </button>
                  </div>
                </form>
                 <div className="mt-6 text-center text-sm">
                  <span className="text-white/80">ยังไม่มีบัญชี? </span>
                  <Link href="/resident-register" className="text-white underline hover:text-white/80 transition-colors">
                    ลงทะเบียนที่นี่
                  </Link>
                </div>
              </TabsContent>
              <TabsContent value="municipality" className="pt-6">
                 <form className="space-y-6" onSubmit={handleMunicipalityLogin}>
                  <div className="login-input-wrapper">
                    <Mail className="login-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="login-input-focus"></span>
                  </div>
                  <div className="login-input-wrapper">
                    <Lock className="login-icon" />
                    <input 
                      id="password" 
                      type="password" 
                      placeholder="รหัสผ่าน"
                      required
                      className="login-input" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="login-input-focus"></span>
                  </div>
                  <div className="flex justify-center">
                    <button type="submit" className="login-btn" disabled={isLoading}>
                      {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                  </div>
                </form>
                <div className="mt-6 text-center text-sm">
                  <span className="text-white/80">ยังไม่มีบัญชี? </span>
                  <Link href="/register" className="text-white underline hover:text-white/80 transition-colors">
                    ลงทะเบียนเทศบาล
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          {installPrompt && !isPwaInstalled && (
            <div className="mt-6 pt-4 border-t border-white/20">
               <button onClick={handleInstallClick} className="login-btn w-full">
                <Download className="mr-2 h-4 w-4" />
                ติดตั้งแอปพลิเคชัน
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
