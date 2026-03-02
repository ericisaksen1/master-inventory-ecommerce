import { prisma } from "@/lib/prisma"
import { CategoriesView } from "./categories-view"

export const metadata = { title: "Categories | Admin" }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: { select: { name: true } },
    },
    orderBy: { sortOrder: "asc" },
  })

  const serialized = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    parentId: cat.parentId,
    parentName: cat.parent?.name || null,
    commissionRate: cat.commissionRate ? Number(cat.commissionRate) : null,
    isActive: cat.isActive,
    productCount: cat._count.products,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="mt-6">
        <CategoriesView categories={serialized} />
      </div>
    </div>
  )
}
