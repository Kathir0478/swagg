"use client"

import useSWR from "swr"
import Link from "next/link"
import { getCustomerOrders } from "@/lib/services"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { Button } from "@/components/ui/button"
import { PackageOpen } from "lucide-react"

export default function CustomerOrdersPage() {
  const { data: orders, isLoading } = useSWR("customer-orders", getCustomerOrders, {
    revalidateOnFocus: false,
    refreshInterval: 15000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
        <p className="text-sm text-muted-foreground">Track the status of your recent orders.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.orderId}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">Order #{order.orderId.slice(0, 8)}</p>
                  {order.instruction && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">{order.instruction}</p>
                  )}
                  {order.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <OrderStatusBadge status={order.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <PackageOpen className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">Your placed orders will appear here.</p>
          </div>
          <Link href="/customer">
            <Button>Browse restaurants</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
