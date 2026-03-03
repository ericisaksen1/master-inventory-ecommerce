"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { deleteStack } from "@/actions/stacks"

export function DeleteStackButton({ stackId, stackName }: { stackId: string; stackName: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  function handleDelete() {
    if (!confirm(`Delete "${stackName}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteStack(stackId)
      if (result.success) {
        toast("Stack deleted")
        router.push("/admin/stacks")
      } else {
        toast(result.error || "Failed to delete", "error")
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleDelete} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50">
      {isPending ? "Deleting..." : "Delete Stack"}
    </Button>
  )
}
