import type { MetadataRoute } from "next"
import { getSettings } from "@/lib/settings"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings([
    "store_name",
    "store_description",
    "primary_color",
    "site_bg_color",
  ])

  return {
    name: settings.store_name || "Store",
    short_name: settings.store_name || "Store",
    description: settings.store_description || "Online store",
    start_url: "/",
    display: "standalone",
    background_color: settings.site_bg_color || "#ffffff",
    theme_color: settings.primary_color || "#000000",
  }
}
