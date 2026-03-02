"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { subscribeToNewsletter } from "@/actions/subscribers"
import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface NewsletterSignupProps extends ComponentColorProps {
  heading: string
  description: string
  buttonText: string
  placeholder: string
}

export function NewsletterSignup({ heading, description, buttonText, placeholder, bgColor, headlineColor, textColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      const result = await subscribeToNewsletter(email)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Thanks for subscribing!")
        setEmail("")
      }
    })
  }

  return (
    <section className="bg-[#f5f5f7]" style={sectionColorStyle({ bgColor, buttonColor, buttonTextColor, buttonHoverColor, buttonHoverTextColor })}>
      <div className="container-homepage px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground" style={headlineColorStyle(headlineColor)}>
            {heading}
          </h2>
          {description && (
            <p className="mt-4 text-lg text-secondary" style={textColorStyle(textColor)}>
              {description}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-8 flex gap-4 sm:mx-auto sm:max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder || "Enter your email"}
              className="flex-1 rounded-full border-0 bg-white px-6 py-2.5 text-sm shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={isPending}>{isPending ? "..." : (buttonText || "Subscribe")}</Button>
          </form>
        </div>
      </div>
    </section>
  )
}
