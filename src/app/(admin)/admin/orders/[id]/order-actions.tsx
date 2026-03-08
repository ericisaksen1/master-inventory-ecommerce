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

        {currentStatus !== "CANCELLED" && (
          <>
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
          </>
        )}
      </div>

      {/* Shipping / Tracking Info */}
      {shippingLabel && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold">Shipping Info</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Carrier</span>
              <span className="font-medium">{shippingLabel.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">{shippingLabel.service}</span>
            </div>
            {shippingLabel.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking</span>
                <span className="font-mono text-xs">{shippingLabel.trackingNumber}</span>
              </div>
            )}
            {!showNewLabelForm && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShowNewLabelForm(true)}
              >
                Update Shipping Info
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
