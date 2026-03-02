"use client"

import { useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "./price-display"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface FeaturedProductHeroProps extends ComponentColorProps {
  product: {
    id: string
    slug: string
    name: string
    basePrice: number
    compareAtPrice: number | null
    shortDescription: string | null
    description: string | null
    images: { url: string; alt: string | null; isPrimary: boolean }[]
    defaultVariantId: string | null
    hasMultipleVariants: boolean
    stock: number
  }
  layout: "image_right" | "image_left"
  ctaText: string
  showPrice: boolean
  showDescription: boolean
}

export function FeaturedProductHero({
  product,
  layout,
  ctaText,
  showPrice,
  showDescription,
  bgColor,
  headlineColor,
  textColor,
  buttonColor,
  buttonTextColor,
  buttonHoverColor,
  buttonHoverTextColor,
}: FeaturedProductHeroProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0]
  const description = product.shortDescription || product.description

  const canAdd = !product.hasMultipleVariants && product.stock > 0

  function handleAddToCart() {
    if (!canAdd) return
    startTransition(async () => {
      const result = await addToCart(product.id, product.defaultVariantId, 1)
      if (result.success) {
        toast("Added to cart!")
      }
    })
  }

  const imageSection = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted sm:aspect-square lg:aspect-[4/3]">
      {primaryImage ? (
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      ) : (
        <div className="flex h-full items-center justify-center text-secondary">
          No image
        </div>
      )}
    </div>
  )

  const contentSection = (
    <div className="flex flex-col justify-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={headlineColorStyle(headlineColor)}>
        {product.name}
      </h2>

      {showPrice && (
        <div className="mt-3">
          <PriceDisplay
            price={product.basePrice}
            compareAtPrice={product.compareAtPrice}
            size="lg"
          />
        </div>
      )}

      {showDescription && description && (
        <p className="mt-4 text-base leading-relaxed text-secondary" style={textColorStyle(textColor)}>
          {description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {product.hasMultipleVariants ? (
          <Link href={`/products/${product.slug}`}>
            <Button size="lg" className="border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]">{ctaText || "View Options"}</Button>
          </Link>
        ) : (
          <Button
            size="lg"
            className="border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
            onClick={handleAddToCart}
            disabled={isPending || !canAdd}
          >
            {isPending
              ? "Adding..."
              : !canAdd
                ? "Out of Stock"
                : ctaText || "Add to Cart"}
          </Button>
        )}
        <Link href={`/products/${product.slug}`}>
          <Button variant="outline" size="lg">
            Buy Now
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <section className="py-10" style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}>
      <div className="container-homepage px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
          {layout === "image_left" ? (
            <>
              {imageSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {imageSection}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
