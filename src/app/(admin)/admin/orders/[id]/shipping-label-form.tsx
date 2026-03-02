"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { getShippingRates, purchaseShippingLabel } from "@/actions/shipping"
import type { ShippingRate } from "@/lib/shipstation"

interface ShippingLabelFormProps {
  orderId: string
}

export function ShippingLabelForm({ orderId }: ShippingLabelFormProps) {
  const [isPending, startTransition] = useTransition()
  const [weightOz, setWeightOz] = useState("")
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [hasRates, setHasRates] = useState(false)
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  function handleGetRates() {
    const weight = parseFloat(weightOz)
    if (!weight || weight <= 0) {
      toast("Enter a valid weight", "error")
      return
    }
    startTransition(async () => {
      const result = await getShippingRates(orderId, weight)
      if ("error" in result) {
        toast(result.error, "error")
      } else {
        setRates(result.rates)
        setHasRates(true)
        setSelectedRateId(null)
      }
    })
  }

  function handlePurchase() {
    if (!selectedRateId) return
    const weight = parseFloat(weightOz)
    startTransition(async () => {
      const result = await purchaseShippingLabel(orderId, selectedRateId, weight)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Shipping label purchased!")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Create Shipping Label</h3>

      {/* Step 1: Enter weight and get rates */}
      {!hasRates && (
        <div className="space-y-3">
          <Input
            label="Package Weight (oz)"
            type="number"
            min="0.1"
            step="0.1"
            value={weightOz}
            onChange={(e) => setWeightOz(e.target.value)}
            placeholder="e.g., 16"
          />
          <Button
            onClick={handleGetRates}
            disabled={isPending || !weightOz}
            className="w-full"
          >
            {isPending ? "Getting Rates..." : "Get Shipping Rates"}
          </Button>
        </div>
      )}

      {/* Step 2: Select rate and purchase */}
      {hasRates && rates.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Select a shipping rate:</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {rates.map((rate) => (
              <label
                key={rate.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedRateId === rate.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_rate"
                    value={rate.id}
                    checked={selectedRateId === rate.id}
                    onChange={() => setSelectedRateId(rate.id)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{rate.carrier}</p>
                    <p className="text-xs text-gray-500">{rate.service}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">${parseFloat(rate.rate).toFixed(2)}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setHasRates(false)
                setRates([])
                setSelectedRateId(null)
              }}
              disabled={isPending}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isPending || !selectedRateId}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Purchasing..." : "Buy Label"}
            </Button>
          </div>
        </div>
      )}

      {hasRates && rates.length === 0 && !isPending && (
        <p className="text-sm text-gray-500">No rates available. Check your ship-from address and ShipStation settings.</p>
      )}
    </div>
  )
}
