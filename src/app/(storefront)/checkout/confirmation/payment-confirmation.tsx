"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitPaymentConfirmation } from "@/actions/checkout"

interface PaymentConfirmationProps {
  orderId: string
}

export function PaymentConfirmation({ orderId }: PaymentConfirmationProps) {
  const [transactionRef, setTransactionRef] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await submitPaymentConfirmation(orderId, transactionRef)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="font-semibold">Already sent your payment?</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Let us know so we can confirm it faster. Optionally include a transaction
        reference (Venmo txn ID, BTC transaction hash, etc.).
      </p>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4">
        <Input
          label="Transaction reference (optional)"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          placeholder="e.g., Venmo txn ID or BTC hash"
        />
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "I've Sent My Payment"}
      </Button>
    </div>
  )
}
