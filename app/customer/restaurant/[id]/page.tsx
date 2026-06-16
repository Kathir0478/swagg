"use client"

import { use, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Minus, Plus, Store } from "lucide-react"
import {
  addCartItem,
  createCart,
  getRestaurant,
  listFoodsByRestaurant,
  removeCartItem,
} from "@/lib/services"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapView } from "@/components/map-view"
import type { Food } from "@/lib/types"

export default function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { cart, setCart, refreshCart } = useCart()
  const [pending, setPending] = useState<string | null>(null)

  const { data: restaurant } = useSWR(["restaurant", id], () => getRestaurant(id), {
    revalidateOnFocus: false,
  })
  const { data: foods, isLoading } = useSWR(
    ["foods", id],
    () => listFoodsByRestaurant(id, true),
    { revalidateOnFocus: false },
  )

  // count of each food in the active cart (only valid if cart belongs to this restaurant)
  const cartForThisRestaurant = cart && cart.restaurantId === id ? cart : null
  const counts = (cartForThisRestaurant?.foodIds ?? []).reduce<Record<string, number>>((acc, fid) => {
    acc[fid] = (acc[fid] ?? 0) + 1
    return acc
  }, {})

  async function ensureCart(): Promise<string> {
    if (cartForThisRestaurant) return cartForThisRestaurant.cartId
    const newCart = await createCart(id)
    if (!newCart) throw new Error("Could not create cart")
    setCart(newCart)
    return newCart.cartId
  }

  async function handleAdd(food: Food) {
    setPending(food.foodId)
    try {
      const cartId = await ensureCart()
      const updated = await addCartItem(cartId, food.foodId, 1)
      if (updated) setCart(updated)
      else refreshCart()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add item")
    } finally {
      setPending(null)
    }
  }

  async function handleRemove(food: Food) {
    if (!cartForThisRestaurant) return
    setPending(food.foodId)
    try {
      const updated = await removeCartItem(cartForThisRestaurant.cartId, food.foodId, 1)
      if (updated) setCart(updated)
      else refreshCart()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove item")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/customer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All restaurants
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Store className="size-7 text-accent-foreground/60" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {restaurant?.username || "Restaurant"}
          </h1>
          {restaurant?.description && (
            <p className="text-sm text-muted-foreground">{restaurant.description}</p>
          )}
        </div>
      </div>

      {restaurant?.lat != null && restaurant?.lng != null && (
        <MapView lat={restaurant.lat} lng={restaurant.lng} className="h-40 w-full rounded-lg border" />
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Menu</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : foods && foods.length > 0 ? (
          foods.map((food) => {
            const qty = counts[food.foodId] ?? 0
            return (
              <Card key={food.foodId}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{food.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {food.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {food.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{food.description}</p>
                    )}
                    <p className="text-sm font-semibold">₹{food.price}</p>
                  </div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        disabled={pending === food.foodId}
                        onClick={() => handleRemove(food)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-5 text-center text-sm font-medium">{qty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        disabled={pending === food.foodId}
                        onClick={() => handleAdd(food)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      disabled={pending === food.foodId}
                      onClick={() => handleAdd(food)}
                    >
                      {pending === food.foodId ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              This restaurant has no available items right now.
            </CardContent>
          </Card>
        )}
      </div>

      {cartForThisRestaurant && cartForThisRestaurant.itemCount > 0 && (
        <div className="sticky bottom-4 z-10">
          <Link href="/customer/cart">
            <Button className="w-full justify-between" size="lg">
              <span>{cartForThisRestaurant.itemCount} item(s)</span>
              <span>View cart · ₹{cartForThisRestaurant.totalPrice}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
