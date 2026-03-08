import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getPaymentProvider } from "@/lib/payments"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { CopyOrderNumber } from "./copy-order-number"

export const dynamic = "force-dynamic"

export const metadata = { title: "Order Confirmation" }

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const session = await auth()

  const params = await searchParams
  const orderId = params.orderId
  if (!orderId) redirect("/")

  let order
  if (session?.user) {
    order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { items: true, payment: true },
    })
  } else {
    // Guest: find by ID and verify it's a guest order (no userId)
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    })
    if (order?.userId) order = null // Not a guest order — deny access
  }

  if (!order || !order.payment) notFound()

  const isGuest = !session?.user

  const provider = getPaymentProvider(order.payment.method)
  const instructions = await provider.getInstructions(
    order.orderNumber,
    order.total.toString()
  )

  const isPaymentPending = order.payment.status === "PENDING"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Order Placed!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Order{" "}
          <CopyOrderNumber orderNumber={order.orderNumber}>
            <span className="font-mono font-semibold">{order.orderNumber}</span>
          </CopyOrderNumber>
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800">
        <h2 className="text-lg font-semibold">Payment Instructions</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-semibold text-blue-700">
            {instructions.displayName}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {order.payment.status === "SUBMITTED" ? "Payment submitted" : "Awaiting payment"}
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{instructions.instructions}</p>

        <div className="mt-4 rounded-md bg-white p-4 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Send to</p>
          <p className="mt-1 font-mono text-lg font-bold break-all">{instructions.address}</p>
        </div>

        {instructions.additionalFields && (
          <div className="mt-4 space-y-2">
            {instructions.additionalFields.map((field) => (
              <div key={field.label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{field.label}</span>
                <CopyOrderNumber orderNumber={field.value}>
                  <span className="font-medium font-mono">{field.value}</span>
                </CopyOrderNumber>
              </div>
            ))}
          </div>
        )}

        {instructions.qrCodeUrl && (
          <div className="mt-4 flex justify-center">
            <img src={instructions.qrCodeUrl} alt="Payment QR Code" className="h-48 w-48" />
          </div>
        )}
      </div>


      {order.payment.status === "SUBMITTED" && (
        <div className="mt-6 rounded-md bg-blue-50 p-4 text-center text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          Payment submitted! We&apos;ll confirm it shortly and update your order status.
        </div>
      )}

      {/* Order Summary */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <div>
                <span>{item.name}</span>
                {item.variantName && (
                  <span className="text-gray-500 dark:text-gray-400"> - {item.variantName}</span>
                )}
                <span className="text-gray-500 dark:text-gray-400"> x{item.quantity}</span>
              </div>
              <span>{formatCurrency(item.total.toString())}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
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
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total.toString())}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        {isGuest ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in or create an account
            </Link>{" "}
            to track your orders
          </p>
        ) : (
          <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
            View all orders
          </Link>
        )}
      </div>
    </div>
  )
}
