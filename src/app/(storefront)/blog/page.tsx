import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { BlogSearch } from "@/components/storefront/blog-search"
import type { BlogLayout } from "@/components/storefront/blog-grid"
import type { BlogCardStyle } from "@/components/storefront/blog-post-card"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Blog" }

export default async function BlogPage() {
  const settings = await getSettings(["blog_layout", "blog_card_style", "blog_show_author", "blog_show_date", "blog_show_excerpt"])
  const blogLayout = (settings.blog_layout || "standard") as BlogLayout
  const cardStyle = (settings.blog_card_style || "standard") as BlogCardStyle
  const showAuthor = settings.blog_show_author !== "false"
  const showDate = settings.blog_show_date !== "false"
  const showExcerpt = settings.blog_show_excerpt !== "false"

  const rawPosts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      categories: { include: { category: true } },
      author: { select: { name: true } },
    },
  })

  const posts = rawPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    featuredImage: p.featuredImage,
    publishedAt: p.publishedAt?.toISOString() || null,
    categories: p.categories.map((pc) => ({
      name: pc.category.name,
      slug: pc.category.slug,
    })),
    authorName: p.author?.name || null,
  }))

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  })

  const activeCategories = categories
    .filter((c) => c._count.posts > 0)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))

  return (
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <BlogSearch posts={posts} categories={activeCategories} layout={blogLayout} cardStyle={cardStyle} showAuthor={showAuthor} showDate={showDate} showExcerpt={showExcerpt} />
    </div>
  )
}
