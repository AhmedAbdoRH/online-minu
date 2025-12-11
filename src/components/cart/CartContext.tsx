"use client"

import * as React from 'react'

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, qty: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = React.createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function CartProvider({ children, storageKey }: { children: React.ReactNode; storageKey: string }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
  }, [storageKey])

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(items))
      }
    } catch {}
  }, [items, storageKey])

  const addItem = React.useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === item.id)
      if (index >= 0) {
        const next = [...prev]
        next[index] = { ...next[index], quantity: next[index].quantity + qty }
        return next
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }, [])

  const removeItem = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = React.useCallback((id: number, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)))
  }, [])

  const clear = React.useCallback(() => setItems([]), [])

  const total = React.useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])
  const itemCount = React.useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const openCart = React.useCallback(() => setIsOpen(true), [])
  const closeCart = React.useCallback(() => setIsOpen(false), [])

  const value: CartContextType = {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    isOpen,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

