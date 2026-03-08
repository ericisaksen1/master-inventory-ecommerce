"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendEmailOrThrow } from "@/lib/email/send"
import { getSetting } from "@/lib/settings"

const SUPER_ADMIN_ONLY_KEYS = new Set([
  "theme_mode",
  "primary_color",
  "secondary_color",
  "tertiary_color",
  "accent_color",
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
  "site_logo_url",
  "favicon_url",
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
  "footer_layout",
  "footer_show_legal",
  "footer_bg_color",
  "footer_heading_color",
  "footer_link_color",
  "footer_link_hover_color",
  "products_layout",
  "blog_layout",
  "product_card_style",
  "product_card_bg_color",
  "product_card_shadow",
  "blog_card_style",
  "blog_show_author",
  "blog_show_date",
  "blog_show_excerpt",
  "contact_page_style",
  "enable_wishlist",
  "enable_reviews",
  "container_width_header",
  "container_width_homepage",
  "container_width_subpages",
  "alert_bar_enabled",
  "alert_bar_content",
  "alert_bar_bg_color",
  "alert_bar_text_color",
  "shipstation_auth_key",
  "email_provider",
  "email_from_name",
  "email_from_address",
  "admin_notification_email",
  "email_smtp_host",
  "email_smtp_port",
  "email_smtp_user",
  "email_smtp_password",
  "email_resend_api_key",
  "email_sendgrid_api_key",
  "entry_popup_enabled",
  "entry_popup_show_logo",
  "entry_popup_headline",
  "entry_popup_content",
  "entry_popup_agree_text",
  "entry_popup_disagree_text",
  "entry_popup_disagree_url",
  "entry_popup_persistence",
  "entry_popup_overlay_color",
  "entry_popup_overlay_opacity",
  "entry_popup_bg_color",
  "entry_popup_headline_color",
  "entry_popup_text_color",
  "entry_popup_agree_bg_color",
  "entry_popup_agree_text_color",
  "entry_popup_disagree_bg_color",
  "entry_popup_disagree_text_color",
  "terms_of_service_content",
  "privacy_policy_content",
  "enable_printful",
  "printful_api_key",
  "printful_webhook_secret",
  "storefront_passcode_enabled",
  "storefront_passcode_value",
  "storefront_passcode_bg_image",
  "bulk_order_popup_enabled",
  "bulk_order_popup_delay",
  "bulk_order_show_after_entry",
  "bulk_order_pdf_url",
  "email_tpl_bulk_order_subject",
  "email_tpl_bulk_order_content",
])

export async function updateSettings(formData: FormData) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  const isSuperAdmin = role === "SUPER_ADMIN"
  const entries = Array.from(formData.entries())

  // Server-side bounds for numeric settings
  const NUMERIC_BOUNDS: Record<string, { min: number; max: number }> = {
    tax_rate: { min: 0, max: 100 },
    shipping_flat_rate: { min: 0, max: 1000 },
    default_commission_rate: { min: 0, max: 100 },
    affiliate_discount_rate: { min: 0, max: 100 },
    parent_commission_rate: { min: 0, max: 100 },
    affiliate_cookie_days: { min: 1, max: 365 },
    low_stock_threshold: { min: 0, max: 10000 },
  }

  for (const [key, value] of entries) {
    if (key.startsWith("setting_")) {
      const settingKey = key.replace("setting_", "")
      if (!isSuperAdmin && SUPER_ADMIN_ONLY_KEYS.has(settingKey)) continue

      // Validate numeric bounds
      const bounds = NUMERIC_BOUNDS[settingKey]
      if (bounds && value) {
        const num = parseFloat(value as string)
        if (isNaN(num) || num < bounds.min || num > bounds.max) {
          return { error: `${settingKey.replace(/_/g, " ")} must be between ${bounds.min} and ${bounds.max}` }
        }
      }

      await prisma.setting.upsert({
        where: { key: settingKey },
        update: { value: value as string },
        create: { key: settingKey, value: value as string },
      })
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function sendTestEmail(): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  const adminEmail = await getSetting("admin_notification_email")
  if (!adminEmail) {
    return { error: "Admin notification email is not set. Save your settings first." }
  }

  try {
    await sendEmailOrThrow(
      adminEmail,
      "Test Email — Your email is configured correctly!",
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f7f7f7">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;text-align:center">
  <h1 style="font-size:20px;color:#111;margin:0 0 16px">Email is working!</h1>
  <p style="color:#555;font-size:15px;line-height:1.5">This is a test email from your store. If you're reading this, your email provider is configured correctly.</p>
  <p style="color:#999;font-size:13px;margin-top:24px">Sent to ${adminEmail}</p>
</div>
</body></html>`
    )
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send test email" }
  }
}
