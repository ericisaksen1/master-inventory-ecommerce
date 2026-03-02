import { prisma } from "@/lib/prisma"
import { ProductForm } from "../product-form"

export const metadata = { title: "New Product | Admin" }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">New Product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
