import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSettings } from "@/lib/settings"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { PriceDisplay } from "@/components/storefront/price-display"
import { SetAdminEdit } from "@/components/storefront/admin-toolbar"
import { WishlistButton } from "@/components/storefront/wishlist-button"
import { ProductReviews } from "@/components/storefront/product-reviews"
import { ProductDetails } from "./product-details"
import { SocialShare } from "@/components/storefront/social-share"
import { ProductStacks } from "./product-stacks"
import { JsonLd } from "@/components/storefront/json-ld"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true, metaTitle: true, metaDescription: true, shortDescription: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  })

  if (!product) return { title: "Product Not Found" }

  const title = product.metaTitle || product.name
  const description = product.metaDescription || product.shortDescription || undefined
  const primaryImage = product.images[0]?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(primaryImage && { images: [primaryImage] }),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const [session, settings] = await Promise.all([
    auth(),
    getSettings(["enable_wishlist", "enable_reviews", "low_stock_threshold"]),
  ])

  const wishlistEnabled = settings.enable_wishlist !== "false"
  const reviewsEnabled = settings.enable_reviews !== "false"
  const lowStockThreshold = parseInt(settings.low_stock_threshold || "10", 10)

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      categories: {
        include: { category: true },
      },
    },
  })

  if (!product) notFound()

  // Look up master SKU links for this product and its variants
  const masterSkuLinks = await prisma.masterSkuLink.findMany({
    where: {
      OR: [
        { productId: product.id, variantId: null, siteId: null },
        { variantId: { in: product.variants.map((v) => v.id) }, siteId: null },
      ],
    },
    include: { masterSku: { select: { id: true } } },
  })

  let masterStockOverrides: Record<string, number> | undefined
  if (masterSkuLinks.length > 0) {
    const masterSkuIds = [...new Set(masterSkuLinks.map((l) => l.masterSku.id))]
    const availableMap = await getAvailableStockBulk(masterSkuIds)

    masterStockOverrides = {}
    for (const link of masterSkuLinks) {
      const available = availableMap.get(link.masterSku.id) ?? 0

      if (link.variantId) {
        // Variant-level link — use its explicit multiplier
        masterStockOverrides[link.variantId] = Math.floor(available / link.quantityMultiplier)
      } else {
        // Product-level link — generate per-variant overrides using
        // each variant's unitsPerItem (e.g. 3-pack = 3 units per item)
        masterStockOverrides["product"] = Math.floor(available / link.quantityMultiplier)
        for (const variant of product.variants) {
          const effectiveMultiplier = link.quantityMultiplier * (variant.unitsPerItem ?? 1)
          masterStockOverrides[variant.id] = Math.floor(available / effectiveMultiplier)
        }
      }
    }
  }

  // For pack variants (option name "Pack"), use product-level stock as the single source
  const hasPackVariants = product.variants.some((v) => {
    const opts = v.options as { name: string; value: string }[]
    return opts.some((o) => o.name === "Pack")
  })
  const totalStock = masterStockOverrides
    ? (masterStockOverrides["product"] ?? 0)
    : hasPackVariants
      ? product.stock
      : product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + v.stock, 0)
        : product.stock

  // Wishlist check
  let isWishlisted = false
  if (wishlistEnabled && session?.user?.id) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    })
    isWishlisted = !!item
  }

  // Reviews
  let reviews: any[] = []
  let averageRating = 0
  let hasReviewed = false
  if (reviewsEnabled) {
    const rawReviews = await prisma.productReview.findMany({
      where: { productId: product.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    })
    reviews = rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name,
    }))
    if (rawReviews.length > 0) {
      averageRating = rawReviews.reduce((sum, r) => sum + r.rating, 0) / rawReviews.length
    }
    if (session?.user?.id) {
      const userReview = await prisma.productReview.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
      })
      hasReviewed = !!userReview
    }
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: product.images[0]?.url,
    sku: product.sku || undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.basePrice),
      priceCurrency: "USD",
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(reviewsEnabled && averageRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  }

  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={productJsonLd} />
      <SetAdminEdit href={`/admin/products/${product.id}`} label="Edit Product" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Gallery */}
        <ProductGallery images={product.images} />

        {/* Product Info */}
        <div>
          {product.categories.length > 0 && (
            <p className="text-sm text-secondary">
              {product.categories.map((pc) => pc.category.name).join(", ")}
            </p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            {wishlistEnabled && (
              <WishlistButton productId={product.id} isWishlisted={isWishlisted} size="md" />
            )}
          </div>
          {totalStock > 0 && totalStock < lowStockThreshold && (
            <p className="mt-1 text-sm font-semibold text-red-600">Only {totalStock} left, order soon!</p>
          )}
          {totalStock <= 0 && (
            <p className="mt-1 text-sm font-semibold text-red-600">Out of Stock</p>
          )}

          <div className="mt-4">
            <PriceDisplay
              price={product.basePrice.toString()}
              compareAtPrice={product.compareAtPrice?.toString()}
              size="lg"
            />
          </div>

          {product.shortDescription && (
            <div
              className="prose mt-4 text-secondary"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Variant selector + Add to cart */}
          <div className="mt-6">
            <ProductDetails
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price.toString(),
                stock: v.stock,
                unitsPerItem: v.unitsPerItem ?? 1,
                options: v.options as { name: string; value: string }[],
              }))}
              productId={product.id}
              productStock={product.stock}
              basePrice={product.basePrice.toString()}
              isAdmin={session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"}
              masterStockOverrides={masterStockOverrides}
              productName={product.name}
              productImage={product.images[0]?.url}
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-black/5 pt-8">
              <h2 className="text-lg font-semibold tracking-tight">Description</h2>
              <div
                className="prose mt-4 text-sm text-secondary"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="mt-6 text-xs text-secondary">SKU: {product.sku}</p>
          )}

          <div className="mt-6 border-t border-black/5 pt-6">
            <SocialShare url={`/products/${slug}`} title={product.name} />
          </div>
        </div>
      </div>

      {/* Stacks containing this product */}
      <ProductStacks productId={product.id} />

      {/* Reviews */}
      {reviewsEnabled && (
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          isAuthenticated={!!session?.user}
          hasReviewed={hasReviewed}
        />
      )}
    </div>
  )
}
