import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rl = rateLimit(`api:inventory:deduct:${auth.site.id}`, 30, 60_000)
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
    select: { id: true, sku: true, stock: true },
  })

  const skuMap = new Map(masterSkus.map((m) => [m.sku, m]))

  // Verify all SKUs exist and have sufficient stock
  for (const item of body.items) {
    const ms = skuMap.get(item.sku)
    if (!ms) {
      return NextResponse.json({ error: `SKU not found: ${item.sku}` }, { status: 400 })
    }
    if (ms.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${item.sku}: have ${ms.stock}, need ${item.quantity}` },
        { status: 409 }
      )
    }
  }

  // Decrement stock in a transaction
  await prisma.$transaction(
    body.items.map((item) => {
      const ms = skuMap.get(item.sku)!
      return prisma.masterSku.update({
        where: { id: ms.id },
        data: { stock: { decrement: item.quantity } },
      })
    })
  )

  return NextResponse.json({ success: true })
}
