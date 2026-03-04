"use client"

import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface BulkOrderCtaProps extends ComponentColorProps {
  heading: string
  description: string
  buttonText: string
}

export function BulkOrderCta({
  heading,
  description,
  buttonText,
  bgColor,
  headlineColor,
  textColor,
  buttonColor,
  buttonTextColor,
  buttonHoverColor,
  buttonHoverTextColor,
}: BulkOrderCtaProps) {
  return (
    <section
      className="bg-[#f5f5f7]"
      style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}
    >
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2
            className="text-3xl font-semibold tracking-tight text-foreground"
            style={headlineColorStyle(headlineColor)}
          >
            {heading}
          </h2>
          {description && (
            <p className="mt-4 text-lg text-secondary" style={textColorStyle(textColor)}>
              {description}
            </p>
          )}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-bulk-order-popup"))}
              className="btn-primary rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider"
            >
              {buttonText || "REQUEST PRICE LIST"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
