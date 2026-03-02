"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { componentRegistry } from "@/lib/component-registry"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized")
  return session
}

export async function getPageComponents(pageId: string | null) {
  return prisma.pageComponent.findMany({
    where: { pageId },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createPageComponent(
  pageId: string | null,
  type: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const def = componentRegistry[type]
  if (!def) return { error: "Unknown component type" }

  const maxSort = await prisma.pageComponent.aggregate({
    where: { pageId },
    _max: { sortOrder: true },
  })

  await prisma.pageComponent.create({
    data: {
      pageId,
      type,
      settings: JSON.stringify(def.defaultSettings),
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath(pageId ? `/admin/pages/${pageId}` : "/admin/homepage")
  revalidatePath(pageId ? "/" : "/", "layout")
  return { success: true }
}

export async function updatePageComponentSettings(
  id: string,
  settings: Record<string, any>
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const component = await prisma.pageComponent.findUnique({ where: { id } })
  if (!component) return { error: "Component not found" }

  await prisma.pageComponent.update({
    where: { id },
    data: { settings: JSON.stringify(settings) },
  })

  revalidatePath(component.pageId ? `/admin/pages/${component.pageId}` : "/admin/homepage")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function togglePageComponent(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const component = await prisma.pageComponent.findUnique({ where: { id } })
  if (!component) return { error: "Component not found" }

  await prisma.pageComponent.update({
    where: { id },
    data: { isActive: !component.isActive },
  })

  revalidatePath(component.pageId ? `/admin/pages/${component.pageId}` : "/admin/homepage")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deletePageComponent(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const component = await prisma.pageComponent.findUnique({ where: { id } })
  if (!component) return { error: "Component not found" }

  await prisma.pageComponent.delete({ where: { id } })

  revalidatePath(component.pageId ? `/admin/pages/${component.pageId}` : "/admin/homepage")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function reorderPageComponents(
  items: { id: string; sortOrder: number }[]
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.$transaction(
    items.map((item) =>
      prisma.pageComponent.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  )

  revalidatePath("/admin/homepage")
  revalidatePath("/", "layout")
  return { success: true }
}
