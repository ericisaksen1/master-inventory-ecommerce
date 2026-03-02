import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sanitizeHtml } from "@/lib/sanitize"
import { getSettings } from "@/lib/settings"
import { SetAdminEdit } from "@/components/storefront/admin-toolbar"
import { BlogPostCard } from "@/components/storefront/blog-post-card"
import type { BlogCardStyle } from "@/components/storefront/blog-post-card"
import { SocialShare } from "@/components/storefront/social-share"
import { JsonLd } from "@/components/storefront/json-ld"
import Link from "next/link"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true, excerpt: true, featuredImage: true },
  })

  if (!post) return { title: "Post Not Found" }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.featuredImage && { images: [post.featuredImage] }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const [post, settings] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        author: { select: { name: true } },
      },
    }),
    getSettings(["blog_card_style", "blog_show_author", "blog_show_date", "blog_show_excerpt"]),
  ])

  if (!post) notFound()

  const safeContent = sanitizeHtml(post.content)

  // Related posts: find posts sharing categories or tags
  const categoryIds = post.categories.map((pc) => pc.categoryId)
  const tagIds = post.tags.map((pt) => pt.tagId)

  let relatedPosts: {
    slug: string
    title: string
    excerpt: string | null
    featuredImage: string | null
    publishedAt: string | null
    categories: { name: string; slug: string }[]
    authorName: string | null
  }[] = []

  if (categoryIds.length > 0 || tagIds.length > 0) {
    const conditions: any[] = []
    if (categoryIds.length > 0) {
      conditions.push({ categories: { some: { categoryId: { in: categoryIds } } } })
    }
    if (tagIds.length > 0) {
      conditions.push({ tags: { some: { tagId: { in: tagIds } } } })
    }

    const rawRelated = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
        OR: conditions,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        categories: { include: { category: true } },
        author: { select: { name: true } },
      },
    })

    relatedPosts = rawRelated.map((p) => ({
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
  }

  const cardStyle = (settings.blog_card_style || "standard") as BlogCardStyle
  const showAuthor = settings.blog_show_author !== "false"
  const showDate = settings.blog_show_date !== "false"
  const showExcerpt = settings.blog_show_excerpt !== "false"

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.featuredImage || undefined,
    author: post.author?.name ? { "@type": "Person", name: post.author.name } : undefined,
    datePublished: post.publishedAt?.toISOString(),
    description: post.excerpt || undefined,
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />
      <SetAdminEdit href={`/admin/blog/${post.id}`} label="Edit Post" />

      <Link href="/blog" className="text-sm text-secondary hover:text-foreground">
        &larr; Back to Blog
      </Link>

      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.title}
          className="mt-6 aspect-[2/1] w-full rounded-lg object-cover"
        />
      )}

      <div className="mt-6 flex items-center gap-2 text-sm text-secondary">
        {post.categories.length > 0 && (
          <div className="flex gap-2">
            {post.categories.map((pc) => (
              <Link
                key={pc.category.slug}
                href={`/blog/category/${pc.category.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {pc.category.name}
              </Link>
            ))}
          </div>
        )}
        {post.categories.length > 0 && (post.author?.name || post.publishedAt) && (
          <span>&middot;</span>
        )}
        {post.author?.name && <span>{post.author.name}</span>}
        {post.author?.name && post.publishedAt && <span>&middot;</span>}
        {post.publishedAt && (
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        )}
      </div>

      <h1 className="mt-4 text-4xl font-bold">{post.title}</h1>

      <div
        className="prose prose-gray mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />

      {post.tags.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((pt) => (
              <Link
                key={pt.tag.slug}
                href={`/blog/tag/${pt.tag.slug}`}
                className="rounded-full bg-muted px-3 py-1 text-sm text-secondary hover:text-foreground"
              >
                {pt.tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <SocialShare url={`/blog/${slug}`} title={post.title} />
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-2xl font-bold">Related Posts</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((rp) => (
              <BlogPostCard
                key={rp.slug}
                post={rp}
                cardStyle={cardStyle}
                showAuthor={showAuthor}
                showDate={showDate}
                showExcerpt={showExcerpt}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
