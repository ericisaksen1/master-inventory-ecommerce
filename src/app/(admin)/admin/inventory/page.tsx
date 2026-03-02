import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MasterSkuTable } from "./master-sku-table"

export const metadata = { title: "Master SKUs | Admin" }

export default async function AdminInventoryPage() {
  const rawSkus = await prisma.masterSku.findMany({
    include: {
      _count: { select: { productLinks: true } },
      reservations: {
        where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const masterSkus = rawSkus.map((s) => ({
    id: s.id,
    sku: s.sku,
    name: s.name,
    stock: s.stock,
    reserved: s.reservations.reduce((sum, r) => sum + r.quantity, 0),
    available: Math.max(0, s.stock - s.reservations.reduce((sum, r) => sum + r.quantity, 0)),
    linkedProducts: s._count.productLinks,
    isActive: s.isActive,
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Master SKUs</h1>
        <Link href="/admin/inventory/new">
          <Button>Add Master SKU</Button>
        </Link>
      </div>

      <div className="mt-6">
        <MasterSkuTable masterSkus={masterSkus} />
      </div>
    </div>
  )
}
