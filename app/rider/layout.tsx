"use client"

import type { ReactNode } from "react"
import { useRequireRole } from "@/lib/use-require-role"
import { SiteHeader } from "@/components/site-header"
import { Loader2 } from "lucide-react"

export default function RiderLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole("RIDER")

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
