import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

/**
 * Receives status updates from connected sites (e.g. Enoch updates their order status).
 * Matches by sourceOrderNumber to find the corresponding Lab Rats drop-ship order.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rl = rateLimit(`api:inventory:status:${auth.site.id}`, 30, 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  let body: { orderNumber: string; status: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.orderNumber || !body.status) {
    return NextResponse.json({ error: "orderNumber and status are required" }, { status: 400 })
  }

  // Find the Lab Rats order that originated from this connected site
  const order = await prisma.order.findFirst({
    where: {
      sourceSiteId: auth.site.id,
      sourceOrderNumber: body.orderNumber,
    },
    select: { id: true, status: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Only sync certain statuses from the connected site
  const allowedStatuses = ["PAYMENT_COMPLETE", "CANCELLED"] as const
  if (!allowedStatuses.includes(body.status as any)) {
    return NextResponse.json({ success: true, message: "Status noted but not synced" })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: body.status as any },
  })

  // Also confirm the payment record when payment is confirmed on the source site
  if (body.status === "PAYMENT_COMPLETE") {
    await prisma.payment.updateMany({
      where: { orderId: order.id, status: "PENDING" },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
