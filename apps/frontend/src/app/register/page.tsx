'use client';

import { useState } from 'react';
import Link from "next/link";
import { Landmark, User, Mail, Phone, Lock } from "lucide-react";

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
import { useAuth } from '@/contexts';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    municipalityName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mb-4 inline-block">
            <Logo />
          </div>
          <CardTitle className="text-2xl">ลงทะเบียนสำหรับเทศบาล</CardTitle>
          <CardDescription>
            เข้าร่วม MuniCollect เพื่อเริ่มจัดการระบบชำระเงินของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="municipality-name">ชื่อเทศบาล</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="municipality-name"
                  name="municipalityName"
                  type="text"
                  placeholder="เช่น เทศบาลนครนนทบุรี"
                  required
                  className="pl-10"
                  value={formData.municipalityName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">ชื่อ</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first-name"
                    name="firstName"
                    type="text"
                    placeholder="สมชาย"
                    required
                    className="pl-10"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">นามสกุล</Label>
                <Input
                  id="last-name"
                  name="lastName"
                  type="text"
                  placeholder="ใจดี"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="081-234-5678"
                  className="pl-10"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">สร้างรหัสผ่าน</Label>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังลงทะเบียน...' : 'ส่งคำขอลงทะเบียน'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/" className="underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
