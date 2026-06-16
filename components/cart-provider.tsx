"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import useSWR from "swr"
import { getActiveCart } from "@/lib/services"
import type { Cart } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

interface CartState {
  cart: Cart | null | undefined
  loading: boolean
  refreshCart: () => void
  setCart: (c: Cart | null) => void
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, roles } = useAuth()
  const isCustomer = isAuthenticated && roles.includes("CUSTOMER")
  const [override, setOverride] = useState<Cart | null | undefined>(undefined)

  const { data, isLoading, mutate } = useSWR(
    isCustomer ? "active-cart" : null,
    async () => {
      try {
        return (await getActiveCart()) ?? null
      } catch {
        return null
      }
    },
    { revalidateOnFocus: false },
  )

  const refreshCart = useCallback(() => {
    setOverride(undefined)
    mutate()
  }, [mutate])

  const setCart = useCallback((c: Cart | null) => setOverride(c), [])

  const cart = override !== undefined ? override : data

  return (
    <CartContext.Provider value={{ cart, loading: isLoading, refreshCart, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
