import { getSettings } from "@/lib/settings"
import { sanitizeHtml } from "@/lib/sanitize"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy" }

function defaultContent(storeName: string) {
  return `<p>${storeName} respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.</p>
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly, including your name, email address, shipping address, and payment details when you place an order or create an account.</p>
<h2>2. How We Use Your Information</h2>
<p>We use your information to process orders, communicate with you about your purchases, improve our services, and send promotional emails (with your consent).</p>
<h2>3. Cookies &amp; Tracking</h2>
<p>We may use cookies and similar technologies to enhance your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.</p>
<h2>4. Data Sharing</h2>
<p>We do not sell your personal information. We may share data with trusted third-party service providers who assist us in operating our website, processing payments, and delivering orders.</p>
<h2>5. Data Security</h2>
<p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
<h2>6. Your Rights</h2>
<p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us through our contact page.</p>
<h2>7. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
<h2>8. Contact</h2>
<p>If you have questions about this Privacy Policy, please contact us through our contact page.</p>`
}

export default async function PrivacyPage() {
  const settings = await getSettings(["privacy_policy_content", "store_name"])
  const storeName = settings.store_name || "Store"
  const content = settings.privacy_policy_content || defaultContent(storeName)

  return (
    <div className="container-subpages mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <div
          className="prose prose-gray mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      </div>
    </div>
  )
}
