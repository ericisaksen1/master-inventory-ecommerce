"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SortSelect({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name: A-Z</option>
    </select>
  )
}
