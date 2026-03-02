import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface Testimonial {
  name: string
  role: string
  quote: string
}

interface TestimonialsProps extends ComponentColorProps {
  heading: string
  items: Testimonial[]
}

export function Testimonials({ heading, items, bgColor, headlineColor, textColor }: TestimonialsProps) {
  if (items.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      {heading && (
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
      )}
      <div className={`${heading ? "mt-10" : ""} grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3`}>
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl bg-[#f5f5f7] p-8">
            <svg className="h-6 w-6 text-secondary/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
            </svg>
            <p className="mt-4 text-lg leading-relaxed text-secondary" style={textColorStyle(textColor)}>
              {item.quote}
            </p>
            <div className="mt-6 border-t border-black/5 pt-4">
              <p className="font-semibold text-foreground">{item.name}</p>
              {item.role && (
                <p className="text-sm text-secondary" style={textColorStyle(textColor)}>{item.role}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}
