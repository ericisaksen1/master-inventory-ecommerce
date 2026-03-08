import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSetting } from "@/lib/settings"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { WishlistButton } from "@/components/storefront/wishlist-button"
import { GuestWishlist } from "./guest-wishlist"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Wishlist" }

export default async function WishlistPage() {
  const enableWishlist = await getSetting("enable_wishlist")
  if (enableWishlist === "false") redirect("/products")

  const session = await auth()

  // Guest: render client component that reads from localStorage
  if (!session?.user?.id) {
    return (
      <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Wishlist</h1>
        <GuestWishlist />
      </div>
    )
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  })

  return (
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Wishlist</h1>
      <p className="mt-1 text-sm text-secondary">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
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
          {items.map((item) => {
            const image = item.product.images[0]
            return (
              <div key={item.id} className="group relative">
                <div className="absolute right-2 top-2 z-10">
                  <WishlistButton productId={item.productId} isWishlisted={true} />
                </div>
                <Link href={`/products/${item.product.slug}`} className="block">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt || item.product.name}
                      width={400}
                      height={400}
                      className="aspect-square w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-lg bg-muted" />
                  )}
                  <h2 className="mt-3 text-sm font-semibold group-hover:underline">
                    {item.product.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium">
                    {formatCurrency(Number(item.product.basePrice))}
                  </p>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
