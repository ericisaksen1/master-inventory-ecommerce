import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/storefront/order-status-badge"
import Link from "next/link"
import type { OrderStatus } from "@prisma/client"

export const metadata = { title: "Orders" }

interface Props {
  searchParams: Promise<{ status?: string }>
}

const statusFilters: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { value: "PAYMENT_COMPLETE", label: "Payment Complete" },
  { value: "ORDER_COMPLETE", label: "Order Complete" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const statusFilter = params.status || ""

  const where = statusFilter ? { status: statusFilter as OrderStatus } : {}

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true, payment: true },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Status filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders"}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === filter.value
                ? "border-primary bg-primary text-white"
                : "border-border text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-secondary">No orders found.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-background">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-secondary">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-secondary">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-secondary">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-secondary">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-secondary">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-secondary">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-accent hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                    {order.user?.name || order.user?.email || order.guestEmail || "Guest"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                    {order.payment?.method.replace("_", " ") || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {formatCurrency(order.total.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
