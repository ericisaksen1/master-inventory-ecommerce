"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requestReturn(orderId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: { items: true, returns: { where: { status: { in: ["REQUESTED", "APPROVED"] } } } },
  })

  if (!order) return { error: "Order not found" }
  if (order.status !== "ORDER_COMPLETE") return { error: "Returns can only be requested for completed orders" }
  if (order.returns.length > 0) return { error: "A return request already exists for this order" }

  const reason = (formData.get("reason") as string)?.trim()
  if (!reason || reason.length < 10) return { error: "Please provide a reason (at least 10 characters)" }

  // Parse selected items
  const selectedItems: { orderItemId: string; quantity: number }[] = []
  for (const item of order.items) {
    const qty = parseInt(formData.get(`qty_${item.id}`) as string) || 0
    if (qty > 0) {
      if (qty > item.quantity) return { error: `Quantity for ${item.name} exceeds ordered amount` }
      selectedItems.push({ orderItemId: item.id, quantity: qty })
    }
  }

  if (selectedItems.length === 0) return { error: "Please select at least one item to return" }

  await prisma.return.create({
    data: {
      orderId,
      userId: session.user.id,
      reason,
      items: {
        create: selectedItems,
      },
    },
  })

  void createNotification({
    type: "order",
    title: "Return Request",
    message: `Return requested for order #${order.orderNumber}`,
    link: "/admin/returns",
  })

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/admin/returns")
  return { success: true }
}

export async function approveReturn(returnId: string) {
  await requireAdmin()

  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: true },
  })
  if (!ret) return { error: "Return not found" }
  if (ret.status !== "REQUESTED") return { error: "Return is not in requested status" }

  await prisma.return.update({
    where: { id: returnId },
    data: { status: "APPROVED" },
  })

  revalidatePath(`/admin/returns/${returnId}`)
  revalidatePath("/admin/returns")
  return { success: true }
}

export async function denyReturn(returnId: string, notes: string) {
  await requireAdmin()

  const ret = await prisma.return.findUnique({ where: { id: returnId } })
  if (!ret) return { error: "Return not found" }
  if (ret.status !== "REQUESTED") return { error: "Return is not in requested status" }

  await prisma.return.update({
    where: { id: returnId },
    data: { status: "DENIED", adminNotes: notes || null },
  })

  revalidatePath(`/admin/returns/${returnId}`)
  revalidatePath("/admin/returns")
  return { success: true }
}

export async function markReturnRefunded(returnId: string) {
  await requireAdmin()

  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: { include: { payment: true } } },
  })
  if (!ret) return { error: "Return not found" }
  if (ret.status !== "APPROVED") return { error: "Return must be approved before marking as refunded" }

  await prisma.$transaction(async (tx) => {
    await tx.return.update({
      where: { id: returnId },
      data: { status: "REFUNDED" },
    })

    if (ret.order.payment) {
      await tx.payment.update({
        where: { id: ret.order.payment.id },
        data: { status: "REFUNDED" },
      })
    }
  })

  revalidatePath(`/admin/returns/${returnId}`)
  revalidatePath("/admin/returns")
  return { success: true }
}
