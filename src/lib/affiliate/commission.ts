import { prisma } from "@/lib/prisma"
import { getSetting } from "@/lib/settings"
import { DEFAULT_COMMISSION_RATE, DEFAULT_PARENT_COMMISSION_RATE } from "@/lib/constants"

/**
 * Resolves the commission rate for an affiliate on a given order.
 * Priority: Category override → Affiliate personal rate → Global default
 */
export async function resolveCommissionRate(
  affiliateId: string,
  orderItems: { productId: string }[]
): Promise<number> {
  // 1. Check for category-level override (use highest category rate among order items)
  const products = await prisma.product.findMany({
    where: { id: { in: orderItems.map((i) => i.productId) } },
    include: {
      categories: {
        include: {
          category: { select: { commissionRate: true } },
        },
      },
    },
  })

  const categoryRates = products
    .flatMap((p) => p.categories.map((pc) => pc.category.commissionRate))
    .filter((rate): rate is NonNullable<typeof rate> => rate !== null)
    .map((rate) => Number(rate))

  if (categoryRates.length > 0) {
    return Math.max(...categoryRates)
  }

  // 2. Use affiliate's personal rate
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    select: { commissionRate: true },
  })

  if (affiliate) {
    return Number(affiliate.commissionRate)
  }

  // 3. Fall back to global default from settings
  const globalRate = await getSetting("default_commission_rate")
  return parseFloat(globalRate) || DEFAULT_COMMISSION_RATE
}

/**
 * Resolves the parent affiliate commission rate from global settings.
 */
export async function resolveParentCommissionRate(): Promise<number> {
  const rate = await getSetting("parent_commission_rate")
  return parseFloat(rate) || DEFAULT_PARENT_COMMISSION_RATE
}
