import { ForgotPasswordForm } from "./forgot-password-form"
import Link from "next/link"

export const metadata = {
  title: "Forgot Password",
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="mb-1 text-center text-lg font-semibold text-white">
        Forgot your password?
      </h2>
      <p className="mb-5 text-center text-sm text-white/60">
        Enter your email and we&apos;ll send you a reset link
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-white/60">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-white hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
