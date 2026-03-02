"use client"

import { useState, useTransition } from "react"
import { createReview } from "@/actions/reviews"
import { StarRating } from "./star-rating"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  createdAt: string
  userName: string | null
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  isAuthenticated: boolean
  hasReviewed: boolean
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  isAuthenticated,
  hasReviewed,
}: ProductReviewsProps) {
  const [rating, setRating] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const handleSubmit = (formData: FormData) => {
    if (rating === 0) {
      setMessage("Please select a rating")
      return
    }
    formData.set("rating", rating.toString())
    formData.set("productId", productId)

    startTransition(async () => {
      const result = await createReview(formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage("Review submitted! It will appear once approved.")
        setRating(0)
      }
    })
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} size="md" />
            <span className="text-sm text-secondary">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="mt-4 text-sm text-secondary">No reviews yet. Be the first to review this product!</p>
      )}

      {reviews.length > 0 && (
        <div className="mt-6 space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm font-medium">{review.userName || "Anonymous"}</span>
                <span className="text-xs text-secondary">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {review.title && <p className="mt-2 font-medium">{review.title}</p>}
              {review.content && <p className="mt-1 text-sm text-secondary">{review.content}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Write a Review</h3>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-secondary">
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        ) : hasReviewed ? (
          <p className="mt-2 text-sm text-secondary">You have already reviewed this product.</p>
        ) : (
          <form action={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Rating</label>
              <div className="mt-1">
                <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              </div>
            </div>
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium">
                Title <span className="text-secondary">(optional)</span>
              </label>
              <input
                id="review-title"
                name="title"
                type="text"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="review-content" className="block text-sm font-medium">
                Review <span className="text-secondary">(optional)</span>
              </label>
              <textarea
                id="review-content"
                name="content"
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes("error") || message.includes("Please") ? "text-red-500" : "text-green-600"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-[var(--radius)] shadow-[var(--shadow)] bg-[var(--color-button-bg)] px-4 py-2 text-sm font-medium text-[var(--color-button-text)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
