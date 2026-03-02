"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { updateMediaAlt, deleteMedia } from "@/actions/media"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface MediaItem {
  id: string
  url: string
  filename: string
  alt: string | null
  mimeType: string
  size: number
  createdAt: Date
}

interface MediaGridProps {
  initialMedia: MediaItem[]
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaGrid({ initialMedia }: MediaGridProps) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAlt, setEditAlt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (!res.ok) {
          const data = await res.json()
          toast(data.error || "Upload failed", "error")
          continue
        }
      }
      router.refresh()
      toast("Upload complete")
    } catch {
      toast("Upload failed", "error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSaveAlt(id: string) {
    try {
      await updateMediaAlt(id, editAlt)
      setMedia((prev) =>
        prev.map((m) => (m.id === id ? { ...m, alt: editAlt } : m))
      )
      setEditingId(null)
      toast("Alt text updated")
    } catch {
      toast("Failed to update alt text", "error")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return

    try {
      await deleteMedia(id)
      setMedia((prev) => prev.filter((m) => m.id !== id))
      toast("Image deleted")
    } catch {
      toast("Failed to delete image", "error")
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url)
    toast("URL copied to clipboard")
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <span className="text-sm text-gray-500">
          {media.length} {media.length === 1 ? "file" : "files"}
        </span>
      </div>

      {media.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No media uploaded yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Click "Upload Images" to get started.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded bg-gray-50">
                <Image
                  src={item.url}
                  alt={item.alt || item.filename}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-white"
                    title="Copy URL"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="truncate text-xs font-medium text-gray-700" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(item.size)}
                </p>
                {editingId === item.id ? (
                  <div className="mt-1 flex gap-1">
                    <input
                      type="text"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Alt text"
                      className="w-full rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveAlt(item.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveAlt(item.id)}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(item.id)
                      setEditAlt(item.alt || "")
                    }}
                    className="mt-1 truncate text-xs text-gray-400 hover:text-gray-600"
                    title={item.alt || "Click to add alt text"}
                  >
                    {item.alt || "Add alt text..."}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
