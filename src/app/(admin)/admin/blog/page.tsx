import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogAdminNav } from "./blog-admin-nav"

export const metadata = { title: "Blog | Admin" }

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: true } },
      author: { select: { name: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Link href="/admin/blog/new">
          <Button>Create Post</Button>
        </Link>
      </div>

      <div className="mt-4">
        <BlogAdminNav />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-secondary">No blog posts yet.</p>
            <p className="mt-1 text-xs text-secondary">Create your first blog post to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-secondary">Title</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Category</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Author</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Date</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-semibold hover:underline"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {post.categories.map((pc) => pc.category.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {post.author?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.isPublished ? "green" : "default"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
