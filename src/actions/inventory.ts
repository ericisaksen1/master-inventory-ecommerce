"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  return session
}

// ============================================================
// Master SKU CRUD
// ============================================================

export async function createMasterSku(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const sku = (formData.get("sku") as string)?.trim().toUpperCase()
  if (!sku) return { error: "SKU is required" }

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Name is required" }

  const existing = await prisma.masterSku.findUnique({ where: { sku } })
  if (existing) return { error: "A master SKU with this code already exists" }

  const stock = parseInt(formData.get("stock") as string) || 0
  if (stock < 0) return { error: "Stock cannot be negative" }

  await prisma.masterSku.create({
    data: {
      sku,
      name,
      description: (formData.get("description") as string)?.trim() || null,
      stock,
      isActive: formData.get("isActive") === "on",
    },
  })

  revalidatePath("/admin/inventory")
  redirect("/admin/inventory")
}

export async function updateMasterSku(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const sku = (formData.get("sku") as string)?.trim().toUpperCase()
  if (!sku) return { error: "SKU is required" }

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Name is required" }

  const existing = await prisma.masterSku.findFirst({
    where: { sku, NOT: { id } },
  })
  if (existing) return { error: "A master SKU with this code already exists" }

  const stock = parseInt(formData.get("stock") as string) || 0
  if (stock < 0) return { error: "Stock cannot be negative" }

  await prisma.masterSku.update({
    where: { id },
    data: {
      sku,
      name,
      description: (formData.get("description") as string)?.trim() || null,
      stock,
      isActive: formData.get("isActive") === "on",
    },
  })

  revalidatePath("/admin/inventory")
  revalidatePath(`/admin/inventory/${id}`)
  return {}
}

export async function deleteMasterSku(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const sku = await prisma.masterSku.findUnique({
    where: { id },
    include: { _count: { select: { productLinks: true } } },
  })

  if (!sku) return { success: false, error: "Master SKU not found" }

  if (sku._count.productLinks > 0) {
    return { success: false, error: "Cannot delete — this SKU still has linked products. Unlink them first." }
  }

  await prisma.masterSku.delete({ where: { id } })

  revalidatePath("/admin/inventory")
  return { success: true }
}

