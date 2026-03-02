import Link from "next/link"
import { auth } from "@/auth"
import { getMenuItems } from "@/actions/menus"
import { getSettings } from "@/lib/settings"
import { sanitizeHtml } from "@/lib/sanitize"
import { TermsModal } from "@/components/storefront/terms-modal"

interface MenuChild {
  id: string
  label: string
  url: string
  cssClass: string | null
  linkTarget: string | null
  visibility: string
  affiliateVisibility: string
}

interface FooterMenuItem {
  id: string
  label: string
  url: string
  cssClass: string | null
  linkTarget: string | null
  visibility: string
  affiliateVisibility: string
  children: MenuChild[]
}

function filterMenuItems<T extends { visibility: string; affiliateVisibility: string }>(
  items: T[],
  isLoggedIn: boolean,
  isAffiliate: boolean
): T[] {
  return items.filter((item) => {
    if (item.visibility === "logged_in" && !isLoggedIn) return false
    if (item.visibility === "logged_out" && isLoggedIn) return false
    if (item.affiliateVisibility === "affiliate_only" && !isAffiliate) return false
    if (item.affiliateVisibility === "non_affiliate_only" && isAffiliate) return false
    return true
  })
}

function FooterLink({
  item,
  className,
}: {
  item: { label: string; url: string; linkTarget: string | null }
  className: string
}) {
  return item.linkTarget === "_blank" ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
      {item.label}
    </a>
  ) : (
    <Link href={item.url} className={className}>
      {item.label}
    </Link>
  )
}

function NavigationColumn({ items }: { items: FooterMenuItem[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--footer-heading-color)]">Navigation</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const className = `text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors${item.cssClass ? ` ${item.cssClass}` : ""}`
          return (
            <li key={item.id}>
              <FooterLink item={item} className={className} />
              {item.children && item.children.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childClass = `text-xs text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors${child.cssClass ? ` ${child.cssClass}` : ""}`
                    return (
                      <li key={child.id}>
                        <FooterLink item={child} className={childClass} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AccountColumn() {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--footer-heading-color)]">Account</h3>
      <ul className="mt-4 space-y-3">
        <li>
          <Link href="/login" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Log In</Link>
        </li>
        <li>
          <Link href="/register" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Create Account</Link>
        </li>
        <li>
          <Link href="/orders" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Order History</Link>
        </li>
        <li>
          <Link href="/contact" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Contact</Link>
        </li>
      </ul>
    </div>
  )
}

function AffiliatesColumn() {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--footer-heading-color)]">Affiliates</h3>
      <ul className="mt-4 space-y-3">
        <li>
          <Link href="/affiliate/apply" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Become an Affiliate</Link>
        </li>
        <li>
          <Link href="/affiliate" className="text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors">Affiliate Dashboard</Link>
        </li>
      </ul>
    </div>
  )
}

function PaymentsColumn() {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--footer-heading-color)]">Payments</h3>
      <p className="mt-4 text-sm text-secondary">
        We accept Venmo, Cash App, and Bitcoin.
      </p>
    </div>
  )
}

function LegalLinks({ termsContent }: { termsContent: string }) {
  const linkClass = "text-xs text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors"
  return (
    <nav className="flex items-center gap-4">
      <TermsModal content={termsContent}>
        <span className={linkClass}>Terms of Service</span>
      </TermsModal>
      <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
    </nav>
  )
}

function Copyright({ storeName, showLegal, termsContent }: { storeName: string; showLegal: boolean; termsContent: string }) {
  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
      <p className="text-xs text-secondary">
        &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
      </p>
      {showLegal && <LegalLinks termsContent={termsContent} />}
    </div>
  )
}

