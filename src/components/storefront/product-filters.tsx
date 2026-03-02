"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface ProductFiltersProps {
  categories: { slug: string; name: string }[]
  currentCategory?: string
  currentMinPrice?: string
  currentMaxPrice?: string
  basePath?: string
}

export function ProductFilters({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
  basePath = "/products",
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(currentMinPrice || "")
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || "")
  const [category, setCategory] = useState(currentCategory || "")

  const hasFilters = currentCategory || currentMinPrice || currentMaxPrice

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("minPrice", minPrice)
    else params.delete("minPrice")
    if (maxPrice) params.set("maxPrice", maxPrice)
    else params.delete("maxPrice")
    if (category) params.set("category", category)
    else params.delete("category")
    router.push(`${basePath}?${params.toString()}`)
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("category")
    setMinPrice("")
    setMaxPrice("")
    setCategory("")
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">Min Price</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="$0"
          min="0"
          step="0.01"
          className="h-9 w-24 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">Max Price</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="$999"
          min="0"
          step="0.01"
          className="h-9 w-24 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
        />
      </div>
      <button
        type="button"
        onClick={applyFilters}
        className="h-9 rounded-[var(--radius)] bg-[var(--color-button-bg)] px-4 text-sm font-medium text-[var(--color-button-text)]"
      >
        Filter
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="h-9 text-sm text-secondary hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  )
}
