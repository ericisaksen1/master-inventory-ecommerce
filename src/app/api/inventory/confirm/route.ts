import { NextRequest, NextResponse } from "next/server"
import { authenticateApiKey } from "@/lib/api-auth"
import { rateLimit } from "@/lib/rate-limit"
import { confirmReservation } from "@/lib/master-inventory"

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rl = rateLimit(`api:inventory:confirm:${auth.site.id}`, 30, 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  let body: { sessionRef: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.sessionRef || typeof body.sessionRef !== "string") {
    return NextResponse.json({ error: "sessionRef is required" }, { status: 400 })
  }

  const result = await confirmReservation(body.sessionRef, auth.site.id)

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}
