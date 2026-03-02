"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { addressSchema } from "@/lib/validations/checkout"

export async function createAddress(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || undefined,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postalCode: formData.get("postalCode") as string,
    country: "US",
    phone: formData.get("phone") as string,
  }

  const validated = addressSchema.safeParse(data)
  if (!validated.success) return { error: validated.error.issues[0].message }

  const label = (formData.get("label") as string)?.trim() || null
  const isDefault = formData.get("isDefault") === "true"

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label,
      isDefault,
      ...validated.data,
    },
  })

  revalidatePath("/account/addresses")
  return { success: true }
}

export async function updateAddress(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== session.user.id) return { error: "Address not found" }

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || undefined,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postalCode: formData.get("postalCode") as string,
    country: "US",
    phone: formData.get("phone") as string,
  }

  const validated = addressSchema.safeParse(data)
  if (!validated.success) return { error: validated.error.issues[0].message }

  const label = (formData.get("label") as string)?.trim() || null
  const isDefault = formData.get("isDefault") === "true"

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  await prisma.address.update({
    where: { id },
    data: { label, isDefault, ...validated.data },
  })

  revalidatePath("/account/addresses")
  return { success: true }
}

export async function deleteAddress(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== session.user.id) return { error: "Address not found" }

  await prisma.address.delete({ where: { id } })
  revalidatePath("/account/addresses")
  return { success: true }
}

export async function setDefaultAddress(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== session.user.id) return { error: "Address not found" }

  await prisma.address.updateMany({
    where: { userId: session.user.id, isDefault: true },
    data: { isDefault: false },
  })

  await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  })

  revalidatePath("/account/addresses")
  return { success: true }
}
