"use client"

import { useState, useRef } from "react"
import { useToast } from "@/components/ui/toast"
import { ImagePickerModal } from "./image-picker-modal"

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  previewClass?: string
  accept?: string
  description?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  previewClass = "h-20 max-w-[160px] object-cover rounded",
  accept = "image/png,image/jpeg,image/webp",
  description,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState(value)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error || "Upload failed", "error")
        setPreview(value)
        return
      }

      onChange(data.url)
      setPreview(data.url)
      toast(`${label} uploaded!`)
    } catch {
      toast("Upload failed", "error")
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    onChange("")
    setPreview("")
    if (fileRef.current) fileRef.current.value = ""
  }

  function handlePickerSelect(url: string) {
    if (url) {
      onChange(url)
      setPreview(url)
    } else {
      handleRemove()
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {description && <p className="mb-2 text-xs text-gray-500">{description}</p>}

      {preview ? (
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className={previewClass} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-medium text-gray-600 hover:text-black"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs font-medium text-gray-600 hover:text-black"
            >
              Library
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-gray-400"
          >
            <div>
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-600">
                {uploading ? "Uploading..." : "Upload"}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-gray-400"
          >
            <div>
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-600">Media Library</p>
            </div>
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      <ImagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        currentUrl={preview}
      />
    </div>
  )
}
