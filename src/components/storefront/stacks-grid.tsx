import Link from "next/link"
import { StackCard, type StackCardData } from "./stack-card"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle, linkColorProps } from "@/lib/component-colors"

interface StacksGridProps extends ComponentColorProps {
  heading: string
  stacks: StackCardData[]
  showViewAll: boolean
}

export function StacksGrid({ heading, stacks, showViewAll, bgColor, headlineColor, textColor, linkColor, linkHoverColor }: StacksGridProps) {
  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex items-start justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={headlineColorStyle(headlineColor)}>
            {heading}
          </h2>
          {showViewAll && (
            <Link
              href="/stacks"
              className="shrink-0 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              {...linkColorProps(linkColor, linkHoverColor)}
            >
              View all
            </Link>
          )}
        </div>
        <div className="mt-8">
          {stacks.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stacks.map((stack) => (
                <StackCard key={stack.id} stack={stack} />
              ))}
            </div>
          ) : (
            <p className="text-secondary" style={textColorStyle(textColor)}>
              No stacks to display.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
