import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { PasscodeForm } from "./passcode-form"

export default async function PasscodePage() {
  const settings = await getSettings([
    "storefront_passcode_enabled",
    "site_logo_url",
    "logo_height",
    "store_name",
    "storefront_passcode_bg_image",
  ])

  // If passcode is not enabled, redirect home
  if (settings.storefront_passcode_enabled !== "true") {
    redirect("/")
  }

  // If already verified, redirect home
  const cookieStore = await cookies()
  const verified = cookieStore.get("passcode_verified")
  if (verified) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Dark background with optional image */}
      <div
        className="hidden w-1/2 bg-gray-950 bg-cover bg-center md:block"
        style={settings.storefront_passcode_bg_image ? { backgroundImage: `url(${settings.storefront_passcode_bg_image})` } : undefined}
      />

      {/* Right side - Logo + Form */}
      <div className="flex w-full items-center justify-center bg-background px-4 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            {settings.site_logo_url ? (
              <img
                src={settings.site_logo_url}
                alt={settings.store_name || "Store"}
                className="mx-auto"
                style={{ height: `${settings.logo_height || "40"}px`, width: "auto" }}
              />
            ) : (
              <h1 className="text-xl font-bold text-foreground">
                {settings.store_name || "Store"}
              </h1>
            )}
          </div>

          <h2 className="mb-1 text-center text-lg font-semibold text-foreground">
            Enter Passcode
          </h2>
          <p className="mb-5 text-center text-sm text-secondary">
            This site is password protected.
          </p>
          <PasscodeForm />
        </div>
      </div>
    </div>
  )
}
