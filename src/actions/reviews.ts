"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function createReview(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const productId = formData.get("productId") as string
  const rating = parseInt(formData.get("rating") as string, 10)
  const title = (formData.get("title") as string)?.trim() || null
  const content = (formData.get("content") as string)?.trim() || null

  if (!productId || !rating || rating < 1 || rating > 5) {
    return { error: "Invalid rating" }
  }

  const existing = await prisma.productReview.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    return { error: "You have already reviewed this product" }
  }

  const review = await prisma.productReview.create({
    data: {
      userId: session.user.id,
      productId,
      rating,
      title,
      content,
    },
    include: { product: { select: { name: true } } },
  })

  void createNotification({
    type: "review",
    title: "New Review",
    message: `${"★".repeat(rating)} review on ${review.product.name}`,
    link: "/admin/reviews",
  })

  revalidatePath(`/products`)
  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
  })

  if (!review) return { error: "Review not found" }

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  if (review.userId !== session.user.id && !isAdmin) {
    return { error: "Unauthorized" }
  }

  await prisma.productReview.delete({ where: { id: reviewId } })
  revalidatePath("/products")
  revalidatePath("/admin/reviews")
  return { success: true }
}

export async function approveReview(reviewId: string) {
  const session = await auth()
  if (
    session?.user?.role !== "ADMIN" &&
    session?.user?.role !== "SUPER_ADMIN"
  ) {
    return { error: "Unauthorized" }
  }

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
  })

  if (!review) return { error: "Review not found" }

  await prisma.productReview.update({
    where: { id: reviewId },
    data: { isApproved: !review.isApproved },
  })

  revalidatePath("/products")
  revalidatePath("/admin/reviews")
  return { success: true }
}
