import Link from "next/link"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle, linkColorProps } from "@/lib/component-colors"

interface CollectionLink {
  title: string
  url: string
  description: string
}

interface CollectionLinksProps extends ComponentColorProps {
  heading: string
  items: CollectionLink[]
}

export function CollectionLinks({ heading, items, bgColor, headlineColor, textColor, linkColor, linkHoverColor }: CollectionLinksProps) {
  if (items.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
      {heading && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
      )}
      <div className={`${heading ? "mt-6" : ""} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.url || "/"}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-primary dark:text-gray-100">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" style={textColorStyle(textColor)}>
                {item.description}
              </p>
            )}
            <span
              className="mt-3 inline-block text-sm font-medium text-primary"
              {...linkColorProps(linkColor, linkHoverColor)}
            >
              Browse &rarr;
            </span>
          </Link>
        ))}
      </div>
      </div>
    </section>
  )
}
