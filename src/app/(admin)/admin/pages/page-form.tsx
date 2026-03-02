"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createPage, updatePage } from "@/actions/pages"
import { slugify } from "@/lib/utils"

interface PageFormProps {
  page?: {
    id: string
    title: string
    slug: string
    content: string
    metaTitle: string | null
    metaDescription: string | null
    isActive: boolean
  }
}

export function PageForm({ page }: PageFormProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(page?.content || "")
  const [isActive, setIsActive] = useState(page?.isActive ?? false)
  const [slug, setSlug] = useState(page?.slug || "")
  const { toast } = useToast()
  const router = useRouter()

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!slug && e.target.value) {
      setSlug(slugify(e.target.value))
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.set("content", content)
    formData.set("isActive", isActive.toString())
    formData.set("slug", slug)

    startTransition(async () => {
      const result = page
        ? await updatePage(page.id, formData)
        : await createPage(formData)

      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(page ? "Page updated" : "Page created")
        router.push("/admin/pages")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Page Details</h2>
        <Input
          label="Page Title"
          name="title"
          required
          defaultValue={page?.title}
          onBlur={handleTitleBlur}
        />
        <Input
          label="URL Slug"
          name="slug_display"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          description={slug ? `Accessible at: /${slug}` : "Auto-generated from title"}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Content</h2>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">SEO</h2>
        <Input
          label="Meta Title (optional)"
          name="metaTitle"
          defaultValue={page?.metaTitle || ""}
          placeholder="Defaults to page title"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Meta Description (optional)
          </label>
          <textarea
            name="metaDescription"
            rows={2}
            maxLength={500}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            defaultValue={page?.metaDescription || ""}
            placeholder="Brief description for search engines"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium">
          {isActive ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : page ? "Update Page" : "Create Page"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/pages")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
