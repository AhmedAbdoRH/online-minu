'use client';

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, className = "", priority = false }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <Sparkles className="h-10 w-10 text-brand-primary" />
        <p className="text-sm">فشل تحميل صورة المنتج</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="animate-pulse text-sm text-muted-foreground">جاري تحميل الصورة...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error('Image failed to load:', src);
          setIsLoading(false);
          setHasError(true);
        }}
        unoptimized={true}
      />
    </>
  );
}
