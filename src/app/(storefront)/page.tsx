import { getSettings } from "@/lib/settings"
import { PageComponents } from "@/components/storefront/page-components"
import { JsonLd } from "@/components/storefront/json-ld"

export default async function HomePage() {
  const settings = await getSettings(["store_name", "store_description"])

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.store_name || "Store",
    description: settings.store_description || undefined,
  }

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <PageComponents pageId={null} />
    </>
  )
}
