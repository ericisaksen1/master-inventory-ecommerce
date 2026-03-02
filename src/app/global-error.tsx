"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>An unexpected error occurred.</p>
          <button
            onClick={reset}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#111", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
