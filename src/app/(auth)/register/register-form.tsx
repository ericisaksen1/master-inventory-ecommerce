"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { register } from "@/actions/auth"
import { Turnstile } from "@/components/ui/turnstile"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    try {
      const result = await register(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push("/login?registered=true")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        label="Full name"
        name="name"
        type="text"
        placeholder="John Doe"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        required
        minLength={8}
        autoComplete="new-password"
      />

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        placeholder="Repeat your password"
        required
        minLength={8}
        autoComplete="new-password"
      />

      <Turnstile />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
