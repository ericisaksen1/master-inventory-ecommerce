"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createBlogPost, updateBlogPost } from "@/actions/blog"
import { slugify } from "@/lib/utils"

interface PostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    featuredImage: string | null
    metaTitle: string | null
    metaDescription: string | null
    isPublished: boolean
    categoryIds: string[]
    tagIds: string[]
  }
  categories: { id: string; name: string }[]
  tags: { id: string; name: string }[]
}

export function PostForm({ post, categories, tags }: PostFormProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(post?.content || "")
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)
  const [slug, setSlug] = useState(post?.slug || "")
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(post?.categoryIds || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tagIds || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!slug && e.target.value) {
      setSlug(slugify(e.target.value))
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      setFeaturedImage(url)
    } catch {
      toast("Failed to upload image", "error")
    } finally {
      setUploading(false)
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(formData: FormData) {
    formData.set("content", content)
    formData.set("isPublished", isPublished.toString())
    formData.set("slug", slug)
    formData.set("featuredImage", featuredImage)
    formData.set("categoryIds", JSON.stringify(selectedCategories))
    formData.set("tagIds", JSON.stringify(selectedTags))

    startTransition(async () => {
      const result = post
        ? await updateBlogPost(post.id, formData)
        : await createBlogPost(formData)

      if (result?.error) {
        toast(result.error, "error")
      } else if (post) {
        toast("Post updated")
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-lg border border-border bg-background p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase text-secondary">Post Details</h2>
            <Input
              label="Post Title"
              name="title"
              required
              defaultValue={post?.title}
              onBlur={handleTitleBlur}
            />
            <Input
              label="URL Slug"
              name="slug_display"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              description={slug ? `Accessible at: /blog/${slug}` : "Auto-generated from title"}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                maxLength={500}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue={post?.excerpt || ""}
                placeholder="Brief summary shown in blog listings"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase text-secondary">Content</h2>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="rounded-lg border border-border bg-background p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase text-secondary">SEO</h2>
            <Input
              label="Meta Title (optional)"
              name="metaTitle"
              defaultValue={post?.metaTitle || ""}
              placeholder="Defaults to post title"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Meta Description (optional)</label>
              <textarea
                name="metaDescription"
                rows={2}
                maxLength={500}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue={post?.metaDescription || ""}
                placeholder="Brief description for search engines"
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase text-secondary">Status</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublished ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase text-secondary">Featured Image</h2>
            {featuredImage ? (
              <div className="space-y-3">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturedImage("")}
                  className="w-full"
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase text-secondary">Categories</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase text-secondary">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-primary text-white"
                        : "bg-muted text-secondary hover:text-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
