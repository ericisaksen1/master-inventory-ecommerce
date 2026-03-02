import type { PaymentProvider, PaymentInstructions } from "./types"
import { getSetting } from "@/lib/settings"

export class CashAppPaymentProvider implements PaymentProvider {
  method = "CASHAPP" as const

  async getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions> {
    const tag = await getSetting("cashapp_tag")
    const qrUrl = await getSetting("cashapp_qr_url")

    return {
      method: this.method,
      displayName: "Cash App",
      instructions: `Send $${amount} to ${tag || "[not configured]"} on Cash App. Include your order number in the note.`,
      address: tag || "Not configured",
      qrCodeUrl: qrUrl || undefined,
      additionalFields: [
        { label: "Amount", value: `$${amount}` },
        { label: "Note / Memo", value: orderNumber },
      ],
    }
  }
}
