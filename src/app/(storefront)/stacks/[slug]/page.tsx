import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { AddStackToCartButton } from "@/components/storefront/add-stack-to-cart-button"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const stack = await prisma.stack.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!stack) return { title: "Stack Not Found" }
  return {
    title: stack.name,
    description: stack.description || `Browse the ${stack.name} bundle.`,
  }
}

export default async function StackDetailPage({ params }: Props) {
  const { slug } = await params

  const stack = await prisma.stack.findUnique({
    where: { slug, isActive: true },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              stock: true,
              isActive: true,
              shortDescription: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!stack) notFound()

  // Check master inventory stock via MasterSkuLink
  const productIds = stack.items.map((i) => i.product.id)
  const masterLinks = await prisma.masterSkuLink.findMany({
    where: {
      productId: { in: productIds },
      variantId: null,
      siteId: null,
    },
    select: { productId: true, masterSkuId: true, quantityMultiplier: true },
  })

  const masterLinkMap = new Map(masterLinks.map((l) => [l.productId!, l]))

  let availableMap = new Map<string, number>()
  if (masterLinks.length > 0) {
    const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
    availableMap = await getAvailableStockBulk(masterSkuIds)
  }

  const totalPrice = stack.items.reduce((sum, i) => sum + Number(i.product.basePrice) * i.quantity, 0)
  const totalUnits = stack.items.reduce((sum, i) => sum + i.quantity, 0)

  const inStock = stack.items.every((item) => {
    if (!item.product.isActive) return false
    const link = masterLinkMap.get(item.product.id)
    if (link) {
      const available = availableMap.get(link.masterSkuId) ?? 0
      return Math.floor(available / link.quantityMultiplier) >= item.quantity
    }
    return item.product.stock >= item.quantity
  })

  const displayImage = stack.image || stack.items[0]?.product.images[0]?.url

  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div>
          {displayImage ? (
            <img
              src={displayImage}
              alt={stack.name}
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <svg className="h-16 w-16 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{stack.name}</h1>

          {stack.description && (
            <p className="mt-4 text-secondary">{stack.description}</p>
          )}

          <div className="mt-6">
            <p className="text-sm text-secondary">
              {totalUnits} {totalUnits === 1 ? "item" : "items"} included
            </p>
            <p className="mt-1 text-3xl font-semibold">{formatCurrency(totalPrice)}</p>
          </div>

          <div className="mt-4">
            {inStock ? (
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                In Stock
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Out of Stock
              </span>
            )}
          </div>

          <div className="mt-6">
            <AddStackToCartButton stackId={stack.id} inStock={inStock} size="lg" className="w-full" />
          </div>

          {/* Product list */}
          <div className="mt-8 border-t border-black/5 pt-8">
            <h2 className="text-lg font-semibold tracking-tight">What&apos;s Included</h2>
            <div className="mt-4 space-y-3">
              {stack.items.map((item) => {
                const link = masterLinkMap.get(item.product.id)
                const productInStock = link
                  ? Math.floor((availableMap.get(link.masterSkuId) ?? 0) / link.quantityMultiplier) >= item.quantity
                  : item.product.stock >= item.quantity

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.product.slug}`}
                    className="flex items-center gap-4 rounded-lg border border-black/5 p-3 transition-colors hover:bg-muted/50"
                  >
                    {item.product.images[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-14 w-14 rounded object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {item.quantity > 1 && <span className="text-secondary">{item.quantity}x </span>}
                        {item.product.name}
                      </p>
                      {item.product.shortDescription && (
                        <p className="mt-0.5 text-xs text-secondary truncate">{item.product.shortDescription}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{formatCurrency(Number(item.product.basePrice) * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-secondary">{formatCurrency(Number(item.product.basePrice))} each</p>
                      )}
                      {!productInStock && (
                        <p className="text-xs text-red-600">Out of stock</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
