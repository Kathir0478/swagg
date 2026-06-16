import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  CONFIRMED: "bg-accent text-accent-foreground",
  PREPARING: "bg-accent text-accent-foreground",
  READY_FOR_PICKUP: "bg-primary/15 text-primary",
  OUT_FOR_DELIVERY: "bg-primary/15 text-primary",
  DELIVERED: "bg-primary text-primary-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn("border-transparent font-medium", STATUS_STYLES[status])}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}
