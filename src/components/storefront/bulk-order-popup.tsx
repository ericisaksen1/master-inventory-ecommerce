"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { requestBulkOrderPriceList } from "@/actions/bulk-order"

interface BulkOrderPopupProps {
  enabled: boolean
  delaySeconds: number
  showAfterEntry: boolean
}

const STORAGE_KEY = "bulk_order_popup_dismissed"
const ENTRY_POPUP_KEY = "entry_popup_accepted"
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

function isDismissed(): boolean {
  const val = localStorage.getItem(STORAGE_KEY)
  if (!val) return false
  const ts = parseInt(val, 10)
  if (isNaN(ts)) return false
  return Date.now() - ts < DISMISS_DURATION_MS
}

function setDismissed(): void {
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

export function BulkOrderPopup({ enabled, delaySeconds, showAfterEntry }: BulkOrderPopupProps) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const open = useCallback(() => {
    setVisible(true)
    setSubmitted(false)
    setError("")
    setEmail("")
    document.body.style.overflow = "hidden"
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    document.body.style.overflow = ""
  }, [])

  // Auto-show after entry popup or after delay
  useEffect(() => {
    if (!enabled) return

    if (showAfterEntry) {
      // Listen for entry popup "I Agree" event
      let timer: ReturnType<typeof setTimeout>
      function handleEntryAccepted() {
        if (isDismissed()) return
        timer = setTimeout(() => open(), (delaySeconds || 2) * 1000)
      }
      window.addEventListener("entry-popup-accepted", handleEntryAccepted)
      return () => {
        window.removeEventListener("entry-popup-accepted", handleEntryAccepted)
        clearTimeout(timer)
      }
    } else {
      // No entry popup dependency — just show after delay
      if (isDismissed()) return
      const timer = setTimeout(() => open(), (delaySeconds || 5) * 1000)
      return () => clearTimeout(timer)
    }
  }, [enabled, delaySeconds, showAfterEntry, open])

  // Listen for global open event (menu item / CTA button)
  useEffect(() => {
    if (!enabled) return
    function handleOpen() {
      open()
    }
    window.addEventListener("open-bulk-order-popup", handleOpen)
    return () => window.removeEventListener("open-bulk-order-popup", handleOpen)
  }, [enabled, open])

  function handleDismiss() {
    setDismissed()
    close()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await requestBulkOrderPriceList(email)
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
        setDismissed()
        setTimeout(() => close(), 3000)
      }
    })
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-xl p-8 shadow-2xl"
        style={{ backgroundColor: "var(--color-background, #ffffff)" }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-black/5"
          style={{ color: "var(--color-foreground)" }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-primary, #00ff41) 15%, transparent)" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary, #00ff41)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h2
          className="mb-3 text-center text-xl font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Bulk Order Price List
        </h2>

        {/* Subtext */}
        <p
          className="mb-6 text-center text-sm"
          style={{ color: "var(--color-secondary, #6b7280)" }}
        >
          Save over <strong>60%</strong> on all your favorite research chemical peptides.
          Enter your email to receive our full price list.
        </p>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="mb-2 flex justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #00ff41)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>
              Check your email for the price list!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border, #d1d5db)",
                color: "var(--color-foreground)",
                backgroundColor: "var(--color-background, #ffffff)",
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary, #00ff41)",
                  color: "#000000",
                }}
              >
                {isPending ? "Sending..." : "Request Price List"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-foreground)",
                  borderColor: "var(--color-border, #d1d5db)",
                }}
              >
                No thanks
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
