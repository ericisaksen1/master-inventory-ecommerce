"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/actions/blog"

interface Category {
  id: string
  name: string
  slug: string
  postCount: number
}

export function BlogCategoryManager({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createBlogCategory(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Category created")
        router.refresh()
      }
    })
  }

  function handleUpdate(categoryId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateBlogCategory(categoryId, formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Category updated")
        setEditingId(null)
        router.refresh()
      }
    })
  }

  function handleDelete(categoryId: string) {
    if (!confirm("Delete this category? Posts won't be deleted.")) return
    startTransition(async () => {
      const result = await deleteBlogCategory(categoryId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Category deleted")
        router.refresh()
      }
    })
  }

  return (
    <>
      <form action={handleCreate} className="flex gap-3">
        <Input name="name" placeholder="New category name" required className="flex-1" />
        <Button type="submit" disabled={isPending}>Add</Button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary">No categories yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-secondary">Name</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-secondary">Posts</th>
                <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <form
                        action={(formData) => handleUpdate(cat.id, formData)}
                        className="flex gap-2"
                      >
                        <Input name="name" defaultValue={cat.name} required className="h-8" />
                        <Button type="submit" size="sm" disabled={isPending}>Save</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <span className="font-medium">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{cat.slug}</td>
                  <td className="px-4 py-3 text-secondary">{cat.postCount}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId !== cat.id && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(cat.id)}
                          className="text-xs text-secondary hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                          disabled={isPending}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
