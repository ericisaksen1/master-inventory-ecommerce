import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getCart } from "@/actions/cart"
import { initCheckoutReservation } from "@/actions/checkout"
import { cookies } from "next/headers"
import { getSettings } from "@/lib/settings"
import { sanitizeHtml } from "@/lib/sanitize"
import { CheckoutForm } from "./checkout-form"

export const metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const session = await auth()

  const settings = await getSettings(["shipping_flat_rate", "tax_rate", "enable_guest_checkout", "enable_paypal", "enable_venmo", "enable_cashapp", "enable_bitcoin", "terms_of_service_content", "store_name"])

  const guestCheckoutEnabled = settings.enable_guest_checkout !== "false"

  // If not logged in and guest checkout is disabled, redirect to login
  if (!session?.user && !guestCheckoutEnabled) {
    redirect("/login?returnUrl=/checkout")
  }

  // Initialize reservation for master-linked items (may adjust cart quantities)
  const reservation = await initCheckoutReservation()

  // Read cart after reservation (reflects any quantity adjustments)
  const cart = await getCart()
  if (!cart || cart.items.length === 0) redirect("/cart")

  // Read affiliate cookie to auto-apply
  const cookieStore = await cookies()
  const affiliateRef = cookieStore.get("affiliate_ref")?.value || null

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    name: item.product.name,
    variantName: item.variant?.name || null,
    price: item.variant ? Number(item.variant.price) : Number(item.product.basePrice),
    quantity: item.quantity,
  }))

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingRate = parseFloat(settings.shipping_flat_rate) || 0
  const taxRate = parseFloat(settings.tax_rate) || 0

  const isGuest = !session?.user

  const enabledPaymentMethods = [
    ...(settings.enable_paypal === "true" ? ["PAYPAL"] : []),
    ...(settings.enable_venmo === "true" ? ["VENMO"] : []),
    ...(settings.enable_cashapp === "true" ? ["CASHAPP"] : []),
    ...(settings.enable_bitcoin === "true" ? ["BITCOIN"] : []),
  ] as string[]

  const storeName = settings.store_name || "Store"
  const defaultTerms = `<p>Welcome to ${storeName}. By accessing or using our website, you agree to be bound by these Terms of Service.</p><h2>1. Use of the Site</h2><p>You may use this site for lawful purposes only.</p><h2>2. Orders &amp; Payments</h2><p>All orders are subject to acceptance and availability.</p>`
  const termsContent = sanitizeHtml(settings.terms_of_service_content || defaultTerms)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm
          cartItems={cartItems}
          subtotal={subtotal}
          affiliateRef={affiliateRef}
          shippingRate={shippingRate}
          taxRate={taxRate}
          isGuest={isGuest}
          enabledPaymentMethods={enabledPaymentMethods}
          termsContent={termsContent}
          reservationExpiresAt={reservation.hasReservation ? reservation.expiresAt : null}
          stockAdjustments={reservation.hasReservation ? reservation.adjustments : []}
        />
      </div>
    </div>
  )
}
