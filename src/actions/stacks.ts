"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { redirect } from "next/navigation"
import { addToCart } from "@/actions/cart"
import { getAvailableStockBulk } from "@/lib/master-inventory"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  return session
}

export async function createStack(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Stack name is required" }

  let slug = (formData.get("slug") as string)?.trim() || slugify(name)
  const existing = await prisma.stack.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const productIds: string[] = JSON.parse((formData.get("productIds") as string) || "[]")

  const stack = await prisma.stack.create({
    data: {
      name: name.trim(),
      slug,
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string)?.trim() || null,
      isActive: formData.get("isActive") === "on",
      items: {
        create: productIds.map((productId, i) => ({
          productId,
          sortOrder: i,
        })),
      },
    },
  })

  revalidatePath("/admin/stacks")
  redirect(`/admin/stacks/${stack.id}`)
}

export async function updateStack(stackId: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Stack name is required" }

  const productIds: string[] = JSON.parse((formData.get("productIds") as string) || "[]")

  await prisma.$transaction(async (tx) => {
    await tx.stack.update({
      where: { id: stackId },
      data: {
        name: name.trim(),
        slug: (formData.get("slug") as string)?.trim() || slugify(name),
        description: (formData.get("description") as string) || null,
        image: (formData.get("image") as string)?.trim() || null,
        isActive: formData.get("isActive") === "on",
      },
    })

    await tx.stackItem.deleteMany({ where: { stackId } })
    if (productIds.length > 0) {
      await tx.stackItem.createMany({
        data: productIds.map((productId, i) => ({
          stackId,
          productId,
          sortOrder: i,
        })),
      })
    }
  })

  revalidatePath("/admin/stacks")
  revalidatePath(`/admin/stacks/${stackId}`)
  revalidatePath("/stacks")
  return {}
}

export async function deleteStack(stackId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await prisma.stack.delete({ where: { id: stackId } })
    revalidatePath("/admin/stacks")
    revalidatePath("/stacks")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete stack" }
  }
}

export async function toggleStackActive(stackId: string, isActive: boolean) {
  await requireAdmin()
  await prisma.stack.update({
    where: { id: stackId },
    data: { isActive },
  })
  revalidatePath("/admin/stacks")
  revalidatePath("/stacks")
  return { success: true }
}

export async function addStackToCart(stackId: string) {
  const stack = await prisma.stack.findUnique({
    where: { id: stackId, isActive: true },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, stock: true, isActive: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!stack || stack.items.length === 0) return { error: "Stack not found" }

  // Verify all products are active
  const inactiveProduct = stack.items.find((item) => !item.product.isActive)
  if (inactiveProduct) return { error: `${inactiveProduct.product.name} is no longer available` }

  // Check master inventory for linked products
  const productIds = stack.items.map((i) => i.product.id)
  const masterLinks = await prisma.masterSkuLink.findMany({
    where: {
      productId: { in: productIds },
      variantId: null,
      siteId: null,
    },
    select: { productId: true, masterSkuId: true, quantityMultiplier: true },
  })

  const masterLinkMap = new Map(masterLinks.map((l) => [l.productId!, l]))

  if (masterLinks.length > 0) {
    const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
    const availableMap = await getAvailableStockBulk(masterSkuIds)

    for (const item of stack.items) {
      const link = masterLinkMap.get(item.product.id)
      if (link) {
        const available = availableMap.get(link.masterSkuId) ?? 0
        const effectiveAvailable = Math.floor(available / link.quantityMultiplier)
        if (effectiveAvailable < 1) {
          return { error: `${item.product.name} is out of stock` }
        }
      }
    }
  }

  // Check local stock for products without master SKU links
  for (const item of stack.items) {
    if (!masterLinkMap.has(item.product.id) && item.product.stock < 1) {
      return { error: `${item.product.name} is out of stock` }
    }
  }

  // Add each product to cart (base product, no variant, qty 1)
  for (const item of stack.items) {
    const result = await addToCart(item.product.id, null, 1)
    if (result.error) {
      return { error: `Failed to add ${item.product.name}: ${result.error}` }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
