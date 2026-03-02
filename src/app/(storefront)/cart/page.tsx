import { getCart } from "@/actions/cart"
import { CartItems } from "./cart-items"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Cart" }

export default async function CartPage() {
  const cart = await getCart()
  const items = cart?.items ?? []

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant
      ? Number(item.variant.price)
      : Number(item.product.basePrice)
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <CartItems
            items={items.map((item) => ({
              id: item.id,
              productName: item.product.name,
              variantName: item.variant?.name || null,
              price: Number(item.variant?.price ?? item.product.basePrice),
              quantity: item.quantity,
              imageUrl: item.product.images[0]?.url || null,
              productSlug: item.product.slug,
            }))}
          />

          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link href="/products">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/checkout">
                <Button className="w-full sm:w-auto">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
