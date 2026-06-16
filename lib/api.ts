import type { ApiResponse, Role } from "./types"

// All requests go through our Next.js proxy at /api/proxy -> backend /api/*
const PROXY_BASE = "/api/proxy"

const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"
const ROLE_KEY = "active_role"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function setActiveRole(role: Role) {
  localStorage.setItem(ROLE_KEY, role)
}

export function getActiveRole(): Role | null {
  if (typeof window === "undefined") return null
  return (localStorage.getItem(ROLE_KEY) as Role) || null
}

// Decode the role(s) from a JWT without verifying it (client-side display only).
export function decodeToken(token: string): { roles: Role[]; sub?: string; exp?: number } {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const rawRoles =
      payload.roles || payload.role || payload.authorities || payload.scope || payload.scopes || []
    let roles: string[] = []
    if (Array.isArray(rawRoles)) roles = rawRoles
    else if (typeof rawRoles === "string") roles = rawRoles.split(/[\s,]+/)
    roles = roles.map((r) => r.replace(/^ROLE_/, "").toUpperCase())
    return { roles: roles as Role[], sub: payload.sub, exp: payload.exp }
  } catch {
    return { roles: [] }
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  const res = await fetch(`${PROXY_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (res.ok) {
    const tokens = await res.json()
    if (tokens.accessToken && tokens.refreshToken) {
      setTokens(tokens.accessToken, tokens.refreshToken)
      return tokens.accessToken
    }
  }
  return null
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  retry?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, auth = false, retry = true }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (auth) {
    const token = getAccessToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${PROXY_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Handle expired access token -> attempt one refresh + retry.
  if (res.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest<T>(path, { method, body, auth, retry: false })
    }
    clearTokens()
    if (typeof window !== "undefined") window.location.href = "/login"
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  const text = await res.text()
  let json: ApiResponse<T>
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    // Some endpoints return a bare string message.
    json = { success: res.ok, message: text }
  }

  if (!res.ok) {
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status)
  }

  return json
}
