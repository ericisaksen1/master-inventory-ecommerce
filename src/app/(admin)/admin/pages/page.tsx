import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Pages | Admin" }

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-secondary">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>Create Page</Button>
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-secondary">No pages yet.</p>
            <p className="mt-1 text-xs text-secondary">
              Create your first page for content like About Us, Contact, etc.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-secondary">Title</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">URL</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Updated</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-semibold hover:underline"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={page.isActive ? "green" : "default"}>
                      {page.isActive ? "Published" : "Draft"}
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
