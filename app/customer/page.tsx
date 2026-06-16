"use client"

import useSWR from "swr"
import Link from "next/link"
import { listRestaurants } from "@/lib/services"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Store, UtensilsCrossed } from "lucide-react"
import { useCart } from "@/components/cart-provider"

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
  const { data: restaurants, isLoading, error } = useSWR("restaurants", listRestaurants, {
    revalidateOnFocus: false,
  })
  const { cart } = useCart()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Restaurants near you</h1>
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

      {error && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Could not load restaurants. Please check your connection and try again.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
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
