"use client"

import { cn } from "@/lib/utils"

interface Variant {
  id: string
  name: string
  price: any
  stock: number
  unitsPerItem?: number
  options: { name: string; value: string }[]
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariantId: string | null
  onSelect: (variantId: string) => void
  productStock?: number
  masterStockOverrides?: Record<string, number>
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  productStock = 0,
  masterStockOverrides,
}: VariantSelectorProps) {
  // Group variants by option name
  const optionGroups = new Map<string, Set<string>>()
  for (const variant of variants) {
    const options = variant.options as { name: string; value: string }[]
    for (const opt of options) {
      if (!optionGroups.has(opt.name)) {
        optionGroups.set(opt.name, new Set())
      }
      optionGroups.get(opt.name)!.add(opt.value)
    }
  }

  // If there's only one option group, show simple buttons
  // Otherwise show the first group as the primary selector
  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([optionName, values]) => (
        <div key={optionName}>
          <div className="flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              const matchingVariant = variants.find((v) => {
                const opts = v.options as { name: string; value: string }[]
                return opts.some(
                  (o) => o.name === optionName && o.value === value
                )
              })

              const isSelected =
                matchingVariant?.id === selectedVariantId
              const upi = matchingVariant?.unitsPerItem ?? 1
              const isOutOfStock = matchingVariant
                ? masterStockOverrides && matchingVariant.id in masterStockOverrides
                  ? masterStockOverrides[matchingVariant.id] <= 0
                  : upi > 1
                    ? Math.floor(productStock / upi) <= 0
                    : matchingVariant.stock <= 0
                : true

              return (
                <button
                  key={value}
                  onClick={() => matchingVariant && onSelect(matchingVariant.id)}
                  disabled={isOutOfStock}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground",
                    isOutOfStock && "cursor-not-allowed opacity-40"
                  )}
                >
                  {value}
                  {isOutOfStock && " (Sold out)"}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
