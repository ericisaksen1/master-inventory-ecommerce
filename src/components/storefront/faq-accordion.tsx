"use client"

import { useState } from "react"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps extends ComponentColorProps {
  heading: string
  items: FaqItem[]
}

export function FaqAccordion({ heading, items, bgColor, headlineColor, textColor }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100" style={headlineColorStyle(headlineColor)}>
            {heading}
          </h2>
        )}
        <div className={`${heading ? "mt-8" : ""} divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700`}>
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100" style={textColorStyle(textColor)}>
                    {item.question}
                  </span>
                  <svg
                    className={`ml-4 h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="pb-4 text-gray-600 dark:text-gray-300" style={textColorStyle(textColor)}>
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}
