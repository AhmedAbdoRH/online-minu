'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button 
      variant="default" 
      className="flex-1 sm:flex-none gap-2 bg-green-600 hover:bg-green-700"
      onClick={handleCopy}
    >
      <Clipboard className="h-4 w-4" />
      {copied ? 'تم النسخ!' : 'نسخ الرابط'}
    </Button>
  );
}
