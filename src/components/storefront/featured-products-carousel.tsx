"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle, linkColorProps } from "@/lib/component-colors"
import { AddToCartButton } from "./add-to-cart-button"

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

interface FeaturedProductsCarouselProps extends ComponentColorProps {
  products: Product[]
  heading: string
  subtitle?: string
  showViewAll: boolean
  autoPlay: boolean
}

export function FeaturedProductsCarousel({
  products,
  heading,
  subtitle,
  showViewAll,
  autoPlay,
  bgColor,
  headlineColor,
  textColor,
  linkColor,
  linkHoverColor,
}: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  useEffect(() => {
    if (!autoPlay || products.length <= 1) return
    const interval = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const cardWidth = el.firstElementChild?.clientWidth || 0
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" })
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [autoPlay, products.length])

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.firstElementChild?.clientWidth || 300
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    })
  }

  if (products.length === 0) return null

  return (
    <section className="overflow-x-clip" style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      {/* Header */}
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

      {/* Carousel */}
      <div className="relative mt-8">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((product) => {
              const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0]

              return (
                <div
                  key={product.slug}
                  className="w-[280px] shrink-0 sm:w-[calc(33.333%-14px)] lg:w-[calc(20%-16px)]"
                  style={{ scrollSnapAlign: "start" }}
                >
                <div className="group flex h-full flex-col">
                  {/* Product image */}
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt || product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 280px, (max-width: 1024px) 240px, 20vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-secondary">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product info */}
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm">
                      {product.hasVariantPricing && <><span className="text-xs text-secondary">From</span>{" "}</>}
                      <span className="font-semibold">{formatCurrency(product.basePrice.toString())}</span>
                    </p>

                    {/* Buttons */}
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      {product.id && (
                        <AddToCartButton
                          productId={product.id}
                          slug={product.slug}
                          defaultVariantId={product.defaultVariantId ?? null}
                          hasMultipleVariants={product.hasMultipleVariants ?? false}
                          stock={product.stock ?? 0}
                          iconOnly
                          productName={product.name}
                          productImage={primaryImage?.url}
                          productPrice={formatCurrency(product.basePrice.toString())}
                        />
                      )}
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-center text-sm font-medium text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}
