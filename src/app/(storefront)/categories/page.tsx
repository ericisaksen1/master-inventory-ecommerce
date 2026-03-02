import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "All Categories" }

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { products: true },
      },
    },
  })

  return (
    <div className="container-subpages px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">All Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-8 text-gray-500">No categories yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700"
            >
              {category.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <svg className="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold group-hover:text-primary">{category.name}</h2>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {category.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {category._count.products} {category._count.products === 1 ? "product" : "products"}
                </p>
                {category.children.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {category.children.map((child) => (
                      <span
                        key={child.id}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
