import { prisma } from "@/lib/prisma"
import { BlogTagManager } from "./tag-manager"
import { BlogAdminNav } from "../blog-admin-nav"

export const metadata = { title: "Blog Tags | Admin" }

export default async function BlogTagsPage() {
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Blog</h1>

      <div className="mt-4">
        <BlogAdminNav />
      </div>

      <div className="mt-6 max-w-2xl">
        <BlogTagManager
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            postCount: t._count.posts,
          }))}
        />
      </div>
    </div>
  )
}
