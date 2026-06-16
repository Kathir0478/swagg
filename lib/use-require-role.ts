"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import type { Role } from "@/lib/types"

// Redirects unauthenticated users to /login, and users lacking the required role.
export function useRequireRole(role?: Role) {
  const { isAuthenticated, roles, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    if (role && !roles.includes(role)) {
      router.replace("/onboarding")
    }
  }, [isAuthenticated, roles, loading, role, router])

  return { ready: !loading && isAuthenticated && (!role || roles.includes(role)) }
}
