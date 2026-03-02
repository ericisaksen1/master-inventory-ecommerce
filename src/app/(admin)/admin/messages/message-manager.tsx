"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { markMessageRead, markMessageUnread, deleteContactMessage } from "@/actions/contact"

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

interface MessageManagerProps {
  messages: Message[]
}

export function MessageManager({ messages }: MessageManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggleRead(msg: Message) {
    startTransition(async () => {
      if (msg.isRead) {
        await markMessageUnread(msg.id)
      } else {
        await markMessageRead(msg.id)
      }
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return
    startTransition(async () => {
      await deleteContactMessage(id)
      router.refresh()
    })
  }

  if (messages.length === 0) {
    return (
      <p className="text-sm text-gray-500">No messages yet.</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th className="w-8 px-4 py-3" />
            <th className="px-4 py-3">Sender</th>
            <th className="px-4 py-3">Subject</th>
            <th className="hidden px-4 py-3 md:table-cell">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id
            return (
              <tr key={msg.id} className="group border-b border-gray-100 last:border-b-0">
                <td className="px-4 py-3">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      msg.isRead ? "bg-gray-300" : "bg-blue-500"
                    }`}
                    title={msg.isRead ? "Read" : "Unread"}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="text-left"
                  >
                    <p className={msg.isRead ? "text-gray-600" : "font-medium text-gray-900"}>
                      {msg.name}
                    </p>
                    <p className="text-xs text-gray-400">{msg.email}</p>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className={`text-left ${msg.isRead ? "text-gray-600" : "font-medium text-gray-900"}`}
                  >
                    {msg.subject}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 rounded-md bg-gray-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{msg.message}</p>
                    </div>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                  {new Date(msg.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(msg)}
                      disabled={isPending}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {msg.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(msg.id)}
                      disabled={isPending}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
