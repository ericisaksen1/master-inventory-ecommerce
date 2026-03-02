import { prisma } from "@/lib/prisma"
import { SiteManager } from "./site-manager"

export const metadata = { title: "Connected Sites | Admin" }

export default async function ConnectedSitesPage() {
  const sites = await prisma.connectedSite.findMany({
    include: {
      _count: { select: { links: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Connected Sites</h1>
      <p className="mt-1 text-sm text-secondary">
        Manage external sites that share inventory through master SKUs.
      </p>
      <div className="mt-6">
        <SiteManager
          sites={sites.map((s) => ({
            id: s.id,
            name: s.name,
            domain: s.domain,
            apiKey: s.apiKey,
            isActive: s.isActive,
            linkedProducts: s._count.links,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
