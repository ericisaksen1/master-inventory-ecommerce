import { sendEmail } from "./send"
import { getSettings } from "@/lib/settings"
import type { EmailBranding, TemplateCustomization } from "./templates"
import {
  newUserAdminTemplate,
  affiliateApplicationAdminTemplate,
  lowStockAdminTemplate,
  outOfStockAdminTemplate,
  newOrderAdminTemplate,
  contactMessageAdminTemplate,
  orderConfirmationTemplate,
  orderStatusChangedTemplate,
  shippingConfirmationTemplate,
  passwordChangedTemplate,
  passwordResetTemplate,
  bulkOrderAdminTemplate,
  bulkOrderCustomerTemplate,
} from "./templates"

// ── Personalization Helpers ──

const EMAIL_PERSONALIZATION_KEYS = [
  "admin_notification_email",
  "store_name",
  "site_logo_url",
  "primary_color",
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
  "email_tpl_bulk_order_subject",
  "email_tpl_bulk_order_content",
  "bulk_order_pdf_url",
]

interface EmailPersonalization {
  adminEmail: string
  branding: EmailBranding
  settings: Record<string, string>
}

async function getEmailPersonalization(): Promise<EmailPersonalization> {
  const s = await getSettings(EMAIL_PERSONALIZATION_KEYS)
  return {
    adminEmail: s.admin_notification_email || "",
    branding: {
      storeName: s.store_name || "",
      logoUrl: s.site_logo_url || "",
      primaryColor: s.primary_color || "#111111",
      footerText: s.email_footer_text || undefined,
    },
    settings: s,
  }
}

function resolveMergeTags(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match)
}

function getTemplateCustomization(
  settings: Record<string, string>,
  templateKey: string,
  branding: EmailBranding,
  mergeVars: Record<string, string>
): TemplateCustomization {
  const rawSubject = settings[`email_tpl_${templateKey}_subject`]
  return {
    branding,
    subject: rawSubject ? resolveMergeTags(rawSubject, mergeVars) : undefined,
    introText: settings[`email_tpl_${templateKey}_intro`] || undefined,
    outroText: settings[`email_tpl_${templateKey}_outro`] || undefined,
  }
}

// ── Admin Notifications ──

export async function notifyAdminNewUser(userName: string, userEmail: string) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = newUserAdminTemplate(userName, userEmail, branding)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminAffiliateApplication(userName: string, userEmail: string) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = affiliateApplicationAdminTemplate(userName, userEmail, branding)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminLowStock(productName: string, currentStock: number) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = lowStockAdminTemplate(productName, currentStock, branding)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminOutOfStock(productName: string) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = outOfStockAdminTemplate(productName, branding)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminNewOrder(
  orderNumber: string,
  total: string,
  customerName: string,
  items?: { name: string; quantity: number; price: string }[]
) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = newOrderAdminTemplate(orderNumber, total, customerName, branding, items)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminContactMessage(name: string, email: string, subject: string, message: string) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject: emailSubject, html } = contactMessageAdminTemplate(name, email, subject, message, branding)
  await sendEmail(adminEmail, emailSubject, html)
}

// ── Customer Notifications ──

export async function notifyCustomerOrderPlaced(
  customerEmail: string,
  orderNumber: string,
  total: string,
  paymentMethod: string,
  items: { name: string; quantity: number; price: string }[]
) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { orderNumber, storeName: branding.storeName || "", total }
  const customization = getTemplateCustomization(settings, "order_confirmation", branding, mergeVars)
  const { subject, html } = orderConfirmationTemplate(orderNumber, total, paymentMethod, items, customization)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerStatusChanged(
  customerEmail: string,
  orderNumber: string,
  newStatus: string
) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { orderNumber, storeName: branding.storeName || "", status: newStatus }
  const customization = getTemplateCustomization(settings, "order_status", branding, mergeVars)
  const { subject, html } = orderStatusChangedTemplate(orderNumber, newStatus, customization)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerShipped(
  customerEmail: string,
  orderNumber: string,
  carrier: string,
  service: string,
  trackingNumber: string
) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { orderNumber, storeName: branding.storeName || "", carrier, trackingNumber }
  const customization = getTemplateCustomization(settings, "shipping", branding, mergeVars)
  const { subject, html } = shippingConfirmationTemplate(orderNumber, carrier, service, trackingNumber, customization)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerPasswordChanged(customerEmail: string, userName: string) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { storeName: branding.storeName || "", customerName: userName }
  const customization = getTemplateCustomization(settings, "password_changed", branding, mergeVars)
  const { subject, html } = passwordChangedTemplate(userName, customization)
  await sendEmail(customerEmail, subject, html)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { storeName: branding.storeName || "" }
  const customization = getTemplateCustomization(settings, "password_reset", branding, mergeVars)
  const { subject, html } = passwordResetTemplate(resetUrl, customization)
  await sendEmail(email, subject, html)
}

// ── Bulk Order ──

export async function notifyAdminBulkOrderRequest(customerEmail: string) {
  const { adminEmail, branding } = await getEmailPersonalization()
  if (!adminEmail) return
  const { subject, html } = bulkOrderAdminTemplate(customerEmail, branding)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyCustomerBulkOrder(customerEmail: string) {
  const { branding, settings } = await getEmailPersonalization()
  const mergeVars = { storeName: branding.storeName || "" }
  const customization = getTemplateCustomization(settings, "bulk_order", branding, mergeVars)
  const contentHtml = settings.email_tpl_bulk_order_content || undefined
  const { subject, html } = bulkOrderCustomerTemplate({ ...customization, contentHtml })

  const pdfUrl = settings.bulk_order_pdf_url
  let attachments: { filename: string; content: Buffer }[] | undefined
  if (pdfUrl) {
    try {
      const { readFileSync } = await import("fs")
      const path = await import("path")
      const pdfPath = path.join(process.cwd(), "public", pdfUrl)
      const content = readFileSync(pdfPath)
      attachments = [{ filename: "bulk-price-list.pdf", content: Buffer.from(content) }]
    } catch {
      console.error("[email] Bulk order PDF not found at:", pdfUrl)
    }
  }

  await sendEmail(customerEmail, subject, html, attachments)
}
