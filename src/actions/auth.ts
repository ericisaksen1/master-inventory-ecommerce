"use server"

import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { notifyAdminNewUser, sendPasswordResetEmail, notifyCustomerPasswordChanged } from "@/lib/email/notify"
import crypto from "crypto"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { rateLimitByIp } from "@/lib/rate-limit"

export async function register(formData: FormData) {
  const rl = await rateLimitByIp("register", 5, 60_000)
  if (!rl.success) return { error: "Too many requests. Please try again later." }

  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstile = await verifyTurnstileToken(turnstileToken)
  if (!turnstile.success) return { error: turnstile.error }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const validated = registerSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { name, email, password } = validated.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "An account with this email already exists" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
    },
  })

  void notifyAdminNewUser(name, email)

  void prisma.subscriber.upsert({
    where: { email },
    update: {},
    create: { email, source: "registration" },
  })

  return { success: "Account created. Please log in." }
}

export async function login(formData: FormData) {
  const rl = await rateLimitByIp("login", 10, 60_000)
  if (!rl.success) return { error: "Too many requests. Please try again later." }

  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstile = await verifyTurnstileToken(turnstileToken)
  if (!turnstile.success) return { error: turnstile.error }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}

export async function loginWithMagicLink(formData: FormData) {
  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstile = await verifyTurnstileToken(turnstileToken)
  if (!turnstile.success) return { error: turnstile.error }

  const email = formData.get("email") as string

  try {
    await signIn("nodemailer", {
      email,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Failed to send magic link. Please try again." }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}

export async function requestPasswordReset(formData: FormData) {
  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstile = await verifyTurnstileToken(turnstileToken)
  if (!turnstile.success) return { error: turnstile.error }

  const email = (formData.get("email") as string)?.trim().toLowerCase()

  if (!email) {
    return { error: "Email is required" }
  }

  // Always return success to avoid leaking whether an account exists
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { success: "If an account exists with that email, you will receive a reset link." }
  }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } })

  // Generate token and expiry (1 hour)
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  })

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  void sendPasswordResetEmail(email, resetUrl)

  return { success: "If an account exists with that email, you will receive a reset link." }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token) {
    return { error: "Invalid or missing reset token" }
  }

  if (!password || password.length < 10) {
    return { error: "Password must be at least 10 characters" }
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: "Password must contain uppercase, lowercase, and a number" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken) {
    return { error: "Invalid or expired reset link" }
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    return { error: "This reset link has expired. Please request a new one." }
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
  if (!user) {
    return { error: "Account not found" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  // Clean up the used token
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

  void notifyCustomerPasswordChanged(user.email, user.name || "User")

  return { success: "Your password has been reset. You can now log in with your new password." }
}
