import { Layers } from 'lucide-react';
import Image from 'next/image';

interface LogoProps {
    src?: string;
}

export function Logo({ src }: LogoProps) {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-3 w-14 h-14 flex items-center justify-center">
      {src ? (
        <Image src={src} alt="Municipality Logo" width={40} height={40} className="object-contain" />
      ) : (
        <Layers className="w-8 h-8" />
      )}
    </div>
  );
}
