"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getSetting } from "@/lib/settings"
import { DEFAULT_AFFILIATE_DISCOUNT_RATE } from "@/lib/constants"

// ============================================================
// CODE VALIDATION (checkout-facing)
// ============================================================

export type ValidatedCode = {
  valid: true
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: number
  affiliateId: string | null
  couponId: string | null
  label: string
} | {
  valid: false
  error: string
}

export async function validateCode(code: string, subtotal?: number): Promise<ValidatedCode> {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Please enter a code" }
  }

  const normalizedCode = code.trim().toUpperCase()

  // Look up both coupon and affiliate by this code
  const [coupon, affiliate] = await Promise.all([
    prisma.coupon.findUnique({ where: { code: normalizedCode } }),
    prisma.affiliate.findUnique({ where: { referralCode: normalizedCode } }),
  ])

  // Neither match
  if (!coupon && !affiliate) {
    return { valid: false, error: "Invalid code" }
  }

  // Coupon found — validate it
  if (coupon) {
    const isInvalid =
      !coupon.isActive ||
      (coupon.expiresAt && coupon.expiresAt < new Date()) ||
      (coupon.startsAt && coupon.startsAt > new Date()) ||
      (coupon.maxUses && coupon.usedCount >= coupon.maxUses)

    if (isInvalid) {
      return { valid: false, error: "This code is not valid" }
    }
    if (coupon.minOrderAmount && subtotal && subtotal < Number(coupon.minOrderAmount)) {
      return { valid: false, error: `Minimum order amount: $${Number(coupon.minOrderAmount).toFixed(2)}` }
    }

    const discountValue = Number(coupon.discountValue)
    const label = coupon.discountType === "PERCENTAGE"
      ? `${discountValue}% off`
      : `$${discountValue.toFixed(2)} off`

    return {
      valid: true,
      discountType: coupon.discountType,
      discountValue,
      affiliateId: affiliate?.status === "APPROVED" ? affiliate.id : null,
      couponId: coupon.id,
      label,
    }
  }

  // Affiliate only (no coupon with this code)
  if (affiliate) {
    if (affiliate.status !== "APPROVED") {
      return { valid: false, error: "Invalid code" }
    }

    const discountRateStr = await getSetting("affiliate_discount_rate")
    const discountRate = parseFloat(discountRateStr) || DEFAULT_AFFILIATE_DISCOUNT_RATE

    return {
      valid: true,
      discountType: "PERCENTAGE",
      discountValue: discountRate,
      affiliateId: affiliate.id,
      couponId: null,
      label: `${discountRate}% off`,
    }
  }

  return { valid: false, error: "Invalid code" }
}

// ============================================================
// ADMIN COUPON CRUD
// ============================================================

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function createCoupon(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const code = (formData.get("code") as string)?.trim().toUpperCase()
    if (!code) return { success: false, error: "Code is required" }

    const existing = await prisma.coupon.findUnique({ where: { code } })
    if (existing) return { success: false, error: "A coupon with this code already exists" }

    const discountType = (formData.get("discountType") as string) || "PERCENTAGE"
    const discountValue = parseFloat(formData.get("discountValue") as string)
    if (isNaN(discountValue) || discountValue <= 0) {
      return { success: false, error: "Discount value must be greater than 0" }
    }

    const minOrderAmount = formData.get("minOrderAmount") as string
    const maxUses = formData.get("maxUses") as string
    const startsAt = formData.get("startsAt") as string
    const expiresAt = formData.get("expiresAt") as string

    await prisma.coupon.create({
      data: {
        code,
        description: (formData.get("description") as string) || null,
        discountType: discountType as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: formData.get("isActive") === "true",
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to create coupon" }
  }
}

export async function updateCoupon(
  couponId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const discountType = (formData.get("discountType") as string) || "PERCENTAGE"
    const discountValue = parseFloat(formData.get("discountValue") as string)
    if (isNaN(discountValue) || discountValue <= 0) {
      return { success: false, error: "Discount value must be greater than 0" }
    }

    const minOrderAmount = formData.get("minOrderAmount") as string
    const maxUses = formData.get("maxUses") as string
    const startsAt = formData.get("startsAt") as string
    const expiresAt = formData.get("expiresAt") as string

    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        description: (formData.get("description") as string) || null,
        discountType: discountType as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: formData.get("isActive") === "true",
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update coupon" }
  }
}

export async function deleteCoupon(couponId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    await prisma.coupon.delete({ where: { id: couponId } })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete coupon" }
  }
}

export async function toggleCouponActive(couponId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon) return { success: false, error: "Coupon not found" }

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to toggle coupon" }
  }
}
