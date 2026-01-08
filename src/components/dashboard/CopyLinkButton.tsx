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
      size="sm"
      className="flex-1 sm:flex-none gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-sm border border-slate-200 text-xs sm:text-sm"
      onClick={handleCopy}
    >
      <Clipboard className="h-4 w-4" />
      {copied ? 'تم النسخ!' : 'نسخ الرابط'}
    </Button>
  );
}
