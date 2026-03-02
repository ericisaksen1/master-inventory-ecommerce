"use client"

import { useState } from "react"
import { BlogPostCard, type BlogPost, type BlogCardStyle } from "./blog-post-card"
import { cn } from "@/lib/utils"

export type BlogLayout = "standard" | "compact" | "spacious" | "list"

const gridClasses: Record<BlogLayout, string> = {
  standard: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  compact: "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  spacious: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
  list: "grid grid-cols-1 gap-4",
}

interface BlogGridProps {
  posts: BlogPost[]
  layout?: BlogLayout
  perPage?: number
  cardStyle?: BlogCardStyle
  showAuthor?: boolean
  showDate?: boolean
  showExcerpt?: boolean
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("...")

  pages.push(total)
  return pages
}

export function BlogGrid({ posts, layout = "standard", perPage = 9, cardStyle, showAuthor, showDate, showExcerpt }: BlogGridProps) {
  const [page, setPage] = useState(1)

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-secondary">No posts found.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(posts.length / perPage)
  const safePage = Math.min(page, totalPages)
  const paginated = posts.slice((safePage - 1) * perPage, safePage * perPage)
  const isList = layout === "list"

  return (
    <>
      <div className={gridClasses[layout]}>
        {paginated.map((post) => (
          <BlogPostCard key={post.slug} post={post} horizontal={isList} cardStyle={cardStyle} showAuthor={showAuthor} showDate={showDate} showExcerpt={showExcerpt} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>

          {getPageNumbers(safePage, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-secondary">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  p === safePage
                    ? "bg-primary text-white"
                    : "border border-border hover:bg-muted"
                )}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}
