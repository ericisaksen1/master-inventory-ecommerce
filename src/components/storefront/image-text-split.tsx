import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface ImageTextSplitProps extends ComponentColorProps {
  heading: string
  content: string
  imageUrl: string
  imageAlt: string
  layout: "image_left" | "image_right"
  buttonText: string
  buttonUrl: string
  showButton: boolean
}

export function ImageTextSplit({
  heading,
  content,
  imageUrl,
  imageAlt,
  layout,
  buttonText,
  buttonUrl,
  showButton,
  bgColor,
  headlineColor,
  textColor,
  buttonColor,
  buttonTextColor,
  buttonHoverColor,
  buttonHoverTextColor,
}: ImageTextSplitProps) {
  const imageSection = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt || heading || ""}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          No image
        </div>
      )}
    </div>
  )

  const contentSection = (
    <div className="flex flex-col justify-center">
      {heading && (
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
      )}
      {content && (
        <div className={`${heading ? "mt-4" : ""} text-base leading-relaxed text-gray-600 dark:text-gray-300`} style={textColorStyle(textColor)}>
          {content.split("\n").map((paragraph, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
      {showButton && buttonText && (
        <div className="mt-6">
          <Link href={buttonUrl || "/"}>
            <Button size="lg">{buttonText}</Button>
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <section className="py-16" style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}>
      <div className="container-homepage px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
          {layout === "image_left" ? (
            <>
              {imageSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {imageSection}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
