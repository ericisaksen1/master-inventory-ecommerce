"use client"

import { useState, useTransition } from "react"
import { updateUserRole } from "@/actions/users"
import type { UserRole } from "@prisma/client"

interface RoleSelectProps {
  userId: string
  currentRole: UserRole
  isSelf: boolean
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "AFFILIATE", label: "Affiliate" },
  { value: "ADMIN", label: "Admin" },
]

export function RoleSelect({ userId, currentRole, isSelf }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  if (currentRole === "SUPER_ADMIN" || isSelf) {
    return (
      <span className="text-sm text-gray-500">
        {currentRole === "SUPER_ADMIN" ? "Super Admin" : currentRole}
      </span>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole
    if (newRole === currentRole) return

    if (newRole === "ADMIN") {
      if (!confirm("Are you sure you want to make this user an Admin? They will have full access to the admin panel.")) {
        e.target.value = currentRole
        return
      }
    }

    setError("")
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <select
        value={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
      >
        {roleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
