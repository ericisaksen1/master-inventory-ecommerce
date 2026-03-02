import { prisma } from "@/lib/prisma"
import { PostForm } from "../post-form"

export const metadata = { title: "New Post | Admin" }

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold">Create Post</h1>
      <div className="mt-6">
        <PostForm categories={categories} tags={tags} />
      </div>
    </div>
  )
}
