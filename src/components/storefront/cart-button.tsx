"use client"

import Link from "next/link"

interface CartButtonProps {
  count: number
}

export function CartButton({ count }: CartButtonProps) {
  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-md text-[var(--header-icon-color)] hover:text-[var(--header-icon-hover)] transition-colors"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "var(--header-cart-badge-bg)", color: "var(--header-cart-badge-text)" }}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
