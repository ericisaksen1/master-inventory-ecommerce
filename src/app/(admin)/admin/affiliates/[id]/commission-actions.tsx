"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { updateCommissionStatus } from "@/actions/affiliates"

interface CommissionActionsProps {
  commissionId: string
  currentStatus: string
}

export function CommissionActions({ commissionId, currentStatus }: CommissionActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleUpdate(status: "APPROVED" | "PAID" | "CANCELLED") {
    startTransition(async () => {
      const result = await updateCommissionStatus(commissionId, status)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(`Commission ${status.toLowerCase()}`)
        router.refresh()
      }
    })
  }

  if (currentStatus === "PAID" || currentStatus === "CANCELLED") return null

  return (
    <div className="flex gap-1">
      {currentStatus === "PENDING" && (
        <Button size="sm" variant="outline" onClick={() => handleUpdate("APPROVED")} disabled={isPending}>
          Approve
        </Button>
      )}
      {(currentStatus === "PENDING" || currentStatus === "APPROVED") && (
        <Button size="sm" variant="outline" onClick={() => handleUpdate("PAID")} disabled={isPending}>
          Mark Paid
        </Button>
      )}
    </div>
  )
}
