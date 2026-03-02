import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const refCode = url.searchParams.get("ref")

  if (!refCode || refCode.length > 20) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode: refCode, status: "APPROVED" },
  })

  if (!affiliate) return NextResponse.json({ ok: false }, { status: 404 })

  // Read from request headers instead of client-supplied query params
  const forwarded = request.headers.get("x-forwarded-for")
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null
  const referrer = request.headers.get("referer")?.slice(0, 2000) || null
  const landingPage = url.searchParams.get("landing")?.slice(0, 2000) || null

  // Rate limit: skip duplicate clicks from same IP for same affiliate within 5 minutes
  if (ipAddress) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentClick = await prisma.affiliateClick.findFirst({
      where: {
        affiliateId: affiliate.id,
        ipAddress,
        createdAt: { gte: fiveMinutesAgo },
      },
    })
    if (recentClick) {
      return NextResponse.json({ ok: true }) // silently skip duplicate
    }
  }

  await prisma.affiliateClick.create({
    data: {
      affiliateId: affiliate.id,
      ipAddress,
      userAgent,
      referrer,
      landingPage,
    },
  })

  return NextResponse.json({ ok: true })
}
