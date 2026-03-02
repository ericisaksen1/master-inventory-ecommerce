import type { PaymentProvider, PaymentInstructions } from "./types"
import { getSetting } from "@/lib/settings"

export class PaypalPaymentProvider implements PaymentProvider {
  method = "PAYPAL" as const

  async getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions> {
    const email = await getSetting("paypal_email")
    const qrUrl = await getSetting("paypal_qr_url")

    return {
      method: this.method,
      displayName: "PayPal",
      instructions: `Send $${amount} to ${email || "[not configured]"} on PayPal. Include your order number in the note.`,
      address: email || "Not configured",
      qrCodeUrl: qrUrl || undefined,
      additionalFields: [
        { label: "Amount", value: `$${amount}` },
        { label: "Note / Memo", value: orderNumber },
      ],
    }
  }
}
