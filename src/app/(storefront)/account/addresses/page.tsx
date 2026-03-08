import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AddressManager } from "./address-manager"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata = { title: "My Addresses" }

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?returnUrl=/account/addresses")

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }],
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/account" className="text-sm text-secondary hover:text-foreground">
        &larr; Back to Account
      </Link>
      <h1 className="mt-4 text-2xl font-bold">My Addresses</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your shipping addresses.
      </p>

      <AddressManager
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          firstName: a.firstName,
          lastName: a.lastName,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          phone: a.phone,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  )
}
