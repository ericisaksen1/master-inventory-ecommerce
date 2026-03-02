"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createCoupon, updateCoupon } from "@/actions/coupons"

interface CouponFormProps {
  coupon?: {
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: string
    minOrderAmount: string | null
    maxUses: number | null
    isActive: boolean
    startsAt: string | null
    expiresAt: string | null
  }
}

export function CouponForm({ coupon }: CouponFormProps) {
  const [isPending, startTransition] = useTransition()
  const [discountType, setDiscountType] = useState(coupon?.discountType || "PERCENTAGE")
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    formData.set("discountType", discountType)
    formData.set("isActive", isActive.toString())

    startTransition(async () => {
      const result = coupon
        ? await updateCoupon(coupon.id, formData)
        : await createCoupon(formData)

      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(coupon ? "Coupon updated" : "Coupon created")
        router.push("/admin/coupons")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {!coupon && (
        <Input
          label="Coupon Code"
          name="code"
          required
          placeholder="e.g. SUMMER20"
          className="uppercase"
        />
      )}

      <Input
        label="Description (optional)"
        name="description"
        defaultValue={coupon?.description || ""}
        placeholder="e.g. Summer sale 20% off"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Discount Type</label>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => setDiscountType("PERCENTAGE")}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              discountType === "PERCENTAGE"
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            Percentage (%)
          </button>
          <button
            type="button"
            onClick={() => setDiscountType("FIXED_AMOUNT")}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              discountType === "FIXED_AMOUNT"
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            Fixed Amount ($)
          </button>
        </div>
      </div>

      <Input
        label={discountType === "PERCENTAGE" ? "Discount (%)" : "Discount Amount ($)"}
        name="discountValue"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={coupon?.discountValue || ""}
        placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 10.00"}
      />

      <Input
        label="Minimum Order Amount (optional)"
        name="minOrderAmount"
        type="number"
        step="0.01"
        min="0"
        defaultValue={coupon?.minOrderAmount || ""}
        placeholder="e.g. 50.00"
      />

      <Input
        label="Max Uses (optional — leave blank for unlimited)"
        name="maxUses"
        type="number"
        min="1"
        defaultValue={coupon?.maxUses?.toString() || ""}
        placeholder="e.g. 100"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Starts At (optional)"
          name="startsAt"
          type="datetime-local"
          defaultValue={coupon?.startsAt || ""}
        />
        <Input
          label="Expires At (optional)"
          name="expiresAt"
          type="datetime-local"
          defaultValue={coupon?.expiresAt || ""}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium">{isActive ? "Active" : "Inactive"}</span>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/coupons")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
