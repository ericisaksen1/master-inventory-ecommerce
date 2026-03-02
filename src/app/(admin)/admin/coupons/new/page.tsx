import { CouponForm } from "../coupon-form"

export const metadata = { title: "New Coupon | Admin" }

export default function NewCouponPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Create Coupon</h1>
      <div className="mt-6">
        <CouponForm />
      </div>
    </div>
  )
}
