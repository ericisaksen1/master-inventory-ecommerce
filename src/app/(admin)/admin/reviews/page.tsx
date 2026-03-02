import { prisma } from "@/lib/prisma"
import { ReviewManager } from "./review-manager"

export const metadata = { title: "Reviews | Admin" }

export default async function AdminReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  })

  const serialized = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    isApproved: r.isApproved,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name || r.user.email,
    productId: r.product.id,
    productName: r.product.name,
    productSlug: r.product.slug,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-secondary">
        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </p>
      <div className="mt-6">
        <ReviewManager reviews={serialized} />
      </div>
    </div>
  )
}
