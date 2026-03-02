import Link from "next/link"

export const metadata = {
  title: "Page Not Found",
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-500">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-[var(--radius)] shadow-[var(--shadow)] bg-[var(--color-button-bg,#111)] px-5 py-2.5 text-sm font-medium text-[var(--color-button-text,#fff)] transition hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
        >
          Browse products
        </Link>
      </div>
    </div>
  )
}