export async function quickUpdateMasterSku(
  id: string,
  data: { stock?: number; name?: string; isActive?: boolean }
): Promise<{ error?: string }> {
  await requireAdmin()

  await prisma.masterSku.update({
    where: { id },
    data: {
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })

  revalidatePath("/admin/inventory")
  return {}
}

// ============================================================
// Master SKU Links
// ============================================================

export async function linkProductToMasterSku(
  masterSkuId: string,
  data: {
    productId?: string
    variantId?: string
    siteId?: string
    remoteRef?: string
    quantityMultiplier?: number
  }
): Promise<{ error?: string }> {
  await requireAdmin()

  // Validate master SKU exists
  const masterSku = await prisma.masterSku.findUnique({ where: { id: masterSkuId } })
  if (!masterSku) return { error: "Master SKU not found" }

  // Must have either a local product/variant or a remote reference
  if (!data.productId && !data.siteId) {
    return { error: "Must specify either a local product or a remote site reference" }
  }

  // Check for existing link
  if (data.productId) {
    const existing = await prisma.masterSkuLink.findFirst({
      where: {
        productId: data.productId,
        variantId: data.variantId ?? null,
        siteId: null,
      },
    })
    if (existing) return { error: "This product/variant is already linked to a master SKU" }
  }

  await prisma.masterSkuLink.create({
    data: {
      masterSkuId,
      productId: data.productId ?? null,
      variantId: data.variantId ?? null,
      siteId: data.siteId ?? null,
      remoteRef: data.remoteRef ?? null,
      quantityMultiplier: data.quantityMultiplier ?? 1,
    },
  })

  revalidatePath("/admin/inventory")
  revalidatePath(`/admin/inventory/${masterSkuId}`)
  if (data.productId) {
    revalidatePath(`/admin/products/${data.productId}`)
  }
  return {}
}

export async function unlinkFromMasterSku(linkId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const link = await prisma.masterSkuLink.findUnique({ where: { id: linkId } })
  if (!link) return { success: false, error: "Link not found" }

  await prisma.masterSkuLink.delete({ where: { id: linkId } })

  revalidatePath("/admin/inventory")
  revalidatePath(`/admin/inventory/${link.masterSkuId}`)
  if (link.productId) {
    revalidatePath(`/admin/products/${link.productId}`)
  }
  return { success: true }
}

export async function updateLinkMultiplier(
  linkId: string,
  quantityMultiplier: number
): Promise<{ error?: string }> {
  await requireAdmin()

  if (quantityMultiplier < 1) return { error: "Multiplier must be at least 1" }

  await prisma.masterSkuLink.update({
    where: { id: linkId },
    data: { quantityMultiplier },
  })

  revalidatePath("/admin/inventory")
  return {}
}

export async function updateLink(
  linkId: string,
  data: {
    quantityMultiplier?: number
    remoteRef?: string
    variantId?: string | null
  }
): Promise<{ error?: string }> {
  await requireAdmin()

  const link = await prisma.masterSkuLink.findUnique({ where: { id: linkId } })
  if (!link) return { error: "Link not found" }

  if (data.quantityMultiplier !== undefined && data.quantityMultiplier < 1) {
    return { error: "Multiplier must be at least 1" }
  }

  const updateData: Record<string, unknown> = {}
  if (data.quantityMultiplier !== undefined) updateData.quantityMultiplier = data.quantityMultiplier
  if (data.remoteRef !== undefined) updateData.remoteRef = data.remoteRef
  if (data.variantId !== undefined) updateData.variantId = data.variantId || null

  await prisma.masterSkuLink.update({
    where: { id: linkId },
    data: updateData,
  })

  revalidatePath("/admin/inventory")
  revalidatePath(`/admin/inventory/${link.masterSkuId}`)
  if (link.productId) {
    revalidatePath(`/admin/products/${link.productId}`)
  }
  return {}
}

// ============================================================
// Connected Sites
// ============================================================

export async function createConnectedSite(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Site name is required" }

  const domain = (formData.get("domain") as string)?.trim().toLowerCase()
  if (!domain) return { error: "Domain is required" }

  const existing = await prisma.connectedSite.findUnique({ where: { domain } })
  if (existing) return { error: "A site with this domain already exists" }

  const apiKey = randomBytes(32).toString("hex")

  const apiUrl = (formData.get("apiUrl") as string)?.trim() || null

  await prisma.connectedSite.create({
    data: { name, domain, apiKey, apiUrl },
  })

  revalidatePath("/admin/inventory/sites")
  return {}
}

export async function updateConnectedSite(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Site name is required" }

  const domain = (formData.get("domain") as string)?.trim().toLowerCase()
  if (!domain) return { error: "Domain is required" }

  const existing = await prisma.connectedSite.findFirst({
    where: { domain, NOT: { id } },
  })
  if (existing) return { error: "A site with this domain already exists" }

  const apiUrl = (formData.get("apiUrl") as string)?.trim() || null

  await prisma.connectedSite.update({
    where: { id },
    data: {
      name,
      domain,
      apiUrl,
      isActive: formData.get("isActive") === "on",
    },
  })

  revalidatePath("/admin/inventory/sites")
  return {}
}

export async function deleteConnectedSite(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const site = await prisma.connectedSite.findUnique({
    where: { id },
    include: { _count: { select: { links: true } } },
  })

  if (!site) return { success: false, error: "Site not found" }

  if (site._count.links > 0) {
    return { success: false, error: "Cannot delete — this site still has linked products. Unlink them first." }
  }

  await prisma.connectedSite.delete({ where: { id } })

  revalidatePath("/admin/inventory/sites")
  return { success: true }
}

export async function checkSiteLinks(
  siteId: string
): Promise<{
  linked: number
  unlinked: string[]
  error?: string
}> {
  await requireAdmin()

  const site = await prisma.connectedSite.findUnique({ where: { id: siteId } })
  if (!site) return { linked: 0, unlinked: [], error: "Site not found" }
  if (!site.apiUrl) return { linked: 0, unlinked: [], error: "No API URL configured for this site. Edit the site and add the API URL." }

  try {
    const res = await fetch(`${site.apiUrl}/linked-skus`, {
      headers: { Authorization: `Bearer ${site.apiKey}` },
    })

    if (!res.ok) {
      const body = await res.text()
      return { linked: 0, unlinked: [], error: `Site returned ${res.status}: ${body}` }
    }

    const data = await res.json() as {
      count: number
      products: { name: string; masterSku: string; isActive: boolean }[]
    }

    // Cross-reference against our master SKUs
    const masterSkuStrings = data.products.map((p) => p.masterSku).filter(Boolean)
    const matchedSkus = await prisma.masterSku.findMany({
      where: { sku: { in: masterSkuStrings } },
      select: { sku: true },
    })
    const matchedSet = new Set(matchedSkus.map((m) => m.sku))

    const unlinked: string[] = []
    let linked = 0
    for (const product of data.products) {
      if (matchedSet.has(product.masterSku!)) {
        linked++
      } else {
        unlinked.push(`${product.name} (${product.masterSku})`)
      }
    }

    return { linked, unlinked }
  } catch (err) {
    return { linked: 0, unlinked: [], error: `Failed to connect to site: ${(err as Error).message}` }
  }
}

export async function regenerateSiteApiKey(siteId: string): Promise<{ apiKey?: string; error?: string }> {
  await requireAdmin()

  const site = await prisma.connectedSite.findUnique({ where: { id: siteId } })
  if (!site) return { error: "Site not found" }

  const apiKey = randomBytes(32).toString("hex")

  await prisma.connectedSite.update({
    where: { id: siteId },
    data: { apiKey },
  })

  revalidatePath("/admin/inventory/sites")
  return { apiKey }
}

