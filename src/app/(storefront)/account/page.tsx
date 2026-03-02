import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AccountForms } from "./account-forms"
import Link from "next/link"

export const metadata = { title: "My Account" }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?returnUrl=/account")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, passwordHash: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage your profile and security settings.
      </p>

      <AccountForms
        name={user.name || ""}
        email={user.email}
        hasPassword={!!user.passwordHash}
      />

      <div className="mt-8 border-t border-border pt-6">
        <Link
          href="/account/addresses"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Manage Addresses &rarr;
        </Link>
      </div>
    </div>
  )
}
