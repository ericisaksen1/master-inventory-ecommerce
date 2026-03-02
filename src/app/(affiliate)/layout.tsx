import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { getSettings } from "@/lib/settings"
import { notFound } from "next/navigation"
import { type ReactNode } from "react"

export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings(["enable_affiliates"])
  if (settings.enable_affiliates === "false") notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
