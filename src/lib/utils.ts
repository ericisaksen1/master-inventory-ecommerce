import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
}

export async function generateOrderNumber(): Promise<string> {
  const { prisma } = await import("@/lib/prisma")
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  })
  let next = 3000
  if (last?.orderNumber) {
    const num = parseInt(last.orderNumber, 10)
    if (!isNaN(num)) next = num + 1
  }
  return String(next)
}

/** Extract pack size from variant options. Returns 1 for non-pack variants. */
export function getPackSize(options: { name: string; value: string }[]): number {
  const packOption = options.find((o) => o.name === "Pack")
  if (!packOption) return 1
  const match = packOption.value.match(/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

export function generateReferralCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6)
  const random = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `${base}${random}`
}
