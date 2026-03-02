import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSettings } from "@/lib/settings"
import { ProductGrid, type ProductLayout } from "@/components/storefront/product-grid"
import type { ProductCardStyle } from "@/components/storefront/product-card"

export const metadata = { title: "Search" }

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q?.trim() || ""

  const [session, settings] = await Promise.all([
    auth(),
    getSettings(["products_layout", "product_card_style", "enable_wishlist", "enable_reviews"]),
  ])

  const productsLayout = (settings.products_layout || "standard") as ProductLayout
  const cardStyle = (settings.product_card_style || "standard") as ProductCardStyle
  const wishlistEnabled = settings.enable_wishlist !== "false"
  const reviewsEnabled = settings.enable_reviews !== "false"

  const rawProducts = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { shortDescription: { contains: query } },
            { description: { contains: query } },
            { sku: { contains: query } },
          ],
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { isActive: true }, select: { id: true, stock: true, price: true } },
        },
        take: 50,
      })
    : []

  const products = rawProducts.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
    stock: p.variants.length === 1 ? p.variants[0].stock : p.stock,
    defaultVariantId: p.variants.length === 1 ? p.variants[0].id : null,
    hasMultipleVariants: p.variants.length > 1,
    hasVariantPricing: p.variants.length > 1 && new Set(p.variants.map((v) => v.price.toString())).size > 1,
  }))

  // Wishlist IDs
  let wishlistIds: string[] = []
  if (wishlistEnabled && session?.user?.id && products.length > 0) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    })
    wishlistIds = items.map((i) => i.productId)
  }

  // Review averages
  let reviewMap: Record<string, { avgRating: number; count: number }> = {}
  if (reviewsEnabled && products.length > 0) {
    const productIds = products.map((p) => p.id)
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

  return (
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      {query && (
        <p className="mt-1 text-sm text-secondary">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="mt-8">
        {!query ? (
          <p className="text-secondary">Enter a search term to find products.</p>
        ) : (
          <ProductGrid
            products={products}
            layout={productsLayout}
            cardStyle={cardStyle}
            wishlistEnabled={wishlistEnabled}
            wishlistIds={wishlistIds}
            reviewMap={reviewMap}
          />
        )}
      </div>
    </div>
  )
}
