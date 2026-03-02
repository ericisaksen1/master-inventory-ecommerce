"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/affiliate/dashboard", label: "Overview" },
  { href: "/affiliate/links", label: "Referral Links" },
  { href: "/affiliate/commissions", label: "Commissions" },
  { href: "/affiliate/payouts", label: "Payouts" },
]

export function AffiliateNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-background p-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-foreground text-background"
              : "text-secondary hover:bg-muted hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
