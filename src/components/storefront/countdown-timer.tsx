"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface CountdownTimerProps extends ComponentColorProps {
  heading: string
  endDate: string
  buttonText: string
  buttonUrl: string
  expiredMessage: string
}

function calculateTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ heading, endDate, buttonText, buttonUrl, expiredMessage, bgColor, headlineColor, textColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (!endDate) return null

  const isExpired = !timeLeft

  return (
    <section className="bg-gray-900 text-white" style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}>
      <div className="container-homepage px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl" style={headlineColorStyle(headlineColor)}>{heading}</h2>

        {isExpired ? (
          <p className="mt-6 text-lg text-gray-300" style={textColorStyle(textColor)}>
            {expiredMessage || "This sale has ended."}
          </p>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Min" },
                { value: timeLeft.seconds, label: "Sec" },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <span className="text-4xl font-bold tabular-nums sm:text-5xl" style={textColorStyle(textColor)}>
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wider text-gray-400">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {buttonText && (
              <div className="mt-8">
                <Link href={buttonUrl || "/products"}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    {buttonText}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
