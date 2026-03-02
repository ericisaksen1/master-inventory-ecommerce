import { prisma } from "@/lib/prisma"
import { BlogCategoryManager } from "./category-manager"
import { BlogAdminNav } from "../blog-admin-nav"

export const metadata = { title: "Blog Categories | Admin" }

export default async function BlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
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
        <BlogCategoryManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            postCount: c._count.posts,
          }))}
        />
      </div>
    </div>
  )
}
