import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

const RESERVATION_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// ============================================================
// Types
// ============================================================

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export interface ReservationItem {
  masterSkuId: string
  quantity: number
}

export interface Adjustment {
  masterSkuId: string
  masterSku: string
  requested: number
  granted: number
}

export interface ReservationResult {
  success: boolean
  sessionRef: string
  expiresAt: Date
  adjustments: Adjustment[]
}

export interface ConfirmResult {
  success: boolean
  error?: string
}

// ============================================================
// Internal helpers
// ============================================================

async function computeAvailableStock(
  tx: TxClient,
  masterSkuId: string
): Promise<{ stock: number; reserved: number; available: number }> {
  const masterSku = await tx.masterSku.findUnique({
    where: { id: masterSkuId },
  })

  if (!masterSku) {
    return { stock: 0, reserved: 0, available: 0 }
  }

  const result = await tx.stockReservation.aggregate({
    where: {
      masterSkuId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    _sum: { quantity: true },
  })

  const reserved = result._sum.quantity ?? 0
  return {
    stock: masterSku.stock,
    reserved,
    available: Math.max(0, masterSku.stock - reserved),
  }
}

// ============================================================
// Public API
// ============================================================

/**
 * Get available stock for a single master SKU (stock minus active reservations).
 */
export async function getAvailableStock(
  masterSkuId: string
): Promise<number> {
  const { available } = await computeAvailableStock(prisma, masterSkuId)
  return available
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

  const reservations = await prisma.stockReservation.groupBy({
    by: ["masterSkuId"],
    where: {
      masterSkuId: { in: masterSkuIds },
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    _sum: { quantity: true },
  })

  const reservedMap = new Map<string, number>()
  for (const r of reservations) {
    reservedMap.set(r.masterSkuId, r._sum.quantity ?? 0)
  }

  const result = new Map<string, number>()
  for (const sku of skus) {
    const reserved = reservedMap.get(sku.id) ?? 0
    result.set(sku.id, Math.max(0, sku.stock - reserved))
  }

  return result
}

/**
 * Reserve stock for checkout. Creates ACTIVE reservations inside a transaction.
 * Returns adjustments for any items where granted < requested.
 */
export async function reserveStock(
  items: ReservationItem[],
  sessionRef: string,
  siteId?: string
): Promise<ReservationResult> {
  const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS)

  // First, release any existing active reservations for this session
  // (in case they re-enter checkout)
  await prisma.stockReservation.updateMany({
    where: {
      sessionRef,
      status: "ACTIVE",
      ...(siteId ? { siteId } : { siteId: null }),
    },
    data: { status: "RELEASED", updatedAt: new Date() },
  })

  const adjustments: Adjustment[] = []

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const { available } = await computeAvailableStock(tx, item.masterSkuId)
      const granted = Math.min(item.quantity, available)

      if (granted < item.quantity) {
        const masterSku = await tx.masterSku.findUnique({
          where: { id: item.masterSkuId },
          select: { sku: true },
        })
        adjustments.push({
          masterSkuId: item.masterSkuId,
          masterSku: masterSku?.sku ?? "",
          requested: item.quantity,
          granted,
        })
      }

      if (granted > 0) {
        await tx.stockReservation.create({
          data: {
            masterSkuId: item.masterSkuId,
            sessionRef,
            siteId: siteId ?? null,
            quantity: granted,
            expiresAt,
          },
        })
      }
    }
  })

  return {
    success: true,
    sessionRef,
    expiresAt,
    adjustments,
  }
}

/**
 * Confirm reservations when an order is placed.
 * If reservations are still active, confirms them and decrements master stock.
 * If expired, re-attempts atomically — succeeds if stock is still available.
 */
export async function confirmReservation(
  sessionRef: string,
  siteId?: string
): Promise<ConfirmResult> {
  return prisma.$transaction(async (tx) => {
    const siteFilter = siteId ? { siteId } : { siteId: null }

    const reservations = await tx.stockReservation.findMany({
      where: {
        sessionRef,
        ...siteFilter,
        status: "ACTIVE",
      },
      include: { masterSku: true },
    })

    if (reservations.length === 0) {
      // No active reservations — they may have expired.
      // Check if there are expired ones we can re-attempt.
      const expired = await tx.stockReservation.findMany({
        where: {
          sessionRef,
          ...siteFilter,
          status: { in: ["ACTIVE", "EXPIRED"] },
        },
        include: { masterSku: true },
      })

      if (expired.length === 0) {
        return { success: false, error: "No reservations found for this session" }
      }

      // Re-attempt: check if stock is available for each expired reservation
      for (const res of expired) {
        const { available } = await computeAvailableStock(tx, res.masterSkuId)
        // Add back this reservation's quantity since it's still counted if ACTIVE
        const effectiveAvailable =
          res.status === "ACTIVE" ? available : available
        if (effectiveAvailable < res.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${res.masterSku.name}. Only ${effectiveAvailable} available.`,
          }
        }
      }

      // All stock available — confirm and decrement
      for (const res of expired) {
        await tx.masterSku.update({
          where: { id: res.masterSkuId },
          data: { stock: { decrement: res.quantity } },
        })
        await tx.stockReservation.update({
          where: { id: res.id },
          data: { status: "CONFIRMED", updatedAt: new Date() },
        })
      }

      return { success: true }
    }

    // Active reservations exist — check if any have expired
    const now = new Date()
    for (const res of reservations) {
      if (res.expiresAt < now) {
        // Expired but still ACTIVE status — re-check stock
        const { available } = await computeAvailableStock(tx, res.masterSkuId)
        if (available < res.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${res.masterSku.name}. Only ${available} available.`,
          }
        }
      }
    }

    // All good — confirm and decrement master stock
    for (const res of reservations) {
      await tx.masterSku.update({
        where: { id: res.masterSkuId },
        data: { stock: { decrement: res.quantity } },
      })
      await tx.stockReservation.update({
        where: { id: res.id },
        data: { status: "CONFIRMED", updatedAt: new Date() },
      })
    }

    return { success: true }
  })
}

/**
 * Release active reservations (e.g., customer left checkout).
 */
export async function releaseReservation(
  sessionRef: string,
  siteId?: string
): Promise<void> {
  const siteFilter = siteId ? { siteId } : { siteId: null }

  await prisma.stockReservation.updateMany({
    where: {
      sessionRef,
      ...siteFilter,
      status: "ACTIVE",
    },
    data: { status: "RELEASED", updatedAt: new Date() },
  })
}

/**
 * Bulk cleanup: mark all expired ACTIVE reservations as EXPIRED.
 * Returns the count of reservations cleaned up.
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const result = await prisma.stockReservation.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED", updatedAt: new Date() },
  })

  return result.count
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
