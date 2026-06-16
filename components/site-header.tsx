"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, LogOut, User } from "lucide-react"
import type { Role } from "@/lib/types"

const roleHome: Record<string, string> = {
  CUSTOMER: "/customer",
  RESTAURANT: "/restaurant",
  RIDER: "/rider",
  USER: "/onboarding",
}

export function SiteHeader() {
  const { isAuthenticated, activeRole, roles, logout, selectRole } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const switchableRoles = roles.filter((r) => r !== "USER" && r !== activeRole)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={isAuthenticated && activeRole ? roleHome[activeRole] || "/" : "/"} className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Swigg</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {activeRole && activeRole !== "USER" && (
              <Badge variant="secondary" className="capitalize">
                {activeRole.toLowerCase()}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activeRole && activeRole !== "USER" && (
                  <DropdownMenuItem onClick={() => router.push(`${roleHome[activeRole]}/profile`)}>
                    Profile & Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push("/onboarding")}>Add another role</DropdownMenuItem>
                {switchableRoles.length > 0 && <DropdownMenuSeparator />}
                {switchableRoles.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => {
                      selectRole(r as Role)
                      router.push(roleHome[r] || "/")
                    }}
                    className="capitalize"
                  >
                    Switch to {r.toLowerCase()}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button render={<Link href="/signup" />}>Sign up</Button>
          </div>
        )}
      </div>
    </header>
  )
}
