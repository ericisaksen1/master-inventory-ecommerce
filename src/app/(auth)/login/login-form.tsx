"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, loginWithMagicLink } from "@/actions/auth"
import { Turnstile } from "@/components/ui/turnstile"

const glassInput = "!bg-white/10 !border-white/20 !text-white placeholder:!text-white/40"
const glassLabel = "[&_label]:!text-white/80"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"password" | "magic">("password")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    try {
      if (mode === "password") {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error)
        }
      } else {
        const result = await loginWithMagicLink(formData)
        if (result?.error) {
          setError(result.error)
        } else {
          setMagicLinkSent(true)
        }
      }
    } catch {
      // signIn redirect throws NEXT_REDIRECT which is expected
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <p className="text-sm text-white/60">
          Check your email for a magic link to sign in.
        </p>
        <Button
          variant="ghost"
          className="mt-4 text-white/60 hover:text-white"
          onClick={() => {
            setMagicLinkSent(false)
            setMode("password")
          }}
        >
          Back to login
        </Button>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className={glassLabel}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className={glassInput}
        />
      </div>

      {mode === "password" && (
        <>
          <div className={glassLabel}>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              className={glassInput}
            />
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-white/60 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
        </>
      )}

      <Turnstile />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "Please wait..."
          : mode === "password"
            ? "Log in"
            : "Send magic link"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-white/40">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full !border-white/20 !text-white hover:!bg-white/10"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
      >
        {mode === "password"
          ? "Sign in with magic link"
          : "Sign in with password"}
      </Button>
    </form>
  )
}
