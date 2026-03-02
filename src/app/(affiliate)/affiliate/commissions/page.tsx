import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAffiliateCommissions } from "@/actions/affiliates"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { COMMISSION_STATUSES, COMMISSION_TYPES } from "@/lib/constants"
import { AffiliateNav } from "@/components/affiliate/affiliate-nav"

export const metadata = { title: "Commissions | Affiliate" }

export default async function AffiliateCommissionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { commissions, total } = await getAffiliateCommissions()

  const totalAmount = commissions.reduce((sum, c) => sum + Number(c.amount), 0)
  const pendingAmount = commissions
    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <AffiliateNav />
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-secondary">Total Commissions</p>
          <p className="mt-1 text-xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-secondary">Total Value</p>
          <p className="mt-1 text-xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs font-medium text-yellow-700">Pending</p>
          <p className="mt-1 text-xl font-bold text-yellow-700">{formatCurrency(pendingAmount)}</p>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="mt-6 rounded-lg border border-border bg-background">
        {commissions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-foreground">No commissions yet</p>
            <p className="mt-1 text-sm text-secondary">
              Share your referral link to start earning commissions on every sale.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Order Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commissions.map((c) => {
                const statusInfo = COMMISSION_STATUSES[c.status as keyof typeof COMMISSION_STATUSES]
                const typeInfo = COMMISSION_TYPES[c.type as keyof typeof COMMISSION_TYPES]
                return (
                  <tr key={c.id} className="hover:bg-muted">
                    <td className="px-4 py-3 font-mono text-xs">{c.order.orderNumber}</td>
                    <td className="px-4 py-3 text-secondary">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={typeInfo?.color as "blue" | "purple" | "default"}>
                        {typeInfo?.label || c.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(Number(c.order.total))}</td>
                    <td className="px-4 py-3">{Number(c.rate)}%</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(Number(c.amount))}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusInfo?.color as "yellow" | "blue" | "green" | "red"}>
                        {statusInfo?.label || c.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {total > 20 && (
        <p className="mt-4 text-center text-sm text-secondary">
          Showing {commissions.length} of {total} commissions
        </p>
      )}
    </div>
  )
}
