import { prisma } from "@/lib/prisma"
import { SiteManager } from "./site-manager"

export const metadata = { title: "Connected Sites | Admin" }

export default async function ConnectedSitesPage() {
  const [sites, totalMasterSkus, linkedCount] = await Promise.all([
    prisma.connectedSite.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.masterSku.count({ where: { isActive: true } }),
    prisma.masterSku.count({
      where: {
        isActive: true,
        productLinks: { some: { siteId: null, productId: { not: null } } },
      },
    }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold">Connected Sites</h1>
      <p className="mt-1 text-sm text-secondary">
        Manage external sites that share inventory through master SKUs.
      </p>
      <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <p className="text-sm">
          <span className="font-medium">{linkedCount}</span> of{" "}
          <span className="font-medium">{totalMasterSkus}</span> master SKUs linked to local products
        </p>
      </div>
      <div className="mt-6">
        <SiteManager
          sites={sites.map((s) => ({
            id: s.id,
            name: s.name,
            domain: s.domain,
            apiKey: s.apiKey,
            apiUrl: s.apiUrl || "",
            isActive: s.isActive,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
