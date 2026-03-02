import Link from "next/link"
import { BlogPostCard, type BlogPost, type BlogCardStyle } from "./blog-post-card"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, linkColorProps } from "@/lib/component-colors"

interface RecentBlogPostsProps extends ComponentColorProps {
  heading: string
  posts: BlogPost[]
  showViewAll: boolean
  cardStyle?: BlogCardStyle
  showAuthor?: boolean
  showDate?: boolean
  showExcerpt?: boolean
}

export function RecentBlogPosts({
  heading,
  posts,
  showViewAll,
  cardStyle,
  showAuthor,
  showDate,
  showExcerpt,
  bgColor,
  headlineColor,
  linkColor,
  linkHoverColor,
}: RecentBlogPostsProps) {
  if (posts.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground" style={headlineColorStyle(headlineColor)}>{heading}</h2>
        {showViewAll && (
          <Link
            href="/blog"
            className="text-sm font-medium text-secondary hover:text-primary"
            {...linkColorProps(linkColor, linkHoverColor)}
          >
            View all
          </Link>
        )}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            cardStyle={cardStyle}
            showAuthor={showAuthor}
            showDate={showDate}
            showExcerpt={showExcerpt}
          />
        ))}
      </div>
      </div>
    </section>
  )
}
