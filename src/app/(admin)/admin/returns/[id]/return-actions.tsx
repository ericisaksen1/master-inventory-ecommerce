"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { approveReturn, denyReturn, markReturnRefunded } from "@/actions/returns"

interface ReturnActionsProps {
  returnId: string
  status: string
}

export function ReturnActions({ returnId, status }: ReturnActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [denyNotes, setDenyNotes] = useState("")
  const { toast } = useToast()

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReturn(returnId)
      if (result.error) toast(result.error, "error")
      else toast("Return approved.")
    })
  }

  function handleDeny() {
    startTransition(async () => {
      const result = await denyReturn(returnId, denyNotes)
      if (result.error) toast(result.error, "error")
      else {
        toast("Return denied.")
        setShowDenyForm(false)
      }
    })
  }

  function handleRefund() {
    if (!confirm("Mark this return as refunded? This will also update the payment status.")) return
    startTransition(async () => {
      const result = await markReturnRefunded(returnId)
      if (result.error) toast(result.error, "error")
      else toast("Return marked as refunded.")
    })
  }

  if (status === "REQUESTED") {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={handleApprove} disabled={isPending}>
            {isPending ? "Processing..." : "Approve Return"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDenyForm(!showDenyForm)}
            disabled={isPending}
          >
            Deny Return
          </Button>
        </div>
        {showDenyForm && (
          <div className="space-y-2 rounded-lg border p-4">
            <label className="block text-sm font-medium">Reason for Denial (optional)</label>
            <textarea
              value={denyNotes}
              onChange={(e) => setDenyNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Reason shown to customer..."
            />
            <Button onClick={handleDeny} disabled={isPending} variant="destructive">
              {isPending ? "Processing..." : "Confirm Deny"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (status === "APPROVED") {
    return (
      <Button onClick={handleRefund} disabled={isPending}>
        {isPending ? "Processing..." : "Mark as Refunded"}
      </Button>
    )
  }

  return null
}
