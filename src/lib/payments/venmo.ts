import type { PaymentProvider, PaymentInstructions } from "./types"
import { getSetting } from "@/lib/settings"

export class VenmoPaymentProvider implements PaymentProvider {
  method = "VENMO" as const

  async getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions> {
    const username = await getSetting("venmo_username")
    const qrUrl = await getSetting("venmo_qr_url")

    return {
      method: this.method,
      displayName: "Venmo",
      instructions: `Send $${amount} to @${username || "[not configured]"} on Venmo. Include your order number in the note.`,
      address: username ? `@${username}` : "Not configured",
      qrCodeUrl: qrUrl || undefined,
      additionalFields: [
        { label: "Amount", value: `$${amount}` },
        { label: "Note / Memo", value: orderNumber },
      ],
    }
  }
}
