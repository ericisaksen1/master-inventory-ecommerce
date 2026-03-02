import { prisma } from "@/lib/prisma"
import { MessageManager } from "./message-manager"

export const metadata = { title: "Messages | Admin" }

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  })

  const serialized = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-sm text-gray-500">
        {messages.length} message{messages.length !== 1 ? "s" : ""}
      </p>
      <div className="mt-6">
        <MessageManager messages={serialized} />
      </div>
    </div>
  )
}
