import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Coupon Analytics | Admin" }

export default async function CouponAnalyticsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { total: true },
      },
    },
  })

  const totalRevenue = coupons.reduce(
    (sum, c) => sum + c.orders.reduce((s, o) => s + Number(o.total), 0),
    0
  )
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0)
  const activeCoupons = coupons.filter(
    (c) => c.isActive && (!c.expiresAt || c.expiresAt > new Date())
  ).length

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupon Analytics</h1>
          <p className="mt-1 text-sm text-secondary">
            Track coupon performance and revenue impact.
          </p>
        </div>
        <Link
          href="/admin/coupons"
          className="text-sm text-secondary hover:text-foreground"
        >
          &larr; Back to Coupons
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-medium text-secondary">Total Revenue (with coupons)</p>
          <p className="mt-1 text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-medium text-secondary">Total Coupon Uses</p>
          <p className="mt-1 text-2xl font-bold">{totalUses}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-medium text-secondary">Active Coupons</p>
          <p className="mt-1 text-2xl font-bold">{activeCoupons}</p>
        </div>
      </div>

      {/* Coupon performance table */}
      <div className="mt-6 rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-secondary">Code</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Type</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Discount</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Uses</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Revenue</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const revenue = coupon.orders.reduce((s, o) => s + Number(o.total), 0)
                const isExpired = coupon.expiresAt && coupon.expiresAt < new Date()
                const isMaxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses

                return (
                  <tr key={coupon.id} className="hover:bg-muted">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold">{coupon.code}</span>
                      {coupon.description && (
                        <p className="mt-0.5 text-xs text-secondary">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {coupon.discountType === "PERCENTAGE" ? "Percentage" : "Fixed"}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.discountValue)}%`
                        : `$${Number(coupon.discountValue).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {!coupon.isActive ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Inactive</span>
                      ) : isExpired ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>
                      ) : isMaxed ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Maxed</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
