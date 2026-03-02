import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { reserveStock, type ReservationItem } from "@/lib/master-inventory"

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rl = rateLimit(`api:inventory:reserve:${auth.site.id}`, 30, 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  let body: { items: { sku: string; quantity: number }[]; sessionRef: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 })
  }

  if (!body.sessionRef || typeof body.sessionRef !== "string") {
    return NextResponse.json({ error: "sessionRef is required" }, { status: 400 })
  }

  // Resolve SKUs to master SKU IDs
  const skus = body.items.map((i) => i.sku)
  const masterSkus = await prisma.masterSku.findMany({
    where: { sku: { in: skus }, isActive: true },
    select: { id: true, sku: true },
  })

  const skuToId = new Map(masterSkus.map((m) => [m.sku, m.id]))

  const reservationItems: ReservationItem[] = []
  const unknownSkus: string[] = []

  for (const item of body.items) {
    const masterSkuId = skuToId.get(item.sku)
    if (!masterSkuId) {
      unknownSkus.push(item.sku)
      continue
    }
    reservationItems.push({ masterSkuId, quantity: item.quantity })
  }

  if (reservationItems.length === 0) {
    return NextResponse.json(
      { error: "No valid SKUs found", unknownSkus },
      { status: 400 }
    )
  }

  const result = await reserveStock(reservationItems, body.sessionRef, auth.site.id)

  // Map adjustments back to SKUs
  const idToSku = new Map(masterSkus.map((m) => [m.id, m.sku]))
  const adjustments = result.adjustments.map((adj) => ({
    sku: idToSku.get(adj.masterSkuId) ?? adj.masterSku,
    requested: adj.requested,
    granted: adj.granted,
  }))

  return NextResponse.json({
    success: true,
    expiresAt: result.expiresAt.toISOString(),
    adjustments,
    ...(unknownSkus.length > 0 ? { unknownSkus } : {}),
  })
}
