import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { AlertBar } from "@/components/storefront/alert-bar"
import { EntryPopup } from "@/components/storefront/entry-popup"
import { TrackingScripts } from "@/components/storefront/tracking-scripts"
import { CookieConsent } from "@/components/storefront/cookie-consent"
import { AdminEditProvider, AdminToolbar } from "@/components/storefront/admin-toolbar"
import { getSettings } from "@/lib/settings"
import { type ReactNode } from "react"

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const popupSettings = await getSettings([
    "storefront_passcode_enabled",
    "entry_popup_enabled",
    "entry_popup_show_logo",
    "entry_popup_headline",
    "entry_popup_content",
    "entry_popup_agree_text",
    "entry_popup_disagree_text",
    "entry_popup_disagree_url",
    "entry_popup_persistence",
    "entry_popup_overlay_color",
    "entry_popup_bg_color",
    "entry_popup_headline_color",
    "entry_popup_text_color",
    "entry_popup_agree_bg_color",
    "entry_popup_agree_text_color",
    "entry_popup_disagree_bg_color",
    "entry_popup_disagree_text_color",
    "entry_popup_overlay_opacity",
    "site_logo_url",
    "logo_height",
    "store_name",
    "ga4_measurement_id",
    "facebook_pixel_id",
    "tiktok_pixel_id",
  ])

  // Passcode gate
  if (popupSettings.storefront_passcode_enabled === "true") {
    const cookieStore = await cookies()
    if (!cookieStore.get("passcode_verified")) {
      redirect("/passcode")
    }
  }

  const hasTracking = !!(
    popupSettings.ga4_measurement_id ||
    popupSettings.facebook_pixel_id ||
    popupSettings.tiktok_pixel_id
  )

  return (
    <AdminEditProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AdminToolbar />
        <AlertBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <TrackingScripts />
      <CookieConsent hasTracking={hasTracking} />
      {popupSettings.entry_popup_enabled === "true" && (
        <EntryPopup
          enabled
          showLogo={popupSettings.entry_popup_show_logo !== "false"}
          logoUrl={popupSettings.site_logo_url}
          logoHeight={popupSettings.logo_height}
          storeName={popupSettings.store_name || "Store"}
          headline={popupSettings.entry_popup_headline}
          content={popupSettings.entry_popup_content}
          agreeText={popupSettings.entry_popup_agree_text || "I Agree"}
          disagreeText={popupSettings.entry_popup_disagree_text || "I Disagree"}
          disagreeUrl={popupSettings.entry_popup_disagree_url || "https://google.com"}
          persistence={popupSettings.entry_popup_persistence || "session"}
          colors={{
            overlay: popupSettings.entry_popup_overlay_color,
            overlayOpacity: popupSettings.entry_popup_overlay_opacity ? Number(popupSettings.entry_popup_overlay_opacity) : undefined,
            bg: popupSettings.entry_popup_bg_color,
            headline: popupSettings.entry_popup_headline_color,
            text: popupSettings.entry_popup_text_color,
            agreeBg: popupSettings.entry_popup_agree_bg_color,
            agreeText: popupSettings.entry_popup_agree_text_color,
            disagreeBg: popupSettings.entry_popup_disagree_bg_color,
            disagreeText: popupSettings.entry_popup_disagree_text_color,
          }}
        />
      )}
    </AdminEditProvider>
  )
}
