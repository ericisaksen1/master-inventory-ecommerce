"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const GUEST_CART_COOKIE = "guest_cart_session"

async function getOrCreateCart() {
  const session = await auth()

  if (session?.user?.id) {
    // Logged-in user: find or create user cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
              variant: true,
            },
          },
        },
      })
    }

    return cart
  }

  // Guest user: use session cookie
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set(GUEST_CART_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    })
  }

  return cart
}

export async function getCart() {
  const session = await auth()
  const include = {
    items: {
      include: {
        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        variant: true,
      },
    },
  }

  if (session?.user?.id) {
    return prisma.cart.findUnique({ where: { userId: session.user.id }, include })
  }

  const cookieStore = await cookies()
  const sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value
  if (!sessionId) return null

  return prisma.cart.findUnique({ where: { sessionId }, include })
}

export async function addToCart(productId: string, variantId: string | null, quantity: number = 1) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return { error: "Invalid quantity" }
  }

  const cart = await getOrCreateCart()

  // Check if item already exists in cart
  const existingItem = cart.items.find(
    (item) => item.productId === productId && item.variantId === variantId
  )

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > 99) {
      return { error: "Maximum quantity of 99 reached" }
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      },
    })
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return { error: "Invalid quantity" }
  }

  const cart = await getOrCreateCart()
  const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
  if (!cartItem || cartItem.cartId !== cart.id) {
    return { error: "Item not found" }
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } })
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  const cart = await getOrCreateCart()
  const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
  if (!cartItem || cartItem.cartId !== cart.id) {
    return { error: "Item not found" }
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } })
  revalidatePath("/", "layout")
  return { success: true }
}

export async function clearCart() {
  const cart = await getOrCreateCart()
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  revalidatePath("/", "layout")
  return { success: true }
}

export async function mergeGuestCart() {
  const session = await auth()
  if (!session?.user?.id) return

  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get(GUEST_CART_COOKIE)?.value
  if (!guestSessionId) return

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  })

  if (!guestCart || guestCart.items.length === 0) {
    // Clean up empty guest cart
    if (guestCart) await prisma.cart.delete({ where: { id: guestCart.id } })
    cookieStore.delete(GUEST_CART_COOKIE)
    return
  }

  // Get or create user cart
  let userCart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  })

  if (!userCart) {
    // Just reassign the guest cart to the user
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId: session.user.id, sessionId: null },
    })
    cookieStore.delete(GUEST_CART_COOKIE)
    return
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(
      (item) => item.productId === guestItem.productId && item.variantId === guestItem.variantId
    )

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + guestItem.quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
        },
      })
    }
  }

  // Delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } })
  cookieStore.delete(GUEST_CART_COOKIE)

  revalidatePath("/", "layout")
}

export async function getCartCount() {
  const session = await auth()

  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  }

  // Guest: read cookie without setting it
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value
  if (!sessionId) return 0

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  })
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}
