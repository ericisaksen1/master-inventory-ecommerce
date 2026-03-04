"use server"

import { prisma } from "@/lib/prisma"
import { createNotification } from "./notifications"
import { notifyAdminBulkOrderRequest, notifyCustomerBulkOrder } from "@/lib/email/notify"

export async function requestBulkOrderPriceList(email: string) {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: "Please enter a valid email address" }
  }

  const existing = await prisma.subscriber.findUnique({ where: { email: trimmed } })
  if (!existing) {
    await prisma.subscriber.create({ data: { email: trimmed, source: "bulk_order" } })
  }

  void createNotification({
    type: "subscriber",
    title: "Bulk Order Request",
    message: `${trimmed} requested the bulk order price list`,
    link: "/admin/customers",
  })

  void notifyAdminBulkOrderRequest(trimmed)
  void notifyCustomerBulkOrder(trimmed)

  return { success: true }
}
