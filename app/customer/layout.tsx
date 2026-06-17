"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useRequireRole } from "@/lib/use-require-role"
import { useAuth } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { SiteHeader } from "@/components/site-header"
import { Loader2 } from "lucide-react"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole("CUSTOMER")
  const { roles } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (roles.includes("RIDER")) {
      router.replace("/rider")
    }
  }, [roles, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
      </div>
    </CartProvider>
  )
}
