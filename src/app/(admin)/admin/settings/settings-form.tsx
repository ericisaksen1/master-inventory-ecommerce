"use client"

import { useState, useTransition, lazy, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { updateSettings, sendTestEmail } from "@/actions/settings"

const RichTextEditor = lazy(() => import("@/components/admin/rich-text-editor").then(m => ({ default: m.RichTextEditor })))

interface SettingsFormProps {
  settings: Record<string, string>
  isSuperAdmin: boolean
}

type SettingsTab = "general" | "payment" | "shipping" | "email" | "tracking" | "legal" | "popup" | "printful"

const tabs: { key: SettingsTab; label: string; superAdminOnly?: boolean }[] = [
  { key: "general", label: "General" },
  { key: "payment", label: "Payment" },
  { key: "shipping", label: "Shipping & Rates" },
  { key: "email", label: "Email" },
  { key: "tracking", label: "Tracking" },
  { key: "legal", label: "Legal", superAdminOnly: true },
  { key: "popup", label: "Entry Popup", superAdminOnly: true },
  { key: "printful", label: "Printful", superAdminOnly: true },
]

const settingGroups: {
  title: string
  tab: SettingsTab
  description?: string
  superAdminOnly?: boolean
  enableKey?: string
  fields: { key: string; label: string; type: string; placeholder?: string; min?: string; max?: string }[]
}[] = [
  {
    title: "Store",
    tab: "general",
    fields: [
      { key: "store_name", label: "Store Name", type: "text" },
      { key: "store_description", label: "Store Description", type: "text" },
    ],
  },
  {
    title: "PayPal",
    tab: "payment",
    enableKey: "enable_paypal",
    fields: [
      { key: "paypal_email", label: "PayPal Email", type: "text", placeholder: "you@example.com" },
      { key: "paypal_qr_url", label: "PayPal QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Venmo",
    tab: "payment",
    enableKey: "enable_venmo",
    fields: [
      { key: "venmo_username", label: "Venmo Username", type: "text", placeholder: "YourUsername" },
      { key: "venmo_qr_url", label: "Venmo QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Cash App",
    tab: "payment",
    enableKey: "enable_cashapp",
    fields: [
      { key: "cashapp_tag", label: "Cash App Tag", type: "text", placeholder: "$YourCashTag" },
      { key: "cashapp_qr_url", label: "Cash App QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Bitcoin",
    tab: "payment",
    enableKey: "enable_bitcoin",
    fields: [
      { key: "bitcoin_address", label: "Bitcoin Wallet Address", type: "text", placeholder: "bc1q..." },
      { key: "bitcoin_qr_url", label: "Bitcoin QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Rates",
    tab: "shipping",
    fields: [
      { key: "tax_rate", label: "Tax Rate (%)", type: "number", placeholder: "0", min: "0", max: "100" },
      { key: "shipping_flat_rate", label: "Flat Shipping Rate ($)", type: "number", placeholder: "0", min: "0", max: "1000" },
      { key: "default_commission_rate", label: "Default Affiliate Commission (%)", type: "number", placeholder: "10", min: "0", max: "100" },
      { key: "affiliate_discount_rate", label: "Affiliate Discount for Customers (%)", type: "number", placeholder: "10", min: "0", max: "100" },
      { key: "parent_commission_rate", label: "Parent Affiliate Commission (%)", type: "number", placeholder: "5", min: "0", max: "100" },
      { key: "affiliate_cookie_days", label: "Affiliate Cookie Duration (days)", type: "number", placeholder: "30", min: "1", max: "365" },
    ],
  },
  {
    title: "Inventory Alerts",
    tab: "shipping",
    description: "Get notified when products are running low or out of stock.",
    fields: [
      { key: "low_stock_threshold", label: "Low Stock Threshold", type: "number", placeholder: "10" },
    ],
  },
  {
    title: "Shipping (ShipStation)",
    tab: "shipping",
    superAdminOnly: true,
    description: "Configure ShipStation for shipping label generation (UPS, FedEx, USPS).",
    fields: [
      { key: "shipstation_api_key", label: "ShipStation API Key", type: "password" },
      { key: "shipstation_carrier_ids", label: "Carrier IDs (comma-separated)", type: "text", placeholder: "se-123456,se-789012" },
      { key: "ship_from_name", label: "Ship From Name", type: "text", placeholder: "Your Store" },
      { key: "ship_from_street", label: "Ship From Street", type: "text", placeholder: "123 Main St" },
      { key: "ship_from_city", label: "Ship From City", type: "text", placeholder: "City" },
      { key: "ship_from_state", label: "Ship From State", type: "text", placeholder: "CA" },
      { key: "ship_from_zip", label: "Ship From ZIP", type: "text", placeholder: "90210" },
      { key: "ship_from_phone", label: "Ship From Phone", type: "text", placeholder: "555-555-5555" },
    ],
  },
]

export function SettingsForm({ settings, isSuperAdmin }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [emailProvider, setEmailProvider] = useState(settings.email_provider || "smtp")
  const [affiliatesEnabled, setAffiliatesEnabled] = useState(settings.enable_affiliates !== "false")
  const [guestCheckoutEnabled, setGuestCheckoutEnabled] = useState(settings.enable_guest_checkout !== "false")
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [enableToggles, setEnableToggles] = useState<Record<string, boolean>>(() => {
    const toggles: Record<string, boolean> = {}
    for (const group of settingGroups) {
      if (group.enableKey) {
        toggles[group.enableKey] = settings[group.enableKey] === "true"
      }
    }
    return toggles
  })
  const { toast } = useToast()

  // Email state
  const [paymentConfirmedEmail, setPaymentConfirmedEmail] = useState(settings.email_payment_confirmed === "true")
  const [shippedEmail, setShippedEmail] = useState(settings.email_shipped === "true")
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  // Legal page state
  const [termsContent, setTermsContent] = useState(settings.terms_of_service_content || "")
  const [privacyContent, setPrivacyContent] = useState(settings.privacy_policy_content || "")

  // Passcode state
  const [passcodeEnabled, setPasscodeEnabled] = useState(settings.storefront_passcode_enabled === "true")

  // Entry popup state
  const [printfulEnabled, setPrintfulEnabled] = useState(settings.enable_printful === "true")
  const [popupEnabled, setPopupEnabled] = useState(settings.entry_popup_enabled === "true")
  const [popupShowLogo, setPopupShowLogo] = useState(settings.entry_popup_show_logo !== "false")
  const [popupContent, setPopupContent] = useState(settings.entry_popup_content || "")
  const [popupPersistence, setPopupPersistence] = useState(settings.entry_popup_persistence || "session")
  const [popupOverlayOpacity, setPopupOverlayOpacity] = useState(Number(settings.entry_popup_overlay_opacity) || 60)
  const [popupColors, setPopupColors] = useState({
    overlay: settings.entry_popup_overlay_color || "",
    bg: settings.entry_popup_bg_color || "",
    headline: settings.entry_popup_headline_color || "",
    text: settings.entry_popup_text_color || "",
    agreeBg: settings.entry_popup_agree_bg_color || "",
    agreeText: settings.entry_popup_agree_text_color || "",
    disagreeBg: settings.entry_popup_disagree_bg_color || "",
    disagreeText: settings.entry_popup_disagree_text_color || "",
  })

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Settings saved!")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-6">
      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.filter((t) => !t.superAdminOnly || isSuperAdmin).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — all tabs stay in DOM so form values are submitted */}
      {settingGroups.filter((g) => !g.superAdminOnly || isSuperAdmin).map((group) => {
        const isToggleable = !!group.enableKey
        const isEnabled = group.enableKey ? enableToggles[group.enableKey] : true
        return (
        <div key={group.title} style={{ display: activeTab === group.tab ? undefined : "none" }}>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              {isToggleable && group.enableKey && (
                <>
                  <input type="hidden" name={`setting_${group.enableKey}`} value={isEnabled ? "true" : "false"} />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => setEnableToggles(prev => ({ ...prev, [group.enableKey!]: !prev[group.enableKey!] }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      isEnabled ? "bg-black" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </>
              )}
            </div>
            {group.description && (
              <p className="mt-1 text-sm text-gray-500">{group.description}</p>
            )}
            <div className={`mt-4 space-y-4 ${isToggleable && !isEnabled ? "pointer-events-none opacity-40" : ""}`}>
              {group.fields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  name={`setting_${field.key}`}
                  type={field.type || "text"}
                  defaultValue={settings[field.key] || ""}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                />
              ))}
            </div>
          </div>
        </div>
        )
      })}

      {/* Features — part of "general" tab */}
      <div style={{ display: activeTab === "general" ? undefined : "none" }}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Features</h2>
          <p className="mt-1 text-sm text-gray-500">Enable or disable store features.</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">Affiliate Program</span>
                <p className="text-xs text-gray-500">Allow users to apply as affiliates and earn commissions on referrals.</p>
              </div>
              <input type="hidden" name="setting_enable_affiliates" value={affiliatesEnabled ? "true" : "false"} />
              <button
                type="button"
                role="switch"
                aria-checked={affiliatesEnabled}
                onClick={() => setAffiliatesEnabled(!affiliatesEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  affiliatesEnabled ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    affiliatesEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">Guest Checkout</span>
                <p className="text-xs text-gray-500">Allow customers to check out without creating an account.</p>
              </div>
              <input type="hidden" name="setting_enable_guest_checkout" value={guestCheckoutEnabled ? "true" : "false"} />
              <button
                type="button"
                role="switch"
                aria-checked={guestCheckoutEnabled}
                onClick={() => setGuestCheckoutEnabled(!guestCheckoutEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  guestCheckoutEnabled ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    guestCheckoutEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Email Notifications — part of "email" tab */}
      <div style={{ display: activeTab === "email" ? undefined : "none" }}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Email Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">Configure email provider and notification settings.</p>
          <div className="mt-4 space-y-4">
            <Input
              label="From Name"
              name="setting_email_from_name"
              defaultValue={settings.email_from_name || ""}
              placeholder="Your Store"
            />
            <Input
              label="From Email Address"
              name="setting_email_from_address"
              type="email"
              defaultValue={settings.email_from_address || ""}
              placeholder="orders@yourstore.com"
            />
            <Input
              label="Admin Notification Email"
              name="setting_admin_notification_email"
              type="email"
              defaultValue={settings.admin_notification_email || ""}
              placeholder="admin@yourstore.com"
            />

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700">Customer Email Notifications</h3>
              <p className="mt-1 text-xs text-gray-500">Choose which emails are sent to customers.</p>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">Payment Confirmed Email</span>
                <p className="text-xs text-gray-500">Send the customer an email when their payment is confirmed.</p>
              </div>
              <input type="hidden" name="setting_email_payment_confirmed" value={paymentConfirmedEmail ? "true" : "false"} />
              <button
                type="button"
                role="switch"
                aria-checked={paymentConfirmedEmail}
                onClick={() => setPaymentConfirmedEmail(!paymentConfirmedEmail)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  paymentConfirmedEmail ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    paymentConfirmedEmail ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">Shipped / Tracking Email</span>
                <p className="text-xs text-gray-500">Send the customer an email with tracking info when their order ships. Disable if ShipStation handles this.</p>
              </div>
              <input type="hidden" name="setting_email_shipped" value={shippedEmail ? "true" : "false"} />
              <button
                type="button"
                role="switch"
                aria-checked={shippedEmail}
                onClick={() => setShippedEmail(!shippedEmail)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  shippedEmail ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    shippedEmail ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700">Email Footer</h3>
              <p className="mt-1 text-xs text-gray-500">Custom footer text shown at the bottom of all emails. Leave blank for default.</p>
              <textarea
                name="setting_email_footer_text"
                defaultValue={settings.email_footer_text || ""}
                placeholder="This is an automated message. Please do not reply."
                rows={2}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700">Template Customization</h3>
              <p className="mt-1 text-xs text-gray-500">Customize subject lines and add intro/outro text for each customer email. Leave blank to use defaults.</p>
              <div className="mt-3 space-y-2">
                {([
                  { key: "order_confirmation", label: "Order Confirmation", defaultSubject: "Order Confirmation #{orderNumber}", tags: "{orderNumber}, {storeName}, {total}" },
                  { key: "order_status", label: "Order Status Update", defaultSubject: "Order #{orderNumber} — {status}", tags: "{orderNumber}, {storeName}, {status}" },
                  { key: "shipping", label: "Shipping Confirmation", defaultSubject: "Order #{orderNumber} Shipped!", tags: "{orderNumber}, {storeName}, {carrier}, {trackingNumber}" },
                  { key: "password_reset", label: "Password Reset", defaultSubject: "Reset Your Password", tags: "{storeName}" },
                  { key: "password_changed", label: "Password Changed", defaultSubject: "Your Password Was Changed", tags: "{storeName}, {customerName}" },
                ] as const).map((tpl) => (
                  <div key={tpl.key} className="rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setExpandedTemplate(expandedTemplate === tpl.key ? null : tpl.key)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900"
                    >
                      {tpl.label}
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${expandedTemplate === tpl.key ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedTemplate === tpl.key && (
                      <div className="space-y-3 border-t border-gray-100 px-4 py-3">
                        <div>
                          <Input
                            label="Subject Line"
                            name={`setting_email_tpl_${tpl.key}_subject`}
                            defaultValue={settings[`email_tpl_${tpl.key}_subject`] || ""}
                            placeholder={tpl.defaultSubject}
                          />
                          <p className="mt-1 text-xs text-gray-400">Available merge tags: {tpl.tags}</p>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Intro Text</label>
                          <textarea
                            name={`setting_email_tpl_${tpl.key}_intro`}
                            defaultValue={settings[`email_tpl_${tpl.key}_intro`] || ""}
                            placeholder="Shown before the main email content"
                            rows={2}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Outro Text</label>
                          <textarea
                            name={`setting_email_tpl_${tpl.key}_outro`}
                            defaultValue={settings[`email_tpl_${tpl.key}_outro`] || ""}
                            placeholder="Shown after the main email content"
                            rows={2}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isSuperAdmin && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700">Email Provider Configuration</h3>
                </div>
                <Select
                  label="Email Provider"
                  name="setting_email_provider"
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                >
                  <option value="smtp">SMTP</option>
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                </Select>

                {emailProvider === "smtp" && (
                  <>
                    <Input
                      label="SMTP Host"
                      name="setting_email_smtp_host"
                      defaultValue={settings.email_smtp_host || ""}
                      placeholder="smtp.gmail.com"
                    />
                    <Input
                      label="SMTP Port"
                      name="setting_email_smtp_port"
                      type="number"
                      defaultValue={settings.email_smtp_port || ""}
                      placeholder="587"
                    />
                    <Input
                      label="SMTP Username"
                      name="setting_email_smtp_user"
                      defaultValue={settings.email_smtp_user || ""}
                    />
                    <Input
                      label="SMTP Password"
                      name="setting_email_smtp_password"
                      type="password"
                      defaultValue={settings.email_smtp_password || ""}
                    />
                  </>
                )}

                {emailProvider === "resend" && (
                  <Input
                    label="Resend API Key"
                    name="setting_email_resend_api_key"
                    type="password"
                    defaultValue={settings.email_resend_api_key || ""}
                    placeholder="re_..."
                  />
                )}

                {emailProvider === "sendgrid" && (
                  <Input
                    label="SendGrid API Key"
                    name="setting_email_sendgrid_api_key"
                    type="password"
                    defaultValue={settings.email_sendgrid_api_key || ""}
                    placeholder="SG...."
                  />
                )}
              </>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="mb-2 text-sm text-gray-500">Save your settings first, then send a test email to the admin notification address.</p>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await sendTestEmail()
                    if (result.error) {
                      toast(result.error, "error")
                    } else {
                      toast("Test email sent! Check your inbox.")
                    }
                  })
                }}
              >
                {isPending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking & Analytics */}
      <div style={{ display: activeTab === "tracking" ? undefined : "none" }}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Analytics & Tracking</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add tracking scripts that will be loaded on all storefront pages. Leave blank to disable.
          </p>
          <div className="mt-4 space-y-4">
            <Input
              label="Google Analytics 4 Measurement ID"
              name="setting_ga4_measurement_id"
              defaultValue={settings.ga4_measurement_id || ""}
              placeholder="G-XXXXXXXXXX"
            />
            <Input
              label="Facebook Pixel ID"
              name="setting_facebook_pixel_id"
              defaultValue={settings.facebook_pixel_id || ""}
              placeholder="123456789012345"
            />
            <Input
              label="TikTok Pixel ID"
              name="setting_tiktok_pixel_id"
              defaultValue={settings.tiktok_pixel_id || ""}
              placeholder="XXXXXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Legal Pages — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ display: activeTab === "legal" ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Legal Pages</h2>
            <p className="mt-1 text-sm text-gray-500">
              Edit the content for your Terms of Service and Privacy Policy pages. Leave blank to use default boilerplate content.
            </p>
            <div className="mt-4 space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Terms of Service</label>
                <p className="mb-2 text-xs text-gray-400">Displayed at /terms</p>
                <input type="hidden" name="setting_terms_of_service_content" value={termsContent} />
                <Suspense fallback={<div className="h-[300px] rounded-md border border-gray-200 bg-gray-50" />}>
                  <RichTextEditor content={termsContent} onChange={setTermsContent} />
                </Suspense>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Privacy Policy</label>
                <p className="mb-2 text-xs text-gray-400">Displayed at /privacy</p>
                <input type="hidden" name="setting_privacy_policy_content" value={privacyContent} />
                <Suspense fallback={<div className="h-[300px] rounded-md border border-gray-200 bg-gray-50" />}>
                  <RichTextEditor content={privacyContent} onChange={setPrivacyContent} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storefront Passcode — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ display: activeTab === "popup" ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Storefront Passcode</h2>
            <p className="mt-1 text-sm text-gray-500">
              Require visitors to enter a passcode before accessing the site. Useful for pre-launch or private stores.
            </p>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Passcode</span>
                  <p className="text-xs text-gray-500">Visitors must enter a passcode once per session to access the site.</p>
                </div>
                <input type="hidden" name="setting_storefront_passcode_enabled" value={passcodeEnabled ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={passcodeEnabled}
                  onClick={() => setPasscodeEnabled(!passcodeEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    passcodeEnabled ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      passcodeEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              <div className={passcodeEnabled ? "" : "pointer-events-none opacity-40"}>
                <Input
                  label="Passcode"
                  name="setting_storefront_passcode_value"
                  type="text"
                  defaultValue={settings.storefront_passcode_value || ""}
                  placeholder="Enter the passcode visitors must use"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Popup — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ display: activeTab === "popup" ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Entry Popup</h2>
            <p className="mt-1 text-sm text-gray-500">
              Show a popup when visitors first enter your site. Useful for age verification or terms agreement.
            </p>
            <div className="mt-4 space-y-4">
              {/* Enabled toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Entry Popup</span>
                  <p className="text-xs text-gray-500">Show a popup when visitors first enter the site.</p>
                </div>
                <input type="hidden" name="setting_entry_popup_enabled" value={popupEnabled ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={popupEnabled}
                  onClick={() => setPopupEnabled(!popupEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    popupEnabled ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      popupEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              {/* Show Logo toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Display Site Logo</span>
                  <p className="text-xs text-gray-500">Show the site logo at the top of the popup.</p>
                </div>
                <input type="hidden" name="setting_entry_popup_show_logo" value={popupShowLogo ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={popupShowLogo}
                  onClick={() => setPopupShowLogo(!popupShowLogo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    popupShowLogo ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      popupShowLogo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              <Input
                label="Headline"
                name="setting_entry_popup_headline"
                defaultValue={settings.entry_popup_headline || ""}
                placeholder="Welcome to our site"
              />

              {/* Rich text content */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Content</label>
                <input type="hidden" name="setting_entry_popup_content" value={popupContent} />
                <Suspense fallback={<div className="h-[300px] rounded-md border border-gray-200 bg-gray-50" />}>
                  <RichTextEditor content={popupContent} onChange={setPopupContent} />
                </Suspense>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Buttons</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Agree Button Text"
                    name="setting_entry_popup_agree_text"
                    defaultValue={settings.entry_popup_agree_text || ""}
                    placeholder="I Agree"
                  />
                  <Input
                    label="Disagree Button Text"
                    name="setting_entry_popup_disagree_text"
                    defaultValue={settings.entry_popup_disagree_text || ""}
                    placeholder="I Disagree"
                  />
                </div>
              </div>

              <Input
                label="Disagree Redirect URL"
                name="setting_entry_popup_disagree_url"
                defaultValue={settings.entry_popup_disagree_url || ""}
                placeholder="https://google.com"
              />

              <Select
                label="Remember User Choice"
                name="setting_entry_popup_persistence"
                value={popupPersistence}
                onChange={(e) => setPopupPersistence(e.target.value)}
              >
                <option value="every_visit">Every Visit (always show)</option>
                <option value="session">Session (until browser closes)</option>
                <option value="permanent">Permanent (never show again)</option>
              </Select>

              {/* Colors */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Colors</h3>
                  <button
                    type="button"
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                    onClick={() => { setPopupColors({ overlay: "", bg: "", headline: "", text: "", agreeBg: "", agreeText: "", disagreeBg: "", disagreeText: "" }); setPopupOverlayOpacity(60) }}
                  >
                    Reset to defaults
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Leave blank to use global theme colors.</p>

                {/* Hidden inputs for form submission */}
                <input type="hidden" name="setting_entry_popup_overlay_opacity" value={String(popupOverlayOpacity)} />
                <input type="hidden" name="setting_entry_popup_overlay_color" value={popupColors.overlay} />
                <input type="hidden" name="setting_entry_popup_bg_color" value={popupColors.bg} />
                <input type="hidden" name="setting_entry_popup_headline_color" value={popupColors.headline} />
                <input type="hidden" name="setting_entry_popup_text_color" value={popupColors.text} />
                <input type="hidden" name="setting_entry_popup_agree_bg_color" value={popupColors.agreeBg} />
                <input type="hidden" name="setting_entry_popup_agree_text_color" value={popupColors.agreeText} />
                <input type="hidden" name="setting_entry_popup_disagree_bg_color" value={popupColors.disagreeBg} />
                <input type="hidden" name="setting_entry_popup_disagree_text_color" value={popupColors.disagreeText} />

                {(() => {
                  const themeSwatches = [
                    { color: settings.primary_color || "#000000", label: "Primary" },
                    { color: settings.secondary_color || "#4b5563", label: "Secondary" },
                    { color: settings.accent_color || "#2563eb", label: "Accent" },
                    { color: settings.foreground_color || "#171717", label: "Foreground" },
                    { color: settings.background_color || "#ffffff", label: "Background" },
                    { color: settings.muted_color || "#f3f4f6", label: "Muted" },
                    { color: settings.border_color || "#e5e7eb", label: "Border" },
                  ]
                  return (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {([
                    { key: "overlay", label: "Overlay", desc: "Background behind modal" },
                    { key: "bg", label: "Panel Background", desc: "Modal panel" },
                    { key: "headline", label: "Headline", desc: "Headline text" },
                    { key: "text", label: "Content Text", desc: "Body content" },
                    { key: "agreeBg", label: "Agree Button", desc: "Background" },
                    { key: "agreeText", label: "Agree Text", desc: "Label color" },
                    { key: "disagreeBg", label: "Disagree Button", desc: "Background" },
                    { key: "disagreeText", label: "Disagree Text", desc: "Label color" },
                  ] as const).map((item) => (
                    <div key={item.key}>
                      <label className="mb-1 block text-xs font-medium text-gray-600">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={popupColors[item.key] || "#000000"}
                          onChange={(e) => setPopupColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          className="h-8 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={popupColors[item.key]}
                          onChange={(e) => setPopupColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          placeholder={item.desc}
                          className="h-8 w-full rounded-md border border-gray-300 px-2 font-mono text-xs uppercase focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      {themeSwatches.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="mr-1 text-[10px] text-gray-400">Theme:</span>
                          {themeSwatches.map((s) => (
                            <button
                              key={s.label}
                              type="button"
                              title={s.label}
                              onClick={() => setPopupColors((prev) => ({ ...prev, [item.key]: s.color }))}
                              className={`h-5 w-5 rounded-full border-2 transition-all hover:scale-110 ${
                                popupColors[item.key].toLowerCase() === s.color.toLowerCase()
                                  ? "border-black ring-1 ring-black ring-offset-1"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: s.color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  )
                })()}

                {/* Overlay Opacity */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Overlay Opacity: {popupOverlayOpacity}%
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={popupOverlayOpacity}
                      onChange={(e) => setPopupOverlayOpacity(Number(e.target.value))}
                      className="h-2 flex-1 cursor-pointer accent-black"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={popupOverlayOpacity}
                      onChange={(e) => setPopupOverlayOpacity(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                      className="h-8 w-16 rounded-md border border-gray-300 px-2 text-center font-mono text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printful — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ display: activeTab === "printful" ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Printful (Print-on-Demand)</h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect your Printful account to sell print-on-demand products. Orders with Printful items are automatically sent to Printful after payment confirmation.
            </p>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Printful</span>
                  <p className="text-xs text-gray-500">Auto-submit Printful items to Printful when payment is confirmed.</p>
                </div>
                <input type="hidden" name="setting_enable_printful" value={printfulEnabled ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={printfulEnabled}
                  onClick={() => setPrintfulEnabled(!printfulEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    printfulEnabled ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      printfulEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
              <Input
                label="Printful API Token"
                name="setting_printful_api_key"
                type="password"
                defaultValue={settings.printful_api_key || ""}
                placeholder="Your Printful API token"
              />
              <Input
                label="Webhook Secret (optional)"
                name="setting_printful_webhook_secret"
                type="password"
                defaultValue={settings.printful_webhook_secret || ""}
                placeholder="For verifying webhook signatures"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}
