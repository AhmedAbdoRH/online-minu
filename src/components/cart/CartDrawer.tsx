"use client"

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from './CartContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Minus, Plus, MessageCircle } from 'lucide-react'
import type { Catalog } from '@/lib/types'

export function CartDrawer({ catalog }: { catalog: Catalog }) {
  const { items, total, isOpen, closeCart, removeItem, updateQuantity, clear } = useCart()

  const whatsappNumber = catalog.whatsapp_number || ''
  const canOrder = items.length > 0 && !!whatsappNumber

  const message = React.useMemo(() => {
    const lines = items.map((i) => `• ${i.name} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString('en-US')} ج.م`)
    const totalLine = `\nالإجمالي: ${total.toLocaleString('en-US')} ج.م`
    const header = `طلب جديد من كتالوج ${catalog.display_name || catalog.name}:\n\n`
    return `${header}${lines.join('\n')}${totalLine}`
  }, [items, total, catalog.display_name, catalog.name])

  const orderHref = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>سلة المشتريات</SheetTitle>
        </SheetHeader>
        <div className="mt-3">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
              لا توجد منتجات في السلة حتى الآن.
            </div>
          ) : (
            <ScrollArea className="h-[50vh] pr-2">
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium truncate">{i.name}</span>
                      <span className="text-xs text-muted-foreground">{(i.price).toLocaleString('en-US')} ج.م</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(i.id, i.quantity - 1)} aria-label="تقليل الكمية">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-7 text-center font-semibold">{i.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(i.id, i.quantity + 1)} aria-label="زيادة الكمية">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(i.id)} aria-label="إزالة المنتج">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border bg-muted/20 p-3">
          <span className="text-sm text-muted-foreground">الإجمالي</span>
          <span className="text-lg font-bold text-brand-primary">{total.toLocaleString('en-US')} ج.م</span>
        </div>
        <SheetFooter className="mt-3">
          <div className="flex w-full flex-col gap-2">
            <Button
              asChild
              disabled={!canOrder}
              className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#1fb55b]"
            >
              <a href={canOrder ? orderHref : undefined} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="ml-2 h-5 w-5" />
                اطلب الآن عبر واتساب
              </a>
            </Button>
            <Button variant="ghost" className="w-full" onClick={clear} disabled={items.length === 0}>إفراغ السلة</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

