"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { approveReview, deleteReview } from "@/actions/reviews"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  isApproved: boolean
  createdAt: string
  userName: string
  productId: string
  productName: string
  productSlug: string
}

export function ReviewManager({ reviews }: { reviews: Review[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveReview(id)
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review?")) return
    startTransition(async () => {
      await deleteReview(id)
      router.refresh()
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-12 text-center">
        <p className="text-sm text-secondary">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-secondary">Product</th>
            <th className="px-4 py-3 text-left font-medium text-secondary">Customer</th>
            <th className="px-4 py-3 text-left font-medium text-secondary">Rating</th>
            <th className="px-4 py-3 text-left font-medium text-secondary">Review</th>
            <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
            <th className="px-4 py-3 text-left font-medium text-secondary">Date</th>
            <th className="px-4 py-3 text-right font-medium text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-muted">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/products/${review.productId}`}
                  className="font-medium hover:underline"
                >
                  {review.productName}
                </Link>
              </td>
              <td className="px-4 py-3 text-secondary">{review.userName}</td>
              <td className="px-4 py-3">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ))}
                </div>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-secondary">
                {review.title || review.content || "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={review.isApproved ? "green" : "default"}>
                  {review.isApproved ? "Approved" : "Pending"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(review.id)}
                    disabled={isPending}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {review.isApproved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
