import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { ReturnActions } from "./return-actions"
import Link from "next/link"

export const metadata = { title: "Return Details | Admin" }

const statusColors: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  DENIED: "bg-red-100 text-red-800",
  REFUNDED: "bg-green-100 text-green-800",
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminReturnDetailPage({ params }: Props) {
  const { id } = await params

  const ret = await prisma.return.findUnique({
    where: { id },
    include: {
      order: { select: { id: true, orderNumber: true, total: true } },
      user: { select: { name: true, email: true } },
      items: {
        include: {
          orderItem: {
            select: { name: true, variantName: true, quantity: true, price: true },
          },
        },
      },
    },
  })

  if (!ret) notFound()

  return (
    <div className="max-w-2xl">
      <Link href="/admin/returns" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Returns
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Return — Order #{ret.order.orderNumber}</h1>
        <Badge className={statusColors[ret.status] || ""}>{ret.status}</Badge>
      </div>

      <div className="mt-6 space-y-6">
        {/* Customer info */}
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Customer</h2>
          <p className="mt-1 font-medium">{ret.user.name || "Customer"}</p>
          <p className="text-sm text-gray-500">{ret.user.email}</p>
        </div>

        {/* Reason */}
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Reason</h2>
          <p className="mt-1 text-sm">{ret.reason}</p>
        </div>

        {/* Items */}
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Items</h2>
          <div className="mt-2 space-y-2">
            {ret.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.orderItem.name}</span>
                  {item.orderItem.variantName && (
                    <span className="text-gray-500"> — {item.orderItem.variantName}</span>
                  )}
                </div>
                <span className="text-gray-500">
                  {item.quantity} of {item.orderItem.quantity} &times; ${Number(item.orderItem.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin notes */}
        {ret.adminNotes && (
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Admin Notes</h2>
            <p className="mt-1 text-sm">{ret.adminNotes}</p>
          </div>
        )}

        {/* Dates */}
        <div className="text-xs text-gray-500">
          <p>Requested: {ret.createdAt.toLocaleString()}</p>
          <p>Updated: {ret.updatedAt.toLocaleString()}</p>
        </div>

        {/* Actions */}
        <ReturnActions returnId={ret.id} status={ret.status} />
      </div>
    </div>
  )
}
