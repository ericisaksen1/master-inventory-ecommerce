"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

// Context so individual pages can provide a contextual "Edit" link
const AdminEditContext = createContext<{
  editHref: string | null
  editLabel: string | null
  setEdit: (href: string, label: string) => void
  clearEdit: () => void
}>({ editHref: null, editLabel: null, setEdit: () => {}, clearEdit: () => {} })

export function AdminEditProvider({ children }: { children: ReactNode }) {
  const [editHref, setEditHref] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState<string | null>(null)

  function setEdit(href: string, label: string) {
    setEditHref(href)
    setEditLabel(label)
  }

  function clearEdit() {
    setEditHref(null)
    setEditLabel(null)
  }

  return (
    <AdminEditContext.Provider value={{ editHref, editLabel, setEdit, clearEdit }}>
      {children}
    </AdminEditContext.Provider>
  )
}

/** Render this in any page to show an "Edit ..." link in the admin toolbar. */
export function SetAdminEdit({ href, label }: { href: string; label: string }) {
  const { setEdit, clearEdit } = useContext(AdminEditContext)
  useEffect(() => {
    setEdit(href, label)
    return () => clearEdit()
  }, [href, label, setEdit, clearEdit])
  return null
}

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/settings", label: "Settings" },
]

export function AdminToolbar() {
  const { data: session } = useSession()
  const { editHref, editLabel } = useContext(AdminEditContext)

  const role = session?.user?.role
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.style.setProperty("--toolbar-height", "32px")
      return () => {
        document.documentElement.style.setProperty("--toolbar-height", "0px")
      }
    }
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <div className="flex h-8 items-center bg-gray-900 px-4 text-xs text-gray-300">
      <nav className="flex items-center gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-white"
          >
            {link.label}
          </Link>
        ))}
        {editHref && (
          <>
            <span className="text-gray-600">|</span>
            <Link
              href={editHref}
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              {editLabel}
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
