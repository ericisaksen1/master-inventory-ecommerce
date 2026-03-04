import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MasterSkuTable } from "./master-sku-table"

export const metadata = { title: "Master SKUs | Admin" }

export default async function AdminInventoryPage() {
  const rawSkus = await prisma.masterSku.findMany({
    include: {
      _count: { select: { productLinks: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const masterSkus = rawSkus.map((s) => ({
    id: s.id,
    sku: s.sku,
    name: s.name,
    stock: s.stock,
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
