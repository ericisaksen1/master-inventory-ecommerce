"use client"

import { useState, useEffect, useTransition } from "react"
import { toggleWishlist } from "@/actions/wishlist"
import { isGuestWishlisted, toggleGuestWishlist } from "@/lib/guest-wishlist"

interface WishlistButtonProps {
  productId: string
  isWishlisted: boolean
  size?: "sm" | "md"
}

export function WishlistButton({ productId, isWishlisted: initial, size = "sm" }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initial)
  const [isPending, startTransition] = useTransition()

  // On mount, check localStorage for guest wishlist state
  useEffect(() => {
    if (!initial && isGuestWishlisted(productId)) {
      setWishlisted(true)
    }
  }, [initial, productId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted(!wishlisted)
    startTransition(async () => {
      const result = await toggleWishlist(productId)
      if (result.error) {
        // Not authenticated — use localStorage instead
        const nowWishlisted = toggleGuestWishlist(productId)
        setWishlisted(nowWishlisted)
      }
    })
  }

  const sizeClasses = size === "md" ? "h-9 w-9" : "h-7 w-7"
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-50`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={`${iconSize} ${wishlisted ? "fill-[#00ff41] text-[#00ff41]" : "fill-none text-foreground"}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
        />
      </svg>
    </button>
  )
}
