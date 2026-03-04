import { prisma } from "@/lib/prisma"

// ============================================================
// Public API
// ============================================================

/**
 * Get available stock for a single master SKU.
 */
export async function getAvailableStock(
  masterSkuId: string
): Promise<number> {
  const masterSku = await prisma.masterSku.findUnique({
    where: { id: masterSkuId },
    select: { stock: true },
  })
  return masterSku?.stock ?? 0
}

/**
 * Get available stock for multiple master SKUs in a single query.
 */
export async function getAvailableStockBulk(
  masterSkuIds: string[]
): Promise<Map<string, number>> {
  if (masterSkuIds.length === 0) return new Map()

  const skus = await prisma.masterSku.findMany({
    where: { id: { in: masterSkuIds } },
    select: { id: true, stock: true },
  })

  const result = new Map<string, number>()
  for (const sku of skus) {
    result.set(sku.id, sku.stock)
  }

  return result
}

/**
 * Look up whether a local product/variant is linked to a master SKU.
 */
export async function getMasterSkuForProduct(
  productId: string,
  variantId?: string
): Promise<{
  masterSkuId: string
  masterSku: string
  quantityMultiplier: number
} | null> {
  // Check variant-level link first (more specific)
  if (variantId) {
    const variantLink = await prisma.masterSkuLink.findFirst({
      where: { variantId, siteId: null },
      include: { masterSku: { select: { id: true, sku: true } } },
    })
    if (variantLink) {
      return {
        masterSkuId: variantLink.masterSku.id,
        masterSku: variantLink.masterSku.sku,
        quantityMultiplier: variantLink.quantityMultiplier,
      }
    }
  }

  // Fall back to product-level link
  const productLink = await prisma.masterSkuLink.findFirst({
    where: { productId, variantId: null, siteId: null },
    include: { masterSku: { select: { id: true, sku: true } } },
  })
  if (productLink) {
    let effectiveMultiplier = productLink.quantityMultiplier

    // Use the variant's unitsPerItem to scale the multiplier so admins
    // only need one product-level link — e.g. a 3-pack with unitsPerItem=3
    // automatically consumes 3 master units per order quantity
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { unitsPerItem: true },
      })
      if (variant && variant.unitsPerItem > 1) {
        effectiveMultiplier *= variant.unitsPerItem
      }
    }

    return {
      masterSkuId: productLink.masterSku.id,
      masterSku: productLink.masterSku.sku,
      quantityMultiplier: effectiveMultiplier,
    }
  }

  return null
}

/**
 * Look up a master SKU link by remote site reference.
 */
export async function getMasterSkuForRemoteRef(
  siteId: string,
  remoteRef: string
): Promise<{
  masterSkuId: string
  masterSku: string
  quantityMultiplier: number
} | null> {
  const link = await prisma.masterSkuLink.findFirst({
    where: { siteId, remoteRef },
    include: { masterSku: { select: { id: true, sku: true } } },
  })

  if (!link) return null

  return {
    masterSkuId: link.masterSku.id,
    masterSku: link.masterSku.sku,
    quantityMultiplier: link.quantityMultiplier,
  }
}

/**
 * Resolve master SKU strings to local products/variants.
 * Looks up MasterSku by SKU string, then finds the local MasterSkuLink
 * (where siteId IS NULL) to get the local productId/variantId.
 */
export async function resolveLocalProducts(
  masterSkuStrings: string[]
): Promise<
  Map<
    string,
    { masterSkuId: string; productId: string; variantId: string | null; quantityMultiplier: number }
  >
> {
  if (masterSkuStrings.length === 0) return new Map()

  const masterSkus = await prisma.masterSku.findMany({
    where: { sku: { in: masterSkuStrings }, isActive: true },
  })

  if (masterSkus.length === 0) return new Map()

  const masterSkuIds = masterSkus.map((ms) => ms.id)
  const localLinks = await prisma.masterSkuLink.findMany({
    where: { masterSkuId: { in: masterSkuIds }, siteId: null },
    include: { masterSku: { select: { sku: true } } },
  })

  const result = new Map<
    string,
    { masterSkuId: string; productId: string; variantId: string | null; quantityMultiplier: number }
  >()

  for (const link of localLinks) {
    if (link.productId) {
      result.set(link.masterSku.sku, {
        masterSkuId: link.masterSkuId,
        productId: link.productId,
        variantId: link.variantId,
        quantityMultiplier: link.quantityMultiplier,
      })
    }
  }

  return result
}
