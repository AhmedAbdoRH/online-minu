"use client"

import React, { useState } from "react"
import { Eye, X, Maximize2, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StorePreviewModalProps {
  url: string
  storeName: string
}

export function StorePreviewModal({ url, storeName }: StorePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 sm:flex-none gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-[#006060] to-[#8B8000] hover:brightness-110 transition-all shadow-lg border-0 text-white font-bold"
        >
          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          عرض المتجر
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden border-white/10 glass-surface flex flex-col">
        <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-right text-lg font-bold text-white">
                معاينة المتجر: {storeName}
              </DialogTitle>
              <p className="text-xs text-slate-400 text-right">
                هذه هي الطريقة التي يرى بها العملاء متجرك
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-auto ml-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              onClick={reloadIframe}
              title="إعادة تحميل"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              onClick={() => window.open(url, '_blank')}
              title="فتح في نافذة جديدة"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 w-full bg-white relative">
          <iframe
            key={iframeKey}
            src={url}
            className="w-full h-full border-0"
            title={`Preview of ${storeName}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
