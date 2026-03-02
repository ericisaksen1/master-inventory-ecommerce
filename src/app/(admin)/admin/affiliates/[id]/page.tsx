import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { AFFILIATE_STATUSES, COMMISSION_STATUSES, COMMISSION_TYPES } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { AffiliateActions } from "./affiliate-actions"
import { CommissionActions } from "./commission-actions"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminAffiliateDetailPage({ params }: Props) {
  const { id } = await params

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      parent: { include: { user: { select: { name: true, email: true } } } },
      commissions: {
        include: {
          order: { select: { orderNumber: true, total: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { clicks: true, orders: true, children: true } },
    },
  })

  if (!affiliate) notFound()

  // Get available parent affiliates for dropdown
  const availableParents = await prisma.affiliate.findMany({
    where: {
      status: "APPROVED",
      id: { not: id },
      parentId: { not: id },
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  const totalEarned = affiliate.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
  const pendingCommissions = affiliate.commissions.filter(
    (c) => c.status === "PENDING" || c.status === "APPROVED"
  )
  const pendingAmount = pendingCommissions.reduce((sum, c) => sum + Number(c.amount), 0)

  const statusInfo = AFFILIATE_STATUSES[affiliate.status as keyof typeof AFFILIATE_STATUSES]

  return (
    <div>
      <Link href="/admin/affiliates" className="text-sm text-secondary hover:text-foreground">
        &larr; Back to Affiliates
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{affiliate.user.name || "No name"}</h1>
        <Badge color={statusInfo?.color as "yellow" | "green" | "red" | "default"}>
          {statusInfo?.label || affiliate.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-secondary">{affiliate.user.email}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-secondary">Clicks</p>
              <p className="mt-1 text-xl font-bold">{affiliate._count.clicks}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-secondary">Orders</p>
              <p className="mt-1 text-xl font-bold">{affiliate._count.orders}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-secondary">Total Earned</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(totalEarned)}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-secondary">Pending</p>
              <p className="mt-1 text-xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="text-sm font-semibold">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-secondary">Referral Code</dt>
                <dd className="font-mono">{affiliate.referralCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Commission Rate</dt>
                <dd>{Number(affiliate.commissionRate)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Parent Affiliate</dt>
                <dd>
                  {affiliate.parent ? (
                    <Link
                      href={`/admin/affiliates/${affiliate.parent.id}`}
                      className="text-foreground underline"
                    >
                      {affiliate.parent.user.name || affiliate.parent.user.email}
                    </Link>
                  ) : (
                    <span className="text-secondary">None</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Sub-Affiliates</dt>
                <dd>{affiliate._count.children}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Payment Method</dt>
                <dd>{affiliate.paymentMethod || "Not set"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Payment Email</dt>
                <dd>{affiliate.paymentEmail || "Not set"}</dd>
              </div>
              {affiliate.website && (
                <div className="flex justify-between">
                  <dt className="text-secondary">Website</dt>
                  <dd className="truncate max-w-[200px]">{affiliate.website}</dd>
                </div>
              )}
              {affiliate.bio && (
                <div>
                  <dt className="text-secondary">Bio</dt>
                  <dd className="mt-1">{affiliate.bio}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-secondary">Applied</dt>
                <dd>{new Date(affiliate.createdAt).toLocaleDateString()}</dd>
              </div>
              {affiliate.approvedAt && (
                <div className="flex justify-between">
                  <dt className="text-secondary">Approved</dt>
                  <dd>{new Date(affiliate.approvedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Commissions Table */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-sm font-semibold">Commissions</h3>
            </div>
            {affiliate.commissions.length === 0 ? (
              <div className="p-6 text-center text-sm text-secondary">No commissions yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Order</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Rate</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {affiliate.commissions.map((c) => {
                    const cStatus = COMMISSION_STATUSES[c.status as keyof typeof COMMISSION_STATUSES]
                    const cType = COMMISSION_TYPES[c.type as keyof typeof COMMISSION_TYPES]
                    return (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link
                            href={`/admin/orders/${c.orderId}`}
                            className="hover:underline"
                          >
                            {c.order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={cType?.color as "blue" | "purple" | "default"}>
                            {cType?.label || c.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{Number(c.rate)}%</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(Number(c.amount))}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={cStatus?.color as "yellow" | "blue" | "green" | "red"}>
                            {cStatus?.label || c.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <CommissionActions
                            commissionId={c.id}
                            currentStatus={c.status}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar: Actions */}
        <div>
          <AffiliateActions
            affiliateId={affiliate.id}
            currentStatus={affiliate.status}
            currentRate={Number(affiliate.commissionRate)}
            currentParentId={affiliate.parentId}
            availableParents={availableParents.map((a) => ({
              id: a.id,
              label: `${a.user.name || a.user.email} (${a.referralCode})`,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
