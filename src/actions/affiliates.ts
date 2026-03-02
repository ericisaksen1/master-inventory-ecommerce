"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { generateReferralCode } from "@/lib/utils"
import type { AffiliateStatus, CommissionStatus } from "@prisma/client"
import { notifyAdminAffiliateApplication } from "@/lib/email/notify"

// ============================================================
// AFFILIATE APPLICATION (customer-facing)
// ============================================================

export async function applyForAffiliate(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Please log in first" }

  // Check if already an affiliate
  const existing = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (existing) {
    if (existing.status === "APPROVED") return { error: "You're already an approved affiliate" }
    if (existing.status === "PENDING") return { error: "Your application is already under review" }
    if (existing.status === "REJECTED") {
      // Allow re-application
      await prisma.affiliate.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          bio: (formData.get("bio") as string) || null,
          website: (formData.get("website") as string) || null,
          paymentEmail: (formData.get("paymentEmail") as string) || null,
          paymentMethod: (formData.get("paymentMethod") as string) || null,
        },
      })
      revalidatePath("/affiliate")
      return { success: true }
    }
  }

  const referralCode = generateReferralCode(session.user.name || "AFF")

  await prisma.affiliate.create({
    data: {
      userId: session.user.id,
      referralCode,
      bio: (formData.get("bio") as string) || null,
      website: (formData.get("website") as string) || null,
      paymentEmail: (formData.get("paymentEmail") as string) || null,
      paymentMethod: (formData.get("paymentMethod") as string) || null,
    },
  })

  void notifyAdminAffiliateApplication(session.user.name || "Unknown", session.user.email || "")

  revalidatePath("/affiliate")
  return { success: true }
}

// ============================================================
// AFFILIATE DASHBOARD DATA (affiliate-facing)
// ============================================================

export async function getAffiliateStats() {
  const session = await auth()
  if (!session?.user?.id) return null

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (!affiliate || affiliate.status !== "APPROVED") return null

  const [totalClicks, totalOrders, commissions] = await Promise.all([
    prisma.affiliateClick.count({ where: { affiliateId: affiliate.id } }),
    prisma.order.count({ where: { affiliateId: affiliate.id } }),
    prisma.affiliateCommission.findMany({
      where: { affiliateId: affiliate.id },
      select: { amount: true, status: true },
    }),
  ])

  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0)
  const pendingEarnings = commissions
    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const paidEarnings = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const conversionRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : "0.0"

  return {
    referralCode: affiliate.referralCode,
    commissionRate: Number(affiliate.commissionRate),
    totalClicks,
    totalOrders,
    totalEarned,
    pendingEarnings,
    paidEarnings,
    conversionRate,
  }
}

export async function getAffiliateCommissions(page: number = 1) {
  const session = await auth()
  if (!session?.user?.id) return { commissions: [], total: 0 }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (!affiliate) return { commissions: [], total: 0 }

  const take = 20
  const skip = (page - 1) * take

  const [commissions, total] = await Promise.all([
    prisma.affiliateCommission.findMany({
      where: { affiliateId: affiliate.id },
      include: {
        order: { select: { orderNumber: true, total: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.affiliateCommission.count({ where: { affiliateId: affiliate.id } }),
  ])

  return { commissions, total }
}

export async function getAffiliateClicks(page: number = 1) {
  const session = await auth()
  if (!session?.user?.id) return { clicks: [], total: 0 }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (!affiliate) return { clicks: [], total: 0 }

  const take = 20
  const skip = (page - 1) * take

  const [clicks, total] = await Promise.all([
    prisma.affiliateClick.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.affiliateClick.count({ where: { affiliateId: affiliate.id } }),
  ])

  return { clicks, total }
}

export async function getAffiliateRecentOrders() {
  const session = await auth()
  if (!session?.user?.id) return []

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (!affiliate) return []

  return prisma.order.findMany({
    where: { affiliateId: affiliate.id },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      commissions: {
        where: { affiliateId: affiliate.id },
        select: { amount: true, status: true, type: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
}

export async function getAffiliatePaidCommissions() {
  const session = await auth()
  if (!session?.user?.id) return { commissions: [], total: 0 }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  })

  if (!affiliate) return { commissions: [], total: 0 }

  const [commissions, total] = await Promise.all([
    prisma.affiliateCommission.findMany({
      where: { affiliateId: affiliate.id, status: "PAID" },
      include: {
        order: { select: { orderNumber: true, total: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 50,
    }),
    prisma.affiliateCommission.count({
      where: { affiliateId: affiliate.id, status: "PAID" },
    }),
  ])

  return { commissions, total }
}

// ============================================================
// ADMIN AFFILIATE MANAGEMENT
// ============================================================

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function updateAffiliateStatus(
  affiliateId: string,
  status: AffiliateStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const data: Record<string, unknown> = { status }

    if (status === "APPROVED") {
      data.approvedAt = new Date()

      // Update user role to AFFILIATE
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { userId: true },
      })
      if (affiliate) {
        await prisma.user.update({
          where: { id: affiliate.userId },
          data: { role: "AFFILIATE" },
        })
      }
    }

    await prisma.affiliate.update({
      where: { id: affiliateId },
      data,
    })

    revalidatePath("/admin/affiliates")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update affiliate status" }
  }
}

export async function updateAffiliateRate(
  affiliateId: string,
  rate: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    if (rate < 0 || rate > 100) {
      return { success: false, error: "Rate must be between 0 and 100" }
    }

    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { commissionRate: rate },
    })

    revalidatePath("/admin/affiliates")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update commission rate" }
  }
}

export async function updateCommissionStatus(
  commissionId: string,
  status: CommissionStatus,
  paidRef?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAdmin()

    const data: Record<string, unknown> = { status }

    if (status === "PAID") {
      data.paidAt = new Date()
      data.paidBy = session.user.id
      data.paidRef = paidRef || null
    }

    await prisma.affiliateCommission.update({
      where: { id: commissionId },
      data,
    })

    revalidatePath("/admin/affiliates")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update commission status" }
  }
}

export async function updateAffiliateParent(
  affiliateId: string,
  parentId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    // Prevent self-reference
    if (parentId === affiliateId) {
      return { success: false, error: "An affiliate cannot be their own parent" }
    }

    // Prevent circular reference
    if (parentId) {
      const parent = await prisma.affiliate.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      })
      if (parent?.parentId === affiliateId) {
        return { success: false, error: "This would create a circular reference" }
      }
    }

    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { parentId },
    })

    revalidatePath(`/admin/affiliates/${affiliateId}`)
    revalidatePath("/admin/affiliates")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update parent affiliate" }
  }
}
