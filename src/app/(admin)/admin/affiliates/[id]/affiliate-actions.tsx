"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { updateAffiliateStatus, updateAffiliateRate, updateAffiliateParent } from "@/actions/affiliates"
import type { AffiliateStatus } from "@prisma/client"

interface AffiliateActionsProps {
  affiliateId: string
  currentStatus: string
  currentRate: number
  currentParentId: string | null
  availableParents: { id: string; label: string }[]
}

export function AffiliateActions({
  affiliateId,
  currentStatus,
  currentRate,
  currentParentId,
  availableParents,
}: AffiliateActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [rate, setRate] = useState(currentRate.toString())
  const [parentId, setParentId] = useState(currentParentId || "")
  const { toast } = useToast()
  const router = useRouter()

  function handleStatusChange(status: AffiliateStatus) {
    startTransition(async () => {
      const result = await updateAffiliateStatus(affiliateId, status)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(`Status updated to ${status}`)
        router.refresh()
      }
    })
  }

  function handleRateUpdate() {
    const numRate = parseFloat(rate)
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      toast("Rate must be between 0 and 100", "error")
      return
    }
    startTransition(async () => {
      const result = await updateAffiliateRate(affiliateId, numRate)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Commission rate updated")
        router.refresh()
      }
    })
  }

  function handleParentUpdate() {
    startTransition(async () => {
      const result = await updateAffiliateParent(affiliateId, parentId || null)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(parentId ? "Parent affiliate assigned" : "Parent affiliate removed")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Status Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold">Status</h3>
        <div className="mt-4 space-y-2">
          {currentStatus === "PENDING" && (
            <>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("APPROVED")}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Approve"}
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleStatusChange("REJECTED")}
                disabled={isPending}
              >
                Reject
              </Button>
            </>
          )}
          {currentStatus === "APPROVED" && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleStatusChange("SUSPENDED")}
              disabled={isPending}
            >
              Suspend
            </Button>
          )}
          {currentStatus === "SUSPENDED" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusChange("APPROVED")}
              disabled={isPending}
            >
              Reactivate
            </Button>
          )}
          {currentStatus === "REJECTED" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusChange("APPROVED")}
              disabled={isPending}
            >
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Commission Rate */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold">Commission Rate</h3>
        <div className="mt-4 flex gap-2">
          <Input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            type="number"
            min="0"
            max="100"
            step="0.5"
          />
          <Button onClick={handleRateUpdate} disabled={isPending} variant="outline">
            Save
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Personal rate override. Category-level rates take priority.
        </p>
      </div>

      {/* Parent Affiliate */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold">Parent Affiliate</h3>
        <p className="mt-1 text-xs text-gray-500">
          Parent earns a commission on this affiliate&apos;s sales.
        </p>
        <div className="mt-4 space-y-2">
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">No parent</option>
            {availableParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <Button
            onClick={handleParentUpdate}
            disabled={isPending}
            variant="outline"
            className="w-full"
          >
            {isPending ? "Saving..." : "Update Parent"}
          </Button>
        </div>
      </div>
    </div>
  )
}
