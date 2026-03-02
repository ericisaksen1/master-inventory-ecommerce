import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  const response = NextResponse.next()

  // Affiliate link tracking
  const refCode = req.nextUrl.searchParams.get("ref")
  if (refCode) {
    // Record click asynchronously (non-blocking, don't await in middleware)
    const clickUrl = new URL("/api/affiliate-click", req.nextUrl.origin)
    clickUrl.searchParams.set("ref", refCode)
    clickUrl.searchParams.set("landing", req.nextUrl.pathname)
    clickUrl.searchParams.set("ip", req.headers.get("x-forwarded-for") || "")
    clickUrl.searchParams.set("ua", req.headers.get("user-agent") || "")
    clickUrl.searchParams.set("referrer", req.headers.get("referer") || "")
    fetch(clickUrl.toString()).catch(() => {})

    // Strip ?ref= from URL for clean browsing
    const cleanUrl = new URL(req.nextUrl)
    cleanUrl.searchParams.delete("ref")
    const redirect = NextResponse.redirect(cleanUrl)
    redirect.cookies.set("affiliate_ref", refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return redirect
  }

  return response
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
}
