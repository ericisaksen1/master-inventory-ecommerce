import Link from "next/link"
import { ProductCard, type ProductCardStyle } from "./product-card"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle, linkColorProps } from "@/lib/component-colors"

interface Product {
  slug: string
  name: string
  basePrice: number
  compareAtPrice: number | null
  shortDescription: string | null
  images: { url: string; alt: string | null; isPrimary: boolean }[]
  id?: string
  stock?: number
  defaultVariantId?: string | null
  hasMultipleVariants?: boolean
  hasVariantPricing?: boolean
}

interface FeaturedProductsGridProps extends ComponentColorProps {
  heading: string
  subtitle?: string
  products: Product[]
  showViewAll: boolean
  cardStyle?: ProductCardStyle
}

export function FeaturedProductsGrid({ heading, subtitle, products, showViewAll, cardStyle, bgColor, headlineColor, textColor, linkColor, linkHoverColor }: FeaturedProductsGridProps) {
  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={headlineColorStyle(headlineColor)}>
            {heading}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-secondary" style={textColorStyle(textColor)}>{subtitle}</p>
          )}
        </div>
        {showViewAll && (
          <Link
            href="/products"
            className="shrink-0 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            {...linkColorProps(linkColor, linkHoverColor)}
          >
            View all
          </Link>
        )}
      </div>
      <div className="mt-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} cardStyle={cardStyle} />
            ))}
          </div>
        ) : (
          <p className="text-secondary" style={textColorStyle(textColor)}>
            No products to display.
          </p>
        )}
      </div>
      </div>
    </section>
  )
}
