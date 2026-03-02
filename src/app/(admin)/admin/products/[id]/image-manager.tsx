"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addProductImage, deleteProductImage } from "@/actions/products"

interface Image {
  id: string
  url: string
  alt: string | null
  isPrimary: boolean
}

interface ImageManagerProps {
  productId: string
  images: Image[]
}

export function ImageManager({ productId, images }: ImageManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [addMode, setAddMode] = useState<"upload" | "url">("upload")
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addProductImage(productId, formData)
      if (result?.error) {
        toast(result.error, "error")
      } else {
        toast("Image added!")
        setShowForm(false)
        router.refresh()
      }
    })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      if (!res.ok) {
        const data = await res.json()
        toast(data.error || "Upload failed", "error")
        return
      }
      const { url } = await res.json()

      // Now add to product images
      const formData = new FormData()
      formData.set("url", url)
      formData.set("alt", "")
      const result = await addProductImage(productId, formData)
      if (result?.error) {
        toast(result.error, "error")
      } else {
        toast("Image uploaded and added!")
        setShowForm(false)
        router.refresh()
      }
    } catch {
      toast("Upload failed", "error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return
    startTransition(async () => {
      const result = await deleteProductImage(imageId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Image deleted")
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Images ({images.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 border-b border-border pb-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setAddMode("upload")}
              className={`rounded px-3 py-1 text-xs font-medium ${
                addMode === "upload"
                  ? "bg-foreground text-background"
                  : "bg-muted text-secondary hover:bg-muted/80"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setAddMode("url")}
              className={`rounded px-3 py-1 text-xs font-medium ${
                addMode === "url"
                  ? "bg-foreground text-background"
                  : "bg-muted text-secondary hover:bg-muted/80"
              }`}
            >
              Enter URL
            </button>
          </div>

          {addMode === "upload" ? (
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-dashed border-border p-4 text-center">
                <p className="text-sm text-secondary">
                  {uploading ? "Uploading..." : "Choose an image file"}
                </p>
                <p className="mt-1 text-xs text-secondary">PNG, JPG, GIF, WebP. Max 2MB.</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <form action={handleAdd} className="space-y-3">
              <Input label="Image URL" name="url" required placeholder="https://..." />
              <Input label="Alt Text" name="alt" placeholder="Describe the image" />
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Adding..." : "Add Image"}
              </Button>
            </form>
          )}
        </div>
      )}

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">No images yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <img
                src={img.url}
                alt={img.alt || ""}
                className="h-24 w-full rounded object-cover"
              />
              {img.isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  Primary
                </span>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                disabled={isPending}
                className="absolute right-1 top-1 hidden rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white group-hover:block"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
