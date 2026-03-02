"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/admin/blog", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
  { href: "/admin/blog/tags", label: "Tags" },
]

export function BlogAdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-4 border-b border-border">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/admin/blog"
            ? pathname === "/admin/blog"
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-secondary hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
