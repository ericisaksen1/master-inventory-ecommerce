import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { AFFILIATE_STATUSES } from "@/lib/constants"
import Link from "next/link"

export const metadata = { title: "Affiliates | Admin" }

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminAffiliatesPage({ searchParams }: Props) {
  const params = await searchParams
  const statusFilter = params.status || "ALL"

  const where = statusFilter !== "ALL" ? { status: statusFilter as keyof typeof AFFILIATE_STATUSES } : {}

  const affiliates = await prisma.affiliate.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { clicks: true, orders: true, commissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const counts = await prisma.affiliate.groupBy({
    by: ["status"],
    _count: true,
  })

  const statusCounts = Object.fromEntries(counts.map((c) => [c.status, c._count]))
  const totalCount = counts.reduce((sum, c) => sum + c._count, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold">Affiliates</h1>

      {/* Status Filter Tabs */}
      <div className="mt-4 flex gap-2 border-b border-border">
        {[
          { key: "ALL", label: "All", count: totalCount },
          { key: "PENDING", label: "Pending", count: statusCounts.PENDING || 0 },
          { key: "APPROVED", label: "Approved", count: statusCounts.APPROVED || 0 },
          { key: "REJECTED", label: "Rejected", count: statusCounts.REJECTED || 0 },
          { key: "SUSPENDED", label: "Suspended", count: statusCounts.SUSPENDED || 0 },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/admin/affiliates" : `/admin/affiliates?status=${tab.key}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              statusFilter === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-secondary hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {/* Affiliates Table */}
      <div className="mt-4 rounded-lg border border-border bg-background">
        {affiliates.length === 0 ? (
          <div className="p-8 text-center text-secondary">No affiliates found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Affiliate</th>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Rate</th>
                <th className="px-4 py-3 text-left font-medium">Clicks</th>
                <th className="px-4 py-3 text-left font-medium">Orders</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {affiliates.map((aff) => {
                const statusInfo = AFFILIATE_STATUSES[aff.status as keyof typeof AFFILIATE_STATUSES]
                return (
                  <tr key={aff.id} className="hover:bg-muted">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/affiliates/${aff.id}`}
                        className="font-medium hover:underline"
                      >
                        {aff.user.name || "No name"}
                      </Link>
                      <p className="text-xs text-secondary">{aff.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{aff.referralCode}</td>
                    <td className="px-4 py-3">{Number(aff.commissionRate)}%</td>
                    <td className="px-4 py-3">{aff._count.clicks}</td>
                    <td className="px-4 py-3">{aff._count.orders}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusInfo?.color as "yellow" | "green" | "red" | "default"}>
                        {statusInfo?.label || aff.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {new Date(aff.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
