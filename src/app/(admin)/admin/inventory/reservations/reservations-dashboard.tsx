"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { cleanupExpiredReservationsAction } from "@/actions/inventory"

interface Reservation {
  id: string
  sku: string
  skuName: string
  siteName: string
  sessionRef: string
  quantity: number
  status: string
  expiresAt: string
  createdAt: string
}

interface Props {
  active: Reservation[]
  recent: Reservation[]
  todayStats: {
    confirmed: number
    expired: number
    released: number
  }
}

export function ReservationsDashboard({ active, recent, todayStats }: Props) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleCleanup() {
    startTransition(async () => {
      const result = await cleanupExpiredReservationsAction()
      toast(`Cleaned up ${result.count} expired reservation${result.count !== 1 ? "s" : ""}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-secondary">Active Now</p>
          <p className="mt-1 text-2xl font-bold">{active.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-secondary">Confirmed Today</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{todayStats.confirmed}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-secondary">Expired Today</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{todayStats.expired}</p>
        </div>
      </div>

      {/* Active Reservations */}
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Active Reservations</h2>
          <Button size="sm" variant="outline" onClick={handleCleanup} disabled={isPending}>
            {isPending ? "Cleaning..." : "Cleanup Expired"}
          </Button>
        </div>
        {active.length === 0 ? (
          <div className="p-4 text-center text-sm text-secondary">No active reservations.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Site</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Expires</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {active.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs">{r.sku}</span>
                    <span className="ml-2 text-xs text-secondary">{r.skuName}</span>
                  </td>
                  <td className="px-4 py-2 text-xs">{r.siteName}</td>
                  <td className="px-4 py-2">{r.quantity}</td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(r.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-secondary">
                    {r.sessionRef.slice(0, 12)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent History */}
      <div className="rounded-lg border border-border bg-background">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Recent History</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-4 text-center text-sm text-secondary">No recent reservations.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Site</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs">{r.sku}</span>
                  </td>
                  <td className="px-4 py-2 text-xs">{r.siteName}</td>
                  <td className="px-4 py-2">{r.quantity}</td>
                  <td className="px-4 py-2">
                    <Badge
                      color={
                        r.status === "CONFIRMED" ? "green" :
                        r.status === "EXPIRED" ? "red" :
                        r.status === "RELEASED" ? "purple" : "red"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-secondary">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
