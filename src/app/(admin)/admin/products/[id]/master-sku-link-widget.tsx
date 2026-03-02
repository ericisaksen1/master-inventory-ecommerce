"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { linkProductToMasterSku, unlinkFromMasterSku } from "@/actions/inventory"

interface CurrentLink {
  id: string
  masterSkuId: string
  masterSku: string
  masterSkuName: string
  variantId: string | null
  quantityMultiplier: number
  availableStock: number
}

interface AvailableMasterSku {
  id: string
  sku: string
  name: string
}

interface Variant {
  id: string
  name: string
}

interface Props {
  productId: string
  variants: Variant[]
  currentLinks: CurrentLink[]
  availableMasterSkus: AvailableMasterSku[]
}

export function MasterSkuLinkWidget({ productId, variants, currentLinks, availableMasterSkus }: Props) {
  const [showForm, setShowForm] = useState(false)

  // Product-level link
  const productLink = currentLinks.find((l) => !l.variantId)

  // Variant-level links
  const variantLinks = currentLinks.filter((l) => l.variantId)

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Master Inventory</h2>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="text-xs text-primary hover:underline">
            + Link SKU
          </button>
        )}
      </div>

      {/* Product-level link */}
      {productLink && (
        <div className="mt-3">
          <LinkDisplay link={productLink} label="Product" />
        </div>
      )}

      {/* Variant-level links */}
      {variantLinks.length > 0 && (
        <div className="mt-3 space-y-2">
          {variantLinks.map((link) => {
            const variant = variants.find((v) => v.id === link.variantId)
            return (
              <LinkDisplay
                key={link.id}
                link={link}
                label={variant?.name ?? "Variant"}
              />
            )
          })}
        </div>
      )}

      {currentLinks.length === 0 && !showForm && (
        <p className="mt-3 text-xs text-secondary">
          Not linked to master inventory. Stock is managed locally.
        </p>
      )}

      {showForm && (
        <div className="mt-4 border-t border-border pt-4">
          <LinkForm
            productId={productId}
            variants={variants}
            availableMasterSkus={availableMasterSkus}
            existingLinks={currentLinks}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  )
}

function LinkDisplay({ link, label }: { link: CurrentLink; label: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleUnlink() {
    if (!confirm("Unlink from master SKU? Stock will revert to local management.")) return
    startTransition(async () => {
      const result = await unlinkFromMasterSku(link.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Unlinked from master SKU!")
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-secondary">{label}</p>
          <p className="text-sm font-medium">
            <span className="font-mono">{link.masterSku}</span>
            <span className="ml-1 font-normal text-secondary">{link.masterSkuName}</span>
          </p>
          <p className="mt-0.5 text-xs">
            Available: <span className={link.availableStock <= 0 ? "font-medium text-red-600" : link.availableStock <= 10 ? "text-amber-600" : "text-green-600"}>{link.availableStock}</span>
            {link.quantityMultiplier > 1 && (
              <span className="ml-2 text-secondary">x{link.quantityMultiplier} per unit</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleUnlink}
          disabled={isPending}
          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {isPending ? "..." : "Unlink"}
        </button>
      </div>
    </div>
  )
}

function LinkForm({
  productId,
  variants,
  availableMasterSkus,
  existingLinks,
  onDone,
}: {
  productId: string
  variants: Variant[]
  availableMasterSkus: AvailableMasterSku[]
  existingLinks: CurrentLink[]
  onDone: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const [masterSkuId, setMasterSkuId] = useState("")
  const [variantId, setVariantId] = useState("")
  const [multiplier, setMultiplier] = useState("1")

  function handleSubmit() {
    if (!masterSkuId) return

    startTransition(async () => {
      const result = await linkProductToMasterSku(masterSkuId, {
        productId,
        variantId: variantId || undefined,
        quantityMultiplier: parseInt(multiplier) || 1,
      })
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Linked to master SKU!")
        onDone()
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium">Master SKU</label>
        <select
          value={masterSkuId}
          onChange={(e) => setMasterSkuId(e.target.value)}
          className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select master SKU...</option>
          {availableMasterSkus.map((m) => (
            <option key={m.id} value={m.id}>{m.sku} — {m.name}</option>
          ))}
        </select>
      </div>

      {variants.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium">Apply to</label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Entire product</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">Qty Multiplier</label>
        <input
          type="number"
          min="1"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          className="h-8 w-24 rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-0.5 text-xs text-secondary">Master units consumed per 1 ordered</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !masterSkuId}>
          {isPending ? "Linking..." : "Link"}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  )
}
