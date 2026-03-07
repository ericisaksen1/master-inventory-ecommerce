"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { resolveCommissionRate, resolveParentCommissionRate } from "@/lib/affiliate/commission"
import type { OrderStatus } from "@prisma/client"
import { notifyCustomerStatusChanged } from "@/lib/email/notify"
import { getSetting } from "@/lib/settings"
import { submitPrintfulItems } from "@/lib/printful-fulfillment"
import { syncStatusToConnectedSite } from "@/lib/order-status-sync"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function confirmPayment(orderId: string) {
  const session = await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      user: { select: { email: true } },
      affiliate: { include: { parent: true } },
      items: true,
    },
  })

  if (!order || !order.payment) return { error: "Order not found" }
  if (order.payment.status === "CONFIRMED") return { error: "Payment already confirmed" }

  // Commission base = subtotal minus any discount applied
  const commissionBase = Number(order.subtotal) - Number(order.discountAmount)

  await prisma.$transaction(async (tx) => {
    // Confirm payment
    await tx.payment.update({
      where: { id: order.payment!.id },
      data: {
        status: "CONFIRMED",
        confirmedBy: session.user.id,
        confirmedAt: new Date(),
      },
    })

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_COMPLETE" },
    })

    // Create affiliate commission if applicable (tiered rate resolution)
    if (order.affiliateId && order.affiliate) {
      const rate = await resolveCommissionRate(
        order.affiliateId,
        order.items.map((i) => ({ productId: i.productId }))
      )
      const commission = commissionBase * (rate / 100)

      await tx.affiliateCommission.create({
        data: {
          affiliateId: order.affiliateId,
          orderId: order.id,
          amount: commission,
          rate,
          type: "DIRECT",
          status: "PENDING",
        },
      })

      // Create parent affiliate commission if applicable
      if (order.affiliate.parentId && order.affiliate.parent) {
        const parentRate = await resolveParentCommissionRate()
        const parentCommission = commissionBase * (parentRate / 100)

        await tx.affiliateCommission.create({
          data: {
            affiliateId: order.affiliate.parentId,
            orderId: order.id,
            amount: parentCommission,
            rate: parentRate,
            type: "PARENT",
            status: "PENDING",
          },
        })
      }
    }
  })

  const customerEmail = order.user?.email || order.guestEmail
  if (customerEmail) {
    const sendPaymentEmail = await getSetting("email_payment_confirmed")
    if (sendPaymentEmail === "true") {
      void notifyCustomerStatusChanged(customerEmail, order.orderNumber, "PAYMENT_COMPLETE")
    }
  }

  // Auto-submit Printful items (fire-and-forget)
  void submitPrintfulItems(orderId)

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        guestEmail: true,
        sourceSiteId: true,
        sourceOrderNumber: true,
        user: { select: { email: true } },
      },
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    const statusEmail = order?.user?.email || order?.guestEmail
    if (statusEmail) {
      void notifyCustomerStatusChanged(statusEmail, order.orderNumber, status)
    }

    // Sync status to connected site if this is a drop-ship order
    if (order?.sourceSiteId && order.sourceOrderNumber) {
      void syncStatusToConnectedSite(order.sourceSiteId, order.sourceOrderNumber, status)
    }

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function resendStatusEmail(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, status: true, guestEmail: true, user: { select: { email: true } } },
    })

    if (!order) return { success: false, error: "Order not found" }
    const resendEmail = order.user?.email || order.guestEmail
    if (!resendEmail) return { success: false, error: "No email address for this customer" }

    await notifyCustomerStatusChanged(resendEmail, order.orderNumber, order.status)
    return { success: true }
  } catch {
    return { success: false, error: "Failed to send email" }
  }
}

export async function addAdminNote(orderId: string, note: string) {
  await requireAdmin()

  await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: note },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
