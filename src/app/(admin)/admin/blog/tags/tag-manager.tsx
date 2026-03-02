"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createBlogTag, deleteBlogTag } from "@/actions/blog"

interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
}

export function BlogTagManager({ tags }: { tags: Tag[] }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createBlogTag(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Tag created")
        router.refresh()
      }
    })
  }

  function handleDelete(tagId: string) {
    if (!confirm("Delete this tag? It will be removed from all posts.")) return
    startTransition(async () => {
      const result = await deleteBlogTag(tagId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Tag deleted")
        router.refresh()
      }
    })
  }

  return (
    <>
      <form action={handleCreate} className="flex gap-3">
        <Input name="name" placeholder="New tag name" required className="flex-1" />
        <Button type="submit" disabled={isPending}>Add</Button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary">No tags yet.</div>
        ) : (
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-secondary">({tag.postCount})</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    className="ml-1 text-secondary hover:text-red-500"
                    disabled={isPending}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
