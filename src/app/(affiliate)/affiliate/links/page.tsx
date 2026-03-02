import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAffiliateStats } from "@/actions/affiliates"
import { prisma } from "@/lib/prisma"
import { AffiliateNav } from "@/components/affiliate/affiliate-nav"
import { CopyLinkButton } from "@/components/affiliate/copy-link-button"

export const metadata = { title: "Referral Links | Affiliate" }

export default async function AffiliateLinksPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const stats = await getAffiliateStats()
  if (!stats) redirect("/affiliate/apply")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Get popular products for quick link generation
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: { name: true, slug: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  })

  // Get categories for quick link generation
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  const links = [
    { label: "Homepage", url: `${baseUrl}/?ref=${stats.referralCode}` },
    { label: "All Products", url: `${baseUrl}/products?ref=${stats.referralCode}` },
    ...categories.map((c) => ({
      label: c.name,
      url: `${baseUrl}/categories/${c.slug}?ref=${stats.referralCode}`,
    })),
    ...products.map((p) => ({
      label: p.name,
      url: `${baseUrl}/products/${p.slug}?ref=${stats.referralCode}`,
    })),
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Referral Links</h1>
        <AffiliateNav />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background p-6">
        <h2 className="text-sm font-semibold">How Referral Links Work</h2>
        <p className="mt-2 text-sm text-secondary">
          Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">?ref={stats.referralCode}</code> to
          any page on the store. When someone clicks your link, a 30-day tracking cookie is set.
          Any purchases they make within that window earn you a {stats.commissionRate}% commission.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Quick Links</h2>
        <p className="mt-1 text-xs text-secondary">Click copy to grab a ready-to-share link.</p>

        <div className="mt-4 space-y-2">
          {links.map((link) => (
            <div
              key={link.url}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
            >
              <span className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="truncate text-xs text-secondary">{link.url}</p>
              </span>
              <CopyLinkButton link={link.url} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-muted p-6">
        <h2 className="text-sm font-semibold">Custom Links</h2>
        <p className="mt-1 text-sm text-secondary">
          You can also create links to any specific product or page. Just append your referral code
          to the URL:
        </p>
        <div className="mt-3 rounded-lg bg-background p-4">
          <code className="block text-sm text-foreground">
            {baseUrl}/<span className="text-secondary">any-page</span>?ref=<span className="font-semibold text-foreground">{stats.referralCode}</span>
          </code>
        </div>
      </div>
    </div>
  )
}
