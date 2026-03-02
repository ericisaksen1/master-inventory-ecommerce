import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AffiliateApplyForm } from "./apply-form"

export const metadata = { title: "Become an Affiliate" }

export default async function AffiliateApplyPage() {
  const session = await auth()

  // Check if already an affiliate
  if (session?.user?.id) {
    const existing = await prisma.affiliate.findUnique({
      where: { userId: session.user.id },
    })

    if (existing?.status === "APPROVED") redirect("/affiliate/dashboard")
    if (existing?.status === "PENDING") {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
            <h1 className="text-2xl font-bold">Application Under Review</h1>
            <p className="mt-2 text-secondary">
              Thanks for applying! We&apos;re reviewing your application and will get back to you soon.
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Become an Affiliate</h1>
      <p className="mt-2 text-secondary">
        Earn commissions by promoting our products. Share your unique referral link
        and earn a percentage of every sale you drive.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">How it works</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-secondary">
          <li>Apply below and get approved by our team</li>
          <li>Get your unique referral link and share it anywhere</li>
          <li>When someone clicks your link and makes a purchase, you earn a commission</li>
          <li>Track your earnings in your affiliate dashboard</li>
        </ol>
      </div>

      <div className="mt-8">
        <AffiliateApplyForm isLoggedIn={!!session?.user} />
      </div>
    </div>
  )
}
