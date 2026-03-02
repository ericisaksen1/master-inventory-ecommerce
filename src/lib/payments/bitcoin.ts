import type { PaymentProvider, PaymentInstructions } from "./types"
import { getSetting } from "@/lib/settings"

export class BitcoinPaymentProvider implements PaymentProvider {
  method = "BITCOIN" as const

  async getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions> {
    const address = await getSetting("bitcoin_address")
    const qrUrl = await getSetting("bitcoin_qr_url")

    return {
      method: this.method,
      displayName: "Bitcoin",
      instructions: `Send the equivalent of $${amount} USD in Bitcoin to the address below. Include your order number as a reference if possible.`,
      address: address || "Not configured",
      qrCodeUrl: qrUrl || undefined,
      additionalFields: [
        { label: "Amount (USD)", value: `$${amount}` },
        { label: "Order Reference", value: orderNumber },
      ],
    }
  }
}
