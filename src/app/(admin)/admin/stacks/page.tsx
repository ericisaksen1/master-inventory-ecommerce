import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StackTable } from "./stack-table"

export const metadata = { title: "Stacks | Admin" }

export default async function AdminStacksPage() {
  const stacks = await prisma.stack.findMany({
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: { where: { isPrimary: true }, take: 1 } },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = stacks.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    isActive: s.isActive,
    image: s.image,
    productCount: s.items.length,
    productNames: s.items.map((i) => i.product.name),
    firstProductImage: s.items[0]?.product.images[0]?.url || null,
    createdAt: s.createdAt.toISOString(),
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stacks</h1>
        <Link href="/admin/stacks/new">
          <Button>Add Stack</Button>
        </Link>
      </div>

      <div className="mt-6">
        <StackTable stacks={serialized} />
      </div>
    </div>
  )
}
