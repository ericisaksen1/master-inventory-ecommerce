import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CouponForm } from "../coupon-form"
import Link from "next/link"

export const metadata = { title: "Edit Coupon | Admin" }

interface Props {
  params: Promise<{ id: string }>
}

function formatDatetimeLocal(date: Date | null): string | null {
  if (!date) return null
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params

  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) notFound()

  return (
    <div className="max-w-2xl">
      <Link href="/admin/coupons" className="text-sm text-gray-500 hover:text-black">
        &larr; Back to Coupons
      </Link>
      <h1 className="mt-4 text-2xl font-bold">
        Edit Coupon: <span className="font-mono">{coupon.code}</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Used {coupon.usedCount} times
      </p>
      <div className="mt-6">
        <CouponForm
          coupon={{
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue).toString(),
            minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount).toString() : null,
            maxUses: coupon.maxUses,
            isActive: coupon.isActive,
            startsAt: formatDatetimeLocal(coupon.startsAt),
            expiresAt: formatDatetimeLocal(coupon.expiresAt),
          }}
        />
      </div>
    </div>
  )
}
