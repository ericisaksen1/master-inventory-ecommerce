"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getMedia } from "@/actions/media"
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

interface ImagePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentUrl?: string
}

export function ImagePickerModal({ isOpen, onClose, onSelect, currentUrl }: ImagePickerModalProps) {
  const [tab, setTab] = useState<"library" | "upload">("library")
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setSelected(currentUrl || null)
      getMedia()
        .then(setMedia)
        .catch(() => toast("Failed to load media", "error"))
        .finally(() => setLoading(false))
    }
  }, [isOpen, currentUrl, toast])

  if (!isOpen) return null

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json()
        toast(data.error || "Upload failed", "error")
        return
      }
      const data = await res.json()
      // Refresh media list and auto-select
      const refreshed = await getMedia()
      setMedia(refreshed)
      setSelected(data.url)
      setTab("library")
      toast("Image uploaded")
    } catch {
      toast("Upload failed", "error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleConfirm() {
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Choose Image
          </h2>
          <button onClick={onClose} className="text-secondary hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          <button
            onClick={() => setTab("library")}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
              tab === "library"
                ? "border-foreground text-foreground"
                : "border-transparent text-secondary hover:text-foreground"
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
              tab === "upload"
                ? "border-foreground text-foreground"
                : "border-transparent text-secondary hover:text-foreground"
            }`}
          >
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "library" && (
            <>
              {loading ? (
                <p className="text-center text-secondary">Loading...</p>
              ) : media.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-secondary">No images in the library.</p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    size="sm"
                    onClick={() => setTab("upload")}
                  >
                    Upload an image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                  {media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item.url)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all ${
                        selected === item.url
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-border hover:border-secondary"
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={item.alt || item.filename}
                        fill
                        className="object-contain"
                        sizes="120px"
                      />
                      {selected === item.url && (
                        <div className="absolute right-1 top-1 rounded-full bg-foreground p-0.5">
                          <svg className="h-3 w-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "upload" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="mt-3 text-sm text-secondary">
                  {uploading ? "Uploading..." : "Click to choose a file"}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  PNG, JPG, GIF, WebP, SVG. Max 2MB.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-sm text-secondary">
            {selected ? (
              <span className="truncate">Selected: {selected}</span>
            ) : (
              "No image selected"
            )}
          </div>
          <div className="flex gap-2">
            {selected && (
              <Button variant="ghost" size="sm" onClick={() => { onSelect(""); onClose() }}>
                Remove Image
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={!selected}>
              Select Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
