import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Returns | Admin" }

const statusColors: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  DENIED: "bg-red-100 text-red-800",
  REFUNDED: "bg-green-100 text-green-800",
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReturnsPage({ searchParams }: Props) {
  const sp = await searchParams
  const statusFilter = sp.status

  const where = statusFilter ? { status: statusFilter as any } : {}

  const returns = await prisma.return.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true } },
      user: { select: { name: true, email: true } },
      items: { include: { orderItem: { select: { name: true } } } },
    },
  })

  const statuses = ["REQUESTED", "APPROVED", "DENIED", "REFUNDED"]

  return (
    <div>
      <h1 className="text-2xl font-bold">Returns</h1>
      <p className="mt-1 text-sm text-gray-500">Manage customer return requests.</p>

      {/* Status filter tabs */}
      <div className="mt-6 flex gap-2">
        <Link
          href="/admin/returns"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            !statusFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/returns?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {/* Returns table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No returns found.
                </td>
              </tr>
            ) : (
              returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">#{ret.order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{ret.user.name || "Customer"}</div>
                    <div className="text-xs text-gray-500">{ret.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {ret.items.map((i) => i.orderItem.name).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[ret.status] || ""}>
                      {ret.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {ret.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/returns/${ret.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
