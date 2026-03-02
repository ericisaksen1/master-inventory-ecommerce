import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ReturnForm } from "./return-form"
import Link from "next/link"

export const metadata = { title: "Request Return" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReturnPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      items: true,
      returns: { where: { status: { in: ["REQUESTED", "APPROVED"] } } },
    },
  })

  if (!order) notFound()

  if (order.status !== "ORDER_COMPLETE") {
    return (
      <div className="container-subpages mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">Cannot Request Return</h1>
          <p className="mt-2 text-secondary">Returns can only be requested for completed orders.</p>
          <Link href={`/orders/${id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
            &larr; Back to Order
          </Link>
        </div>
      </div>
    )
  }

  if (order.returns.length > 0) {
    return (
      <div className="container-subpages mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">Return Already Requested</h1>
          <p className="mt-2 text-secondary">A return request already exists for this order.</p>
          <Link href={`/orders/${id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
            &larr; Back to Order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-subpages mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href={`/orders/${id}`} className="text-sm text-secondary hover:text-foreground">
          &larr; Back to Order
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Request Return</h1>
        <p className="mt-1 text-sm text-secondary">
          Order #{order.orderNumber} — Select the items you want to return.
        </p>

        <ReturnForm
          orderId={order.id}
          items={order.items.map((item) => ({
            id: item.id,
            name: item.name,
            variantName: item.variantName,
            quantity: item.quantity,
            price: Number(item.price),
          }))}
        />
      </div>
    </div>
  )
}
