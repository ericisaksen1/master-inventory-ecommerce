"use client"

import { useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { updateCartItemQuantity, removeFromCart } from "@/actions/cart"
import { formatCurrency } from "@/lib/utils"

interface CartItem {
  id: string
  productName: string
  variantName: string | null
  price: number
  quantity: number
  imageUrl: string | null
  productSlug: string
}

interface CartItemsProps {
  items: CartItem[]
}

export function CartItems({ items }: CartItemsProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </div>
  )
}

function CartItemRow({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition()

  function handleQuantityChange(newQty: number) {
    startTransition(async () => {
      if (newQty <= 0) {
        await removeFromCart(item.id)
      } else {
        await updateCartItemQuantity(item.id, newQty)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(item.id)
    })
  }

  return (
    <div className={`flex gap-4 py-6 ${isPending ? "opacity-50" : ""}`}>
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              className="text-sm font-medium hover:underline"
            >
              {item.productName}
            </Link>
            {item.variantName && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.variantName}</p>
            )}
          </div>
          <p className="text-sm font-medium">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              -
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
