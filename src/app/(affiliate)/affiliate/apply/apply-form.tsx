"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { applyForAffiliate } from "@/actions/affiliates"

interface AffiliateApplyFormProps {
  isLoggedIn: boolean
}

export function AffiliateApplyForm({ isLoggedIn }: AffiliateApplyFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-border bg-muted p-6 text-center">
        <p className="text-secondary">Please log in to apply for the affiliate program.</p>
        <a href="/login?returnUrl=/affiliate/apply">
          <Button className="mt-4">Log In</Button>
        </a>
      </div>
    )
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await applyForAffiliate(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Application submitted! We'll review it shortly.")
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        label="Website or social media URL (optional)"
        name="website"
        type="url"
        placeholder="https://..."
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Tell us about yourself (optional)
        </label>
        <textarea
          name="bio"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          placeholder="How do you plan to promote our products?"
        />
      </div>
      <Input
        label="Payment email (for commission payouts)"
        name="paymentEmail"
        type="email"
        placeholder="you@example.com"
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Preferred payout method
        </label>
        <select
          name="paymentMethod"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="VENMO">Venmo</option>
          <option value="CASHAPP">Cash App</option>
          <option value="BITCOIN">Bitcoin</option>
        </select>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting..." : "Apply to Become an Affiliate"}
      </Button>
    </form>
  )
}
