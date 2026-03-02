const requests = new Map<string, number[]>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  const timestamps = (requests.get(key) || []).filter((t) => t > windowStart)

  if (timestamps.length >= limit) {
    requests.set(key, timestamps)
    return { success: false, remaining: 0 }
  }

  timestamps.push(now)
  requests.set(key, timestamps)

  // Periodic cleanup
  if (requests.size > 1000) {
    for (const [k, v] of requests) {
      const cleaned = v.filter((t) => t > now - windowMs)
      if (cleaned.length === 0) requests.delete(k)
      else requests.set(k, cleaned)
    }
  }

  return { success: true, remaining: limit - timestamps.length }
}

export async function rateLimitByIp(
  action: string,
  limit = 10,
  windowMs = 60_000
): Promise<{ success: boolean; remaining: number }> {
  const { headers } = await import("next/headers")
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"
  return rateLimit(`${action}:${ip}`, limit, windowMs)
}
