"use server"

import { prisma } from "@/lib/prisma"
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
