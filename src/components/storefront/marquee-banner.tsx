"use client"

import { useRef, useState, useEffect, useCallback } from "react"

interface MarqueeBannerProps {
  content?: string
  items?: string[]
  speed?: "slow" | "medium" | "fast"
  direction?: "left" | "right"
  bgColor?: string
  textColor?: string
  separator?: string
  pauseOnHover?: boolean
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl"
  fontFamily?: string
}

const fontSizeClass: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
}

// pixels per second
const speedPx = {
  slow: 30,
  medium: 60,
  fast: 120,
}

export function MarqueeBanner({
  content,
  items,
  speed = "medium",
  direction = "left",
  bgColor = "#000000",
  textColor = "#ffffff",
  separator = "·",
  pauseOnHover = true,
  fontSize = "sm",
  fontFamily,
}: MarqueeBannerProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(2)
  const [singleWidth, setSingleWidth] = useState(0)

  const inner = items ? (
    <span className="flex items-center gap-6 whitespace-nowrap">
      {items.map((name, i) => (
        <span key={i} className="flex items-center gap-6">
          {i > 0 && <span className="opacity-50">{separator}</span>}
          <span>{name}</span>
        </span>
      ))}
    </span>
  ) : content ? (
    <span
      className="whitespace-nowrap [&_p]:inline [&_p]:my-0"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : null

  const calcCopies = useCallback(() => {
    const el = measureRef.current
    if (!el) return
    const w = el.scrollWidth
    if (w === 0) return
    setSingleWidth(w)
    // Need enough copies so that half the total width >= viewport
    const needed = Math.ceil((window.innerWidth * 2) / w) + 1
    setCopies(Math.max(needed, 2))
  }, [])

  useEffect(() => {
    calcCopies()
    window.addEventListener("resize", calcCopies)
    return () => window.removeEventListener("resize", calcCopies)
  }, [calcCopies])

  if (!inner) return null

  const pxPerSec = speedPx[speed] || speedPx.medium
  const duration = singleWidth > 0 ? `${singleWidth / pxPerSec}s` : "30s"
  const animDirection = direction === "right" ? "reverse" : "normal"

  return (
    <div
      className="w-full overflow-hidden py-3"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: fontFamily || undefined }}
    >
      <div
        className={`flex w-max ${fontSizeClass[fontSize] || "text-sm"} font-medium${pauseOnHover ? " hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `marquee-px ${duration} linear infinite ${animDirection}`,
          ["--marquee-shift" as string]: singleWidth > 0 ? `-${singleWidth}px` : "-50%",
        }}
      >
        {/* Hidden measuring element */}
        <div ref={measureRef} className="flex items-center gap-6 px-4" aria-hidden>
          {inner}
        </div>
        {/* Visible copies */}
        {Array.from({ length: copies - 1 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 px-4" aria-hidden={i > 0 || undefined}>
            {inner}
          </div>
        ))}
      </div>
    </div>
  )
}
