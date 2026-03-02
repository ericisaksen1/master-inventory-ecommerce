const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_COMPLETE: "Payment Complete",
  ORDER_COMPLETE: "Order Complete",
  CANCELLED: "Cancelled",
}

// ── Branding & Customization Types ──

export interface EmailBranding {
  storeName?: string
  logoUrl?: string
  primaryColor?: string
  footerText?: string
}

export interface TemplateCustomization {
  branding?: EmailBranding
  subject?: string
  introText?: string
  outroText?: string
}

// ── Shared Layout ──

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function layout(title: string, body: string, branding: EmailBranding = {}): string {
  const {
    storeName = "",
    logoUrl = "",
    primaryColor = "#111111",
    footerText = "This is an automated message. Please do not reply.",
  } = branding

  const headerContent =
    logoUrl || storeName
      ? `<tr><td style="padding:24px 40px 0;text-align:center">
          ${logoUrl ? `<img src="${esc(logoUrl)}" alt="${esc(storeName)}" style="max-height:48px;max-width:200px;margin-bottom:8px" />` : ""}
          ${storeName ? `<p style="margin:0;font-size:14px;font-weight:600;color:#666;letter-spacing:0.5px;text-transform:uppercase">${esc(storeName)}</p>` : ""}
         </td></tr>`
      : ""

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:100%">
${headerContent}
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #eee">
  <h1 style="margin:0;font-size:20px;color:#111">${title}</h1>
</td></tr>
<tr><td style="padding:24px 40px 32px;font-size:15px;line-height:1.6;color:#333">
  ${body}
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center">
  ${esc(footerText)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Helpers for intro/outro ──

function wrapIntro(text?: string) {
  return text ? `<p>${esc(text)}</p>` : ""
}

function wrapOutro(text?: string) {
  return text ? `<p style="margin-top:24px">${esc(text)}</p>` : ""
}

// ── Admin Templates ──

export function newUserAdminTemplate(userName: string, userEmail: string, branding?: EmailBranding) {
  return {
    subject: `New User Registration: ${userName}`,
    html: layout("New User Registration", `
      <p>A new user has registered:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${esc(userName)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${esc(userEmail)}</td></tr>
      </table>
    `, branding),
  }
}

export function affiliateApplicationAdminTemplate(userName: string, userEmail: string, branding?: EmailBranding) {
  return {
    subject: `New Affiliate Application: ${userName}`,
    html: layout("Affiliate Application", `
      <p>A user has applied to become an affiliate:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${esc(userName)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${esc(userEmail)}</td></tr>
      </table>
      <p>Please review this application in the admin panel.</p>
    `, branding),
  }
}

export function lowStockAdminTemplate(productName: string, currentStock: number, branding?: EmailBranding) {
  return {
    subject: `Low Stock Alert: ${productName}`,
    html: layout("Low Stock Alert", `
      <p style="color:#b45309;font-weight:600">A product is running low on stock:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Product</td><td style="padding:8px 12px">${esc(productName)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Stock</td><td style="padding:8px 12px;color:#b45309;font-weight:600">${currentStock} remaining</td></tr>
      </table>
    `, branding),
  }
}

export function outOfStockAdminTemplate(productName: string, branding?: EmailBranding) {
  return {
    subject: `Out of Stock: ${productName}`,
    html: layout("Out of Stock Alert", `
      <p style="color:#dc2626;font-weight:600">A product is now out of stock:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Product</td><td style="padding:8px 12px">${esc(productName)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Stock</td><td style="padding:8px 12px;color:#dc2626;font-weight:600">0 — Sold Out</td></tr>
      </table>
      <p>This product can no longer be purchased until stock is replenished.</p>
    `, branding),
  }
}

export function contactMessageAdminTemplate(name: string, email: string, subject: string, message: string, branding?: EmailBranding) {
  return {
    subject: `New Contact Message: ${subject}`,
    html: layout("New Contact Message", `
      <p>You have received a new contact form submission:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${esc(name)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${esc(email)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Subject</td><td style="padding:8px 12px">${esc(subject)}</td></tr>
      </table>
      <p style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:4px;white-space:pre-wrap">${esc(message)}</p>
      <p style="color:#999;font-size:13px">You can view and manage all messages in the admin panel.</p>
    `, branding),
  }
}

export function newOrderAdminTemplate(orderNumber: string, total: string, customerName: string, branding?: EmailBranding) {
  return {
    subject: `New Order #${orderNumber}`,
    html: layout("New Order Received", `
      <p>A new order has been placed:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${esc(orderNumber)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Customer</td><td style="padding:8px 12px">${esc(customerName)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Total</td><td style="padding:8px 12px;font-weight:600">${total}</td></tr>
      </table>
    `, branding),
  }
}

// ── Customer Templates ──

export function orderConfirmationTemplate(
  orderNumber: string,
  total: string,
  paymentMethod: string,
  items: { name: string; quantity: number; price: string }[],
  customization: TemplateCustomization = {}
) {
  const { branding, subject, introText, outroText } = customization

  const itemRows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(item.name)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${item.price}</td></tr>`
    )
    .join("")

  const defaultSubject = `Order Confirmation #${orderNumber}`

  return {
    subject: subject || defaultSubject,
    html: layout("Order Confirmation", `
      ${wrapIntro(introText)}
      <p>Thank you for your order! Here's your order summary:</p>
      <p style="font-size:18px;font-weight:600;margin:16px 0">Order #${esc(orderNumber)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f9f9f9"><th style="padding:8px 12px;text-align:left">Item</th><th style="padding:8px 12px;text-align:center">Qty</th><th style="padding:8px 12px;text-align:right">Price</th></tr>
        ${itemRows}
      </table>
      <p style="font-size:16px;font-weight:600;text-align:right">Total: ${total}</p>
      <p style="margin-top:24px">Payment method: <strong>${esc(paymentMethod)}</strong></p>
      <p>You will receive payment instructions shortly. Once your payment is confirmed, we'll prepare your order for shipping.</p>
      ${wrapOutro(outroText)}
    `, branding),
  }
}

export function orderStatusChangedTemplate(
  orderNumber: string,
  newStatus: string,
  customization: TemplateCustomization = {}
) {
  const { branding, subject, introText, outroText } = customization
  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus
  const defaultSubject = `Order #${orderNumber} — ${statusLabel}`

  return {
    subject: subject || defaultSubject,
    html: layout("Order Status Update", `
      ${wrapIntro(introText)}
      <p>Your order status has been updated:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${esc(orderNumber)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Status</td><td style="padding:8px 12px;font-weight:600">${esc(statusLabel)}</td></tr>
      </table>
      ${wrapOutro(outroText)}
    `, branding),
  }
}

export function shippingConfirmationTemplate(
  orderNumber: string,
  carrier: string,
  service: string,
  trackingNumber: string,
  customization: TemplateCustomization = {}
) {
  const { branding, subject, introText, outroText } = customization
  const defaultSubject = `Order #${orderNumber} Shipped!`

  return {
    subject: subject || defaultSubject,
    html: layout("Your Order Has Shipped", `
      ${wrapIntro(introText)}
      <p>Great news! Your order has been shipped:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${esc(orderNumber)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Carrier</td><td style="padding:8px 12px">${esc(carrier)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Service</td><td style="padding:8px 12px">${esc(service)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Tracking</td><td style="padding:8px 12px;font-family:monospace">${esc(trackingNumber)}</td></tr>
      </table>
      ${wrapOutro(outroText)}
    `, branding),
  }
}

export function passwordResetTemplate(
  resetUrl: string,
  customization: TemplateCustomization = {}
) {
  const { branding, subject, introText, outroText } = customization
  const primaryColor = branding?.primaryColor || "#111"
  const defaultSubject = "Reset Your Password"

  return {
    subject: subject || defaultSubject,
    html: layout("Reset Your Password", `
      ${wrapIntro(introText)}
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <p style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:${primaryColor};color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px">Reset Password</a>
      </p>
      <p style="color:#999;font-size:13px">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color:#999;font-size:13px;word-break:break-all">If the button doesn't work, copy and paste this URL into your browser:<br>${resetUrl}</p>
      ${wrapOutro(outroText)}
    `, branding),
  }
}

export function passwordChangedTemplate(
  userName: string,
  customization: TemplateCustomization = {}
) {
  const { branding, subject, introText, outroText } = customization
  const defaultSubject = "Your Password Was Changed"

  return {
    subject: subject || defaultSubject,
    html: layout("Password Changed", `
      ${wrapIntro(introText)}
      <p>Hi ${esc(userName)},</p>
      <p>This is a confirmation that the password for your account was recently changed.</p>
      <p>If you did not make this change, please contact us immediately.</p>
      ${wrapOutro(outroText)}
    `, branding),
  }
}
