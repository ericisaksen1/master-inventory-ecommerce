"use client"

import { useActionState } from "react"
import { verifyPasscode } from "@/actions/passcode"

export function PasscodeForm() {
  const [state, action, isPending] = useActionState(verifyPasscode, null)

  return (
    <form action={action}>
      <input
        type="password"
        name="passcode"
        placeholder="Enter passcode"
        autoFocus
        required
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-secondary focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
      />
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Verifying..." : "Enter"}
      </button>
    </form>
  )
}
