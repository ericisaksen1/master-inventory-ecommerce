import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { AddStackToCartButton } from "./add-stack-to-cart-button"

export interface StackCardProduct {
  name: string
  basePrice: number
  imageUrl: string | null
  stock: number
  isActive: boolean
  quantity: number
}

export interface StackCardData {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  items: StackCardProduct[]
  inStock: boolean
}

interface StackCardProps {
  stack: StackCardData
  compact?: boolean
}

export function StackCard({ stack, compact }: StackCardProps) {
  const totalPrice = stack.items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
  const totalUnits = stack.items.reduce((sum, item) => sum + item.quantity, 0)
  const displayImage = stack.image || stack.items[0]?.imageUrl

  if (compact) {
    return (
      <Link
        href={`/stacks/${stack.slug}`}
        className="flex items-center gap-4 rounded-lg border border-black/5 p-3 transition-colors hover:bg-muted/50"
      >
        {displayImage ? (
          <img src={displayImage} alt={stack.name} className="h-14 w-14 rounded object-cover" />
        ) : (
          <div className="h-14 w-14 rounded bg-muted" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{stack.name}</p>
          <p className="text-xs text-secondary">
            {totalUnits} {totalUnits === 1 ? "item" : "items"} &mdash; {formatCurrency(totalPrice)}
          </p>
        </div>
        {!stack.inStock && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Out of Stock
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="group flex flex-col rounded-lg border border-black/5 bg-background overflow-hidden">
      <Link href={`/stacks/${stack.slug}`} className="block">
        {displayImage ? (
          <div className="aspect-square overflow-hidden">
            <img
              src={displayImage}
              alt={stack.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-square bg-muted flex items-center justify-center">
            <svg className="h-12 w-12 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/stacks/${stack.slug}`}>
          <h3 className="font-medium tracking-tight group-hover:underline">{stack.name}</h3>
        </Link>

        {/* Product thumbnails */}
        <div className="mt-2 flex items-center gap-1.5">
          {stack.items.slice(0, 5).map((item, i) => (
            item.imageUrl ? (
              <img
                key={i}
                src={item.imageUrl}
                alt={item.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-white"
                title={item.name}
              />
            ) : (
              <div key={i} className="h-7 w-7 rounded-full bg-muted ring-1 ring-white" title={item.name} />
            )
          ))}
          {stack.items.length > 5 && (
            <span className="text-xs text-secondary">+{stack.items.length - 5}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">
              {totalUnits} {totalUnits === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-semibold">{formatCurrency(totalPrice)}</p>
          </div>
          {!stack.inStock && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Out of Stock
            </span>
          )}
        </div>

        <div className="mt-4">
          <AddStackToCartButton stackId={stack.id} inStock={stack.inStock} className="w-full" />
        </div>
      </div>
    </div>
  )
}
