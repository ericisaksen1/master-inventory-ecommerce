"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import path from "path"

function assertAdmin(role?: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getMedia() {
  const session = await auth()
  assertAdmin(session?.user?.role)

  return prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function updateMediaAlt(id: string, alt: string) {
  const session = await auth()
  assertAdmin(session?.user?.role)

  await prisma.media.update({
    where: { id },
    data: { alt },
  })

  revalidatePath("/admin/media")
}

export async function deleteMedia(id: string) {
  const session = await auth()
  assertAdmin(session?.user?.role)

  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) throw new Error("Media not found")

  // Delete the file from disk
  if (media.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", media.url)
    try {
      await unlink(filePath)
    } catch {
      // File may already be deleted, continue
    }
  }

  await prisma.media.delete({ where: { id } })

  revalidatePath("/admin/media")
}
