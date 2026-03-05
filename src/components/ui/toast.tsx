"use client"

import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface CartToastData {
  id: string
  name: string
  image?: string | null
  variant?: string | null
  price: string
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"]) => void
  cartToast: (details: Omit<CartToastData, "id">) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [cartToasts, setCartToasts] = useState<CartToastData[]>([])

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const cartToast = useCallback((details: Omit<CartToastData, "id">) => {
    const id = Math.random().toString(36).substring(7)
    setCartToasts((prev) => [...prev, { ...details, id }])
    setTimeout(() => {
      setCartToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissCartToast = useCallback((id: string) => {
    setCartToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, cartToast }}>
      {children}

      {/* Simple toasts - bottom right */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all animate-in slide-in-from-right-full duration-300",
              t.type === "success" && "bg-green-600",
              t.type === "error" && "bg-red-600",
              t.type === "info" && "bg-blue-600"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Cart toasts - top right */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {cartToasts.map((ct) => (
          <div
            key={ct.id}
            onClick={() => dismissCartToast(ct.id)}
            className="w-80 cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-xl animate-in slide-in-from-right-full duration-300"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Added to cart
            </div>
            <div className="flex gap-3">
              {ct.image && (
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]">
                  <img
                    src={ct.image}
                    alt={ct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{ct.name}</p>
                <p className="mt-0.5 text-sm text-[var(--color-secondary)]">
                  {ct.variant && <>{ct.variant} &middot; </>}
                  {ct.price}
                </p>
              </div>
            </div>
            <Link
              href="/cart"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)]"
            >
              View Cart
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
