import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAffiliateStats, getAffiliateRecentOrders } from "@/actions/affiliates"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ORDER_STATUSES, COMMISSION_STATUSES } from "@/lib/constants"
import { AffiliateNav } from "@/components/affiliate/affiliate-nav"
import { CopyLinkButton } from "@/components/affiliate/copy-link-button"
import Link from "next/link"

export const metadata = { title: "Affiliate Dashboard" }

export default async function AffiliateDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const stats = await getAffiliateStats()
  if (!stats) redirect("/affiliate/apply")

  const recentOrders = await getAffiliateRecentOrders()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const referralLink = `${baseUrl}/?ref=${stats.referralCode}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">
            Welcome back, {session.user.name || "affiliate"}
          </p>
        </div>
        <AffiliateNav />
      </div>

      {/* Referral Link */}
      <div className="mt-6 rounded-lg border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your Referral Link</h2>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Active
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted px-4 py-2.5">
            <code className="block truncate text-sm">{referralLink}</code>
          </div>
          <CopyLinkButton link={referralLink} />
        </div>
        <p className="mt-2 text-xs text-secondary">
          Code: <span className="font-mono font-semibold">{stats.referralCode}</span>
          <span className="mx-2 text-border">|</span>
          Commission rate: <span className="font-semibold">{stats.commissionRate}%</span>
          <span className="mx-2 text-border">|</span>
          <Link href="/affiliate/links" className="text-foreground underline">Manage links</Link>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Clicks" value={stats.totalClicks.toLocaleString()} icon="cursor" />
        <StatCard label="Referred Orders" value={stats.totalOrders.toLocaleString()} icon="cart" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon="percent" />
        <StatCard label="Total Earned" value={formatCurrency(stats.totalEarned)} icon="dollar" highlight />
      </div>

      {/* Earnings Breakdown + Recent Orders */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Earnings */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-secondary">Pending</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingEarnings)}
            </p>
            <p className="mt-1 text-xs text-secondary">
              Awaiting approval or payout
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-secondary">Paid Out</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {formatCurrency(stats.paidEarnings)}
            </p>
            <p className="mt-1 text-xs text-secondary">
              Total paid to you
            </p>
            <Link
              href="/affiliate/payouts"
              className="mt-3 inline-block text-xs font-medium text-foreground underline"
            >
              View payout history
            </Link>
          </div>
        </div>

        {/* Recent Referred Orders */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold">Recent Referred Orders</h3>
              <Link href="/affiliate/commissions" className="text-xs text-secondary hover:text-foreground">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-secondary">No referred orders yet.</p>
                <p className="mt-1 text-xs text-secondary">
                  Share your referral link to start earning commissions!
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">Order</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">Total</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">Commission</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => {
                    const orderStatus = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]
                    const commission = order.commissions[0] || null
                    const commStatus = commission
                      ? COMMISSION_STATUSES[commission.status as keyof typeof COMMISSION_STATUSES]
                      : null
                    return (
                      <tr key={order.id}>
                        <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-xs text-secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatCurrency(Number(order.total))}</td>
                        <td className="px-4 py-3 text-xs font-medium">
                          {commission
                            ? formatCurrency(Number(commission.amount))
                            : "—"
                          }
                        </td>
                        <td className="px-4 py-3">
                          {commission && commStatus ? (
                            <Badge color={commStatus.color as "yellow" | "blue" | "green" | "red"}>
                              {commStatus.label}
                            </Badge>
                          ) : (
                            <Badge color={orderStatus?.color as "yellow" | "green" | "blue" | "red"}>
                              {orderStatus?.label || order.status}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon: string
  highlight?: boolean
}) {
  const icons: Record<string, React.ReactNode> = {
    cursor: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
    cart: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    percent: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    dollar: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-green-200 bg-green-50" : "border-border bg-background"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-secondary">{label}</p>
        <span className={highlight ? "text-green-600" : "text-secondary"}>
          {icons[icon]}
        </span>
      </div>
      <p className={`mt-2 text-2xl font-bold ${highlight ? "text-green-700" : ""}`}>{value}</p>
    </div>
  )
}
