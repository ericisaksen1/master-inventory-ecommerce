import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSettings } from "@/lib/settings"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import { ProductSearch } from "@/components/storefront/product-search"
import { ProductFilters } from "@/components/storefront/product-filters"
import { CategoryNav } from "@/components/storefront/category-nav"
import { SortSelect } from "@/components/storefront/sort-select"
import type { ProductLayout } from "@/components/storefront/product-grid"
import type { ProductCardStyle } from "@/components/storefront/product-card"

export const metadata = { title: "All Products" }

interface Props {
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; category?: string; inStock?: string; onSale?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const sortOption = params.sort || "newest"

  const orderBy: Record<string, any> = {
    newest: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    "price-low": { basePrice: "asc" as const },
    "price-high": { basePrice: "desc" as const },
    name: { name: "asc" as const },
  }

  const [session, settings] = await Promise.all([
    auth(),
    getSettings(["products_layout", "product_card_style", "enable_wishlist", "enable_reviews"]),
  ])

  const productsLayout = (settings.products_layout || "standard") as ProductLayout
  const cardStyle = (settings.product_card_style || "standard") as ProductCardStyle
  const wishlistEnabled = settings.enable_wishlist !== "false"
  const reviewsEnabled = settings.enable_reviews !== "false"

  // Build filter conditions
  const where: any = { isActive: true }
  if (params.minPrice) {
    where.basePrice = { ...where.basePrice, gte: parseFloat(params.minPrice) }
  }
  if (params.maxPrice) {
    where.basePrice = { ...where.basePrice, lte: parseFloat(params.maxPrice) }
  }
  if (params.category) {
    where.categories = { some: { category: { slug: params.category } } }
  }
  if (params.onSale === "true") {
    where.compareAtPrice = { not: null }
  }

  // Fetch categories for filter UI
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  })

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy: orderBy[sortOption] || orderBy.newest,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, select: { id: true, stock: true, price: true } },
    },
  })

  // Look up master SKU links for all products to override stock
  const productIds = rawProducts.map((p) => p.id)
  const masterLinks = await prisma.masterSkuLink.findMany({
    where: { productId: { in: productIds }, variantId: null, siteId: null },
    select: { productId: true, masterSkuId: true },
  })
  const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
  const masterStockMap = await getAvailableStockBulk(masterSkuIds)
  const productMasterStock = new Map<string, number>()
  for (const link of masterLinks) {
    if (link.productId) {
      productMasterStock.set(link.productId, masterStockMap.get(link.masterSkuId) ?? 0)
    }
  }

  const products = rawProducts.map((p) => {
    const localStock = p.variants.length === 1 ? p.variants[0].stock : p.stock
    return {
      ...p,
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
      stock: productMasterStock.has(p.id) ? productMasterStock.get(p.id)! : localStock,
      defaultVariantId: p.variants.length === 1 ? p.variants[0].id : null,
      hasMultipleVariants: p.variants.length > 1,
      hasVariantPricing: p.variants.length > 1 && new Set(p.variants.map((v) => v.price.toString())).size > 1,
    }
  })

  // Filter to in-stock only if requested
  const filteredProducts = params.inStock === "true"
    ? products.filter((p) => (p.stock ?? 0) > 0)
    : products

  // Wishlist IDs
  let wishlistIds: string[] = []
  if (wishlistEnabled && session?.user?.id) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    })
    wishlistIds = items.map((i) => i.productId)
  }

  // Review averages
  let reviewMap: Record<string, { avgRating: number; count: number }> = {}
  if (reviewsEnabled) {
    const productIds = products.map((p) => p.id)
    if (productIds.length > 0) {
      const reviews = await prisma.productReview.groupBy({
        by: ["productId"],
        where: { productId: { in: productIds }, isApproved: true },
        _avg: { rating: true },
        _count: { id: true },
      })
      for (const r of reviews) {
        reviewMap[r.productId] = {
          avgRating: r._avg.rating || 0,
          count: r._count.id,
        }
      }
    }
  }

  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">All Products</h1>
        <SortSelect current={sortOption} />
      </div>

      <ProductFilters
        categories={categories}
        currentCategory={params.category}
        currentMinPrice={params.minPrice}
        currentMaxPrice={params.maxPrice}
        currentOnSale={params.onSale}
        currentInStock={params.inStock}
      />

      <ProductSearch
        products={filteredProducts}
        layout={productsLayout}
        cardStyle={cardStyle}
        wishlistEnabled={wishlistEnabled}
        wishlistIds={wishlistIds}
        reviewMap={reviewMap}
      >
        <div className="mt-4">
          <CategoryNav />
        </div>
      </ProductSearch>
    </div>
  )
}
