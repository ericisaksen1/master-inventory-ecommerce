import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface CtaBannerProps extends ComponentColorProps {
  heading: string
  subtext: string
  buttonText: string
  buttonUrl: string
  style: "primary" | "dark" | "accent"
}

const styleClasses = {
  primary: "bg-primary text-white",
  dark: "bg-gray-900 text-white",
  accent: "bg-amber-500 text-gray-900",
}

export function CtaBanner({ heading, subtext, buttonText, buttonUrl, style, bgColor, headlineColor, textColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor }: CtaBannerProps) {
  return (
    <section className={`${styleClasses[style] || styleClasses.primary}`} style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}>
      <div className="container-homepage px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
        {subtext && (
          <p className="mx-auto mt-6 max-w-2xl text-xl opacity-90" style={textColorStyle(textColor)}>
            {subtext}
          </p>
        )}
        {buttonText && (
          <div className="mt-10">
            <Link href={buttonUrl || "/products"}>
              <Button
                size="lg"
                variant={style === "accent" ? "primary" : "outline"}
                className={style !== "accent" ? "border-white text-white hover:bg-white hover:text-gray-900" : ""}
              >
                {buttonText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
