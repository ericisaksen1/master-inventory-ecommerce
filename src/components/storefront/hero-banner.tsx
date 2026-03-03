import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface HeroBannerProps extends ComponentColorProps {
  heading: string
  subtext: string
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
  showSecondaryButton: boolean
  layout: "centered" | "split_image_right" | "split_image_left" | "background_image"
  textAlign: "left" | "center" | "right"
  imageUrl: string
  imageAlt: string
  backgroundImageUrl: string
  overlayOpacity: string
  minHeight: "default" | "medium" | "tall" | "screen"
  verticalAlign: "top" | "center" | "bottom"
  headingFontSize: string
  subtextFontSize: string
}

const textAlignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const justifyClass: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
}

const subtextMarginClass: Record<string, string> = {
  left: "",
  center: "mx-auto",
  right: "ml-auto",
}

const minHeightValue: Record<string, string | undefined> = {
  default: undefined,
  medium: "500px",
  tall: "600px",
  screen: "100vh",
}

const verticalAlignClass: Record<string, string> = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
}

const justifyContentClass: Record<string, string> = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
}

const headingFontSizeClass: Record<string, string> = {
  "2xl": "text-2xl sm:text-3xl lg:text-4xl",
  "3xl": "text-3xl sm:text-4xl lg:text-5xl",
  "4xl": "text-4xl sm:text-5xl lg:text-6xl",
  "5xl": "text-4xl sm:text-5xl lg:text-6xl",
  "6xl": "text-5xl sm:text-6xl lg:text-7xl",
  "7xl": "text-5xl sm:text-6xl lg:text-7xl",
}

const subtextFontSizeClass: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
}

export function HeroBanner({
  heading,
  subtext,
  primaryButtonText,
  primaryButtonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  showSecondaryButton,
  layout,
  textAlign,
  imageUrl,
  imageAlt,
  backgroundImageUrl,
  overlayOpacity,
  minHeight,
  verticalAlign,
  headingFontSize,
  subtextFontSize,
  bgColor,
  headlineColor,
  textColor,
  buttonColor,
  buttonTextColor,
  buttonHoverColor,
  buttonHoverTextColor,
}: HeroBannerProps) {
  const sectionStyle = sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })
  const height = minHeightValue[minHeight]
  const align = textAlignClass[textAlign] || "text-center"
  const justify = justifyClass[textAlign] || "justify-center"
  const subtextMargin = subtextMarginClass[textAlign] || "mx-auto"
  const vAlign = verticalAlignClass[verticalAlign] || "items-center"

  const vJustify = justifyContentClass[verticalAlign] || "justify-center"
  const headingSizeClasses = headingFontSizeClass[headingFontSize] || headingFontSizeClass["7xl"]
  const subtextSizeClass = subtextFontSizeClass[subtextFontSize] || subtextFontSizeClass["xl"]

  const textContent = (
    <div className={align}>
      <h1
        className={`${headingSizeClasses} font-semibold tracking-tight text-foreground`}
        style={headlineColorStyle(headlineColor)}
      >
        {heading}
      </h1>
      {subtext && (
        <p
          className={`mt-6 ${subtextSizeClass} text-secondary`}
          style={textColorStyle(textColor)}
        >
          {subtext}
        </p>
      )}
      <div className={`mt-6 flex items-center gap-5 ${justify}`}>
        <Link href={primaryButtonUrl}>
          <Button size="lg">{primaryButtonText}</Button>
        </Link>
        {showSecondaryButton && secondaryButtonText && (
          <Link href={secondaryButtonUrl}>
            <Button variant="outline" size="lg">
              {secondaryButtonText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  // Background image layout
  if (layout === "background_image") {
    return (
      <section
        className="relative grid"
        style={{ ...sectionStyle, ...(height ? { minHeight: height } : {}) }}
      >
        {/* Image in grid to set natural height, covers full area */}
        {backgroundImageUrl && (
          <Image
            src={backgroundImageUrl}
            alt=""
            width={1920}
            height={1080}
            className="col-start-1 row-start-1 h-full w-full object-cover"
            sizes="100vw"
            priority
          />
        )}
        {backgroundImageUrl && overlayOpacity !== "0" && (
          <div
            className="col-start-1 row-start-1"
            style={{ backgroundColor: `rgba(0, 0, 0, ${parseInt(overlayOpacity || "50") / 100})` }}
          />
        )}
        <div
          className={`col-start-1 row-start-1 flex px-4 py-16 sm:px-6 lg:px-8 ${vAlign}`}
        >
          <div className="container-homepage w-full">
            {textContent}
          </div>
        </div>
      </section>
    )
  }

  // Split layouts — image is edge-to-edge (no padding, full height)
  if (layout === "split_image_left" || layout === "split_image_right") {
    const splitImage = (
      <div className="relative min-h-[300px] md:min-h-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || heading || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-secondary">
            No image
          </div>
        )}
      </div>
    )

    const splitText = (
      <div className={`flex flex-col ${vJustify} px-8 py-16 sm:px-12 lg:px-20 lg:py-24`}>
        {textContent}
      </div>
    )

    return (
      <section style={sectionStyle}>
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={height ? { minHeight: height } : undefined}
        >
          {layout === "split_image_left" ? (
            <>
              {splitImage}
              {splitText}
            </>
          ) : (
            <>
              {splitText}
              {splitImage}
            </>
          )}
        </div>
      </section>
    )
  }

  // Centered layout (default)
  return (
    <section style={sectionStyle}>
      <div
        className={`container-homepage flex px-4 py-32 sm:px-6 lg:px-8 lg:py-40 ${vAlign}`}
        style={height ? { minHeight: height } : undefined}
      >
        <div className="w-full">
          {textContent}
        </div>
      </div>
    </section>
  )
}
