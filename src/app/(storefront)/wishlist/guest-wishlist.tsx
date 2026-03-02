"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { WishlistButton } from "@/components/storefront/wishlist-button"
import { getGuestWishlistIds } from "@/lib/guest-wishlist"
import { getWishlistProducts } from "@/actions/wishlist"

interface WishlistProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  compareAtPrice: number | null
  image: string | null
}

export function GuestWishlist() {
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getGuestWishlistIds()
    if (ids.length === 0) {
      setLoading(false)
      return
    }
    getWishlistProducts(ids).then((items) => {
      setProducts(items)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square w-full rounded-lg bg-muted" />
            <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-4 w-1/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        Your wishlist is saved to this browser.{" "}
        <Link href="/register" className="font-medium underline hover:no-underline">
          Create an account
        </Link>{" "}
        to save it permanently.
      </div>

      <p className="mt-4 text-sm text-secondary">
        {products.length} item{products.length !== 1 ? "s" : ""}
      </p>

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-secondary">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-[var(--radius)] shadow-[var(--shadow)] bg-[var(--color-button-bg)] px-4 py-2 text-sm font-medium text-[var(--color-button-text)] hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="absolute right-2 top-2 z-10">
                <WishlistButton productId={product.id} isWishlisted={true} />
              </div>
              <Link href={`/products/${product.slug}`} className="block">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="aspect-square w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-lg bg-muted" />
                )}
                <h2 className="mt-3 text-sm font-semibold group-hover:underline">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm font-medium">
                  {formatCurrency(product.basePrice)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
