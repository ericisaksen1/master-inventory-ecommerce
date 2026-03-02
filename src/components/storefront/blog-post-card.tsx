import Link from "next/link"

export type BlogCardStyle = "standard" | "bordered" | "minimal" | "overlay"

export interface BlogPost {
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string | null
  categories: { name: string; slug: string }[]
  authorName: string | null
}

interface BlogPostCardProps {
  post: BlogPost
  horizontal?: boolean
  cardStyle?: BlogCardStyle
  showAuthor?: boolean
  showDate?: boolean
  showExcerpt?: boolean
}

function MetaLine({
  post,
  showAuthor = true,
  showDate = true,
}: {
  post: BlogPost
  showAuthor?: boolean
  showDate?: boolean
}) {
  const author = showAuthor ? post.authorName : null
  const date = showDate ? post.publishedAt : null

  if (!author && !date) return null

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
      {author && <span>{author}</span>}
      {author && date && <span>&middot;</span>}
      {date && (
        <time dateTime={date}>
          {new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      )}
    </div>
  )
}

export function BlogPostCard({
  post,
  horizontal,
  cardStyle = "standard",
  showAuthor = true,
  showDate = true,
  showExcerpt = true,
}: BlogPostCardProps) {
  // Horizontal layout (list view) — used by all styles when layout is "list"
  if (horizontal) {
    return (
      <article className="group flex gap-4 sm:gap-6">
        <Link href={`/blog/${post.slug}`} className="block shrink-0">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="h-28 w-40 rounded-lg object-cover transition-opacity group-hover:opacity-90 sm:h-32 sm:w-48"
            />
          ) : (
            <div className="h-28 w-40 rounded-lg bg-muted sm:h-32 sm:w-48" />
          )}
        </Link>
        <div className="flex flex-col justify-center">
          {post.categories.length > 0 && (
            <div className="flex gap-2">
              {post.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <Link href={`/blog/${post.slug}`} className="block">
            <h2 className="mt-1 text-lg font-semibold group-hover:underline">{post.title}</h2>
          </Link>
          {showExcerpt && post.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-secondary">{post.excerpt}</p>
          )}
          <MetaLine post={post} showAuthor={showAuthor} showDate={showDate} />
        </div>
      </article>
    )
  }

  // Overlay card style
  if (cardStyle === "overlay" && post.featuredImage) {
    return (
      <article className="group relative overflow-hidden rounded-lg">
        <Link href={`/blog/${post.slug}`}>
          <div className="relative aspect-[16/10]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {post.categories.length > 0 && (
                <div className="mb-1 flex gap-2">
                  {post.categories.map((cat) => (
                    <span key={cat.slug} className="text-xs font-medium opacity-90">
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-lg font-semibold">{post.title}</h2>
              {(showAuthor || showDate) && (
                <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
                  {showAuthor && post.authorName && <span>{post.authorName}</span>}
                  {showAuthor && post.authorName && showDate && post.publishedAt && <span>&middot;</span>}
                  {showDate && post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Minimal card style
  if (cardStyle === "minimal") {
    return (
      <article className="group">
        <Link href={`/blog/${post.slug}`} className="block">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="aspect-[16/10] w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
            />
          ) : null}
        </Link>

        {post.categories.length > 0 && (
          <div className={`flex gap-2 ${post.featuredImage ? "mt-3" : ""}`}>
            {post.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <Link href={`/blog/${post.slug}`} className="block">
          <h2 className="mt-2 text-lg font-semibold group-hover:underline">{post.title}</h2>
        </Link>

        {showExcerpt && post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-secondary">{post.excerpt}</p>
        )}

        <MetaLine post={post} showAuthor={showAuthor} showDate={showDate} />
      </article>
    )
  }

  // Bordered card style
  if (cardStyle === "bordered") {
    return (
      <article className="group overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-lg">
        <Link href={`/blog/${post.slug}`} className="block">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="aspect-[16/10] w-full bg-muted" />
          )}
        </Link>

        <div className="p-4">
          {post.categories.length > 0 && (
            <div className="flex gap-2">
              {post.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <Link href={`/blog/${post.slug}`} className="block">
            <h2 className="mt-2 text-lg font-semibold group-hover:underline">{post.title}</h2>
          </Link>

          {showExcerpt && post.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-secondary">{post.excerpt}</p>
          )}

          <MetaLine post={post} showAuthor={showAuthor} showDate={showDate} />
        </div>
      </article>
    )
  }

  // Standard card style (default)
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="aspect-[16/10] w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          <div className="aspect-[16/10] w-full rounded-lg bg-muted" />
        )}
      </Link>

      {post.categories.length > 0 && (
        <div className="mt-3 flex gap-2">
          {post.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="mt-2 text-lg font-semibold group-hover:underline">{post.title}</h2>
      </Link>

      {showExcerpt && post.excerpt && (
        <p className="mt-1 line-clamp-2 text-sm text-secondary">{post.excerpt}</p>
      )}

      <MetaLine post={post} showAuthor={showAuthor} showDate={showDate} />
    </article>
  )
}
