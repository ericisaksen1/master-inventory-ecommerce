"use client"

import { useState, useEffect, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createOrder } from "@/actions/checkout"
import { validateCode, type ValidatedCode } from "@/actions/coupons"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { TermsModal } from "@/components/storefront/terms-modal"

const allPaymentMethods = [
  { value: "PAYPAL", label: "PayPal", description: "Pay via PayPal", color: "bg-indigo-100 text-indigo-700" },
  { value: "VENMO", label: "Venmo", description: "Pay via Venmo app", color: "bg-blue-100 text-blue-700" },
  { value: "CASHAPP", label: "Cash App", description: "Pay via Cash App", color: "bg-green-100 text-green-700" },
  { value: "BITCOIN", label: "Bitcoin", description: "Pay with BTC", color: "bg-orange-100 text-orange-700" },
]

interface CartItem {
  id: string
  name: string
  variantName: string | null
  price: number
  quantity: number
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  subtotal: number
  affiliateRef: string | null
  shippingRate: number
  taxRate: number
  isGuest: boolean
  enabledPaymentMethods: string[]
  termsContent: string
}

export function CheckoutForm({ cartItems, subtotal, affiliateRef, shippingRate, taxRate, isGuest, enabledPaymentMethods, termsContent }: CheckoutFormProps) {
  const paymentMethods = allPaymentMethods.filter((m) => enabledPaymentMethods.includes(m.value))
  const [selectedPayment, setSelectedPayment] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Guest checkout state
  const [guestEmail, setGuestEmail] = useState("")
  const [createAccount, setCreateAccount] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Discount code state
  const [codeInput, setCodeInput] = useState("")
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState<{ type: string; value: number; label: string } | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isValidating, startValidation] = useTransition()

  // Auto-apply affiliate code from cookie on mount
  useEffect(() => {
    if (affiliateRef && !appliedCode) {
      startValidation(async () => {
        const result = await validateCode(affiliateRef, subtotal)
        if (result.valid) {
          setAppliedCode(affiliateRef)
          setDiscount({ type: result.discountType, value: result.discountValue, label: result.label })
          setCodeInput(affiliateRef)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleApplyCode() {
    if (!codeInput.trim()) return
    setCodeError(null)
    startValidation(async () => {
      const result: ValidatedCode = await validateCode(codeInput.trim(), subtotal)
      if (result.valid) {
        setAppliedCode(codeInput.trim().toUpperCase())
        setDiscount({ type: result.discountType, value: result.discountValue, label: result.label })
        setCodeError(null)
      } else {
        setCodeError(result.error)
      }
    })
  }

  function handleRemoveCode() {
    setAppliedCode(null)
    setDiscount(null)
    setCodeInput("")
    setCodeError(null)
  }

  // Calculate discount amount
  let discountAmount = 0
  if (discount) {
    if (discount.type === "PERCENTAGE") {
      discountAmount = subtotal * (discount.value / 100)
    } else {
      discountAmount = Math.min(discount.value, subtotal)
    }
    discountAmount = Math.round(discountAmount * 100) / 100
  }

  const discountedSubtotal = subtotal - discountAmount

  async function handleSubmit(formData: FormData) {
    setError(null)
    if (!selectedPayment) {
      setError("Please select a payment method")
      return
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service")
      return
    }

    // Guest validation
    if (isGuest) {
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError("Please enter a valid email address")
        return
      }
      formData.set("guestEmail", guestEmail)
      if (createAccount) {
        if (!password || password.length < 8) {
          setError("Password must be at least 8 characters")
          return
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          return
        }
        formData.set("createAccount", "true")
        formData.set("password", password)
      }
    }

    formData.set("paymentMethod", selectedPayment)
    if (appliedCode) {
      formData.set("couponCode", appliedCode)
    }
    setLoading(true)
    try {
      const result = await createOrder(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch {
      // redirect throws NEXT_REDIRECT
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3">
        <form action={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Guest Contact Info */}
          {isGuest && (
            <div>
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="mt-4 space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Create an account for faster checkout next time
                </label>
                {createAccount && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input
                        label="Full name"
                        name="accountName"
                        required
                        placeholder="Your name"
                      />
                    </div>
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Min. 8 characters"
                    />
                    <Input
                      label="Confirm password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm password"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div>
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" name="firstName" required />
              <Input label="Last name" name="lastName" required />
              <div className="sm:col-span-2">
                <Input label="Address" name="line1" required placeholder="Street address" />
              </div>
              <div className="sm:col-span-2">
                <Input label="Apartment, suite, etc. (optional)" name="line2" />
              </div>
              <Input label="City" name="city" required />
              <Input label="State" name="state" required />
              <Input label="ZIP code" name="postalCode" required />
              <Input label="Phone" name="phone" type="tel" required />
            </div>
          </div>

          {/* Discount Code */}
          <div>
            <h2 className="text-lg font-semibold">Discount Code</h2>
            <div className="mt-4">
              {appliedCode ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/30">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      <span className="font-mono">{appliedCode}</span> — {discount?.label}
                    </p>
                    {discountAmount > 0 && (
                      <p className="mt-0.5 text-xs text-green-600">
                        You save {formatCurrency(discountAmount)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCode}
                    className="text-sm font-medium text-green-700 underline hover:text-green-900"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Enter coupon or affiliate code"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase placeholder:normal-case focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleApplyCode()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCode}
                    disabled={isValidating || !codeInput.trim()}
                  >
                    {isValidating ? "Checking..." : "Apply"}
                  </Button>
                </div>
              )}
              {codeError && (
                <p className="mt-2 text-sm text-red-600">{codeError}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setSelectedPayment(method.value)}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-colors",
                    selectedPayment === method.value
                      ? "border-primary bg-gray-50 dark:bg-gray-800"
                      : "border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                  )}
                >
                  <div className={cn("inline-block rounded px-2 py-0.5 text-xs font-semibold", method.color)}>
                    {method.label}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Terms of Service */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
            />
            <span className="text-gray-600 dark:text-gray-400">
              I agree to the{" "}
              <TermsModal content={termsContent}>
                <span className="text-primary underline hover:text-primary/80">Terms of Service</span>
              </TermsModal>
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={loading || !selectedPayment || !agreedToTerms}>
            {loading ? "Placing order..." : "Place Order"}
          </Button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            After placing your order, you&apos;ll receive payment instructions.
          </p>
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-2">
        <div className="sticky rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800" style={{ top: "calc(var(--header-height, 64px) + 1.5rem)" }}>
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-gray-500 dark:text-gray-400">{item.variantName}</p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="mt-1 flex justify-between text-sm text-green-600">
                <span>Discount ({discount?.label})</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {shippingRate > 0 && (
              <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>{formatCurrency(shippingRate)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(discountedSubtotal * (taxRate / 100))}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(discountedSubtotal + shippingRate + discountedSubtotal * (taxRate / 100))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
