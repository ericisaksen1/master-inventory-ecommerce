import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { BlogGrid, type BlogLayout } from "@/components/storefront/blog-grid"
import type { BlogCardStyle } from "@/components/storefront/blog-post-card"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.blogTag.findUnique({
    where: { slug },
    select: { name: true },
  })

  if (!tag) return { title: "Tag Not Found" }
  return { title: `#${tag.name} — Blog` }
}

export default async function BlogTagPage({ params }: Props) {
  const { slug } = await params
  const settings = await getSettings(["blog_layout", "blog_card_style", "blog_show_author", "blog_show_date", "blog_show_excerpt"])
  const blogLayout = (settings.blog_layout || "standard") as BlogLayout
  const cardStyle = (settings.blog_card_style || "standard") as BlogCardStyle
  const showAuthor = settings.blog_show_author !== "false"
  const showDate = settings.blog_show_date !== "false"
  const showExcerpt = settings.blog_show_excerpt !== "false"

  const tag = await prisma.blogTag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { post: { isPublished: true } },
        include: {
          post: {
            include: {
              categories: { include: { category: true } },
              author: { select: { name: true } },
            },
          },
        },
        orderBy: { post: { publishedAt: "desc" } },
      },
    },
  })

  if (!tag) notFound()

  const posts = tag.posts.map((pt) => ({
    slug: pt.post.slug,
    title: pt.post.title,
    excerpt: pt.post.excerpt,
    featuredImage: pt.post.featuredImage,
    publishedAt: pt.post.publishedAt?.toISOString() || null,
    categories: pt.post.categories.map((c) => ({
      name: c.category.name,
      slug: c.category.slug,
    })),
    authorName: pt.post.author?.name || null,
  }))

  return (
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/blog" className="text-sm text-secondary hover:text-foreground">
        &larr; Back to Blog
      </Link>
      <h1 className="mt-4 text-3xl font-bold">#{tag.name}</h1>
      <p className="mt-1 text-sm text-secondary">
        {posts.length} post{posts.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-8">
        <BlogGrid posts={posts} layout={blogLayout} cardStyle={cardStyle} showAuthor={showAuthor} showDate={showDate} showExcerpt={showExcerpt} />
      </div>
    </div>
  )
}
