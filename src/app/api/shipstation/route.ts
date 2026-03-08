import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSetting } from "@/lib/settings"
import { notifyCustomerShipped } from "@/lib/email/notify"

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function verifyAuth(req: NextRequest): Promise<boolean> {
  const authKey = await getSetting("shipstation_auth_key")
  if (!authKey) return false

  // ShipStation sends credentials via Basic Auth
  // Accept auth key as either the username or password
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString()
    const [username, password] = decoded.split(":")
    if (username === authKey || password === authKey) return true
  }

  // Also allow query param for flexibility
  const url = new URL(req.url)
  if (url.searchParams.get("auth_key") === authKey) return true

  return false
}

function formatDate(date: Date): string {
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, "0")
  const min = date.getMinutes().toString().padStart(2, "0")
  return `${m}/${d}/${y} ${h}:${min}`
}

// GET - Export orders to ShipStation (Custom Store integration)
export async function GET(req: NextRequest) {
  if (!(await verifyAuth(req))) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get("action")

  if (action !== "export") {
    return new NextResponse("Invalid action", { status: 400 })
  }

  const startDate = url.searchParams.get("start_date")
  const endDate = url.searchParams.get("end_date")
  const page = parseInt(url.searchParams.get("page") || "1")
  const pageSize = 100

  const where: Record<string, unknown> = {
    status: { in: ["PAYMENT_COMPLETE", "CANCELLED"] },
  }

  if (startDate || endDate) {
    where.updatedAt = {}
    if (startDate) (where.updatedAt as Record<string, Date>).gte = new Date(startDate)
    if (endDate) (where.updatedAt as Record<string, Date>).lte = new Date(endDate)
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize) || 1

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n<Orders pages="${totalPages}">\n`

  for (const order of orders) {
    const addr = (order.shippingAddress as Record<string, string>) || {}
    const customerEmail = order.user?.email || order.guestEmail || ""
    const customerName = order.user?.name || `${addr.firstName || ""} ${addr.lastName || ""}`.trim() || "Customer"

    xml += `  <Order>\n`
    xml += `    <OrderID>${escapeXml(order.id)}</OrderID>\n`
    xml += `    <OrderNumber>${escapeXml(order.orderNumber)}</OrderNumber>\n`
    xml += `    <OrderDate>${formatDate(order.createdAt)}</OrderDate>\n`
    xml += `    <OrderStatus>${order.status === "CANCELLED" ? "cancelled" : "paid"}</OrderStatus>\n`
    xml += `    <LastModified>${formatDate(order.updatedAt)}</LastModified>\n`
    xml += `    <OrderTotal>${Number(order.total).toFixed(2)}</OrderTotal>\n`
    xml += `    <TaxAmount>${Number(order.tax).toFixed(2)}</TaxAmount>\n`
    xml += `    <ShippingAmount>${Number(order.shippingCost).toFixed(2)}</ShippingAmount>\n`
    if (order.notes) {
      xml += `    <InternalNotes>${escapeXml(order.notes)}</InternalNotes>\n`
    }
    xml += `    <Customer>\n`
    xml += `      <CustomerCode>${escapeXml(customerEmail)}</CustomerCode>\n`
    xml += `    </Customer>\n`
    xml += `    <BillTo>\n`
    xml += `      <Name>${escapeXml(customerName)}</Name>\n`
    xml += `      <Email>${escapeXml(customerEmail)}</Email>\n`
    xml += `    </BillTo>\n`
    xml += `    <ShipTo>\n`
    xml += `      <Name>${escapeXml(`${addr.firstName || ""} ${addr.lastName || ""}`.trim() || customerName)}</Name>\n`
    xml += `      <Address1>${escapeXml(addr.line1 || addr.street1 || "")}</Address1>\n`
    if (addr.line2 || addr.street2) {
      xml += `      <Address2>${escapeXml(addr.line2 || addr.street2 || "")}</Address2>\n`
    }
    xml += `      <City>${escapeXml(addr.city || "")}</City>\n`
    xml += `      <State>${escapeXml(addr.state || "")}</State>\n`
    xml += `      <PostalCode>${escapeXml(addr.postalCode || addr.zip || "")}</PostalCode>\n`
    xml += `      <Country>${escapeXml(addr.country || "US")}</Country>\n`
    if (addr.phone) {
      xml += `      <Phone>${escapeXml(addr.phone)}</Phone>\n`
    }
    xml += `    </ShipTo>\n`
    xml += `    <Items>\n`
    for (const item of order.items) {
      xml += `      <Item>\n`
      xml += `        <SKU>${escapeXml(item.sku || item.productId)}</SKU>\n`
      xml += `        <Name>${escapeXml(item.name)}${item.variantName ? ` - ${escapeXml(item.variantName)}` : ""}</Name>\n`
      xml += `        <Quantity>${item.quantity}</Quantity>\n`
      xml += `        <UnitPrice>${Number(item.price).toFixed(2)}</UnitPrice>\n`
      xml += `      </Item>\n`
    }
    xml += `    </Items>\n`
    xml += `  </Order>\n`
  }

  xml += `</Orders>`

  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  })
}

// POST - Receive shipment notifications from ShipStation
export async function POST(req: NextRequest) {
  if (!(await verifyAuth(req))) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get("action")

  if (action !== "shipnotify") {
    return new NextResponse("Invalid action", { status: 400 })
  }

  const body = await req.text()

  // Parse the ShipNotice XML
  const getValue = (tag: string) => {
    const match = body.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
    return match?.[1] || ""
  }

  const orderNumber = getValue("OrderNumber")
  const trackingNumber = getValue("TrackingNumber")
  const carrier = getValue("Carrier")
  const service = getValue("Service")
  const shippingCost = getValue("ShippingCost")

  if (!orderNumber) {
    return new NextResponse("Missing OrderNumber", { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      guestEmail: true,
      shippingLabel: true,
      user: { select: { email: true } },
    },
  })

  if (!order) {
    return new NextResponse("Order not found", { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    // Delete existing label if replacing
    if (order.shippingLabel) {
      await tx.shippingLabel.delete({ where: { id: order.shippingLabel.id } })
    }

    await tx.shippingLabel.create({
      data: {
        orderId: order.id,
        carrier: carrier || "Unknown",
        service: service || "Standard",
        trackingNumber: trackingNumber || "",
        labelUrl: "",
        rate: shippingCost ? parseFloat(shippingCost) : 0,
        weight: 0,
      },
    })

    await tx.order.update({
      where: { id: order.id },
      data: { status: "ORDER_COMPLETE" },
    })
  })

  // Send shipped email if enabled
  const email = order.user?.email || order.guestEmail
  if (email && trackingNumber) {
    const sendShippedEmail = await getSetting("email_shipped")
    if (sendShippedEmail === "true") {
      void notifyCustomerShipped(
        email,
        order.orderNumber,
        carrier || "Unknown",
        service || "Standard",
        trackingNumber
      )
    }
  }

  return new NextResponse("OK", { status: 200 })
}
