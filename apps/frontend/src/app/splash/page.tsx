'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useBranding } from '@/contexts/BrandingContext';

export default function SplashPage() {
  const router = useRouter();
  const { settings } = useBranding();

  useEffect(() => {
    // Auto redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url(${settings.splashBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center space-y-6 z-10">
        {/* Logo */}
        <div className="login-form-logo splash-fade-in">
          <Logo />
        </div>
        
        {/* App Name */}
        <div className="text-center splash-fade-in-delay">
          <h1 className="login-form-title text-3xl mb-2">MuniCollect</h1>
          <p className="text-purple-600 text-lg font-superspace-regular">{settings.municipalityName}</p>
        </div>

        {/* Loading indicator */}
        <div className="flex space-x-2 splash-fade-in-delay-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}