export async function Footer() {
  const [footerMenuItems, settings, session] = await Promise.all([
    getMenuItems("footer"),
    getSettings(["store_name", "footer_layout", "site_logo_url", "logo_height", "enable_affiliates", "footer_show_legal", "terms_of_service_content"]),
    auth(),
  ])

  const storeName = settings.store_name || "Store"
  const footerLayout = settings.footer_layout || "standard"
  const logoUrl = settings.site_logo_url
  const logoHeight = settings.logo_height
  const affiliatesEnabled = settings.enable_affiliates !== "false"
  const showLegal = settings.footer_show_legal === "true"
  const defaultTerms = `<p>Welcome to ${storeName}. By accessing or using our website, you agree to be bound by these Terms of Service.</p>`
  const termsContent = sanitizeHtml(settings.terms_of_service_content || defaultTerms)

  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role
  const isAffiliate = userRole === "AFFILIATE" || userRole === "ADMIN" || userRole === "SUPER_ADMIN"

  const rawItems = footerMenuItems as unknown as FooterMenuItem[]
  const items = filterMenuItems(rawItems, isLoggedIn, isAffiliate).map((item) => ({
    ...item,
    children: filterMenuItems(item.children, isLoggedIn, isAffiliate),
  }))

  /* ── Standard: 4-column grid + copyright bar ── */
  if (footerLayout === "standard") {
    return (
      <footer className="bg-[var(--footer-bg)]">
        <div className="container-header px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <NavigationColumn items={items} />
            <AccountColumn />
            {affiliatesEnabled && <AffiliatesColumn />}
            <PaymentsColumn />
          </div>
          <div className="mt-8 border-t border-black/5 pt-8 text-center">
            <Copyright storeName={storeName} showLegal={showLegal} termsContent={termsContent} />
          </div>
        </div>
      </footer>
    )
  }

  /* ── Centered: logo/name centered, links row, copyright ── */
  if (footerLayout === "centered") {
    const allLinks = items.flatMap((item) => [
      item,
      ...(item.children || []),
    ])

    return (
      <footer className="bg-[var(--footer-bg)]">
        <div className="container-header px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Logo or store name */}
            <Link href="/" className="flex items-center">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="object-contain"
                  style={{ height: logoHeight ? `${logoHeight}px` : "32px" }}
                />
              ) : (
                <span className="text-xl font-bold tracking-tight text-foreground">{storeName}</span>
              )}
            </Link>

            {/* Links row */}
            {allLinks.length > 0 && (
              <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {allLinks.map((item) => {
                  const className = `text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors${item.cssClass ? ` ${item.cssClass}` : ""}`
                  return <FooterLink key={item.id} item={item} className={className} />
                })}
              </nav>
            )}

            <div className="mt-8 border-t border-black/5 pt-8 w-full text-center">
              <Copyright storeName={storeName} showLegal={showLegal} termsContent={termsContent} />
            </div>
          </div>
        </div>
      </footer>
    )
  }

  /* ── Minimal: single bar — links left, copyright right ── */
  if (footerLayout === "minimal") {
    const allLinks = items.flatMap((item) => [
      item,
      ...(item.children || []),
    ])

    return (
      <footer className="bg-[var(--footer-bg)]">
        <div className="container-header px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {allLinks.map((item) => {
                const className = `text-sm text-[var(--footer-link-color)] hover:text-[var(--footer-link-hover)] transition-colors${item.cssClass ? ` ${item.cssClass}` : ""}`
                return <FooterLink key={item.id} item={item} className={className} />
              })}
            </nav>
            <Copyright storeName={storeName} showLegal={showLegal} termsContent={termsContent} />
          </div>
        </div>
      </footer>
    )
  }

  /* ── Columns with Logo: logo/name left, columns right, copyright bar ── */
  return (
    <footer className="bg-[var(--footer-bg)]">
      <div className="container-header px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Left: logo + store name */}
          <div>
            <Link href="/" className="inline-flex items-center">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="object-contain"
                  style={{ height: logoHeight ? `${logoHeight}px` : "32px" }}
                />
              ) : (
                <span className="text-xl font-bold tracking-tight text-foreground">{storeName}</span>
              )}
            </Link>
            <p className="mt-3 text-sm text-secondary">
              Quality products, great prices.
            </p>
          </div>

          {/* Right: columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <NavigationColumn items={items} />
            <AccountColumn />
            {affiliatesEnabled && <AffiliatesColumn />}
          </div>
        </div>

        <div className="mt-8 border-t border-black/5 pt-8 text-center">
          <Copyright storeName={storeName} showLegal={showLegal} termsContent={termsContent} />
        </div>
      </div>
    </footer>
  )
}
