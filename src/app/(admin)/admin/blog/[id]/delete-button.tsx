"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { deleteBlogPost } from "@/actions/blog"

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return

    startTransition(async () => {
      const result = await deleteBlogPost(postId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Post deleted")
        router.push("/admin/blog")
      }
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  )
}
