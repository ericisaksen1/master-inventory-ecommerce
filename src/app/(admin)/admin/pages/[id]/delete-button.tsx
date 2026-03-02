"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { deletePage } from "@/actions/pages"

export function DeletePageButton({ pageId }: { pageId: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this page? This cannot be undone.")) return

    startTransition(async () => {
      const result = await deletePage(pageId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Page deleted")
        router.push("/admin/pages")
      }
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  )
}
