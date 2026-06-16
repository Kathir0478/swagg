"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import {
  addCartItem,
  createOrder,
  deleteCart,
  getRestaurant,
  listFoodsByRestaurant,
  removeCartItem,
} from "@/lib/services"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function CartPage() {
  const { cart, setCart, refreshCart, loading } = useCart()
  const router = useRouter()
  const [instruction, setInstruction] = useState("")
  const [pending, setPending] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  const restaurantId = cart?.restaurantId
  const { data: foods } = useSWR(
    restaurantId ? ["foods", restaurantId] : null,
    () => listFoodsByRestaurant(restaurantId as string, false),
    { revalidateOnFocus: false },
  )
  const { data: restaurant } = useSWR(
    restaurantId ? ["restaurant", restaurantId] : null,
    () => getRestaurant(restaurantId as string),
    { revalidateOnFocus: false },
  )

  const foodMap = useMemo(() => {
    const m = new Map<string, { name: string; price: number }>()
    foods?.forEach((f) => m.set(f.foodId, { name: f.name, price: f.price }))
    return m
  }, [foods])

  const lineItems = useMemo(() => {
    const counts = (cart?.foodIds ?? []).reduce<Record<string, number>>((acc, fid) => {
      acc[fid] = (acc[fid] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([foodId, qty]) => ({
      foodId,
      qty,
      name: foodMap.get(foodId)?.name ?? "Item",
      price: foodMap.get(foodId)?.price ?? 0,
    }))
  }, [cart?.foodIds, foodMap])

  async function changeQty(foodId: string, delta: number) {
    if (!cart) return
    setPending(foodId)
    try {
      const updated =
        delta > 0
          ? await addCartItem(cart.cartId, foodId, 1)
          : await removeCartItem(cart.cartId, foodId, 1)
      if (updated) setCart(updated)
      else refreshCart()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update cart")
    } finally {
      setPending(null)
    }
  }

  async function handleClear() {
    if (!cart) return
    try {
      await deleteCart(cart.cartId)
      setCart(null)
      toast.success("Cart cleared")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not clear cart")
    }
  }

  async function handlePlaceOrder() {
    if (!cart) return
    setPlacing(true)
    try {
      const order = await createOrder(cart.cartId, instruction.trim() || undefined)
      setCart(null)
      refreshCart()
      toast.success("Order placed!")
      if (order?.orderId) router.push("/customer/orders")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  if (!cart || cart.itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ShoppingCart className="size-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">Add items from a restaurant to get started.</p>
        </div>
        <Link href="/customer">
          <Button>Browse restaurants</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/customer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Continue shopping
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
          {restaurant?.username && (
            <p className="text-sm text-muted-foreground">from {restaurant.username}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive">
          <Trash2 className="size-4" />
          Clear
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {lineItems.map((item) => (
            <div key={item.foodId} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8"
                  disabled={pending === item.foodId}
                  onClick={() => changeQty(item.foodId, -1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8"
                  disabled={pending === item.foodId}
                  onClick={() => changeQty(item.foodId, 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label htmlFor="instruction" className="text-sm font-medium">
          Delivery instructions (optional)
        </label>
        <Textarea
          id="instruction"
          placeholder="e.g. Leave at the door, ring the bell"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items ({cart.itemCount})</span>
            <span>₹{cart.totalPrice}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>₹{cart.totalPrice}</span>
          </div>
          <Button className="w-full" size="lg" disabled={placing} onClick={handlePlaceOrder}>
            {placing ? <Loader2 className="size-4 animate-spin" /> : "Place order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
