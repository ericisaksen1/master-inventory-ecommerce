"use client"

import { useState, useTransition } from "react"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { PriceDisplay } from "@/components/storefront/price-display"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"
import { formatCurrency } from "@/lib/utils"

interface Variant {
  id: string
  name: string
  price: string
  stock: number
  unitsPerItem?: number
  options: { name: string; value: string }[]
}

interface ProductDetailsProps {
  variants: Variant[]
  productId: string
  productStock?: number
  basePrice: string
  isAdmin?: boolean
  masterStockOverrides?: Record<string, number>
}

export function ProductDetails({ variants, productId, productStock = 0, basePrice, isAdmin = false, masterStockOverrides }: ProductDetailsProps) {
  const hasVariants = variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  )
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const hasMultipleVariants = variants.length > 1

  // Variants with unitsPerItem > 1 share product-level stock: available = floor(productStock / unitsPerItem)
  const unitsPerItem = selectedVariant?.unitsPerItem ?? 1
  const isPackVariant = unitsPerItem > 1

  // Use master stock overrides when available, otherwise fall back to local stock
  const stock = masterStockOverrides
    ? (masterStockOverrides[selectedVariant?.id || "product"] ?? 0)
    : isPackVariant
      ? Math.floor(productStock / unitsPerItem)
      : hasVariants
        ? (selectedVariant?.stock ?? 0)
        : productStock
  const canAdd = stock > 0 && (!hasVariants || !!selectedVariant)
  const maxQty = Math.min(stock, 99)

  const stockIndicator = (!hasVariants || selectedVariant) ? (
    <div>
      {stock > 0 ? (
        <span className="text-sm text-green-600">
          In stock{isAdmin && ` — ${stock}`}
        </span>
      ) : (
        <span className="text-sm text-red-600">Out of stock</span>
      )}
    </div>
  ) : null

  function handleAddToCart() {
    if (!canAdd) return
    startTransition(async () => {
      const result = await addToCart(productId, hasVariants ? selectedVariantId! : null, quantity)
      if (result.success) {
        toast("Added to cart!")
        setQuantity(1)
      }
    })
  }

  const quantitySelector = canAdd ? (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty</span>
      <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={quantity}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            if (!isNaN(v)) setQuantity(Math.max(1, Math.min(maxQty, v)))
          }}
          className="w-12 border-x border-gray-300 bg-transparent py-2 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-gray-600"
        />
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          disabled={quantity >= maxQty}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>
    </div>
  ) : null

  const unitPrice = hasVariants ? (selectedVariant ? Number(selectedVariant.price) : 0) : Number(basePrice)
  const total = unitPrice * quantity

  const totalDisplay = canAdd && quantity > 1 ? (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        {quantity} x {formatCurrency(unitPrice)}
      </span>
      <span className="text-lg font-bold">{formatCurrency(total)}</span>
    </div>
  ) : null

  const addToCartButton = (
    <Button
      size="lg"
      className="w-full border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
      disabled={!canAdd || isPending}
      onClick={handleAddToCart}
    >
      {isPending
        ? "Adding..."
        : !canAdd
          ? hasMultipleVariants && !selectedVariant
            ? "Select an option"
            : "Out of Stock"
          : "Add to Cart"}
    </Button>
  )

  // No variants: stock + quantity + total + add to cart
  if (!hasVariants) {
    return (
      <div className="space-y-4">
        {stockIndicator}
        {quantitySelector}
        {totalDisplay}
        {addToCartButton}
      </div>
    )
  }

  // Has variants: variant selector + quantity + add to cart
  return (
    <div className="space-y-6">
      {hasMultipleVariants && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          productStock={productStock}
          masterStockOverrides={masterStockOverrides}
          onSelect={(id) => {
            setSelectedVariantId(id)
            setQuantity(1)
          }}
        />
      )}

      {selectedVariant && hasMultipleVariants && (
        <PriceDisplay price={selectedVariant.price} size="md" />
      )}

      {stockIndicator}
      {quantitySelector}
      {totalDisplay}
      {addToCartButton}
    </div>
  )
}
