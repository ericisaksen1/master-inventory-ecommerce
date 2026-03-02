"use client"

import { useState } from "react"
import { BlogGrid, type BlogLayout } from "./blog-grid"
import type { BlogPost, BlogCardStyle } from "./blog-post-card"

interface Category {
  id: string
  name: string
  slug: string
}

interface BlogSearchProps {
  posts: BlogPost[]
  categories: Category[]
  children?: React.ReactNode
  layout?: BlogLayout
  cardStyle?: BlogCardStyle
  showAuthor?: boolean
  showDate?: boolean
  showExcerpt?: boolean
}

export function BlogSearch({ posts, categories, children, layout, cardStyle, showAuthor, showDate, showExcerpt }: BlogSearchProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = posts.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q)

    const matchesCategory =
      !activeCategory ||
      p.categories.some((c) => c.slug === activeCategory)

    return matchesQuery && matchesCategory
  })

  return (
    <>
      <div className="relative mt-6">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              activeCategory === null
                ? "bg-primary text-white"
                : "bg-muted text-secondary hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setActiveCategory(activeCategory === cat.slug ? null : cat.slug)
              }
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-white"
                  : "bg-muted text-secondary hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {children}

      <div className="mt-8">
        <BlogGrid key={`${query.trim()}-${activeCategory}`} posts={filtered} layout={layout} cardStyle={cardStyle} showAuthor={showAuthor} showDate={showDate} showExcerpt={showExcerpt} />
      </div>
    </>
  )
}
