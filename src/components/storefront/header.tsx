import Link from "next/link"
import { auth } from "@/auth"
import { UserMenu } from "./user-menu"
import { CartButton } from "./cart-button"
import { SearchModal } from "./search-modal"
import { MobileMenu } from "./mobile-menu"
import { getCartCount } from "@/actions/cart"
import { getSettings } from "@/lib/settings"
import { getMenuItems } from "@/actions/menus"
import { BulkOrderTrigger } from "./bulk-order-trigger"

interface MenuChild {
  id: string
  label: string
  url: string
  cssClass: string | null
  linkTarget: string | null
  visibility: string
  affiliateVisibility: string
}

interface HeaderMenuItem {
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

function MenuLink({
  item,
  className,
}: {
  item: { label: string; url: string; linkTarget: string | null }
  className: string
}) {
  if (item.url === "#bulk-order") {
    return <BulkOrderTrigger className={className} label={item.label} />
  }
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

function NavItems({ items }: { items: HeaderMenuItem[] }) {
  return (
    <>
      {items.map((item) => {
        const className = `text-sm text-[var(--header-nav-color)] hover:text-[var(--header-nav-hover)] transition-colors${item.cssClass ? ` ${item.cssClass}` : ""}`
        const hasChildren = item.children && item.children.length > 0

        if (!hasChildren) {
          return <MenuLink key={item.id} item={item} className={className} />
        }

        return (
          <div key={item.id} className="group relative">
            <span className="flex cursor-pointer items-center gap-1">
              <MenuLink item={item} className={className} />
              <svg className="h-3 w-3 text-[var(--header-nav-color)] transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </span>
            <div className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-xl bg-background/95 py-2 shadow-lg backdrop-blur-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => {
                const childClass = `block px-5 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-colors${child.cssClass ? ` ${child.cssClass}` : ""}`
                return <MenuLink key={child.id} item={child} className={childClass} />
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

export async function Header() {
  const session = await auth()
  const [cartCount, settings, headerMenuItems] = await Promise.all([
    getCartCount(),
    getSettings(["store_name", "site_logo_url", "logo_height", "header_layout", "enable_wishlist", "enable_affiliates"]),
    getMenuItems("header"),
  ])

  const storeName = settings.store_name || "Store"
  const logoUrl = settings.site_logo_url
  const logoHeight = settings.logo_height
  const headerLayout = settings.header_layout || "classic"
  const wishlistEnabled = settings.enable_wishlist !== "false"
  const affiliatesEnabled = settings.enable_affiliates !== "false"

  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role
  const isAffiliate = userRole === "AFFILIATE" || userRole === "ADMIN" || userRole === "SUPER_ADMIN"

  const rawItems = headerMenuItems as unknown as HeaderMenuItem[]
  const items = filterMenuItems(rawItems, isLoggedIn, isAffiliate).map((item) => ({
    ...item,
    children: filterMenuItems(item.children, isLoggedIn, isAffiliate),
  }))
  const headerH = logoHeight ? `${Math.max(Number(logoHeight) + 24, 64)}px` : "64px"

  const mobileItems = items.map((i) => ({
    label: i.label,
    url: i.url,
    cssClass: i.cssClass,
    linkTarget: i.linkTarget,
    children: i.children?.map((c) => ({
      label: c.label,
      url: c.url,
      cssClass: c.cssClass,
      linkTarget: c.linkTarget,
    })),
  }))

  const logo = (
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
  )

  const utils = (
    <>
      <SearchModal />
      {wishlistEnabled && (
        <Link
          href="/wishlist"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--header-icon-color)] hover:text-[var(--header-icon-hover)] transition-colors"
          aria-label="Wishlist"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </Link>
      )}
      <CartButton count={cartCount} />
      <UserMenu user={session?.user ?? null} affiliatesEnabled={affiliatesEnabled} />
    </>
  )

  /* ── Classic: Logo left | Nav center | Utils right ── */
  if (headerLayout === "classic") {
    return (
      <header className="sticky top-0 z-40 bg-[var(--header-bg)]">
        {/* Mobile: logo full-width on top, utils below */}
        <div className="flex flex-col px-4 md:hidden">
          <div className="flex w-full items-center justify-center py-2">{logo}</div>
          <div className="flex items-center justify-center gap-2 pb-2">
            {utils}
            <MobileMenu items={mobileItems} />
          </div>
        </div>
        {/* Desktop: classic 3-column layout */}
        <div
          className="container-header hidden items-center px-4 sm:px-6 lg:px-8 md:flex"
          style={{ height: headerH }}
        >
          <div className="flex w-1/4 shrink-0 items-center">{logo}</div>
          <nav className="flex flex-1 items-center justify-center gap-8">
            <NavItems items={items} />
          </nav>
          <div className="flex w-1/4 shrink-0 items-center justify-end gap-2">
            {utils}
          </div>
        </div>
      </header>
    )
  }

  /* ── Centered: Utils top-right | Logo centered | Nav centered below ── */
  if (headerLayout === "centered") {
    return (
      <header className="sticky top-0 z-40 bg-[var(--header-bg)]">
        <div className="container-header px-4 sm:px-6 lg:px-8">
          {/* Mobile: logo full-width, utils centered below */}
          <div className="flex flex-col items-center md:hidden">
            <div className="flex w-full items-center justify-center py-2">{logo}</div>
            <div className="flex items-center gap-2 pb-2">
              {utils}
              <MobileMenu items={mobileItems} />
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center justify-end gap-2 py-2">
              {utils}
            </div>
            <div className="flex flex-col items-center pb-3">
              <div style={{ height: logoHeight ? `${logoHeight}px` : "32px" }}>{logo}</div>
              <nav className="mt-3 flex items-center gap-8">
                <NavItems items={items} />
              </nav>
            </div>
          </div>
        </div>
      </header>
    )
  }

  /* ── Minimal: Logo left | Utils + hamburger right, no nav links on desktop ── */
  if (headerLayout === "minimal") {
    return (
      <header className="sticky top-0 z-40 bg-[var(--header-bg)]">
        {/* Mobile: logo full-width on top, utils below */}
        <div className="flex flex-col px-4 md:hidden">
          <div className="flex w-full items-center justify-center py-2">{logo}</div>
          <div className="flex items-center justify-center gap-2 pb-2">
            {utils}
            <MobileMenu items={mobileItems} alwaysShow />
          </div>
        </div>
        {/* Desktop */}
        <div
          className="container-header hidden items-center px-4 sm:px-6 lg:px-8 md:flex"
          style={{ height: headerH }}
        >
          <div className="flex shrink-0 items-center">{logo}</div>
          <div className="ml-auto flex items-center gap-2">
            {utils}
            <MobileMenu items={mobileItems} alwaysShow />
          </div>
        </div>
      </header>
    )
  }

  /* ── Stacked: Logo + utils top row | Full-width nav bar below ── */
  return (
    <header className="sticky top-0 z-40 bg-[var(--header-bg)]">
      {/* Mobile: logo full-width on top, utils below */}
      <div className="flex flex-col px-4 md:hidden">
        <div className="flex w-full items-center justify-center py-2">{logo}</div>
        <div className="flex items-center justify-center gap-2 pb-2">
          {utils}
          <MobileMenu items={mobileItems} />
        </div>
      </div>
      {/* Desktop */}
      <div
        className="container-header hidden items-center px-4 sm:px-6 lg:px-8 md:flex"
        style={{ height: headerH }}
      >
        <div className="flex shrink-0 items-center">{logo}</div>
        <div className="ml-auto flex items-center gap-2">
          {utils}
        </div>
      </div>
      <div className="hidden bg-muted/50 md:block">
        <nav className="container-header flex items-center gap-8 px-4 py-2.5 sm:px-6 lg:px-8">
          <NavItems items={items} />
        </nav>
      </div>
    </header>
  )
}
