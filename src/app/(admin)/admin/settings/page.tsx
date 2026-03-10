import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { SettingsForm } from "./settings-form"

export const metadata = { title: "Settings" }

// Keys this form actually uses — only fetch these
const SETTINGS_FORM_KEYS = [
  "store_name", "store_description",
  "enable_paypal", "paypal_email", "paypal_qr_url", "paypal_pay_url",
  "enable_venmo", "venmo_username", "venmo_qr_url",
  "enable_cashapp", "cashapp_tag", "cashapp_qr_url",
  "enable_bitcoin", "bitcoin_address", "bitcoin_qr_url",
  "enable_zelle", "zelle_email", "zelle_qr_url",
  "tax_rate", "shipping_flat_rate",
  "default_commission_rate", "affiliate_discount_rate",
  "parent_commission_rate", "affiliate_cookie_days",
  "low_stock_threshold",
  "enable_affiliates",
  "enable_guest_checkout",
  "email_provider", "email_from_name", "email_from_address",
  "admin_notification_email",
  "email_payment_confirmed",
  "email_shipped",
  // Email template personalization
  "email_footer_text",
  "email_tpl_order_confirmation_subject",
  "email_tpl_order_confirmation_intro",
  "email_tpl_order_confirmation_outro",
  "email_tpl_order_status_subject",
  "email_tpl_order_status_intro",
  "email_tpl_order_status_outro",
  "email_tpl_shipping_subject",
  "email_tpl_shipping_intro",
  "email_tpl_shipping_outro",
  "email_tpl_password_reset_subject",
  "email_tpl_password_reset_intro",
  "email_tpl_password_reset_outro",
  "email_tpl_password_changed_subject",
  "email_tpl_password_changed_intro",
  "email_tpl_password_changed_outro",
  // Tracking & Analytics
  "ga4_measurement_id", "facebook_pixel_id", "tiktok_pixel_id",
  // Printful
  "enable_printful",
  // Global variant toggles
  "variant_enabled_single",
  "variant_enabled_3_pack",
  "variant_enabled_5_pack",
  "variant_enabled_10_pack",
]

// Sensitive keys only SUPER_ADMIN should see
const SENSITIVE_KEYS = [
  "shipstation_auth_key",
  "email_smtp_host", "email_smtp_port", "email_smtp_user", "email_smtp_password",
  "email_resend_api_key", "email_sendgrid_api_key",
  "entry_popup_enabled", "entry_popup_show_logo", "entry_popup_headline",
  "entry_popup_content", "entry_popup_agree_text", "entry_popup_disagree_text",
  "entry_popup_disagree_url", "entry_popup_persistence",
  "entry_popup_overlay_color", "entry_popup_overlay_opacity", "entry_popup_bg_color",
  "entry_popup_headline_color", "entry_popup_text_color",
  "entry_popup_agree_bg_color", "entry_popup_agree_text_color",
  "entry_popup_disagree_bg_color", "entry_popup_disagree_text_color",
  // Legal page content
  "terms_of_service_content", "privacy_policy_content",
  // Printful
  "printful_api_key", "printful_webhook_secret",
  // Passcode
  "storefront_passcode_enabled", "storefront_passcode_value", "storefront_passcode_bg_image",
  // Bulk Ordering
  "bulk_order_popup_enabled", "bulk_order_popup_delay",
  "bulk_order_show_after_entry", "bulk_order_pdf_url",
  "email_tpl_bulk_order_subject", "email_tpl_bulk_order_content",
  // Theme colors (read-only, for swatch pickers)
  "primary_color", "secondary_color", "accent_color",
  "foreground_color", "background_color", "muted_color", "border_color",
]

export default async function AdminSettingsPage() {
  const session = await auth()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const allowedKeys = isSuperAdmin
    ? [...SETTINGS_FORM_KEYS, ...SENSITIVE_KEYS]
    : SETTINGS_FORM_KEYS

  const settings = await prisma.setting.findMany({
    where: { key: { in: allowedKeys } },
  })
  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure your store settings and payment addresses.
      </p>

      <SettingsForm settings={settingsMap} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}
