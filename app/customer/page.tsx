"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { listRestaurants, getCustomer } from "@/lib/services"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Store, UtensilsCrossed, User, Search, LogOut } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"

function RestaurantSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function CustomerHome() {
  const router = useRouter()
  const { logout, activeRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const { cart } = useCart()

  useEffect(() => {
    fetchCustomerAndRestaurants()
  }, [])

  const fetchCustomerAndRestaurants = async () => {
    try {
      // First fetch customer details to ensure authentication
      await getCustomer()
      
      // Then fetch restaurants
      const data = await listRestaurants()
      setRestaurants(data)
    } catch (err) {
      console.error("Failed to load data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Customer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Browse restaurants and order food</p>
        </div>
        <div className="flex gap-2">
          <Link href="/customer/search">
            <Button variant="outline">
              <Search className="size-4 mr-2" />
              Search
            </Button>
          </Link>
          <Link href="/customer/profile">
            <Button variant="outline">
              <User className="size-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-balance">Restaurants near you</h2>
          <p className="text-sm text-muted-foreground">Pick a place and start building your order.</p>
        </div>
        {cart && cart.itemCount > 0 && (
          <Link href="/customer/cart">
            <Badge className="gap-1">
              <UtensilsCrossed className="size-3" />
              {cart.itemCount} in cart
            </Badge>
          </Link>
        )}
      </div>

      {loading ? (
        <RestaurantSkeletons />
      ) : restaurants && restaurants.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Link key={r.restaurantId} href={`/customer/restaurant/${r.restaurantId}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex h-32 items-center justify-center bg-accent">
                  {r.imageurl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageurl || "/placeholder.svg"}
                      alt={r.username || "Restaurant"}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Store className="size-10 text-accent-foreground/50" />
                  )}
                </div>
                <CardContent className="space-y-2 p-4">
                  <h3 className="font-medium leading-tight">{r.username || "Restaurant"}</h3>
                  {r.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                    {(r.opentime || r.closetime) && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {r.opentime ?? "--"} - {r.closetime ?? "--"}
                      </span>
                    )}
                    {r.lat != null && r.lng != null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        Map
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No restaurants available yet. Check back soon.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
