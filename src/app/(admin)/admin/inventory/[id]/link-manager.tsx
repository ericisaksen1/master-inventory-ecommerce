"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { linkProductToMasterSku, unlinkFromMasterSku, updateLink } from "@/actions/inventory"

interface LinkData {
  id: string
  productId: string | null
  productName: string | null
  variantId: string | null
  variantName: string | null
  siteId: string | null
  siteName: string | null
  remoteRef: string | null
  quantityMultiplier: number
}

interface Product {
  id: string
  name: string
  variants: { id: string; name: string }[]
}

interface Site {
  id: string
  name: string
  domain: string
}

interface LinkManagerProps {
  masterSkuId: string
  links: LinkData[]
  products: Product[]
  sites: Site[]
}

export function LinkManager({ masterSkuId, links, products, sites }: LinkManagerProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Linked Products</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-primary hover:underline"
        >
          {showForm ? "Cancel" : "+ Link Product"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 border-b border-border pb-4">
          <LinkForm
            masterSkuId={masterSkuId}
            products={products}
            sites={sites}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}

      {links.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">No products linked yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {links.map((link) => (
            <LinkRow key={link.id} link={link} products={products} sites={sites} />
          ))}
        </div>
      )}
    </div>
  )
}

function LinkRow({ link, products, sites }: { link: LinkData; products: Product[]; sites: Site[] }) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isLocal = !!link.productId
  const label = isLocal
    ? link.variantName
      ? `${link.productName} — ${link.variantName}`
      : link.productName
    : `${link.siteName}: ${link.remoteRef}`

  // Edit state
  const linkedProduct = isLocal ? products.find((p) => p.id === link.productId) : null
  const [editVariantId, setEditVariantId] = useState(link.variantId || "")
  const [editMultiplier, setEditMultiplier] = useState(String(link.quantityMultiplier))
  const [editRemoteRef, setEditRemoteRef] = useState(link.remoteRef || "")

  function handleUnlink() {
    if (!confirm("Unlink this product from the master SKU?")) return
    startTransition(async () => {
      const result = await unlinkFromMasterSku(link.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Product unlinked!")
        router.refresh()
      }
    })
  }

  function handleSave() {
    startTransition(async () => {
      const data: { quantityMultiplier?: number; remoteRef?: string; variantId?: string | null } = {}
      const newMultiplier = parseInt(editMultiplier) || 1
      if (newMultiplier !== link.quantityMultiplier) data.quantityMultiplier = newMultiplier
      if (isLocal && editVariantId !== (link.variantId || "")) data.variantId = editVariantId || null
      if (!isLocal && editRemoteRef !== (link.remoteRef || "")) data.remoteRef = editRemoteRef

      if (Object.keys(data).length === 0) {
        setIsEditing(false)
        return
      }

      const result = await updateLink(link.id, data)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Link updated!")
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  function handleCancel() {
    setEditVariantId(link.variantId || "")
    setEditMultiplier(String(link.quantityMultiplier))
    setEditRemoteRef(link.remoteRef || "")
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="rounded-md border border-primary/50 bg-muted/50 px-3 py-3 text-sm">
        <div className="mb-2 text-xs font-semibold text-primary">Editing: {isLocal ? link.productName : link.siteName}</div>
        <div className="space-y-2">
          {isLocal && linkedProduct && linkedProduct.variants.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium">Variant</label>
              <select
                value={editVariantId}
                onChange={(e) => setEditVariantId(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Product level (all variants)</option>
                {linkedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {!isLocal && (
            <div>
              <label className="mb-1 block text-xs font-medium">Remote Reference</label>
              <input
                type="text"
                value={editRemoteRef}
                onChange={(e) => setEditRemoteRef(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium">Quantity Multiplier</label>
            <input
              type="number"
              min="1"
              value={editMultiplier}
              onChange={(e) => setEditMultiplier(e.target.value)}
              className="h-8 w-24 rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-secondary">
              Units consumed per 1 order quantity (e.g. 3 for a 3-pack)
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
      <div>
        <div className="font-medium">{label}</div>
        <div className="mt-0.5 flex gap-3 text-xs text-secondary">
          <span>{isLocal ? "Local" : "Remote"}</span>
          <span>x{link.quantityMultiplier} per unit</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-primary hover:underline"
        >
          Edit
        </button>
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
  masterSkuId,
  products,
  sites,
  onDone,
}: {
  masterSkuId: string
  products: Product[]
  sites: Site[]
  onDone: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const [linkType, setLinkType] = useState<"local" | "remote">("local")
  const [productId, setProductId] = useState("")
  const [variantId, setVariantId] = useState("")
  const [siteId, setSiteId] = useState("")
  const [remoteRef, setRemoteRef] = useState("")
  const [multiplier, setMultiplier] = useState("1")

  const selectedProduct = products.find((p) => p.id === productId)

  function handleSubmit() {
    startTransition(async () => {
      const result = await linkProductToMasterSku(masterSkuId, {
        ...(linkType === "local"
          ? { productId, variantId: variantId || undefined }
          : { siteId, remoteRef }),
        quantityMultiplier: parseInt(multiplier) || 1,
      })
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Product linked!")
        onDone()
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="radio"
            checked={linkType === "local"}
            onChange={() => setLinkType("local")}
            className="h-3.5 w-3.5"
          />
          Local Product
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="radio"
            checked={linkType === "remote"}
            onChange={() => setLinkType("remote")}
            className="h-3.5 w-3.5"
          />
          Remote Site
        </label>
      </div>

      {linkType === "local" ? (
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Product</label>
            <select
              value={productId}
              onChange={(e) => { setProductId(e.target.value); setVariantId("") }}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium">Variant (optional)</label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Link at product level</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Connected Site</label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select site...</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.domain})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Remote Reference</label>
            <input
              type="text"
              value={remoteRef}
              onChange={(e) => setRemoteRef(e.target.value)}
              placeholder="e.g. product ID or SKU on remote site"
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">Quantity Multiplier</label>
        <input
          type="number"
          min="1"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          className="h-8 w-24 rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-secondary">
          How many master units are consumed per 1 order quantity (e.g. 3 for a 3-pack)
        </p>
      </div>

      <Button size="sm" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Linking..." : "Link Product"}
      </Button>
    </div>
  )
}
