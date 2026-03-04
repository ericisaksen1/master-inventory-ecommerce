import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber, formatCurrency } from "@/lib/utils"
import { resolveLocalProducts } from "@/lib/master-inventory"
import { notifyAdminNewOrder, notifyAdminLowStock, notifyAdminOutOfStock } from "@/lib/email/notify"
import { createNotification } from "@/actions/notifications"

interface InboundOrderBody {
  orderNumber: string
  orderUrl?: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country?: string
    phone?: string
  }
  items: {
    masterSku: string
    name: string
    variantName?: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  total: number
  notes?: string
}

export async function POST(request: NextRequest) {
  // 1. Auth
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // 2. Rate limit
  const rl = rateLimit(`api:inventory:orders:${auth.site.id}`, 10, 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  // 3. Parse & validate
  let body: InboundOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.orderNumber?.trim()) {
    return NextResponse.json({ error: "orderNumber is required" }, { status: 400 })
  }
  if (!body.customer?.email?.trim()) {
    return NextResponse.json({ error: "customer.email is required" }, { status: 400 })
  }
  if (!body.customer?.firstName?.trim() || !body.customer?.lastName?.trim()) {
    return NextResponse.json({ error: "customer firstName and lastName are required" }, { status: 400 })
  }
  if (!body.shippingAddress?.line1?.trim()) {
    return NextResponse.json({ error: "shippingAddress.line1 is required" }, { status: 400 })
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required and must not be empty" }, { status: 400 })
  }

  // 4. Resolve master SKUs to local products
  const masterSkuStrings = body.items.map((i) => i.masterSku)
  const localMap = await resolveLocalProducts(masterSkuStrings)

  // Check all SKUs resolved
  const unresolvedSkus = masterSkuStrings.filter((sku) => !localMap.has(sku))
  if (unresolvedSkus.length > 0) {
    return NextResponse.json(
      { error: `Unknown master SKUs: ${unresolvedSkus.join(", ")}` },
      { status: 400 }
    )
  }

  // 5. Verify stock and decrement
  const skuIds = [...new Set(body.items.map((i) => localMap.get(i.masterSku)!.masterSkuId))]
  const masterSkuRecords = await prisma.masterSku.findMany({
    where: { id: { in: skuIds } },
    select: { id: true, sku: true, stock: true, name: true },
  })
  const stockMap = new Map(masterSkuRecords.map((m) => [m.id, m]))

  // Aggregate quantities per master SKU
  const qtyByMasterSku = new Map<string, number>()
  for (const item of body.items) {
    const local = localMap.get(item.masterSku)!
    const current = qtyByMasterSku.get(local.masterSkuId) ?? 0
    qtyByMasterSku.set(local.masterSkuId, current + item.quantity)
  }

  for (const [msId, qty] of qtyByMasterSku) {
    const ms = stockMap.get(msId)
    if (!ms || ms.stock < qty) {
      return NextResponse.json(
        { error: `Insufficient stock for ${ms?.sku || msId}: have ${ms?.stock ?? 0}, need ${qty}` },
        { status: 409 }
      )
    }
  }

  // Decrement in transaction
  await prisma.$transaction(
    [...qtyByMasterSku.entries()].map(([msId, qty]) =>
      prisma.masterSku.update({
        where: { id: msId },
        data: { stock: { decrement: qty } },
      })
    )
  )

  // 6. Create order in transaction
  const labRatsOrderNumber = generateOrderNumber()
  const shippingAddress = {
    firstName: body.shippingAddress.firstName,
    lastName: body.shippingAddress.lastName,
    line1: body.shippingAddress.line1,
    line2: body.shippingAddress.line2 || "",
    city: body.shippingAddress.city,
    state: body.shippingAddress.state,
    postalCode: body.shippingAddress.postalCode,
    country: body.shippingAddress.country || "US",
    phone: body.shippingAddress.phone || "",
  }

  const newOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: labRatsOrderNumber,
        guestEmail: body.customer.email,
        status: "PAYMENT_COMPLETE",
        subtotal: body.subtotal,
        tax: body.tax,
        shippingCost: body.shippingCost,
        discountAmount: body.discountAmount,
        total: body.total,
        shippingAddress,
        notes: body.notes || null,
        sourceSiteId: auth.site.id,
        sourceOrderNumber: body.orderNumber,
        sourceOrderUrl: body.orderUrl || null,
      },
    })

    // Create order items
    for (const item of body.items) {
      const local = localMap.get(item.masterSku)!
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: local.productId,
          variantId: local.variantId,
          name: item.name,
          variantName: item.variantName || null,
          sku: item.masterSku,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        },
      })
    }

    // Create payment record (EXTERNAL, already confirmed)
    await tx.payment.create({
      data: {
        orderId: order.id,
        method: "EXTERNAL",
        status: "CONFIRMED",
        amount: body.total,
        confirmedAt: new Date(),
        transactionRef: `${auth.site.name}: ${body.orderNumber}`,
      },
    })

    return order
  })

  // 7. Fire-and-forget notifications
  const customerName = `${body.customer.firstName} ${body.customer.lastName}`

  void createNotification({
    type: "order",
    title: `Drop-Ship from ${auth.site.name}`,
    message: `Order #${labRatsOrderNumber} (${body.orderNumber} on ${auth.site.name}) — ${formatCurrency(body.total)}`,
    link: `/admin/orders/${newOrder.id}`,
  })

  void notifyAdminNewOrder(
    labRatsOrderNumber,
    formatCurrency(body.total),
    `${customerName} (via ${auth.site.name})`
  )

  // Low stock alerts
  const lowStockThreshold = 10
  for (const item of body.items) {
    const local = localMap.get(item.masterSku)!
    const ms = await prisma.masterSku.findUnique({
      where: { id: local.masterSkuId },
      select: { stock: true, name: true },
    })
    if (ms) {
      if (ms.stock <= 0) {
        void notifyAdminOutOfStock(ms.name)
      } else if (ms.stock < lowStockThreshold) {
        void notifyAdminLowStock(ms.name, ms.stock)
      }
    }
  }

  return NextResponse.json(
    {
      success: true,
      orderId: newOrder.id,
      orderNumber: labRatsOrderNumber,
    },
    { status: 201 }
  )
}
