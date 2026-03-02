"use client"

import { useState, useEffect } from "react"

interface ReservationTimerProps {
  expiresAt: string
}

export function ReservationTimer({ expiresAt }: ReservationTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemaining(secs)
      if (secs <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`

  if (remaining <= 0) {
    return (
      <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
        Reservation expired — your items may no longer be held. Place your order to check availability.
      </div>
    )
  }

  const colorClass =
    remaining > 120
      ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400"
      : remaining > 60
        ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"

  return (
    <div className={`rounded-md px-3 py-2 text-sm ${colorClass}`}>
      Items held for <span className="font-mono font-semibold">{display}</span>
    </div>
  )
}
