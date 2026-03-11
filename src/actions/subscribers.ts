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

export async function syncSubscribers() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  const existingEmails = new Set(
    (await prisma.subscriber.findMany({ select: { email: true } })).map((s) => s.email)
  )

  const toCreate: { email: string; source: string }[] = []

  // Registered users
  const users = await prisma.user.findMany({ select: { email: true } })
  for (const u of users) {
    const email = u.email.trim().toLowerCase()
    if (email && !existingEmails.has(email)) {
      toCreate.push({ email, source: "registration" })
      existingEmails.add(email)
    }
  }

  // Orders — logged-in user emails + guest emails
  const orders = await prisma.order.findMany({
    select: { guestEmail: true, user: { select: { email: true } } },
  })
  for (const o of orders) {
    const email = (o.guestEmail || o.user?.email || "").trim().toLowerCase()
    if (email && !existingEmails.has(email)) {
      toCreate.push({ email, source: "order" })
      existingEmails.add(email)
    }
  }

  // Contact form submissions
  const contacts = await prisma.contactMessage.findMany({ select: { email: true } })
  for (const c of contacts) {
    const email = c.email.trim().toLowerCase()
    if (email && !existingEmails.has(email)) {
      toCreate.push({ email, source: "contact" })
      existingEmails.add(email)
    }
  }

  if (toCreate.length > 0) {
    await prisma.subscriber.createMany({ data: toCreate, skipDuplicates: true })
  }

  revalidatePath("/admin/subscribers")
  return { success: true, added: toCreate.length }
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
