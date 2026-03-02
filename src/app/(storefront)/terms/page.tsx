import { getSettings } from "@/lib/settings"
import { sanitizeHtml } from "@/lib/sanitize"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service" }

function defaultContent(storeName: string) {
  return `<p>Welcome to ${storeName}. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
<h2>1. Use of the Site</h2>
<p>You may use this site for lawful purposes only. You agree not to use this site in any way that violates applicable laws or regulations.</p>
<h2>2. Orders &amp; Payments</h2>
<p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice.</p>
<h2>3. Returns &amp; Refunds</h2>
<p>Please review our return policy for information on returns, exchanges, and refunds. Requests must be made within the applicable return window.</p>
<h2>4. Intellectual Property</h2>
<p>All content on this site, including text, images, logos, and designs, is the property of ${storeName} and is protected by applicable copyright and trademark laws.</p>
<h2>5. Limitation of Liability</h2>
<p>${storeName} shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or any products purchased.</p>
<h2>6. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the site.</p>
<h2>7. Contact</h2>
<p>If you have questions about these Terms, please contact us through our contact page.</p>`
}

export default async function TermsPage() {
  const settings = await getSettings(["terms_of_service_content", "store_name"])
  const storeName = settings.store_name || "Store"
  const content = settings.terms_of_service_content || defaultContent(storeName)

  return (
    <div className="container-subpages mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <div
          className="prose prose-gray mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      </div>
    </div>
  )
}
