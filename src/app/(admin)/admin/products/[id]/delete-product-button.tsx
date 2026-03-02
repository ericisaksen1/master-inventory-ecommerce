"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { deleteProduct } from "@/actions/products"

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return
    startTransition(async () => {
      const result = await deleteProduct(productId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Product deleted")
        router.push("/admin/products")
      }
    })
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete Product"}
    </Button>
  )
}
