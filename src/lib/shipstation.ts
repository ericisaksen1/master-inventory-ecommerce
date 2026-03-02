import { getSettings } from "@/lib/settings"
import fs from "fs"
import path from "path"

const SHIPSTATION_API_URL = "https://api.shipstation.com"

async function getShipStationSettings() {
  const settings = await getSettings(["shipstation_api_key", "shipstation_carrier_ids"])
  if (!settings.shipstation_api_key) {
    throw new Error("ShipStation API key not configured. Set it in Settings.")
  }
  return settings
}

async function shipstationFetch(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const res = await fetch(`${SHIPSTATION_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "API-Key": apiKey,
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    const errors = data?.errors as { message?: string }[] | undefined
    const message = errors?.[0]?.message || data?.message || "ShipStation API error"
    throw new Error(message)
  }
  return data
}

interface Address {
  name: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface ShippingRate {
  id: string
  carrier: string
  service: string
  rate: string
  deliveryDays: number | null
  currency: string
}

export interface PurchasedLabel {
  trackingNumber: string
  labelUrl: string
  carrier: string
  service: string
  rate: string
}

function toV2Address(addr: Address) {
  return {
    name: addr.name,
    phone: addr.phone || "000-000-0000",
    address_line1: addr.street1,
    address_line2: addr.street2 || undefined,
    city_locality: addr.city,
    state_province: addr.state,
    postal_code: addr.zip,
    country_code: addr.country,
  }
}

function formatServiceCode(code: string): string {
  return code
    .replace(/_/g, " ")
    .replace(/\b(usps|ups|fedex|dhl)\b/gi, (m) => m.toUpperCase())
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function listCarrierIds(apiKey: string): Promise<string[]> {
  const data = await shipstationFetch("/v2/carriers", apiKey)
  return (data.carriers || []).map((c: Record<string, unknown>) => c.carrier_id as string)
}

export async function getRates(
  fromAddress: Address,
  toAddress: Address,
  weightOz: number
): Promise<ShippingRate[]> {
  const ss = await getShipStationSettings()
  const apiKey = ss.shipstation_api_key

  // Use configured carrier IDs, or fall back to fetching all from account
  const configuredIds = ss.shipstation_carrier_ids
  const carrierIds = configuredIds
    ? configuredIds.split(",").map((id: string) => id.trim()).filter(Boolean)
    : await listCarrierIds(apiKey)
  if (carrierIds.length === 0) return []

  const data = await shipstationFetch("/v2/rates", apiKey, {
    method: "POST",
    body: JSON.stringify({
      rate_options: {
        carrier_ids: carrierIds,
      },
      shipment: {
        validate_address: "no_validation",
        ship_from: toV2Address(fromAddress),
        ship_to: toV2Address(toAddress),
        packages: [
          {
            weight: { value: weightOz, unit: "ounce" },
          },
        ],
      },
    }),
  })

  const rates = data.rate_response?.rates || []
  return rates
    .filter((r: Record<string, unknown>) => {
      const errs = r.error_messages as unknown[] | undefined
      return !errs || errs.length === 0
    })
    .map((r: Record<string, unknown>) => {
      const shipping = r.shipping_amount as Record<string, unknown> | undefined
      return {
        id: r.rate_id as string,
        carrier: (r.carrier_friendly_name || r.carrier_code) as string,
        service: formatServiceCode(r.service_code as string),
        rate: ((shipping?.amount as number) || 0).toFixed(2),
        deliveryDays: (r.delivery_days as number) || null,
        currency: (shipping?.currency as string) || "usd",
      }
    })
    .sort((a: ShippingRate, b: ShippingRate) => parseFloat(a.rate) - parseFloat(b.rate))
}

export async function createLabel(rateId: string): Promise<PurchasedLabel> {
  const ss = await getShipStationSettings()
  const apiKey = ss.shipstation_api_key

  const data = await shipstationFetch(`/v2/labels/rates/${rateId}`, apiKey, {
    method: "POST",
    body: JSON.stringify({
      label_format: "pdf",
      label_layout: "4x6",
    }),
  })

  // Download and save label PDF locally for permanent access
  let labelUrl = ""
  const pdfUrl = data.label_download?.pdf || data.label_download?.href
  if (pdfUrl) {
    try {
      const pdfRes = await fetch(pdfUrl, {
        headers: { "API-Key": apiKey },
      })
      if (pdfRes.ok) {
        const labelsDir = path.join(process.cwd(), "public", "uploads", "labels")
        fs.mkdirSync(labelsDir, { recursive: true })
        const filename = `label-${Date.now()}.pdf`
        fs.writeFileSync(path.join(labelsDir, filename), Buffer.from(await pdfRes.arrayBuffer()))
        labelUrl = `/uploads/labels/${filename}`
      }
    } catch {
      // Fall back to the remote download URL
      labelUrl = pdfUrl
    }
  }

  const shipmentCost = (data.shipment_cost?.amount as number) || 0
  const insuranceCost = (data.insurance_cost?.amount as number) || 0

  return {
    trackingNumber: data.tracking_number || "",
    labelUrl,
    carrier: data.carrier_code || "",
    service: data.service_code || "",
    rate: (shipmentCost + insuranceCost).toFixed(2),
  }
}
