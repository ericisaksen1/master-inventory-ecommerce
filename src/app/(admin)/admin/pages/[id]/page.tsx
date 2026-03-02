import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PageForm } from "../page-form"
import { DeletePageButton } from "./delete-button"
import { ComponentEditor } from "../../homepage/component-editor"
import { getPageComponents } from "@/actions/page-components"
import { getSettings } from "@/lib/settings"
import Link from "next/link"

const THEME_COLOR_KEYS = [
  "primary_color",
  "secondary_color",
  "accent_color",
  "background_color",
  "foreground_color",
  "muted_color",
  "border_color",
  "button_bg_color",
  "button_text_color",
]

export const metadata = { title: "Edit Page | Admin" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPagePage({ params }: Props) {
  const { id } = await params

  const [page, components, products, themeColors] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    getPageComponents(id),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    getSettings(THEME_COLOR_KEYS),
  ])
  if (!page) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pages" className="text-sm text-gray-500 hover:text-black">
        &larr; Back to Pages
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit: {page.title}</h1>
        <DeletePageButton pageId={page.id} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        URL: <span className="font-mono">/{page.slug}</span>
        {page.isActive && (
          <>
            {" "}&middot;{" "}
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View page
            </a>
          </>
        )}
      </p>
      <div className="mt-6">
        <PageForm
          page={{
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.content,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            isActive: page.isActive,
          }}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Components</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add prebuilt components below the page content.
        </p>
        <div className="mt-3">
          <ComponentEditor pageId={page.id} components={components} productOptions={products} themeColors={themeColors} />
        </div>
      </div>
    </div>
  )
}
