import { prisma } from "@/lib/prisma"
import { SubscriberManager } from "./subscriber-manager"

export const metadata = { title: "Subscribers | Admin" }

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  })

  const serialized = subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    source: s.source,
    createdAt: s.createdAt.toISOString(),
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold">Subscribers</h1>
      <p className="mt-1 text-sm text-secondary">
        {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6">
        <SubscriberManager subscribers={serialized} />
      </div>
    </div>
  )
}
