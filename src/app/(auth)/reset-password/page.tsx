import { ResetPasswordForm } from "./reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"

export const metadata = {
  title: "Reset Password",
}

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-center text-sm text-gray-500">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
