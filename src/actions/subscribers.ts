"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function subscribeToNewsletter(email: string) {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: "Please enter a valid email address" }
  }

  const existing = await prisma.subscriber.findUnique({ where: { email: trimmed } })
  if (existing) {
    return { success: true }
  }

  await prisma.subscriber.create({ data: { email: trimmed } })

  void createNotification({
    type: "subscriber",
    title: "New Subscriber",
    message: `${trimmed} joined the mailing list`,
    link: "/admin/customers",
  })

  return { success: true }
}

export async function deleteSubscriber(id: string) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.subscriber.delete({ where: { id } })
  revalidatePath("/admin/subscribers")
  return { success: true }
}
