'use client';

import Image from "next/image";
import { useState } from "react";

interface RelatedProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function RelatedProductImage({ src, alt, className = "" }: RelatedProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        فشل تحميل الصورة
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover transition-transform duration-300 group-hover:scale-105 ${className}`}
      onError={() => {
        console.error('Related image failed to load:', src);
        setHasError(true);
      }}
    />
  );
}
