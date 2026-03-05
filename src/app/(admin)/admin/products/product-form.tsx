"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createProduct, updateProduct } from "@/actions/products"
import Link from "next/link"

interface ProductFormProps {
  product?: {
    id: string
    name: string
    slug: string
    description: string | null
    shortDescription: string | null
    basePrice: number | string
    compareAtPrice: number | string | null
    costPrice: number | string | null
    sku: string | null
    stock: number
    isActive: boolean
    isFeatured: boolean
    categories: { categoryId: string }[]
  }
  categories: { id: string; name: string }[]
  masterSkuInfo?: { sku: string; name: string; availableStock: number } | null
}

export function ProductForm({ product, categories, masterSkuInfo }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const isEditing = !!product
  const [shortDesc, setShortDesc] = useState(product?.shortDescription || "")
  const [fullDesc, setFullDesc] = useState(product?.description || "")

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product!.id, formData)
        : await createProduct(formData)

      if (result?.error) {
        toast(result.error, "error")
      } else if (isEditing) {
        toast("Product updated!")
        router.refresh()
      }
      // createProduct redirects on success
    })
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Basic Info</h2>
        <Input
          label="Product Name"
          name="name"
          required
          defaultValue={product?.name}
        />
        <Input
          label="URL Slug"
          name="slug"
          defaultValue={product?.slug}
          placeholder="auto-generated from name"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Short Description</label>
          <input type="hidden" name="shortDescription" value={shortDesc} />
          <RichTextEditor content={shortDesc} onChange={setShortDesc} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full Description</label>
          <input type="hidden" name="description" value={fullDesc} />
          <RichTextEditor content={fullDesc} onChange={setFullDesc} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Pricing</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price ($)"
            name="basePrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? Number(product.basePrice) : ""}
          />
          <Input
            label="Compare at Price ($)"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice ? Number(product.compareAtPrice) : ""}
            placeholder="Optional"
          />
          <Input
            label="Cost Price ($)"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.costPrice ? Number(product.costPrice) : ""}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Organization</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU"
            name="sku"
            defaultValue={product?.sku || ""}
            placeholder="Optional"
          />
          {masterSkuInfo ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Stock</label>
              <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <p>Managed by Master SKU: <span className="font-mono font-medium">{masterSkuInfo.sku}</span></p>
                <p className="text-secondary">Available: {masterSkuInfo.availableStock}</p>
              </div>
              <input type="hidden" name="stock" value={product?.stock ?? 0} />
            </div>
          ) : (
            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product?.stock ?? 0}
              description="Used when no variants are defined"
            />
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            name="categoryId"
            defaultValue={product?.categories[0]?.categoryId || ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product?.isActive ?? true}
              className="h-4 w-4 rounded border-border"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="h-4 w-4 rounded border-border"
            />
            Featured
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        <Link href="/admin/products">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
