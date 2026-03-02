import { getSettings } from "@/lib/settings"
import { ContactForm, type ContactPageStyle } from "@/components/storefront/contact-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact Us" }

export default async function ContactPage() {
  const settings = await getSettings([
    "contact_page_style",
    "store_name",
    "admin_notification_email",
  ])

  const style = (settings.contact_page_style || "standard") as ContactPageStyle
  const storeName = settings.store_name || ""
  const storeEmail = settings.admin_notification_email || ""

  return (
    <ContactForm
      style={style}
      storeName={storeName}
      storeEmail={storeEmail}
    />
  )
}
