import Image from "next/image"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle } from "@/lib/component-colors"

interface Logo {
  name: string
  imageUrl: string
  linkUrl: string
}

interface BrandLogosProps extends ComponentColorProps {
  heading: string
  items: Logo[]
}

export function BrandLogos({ heading, items, bgColor, headlineColor }: BrandLogosProps) {
  if (items.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
      {heading && (
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        {items.map((item, i) => {
          const img = item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={120}
              height={40}
              className="h-8 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-10"
            />
          ) : (
            <span className="text-lg font-bold text-gray-400">{item.name}</span>
          )

          if (item.linkUrl) {
            return (
              <a key={i} href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            )
          }

          return <div key={i}>{img}</div>
        })}
      </div>
      </div>
    </section>
  )
}
