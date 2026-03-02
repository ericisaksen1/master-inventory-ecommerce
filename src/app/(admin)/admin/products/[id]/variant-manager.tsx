"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createVariant, updateVariant, deleteVariant } from "@/actions/products"
import { formatCurrency } from "@/lib/utils"

interface Variant {
  id: string
  name: string
  sku: string | null
  price: number
  stock: number
  unitsPerItem: number
  options: unknown
  printfulVariantId: string | null
  compareAtPrice: number | null
}

interface VariantManagerProps {
  productId: string
  variants: Variant[]
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createVariant(productId, formData)
      if (result?.error) {
        toast(result.error, "error")
      } else {
        toast("Variant created!")
        setShowForm(false)
        router.refresh()
      }
    })
  }

  function handleUpdate(variantId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateVariant(variantId, formData)
      if (result?.error) {
        toast(result.error, "error")
      } else {
        toast("Variant updated!")
        setEditingId(null)
        router.refresh()
      }
    })
  }

  function handleDelete(variantId: string) {
    if (!confirm("Delete this variant?")) return
    startTransition(async () => {
      const result = await deleteVariant(variantId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Variant deleted")
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variants ({variants.length})</h3>
        <Button size="sm" variant="outline" onClick={() => { setShowForm(!showForm); setEditingId(null) }}>
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      {showForm && (
        <form action={handleCreate} className="mt-4 space-y-3 border-b border-border pb-4">
          <Input label="Name" name="name" required placeholder="e.g., Small" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Option Name" name="optionName" placeholder="e.g., Size" />
            <Input label="Option Value" name="optionValue" placeholder="e.g., S" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Input label="Price" name="price" type="number" step="0.01" min="0" required />
            <Input label="Stock" name="stock" type="number" min="0" defaultValue="0" />
            <Input label="Units per item" name="unitsPerItem" type="number" min="1" defaultValue="1" />
            <Input label="SKU" name="sku" placeholder="Optional" />
          </div>
          <p className="text-xs text-secondary">Units per item: how many stock units this variant consumes (e.g. 3 for a 3-pack)</p>
          <Input label="Printful Variant ID" name="printfulVariantId" placeholder="e.g., 4012_97 (optional)" />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Creating..." : "Create Variant"}
          </Button>
        </form>
      )}

      {variants.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">No variants yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {variants.map((v) => (
            <div key={v.id} className="py-2">
              {editingId === v.id ? (
                <form action={(fd) => handleUpdate(v.id, fd)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Name" name="name" defaultValue={v.name} required />
                    <Input label="SKU" name="sku" defaultValue={v.sku || ""} placeholder="Optional" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Input label="Price" name="price" type="number" step="0.01" min="0" defaultValue={v.price} required />
                    <Input label="Stock" name="stock" type="number" min="0" defaultValue={v.stock} />
                    <Input label="Units per item" name="unitsPerItem" type="number" min="1" defaultValue={v.unitsPerItem} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-secondary">
                      {formatCurrency(v.price)} &middot; Stock: {v.stock}
                      {v.unitsPerItem > 1 && ` · ${v.unitsPerItem} units/item`}
                      {v.sku && ` · ${v.sku}`}
                      {v.printfulVariantId && (
                        <span className="ml-1 inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                          Printful
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(v.id); setShowForm(false) }}
                      disabled={isPending}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={isPending}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
