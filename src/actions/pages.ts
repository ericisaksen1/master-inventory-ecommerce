"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"

const RESERVED_SLUGS = [
  "products", "categories", "cart", "checkout", "orders",
  "account", "search", "admin", "api", "login", "register",
  "forgot-password", "reset-password", "affiliate", "blog",
]

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized")
  return session
}

export async function createPage(
  formData: FormData
): Promise<{ success?: boolean; error?: string; pageId?: string }> {
  await requireAdmin()

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required" }

  const content = formData.get("content") as string
  if (!content?.trim()) return { error: "Content is required" }

  const slug = (formData.get("slug") as string)?.trim() || slugify(title)

  if (RESERVED_SLUGS.includes(slug)) {
    return { error: "This slug is reserved and cannot be used" }
  }

  const existing = await prisma.page.findUnique({ where: { slug } })
  if (existing) {
    return { error: "A page with this slug already exists" }
  }

  const page = await prisma.page.create({
    data: {
      title,
      slug,
      content: sanitizeHtml(content),
      metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
      metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
      isActive: formData.get("isActive") === "true",
    },
  })

  revalidatePath("/admin/pages")
  revalidatePath(`/${slug}`)
  return { success: true, pageId: page.id }
}

export async function updatePage(
  pageId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required" }

  const content = formData.get("content") as string
  if (!content?.trim()) return { error: "Content is required" }

  const slug = (formData.get("slug") as string)?.trim()
  if (!slug) return { error: "Slug is required" }

  if (RESERVED_SLUGS.includes(slug)) {
    return { error: "This slug is reserved and cannot be used" }
  }

  const existing = await prisma.page.findUnique({ where: { slug } })
  if (existing && existing.id !== pageId) {
    return { error: "A page with this slug already exists" }
  }

  const oldPage = await prisma.page.findUnique({ where: { id: pageId } })

  await prisma.page.update({
    where: { id: pageId },
    data: {
      title,
      slug,
      content: sanitizeHtml(content),
      metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
      metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
      isActive: formData.get("isActive") === "true",
    },
  })

  revalidatePath("/admin/pages")
  revalidatePath(`/${slug}`)
  if (oldPage && oldPage.slug !== slug) {
    revalidatePath(`/${oldPage.slug}`)
  }
  return { success: true }
}

export async function deletePage(
  pageId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) return { error: "Page not found" }

  await prisma.page.delete({ where: { id: pageId } })

  revalidatePath("/admin/pages")
  revalidatePath(`/${page.slug}`)
  return { success: true }
}
