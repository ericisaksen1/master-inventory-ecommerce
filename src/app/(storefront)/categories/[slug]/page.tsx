import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSettings } from "@/lib/settings"
import { type ProductLayout } from "@/components/storefront/product-grid"
import { ProductSearch } from "@/components/storefront/product-search"
import { CategoryNav } from "@/components/storefront/category-nav"
import { SortSelect } from "@/components/storefront/sort-select"
import type { ProductCardStyle } from "@/components/storefront/product-card"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  })

  if (!category) return { title: "Category Not Found" }

  return {
    title: category.name,
    description: category.description || `Browse ${category.name} products`,
    openGraph: {
      title: category.name,
      description: category.description || undefined,
      ...(category.image && { images: [category.image] }),
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const sortOption = sp.sort || "newest"

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
  })

  if (!category) notFound()

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

  const rawProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId: category.id } },
    },
    orderBy: orderBy[sortOption] || orderBy.newest,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, select: { id: true, stock: true, price: true } },
    },
  })

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
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-secondary">{category.description}</p>
          )}
        </div>
        <SortSelect current={sortOption} />
      </div>

      <ProductSearch
        products={products}
        layout={productsLayout}
        cardStyle={cardStyle}
        wishlistEnabled={wishlistEnabled}
        wishlistIds={wishlistIds}
        reviewMap={reviewMap}
      >
        <div className="mt-4">
          <CategoryNav activeSlug={slug} />
        </div>
      </ProductSearch>
    </div>
  )
}
