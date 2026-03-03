"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { ImagePickerModal } from "@/components/admin/image-picker-modal"
import { createStack, updateStack } from "@/actions/stacks"
import Link from "next/link"

interface Product {
  id: string
  name: string
  basePrice: number
  imageUrl: string | null
}

interface StackItem {
  productId: string
  quantity: number
}

interface StackFormProps {
  stack?: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    isActive: boolean
    stackItems: StackItem[]
  }
  products: Product[]
}

export function StackForm({ stack, products }: StackFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const isEditing = !!stack

  const [selectedItems, setSelectedItems] = useState<StackItem[]>(
    stack?.stackItems || []
  )
  const [search, setSearch] = useState("")
  const [imageUrl, setImageUrl] = useState(stack?.image || "")
  const [imagePickerOpen, setImagePickerOpen] = useState(false)

  const selectedProductIds = selectedItems.map((i) => i.productId)

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) && !selectedProductIds.includes(p.id)
  )

  const selectedProducts = selectedItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...product, quantity: item.quantity } : null
    })
    .filter(Boolean) as (Product & { quantity: number })[]

  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.basePrice * p.quantity, 0)
  const totalUnits = selectedProducts.reduce((sum, p) => sum + p.quantity, 0)

  function addProduct(id: string) {
    setSelectedItems((prev) => [...prev, { productId: id, quantity: 1 }])
    setSearch("")
  }

  function removeProduct(id: string) {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== id))
  }

  function updateQuantity(productId: string, quantity: number) {
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
    )
  }

  function moveProduct(index: number, direction: -1 | 1) {
    const newItems = [...selectedItems]
    const target = index + direction
    if (target < 0 || target >= newItems.length) return
    ;[newItems[index], newItems[target]] = [newItems[target], newItems[index]]
    setSelectedItems(newItems)
  }

  function handleSubmit(formData: FormData) {
    formData.set("stackItems", JSON.stringify(selectedItems))
    formData.set("image", imageUrl)
    startTransition(async () => {
      const result = isEditing
        ? await updateStack(stack!.id, formData)
        : await createStack(formData)

      if (result?.error) {
        toast(result.error, "error")
      } else if (isEditing) {
        toast("Stack updated!")
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Basic Info</h2>
        <Input
          label="Stack Name"
          name="name"
          required
          defaultValue={stack?.name}
        />
        <Input
          label="URL Slug"
          name="slug"
          defaultValue={stack?.slug}
          placeholder="auto-generated from name"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            defaultValue={stack?.description || ""}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Stack Image</label>
          {imageUrl ? (
            <div className="flex items-center gap-3">
              <img src={imageUrl} alt="Stack image" className="h-16 w-16 rounded object-cover border border-border" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setImagePickerOpen(true)}>
                  Change
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setImagePickerOpen(true)}>
              Choose Image
            </Button>
          )}
          <p className="mt-1 text-xs text-secondary">Optional — falls back to first product image</p>
        </div>
        <ImagePickerModal
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={(url) => setImageUrl(url)}
          currentUrl={imageUrl || undefined}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={stack?.isActive ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Active
        </label>
      </div>

      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Products in Stack</h2>
          {selectedProducts.length > 0 && (
            <span className="text-sm text-secondary">
              {totalUnits} {totalUnits === 1 ? "unit" : "units"} &mdash; ${totalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Selected products */}
        {selectedProducts.length > 0 ? (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 rounded-md border border-border p-2">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}
                <span className="flex-1 text-sm font-medium">{product.name}</span>
                <input
                  type="number"
                  min={1}
                  value={product.quantity}
                  onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                  className="w-14 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                />
                <span className="text-sm text-secondary w-16 text-right">${(product.basePrice * product.quantity).toFixed(2)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveProduct(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-secondary hover:bg-muted disabled:opacity-30"
                  >
                    &#9650;
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, 1)}
                    disabled={index === selectedProducts.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-secondary hover:bg-muted disabled:opacity-30"
                  >
                    &#9660;
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No products added yet.</p>
        )}

        {/* Product search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to add..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && filteredProducts.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg">
              {filteredProducts.slice(0, 10).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded bg-muted" />
                  )}
                  <span className="flex-1">{product.name}</span>
                  <span className="text-secondary">${product.basePrice.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || selectedItems.length === 0}>
          {isPending ? "Saving..." : isEditing ? "Update Stack" : "Create Stack"}
        </Button>
        <Link href="/admin/stacks">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
