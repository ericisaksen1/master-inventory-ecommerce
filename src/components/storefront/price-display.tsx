import { formatCurrency } from "@/lib/utils"

interface PriceDisplayProps {
  price: number | string
  compareAtPrice?: number | string | null
  size?: "sm" | "md" | "lg"
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
}: PriceDisplayProps) {
  const currentPrice = Number(price)
  const originalPrice = compareAtPrice ? Number(compareAtPrice) : null
  const isOnSale = originalPrice && originalPrice > currentPrice

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${sizeClasses[size]}`}>
        {formatCurrency(currentPrice)}
      </span>
      {isOnSale && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatCurrency(originalPrice)}
          </span>
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
            {Math.round((1 - currentPrice / originalPrice) * 100)}% off
          </span>
        </>
      )}
    </div>
  )
}
