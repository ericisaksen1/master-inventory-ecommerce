import { ProductCard, type ProductCardStyle } from "./product-card"

interface Product {
  slug: string
  name: string
  basePrice: any
  compareAtPrice: any | null
  shortDescription: string | null
  images: { url: string; alt: string | null; isPrimary: boolean }[]
  id?: string
  stock?: number
  defaultVariantId?: string | null
  hasMultipleVariants?: boolean
  hasVariantPricing?: boolean
}

export type ProductLayout = "standard" | "compact" | "spacious" | "list"

const gridClasses: Record<ProductLayout, string> = {
  standard: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  compact: "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  spacious: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
  list: "grid grid-cols-1 gap-4",
}

interface ProductGridProps {
  products: Product[]
  layout?: ProductLayout
  cardStyle?: ProductCardStyle
  wishlistEnabled?: boolean
  wishlistIds?: string[]
  reviewMap?: Record<string, { avgRating: number; count: number }>
}

export function ProductGrid({
  products,
  layout = "standard",
  cardStyle,
  wishlistEnabled,
  wishlistIds,
  reviewMap,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-secondary">No products found.</p>
      </div>
    )
  }

  const isList = layout === "list"
  const wishlistSet = new Set(wishlistIds || [])

  return (
    <div className={gridClasses[layout]}>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          horizontal={isList}
          cardStyle={cardStyle}
          wishlistEnabled={wishlistEnabled}
          isWishlisted={product.id ? wishlistSet.has(product.id) : false}
          reviewData={product.id ? reviewMap?.[product.id] : undefined}
        />
      ))}
    </div>
  )
}
