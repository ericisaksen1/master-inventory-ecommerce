import { prisma } from "@/lib/prisma"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import { StackCard, type StackCardData } from "@/components/storefront/stack-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stacks",
  description: "Browse our curated product bundles.",
}

async function checkStacksStock(stacks: any[]): Promise<StackCardData[]> {
  // Collect all product IDs across all stacks
  const allProductIds: string[] = []
  for (const stack of stacks) {
    for (const item of stack.items) {
      allProductIds.push(item.product.id)
    }
  }

  // Look up master SKU links for all products (product-level, no site)
  const masterLinks = await prisma.masterSkuLink.findMany({
    where: {
      productId: { in: allProductIds },
      variantId: null,
      siteId: null,
    },
    select: { productId: true, masterSkuId: true, quantityMultiplier: true },
  })

  const masterLinkMap = new Map(masterLinks.map((l) => [l.productId!, l]))

  // Batch check master inventory
  let availableMap = new Map<string, number>()
  if (masterLinks.length > 0) {
    const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
    availableMap = await getAvailableStockBulk(masterSkuIds)
  }

  return stacks.map((stack) => {
    const items = stack.items.map((si: any) => ({
      name: si.product.name,
      basePrice: Number(si.product.basePrice),
      imageUrl: si.product.images[0]?.url || null,
      stock: si.product.stock,
      isActive: si.product.isActive,
    }))

    const inStock = stack.items.every((si: any) => {
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
}

export default async function StacksPage() {
  const stacks = await prisma.stack.findMany({
    where: { isActive: true },
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
    orderBy: { sortOrder: "asc" },
  })

  const stackData = await checkStacksStock(stacks)

  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Stacks</h1>
      <p className="mt-2 text-secondary">Curated product bundles — add everything to your cart in one click.</p>

      {stackData.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stackData.map((stack) => (
            <StackCard key={stack.id} stack={stack} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-secondary">No stacks available right now.</p>
      )}
    </div>
  )
}
