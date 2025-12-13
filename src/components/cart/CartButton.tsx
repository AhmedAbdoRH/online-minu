"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from './CartContext'
import { ShoppingCart } from 'lucide-react'

export function CartButton() {
  const { itemCount, openCart } = useCart()
  return (
    <Button
      type="button"
      onClick={openCart}
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-primary-foreground shadow-[0_30px_60px_rgba(0,209,201,0.45)] hover:-translate-y-1 transition-transform"
      aria-label="افتح سلة المشتريات"
    >
      <ShoppingCart className="h-8 w-8" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -left-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
          {itemCount}
        </span>
      )}
    </Button>
  )
}

