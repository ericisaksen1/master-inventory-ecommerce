"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface CookieConsentProps {
  hasTracking: boolean
}

export function CookieConsent({ hasTracking }: CookieConsentProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasTracking) return
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) setVisible(true)
  }, [hasTracking])

  function accept() {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-secondary">
          We use cookies and analytics to improve your experience.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-[var(--radius)] bg-[var(--color-button-bg)] px-4 py-2 text-sm font-medium text-[var(--color-button-text)]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
