import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sanitizeHtml } from "@/lib/sanitize"
import { PageComponents } from "@/components/storefront/page-components"
import { SetAdminEdit } from "@/components/storefront/admin-toolbar"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true },
  })

  if (!page) return { title: "Page Not Found" }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params

  const page = await prisma.page.findUnique({
    where: { slug, isActive: true },
  })

  if (!page) notFound()

  const safeContent = sanitizeHtml(page.content)

  return (
    <>
      <SetAdminEdit href={`/admin/pages/${page.id}`} label="Edit Page" />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{page.title}</h1>
        <div
          className="prose prose-gray mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </div>
      <PageComponents pageId={page.id} />
    </>
  )
}
