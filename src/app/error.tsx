"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
        500
      </p>
      <h1 className="mt-2 text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-gray-500">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-[var(--radius)] shadow-[var(--shadow)] bg-[var(--color-button-bg,#111)] px-5 py-2.5 text-sm font-medium text-[var(--color-button-text,#fff)] transition hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
        >
          Go home
        </a>
      </div>
    </div>
  )
}
