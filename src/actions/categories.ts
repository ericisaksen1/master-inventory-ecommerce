"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  return session
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Category name is required" }

  let slug = (formData.get("slug") as string)?.trim() || slugify(name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: (formData.get("description") as string) || null,
      parentId: (formData.get("parentId") as string) || null,
      commissionRate: parseFloat(formData.get("commissionRate") as string) || null,
      isActive: formData.has("isActive"),
    },
  })

  revalidatePath("/admin/categories")
  return {}
}

export async function updateCategory(categoryId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Category name is required" }

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: name.trim(),
      slug: (formData.get("slug") as string)?.trim() || slugify(name),
      description: (formData.get("description") as string) || null,
      parentId: (formData.get("parentId") as string) || null,
      commissionRate: parseFloat(formData.get("commissionRate") as string) || null,
      isActive: formData.has("isActive"),
    },
  })

  revalidatePath("/admin/categories")
  return {}
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await prisma.category.delete({ where: { id: categoryId } })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete category. It may have products assigned." }
  }
}
