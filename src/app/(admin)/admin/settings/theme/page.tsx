import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ThemeForm } from "./theme-form"

export const metadata = { title: "Theme Options | Admin" }

export default async function ThemeOptionsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin/settings")
  }

  const settings = await prisma.setting.findMany()
  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Theme Options</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customize your store appearance and branding. Changes apply to all visitors.
      </p>

      <ThemeForm settings={settingsMap} />
    </div>
  )
}
