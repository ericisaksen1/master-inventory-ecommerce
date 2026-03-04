"use client"

export function BulkOrderTrigger({ className, label }: { className: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-bulk-order-popup"))}
      className={className}
    >
      {label}
    </button>
  )
}
