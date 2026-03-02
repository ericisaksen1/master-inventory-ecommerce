"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  return session
}

export async function createProduct(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Product name is required" }

  const basePrice = parseFloat(formData.get("basePrice") as string)
  if (isNaN(basePrice) || basePrice < 0) return { error: "Valid price is required" }

  let slug = (formData.get("slug") as string)?.trim() || slugify(name)
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      description: (formData.get("description") as string) || null,
      shortDescription: (formData.get("shortDescription") as string) || null,
      basePrice,
      compareAtPrice: parseFloat(formData.get("compareAtPrice") as string) || null,
      costPrice: parseFloat(formData.get("costPrice") as string) || null,
      sku: (formData.get("sku") as string)?.trim() || null,
      stock: parseInt(formData.get("stock") as string) || 0,
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    },
  })

  // Handle category assignment
  const categoryId = formData.get("categoryId") as string
  if (categoryId) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId },
    })
  }

  revalidatePath("/admin/products")
  redirect(`/admin/products/${product.id}`)
}

export async function updateProduct(productId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Product name is required" }

  const basePrice = parseFloat(formData.get("basePrice") as string)
  if (isNaN(basePrice) || basePrice < 0) return { error: "Valid price is required" }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: name.trim(),
      slug: (formData.get("slug") as string)?.trim() || slugify(name),
      description: (formData.get("description") as string) || null,
      shortDescription: (formData.get("shortDescription") as string) || null,
      basePrice,
      compareAtPrice: parseFloat(formData.get("compareAtPrice") as string) || null,
      costPrice: parseFloat(formData.get("costPrice") as string) || null,
      sku: (formData.get("sku") as string)?.trim() || null,
      stock: parseInt(formData.get("stock") as string) || 0,
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    },
  })

  // Update category
  const categoryId = formData.get("categoryId") as string
  await prisma.productCategory.deleteMany({ where: { productId } })
  if (categoryId) {
    await prisma.productCategory.create({
      data: { productId, categoryId },
    })
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  return {}
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await prisma.product.delete({ where: { id: productId } })
    revalidatePath("/admin/products")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete product" }
  }
}

export async function quickUpdateProduct(
  productId: string,
  data: {
    basePrice: number
    stock: number
    categoryId: string | null
    isActive: boolean
    isFeatured: boolean
  }
): Promise<{ error?: string }> {
  await requireAdmin()

  if (isNaN(data.basePrice) || data.basePrice < 0) return { error: "Valid price is required" }

  await prisma.product.update({
    where: { id: productId },
    data: {
      basePrice: data.basePrice,
      stock: data.stock,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    },
  })

  // Update category
  await prisma.productCategory.deleteMany({ where: { productId } })
  if (data.categoryId) {
    await prisma.productCategory.create({
      data: { productId, categoryId: data.categoryId },
    })
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  return {}
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireAdmin()
  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  })
  revalidatePath("/admin/products")
  return { success: true }
}

// --- Variant actions ---

export async function createVariant(productId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Variant name is required" }

  const price = parseFloat(formData.get("price") as string)
  if (isNaN(price) || price < 0) return { error: "Valid price is required" }

  const optionName = (formData.get("optionName") as string) || "Option"
  const optionValue = (formData.get("optionValue") as string) || name

  await prisma.productVariant.create({
    data: {
      productId,
      name: name.trim(),
      sku: (formData.get("sku") as string)?.trim() || null,
      price,
      stock: parseInt(formData.get("stock") as string) || 0,
      unitsPerItem: parseInt(formData.get("unitsPerItem") as string) || 1,
      options: [{ name: optionName, value: optionValue }],
      printfulVariantId: (formData.get("printfulVariantId") as string)?.trim() || null,
    },
  })

  revalidatePath(`/admin/products/${productId}`)
  return {}
}

export async function updateVariant(variantId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Variant name is required" }

  const price = parseFloat(formData.get("price") as string)
  if (isNaN(price) || price < 0) return { error: "Valid price is required" }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: name.trim(),
      sku: (formData.get("sku") as string)?.trim() || null,
      price,
      stock: parseInt(formData.get("stock") as string) || 0,
      unitsPerItem: parseInt(formData.get("unitsPerItem") as string) || 1,
    },
  })

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
  if (variant) revalidatePath(`/admin/products/${variant.productId}`)
  return {}
}

export async function deleteVariant(variantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
    await prisma.productVariant.delete({ where: { id: variantId } })
    if (variant) revalidatePath(`/admin/products/${variant.productId}`)
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete variant" }
  }
}

// --- Image actions ---

export async function addProductImage(productId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const url = formData.get("url") as string
  if (!url?.trim()) return { error: "Image URL is required" }

  const imageCount = await prisma.productImage.count({ where: { productId } })

  await prisma.productImage.create({
    data: {
      productId,
      url: url.trim(),
      alt: (formData.get("alt") as string) || null,
      isPrimary: imageCount === 0,
      sortOrder: imageCount,
    },
  })

  revalidatePath(`/admin/products/${productId}`)
  return {}
}

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const image = await prisma.productImage.findUnique({ where: { id: imageId } })
    await prisma.productImage.delete({ where: { id: imageId } })
    if (image) revalidatePath(`/admin/products/${image.productId}`)
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete image" }
  }
}
