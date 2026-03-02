import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MasterSkuForm } from "../master-sku-form"
import { LinkManager } from "./link-manager"
import Link from "next/link"
import { getAvailableStock } from "@/lib/master-inventory"

interface Props {
  params: Promise<{ id: string }>
}

export default async function MasterSkuDetailPage({ params }: Props) {
  const { id } = await params

  const masterSku = await prisma.masterSku.findUnique({
    where: { id },
    include: {
      productLinks: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
          variant: { select: { id: true, name: true } },
          site: { select: { id: true, name: true, domain: true } },
        },
      },
    },
  })

  if (!masterSku) notFound()

  const available = await getAvailableStock(masterSku.id)

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      variants: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  })

  const sites = await prisma.connectedSite.findMany({
    where: { isActive: true },
    select: { id: true, name: true, domain: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/inventory" className="text-sm text-secondary hover:text-foreground">
            &larr; Back to Master SKUs
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            <span className="font-mono">{masterSku.sku}</span>
            <span className="ml-2 text-lg font-normal text-secondary">{masterSku.name}</span>
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Available: <span className={available <= 0 ? "font-medium text-red-600" : available <= 10 ? "text-amber-600" : "text-green-600"}>{available}</span>
            {" / "}
            {masterSku.stock} total
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MasterSkuForm
            masterSku={{
              id: masterSku.id,
              sku: masterSku.sku,
              name: masterSku.name,
              description: masterSku.description,
              stock: masterSku.stock,
              isActive: masterSku.isActive,
            }}
          />
        </div>

        <div>
          <LinkManager
            masterSkuId={masterSku.id}
            links={masterSku.productLinks.map((l) => ({
              id: l.id,
              productId: l.product?.id ?? null,
              productName: l.product?.name ?? null,
              variantId: l.variant?.id ?? null,
              variantName: l.variant?.name ?? null,
              siteId: l.site?.id ?? null,
              siteName: l.site?.name ?? null,
              remoteRef: l.remoteRef,
              quantityMultiplier: l.quantityMultiplier,
            }))}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              variants: p.variants.map((v) => ({ id: v.id, name: v.name })),
            }))}
            sites={sites}
          />
        </div>
      </div>
    </div>
  )
}
