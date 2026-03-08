"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import {
  createConnectedSite,
  updateConnectedSite,
  deleteConnectedSite,
  regenerateSiteApiKey,
  checkSiteLinks,
} from "@/actions/inventory"

interface SiteData {
  id: string
  name: string
  domain: string
  apiKey: string
  apiUrl: string
  isActive: boolean
  linkedProducts: number
  createdAt: string
}

export function SiteManager({ sites }: { sites: SiteData[] }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Site"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold">New Connected Site</h2>
          <AddSiteForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {sites.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-8 text-center text-secondary">
          No connected sites yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  )
}

function SiteCard({ site }: { site: SiteData }) {
  const [isPending, startTransition] = useTransition()
  const [showKey, setShowKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [linkResult, setLinkResult] = useState<{
    linked: number
    unlinked: string[]
    error?: string
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  function handleCopyKey() {
    navigator.clipboard.writeText(site.apiKey)
    toast("API key copied to clipboard!")
  }

  function handleRegenerateKey() {
    if (!confirm("Regenerate the API key? The site will need to be updated with the new key.")) return
    startTransition(async () => {
      const result = await regenerateSiteApiKey(site.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("API key regenerated!")
        router.refresh()
      }
    })
  }

  function handleCheckLinks() {
    setLinkResult(null)
    startTransition(async () => {
      const result = await checkSiteLinks(site.id)
      setLinkResult(result)
      if (result.error) {
        toast(result.error, "error")
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Delete ${site.name}? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteConnectedSite(site.id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Site deleted!")
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{site.name}</h3>
            <Badge color={site.isActive ? "green" : "red"}>
              {site.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-secondary">{site.domain}</p>
          {site.apiUrl && (
            <p className="mt-0.5 text-xs text-secondary">API: {site.apiUrl}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-primary hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* API Key Section */}
      <div className="mt-4 rounded-md border border-border bg-muted/50 p-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">API Key</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowKey(!showKey)} className="text-xs text-primary hover:underline">
              {showKey ? "Hide" : "Show"}
            </button>
            <button type="button" onClick={handleCopyKey} className="text-xs text-primary hover:underline">
              Copy
            </button>
            <button type="button" onClick={handleRegenerateKey} disabled={isPending} className="text-xs text-amber-600 hover:text-amber-700 disabled:opacity-50">
              Regenerate
            </button>
          </div>
        </div>
        <p className="mt-1 font-mono text-xs text-secondary">
          {showKey ? site.apiKey : site.apiKey.slice(0, 8) + "••••••••••••••••"}
        </p>
      </div>

      {/* Check Links */}
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={handleCheckLinks} disabled={isPending}>
          {isPending ? "Checking..." : "Check Links"}
        </Button>
        {linkResult && !linkResult.error && (
          <span className="text-sm text-secondary">
            <span className="font-medium text-foreground">{linkResult.linked}</span> linked
            {linkResult.unlinked.length > 0 && (
              <span className="text-amber-600"> / {linkResult.unlinked.length} unmatched</span>
            )}
          </span>
        )}
      </div>

      {/* Unmatched SKUs detail */}
      {linkResult && !linkResult.error && linkResult.unlinked.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-800">
            Unmatched SKUs (no master SKU found on this site):
          </p>
          <ul className="mt-1 space-y-0.5">
            {linkResult.unlinked.map((item) => (
              <li key={item} className="text-xs text-amber-700">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 border-t border-border pt-4">
          <EditSiteForm site={site} onDone={() => setIsEditing(false)} />
        </div>
      )}
    </div>
  )
}

function AddSiteForm({ onDone }: { onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createConnectedSite(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Site created! API key has been generated.")
        onDone()
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Site Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Enoch"
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Domain</label>
          <input
            type="text"
            name="domain"
            required
            placeholder="e.g. enoch.com"
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">API URL (optional)</label>
        <input
          type="text"
          name="apiUrl"
          placeholder="e.g. https://enoch.com/api/inventory"
          className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-0.5 text-xs text-secondary">Base URL for calling back to this site (used for link checking)</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Site"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function EditSiteForm({ site, onDone }: { site: SiteData; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateConnectedSite(site.id, formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Site updated!")
        onDone()
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Site Name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={site.name}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Domain</label>
          <input
            type="text"
            name="domain"
            required
            defaultValue={site.domain}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">API URL</label>
        <input
          type="text"
          name="apiUrl"
          defaultValue={site.apiUrl}
          placeholder="e.g. https://enoch.com/api/inventory"
          className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-0.5 text-xs text-secondary">Base URL for calling back to this site (used for link checking)</p>
      </div>
      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={site.isActive}
          className="h-3.5 w-3.5 rounded border-border"
        />
        Active
      </label>
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Update Site"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
