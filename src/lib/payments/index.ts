import type { PaymentMethod } from "@prisma/client"
import type { PaymentProvider } from "./types"
import { PaypalPaymentProvider } from "./paypal"
import { VenmoPaymentProvider } from "./venmo"
import { CashAppPaymentProvider } from "./cashapp"
import { BitcoinPaymentProvider } from "./bitcoin"

const providers: Partial<Record<PaymentMethod, PaymentProvider>> = {
  PAYPAL: new PaypalPaymentProvider(),
  VENMO: new VenmoPaymentProvider(),
  CASHAPP: new CashAppPaymentProvider(),
  BITCOIN: new BitcoinPaymentProvider(),
}

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method]
  if (!provider) throw new Error(`Payment provider ${method} is not configured`)
  return provider
}

export function getAvailablePaymentMethods(): { method: PaymentMethod; label: string }[] {
  return [
    { method: "PAYPAL", label: "PayPal" },
    { method: "VENMO", label: "Venmo" },
    { method: "CASHAPP", label: "Cash App" },
    { method: "BITCOIN", label: "Bitcoin" },
  ]
}
