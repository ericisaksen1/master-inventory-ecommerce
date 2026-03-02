import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/storefront/order-status-badge"
import { AdminOrderActions } from "./order-actions"
import Link from "next/link"

export const metadata = { title: "Order Details" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: true,
      payment: true,
      shippingLabel: true,
      affiliate: { include: { user: true } },
    },
  })

  if (!order) notFound()

  const shippingAddress = order.shippingAddress as Record<string, string> | null

  const shippingLabelData = order.shippingLabel
    ? {
        carrier: order.shippingLabel.carrier,
        service: order.shippingLabel.service,
        trackingNumber: order.shippingLabel.trackingNumber,
        labelUrl: order.shippingLabel.labelUrl,
        rate: order.shippingLabel.rate.toString(),
      }
    : null

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black">
        &larr; Back to orders
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="font-semibold">Items</h2>
            <div className="mt-4 divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variantName && <p className="text-gray-500">{item.variantName}</p>}
                    {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    {item.printfulStatus && (
                      <span className="mt-0.5 inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                        Printful: {item.printfulStatus}
                      </span>
                    )}
                    <p className="text-gray-500">{formatCurrency(item.price.toString())} x {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total.toString())}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal.toString())}</span></div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatCurrency(order.discountAmount.toString())}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax.toString())}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.shippingCost.toString())}</span></div>
              <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{formatCurrency(order.total.toString())}</span></div>
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="font-semibold">Payment</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize font-medium">{order.payment.status.toLowerCase()}</span>
                </div>
                {order.payment.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction Ref</span>
                    <span className="font-mono text-xs">{order.payment.transactionRef}</span>
                  </div>
                )}
                {order.payment.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confirmed</span>
                    <span>{order.payment.confirmedAt.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.adminNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="font-semibold">Admin Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{order.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions & Shipping Label */}
          <AdminOrderActions
            orderId={order.id}
            currentStatus={order.status}
            paymentStatus={order.payment?.status || "PENDING"}
            shippingLabel={shippingLabelData}
          />

          {/* Customer */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold">Customer</h3>
            <div className="mt-3 text-sm">
              {order.user ? (
                <>
                  <p className="font-medium">{order.user.name || "No name"}</p>
                  <p className="text-gray-500">{order.user.email}</p>
                </>
              ) : order.guestEmail ? (
                <>
                  <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">Guest</span>
                  <p className="mt-1 text-gray-500">{order.guestEmail}</p>
                </>
              ) : (
                <p className="text-gray-400 italic">Deleted user</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold">Shipping Address</h3>
              <div className="mt-3 text-sm text-gray-600">
                <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Affiliate */}
          {order.affiliate && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold">Affiliate</h3>
              <div className="mt-3 text-sm">
                <p className="font-medium">{order.affiliate.user.name || order.affiliate.user.email}</p>
                <p className="text-gray-500">Code: {order.affiliate.referralCode}</p>
                <p className="text-gray-500">Rate: {order.affiliate.commissionRate.toString()}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
