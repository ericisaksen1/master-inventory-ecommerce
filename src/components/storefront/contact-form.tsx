"use client"

import { useState, useTransition } from "react"
import { submitContactMessage } from "@/actions/contact"
import { Turnstile } from "@/components/ui/turnstile"

export type ContactPageStyle = "standard" | "centered" | "split" | "minimal"

interface ContactFormProps {
  style: ContactPageStyle
  storeName: string
  storeEmail: string
}

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

function FormFields({ isPending, submitted }: { isPending: boolean; submitted: boolean }) {
  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-900">Message Sent!</h3>
        <p className="mt-1 text-sm text-green-700">Thank you for reaching out. We'll get back to you soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          className={inputClass}
          placeholder="How can we help?"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className={inputClass}
          placeholder="Tell us more..."
        />
      </div>
      <Turnstile />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[var(--radius)] shadow-[var(--shadow)] bg-[var(--color-button-bg)] px-6 py-2.5 text-sm font-medium text-[var(--color-button-text)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </div>
  )
}

function ContactInfo({ storeName, storeEmail }: { storeName: string; storeEmail: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Get in Touch</h3>
        <p className="mt-2 text-sm text-secondary">
          Have a question, concern, or just want to say hello? Fill out the form and we'll get back to you as soon as possible.
        </p>
      </div>
      {storeName && (
        <div>
          <p className="text-sm font-medium">{storeName}</p>
        </div>
      )}
      {storeEmail && (
        <div>
          <p className="text-sm font-medium">Email</p>
          <a href={`mailto:${storeEmail}`} className="text-sm text-primary hover:underline">
            {storeEmail}
          </a>
        </div>
      )}
    </div>
  )
}

export function ContactForm({ style, storeName, storeEmail }: ContactFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit(formData: FormData) {
    setError("")
    startTransition(async () => {
      const result = await submitContactMessage(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  const errorBanner = error ? (
    <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
  ) : null

  // ── Standard: two-column ──
  if (style === "standard") {
    return (
      <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="mt-2 text-secondary">We'd love to hear from you.</p>
            <form action={handleSubmit} className="mt-8">
              {errorBanner}
              <FormFields isPending={isPending} submitted={submitted} />
            </form>
          </div>
          <div className="lg:col-span-2 lg:pt-12">
            <ContactInfo storeName={storeName} storeEmail={storeEmail} />
          </div>
        </div>
      </div>
    )
  }

  // ── Centered ──
  if (style === "centered") {
    return (
      <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="mt-2 text-secondary">We'd love to hear from you. Send us a message below.</p>
          </div>
          <form action={handleSubmit} className="mt-8">
            {errorBanner}
            <FormFields isPending={isPending} submitted={submitted} />
          </form>
        </div>
      </div>
    )
  }

  // ── Split ──
  if (style === "split") {
    return (
      <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-2">
        {/* Branded panel */}
        <div className="flex flex-col justify-center bg-primary px-8 py-12 text-[var(--color-button-text)] sm:px-12 lg:px-16">
          <h1 className="text-3xl font-bold">Get in Touch</h1>
          <p className="mt-4 text-sm opacity-80">
            Have a question, concern, or just want to say hello? We'd love to hear from you.
          </p>
          {storeName && <p className="mt-8 text-sm font-medium">{storeName}</p>}
          {storeEmail && (
            <a href={`mailto:${storeEmail}`} className="mt-2 text-sm opacity-80 hover:opacity-100">
              {storeEmail}
            </a>
          )}
        </div>
        {/* Form panel */}
        <div className="flex items-center justify-center px-8 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold">Send a Message</h2>
            <form action={handleSubmit} className="mt-6">
              {errorBanner}
              <FormFields isPending={isPending} submitted={submitted} />
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Minimal ──
  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Contact</h1>
        <form action={handleSubmit} className="mt-6">
          {errorBanner}
          <FormFields isPending={isPending} submitted={submitted} />
        </form>
      </div>
    </div>
  )
}
