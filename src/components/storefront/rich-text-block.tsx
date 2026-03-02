import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface RichTextBlockProps extends ComponentColorProps {
  heading: string
  content: string
  maxWidth: "narrow" | "medium" | "wide" | "full"
}

const maxWidthClasses = {
  narrow: "max-w-xl",
  medium: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-7xl",
}

export function RichTextBlock({ heading, content, maxWidth, bgColor, headlineColor, textColor }: RichTextBlockProps) {
  if (!content && !heading) return null

  return (
    <section className="mx-auto px-4 py-16 sm:px-6 lg:px-8" style={sectionColorStyle({ bgColor })}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth] || maxWidthClasses.medium}`}>
        {heading && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={headlineColorStyle(headlineColor)}>
            {heading}
          </h2>
        )}
        {content && (
          <div className={`${heading ? "mt-4" : ""} prose prose-gray max-w-none text-gray-600 dark:prose-invert dark:text-gray-300`} style={textColorStyle(textColor)}>
            {content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
