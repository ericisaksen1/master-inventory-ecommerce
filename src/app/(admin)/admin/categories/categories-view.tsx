"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CategoryActions, CategoryRowActions } from "./category-actions"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parentName: string | null
  commissionRate: number | null
  isActive: boolean
  productCount: number
}

interface CategoriesViewProps {
  categories: Category[]
}

export function CategoriesView({ categories }: CategoriesViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingCategory = editingId
    ? categories.find((c) => c.id === editingId) || null
    : null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Category List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold">All Categories ({categories.length})</h2>
        </div>
        {categories.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No categories yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-6 py-3 ${
                  editingId === cat.id ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-gray-500">
                    {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                    {cat.parentName && ` · Parent: ${cat.parentName}`}
                    {cat.commissionRate && ` · Commission: ${cat.commissionRate}%`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={cat.isActive ? "green" : "red"}>
                    {cat.isActive ? "Active" : "Hidden"}
                  </Badge>
                  <CategoryRowActions
                    category={cat}
                    productCount={cat.productCount}
                    onEdit={() => setEditingId(cat.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <CategoryActions
        categories={categories}
        editingCategory={editingCategory}
        onCancelEdit={() => setEditingId(null)}
      />
    </div>
  )
}
