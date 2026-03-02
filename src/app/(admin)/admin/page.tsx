import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/admin/stats-card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboardPage() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    productCount,
    orderCount,
    customerCount,
    affiliateCount,
    revenueToday,
    revenueWeek,
    revenueMonth,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.affiliate.count({ where: { status: "APPROVED" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: weekStart } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ])

  const topProductIds = topProducts.map((p) => p.productId)
  const products = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, slug: true },
      })
    : []
  const productMap = new Map(products.map((p) => [p.id, p]))

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Today"
          value={formatCurrency(Number(revenueToday._sum.total || 0))}
          iconColor="#23b7e5"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard
          title="This Week"
          value={formatCurrency(Number(revenueWeek._sum.total || 0))}
          iconColor="#845adf"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(Number(revenueMonth._sum.total || 0))}
          iconColor="#26bf94"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Products"
          value={productCount}
          iconColor="#845adf"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />
        <StatsCard
          title="Orders"
          value={orderCount}
          iconColor="#23b7e5"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>}
        />
        <StatsCard
          title="Customers"
          value={customerCount}
          iconColor="#26bf94"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatsCard
          title="Affiliates"
          value={affiliateCount}
          iconColor="#f5b849"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-secondary">No orders yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-5 py-3 text-sm">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-secondary">
                      {order.user?.name || order.user?.email || "Deleted user"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-secondary">
                      {order.status.replace(/_/g, " ")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium">
                      {formatCurrency(order.total.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Popular Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-secondary">No sales data yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Product</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">Sold</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topProducts.map((item) => {
                  const product = productMap.get(item.productId)
                  return (
                    <tr key={item.productId} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3 text-sm">
                        {product ? (
                          <Link href={`/admin/products/${product.id}`} className="font-medium text-primary hover:underline">
                            {product.name}
                          </Link>
                        ) : (
                          <span className="text-secondary">Deleted product</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-secondary">
                        {item._count.id}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium">
                        {formatCurrency(Number(item._sum.total || 0))}
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
  )
}
