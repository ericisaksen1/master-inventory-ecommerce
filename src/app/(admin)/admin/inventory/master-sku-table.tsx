"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { quickUpdateMasterSku, deleteMasterSku } from "@/actions/inventory"

interface MasterSku {
  id: string
  sku: string
  name: string
  stock: number
  linkedProducts: number
  isActive: boolean
}

export function MasterSkuTable({ masterSkus }: { masterSkus: MasterSku[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-border bg-background">
      {masterSkus.length === 0 ? (
        <div className="p-8 text-center text-secondary">No master SKUs yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Links</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {masterSkus.map((sku) => (
              <MasterSkuRow
                key={sku.id}
                sku={sku}
                isEditing={editingId === sku.id}
                onEdit={() => setEditingId(editingId === sku.id ? null : sku.id)}
                onClose={() => setEditingId(null)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function MasterSkuRow({
  sku,
  isEditing,
  onEdit,
  onClose,
}: {
  sku: MasterSku
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
}) {
  return (
    <>
      <tr className="group hover:bg-muted">
        <td className="px-4 py-3 font-mono text-xs font-medium">
          <Link href={`/admin/inventory/${sku.id}`} className="hover:underline">
            {sku.sku}
          </Link>
        </td>
        <td className="px-4 py-3">
          <div>
            <Link href={`/admin/inventory/${sku.id}`} className="font-medium hover:underline">
              {sku.name}
            </Link>
            <div className="mt-0.5 flex gap-2 text-xs">
              <Link href={`/admin/inventory/${sku.id}`} className="text-secondary hover:text-foreground">
                Edit
              </Link>
              <button type="button" onClick={onEdit} className="text-secondary hover:text-foreground">
                {isEditing ? "Close Quick Edit" : "Quick Edit"}
              </button>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={sku.stock <= 0 ? "font-medium text-red-600" : sku.stock <= 10 ? "text-amber-600" : ""}>
            {sku.stock}
          </span>
        </td>
        <td className="px-4 py-3 text-secondary">{sku.linkedProducts}</td>
        <td className="px-4 py-3">
          <Badge color={sku.isActive ? "green" : "red"}>
            {sku.isActive ? "Active" : "Inactive"}
          </Badge>
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={5} className="border-t border-border bg-muted/50 px-4 py-4">
            <QuickEditForm sku={sku} onClose={onClose} />
          </td>
        </tr>
      )}
    </>
  )
}

function QuickEditForm({ sku, onClose }: { sku: MasterSku; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const [name, setName] = useState(sku.name)
  const [stock, setStock] = useState(sku.stock.toString())
  const [isActive, setIsActive] = useState(sku.isActive)

  function handleSave() {
    startTransition(async () => {
      const result = await quickUpdateMasterSku(sku.id, {
        name,
        stock: parseInt(stock) || 0,
        isActive,
      })
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Master SKU updated!")
        onClose()
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this master SKU?")) return
    startTransition(async () => {
      const result = await deleteMasterSku(sku.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Master SKU deleted!")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Update"}
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button size="sm" variant="outline" onClick={handleDelete} disabled={isPending} className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700">
          Delete
        </Button>
      </div>
    </div>
  )
}
