import { getSetting } from "@/lib/settings"

const PRINTFUL_API_URL = "https://api.printful.com/v2"

async function getPrintfulApiKey(): Promise<string> {
  const apiKey = await getSetting("printful_api_key")
  if (!apiKey) {
    throw new Error("Printful API key not configured")
  }
  return apiKey
}

async function printfulFetch<T = unknown>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    const message = data?.error?.message || data?.message || "Printful API error"
    throw new Error(message)
  }
  return data as T
}

// ── Types ──

export interface PrintfulOrderRecipient {
  name: string
  address1: string
  address2?: string
  city: string
  state_code: string
  country_code: string
  zip: string
  phone?: string
  email?: string
}

export interface PrintfulOrderItem {
  catalog_variant_id: number
  quantity: number
  retail_price: string
}

export interface PrintfulOrder {
  id: number
  external_id: string
  status: string
  shipping: string
  created: string
  recipient: PrintfulOrderRecipient
  items: PrintfulOrderItem[]
}

// ── Order management ──

export async function createPrintfulOrder(
  recipient: PrintfulOrderRecipient,
  items: PrintfulOrderItem[],
  externalId: string
): Promise<PrintfulOrder> {
  const apiKey = await getPrintfulApiKey()
  const data = await printfulFetch<{ result: PrintfulOrder }>("/orders", apiKey, {
    method: "POST",
    body: JSON.stringify({
      external_id: externalId,
      recipient,
      items,
    }),
  })
  return data.result
}

export async function confirmPrintfulOrder(printfulOrderId: number): Promise<PrintfulOrder> {
  const apiKey = await getPrintfulApiKey()
  const data = await printfulFetch<{ result: PrintfulOrder }>(
    `/orders/${printfulOrderId}/confirm`,
    apiKey,
    { method: "POST" }
  )
  return data.result
}

export async function getPrintfulShippingRates(
  recipient: PrintfulOrderRecipient,
  items: { catalog_variant_id: number; quantity: number }[]
) {
  const apiKey = await getPrintfulApiKey()
  return printfulFetch("/shipping-rates", apiKey, {
    method: "POST",
    body: JSON.stringify({ recipient, items }),
  })
}

// ── Helper ──

export async function isPrintfulEnabled(): Promise<boolean> {
  const enabled = await getSetting("enable_printful")
  if (enabled !== "true") return false
  const apiKey = await getSetting("printful_api_key")
  return !!apiKey
}
