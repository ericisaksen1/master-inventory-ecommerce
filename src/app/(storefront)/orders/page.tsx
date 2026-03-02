import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/storefront/order-status-badge"
import Link from "next/link"

export const metadata = { title: "My Orders" }

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?returnUrl=/orders")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {order.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold">{formatCurrency(order.total.toString())}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                {order.payment && ` · ${order.payment.method.replace("_", " ")}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
