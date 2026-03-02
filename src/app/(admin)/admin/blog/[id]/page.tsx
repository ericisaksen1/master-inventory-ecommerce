import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PostForm } from "../post-form"
import { DeletePostButton } from "./delete-button"
import Link from "next/link"

export const metadata = { title: "Edit Post | Admin" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params

  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
      },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!post) notFound()

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-secondary hover:text-foreground">
        &larr; Back to Blog
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit: {post.title}</h1>
        <DeletePostButton postId={post.id} />
      </div>
      <p className="mt-1 text-sm text-secondary">
        URL: <span className="font-mono">/blog/{post.slug}</span>
        {post.isPublished && (
          <>
            {" "}&middot;{" "}
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View post
            </a>
          </>
        )}
      </p>
      <div className="mt-6">
        <PostForm
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            featuredImage: post.featuredImage,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            isPublished: post.isPublished,
            categoryIds: post.categories.map((c) => c.categoryId),
            tagIds: post.tags.map((t) => t.tagId),
          }}
          categories={categories}
          tags={tags}
        />
      </div>
    </div>
  )
}
