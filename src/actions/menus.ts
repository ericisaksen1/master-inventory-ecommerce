"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized")
  return session
}

export async function getMenuItems(location: string) {
  return prisma.menuItem.findMany({
    where: { location, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })
}

export async function getLinkOptions() {
  const [pages, products, categories] = await Promise.all([
    prisma.page.findMany({
      where: { isActive: true },
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { pages, products, categories }
}

export async function createMenuItem(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const label = (formData.get("label") as string)?.trim()
  if (!label) return { error: "Label is required" }

  const url = (formData.get("url") as string)?.trim()
  if (!url) return { error: "URL is required" }

  const location = (formData.get("location") as string)?.trim()
  if (!location) return { error: "Location is required" }

  const cssClass = (formData.get("cssClass") as string)?.trim() || null
  const linkTarget = (formData.get("linkTarget") as string)?.trim() || null
  const parentId = (formData.get("parentId") as string)?.trim() || null
  const visibility = (formData.get("visibility") as string)?.trim() || "all"
  const affiliateVisibility = (formData.get("affiliateVisibility") as string)?.trim() || "all"

  const maxSort = await prisma.menuItem.aggregate({
    where: { location, parentId },
    _max: { sortOrder: true },
  })

  await prisma.menuItem.create({
    data: {
      label,
      url,
      location,
      cssClass,
      linkTarget,
      parentId,
      visibility,
      affiliateVisibility,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath("/admin/settings/menus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateMenuItem(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const label = (formData.get("label") as string)?.trim()
  if (!label) return { error: "Label is required" }

  const url = (formData.get("url") as string)?.trim()
  if (!url) return { error: "URL is required" }

  const cssClass = (formData.get("cssClass") as string)?.trim() || null
  const linkTarget = (formData.get("linkTarget") as string)?.trim() || null
  const visibility = (formData.get("visibility") as string)?.trim() || "all"
  const affiliateVisibility = (formData.get("affiliateVisibility") as string)?.trim() || "all"

  await prisma.menuItem.update({
    where: { id },
    data: { label, url, cssClass, linkTarget, visibility, affiliateVisibility },
  })

  revalidatePath("/admin/settings/menus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deleteMenuItem(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.menuItem.delete({ where: { id } })

  revalidatePath("/admin/settings/menus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function reorderMenuItems(
  items: { id: string; sortOrder: number }[]
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  )

  revalidatePath("/admin/settings/menus")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function saveMenuOrder(
  items: { id: string; sortOrder: number; parentId: string | null }[]
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder, parentId: item.parentId },
      })
    )
  )

  revalidatePath("/admin/settings/menus")
  revalidatePath("/", "layout")
  return { success: true }
}
