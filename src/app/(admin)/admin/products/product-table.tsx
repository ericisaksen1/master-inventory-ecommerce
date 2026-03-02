"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { quickUpdateProduct } from "@/actions/products"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  basePrice: number
  stock: number
  isActive: boolean
  isFeatured: boolean
  imageUrl: string | null
  categoryId: string | null
  categoryName: string | null
  totalVariantStock: number
  hasVariants: boolean
}

interface Category {
  id: string
  name: string
}

interface ProductTableProps {
  products: Product[]
  categories: Category[]
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-border bg-background">
      {products.length === 0 ? (
        <div className="p-8 text-center text-secondary">No products yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                categories={categories}
                isEditing={editingId === product.id}
                onEdit={() => setEditingId(editingId === product.id ? null : product.id)}
                onClose={() => setEditingId(null)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ProductRow({
  product,
  categories,
  isEditing,
  onEdit,
  onClose,
}: {
  product: Product
  categories: Category[]
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
}) {
  const stock = product.hasVariants ? product.totalVariantStock : product.stock

  return (
    <>
      <tr className="group hover:bg-muted">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted" />
            )}
            <div>
              <Link
                href={`/admin/products/${product.id}`}
                className="font-medium hover:underline"
              >
                {product.name}
              </Link>
              <div className="mt-0.5 flex gap-2 text-xs">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-secondary hover:text-foreground"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-secondary hover:text-foreground"
                >
                  {isEditing ? "Close Quick Edit" : "Quick Edit"}
                </button>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-secondary">
          {product.sku || "—"}
        </td>
        <td className="px-4 py-3">
          {formatCurrency(product.basePrice)}
        </td>
        <td className="px-4 py-3">{stock}</td>
        <td className="px-4 py-3 text-secondary">{product.categoryName || "—"}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <Badge color={product.isActive ? "green" : "red"}>
              {product.isActive ? "Active" : "Draft"}
            </Badge>
            {product.isFeatured && <Badge color="purple">Featured</Badge>}
          </div>
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="border-t border-border bg-muted/50 px-4 py-4">
            <QuickEditForm
              product={product}
              categories={categories}
              onClose={onClose}
            />
          </td>
        </tr>
      )}
    </>
  )
}

function QuickEditForm({
  product,
  categories,
  onClose,
}: {
  product: Product
  categories: Category[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const [price, setPrice] = useState(product.basePrice.toString())
  const [stock, setStock] = useState(product.stock.toString())
  const [categoryId, setCategoryId] = useState(product.categoryId || "")
  const [isActive, setIsActive] = useState(product.isActive)
  const [isFeatured, setIsFeatured] = useState(product.isFeatured)

  function handleSave() {
    startTransition(async () => {
      const result = await quickUpdateProduct(product.id, {
        basePrice: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        categoryId: categoryId || null,
        isActive,
        isFeatured,
      })
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Product updated!")
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">
            Stock {product.hasVariants && <span className="text-secondary">(product-level)</span>}
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-4 pb-0.5">
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            Active
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            Featured
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Update"}
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
