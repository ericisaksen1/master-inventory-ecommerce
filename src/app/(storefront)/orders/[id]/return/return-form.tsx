"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { requestReturn } from "@/actions/returns"
import { useRouter } from "next/navigation"

interface Item {
  id: string
  name: string
  variantName: string | null
  quantity: number
  price: number
}

interface ReturnFormProps {
  orderId: string
  items: Item[]
}

export function ReturnForm({ orderId, items }: ReturnFormProps) {
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function toggleItem(itemId: string, maxQty: number) {
    setSelected((prev) => {
      if (prev[itemId]) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: maxQty }
    })
  }

  function handleSubmit(formData: FormData) {
    // Inject selected quantities
    for (const [itemId, qty] of Object.entries(selected)) {
      formData.set(`qty_${itemId}`, String(qty))
    }

    startTransition(async () => {
      const result = await requestReturn(orderId, formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Return request submitted!")
        router.push(`/orders/${orderId}`)
      }
    })
  }

  const hasSelection = Object.keys(selected).length > 0

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              selected[item.id] ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <input
              type="checkbox"
              checked={!!selected[item.id]}
              onChange={() => toggleItem(item.id, item.quantity)}
              className="mt-0.5 rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              {item.variantName && (
                <p className="text-sm text-secondary">{item.variantName}</p>
              )}
              <p className="text-sm text-secondary">
                ${item.price.toFixed(2)} &times; {item.quantity}
              </p>
            </div>
            {selected[item.id] && item.quantity > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-secondary">Qty:</label>
                <select
                  value={selected[item.id]}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) }))
                  }
                  className="rounded border border-border bg-background px-2 py-1 text-sm"
                >
                  {Array.from({ length: item.quantity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </label>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Reason for Return</label>
        <textarea
          name="reason"
          required
          minLength={10}
          rows={3}
          placeholder="Please describe why you are returning these items..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
        />
      </div>

      <Button type="submit" disabled={isPending || !hasSelection}>
        {isPending ? "Submitting..." : "Submit Return Request"}
      </Button>
    </form>
  )
}
