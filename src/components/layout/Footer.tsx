'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  hideFooter?: boolean;
}

export function Footer({ hideFooter = false }: FooterProps) {
  if (hideFooter) {
    return null;
  }

  return (
    <footer className="border-t border-white/5 backdrop-blur-sm h-7 flex items-center justify-center mt-auto bg-black/40">
      <div className="w-full max-w-7xl px-3 text-center">
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <span>تم تنفيذ هذا المتجر بواسطة</span>
          <Link 
            href="https://online-catalog.net" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative inline-flex items-center gap-0.5 text-primary"
          >
            <Image 
              src="/logo.png" 
              alt="أونلاين كتلوج" 
              width={10} 
              height={10} 
              className="h-2.5 w-2.5 object-contain"
            />
            <span className="relative">
              منصة أونلاين كتلوج
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
