"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createNotification({
  type,
  title,
  message,
  link,
}: {
  type: string
  title: string
  message: string
  link: string
}) {
  await prisma.adminNotification.create({
    data: { type, title, message, link },
  })
  revalidatePath("/admin")
}

export async function getUnreadNotificationCount(): Promise<number> {
  return prisma.adminNotification.count({ where: { isRead: false } })
}

export async function getRecentNotifications(limit = 15) {
  return prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.adminNotification.update({
    where: { id },
    data: { isRead: true },
  })
  revalidatePath("/admin")
  return { success: true }
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/admin")
  return { success: true }
}
