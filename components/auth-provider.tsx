"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { clearTokens, decodeToken, getAccessToken, getActiveRole, setActiveRole, setTokens } from "@/lib/api"
import type { Role } from "@/lib/types"

interface AuthState {
  isAuthenticated: boolean
  roles: Role[]
  activeRole: Role | null
  loading: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
  selectRole: (role: Role) => void
  refresh: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [activeRole, setActiveRoleState] = useState<Role | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const token = getAccessToken()
    if (token) {
      const { roles: decoded } = decodeToken(token)
      setRoles(decoded)
      setIsAuthenticated(true)
      const stored = getActiveRole()
      // Prefer a stored active role if it's still valid, otherwise the first non-USER role.
      if (stored && decoded.includes(stored)) {
        setActiveRoleState(stored)
      } else {
        const primary = decoded.find((r) => r !== "USER") || decoded[0] || null
        setActiveRoleState(primary)
        if (primary) setActiveRole(primary)
      }
    } else {
      setRoles([])
      setIsAuthenticated(false)
      setActiveRoleState(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(
    (accessToken: string, refreshToken: string) => {
      setTokens(accessToken, refreshToken)
      refresh()
    },
    [refresh],
  )

  const logout = useCallback(() => {
    clearTokens()
    setRoles([])
    setIsAuthenticated(false)
    setActiveRoleState(null)
  }, [])

  const selectRole = useCallback((role: Role) => {
    setActiveRole(role)
    setActiveRoleState(role)
    setRoles((prev) => (prev.includes(role) ? prev : [...prev, role]))
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, roles, activeRole, loading, login, logout, selectRole, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
