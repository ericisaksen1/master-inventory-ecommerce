import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

interface CategoryNavProps {
  activeSlug?: string
}

export async function CategoryNav({ activeSlug }: CategoryNavProps) {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          !activeSlug
            ? "border-primary bg-primary text-white"
            : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary dark:hover:text-primary"
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            activeSlug === cat.slug
              ? "border-primary bg-primary text-white"
              : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary dark:hover:text-primary"
          )}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  )
}
