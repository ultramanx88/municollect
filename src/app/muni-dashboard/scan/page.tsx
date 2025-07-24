'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">สแกนเพื่อตรวจสอบ</h1>
      <Card>
        <CardHeader>
          <CardTitle>เครื่องสแกนบาร์โค้ด/QR Code</CardTitle>
          <CardDescription>หันกล้องไปที่โค้ดบนสลิปเพื่อทำการตรวจสอบข้อมูล</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full max-w-lg mx-auto bg-muted rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <div className="absolute inset-0 border-4 border-primary/50 rounded-md pointer-events-none" />
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <ScanLine className="h-4 w-4" />
              <AlertTitle>ต้องการสิทธิ์เข้าถึงกล้อง</AlertTitle>
              <AlertDescription>
                กรุณาอนุญาตให้แอปนี้ใช้กล้องของคุณเพื่อทำการสแกน
              </AlertDescription>
            </Alert>
          )}

           {/* Placeholder for scan result will go here */}

        </CardContent>
      </Card>
    </div>
  );
}
