"use client"

import { useState, useEffect } from "react"
import { sanitizeHtml } from "@/lib/sanitize"

interface PopupColors {
  overlay?: string
  overlayOpacity?: number
  bg?: string
  headline?: string
  text?: string
  agreeBg?: string
  agreeText?: string
  disagreeBg?: string
  disagreeText?: string
}

interface EntryPopupProps {
  enabled: boolean
  showLogo: boolean
  logoUrl: string
  logoHeight: string
  storeName: string
  headline: string
  content: string
  agreeText: string
  disagreeText: string
  disagreeUrl: string
  persistence: string // "every_visit" | "session" | "permanent"
  colors?: PopupColors
}

const STORAGE_KEY = "entry_popup_accepted"

export function EntryPopup({
  enabled,
  showLogo,
  logoUrl,
  logoHeight,
  storeName,
  headline,
  content,
  agreeText,
  disagreeText,
  disagreeUrl,
  persistence,
  colors = {},
}: EntryPopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Check if already accepted
    if (persistence === "permanent") {
      if (localStorage.getItem(STORAGE_KEY)) return
    } else if (persistence === "session") {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    }
    // "every_visit" — always show

    setVisible(true)
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [enabled, persistence])

  function handleAgree() {
    if (persistence === "permanent") {
      localStorage.setItem(STORAGE_KEY, "1")
    } else if (persistence === "session") {
      sessionStorage.setItem(STORAGE_KEY, "1")
    }
    setVisible(false)
    document.body.style.overflow = ""
  }

  function handleDisagree() {
    window.location.href = disagreeUrl || "https://google.com"
  }

  if (!visible) return null

  const sanitizedContent = content ? sanitizeHtml(content) : ""

  const overlayColor = colors.overlay || "#000000"
  const overlayOpacity = colors.overlayOpacity ?? 60

  // Convert hex to rgba with opacity
  const r = parseInt(overlayColor.slice(1, 3), 16) || 0
  const g = parseInt(overlayColor.slice(3, 5), 16) || 0
  const b = parseInt(overlayColor.slice(5, 7), 16) || 0
  const overlayBg = `rgba(${r},${g},${b},${overlayOpacity / 100})`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: overlayBg }}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-xl p-8 shadow-2xl"
        style={{ backgroundColor: colors.bg || "var(--color-background, #ffffff)" }}
      >
        {/* Logo */}
        {showLogo && logoUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={logoUrl}
              alt={storeName}
              className="object-contain"
              style={{ height: logoHeight ? `${logoHeight}px` : "48px" }}
            />
          </div>
        )}

        {/* Headline */}
        {headline && (
          <h2
            className="mb-4 text-center text-xl font-bold"
            style={{ color: colors.headline || "var(--color-foreground)" }}
          >
            {headline}
          </h2>
        )}

        {/* Rich Text Content */}
        {sanitizedContent && (
          <div
            className="prose prose-sm mb-6 max-w-none text-center dark:prose-invert"
            style={{ color: colors.text || undefined }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAgree}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: colors.agreeBg || "var(--color-primary)",
              color: colors.agreeText || "#ffffff",
            }}
          >
            {agreeText || "I Agree"}
          </button>
          <button
            onClick={handleDisagree}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: colors.disagreeBg || "transparent",
              color: colors.disagreeText || "var(--color-foreground)",
              borderColor: colors.disagreeBg || "var(--color-border, #d1d5db)",
            }}
          >
            {disagreeText || "I Disagree"}
          </button>
        </div>
      </div>
    </div>
  )
}
