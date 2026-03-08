import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "@/components/providers/session-provider"
import { ToastProvider } from "@/components/ui/toast"
import { getSettings } from "@/lib/settings"
import { buildGoogleFontsUrl, getFontFallback, radiusValues, shadowValues } from "@/lib/theme-presets"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(["store_name", "store_description", "favicon_url"])
  const storeName = settings.store_name || "Store"

  const metadata: Metadata = {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: settings.store_description || "Shop the best products",
    openGraph: {
      type: "website",
      siteName: storeName,
    },
  }

  if (settings.favicon_url) {
    metadata.icons = {
      icon: settings.favicon_url,
      shortcut: settings.favicon_url,
      apple: settings.favicon_url,
    }
  }

  return metadata
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings([
    "theme_mode",
    "primary_color",
    "secondary_color",
    "accent_color",
    "tertiary_color",
    "background_color",
    "foreground_color",
    "muted_color",
    "border_color",
    "dark_background_color",
    "dark_foreground_color",
    "dark_muted_color",
    "dark_border_color",
    "font_heading",
    "font_body",
    "border_radius",
    "shadow_depth",
    "button_bg_color",
    "button_text_color",
    "product_button_bg_color",
    "product_button_text_color",
    "button_style",
    "product_button_style",
    "header_full_width",
    "container_width_header",
    "container_width_homepage",
    "container_width_subpages",
    "logo_height",
    "header_layout",
    "header_bg_color",
    "header_nav_color",
    "header_nav_hover_color",
    "header_icon_color",
    "header_icon_hover_color",
    "header_user_bg_color",
    "header_user_text_color",
    "header_cart_badge_bg_color",
    "header_cart_badge_text_color",
    "footer_bg_color",
    "footer_heading_color",
    "footer_link_color",
    "footer_link_hover_color",
    "product_card_style",
    "product_card_bg_color",
    "product_card_shadow",
  ])

  const isDark = settings.theme_mode === "dark"
  const themeVars: Record<string, string> = {}

  // Colors that stay the same in light/dark
  if (settings.primary_color) themeVars["--color-primary"] = settings.primary_color
  if (settings.secondary_color) themeVars["--color-secondary"] = settings.secondary_color
  const accent = settings.accent_color || settings.tertiary_color
  if (accent) themeVars["--color-accent"] = accent
  const buttonAccent = settings.button_bg_color || settings.primary_color || "#000000"
  const buttonTextColor = settings.button_text_color || "#ffffff"

  if (settings.button_style === "outline") {
    themeVars["--color-button-bg"] = "transparent"
    themeVars["--color-button-text"] = buttonAccent
    themeVars["--color-button-border"] = buttonAccent
    themeVars["--color-button-hover-bg"] = buttonAccent
    themeVars["--color-button-hover-text"] = buttonTextColor
  } else {
    themeVars["--color-button-bg"] = buttonAccent
    themeVars["--color-button-text"] = buttonTextColor
    themeVars["--color-button-border"] = "transparent"
    themeVars["--color-button-hover-bg"] = buttonAccent
    themeVars["--color-button-hover-text"] = buttonTextColor
  }

  // Product buttons — inherit global style by default
  const productAccent = settings.product_button_bg_color || buttonAccent
  const productTextColor = settings.product_button_text_color || buttonTextColor
  const productStyle = settings.product_button_style || settings.button_style || "filled"

  if (productStyle === "outline") {
    themeVars["--color-product-btn-bg"] = "transparent"
    themeVars["--color-product-btn-text"] = productAccent
    themeVars["--color-product-btn-border"] = productAccent
    themeVars["--color-product-btn-hover-bg"] = productAccent
    themeVars["--color-product-btn-hover-text"] = productTextColor
  } else {
    if (settings.product_button_bg_color) themeVars["--color-product-btn-bg"] = productAccent
    if (settings.product_button_text_color) themeVars["--color-product-btn-text"] = productTextColor
  }

  // Background/foreground/muted/border — use dark overrides when in dark mode
  if (isDark) {
    if (settings.dark_background_color) themeVars["--color-background"] = settings.dark_background_color
    if (settings.dark_foreground_color) themeVars["--color-foreground"] = settings.dark_foreground_color
    if (settings.dark_muted_color) themeVars["--color-muted"] = settings.dark_muted_color
    if (settings.dark_border_color) themeVars["--color-border"] = settings.dark_border_color
  } else {
    if (settings.background_color) themeVars["--color-background"] = settings.background_color
    if (settings.foreground_color) themeVars["--color-foreground"] = settings.foreground_color
    if (settings.muted_color) themeVars["--color-muted"] = settings.muted_color
    if (settings.border_color) themeVars["--color-border"] = settings.border_color
  }

  // Fonts
  const headingFont = settings.font_heading || "Inter"
  const bodyFont = settings.font_body || "Inter"
  themeVars["--font-heading"] = `"${headingFont}", ${getFontFallback(headingFont)}`
  themeVars["--font-body"] = `"${bodyFont}", ${getFontFallback(bodyFont)}`

  // Border radius & shadow
  const radius = settings.border_radius || "medium"
  const shadow = settings.shadow_depth || "subtle"
  themeVars["--radius"] = radiusValues[radius] || radiusValues.medium
  themeVars["--shadow"] = shadowValues[shadow] || shadowValues.subtle

  // Container widths
  if (settings.header_full_width === "true") themeVars["--container-header"] = "100%"
  else if (settings.container_width_header) themeVars["--container-header"] = `${settings.container_width_header}px`
  if (settings.container_width_homepage) themeVars["--container-homepage"] = `${settings.container_width_homepage}px`
  if (settings.container_width_subpages) themeVars["--container-subpages"] = `${settings.container_width_subpages}px`

  // Header height (logo height + header padding, varies by layout)
  const logoH = settings.logo_height ? Number(settings.logo_height) : 0
  const headerLayout = settings.header_layout || "classic"
  let headerHeight = 64
  if (logoH) {
    const baseH = Math.max(logoH + 24, 64)
    if (headerLayout === "stacked") {
      headerHeight = baseH + 40 // nav bar adds ~40px (py-2.5 + text)
    } else if (headerLayout === "centered") {
      headerHeight = logoH + 100 // utils row + logo + nav + padding
    } else {
      headerHeight = baseH
    }
  }
  themeVars["--header-height"] = `${headerHeight}px`

  // Header colors
  if (settings.header_bg_color) themeVars["--header-bg"] = settings.header_bg_color
  if (settings.header_nav_color) themeVars["--header-nav-color"] = settings.header_nav_color
  if (settings.header_nav_hover_color) themeVars["--header-nav-hover"] = settings.header_nav_hover_color
  if (settings.header_icon_color) themeVars["--header-icon-color"] = settings.header_icon_color
  if (settings.header_icon_hover_color) themeVars["--header-icon-hover"] = settings.header_icon_hover_color
  if (settings.header_user_bg_color) themeVars["--header-user-bg"] = settings.header_user_bg_color
  if (settings.header_user_text_color) themeVars["--header-user-text"] = settings.header_user_text_color
  if (settings.header_cart_badge_bg_color) themeVars["--header-cart-badge-bg"] = settings.header_cart_badge_bg_color
  if (settings.header_cart_badge_text_color) themeVars["--header-cart-badge-text"] = settings.header_cart_badge_text_color

  // Footer colors
  if (settings.footer_bg_color) themeVars["--footer-bg"] = settings.footer_bg_color
  if (settings.footer_heading_color) themeVars["--footer-heading-color"] = settings.footer_heading_color
  if (settings.footer_link_color) themeVars["--footer-link-color"] = settings.footer_link_color
  if (settings.footer_link_hover_color) themeVars["--footer-link-hover"] = settings.footer_link_hover_color

  // Product card (boxed style)
  if (settings.product_card_style === "boxed") {
    themeVars["--product-card-bg"] = settings.product_card_bg_color || "#f3f4f6"
    const shadowMap: Record<string, string> = {
      none: "none",
      subtle: "0 1px 3px rgba(0,0,0,0.1)",
      medium: "0 4px 12px rgba(0,0,0,0.1)",
      strong: "0 8px 24px rgba(0,0,0,0.15)",
    }
    themeVars["--product-card-shadow"] = shadowMap[settings.product_card_shadow || "subtle"] || shadowMap.subtle
  }

  // Google Fonts URL
  const fontsUrl = buildGoogleFontsUrl([headingFont, bodyFont])

  return (
    <html lang="en" className={isDark ? "dark" : ""} style={themeVars}>
      <head>
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={fontsUrl} rel="stylesheet" />
          </>
        )}
      </head>
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
