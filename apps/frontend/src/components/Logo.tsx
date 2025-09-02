'use client';

import { Layers } from 'lucide-react';
import Image from 'next/image';
import { useBranding } from '@/contexts/BrandingContext';

interface LogoProps {
    src?: string;
    className?: string;
}

export function Logo({ src, className }: LogoProps) {
  const { settings } = useBranding();
  const logoSrc = src || settings.logo;

  return (
    <div className={`bg-primary text-primary-foreground rounded-lg p-3 w-14 h-14 flex items-center justify-center ${className || ''}`}>
      {logoSrc ? (
        <Image src={logoSrc} alt="Municipality Logo" width={40} height={40} className="object-contain" />
      ) : (
        <Layers className="w-8 h-8" />
      )}
    </div>
  );
}
