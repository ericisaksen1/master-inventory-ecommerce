import { LoginForm } from "./login-form"
import Link from "next/link"

export const metadata = {
  title: "Log In",
}

export default function LoginPage() {
  return (
    <div>
      <h2 className="mb-1 text-center text-lg font-semibold text-white">
        Welcome back
      </h2>
      <p className="mb-5 text-center text-sm text-white/60">
        Log in to your account
      </p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-white hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
