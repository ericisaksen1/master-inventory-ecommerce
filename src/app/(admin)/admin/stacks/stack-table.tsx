"use client"

import Link from "next/link"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { toggleStackActive, deleteStack } from "@/actions/stacks"

interface Stack {
  id: string
  name: string
  slug: string
  isActive: boolean
  image: string | null
  productCount: number
  productNames: string[]
  firstProductImage: string | null
  createdAt: string
}

export function StackTable({ stacks }: { stacks: Stack[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleStackActive(id, isActive)
      router.refresh()
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteStack(id)
      if (result.success) {
        toast("Stack deleted")
        router.refresh()
      } else {
        toast(result.error || "Failed to delete", "error")
      }
    })
  }

  if (stacks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-12 text-center text-sm text-secondary">
        No stacks yet. Create one to bundle products together.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Image</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Products</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stacks.map((stack) => (
            <tr key={stack.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                {(stack.image || stack.firstProductImage) ? (
                  <img
                    src={stack.image || stack.firstProductImage!}
                    alt={stack.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted" />
                )}
              </td>
              <td className="px-4 py-3 font-medium">
                <Link href={`/admin/stacks/${stack.id}`} className="hover:underline">
                  {stack.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-secondary">
                {stack.productCount} {stack.productCount === 1 ? "product" : "products"}
                {stack.productNames.length > 0 && (
                  <p className="mt-0.5 text-xs text-secondary/70 truncate max-w-xs">
                    {stack.productNames.join(", ")}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(stack.id, !stack.isActive)}
                  disabled={isPending}
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    stack.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {stack.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/stacks/${stack.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(stack.id, stack.name)}
                    disabled={isPending}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
