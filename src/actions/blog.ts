"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized")
  return session
}

// ── Blog Posts ──

export async function createBlogPost(
  formData: FormData
): Promise<{ error?: string; postId?: string }> {
  const session = await requireAdmin()

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required" }

  const content = formData.get("content") as string
  if (!content?.trim()) return { error: "Content is required" }

  let slug = (formData.get("slug") as string)?.trim() || slugify(title)
  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const isPublished = formData.get("isPublished") === "true"

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: (formData.get("excerpt") as string)?.trim() || null,
      content: sanitizeHtml(content),
      featuredImage: (formData.get("featuredImage") as string)?.trim() || null,
      authorId: session.user.id,
      metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
      metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  })

  // Categories
  const categoryIds: string[] = JSON.parse(formData.get("categoryIds") as string || "[]")
  if (categoryIds.length > 0) {
    await prisma.blogPostCategory.createMany({
      data: categoryIds.map((categoryId) => ({ postId: post.id, categoryId })),
    })
  }

  // Tags
  const tagIds: string[] = JSON.parse(formData.get("tagIds") as string || "[]")
  if (tagIds.length > 0) {
    await prisma.blogPostTag.createMany({
      data: tagIds.map((tagId) => ({ postId: post.id, tagId })),
    })
  }

  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  redirect(`/admin/blog/${post.id}`)
}

export async function updateBlogPost(
  postId: string,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin()

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required" }

  const content = formData.get("content") as string
  if (!content?.trim()) return { error: "Content is required" }

  const slug = (formData.get("slug") as string)?.trim()
  if (!slug) return { error: "Slug is required" }

  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing && existing.id !== postId) {
    return { error: "A post with this slug already exists" }
  }

  const oldPost = await prisma.blogPost.findUnique({ where: { id: postId } })
  const isPublished = formData.get("isPublished") === "true"
  const wasPublished = oldPost?.isPublished ?? false

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title,
      slug,
      excerpt: (formData.get("excerpt") as string)?.trim() || null,
      content: sanitizeHtml(content),
      featuredImage: (formData.get("featuredImage") as string)?.trim() || null,
      metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
      metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
      isPublished,
      publishedAt: isPublished && !wasPublished ? new Date() : oldPost?.publishedAt,
    },
  })

  // Replace categories
  await prisma.blogPostCategory.deleteMany({ where: { postId } })
  const categoryIds: string[] = JSON.parse(formData.get("categoryIds") as string || "[]")
  if (categoryIds.length > 0) {
    await prisma.blogPostCategory.createMany({
      data: categoryIds.map((categoryId) => ({ postId, categoryId })),
    })
  }

  // Replace tags
  await prisma.blogPostTag.deleteMany({ where: { postId } })
  const tagIds: string[] = JSON.parse(formData.get("tagIds") as string || "[]")
  if (tagIds.length > 0) {
    await prisma.blogPostTag.createMany({
      data: tagIds.map((tagId) => ({ postId, tagId })),
    })
  }

  revalidatePath("/admin/blog")
  revalidatePath(`/admin/blog/${postId}`)
  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  if (oldPost && oldPost.slug !== slug) {
    revalidatePath(`/blog/${oldPost.slug}`)
  }
  return {}
}

export async function deleteBlogPost(
  postId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const post = await prisma.blogPost.findUnique({ where: { id: postId } })
  if (!post) return { error: "Post not found" }

  await prisma.blogPost.delete({ where: { id: postId } })

  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  revalidatePath(`/blog/${post.slug}`)
  return { success: true }
}

// ── Blog Categories ──

export async function createBlogCategory(
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Name is required" }

  const slug = slugify(name)
  const existing = await prisma.blogCategory.findUnique({ where: { slug } })
  if (existing) return { error: "A category with this name already exists" }

  await prisma.blogCategory.create({ data: { name, slug } })
  revalidatePath("/admin/blog/categories")
  return {}
}

export async function updateBlogCategory(
  categoryId: string,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Name is required" }

  const slug = slugify(name)
  const existing = await prisma.blogCategory.findUnique({ where: { slug } })
  if (existing && existing.id !== categoryId) {
    return { error: "A category with this name already exists" }
  }

  await prisma.blogCategory.update({
    where: { id: categoryId },
    data: { name, slug },
  })
  revalidatePath("/admin/blog/categories")
  revalidatePath("/blog")
  return {}
}

export async function deleteBlogCategory(
  categoryId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.blogCategory.delete({ where: { id: categoryId } })
  revalidatePath("/admin/blog/categories")
  revalidatePath("/blog")
  return { success: true }
}

// ── Blog Tags ──

export async function createBlogTag(
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Tag name is required" }

  const slug = slugify(name)
  const existing = await prisma.blogTag.findUnique({ where: { slug } })
  if (existing) return { error: "This tag already exists" }

  await prisma.blogTag.create({ data: { name, slug } })
  revalidatePath("/admin/blog/tags")
  return {}
}

export async function deleteBlogTag(
  tagId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  await prisma.blogTag.delete({ where: { id: tagId } })
  revalidatePath("/admin/blog/tags")
  return { success: true }
}
