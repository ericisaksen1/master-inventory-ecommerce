import { ResetPasswordForm } from "./reset-password-form"
import Link from "next/link"
import { Suspense } from "react"

export const metadata = {
  title: "Reset Password",
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h2 className="mb-1 text-center text-lg font-semibold text-white">
        Reset your password
      </h2>
      <p className="mb-5 text-center text-sm text-white/60">
        Enter your new password below
      </p>
      <Suspense fallback={<p className="text-center text-sm text-white/60">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-white/60">
        <Link href="/login" className="font-medium text-white hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
