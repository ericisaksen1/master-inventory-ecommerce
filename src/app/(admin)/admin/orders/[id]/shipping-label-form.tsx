"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { manuallyMarkShipped } from "@/actions/shipping"

interface ShippingLabelFormProps {
  orderId: string
}

export function ShippingLabelForm({ orderId }: ShippingLabelFormProps) {
  const [isPending, startTransition] = useTransition()
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  function handleSubmit() {
    startTransition(async () => {
      const result = await manuallyMarkShipped(orderId, carrier, trackingNumber)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Order marked as shipped!")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Mark as Shipped</h3>
      <p className="text-xs text-gray-500">
        If ShipStation is connected, tracking will be updated automatically. Use this form to manually mark an order as shipped.
      </p>
      <div className="space-y-3">
        <Input
          label="Carrier"
          type="text"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder="e.g., USPS, UPS, FedEx"
        />
        <Input
          label="Tracking Number"
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g., 1Z999AA10123456784"
        />
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isPending ? "Updating..." : "Mark as Shipped"}
        </Button>
      </div>
    </div>
  )
}
