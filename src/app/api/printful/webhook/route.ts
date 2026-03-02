import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { createNotification } from "@/actions/notifications"
import { getSetting } from "@/lib/settings"
import { notifyCustomerShipped } from "@/lib/email/notify"

interface PrintfulWebhookPayload {
  type: string
  created: number
  retries: number
  store: number
  data: {
    order: {
      id: number
      external_id: string
      status: string
    }
    shipment?: {
      id: number
      carrier: string
      service: string
      tracking_number: string
      tracking_url: string
      ship_date: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const enabled = await getSetting("enable_printful")
    if (enabled !== "true") {
      return NextResponse.json({ error: "Printful not enabled" }, { status: 404 })
    }

    // Optional webhook secret verification
    const webhookSecret = await getSetting("printful_webhook_secret")
    if (webhookSecret) {
      const headerSecret = request.headers.get("x-printful-webhook-secret")
      if (headerSecret !== webhookSecret) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload: PrintfulWebhookPayload = await request.json()
    const { type, data } = payload

    if (!data?.order?.external_id) {
      return NextResponse.json({ error: "Missing external_id" }, { status: 400 })
    }

    const orderNumber = data.order.external_id

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: { select: { email: true } },
        shippingLabel: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const printfulOrderId = String(data.order.id)

    // Update Printful status on matching order items
    const printfulItems = order.items.filter(
      (item) => item.printfulOrderId === printfulOrderId
    )

    if (printfulItems.length > 0) {
      await prisma.$transaction(
        printfulItems.map((item) =>
          prisma.orderItem.update({
            where: { id: item.id },
            data: { printfulStatus: data.order.status },
          })
        )
      )
    }

    // Handle specific events
    switch (type) {
      case "shipment_sent": {
        const shipment = data.shipment
        if (shipment) {
          // Create ShippingLabel if one doesn't exist yet
          if (!order.shippingLabel) {
            await prisma.shippingLabel.create({
              data: {
                orderId: order.id,
                carrier: shipment.carrier || "Printful",
                service: shipment.service || "Standard",
                trackingNumber: shipment.tracking_number || "",
                labelUrl: shipment.tracking_url || "",
                rate: 0,
                weight: 0,
              },
            })
          }

          // Mark order complete if still awaiting
          if (order.status === "PAYMENT_COMPLETE") {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: "ORDER_COMPLETE" },
            })
          }

          // Email customer
          const customerEmail = order.user?.email || order.guestEmail
          if (customerEmail) {
            const sendShippedEmail = await getSetting("email_shipped")
            if (sendShippedEmail === "true") {
              void notifyCustomerShipped(
                customerEmail,
                order.orderNumber,
                shipment.carrier || "Printful",
                shipment.service || "Standard",
                shipment.tracking_number || ""
              )
            }
          }

          void createNotification({
            type: "order",
            title: "Printful Shipment Sent",
            message: `Order #${orderNumber} shipped via ${shipment.carrier || "Printful"} — ${shipment.tracking_number || "no tracking"}`,
            link: `/admin/orders/${order.id}`,
          })
        }
        break
      }

      case "shipment_delivered": {
        void createNotification({
          type: "order",
          title: "Printful Delivery Confirmed",
          message: `Order #${orderNumber} has been delivered`,
          link: `/admin/orders/${order.id}`,
        })
        break
      }

      case "order_failed": {
        void createNotification({
          type: "order",
          title: "Printful Order Failed",
          message: `Printful order for #${orderNumber} has failed. Check your Printful dashboard.`,
          link: `/admin/orders/${order.id}`,
        })
        break
      }

      case "order_canceled": {
        void createNotification({
          type: "order",
          title: "Printful Order Cancelled",
          message: `Printful order for #${orderNumber} was cancelled`,
          link: `/admin/orders/${order.id}`,
        })
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Printful Webhook] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
