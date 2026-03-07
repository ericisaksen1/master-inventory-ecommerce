import { RegisterForm } from "./register-form"
import Link from "next/link"

export const metadata = {
  title: "Create Account",
}

export default function RegisterPage() {
  return (
    <div>
      <h2 className="mb-1 text-center text-lg font-semibold text-white">
        Create an account
      </h2>
      <p className="mb-5 text-center text-sm text-white/60">
        Get started with your new account
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-white hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
