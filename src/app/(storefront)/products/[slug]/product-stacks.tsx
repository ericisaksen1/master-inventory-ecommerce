import { prisma } from "@/lib/prisma"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import { StackCard, type StackCardData } from "@/components/storefront/stack-card"

export async function ProductStacks({ productId }: { productId: string }) {
  const stacks = await prisma.stack.findMany({
    where: {
      isActive: true,
      items: { some: { productId } },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              stock: true,
              isActive: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (stacks.length === 0) return null

  // Collect all product IDs for master inventory lookup
  const allProductIds: string[] = []
  for (const stack of stacks) {
    for (const item of stack.items) {
      allProductIds.push(item.product.id)
    }
  }

  const masterLinks = await prisma.masterSkuLink.findMany({
    where: {
      productId: { in: allProductIds },
      variantId: null,
      siteId: null,
    },
    select: { productId: true, masterSkuId: true, quantityMultiplier: true },
  })

  const masterLinkMap = new Map(masterLinks.map((l) => [l.productId!, l]))

  let availableMap = new Map<string, number>()
  if (masterLinks.length > 0) {
    const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
    availableMap = await getAvailableStockBulk(masterSkuIds)
  }

  const stackData: StackCardData[] = stacks.map((stack) => {
    const items = stack.items.map((si) => ({
      name: si.product.name,
      basePrice: Number(si.product.basePrice),
      imageUrl: si.product.images[0]?.url || null,
      stock: si.product.stock,
      isActive: si.product.isActive,
    }))

    const inStock = stack.items.every((si) => {
      if (!si.product.isActive) return false
      const link = masterLinkMap.get(si.product.id)
      if (link) {
        const available = availableMap.get(link.masterSkuId) ?? 0
        return Math.floor(available / link.quantityMultiplier) >= 1
      }
      return si.product.stock >= 1
    })

    return {
      id: stack.id,
      name: stack.name,
      slug: stack.slug,
      description: stack.description,
      image: stack.image,
      items,
      inStock,
    }
  })

  return (
    <div className="mt-12 border-t border-black/5 pt-8">
      <h2 className="text-lg font-semibold tracking-tight">This product is part of these stacks</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stackData.map((stack) => (
          <StackCard key={stack.id} stack={stack} compact />
        ))}
      </div>
    </div>
  )
}
