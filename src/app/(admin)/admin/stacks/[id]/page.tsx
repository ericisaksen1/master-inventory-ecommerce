import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { StackForm } from "../stack-form"
import { DeleteStackButton } from "./delete-stack-button"

export const metadata = { title: "Edit Stack | Admin" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditStackPage({ params }: Props) {
  const { id } = await params

  const [rawStack, rawProducts] = await Promise.all([
    prisma.stack.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          select: { productId: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        basePrice: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
  ])

  if (!rawStack) notFound()

  const stack = {
    id: rawStack.id,
    name: rawStack.name,
    slug: rawStack.slug,
    description: rawStack.description,
    image: rawStack.image,
    isActive: rawStack.isActive,
    productIds: rawStack.items.map((i) => i.productId),
  }

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    basePrice: Number(p.basePrice),
    imageUrl: p.images[0]?.url || null,
  }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Stack</h1>
        <DeleteStackButton stackId={rawStack.id} stackName={rawStack.name} />
      </div>
      <div className="mt-6">
        <StackForm stack={stack} products={products} />
      </div>
    </div>
  )
}
