import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { ProductForm } from "../product-form"
import { VariantManager } from "./variant-manager"
import { ImageManager } from "./image-manager"
import { DeleteProductButton } from "./delete-product-button"
import { MasterSkuLinkWidget } from "./master-sku-link-widget"
import Link from "next/link"
import { getAvailableStockBulk } from "@/lib/master-inventory"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProductDetailPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      masterSkuLinks: {
        include: { masterSku: { select: { id: true, sku: true, name: true } } },
      },
    },
  })

  if (!product) notFound()

  const [categories, allMasterSkus] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.masterSku.findMany({
      where: { isActive: true },
      select: { id: true, sku: true, name: true },
      orderBy: { sku: "asc" },
    }),
  ])

  // Get available stock for all linked master SKUs
  const linkedMasterSkuIds = product.masterSkuLinks.map((l) => l.masterSku.id)
  const availableStockMap = linkedMasterSkuIds.length > 0
    ? await getAvailableStockBulk(linkedMasterSkuIds)
    : new Map<string, number>()

  // Build master SKU info for the product form (product-level link)
  const productLevelLink = product.masterSkuLinks.find((l) => !l.variantId)
  const masterSkuInfo = productLevelLink
    ? {
        sku: productLevelLink.masterSku.sku,
        name: productLevelLink.masterSku.name,
        availableStock: availableStockMap.get(productLevelLink.masterSku.id) ?? 0,
      }
    : null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-sm text-secondary hover:text-foreground">
            &larr; Back to Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
        </div>
        <DeleteProductButton productId={product.id} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProductForm
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              shortDescription: product.shortDescription,
              basePrice: Number(product.basePrice),
              compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
              costPrice: product.costPrice ? Number(product.costPrice) : null,
              sku: product.sku,
              stock: product.stock,
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              categories: product.categories,
            }}
            categories={categories}
            masterSkuInfo={masterSkuInfo}
          />
        </div>

        <div className="space-y-6">
          <MasterSkuLinkWidget
            productId={product.id}
            variants={product.variants.map((v) => ({ id: v.id, name: v.name }))}
            currentLinks={product.masterSkuLinks.map((l) => ({
              id: l.id,
              masterSkuId: l.masterSku.id,
              masterSku: l.masterSku.sku,
              masterSkuName: l.masterSku.name,
              variantId: l.variantId,
              quantityMultiplier: l.quantityMultiplier,
              availableStock: availableStockMap.get(l.masterSku.id) ?? 0,
            }))}
            availableMasterSkus={allMasterSkus}
          />
          <ImageManager productId={product.id} images={product.images} />
          <VariantManager
            productId={product.id}
            variants={product.variants.map((v) => ({
              ...v,
              price: Number(v.price),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
