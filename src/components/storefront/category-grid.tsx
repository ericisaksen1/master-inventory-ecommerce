import Link from "next/link"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface CategoryGridProps extends ComponentColorProps {
  heading: string
  categories: Category[]
}

export function CategoryGrid({ heading, categories, bgColor, headlineColor, textColor }: CategoryGridProps) {
  if (categories.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={headlineColorStyle(headlineColor)}>
        {heading}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center rounded-2xl bg-[#f5f5f7] p-8 text-center transition-colors hover:bg-[#e8e8ed]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="text-lg font-bold">{cat.name[0]}</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold">{cat.name}</h3>
            {cat.description && (
              <p className="mt-1 text-xs text-secondary" style={textColorStyle(textColor)}>{cat.description}</p>
            )}
          </Link>
        ))}
      </div>
      </div>
    </section>
  )
}
