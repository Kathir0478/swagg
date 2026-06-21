"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Utensils, User, LogOut } from "lucide-react"

export default function RestaurantPage() {
  const router = useRouter()
  const { activeRole, logout } = useAuth()

  useEffect(() => {
    // Check if user is restaurant role
    if (activeRole && activeRole !== "RESTAURANT") {
      // Redirect to respective page based on role
      if (activeRole === "CUSTOMER") {
        router.push("/")
      } else if (activeRole === "RIDER") {
        router.push("/rider")
      }
    }
  }, [activeRole, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Restaurant Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage your restaurant</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/restaurant/menu")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5" />
              Menu
            </CardTitle>
            <CardDescription>Manage your restaurant menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Utensils className="size-4 mr-2" />
              View Menu
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/restaurant/profile")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile
            </CardTitle>
            <CardDescription>View and edit your restaurant profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <User className="size-4 mr-2" />
              View Profile
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleLogout}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="size-5" />
              Logout
            </CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="destructive">
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>Your restaurant overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Menu Items</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
