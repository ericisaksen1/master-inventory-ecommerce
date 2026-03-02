import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAffiliatePaidCommissions, getAffiliateStats } from "@/actions/affiliates"
import { formatCurrency } from "@/lib/utils"
import { AffiliateNav } from "@/components/affiliate/affiliate-nav"

export const metadata = { title: "Payouts | Affiliate" }

export default async function AffiliatePayoutsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const stats = await getAffiliateStats()
  if (!stats) redirect("/affiliate/apply")

  const { commissions: paidCommissions, total } = await getAffiliatePaidCommissions()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <AffiliateNav />
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-green-700">Total Paid</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {formatCurrency(stats.paidEarnings)}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-yellow-700">Pending Payout</p>
          <p className="mt-2 text-3xl font-bold text-yellow-700">
            {formatCurrency(stats.pendingEarnings)}
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="mt-6 rounded-lg border border-border bg-background">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Payout History</h2>
        </div>
        {paidCommissions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-foreground">No payouts yet</p>
            <p className="mt-1 text-sm text-secondary">
              Once your commissions are approved and paid, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Paid On</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary">Reference</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-secondary">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paidCommissions.map((c) => (
                <tr key={c.id} className="hover:bg-muted">
                  <td className="px-4 py-3 font-mono text-xs">{c.order.orderNumber}</td>
                  <td className="px-4 py-3 text-secondary">
                    {c.paidAt ? new Date(c.paidAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary">{c.paidRef || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {formatCurrency(Number(c.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > 50 && (
        <p className="mt-4 text-center text-sm text-secondary">
          Showing {paidCommissions.length} of {total} payouts
        </p>
      )}
    </div>
  )
}
