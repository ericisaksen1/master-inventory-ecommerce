"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createMasterSku, updateMasterSku } from "@/actions/inventory"
import Link from "next/link"

interface MasterSkuFormProps {
  masterSku?: {
    id: string
    sku: string
    name: string
    description: string | null
    stock: number
    isActive: boolean
  }
}

export function MasterSkuForm({ masterSku }: MasterSkuFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const isEditing = !!masterSku

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateMasterSku(masterSku!.id, formData)
        : await createMasterSku(formData)

      if (result?.error) {
        toast(result.error, "error")
      } else if (isEditing) {
        toast("Master SKU updated!")
        router.refresh()
      }
      // createMasterSku redirects on success
    })
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Master SKU Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU Code"
            name="sku"
            required
            defaultValue={masterSku?.sku}
            placeholder="e.g. MSKU-PT141-10MG"
            className="uppercase"
          />
          <Input
            label="Name"
            name="name"
            required
            defaultValue={masterSku?.name}
            placeholder="e.g. PT-141 10mg Vial"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            defaultValue={masterSku?.description || ""}
            placeholder="Optional notes about this master SKU"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-sm font-semibold">Inventory</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={masterSku?.stock ?? 0}
            description="Total physical inventory for this SKU"
          />
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={masterSku?.isActive ?? true}
                className="h-4 w-4 rounded border-border"
              />
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Master SKU" : "Create Master SKU"}
        </Button>
        <Link href="/admin/inventory">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
