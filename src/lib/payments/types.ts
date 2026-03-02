import type { PaymentMethod } from "@prisma/client"

export interface PaymentInstructions {
  method: PaymentMethod
  displayName: string
  instructions: string
  address: string
  qrCodeUrl?: string
  additionalFields?: { label: string; value: string }[]
}

export interface PaymentProvider {
  method: PaymentMethod
  getInstructions(orderNumber: string, amount: string): Promise<PaymentInstructions>
}
