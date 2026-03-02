import { prisma } from "@/lib/prisma"
import { ReservationsDashboard } from "./reservations-dashboard"

export const metadata = { title: "Reservations | Admin" }

export default async function ReservationsPage() {
  const now = new Date()

  const [active, recent] = await Promise.all([
    prisma.stockReservation.findMany({
      where: { status: "ACTIVE", expiresAt: { gt: now } },
      include: {
        masterSku: { select: { sku: true, name: true } },
        site: { select: { name: true } },
      },
      orderBy: { expiresAt: "asc" },
    }),
    prisma.stockReservation.findMany({
      where: {
        OR: [
          { status: { in: ["CONFIRMED", "EXPIRED", "RELEASED"] } },
          { status: "ACTIVE", expiresAt: { lte: now } },
        ],
      },
      include: {
        masterSku: { select: { sku: true, name: true } },
        site: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const stats = await prisma.stockReservation.groupBy({
    by: ["status"],
    where: { updatedAt: { gte: todayStart } },
    _count: true,
  })

  const statsMap: Record<string, number> = {}
  for (const s of stats) {
    statsMap[s.status] = s._count
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reservations</h1>
      <p className="mt-1 text-sm text-secondary">
        Active checkout reservations and recent history.
      </p>
      <div className="mt-6">
        <ReservationsDashboard
          active={active.map((r) => ({
            id: r.id,
            sku: r.masterSku.sku,
            skuName: r.masterSku.name,
            siteName: r.site?.name ?? "Lab Rats (local)",
            sessionRef: r.sessionRef,
            quantity: r.quantity,
            status: r.status,
            expiresAt: r.expiresAt.toISOString(),
            createdAt: r.createdAt.toISOString(),
          }))}
          recent={recent.map((r) => ({
            id: r.id,
            sku: r.masterSku.sku,
            skuName: r.masterSku.name,
            siteName: r.site?.name ?? "Lab Rats (local)",
            sessionRef: r.sessionRef,
            quantity: r.quantity,
            status: r.status === "ACTIVE" && r.expiresAt <= now ? "EXPIRED" : r.status,
            expiresAt: r.expiresAt.toISOString(),
            createdAt: r.createdAt.toISOString(),
          }))}
          todayStats={{
            confirmed: statsMap["CONFIRMED"] ?? 0,
            expired: statsMap["EXPIRED"] ?? 0,
            released: statsMap["RELEASED"] ?? 0,
          }}
        />
      </div>
    </div>
  )
}
