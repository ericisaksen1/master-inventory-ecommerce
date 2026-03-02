"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { notifyCustomerPasswordChanged } from "@/lib/email/notify"

async function requireUser() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

export async function updateProfile(formData: FormData) {
  const session = await requireUser()

  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  // Check if email is taken by another user
  if (email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "This email is already in use" }
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  })

  revalidatePath("/account")
  return { success: "Profile updated" }
}

export async function changePassword(formData: FormData) {
  const session = await requireUser()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user?.passwordHash) {
    return { error: "Cannot change password for this account type" }
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { error: "Current password is incorrect" }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  void notifyCustomerPasswordChanged(session.user.email!, session.user.name || "User")

  return { success: "Password changed" }
}
