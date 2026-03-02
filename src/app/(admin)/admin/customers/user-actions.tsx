"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { suspendUser, reactivateUser, deleteUser, permanentlyDeleteUser } from "@/actions/users"
import type { UserStatus } from "@prisma/client"

interface UserActionsProps {
  userId: string
  status: UserStatus
  isSelf: boolean
  isSuperAdmin: boolean
}

export function UserActions({ userId, status, isSelf, isSuperAdmin }: UserActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  if (isSelf || isSuperAdmin) return null

  function handleAction(action: () => Promise<{ error?: string; success?: boolean }>, successMsg: string) {
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(successMsg)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      {status === "ACTIVE" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!confirm("Suspend this user? They will be logged out and unable to sign in.")) return
            handleAction(() => suspendUser(userId), "User suspended")
          }}
          disabled={isPending}
        >
          Suspend
        </Button>
      )}

      {status === "SUSPENDED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction(() => reactivateUser(userId), "User reactivated")}
          disabled={isPending}
        >
          Reactivate
        </Button>
      )}

      {status !== "DELETED" && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            if (!confirm("Delete this user? They will be marked as deleted and unable to sign in.")) return
            handleAction(() => deleteUser(userId), "User deleted")
          }}
          disabled={isPending}
        >
          Delete
        </Button>
      )}

      {status === "DELETED" && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(() => reactivateUser(userId), "User restored")}
            disabled={isPending}
          >
            Restore
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (!confirm("PERMANENTLY delete this user? This cannot be undone. Order history will be preserved.")) return
              if (!confirm("Are you absolutely sure? This action is irreversible.")) return
              handleAction(() => permanentlyDeleteUser(userId), "User permanently deleted")
            }}
            disabled={isPending}
          >
            Permanently Delete
          </Button>
        </>
      )}
    </div>
  )
}
