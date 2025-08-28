'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '@municollect/shared';
import { authService } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  municipalityId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      // Try to get user profile to verify token is still valid
      const userService = await import('@/lib/services/user.service');
      const profile = await userService.userService.getProfile();
      setUser(profile.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      authService.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authService.login({ email, password });
      setUser(response.user);
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: `ยินดีต้อนรับ ${response.user.firstName}`,
      });

      // Redirect based on user role
      if (response.user.role === 'resident') {
        router.push('/dashboard');
      } else {
        router.push('/muni-dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (error.status === 401) {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.status === 404) {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authService.register(data);
      setUser(response.user);
      
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: `ยินดีต้อนรับ ${response.user.firstName}`,
      });

      // Redirect based on user role
      if (response.user.role === 'resident') {
        router.push('/dashboard');
      } else {
        router.push('/muni-dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน';
      
      if (error.status === 409) {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (error.status === 400) {
        errorMessage = 'ข้อมูลที่กรอกไม่ถูกต้อง';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "ลงทะเบียนไม่สำเร็จ",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "ขอบคุณที่ใช้บริการ",
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local state
      setUser(null);
      authService.clearTokens();
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = authService.isAuthenticated() ? 
        localStorage.getItem('municollect_refresh_token') : null;
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response: AuthResponse = await authService.refreshToken(refreshTokenValue);
      setUser(response.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and redirect to login
      authService.clearTokens();
      setUser(null);
      router.push('/');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}