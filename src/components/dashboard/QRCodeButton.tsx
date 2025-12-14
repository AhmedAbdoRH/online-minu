'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Download } from 'lucide-react';

interface QRCodeButtonProps {
  url: string;
  storeName: string;
}

export function QRCodeButton({ url, storeName }: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [QRComponent, setQRComponent] = useState<React.ComponentType<any> | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load QRCode on client side
    import('qrcode.react').then((mod) => {
      setQRComponent(() => mod.QRCodeCanvas);
    });
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngFile = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = `${storeName}-qrcode.png`;
    downloadLink.href = pngFile;
    downloadLink.click();
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
          <div ref={canvasRef} className="bg-white p-4 rounded-lg">
            {QRComponent && (
              <QRComponent
                value={url}
                size={200}
                level="H"
                includeMargin
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            امسح هذا الرمز للوصول إلى متجرك
          </p>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            تحميل الرمز
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
