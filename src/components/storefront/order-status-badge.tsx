import { Badge } from "@/components/ui/badge"
import { ORDER_STATUSES } from "@/lib/constants"
import type { OrderStatus } from "@prisma/client"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = ORDER_STATUSES[status]
  return (
    <Badge variant={config.color as any}>
      {config.label}
    </Badge>
  )
}
