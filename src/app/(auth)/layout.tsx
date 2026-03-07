import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings([
    "theme_mode",
    "store_name",
    "site_logo_url",
    "logo_height",
    "storefront_passcode_enabled",
    "storefront_passcode_bg_image",
  ])

  // Passcode gate
  if (settings.storefront_passcode_enabled === "true") {
    const cookieStore = await cookies()
    if (!cookieStore.get("passcode_verified")) {
      redirect("/passcode")
    }
  }

  const isDark = settings.theme_mode === "dark"
  const storeName = settings.store_name || "Store"
  const logoUrl = settings.site_logo_url
  const logoHeight = settings.logo_height
  const bgImage = settings.storefront_passcode_bg_image

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center bg-gray-950 bg-cover bg-center px-4 ${isDark ? "dark" : ""}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-black px-8 py-10">
        <Link href="/" className="mb-8 block text-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={storeName}
              width={200}
              height={Number(logoHeight) || 40}
              style={{ height: logoHeight ? `${logoHeight}px` : "40px", width: "auto" }}
              className="mx-auto"
              priority
            />
          ) : (
            <span className="text-2xl font-bold text-white">{storeName}</span>
          )}
        </Link>
        {children}
      </div>
    </div>
  )
}
