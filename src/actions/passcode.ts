"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSetting } from "@/lib/settings"

export async function verifyPasscode(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const passcode = (formData.get("passcode") as string)?.trim()
  if (!passcode) {
    return { error: "Please enter the passcode" }
  }

  const storedPasscode = await getSetting("storefront_passcode_value")
  if (passcode.toLowerCase() !== storedPasscode?.toLowerCase()) {
    return { error: "Invalid passcode" }
  }

  const cookieStore = await cookies()
  cookieStore.set("passcode_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  redirect("/")
}
