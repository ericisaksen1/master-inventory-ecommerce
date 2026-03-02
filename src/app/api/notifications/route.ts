import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [count, notifications] = await Promise.all([
    prisma.adminNotification.count({ where: { isRead: false } }),
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ])

  return NextResponse.json({ count, notifications })
}
