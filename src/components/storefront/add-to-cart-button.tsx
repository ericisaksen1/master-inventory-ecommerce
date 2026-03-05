"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"

const CartIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
    <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
)

interface AddToCartButtonProps {
  productId: string
  slug: string
  defaultVariantId: string | null
  hasMultipleVariants: boolean
  stock: number
  iconOnly?: boolean
  productName?: string
  productImage?: string | null
  productPrice?: string
  variantName?: string | null
}

export function AddToCartButton({
  productId,
  slug,
  defaultVariantId,
  hasMultipleVariants,
  stock,
  iconOnly,
  productName,
  productImage,
  productPrice,
  variantName,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast, cartToast } = useToast()

  if (hasMultipleVariants) {
    if (iconOnly) {
      return (
        <Link
          href={`/products/${slug}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
          title="View Options"
        >
          {CartIcon}
        </Link>
      )
    }
    return (
      <Link href={`/products/${slug}`}>
        <Button className="w-full rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]">
          View Options
        </Button>
      </Link>
    )
  }

  const canAdd = stock > 0

  function handleClick() {
    if (!canAdd) return
    startTransition(async () => {
      const result = await addToCart(productId, defaultVariantId, 1)
      if (result.success) {
        if (productName && productPrice) {
          cartToast({
            name: productName,
            image: productImage,
            variant: variantName,
            price: productPrice,
          })
        } else {
          toast("Added to cart!")
        }
      }
    })
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending || !canAdd}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)] disabled:opacity-50"
        title={!canAdd ? "Out of Stock" : "Add to Cart"}
      >
        {isPending ? (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : CartIcon}
      </button>
    )
  }

  return (
    <Button
      className="w-full rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
      onClick={handleClick}
      disabled={isPending || !canAdd}
    >
      {isPending ? "Adding..." : !canAdd ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
