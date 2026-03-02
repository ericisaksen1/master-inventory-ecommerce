"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getRates, createLabel } from "@/lib/shipstation"
import type { ShippingRate } from "@/lib/shipstation"
import { getSettings, getSetting } from "@/lib/settings"
import { notifyCustomerShipped } from "@/lib/email/notify"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

function buildAddresses(
  settings: Record<string, string>,
  addr: Record<string, string>
) {
  const fromAddress = {
    name: settings.ship_from_name || "Shipping Dept",
    street1: settings.ship_from_street,
    city: settings.ship_from_city,
    state: settings.ship_from_state,
    zip: settings.ship_from_zip,
    country: "US",
    phone: settings.ship_from_phone || undefined,
  }

  const toAddress = {
    name: `${addr.firstName || ""} ${addr.lastName || ""}`.trim() || addr.name || "Customer",
    street1: addr.line1 || addr.street1 || "",
    street2: addr.line2 || addr.street2 || undefined,
    city: addr.city || "",
    state: addr.state || "",
    zip: addr.postalCode || addr.zip || "",
    country: addr.country || "US",
    phone: addr.phone || undefined,
  }

  return { fromAddress, toAddress }
}

async function getShipFromSettings() {
  const settings = await getSettings([
    "ship_from_name",
    "ship_from_street",
    "ship_from_city",
    "ship_from_state",
    "ship_from_zip",
    "ship_from_phone",
  ])

  if (!settings.ship_from_street || !settings.ship_from_city || !settings.ship_from_state || !settings.ship_from_zip) {
    throw new Error("Ship-from address not configured. Set it in Settings.")
  }

  return settings
}

export async function getShippingRates(
  orderId: string,
  weightOz: number
): Promise<{ rates: ShippingRate[] } | { error: string }> {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { shippingAddress: true, status: true },
    })

    if (!order) return { error: "Order not found" }
    if (order.status !== "PAYMENT_COMPLETE" && order.status !== "ORDER_COMPLETE") {
      return { error: "Order must have payment complete before shipping" }
    }

    const addr = order.shippingAddress as Record<string, string> | null
    if (!addr) return { error: "No shipping address on this order" }

    const settings = await getShipFromSettings()
    const { fromAddress, toAddress } = buildAddresses(settings, addr)
    const rates = await getRates(fromAddress, toAddress, weightOz)

    return { rates }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to get shipping rates" }
  }
}

export async function purchaseShippingLabel(
  orderId: string,
  rateId: string,
  weightOz: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        shippingLabel: true,
        shippingAddress: true,
        user: { select: { email: true } },
      },
    })

    if (!order) return { success: false, error: "Order not found" }
    if (order.status !== "PAYMENT_COMPLETE" && order.status !== "ORDER_COMPLETE") {
      return { success: false, error: "Order must have payment complete before shipping" }
    }

    const label = await createLabel(rateId)

    await prisma.$transaction(async (tx) => {
      // Delete existing label if replacing
      if (order.shippingLabel) {
        await tx.shippingLabel.delete({ where: { id: order.shippingLabel.id } })
      }

      await tx.shippingLabel.create({
        data: {
          orderId,
          carrier: label.carrier,
          service: label.service,
          trackingNumber: label.trackingNumber,
          labelUrl: label.labelUrl,
          rate: parseFloat(label.rate),
          weight: weightOz,
        },
      })

      await tx.order.update({
        where: { id: orderId },
        data: { status: "ORDER_COMPLETE" },
      })
    })

    if (order.user?.email) {
      const sendShippedEmail = await getSetting("email_shipped")
      if (sendShippedEmail === "true") {
        void notifyCustomerShipped(
          order.user.email,
          order.orderNumber,
          label.carrier,
          label.service,
          label.trackingNumber
        )
      }
    }

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to purchase label" }
  }
}
