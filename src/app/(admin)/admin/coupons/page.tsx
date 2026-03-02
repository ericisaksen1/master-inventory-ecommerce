import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DeleteCouponButton } from "./delete-coupon-button"

export const metadata = { title: "Coupons | Admin" }

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/coupons/analytics"
            className="text-sm text-secondary hover:text-foreground"
          >
            View Analytics
          </Link>
          <Link href="/admin/coupons/new">
            <Button>Create Coupon</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-secondary">No coupons yet.</p>
            <p className="mt-1 text-xs text-secondary">
              Create your first coupon to offer discounts to customers.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-secondary">Code</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Discount</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Used</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Expires</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
                <th className="px-4 py-3 text-right font-medium text-secondary"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && coupon.expiresAt < new Date()
                const isMaxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses
                return (
                  <tr key={coupon.id} className="hover:bg-muted">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="font-mono font-semibold hover:underline"
                      >
                        {coupon.code}
                      </Link>
                      {coupon.description && (
                        <p className="mt-0.5 text-xs text-secondary">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.discountValue)}%`
                        : `$${Number(coupon.discountValue).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                      <span className="ml-1 text-xs text-secondary">
                        ({coupon._count.orders} orders)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      {!coupon.isActive ? (
                        <Badge color="default">Inactive</Badge>
                      ) : isExpired ? (
                        <Badge color="red">Expired</Badge>
                      ) : isMaxed ? (
                        <Badge color="yellow">Maxed Out</Badge>
                      ) : (
                        <Badge color="green">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteCouponButton couponId={coupon.id} />
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
