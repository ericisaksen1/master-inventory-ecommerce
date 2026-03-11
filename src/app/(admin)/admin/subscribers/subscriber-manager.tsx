"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { deleteSubscriber, syncSubscribers } from "@/actions/subscribers"
import { Badge } from "@/components/ui/badge"

interface Subscriber {
  id: string
  email: string
  source: string
  createdAt: string
}

type SourceFilter = "all" | "newsletter" | "bulk_order" | "registration" | "contact" | "order"

const SOURCE_BADGE: Record<string, { label: string; variant: "default" | "purple" | "blue" | "green" | "indigo" }> = {
  newsletter: { label: "Newsletter", variant: "default" },
  bulk_order: { label: "Bulk Order", variant: "purple" },
  registration: { label: "Registration", variant: "blue" },
  contact: { label: "Contact Form", variant: "green" },
  order: { label: "Order", variant: "indigo" },
}

export function SubscriberManager({ subscribers }: { subscribers: Subscriber[] }) {
  const [isPending, startTransition] = useTransition()
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const router = useRouter()
  const [filter, setFilter] = useState<SourceFilter>("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let list = subscribers
    if (filter !== "all") {
      list = list.filter((s) => s.source === filter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((s) => s.email.toLowerCase().includes(q))
    }
    return list
  }, [subscribers, filter, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: subscribers.length }
    for (const s of subscribers) {
      c[s.source] = (c[s.source] || 0) + 1
    }
    return c
  }, [subscribers])

  function handleDelete(id: string) {
    if (!confirm("Delete this subscriber?")) return
    startTransition(async () => {
      await deleteSubscriber(id)
      router.refresh()
    })
  }

  function handleExport() {
    const rows = [["Email", "Source", "Date Joined"]]
    for (const s of filtered) {
      rows.push([s.email, s.source, new Date(s.createdAt).toLocaleDateString()])
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscribers-${filter}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const allSources: { key: SourceFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "newsletter", label: "Newsletter" },
    { key: "bulk_order", label: "Bulk Order" },
    { key: "registration", label: "Registration" },
    { key: "contact", label: "Contact" },
    { key: "order", label: "Order" },
  ]

  const tabs = allSources
    .filter((t) => t.key === "all" || (counts[t.key] || 0) > 0)
    .map((t) => ({ ...t, label: `${t.label} (${counts[t.key] || 0})` }))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Source filter tabs */}
        <div className="flex rounded-lg border border-border bg-muted p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />

        <div className="ml-auto flex items-center gap-2">
          {syncResult && (
            <span className="text-xs text-green-600">{syncResult}</span>
          )}
          {/* Sync */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setSyncResult(null)
              startTransition(async () => {
                const res = await syncSubscribers()
                if (res.success) {
                  setSyncResult(
                    res.added ? `${res.added} subscriber${res.added !== 1 ? "s" : ""} added` : "All synced"
                  )
                  router.refresh()
                }
              })
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary hover:bg-muted disabled:opacity-50"
          >
            {isPending ? "Syncing…" : "Sync"}
          </button>
          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary hover:bg-muted"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-12 text-center">
          <p className="text-sm text-secondary">No subscribers found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Source</th>
                <th className="px-4 py-3 text-left font-medium">Date Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const badge = SOURCE_BADGE[s.source] ?? { label: s.source, variant: "default" as const }
                return (
                  <tr key={s.id} className="hover:bg-muted">
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={isPending}
                        className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
