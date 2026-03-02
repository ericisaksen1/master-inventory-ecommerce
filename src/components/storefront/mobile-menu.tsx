"use client"

import { useState } from "react"
import Link from "next/link"

interface ChildItem {
  label: string
  url: string
  cssClass?: string | null
  linkTarget?: string | null
}

interface MobileMenuItem {
  label: string
  url: string
  cssClass?: string | null
  linkTarget?: string | null
  children?: ChildItem[]
}

interface MobileMenuProps {
  items: MobileMenuItem[]
  alwaysShow?: boolean
}

function MobileMenuLink({
  item,
  onClose,
  className,
}: {
  item: { label: string; url: string; cssClass?: string | null; linkTarget?: string | null }
  onClose: () => void
  className: string
}) {
  return item.linkTarget === "_blank" ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={onClose} className={className}>
      {item.label}
    </a>
  ) : (
    <Link href={item.url} onClick={onClose} className={className}>
      {item.label}
    </Link>
  )
}

function CollapsibleItem({ item, onClose }: { item: MobileMenuItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const linkClass = `text-sm font-medium text-secondary hover:text-primary${item.cssClass ? ` ${item.cssClass}` : ""}`

  if (!hasChildren) {
    return <MobileMenuLink item={item} onClose={onClose} className={linkClass} />
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <MobileMenuLink item={item} onClose={onClose} className={linkClass + " flex-1"} />
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex h-6 w-6 items-center justify-center rounded text-secondary hover:text-foreground"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="ml-3 mt-1 space-y-1 border-l-2 border-border pl-3">
          {item.children!.map((child, j) => {
            const childClass = `block text-sm text-secondary hover:text-primary${child.cssClass ? ` ${child.cssClass}` : ""}`
            return <MobileMenuLink key={j} item={child} onClose={onClose} className={childClass} />
          })}
        </div>
      )}
    </div>
  )
}

export function MobileMenu({ items, alwaysShow }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div className={alwaysShow ? "" : "md:hidden"}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:text-primary"
        aria-label="Menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-border bg-background px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            {items.map((item, i) => (
              <CollapsibleItem key={i} item={item} onClose={() => setOpen(false)} />
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
