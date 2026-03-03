import { prisma } from "@/lib/prisma"
import { StackForm } from "../stack-form"

export const metadata = { title: "New Stack | Admin" }

export default async function NewStackPage() {
  const rawProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      basePrice: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  })

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    basePrice: Number(p.basePrice),
    imageUrl: p.images[0]?.url || null,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold">New Stack</h1>
      <div className="mt-6">
        <StackForm products={products} />
      </div>
    </div>
  )
}
