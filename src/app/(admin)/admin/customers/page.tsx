import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { RoleSelect } from "./role-select"
import { UserActions } from "./user-actions"

export const metadata = { title: "Customers | Admin" }

const roleBadgeVariant: Record<string, "default" | "purple" | "blue" | "red"> = {
  CUSTOMER: "default",
  AFFILIATE: "purple",
  ADMIN: "blue",
  SUPER_ADMIN: "red",
}

export default async function AdminCustomersPage() {
  const session = await auth()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const customers = await prisma.user.findMany({
    where: isSuperAdmin
      ? undefined
      : { role: { in: ["CUSTOMER", "AFFILIATE"] } },
    include: {
      _count: { select: { orders: true } },
      orders: {
        select: { total: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {isSuperAdmin ? "Users" : "Customers"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {customers.length} {isSuperAdmin ? "total users" : "registered customers"}
      </p>

      <div className="mt-6 rounded-lg border border-border bg-background">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-secondary">No users yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Orders</th>
                <th className="px-4 py-3 text-left font-medium">Total Spent</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, o) => sum + Number(o.total),
                  0
                )
                return (
                  <tr key={customer.id} className="hover:bg-muted">
                    <td className="px-4 py-3">
                      <p className="font-medium">{customer.name || "No name"}</p>
                      <p className="text-xs text-secondary">{customer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <RoleSelect
                          userId={customer.id}
                          currentRole={customer.role}
                          isSelf={customer.id === session?.user?.id}
                        />
                      ) : (
                        <Badge variant={roleBadgeVariant[customer.role] || "default"}>
                          {customer.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">{customer._count.orders}</td>
                    <td className="px-4 py-3">{formatCurrency(totalSpent)}</td>
                    <td className="px-4 py-3 text-secondary">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          customer.status === "ACTIVE"
                            ? "green"
                            : customer.status === "SUSPENDED"
                              ? "yellow"
                              : "red"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        userId={customer.id}
                        status={customer.status}
                        isSelf={customer.id === session?.user?.id}
                        isSuperAdmin={customer.role === "SUPER_ADMIN"}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
