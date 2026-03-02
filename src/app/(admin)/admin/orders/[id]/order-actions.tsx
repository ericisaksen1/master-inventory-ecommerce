"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { confirmPayment, updateOrderStatus, resendStatusEmail } from "@/actions/orders"
import { useToast } from "@/components/ui/toast"
import { ShippingLabelForm } from "./shipping-label-form"
import type { OrderStatus, PaymentStatus } from "@prisma/client"

interface ShippingLabelData {
  carrier: string
  service: string
  trackingNumber: string
  labelUrl: string
  rate: string
}

interface AdminOrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
  paymentStatus: PaymentStatus
  shippingLabel: ShippingLabelData | null
}

export function AdminOrderActions({
  orderId,
  currentStatus,
  paymentStatus,
  shippingLabel,
}: AdminOrderActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [manualStatus, setManualStatus] = useState(currentStatus)
  const { toast } = useToast()
  const router = useRouter()

  const showConfirmPayment =
    currentStatus === "AWAITING_PAYMENT" &&
    (paymentStatus === "PENDING" || paymentStatus === "SUBMITTED")

  const [showNewLabelForm, setShowNewLabelForm] = useState(false)
  const showShippingForm = (currentStatus === "PAYMENT_COMPLETE" && !shippingLabel) || showNewLabelForm

  const canCancel = currentStatus === "AWAITING_PAYMENT" || currentStatus === "PAYMENT_COMPLETE"

  function handleConfirmPayment() {
    startTransition(async () => {
      const result = await confirmPayment(orderId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Payment confirmed!")
        router.refresh()
      }
    })
  }

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, "CANCELLED")
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Order cancelled")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold">Actions</h3>

        <div className="mt-4 space-y-3">
          {showConfirmPayment && (
            <Button
              onClick={handleConfirmPayment}
              disabled={isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Confirming..." : "Confirm Payment"}
            </Button>
          )}

          {showShippingForm && <ShippingLabelForm orderId={orderId} />}

          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
              className="w-full"
            >
              Cancel Order
            </Button>
          )}

          {currentStatus === "ORDER_COMPLETE" && !shippingLabel && (
            <p className="text-sm text-gray-500">Order is complete.</p>
          )}

          {currentStatus === "CANCELLED" && (
            <p className="text-sm text-gray-500">This order has been cancelled.</p>
          )}
        </div>

        {/* Resend status email */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await resendStatusEmail(orderId)
                if (result.error) {
                  toast(result.error, "error")
                } else {
                  toast("Status email sent")
                }
              })
            }}
          >
            {isPending ? "Sending..." : "Resend Status Email"}
          </Button>
        </div>

        {/* Manual status override */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs font-medium text-gray-500">Change Status</p>
          <div className="mt-2 flex gap-2">
            <select
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value as OrderStatus)}
              disabled={isPending}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="PAYMENT_COMPLETE">Payment Complete</option>
              <option value="ORDER_COMPLETE">Order Complete</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button
              variant="secondary"
              disabled={isPending || manualStatus === currentStatus}
              onClick={() => {
                startTransition(async () => {
                  const result = await updateOrderStatus(orderId, manualStatus)
                  if (result.error) {
                    toast(result.error, "error")
                  } else {
                    toast("Status updated")
                    router.refresh()
                  }
                })
              }}
            >
              {isPending ? "..." : "Update"}
            </Button>
          </div>
        </div>
      </div>

      {/* Shipping Label Info */}
      {shippingLabel && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold">Shipping Label</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Carrier</span>
              <span className="font-medium">{shippingLabel.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">{shippingLabel.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rate</span>
              <span className="font-medium">${parseFloat(shippingLabel.rate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking</span>
              <span className="font-mono text-xs">{shippingLabel.trackingNumber}</span>
            </div>
            {shippingLabel.labelUrl && (
              <a
                href={shippingLabel.labelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Label
              </a>
            )}
            {shippingLabel.labelUrl && (
              <button
                onClick={() => {
                  const w = window.open(shippingLabel.labelUrl, "_blank")
                  if (w) {
                    w.addEventListener("load", () => {
                      w.print()
                    })
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-2.25 0h.008v.008H16.5V12z" />
                </svg>
                Print Label
              </button>
            )}
            {!showNewLabelForm && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShowNewLabelForm(true)}
              >
                Create New Label
              </Button>
            )}
            {showNewLabelForm && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <ShippingLabelForm orderId={orderId} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
