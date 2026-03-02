import { prisma } from "@/lib/prisma"
import {
  isPrintfulEnabled,
  createPrintfulOrder,
  confirmPrintfulOrder,
  type PrintfulOrderRecipient,
  type PrintfulOrderItem,
} from "@/lib/printful"
import { createNotification } from "@/actions/notifications"

export async function submitPrintfulItems(orderId: string): Promise<void> {
  try {
    if (!(await isPrintfulEnabled())) return

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              select: { printfulVariantId: true, printfulProductId: true },
            },
          },
        },
        user: { select: { email: true } },
      },
    })

    if (!order) return

    // Filter to only Printful items
    const printfulItems = order.items.filter(
      (item) => item.variant?.printfulVariantId
    )

    if (printfulItems.length === 0) return

    // Build recipient from shipping address
    const addr = order.shippingAddress as Record<string, string> | null
    if (!addr) return

    const recipient: PrintfulOrderRecipient = {
      name: `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
      address1: addr.line1 || "",
      address2: addr.line2 || undefined,
      city: addr.city || "",
      state_code: addr.state || "",
      country_code: addr.country || "US",
      zip: addr.postalCode || "",
      phone: addr.phone || undefined,
      email: order.user?.email || order.guestEmail || undefined,
    }

    // Build Printful order items
    const items: PrintfulOrderItem[] = printfulItems.map((item) => ({
      catalog_variant_id: parseInt(item.variant!.printfulVariantId!, 10),
      quantity: item.quantity,
      retail_price: item.price.toString(),
    }))

    // Create draft order on Printful then confirm it
    const pfOrder = await createPrintfulOrder(
      recipient,
      items,
      order.orderNumber
    )

    await confirmPrintfulOrder(pfOrder.id)

    // Update our order items with Printful order ID
    await prisma.$transaction(
      printfulItems.map((item) =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: {
            printfulOrderId: String(pfOrder.id),
            printfulStatus: "pending",
          },
        })
      )
    )

    void createNotification({
      type: "order",
      title: "Printful Order Submitted",
      message: `${printfulItems.length} item(s) from order #${order.orderNumber} sent to Printful`,
      link: `/admin/orders/${orderId}`,
    })
  } catch (err) {
    console.error("[Printful] Failed to submit order:", err)

    void createNotification({
      type: "order",
      title: "Printful Submission Failed",
      message: `Failed to submit Printful items for order ${orderId}: ${err instanceof Error ? err.message : "Unknown error"}`,
      link: `/admin/orders/${orderId}`,
    })
  }
}
