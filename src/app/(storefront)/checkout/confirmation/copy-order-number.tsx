"use client"

import { useState, type ReactNode } from "react"

export function CopyOrderNumber({ orderNumber, children }: { orderNumber: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const icon = copied ? (
    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  )

  if (children) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button onClick={handleCopy} className="cursor-pointer hover:opacity-70 transition-opacity" title="Copy">
          {children}
        </button>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Copy"
        >
          {icon}
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      title="Copy"
    >
      {icon}
    </button>
  )
}
