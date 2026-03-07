"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getSetting } from "@/lib/settings"
import { notifyCustomerShipped } from "@/lib/email/notify"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function manuallyMarkShipped(
  orderId: string,
  carrier: string,
  trackingNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        guestEmail: true,
        shippingLabel: true,
        user: { select: { email: true } },
      },
    })

    if (!order) return { success: false, error: "Order not found" }
    if (order.status !== "PAYMENT_COMPLETE" && order.status !== "ORDER_COMPLETE") {
      return { success: false, error: "Order must have payment complete before shipping" }
    }

    await prisma.$transaction(async (tx) => {
      if (order.shippingLabel) {
        await tx.shippingLabel.delete({ where: { id: order.shippingLabel.id } })
      }

      await tx.shippingLabel.create({
        data: {
          orderId,
          carrier: carrier || "Manual",
          service: "Manual Entry",
          trackingNumber: trackingNumber || "",
          labelUrl: "",
          rate: 0,
          weight: 0,
        },
      })

      await tx.order.update({
        where: { id: orderId },
        data: { status: "ORDER_COMPLETE" },
      })
    })

    const email = order.user?.email || order.guestEmail
    if (email && trackingNumber) {
      const sendShippedEmail = await getSetting("email_shipped")
      if (sendShippedEmail === "true") {
        void notifyCustomerShipped(
          email,
          order.orderNumber,
          carrier || "Manual",
          "Manual Entry",
          trackingNumber
        )
      }
    }

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark as shipped" }
  }
}
