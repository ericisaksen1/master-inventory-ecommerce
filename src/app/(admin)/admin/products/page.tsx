import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductTable } from "./product-table"

export const metadata = { title: "Products | Admin" }

export default async function AdminProductsPage() {
  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        categories: { include: { category: { select: { id: true, name: true } } } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    basePrice: Number(p.basePrice),
    stock: p.stock,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    imageUrl: p.images[0]?.url || null,
    categoryId: p.categories[0]?.category.id || null,
    categoryName: p.categories[0]?.category.name || null,
    totalVariantStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    hasVariants: p.variants.length > 0,
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="mt-6">
        <ProductTable products={products} categories={categories} />
      </div>
    </div>
  )
}
