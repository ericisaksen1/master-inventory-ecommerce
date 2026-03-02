import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getAvailableStockBulk } from "@/lib/master-inventory"

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rl = rateLimit(`api:inventory:check:${auth.site.id}`, 60, 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  let body: { items: { sku: string; quantity: number }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 })
  }

  // Resolve SKUs to master SKU IDs
  const skus = body.items.map((i) => i.sku)
  const masterSkus = await prisma.masterSku.findMany({
    where: { sku: { in: skus }, isActive: true },
    select: { id: true, sku: true },
  })

  const skuToId = new Map(masterSkus.map((m) => [m.sku, m.id]))
  const masterSkuIds = masterSkus.map((m) => m.id)
  const availableMap = await getAvailableStockBulk(masterSkuIds)

  const results = body.items.map((item) => {
    const masterSkuId = skuToId.get(item.sku)
    if (!masterSkuId) {
      return { sku: item.sku, available: 0, sufficient: false, error: "SKU not found" }
    }
    const available = availableMap.get(masterSkuId) ?? 0
    return {
      sku: item.sku,
      available,
      sufficient: available >= item.quantity,
    }
  })

  return NextResponse.json({ items: results })
}
