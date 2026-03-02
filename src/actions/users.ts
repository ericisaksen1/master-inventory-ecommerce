"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { UserRole } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

const ASSIGNABLE_ROLES: UserRole[] = ["CUSTOMER", "AFFILIATE", "ADMIN"]

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await requireSuperAdmin()

  if (userId === session.user.id) {
    return { error: "You cannot change your own role" }
  }

  if (newRole === "SUPER_ADMIN") {
    return { error: "Cannot assign SUPER_ADMIN role" }
  }

  if (!ASSIGNABLE_ROLES.includes(newRole)) {
    return { error: "Invalid role" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return { error: "User not found" }
  }

  if (user.role === "SUPER_ADMIN") {
    return { error: "Cannot change another super admin's role" }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function suspendUser(userId: string) {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    return { error: "You cannot suspend yourself" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }
  if (user.role === "SUPER_ADMIN") return { error: "Cannot suspend a super admin" }
  if (user.status === "SUSPENDED") return { error: "User is already suspended" }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function reactivateUser(userId: string) {
  await requireAdmin()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }
  if (user.status === "ACTIVE") return { error: "User is already active" }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    return { error: "You cannot delete yourself" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }
  if (user.role === "SUPER_ADMIN") return { error: "Cannot delete a super admin" }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "DELETED" },
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function permanentlyDeleteUser(userId: string) {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    return { error: "You cannot delete yourself" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }
  if (user.role === "SUPER_ADMIN") return { error: "Cannot delete a super admin" }

  // Delete related records first to avoid foreign key constraints
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.account.deleteMany({ where: { userId } })
  await prisma.wishlistItem.deleteMany({ where: { userId } })
  await prisma.productReview.deleteMany({ where: { userId } })
  await prisma.address.deleteMany({ where: { userId } })
  // Cascade handles AffiliateClick + AffiliateCommission
  await prisma.affiliate.deleteMany({ where: { userId } })
  await prisma.cart.deleteMany({ where: { userId } })

  // Orders are preserved — onDelete: SetNull nullifies userId automatically
  await prisma.user.delete({ where: { id: userId } })

  revalidatePath("/admin/customers")
  return { success: true }
}
