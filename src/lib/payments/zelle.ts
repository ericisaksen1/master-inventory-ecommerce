import type { PaymentProvider, PaymentInstructions } from "./types"
import { getSetting } from "@/lib/settings"

export class ZellePaymentProvider implements PaymentProvider {
  method = "ZELLE" as const

  async getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions> {
    const email = await getSetting("zelle_email")
    const qrUrl = await getSetting("zelle_qr_url")

    return {
      method: this.method,
      displayName: "Zelle",
      instructions: `Send $${amount} to ${email || "[not configured]"} via Zelle. Include your order number in the memo.`,
      address: email || "Not configured",
      qrCodeUrl: qrUrl || undefined,
      additionalFields: [
        { label: "Amount", value: `$${amount}` },
        { label: "Memo", value: orderNumber },
      ],
    }
  }
}
