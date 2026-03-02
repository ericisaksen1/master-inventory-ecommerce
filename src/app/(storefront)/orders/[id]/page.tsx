import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/storefront/order-status-badge"
import Link from "next/link"

export const metadata = { title: "Order Details" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      items: true,
      payment: true,
      shippingLabel: true,
    },
  })

  if (!order) notFound()

  const shippingAddress = order.shippingAddress as Record<string, string> | null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        &larr; Back to orders
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Tracking info */}
      {order.shippingLabel && (
        <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Shipping Information</p>
          <div className="mt-1 space-y-1 text-sm">
            <p>
              <span className="text-gray-500 dark:text-gray-400">Carrier:</span>{" "}
              {order.shippingLabel.carrier} — {order.shippingLabel.service}
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">Tracking:</span>{" "}
              <span className="font-mono">{order.shippingLabel.trackingNumber}</span>
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-gray-500 dark:text-gray-400">{item.variantName}</p>
                  )}
                  {item.sku && (
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.price.toString())} x {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.total.toString())}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(order.tax.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingCost.toString())}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total.toString())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {order.payment && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold">Payment</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Method</span>
              <span>{order.payment.method.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="capitalize">{order.payment.status.toLowerCase()}</span>
            </div>
            {order.payment.transactionRef && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Reference</span>
                <span className="font-mono text-xs">{order.payment.transactionRef}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Return */}
      {order.status === "ORDER_COMPLETE" && (
        <div className="mt-6">
          <Link
            href={`/orders/${order.id}/return`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Request Return
          </Link>
        </div>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold">Shipping Address</h2>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p>{shippingAddress.line1}</p>
            {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
          </div>
        </div>
      )}
    </div>
  )
}
