"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  commissionRate: number | null
  isActive: boolean
}

interface CategoryActionsProps {
  categories: Category[]
  editingCategory?: Category | null
  onCancelEdit?: () => void
}

export function CategoryActions({ categories, editingCategory, onCancelEdit }: CategoryActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const isEditing = !!editingCategory

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateCategory(editingCategory!.id, formData)
        if (result?.error) {
          toast(result.error, "error")
        } else {
          toast("Category updated!")
          onCancelEdit?.()
          router.refresh()
        }
      } else {
        const result = await createCategory(formData)
        if (result?.error) {
          toast(result.error, "error")
        } else {
          toast("Category created!")
          router.refresh()
        }
      }
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {isEditing ? `Edit: ${editingCategory.name}` : "Add Category"}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-gray-500 hover:text-black"
          >
            Cancel
          </button>
        )}
      </div>
      <form action={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Name"
          name="name"
          required
          defaultValue={editingCategory?.name || ""}
          key={editingCategory?.id || "new"}
        />
        <Input
          label="Slug"
          name="slug"
          placeholder="auto-generated from name"
          defaultValue={editingCategory?.slug || ""}
          key={`slug-${editingCategory?.id || "new"}`}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={editingCategory?.description || ""}
            key={`desc-${editingCategory?.id || "new"}`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Parent Category</label>
          <select
            name="parentId"
            defaultValue={editingCategory?.parentId || ""}
            key={`parent-${editingCategory?.id || "new"}`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">None (top level)</option>
            {categories
              .filter((cat) => cat.id !== editingCategory?.id)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
          </select>
        </div>
        <Input
          label="Commission Rate Override (%)"
          name="commissionRate"
          type="number"
          step="0.5"
          min="0"
          max="100"
          placeholder="Leave blank for default"
          defaultValue={editingCategory?.commissionRate?.toString() || ""}
          key={`rate-${editingCategory?.id || "new"}`}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={editingCategory ? editingCategory.isActive : true}
            key={`active-${editingCategory?.id || "new"}`}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing ? "Updating..." : "Creating..."
            : isEditing ? "Update Category" : "Create Category"
          }
        </Button>
      </form>
    </div>
  )
}

interface CategoryRowActionsProps {
  category: Category
  productCount: number
  onEdit: () => void
}

export function CategoryRowActions({ category, productCount, onEdit }: CategoryRowActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Category deleted!")
        router.refresh()
      }
      setShowConfirm(false)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-medium text-red-600 hover:text-red-800"
        >
          {isPending ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-xs text-gray-500 hover:text-black"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="text-xs text-gray-500 hover:text-black"
      >
        Edit
      </button>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-gray-500 hover:text-red-600"
        title={productCount > 0 ? "Has products assigned" : "Delete category"}
      >
        Delete
      </button>
    </div>
  )
}
