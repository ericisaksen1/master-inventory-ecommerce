"use client"

import { useState } from "react"
import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile"

interface TurnstileProps {
  className?: string
}

export function Turnstile({ className }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [token, setToken] = useState("")

  if (!siteKey) {
    return null
  }

  return (
    <div className={className}>
      <input type="hidden" name="cf-turnstile-response" value={token} />
      <TurnstileWidget
        siteKey={siteKey}
        onSuccess={setToken}
        options={{
          theme: "auto",
          size: "flexible",
        }}
      />
    </div>
  )
}
