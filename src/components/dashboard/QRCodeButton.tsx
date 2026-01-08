'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Download, Share2 } from 'lucide-react';

interface QRCodeButtonProps {
  url: string;
  storeName: string;
}

// Create a wrapper component for QRCode
const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => {
    // Return a wrapper component
    return ({ value, size, level, includeMargin }: any) => {
      const QR = mod.QRCodeCanvas;
      return <QR value={value} size={size} level={level} includeMargin={includeMargin} />;
    };
  }),
  { 
    ssr: false,
    loading: () => <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded" />
  }
);

export function QRCodeButton({ url, storeName }: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [canShare, setCanShare] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  // Effect to capture the canvas as a data URL whenever it renders or dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the canvas has rendered
      const timer = setTimeout(() => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (canvas) {
          setQrDataUrl(canvas.toDataURL('image/png'));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, url]);

  const handleShare = async () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      // Check if navigator.share is supported
      if (navigator.share) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) return;

        const file = new File([blob], `${storeName}-qrcode.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `رمز QR لمتجر ${storeName}`,
            text: `امسح الكود لزيارة متجرنا: ${url}`,
          });
          return;
        } else {
          await navigator.share({
            title: `رمز QR لمتجر ${storeName}`,
            text: `رابط متجر ${storeName}: ${url}`,
            url: url
          });
          return;
        }
      }
      
      // Fallback for desktop: Copy link to clipboard
      await navigator.clipboard.writeText(url);
      alert('تم نسخ رابط المتجر لمشاركته، حيث أن متصفحك لا يدعم مشاركة الصور مباشرة.');
      
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${storeName}-qrcode.png`;
      downloadLink.href = pngFile;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">رمز QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR للمتجر</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative group">
            <div ref={canvasRef} className="bg-white p-4 rounded-lg shadow-inner">
              <QRCodeCanvas
                value={url}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            {/* Overlay instructions for mobile */}
            <p className="sm:hidden text-[10px] text-muted-foreground text-center mt-2 animate-pulse">
              اضغط مطولاً على الرمز لحفظه كصورة
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center px-4">
            امسح هذا الرمز للوصول إلى متجرك أو شاركه مع عملائك
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full px-4">
            <Button onClick={handleDownload} className="flex-1 gap-2 bg-brand-primary hover:bg-brand-primary/90">
              <Download className="h-4 w-4" />
              تحميل الرمز
            </Button>
            
            <Button onClick={handleShare} variant="outline" className="flex-1 gap-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5">
              <Share2 className="h-4 w-4" />
              مشاركة الرمز
            </Button>
          </div>
          
          {/* Hidden image for mobile long-press - always present but invisible except for system context menu */}
          {qrDataUrl && (
            <div className="absolute opacity-0 pointer-events-auto w-[200px] h-[200px] top-[100px] z-20">
              <img 
                src={qrDataUrl} 
                alt={storeName} 
                className="w-full h-full"
                style={{ WebkitTouchCallout: 'default' }} 
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
