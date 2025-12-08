'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

function WhatsAppIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
            <path d="M16.75 13.96c.27.13.42.22.5.4.1.2.13.4.15.65.03.3-.04.6-.23.8s-.42.34-.68.38c-.26.04-.55.03-.86-.08s-1.15-.43-2.1-1.23c-1.2-.94-2-2.03-2.2-2.32-.2-.3-.42-.64-.4-.93-.03-.28.1-.54.28-.7c.18-.16.38-.22.53-.22h.23c.18 0 .35.02.5.2.14.18.22.38.3.57.1.23.18.48.28.75.1.28.18.52.28.7.1.18.04.34-.1.5s-.27.2-.42.28c-.14.1-.27.16-.42.22l-.2.08c-.14.07-.15.07-.13.2.02.14.23.68.78 1.2s1.08.9 1.22 1c.14.08.27.06.38.03zM12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10 1.76 0 3.4-.45 4.83-1.25l2.67.89-.9-2.6c.88-1.47 1.4-3.14 1.4-4.96A10 10 0 0 0 12 2z"/>
        </svg>
    )
}

function InstagramIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    )
}

export function ShareButtons({ catalogName }: { catalogName: string }) {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = `تفضلوا كتالوج ${catalogName}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `كتالوج ${catalogName}`,
          text: shareText,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ title: 'تم النسخ!', description: 'تم نسخ الرابط إلى الحافظة.' });
      } else {
        // Fallback for older browsers or restricted contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({ title: 'تم النسخ!', description: 'تم نسخ الرابط إلى الحافظة.' });
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({ title: 'خطأ', description: 'فشل نسخ الرابط.', variant: 'destructive' });
    }
  };

  if (!url) return null;

  return (
    <div className="flex justify-center items-center gap-2">
      {typeof navigator.share === 'function' ? (
        <Button onClick={handleNativeShare}>
          <Share2 className="ml-2 h-4 w-4" />
          مشاركة
        </Button>
      ) : (
        <Popover>
            <PopoverTrigger asChild>
                <Button>
                    <Share2 className="ml-2 h-4 w-4" />
                    مشاركة
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="flex gap-2">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + url)}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon"><WhatsAppIcon /></Button>
                    </a>
                    {/* Instagram does not support pre-filled text */}
                    <a href={`https://www.instagram.com/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
                       <Button variant="ghost" size="icon"><InstagramIcon /></Button>
                    </a>
                </div>
            </PopoverContent>
        </Popover>
      )}
      <Button variant="outline" onClick={copyToClipboard}>
        <LinkIcon className="ml-2 h-4 w-4" />
        نسخ الرابط
      </Button>
    </div>
  );
}
