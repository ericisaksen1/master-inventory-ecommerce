"use client"

import { useState } from "react"
import { ProductGrid, type ProductLayout } from "./product-grid"
import type { ProductCardStyle } from "./product-card"

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

interface ProductSearchProps {
  products: Product[]
  children?: React.ReactNode
  layout?: ProductLayout
  cardStyle?: ProductCardStyle
  wishlistEnabled?: boolean
  wishlistIds?: string[]
  reviewMap?: Record<string, { avgRating: number; count: number }>
}

export function ProductSearch({
  products,
  children,
  layout,
  cardStyle,
  wishlistEnabled,
  wishlistIds,
  reviewMap,
}: ProductSearchProps) {
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
        )
      })
    : products

  return (
    <>
      <div className="relative mt-6">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {children}

      <div className="mt-8">
        <ProductGrid
          products={filtered}
          layout={layout}
          cardStyle={cardStyle}
          wishlistEnabled={wishlistEnabled}
          wishlistIds={wishlistIds}
          reviewMap={reviewMap}
        />
      </div>
    </>
  )
}
