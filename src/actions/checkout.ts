"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { addressSchema } from "@/lib/validations/checkout"
import { generateOrderNumber } from "@/lib/utils"
import { getSetting, getSettings } from "@/lib/settings"
import { DEFAULT_AFFILIATE_DISCOUNT_RATE } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import type { PaymentMethod } from "@prisma/client"
import { notifyAdminNewOrder, notifyCustomerOrderPlaced, notifyAdminLowStock, notifyAdminOutOfStock } from "@/lib/email/notify"
import { createNotification } from "./notifications"
import { rateLimitByIp } from "@/lib/rate-limit"
import { getCart } from "@/actions/cart"
import { getMasterSkuForProduct } from "@/lib/master-inventory"
import bcrypt from "bcryptjs"

export async function createOrder(formData: FormData) {
  const rl = await rateLimitByIp("checkout", 10, 60_000)
  if (!rl.success) return { error: "Too many requests. Please try again later." }

  const session = await auth()
  const isGuest = !session?.user?.id

  if (isGuest) {
    const guestCheckoutEnabled = await getSetting("enable_guest_checkout")
    if (guestCheckoutEnabled === "false") {
      redirect("/login?returnUrl=/checkout")
    }
  }

  // Validate address
  const addressData = {
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

  const validatedAddress = addressSchema.safeParse(addressData)
  if (!validatedAddress.success) {
    return { error: validatedAddress.error.issues[0].message }
  }

  // Guest-specific fields
  const guestEmail = isGuest ? (formData.get("guestEmail") as string)?.trim() : null
  const wantsAccount = isGuest && formData.get("createAccount") === "true"
  const accountName = wantsAccount ? (formData.get("accountName") as string)?.trim() : null
  const accountPassword = wantsAccount ? (formData.get("password") as string) : null

  if (isGuest) {
    if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return { error: "Please enter a valid email address" }
    }
    if (wantsAccount) {
      if (!accountName) return { error: "Please enter your name" }
      if (!accountPassword || accountPassword.length < 8) return { error: "Password must be at least 8 characters" }
      const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } })
      if (existingUser) return { error: "An account with this email already exists. Please log in instead." }
    }
  }

  const paymentMethod = formData.get("paymentMethod") as PaymentMethod
  if (!["PAYPAL", "VENMO", "CASHAPP", "BITCOIN", "ZELLE"].includes(paymentMethod)) {
    return { error: "Please select a payment method" }
  }

  // Verify this payment method is enabled
  const enabledSetting = await getSetting(`enable_${paymentMethod.toLowerCase()}`)
  if (enabledSetting !== "true") {
    return { error: "This payment method is not currently available" }
  }

  // Get cart (supports both authenticated and guest sessions)
  const cart = await getCart()

  if (!cart || cart.items.length === 0) {
    return { error: "Your cart is empty" }
  }

  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant ? Number(item.variant.price) : Number(item.product.basePrice)
    return sum + price * item.quantity
  }, 0)

  // Process discount code (manual entry takes priority over cookie)
  const couponCode = (formData.get("couponCode") as string)?.trim().toUpperCase() || null
  const cookieStore = await cookies()
  const affiliateRef = cookieStore.get("affiliate_ref")?.value

  // Resolve affiliate attribution (safe outside transaction — no race condition)
  let affiliateId: string | null = null
  const codeToCheck = couponCode || (affiliateRef ? affiliateRef.toUpperCase() : null)

  if (codeToCheck) {
    const affiliate = await prisma.affiliate.findUnique({ where: { referralCode: codeToCheck, status: "APPROVED" } })
    if (affiliate) affiliateId = affiliate.id
  }
  if (!affiliateId && affiliateRef) {
    const cookieAffiliate = await prisma.affiliate.findUnique({ where: { referralCode: affiliateRef, status: "APPROVED" } })
    if (cookieAffiliate) affiliateId = cookieAffiliate.id
  }

  const taxRateStr = await getSetting("tax_rate")
  const shippingRateStr = await getSetting("shipping_flat_rate")
  const taxRate = parseFloat(taxRateStr) || 0
  const shippingCost = parseFloat(shippingRateStr) || 0

  const orderNumber = await generateOrderNumber()

  // Products linked to a MasterSku have stock managed at the master level — check/decrement MasterSku.stock instead
  const masterLinks = new Map<string, { masterSkuId: string; quantityMultiplier: number }>()
  for (const item of cart.items) {
    const link = await getMasterSkuForProduct(item.productId, item.variantId ?? undefined)
    if (link) masterLinks.set(item.id, { masterSkuId: link.masterSkuId, quantityMultiplier: link.quantityMultiplier })
  }

  // All discount calculation, stock checks, and order creation inside one transaction
  const order = await prisma.$transaction(async (tx) => {
    // Re-validate coupon inside transaction to prevent race conditions
    let couponId: string | null = null
    let discountAmount = 0
    let appliedCode: string | null = null

    if (codeToCheck) {
      const coupon = await tx.coupon.findUnique({ where: { code: codeToCheck } })

      if (coupon && coupon.isActive) {
        const validCoupon =
          (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
          (!coupon.startsAt || coupon.startsAt <= new Date()) &&
          (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
          (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount))

        if (validCoupon) {
          couponId = coupon.id
          appliedCode = coupon.code
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = subtotal * (Number(coupon.discountValue) / 100)
          } else {
            discountAmount = Math.min(Number(coupon.discountValue), subtotal)
          }
        }
      } else if (!coupon && affiliateId) {
        // Affiliate code only — apply affiliate discount
        const discountRateStr = await getSetting("affiliate_discount_rate")
        const discountRate = parseFloat(discountRateStr) || DEFAULT_AFFILIATE_DISCOUNT_RATE
        discountAmount = subtotal * (discountRate / 100)
        appliedCode = codeToCheck
      }
    }

    // Affiliate cookie fallback for discount
    if (!appliedCode && affiliateId) {
      const discountRateStr = await getSetting("affiliate_discount_rate")
      const discountRate = parseFloat(discountRateStr) || DEFAULT_AFFILIATE_DISCOUNT_RATE
      discountAmount = subtotal * (discountRate / 100)
      appliedCode = affiliateRef?.toUpperCase() || null
    }

    discountAmount = Math.round(discountAmount * 100) / 100
    const discountedSubtotal = subtotal - discountAmount
    const tax = discountedSubtotal * (taxRate / 100)
    const total = discountedSubtotal + tax + shippingCost

    // Verify stock availability before creating order
    for (const item of cart.items) {
      const masterLink = masterLinks.get(item.id)
      if (masterLink) {
        // Master-linked: check MasterSku stock
        const masterSku = await tx.masterSku.findUnique({ where: { id: masterLink.masterSkuId } })
        const needed = item.quantity * masterLink.quantityMultiplier
        if (!masterSku || masterSku.stock < needed) {
          throw new Error(`Insufficient stock for ${item.product.name}${item.variant?.name ? ` — ${item.variant.name}` : ""}`)
        }
        continue
      }

      const variantOptions = (item.variant?.options ?? []) as { name: string; value: string }[]
      const packOption = variantOptions.find((o) => o.name === "Pack")
      const packSize = packOption ? (parseInt(packOption.value) || 1) : 0

      if (packSize > 0 && item.variantId) {
        // Pack variant: check product-level stock (shared pool)
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        const needed = packSize * item.quantity
        if (!product || product.stock < needed) {
          throw new Error(`Insufficient stock for ${item.product.name} — ${item.variant?.name}`)
        }
      } else if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}${item.variant?.name ? ` — ${item.variant.name}` : ""}`)
        }
      } else {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`)
        }
      }
    }

    // If guest wants an account, create it now
    let newUserId: string | null = null
    if (isGuest && wantsAccount && accountName && accountPassword) {
      const hashedPassword = await bcrypt.hash(accountPassword, 10)
      const newUser = await tx.user.create({
        data: {
          email: guestEmail!,
          name: accountName,
          passwordHash: hashedPassword,
        },
      })
      newUserId = newUser.id
    }

    const orderUserId = isGuest ? newUserId : session.user!.id

    // Save address (only if we have a userId to link it to)
    let addressId: string | null = null
    if (orderUserId) {
      const address = await tx.address.create({
        data: {
          userId: orderUserId,
          ...validatedAddress.data,
        },
      })
      addressId = address.id
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: orderUserId,
        guestEmail: isGuest ? guestEmail : null,
        addressId,
        status: "AWAITING_PAYMENT",
        subtotal,
        tax,
        shippingCost,
        discountAmount,
        total,
        affiliateId,
        couponId,
        couponCode: appliedCode,
        shippingAddress: validatedAddress.data,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.product.name,
            variantName: item.variant?.name || null,
            sku: item.variant?.sku || item.product.sku || null,
            price: item.variant ? Number(item.variant.price) : Number(item.product.basePrice),
            quantity: item.quantity,
            total: (item.variant ? Number(item.variant.price) : Number(item.product.basePrice)) * item.quantity,
          })),
        },
        payment: {
          create: {
            method: paymentMethod,
            status: "PENDING",
            amount: total,
          },
        },
      },
    })

    // Increment coupon usage (inside transaction — race-safe)
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Decrement stock (already verified above)
    for (const item of cart.items) {
      const masterLink = masterLinks.get(item.id)
      if (masterLink) {
        // Master-linked: decrement MasterSku stock
        await tx.masterSku.update({
          where: { id: masterLink.masterSkuId },
          data: { stock: { decrement: item.quantity * masterLink.quantityMultiplier } },
        })
        continue
      }

      const variantOptions = (item.variant?.options ?? []) as { name: string; value: string }[]
      const packOption = variantOptions.find((o) => o.name === "Pack")
      const packSize = packOption ? (parseInt(packOption.value) || 1) : 0

      if (packSize > 0 && item.variantId) {
        // Pack variant: deduct packSize * quantity from product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: packSize * item.quantity } },
        })
      } else if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return newOrder
  }).catch((err: Error) => {
    if (err.message.startsWith("Insufficient stock")) {
      return { error: err.message } as const
    }
    throw err
  })

  if ("error" in order) {
    return { error: order.error }
  }

  // Determine customer info for notifications
  const customerName = isGuest ? `${addressData.firstName} ${addressData.lastName}`.trim() || "Guest" : (session.user!.name || "Customer")
  const customerEmail = isGuest ? guestEmail! : session.user!.email!

  // Add to subscriber list
  void prisma.subscriber.upsert({
    where: { email: customerEmail },
    update: {},
    create: { email: customerEmail, source: "order" },
  })

  // Admin notification (fire-and-forget)
  void createNotification({
    type: "order",
    title: "New Order",
    message: `Order #${orderNumber} from ${customerName} — ${formatCurrency(Number(order.total))}`,
    link: `/admin/orders/${order.id}`,
  })

  // Email notifications (fire-and-forget)
  const emailItems = cart.items.map((item) => ({
    name: item.product.name + (item.variant?.name ? ` — ${item.variant.name}` : ""),
    quantity: item.quantity,
    price: formatCurrency(
      (item.variant ? Number(item.variant.price) : Number(item.product.basePrice)) * item.quantity
    ),
  }))
  void notifyAdminNewOrder(
    orderNumber,
    formatCurrency(Number(order.total)),
    customerName,
    emailItems,
    customerEmail
  )
  void notifyCustomerOrderPlaced(
    customerEmail,
    orderNumber,
    formatCurrency(Number(order.total)),
    paymentMethod,
    emailItems
  )

  // Low stock & out-of-stock alerts
  const lowStockThreshold = parseInt(await getSetting("low_stock_threshold") || "10") || 10
  for (const item of cart.items) {
    const masterLink = masterLinks.get(item.id)
    if (masterLink) {
      // Master-linked: alert based on MasterSku stock (already decremented)
      const ms = await prisma.masterSku.findUnique({ where: { id: masterLink.masterSkuId } })
      if (ms) {
        const name = item.product.name + (item.variant?.name ? ` — ${item.variant.name}` : "")
        if (ms.stock <= 0) {
          void notifyAdminOutOfStock(name)
        } else if (ms.stock < lowStockThreshold) {
          void notifyAdminLowStock(name, ms.stock)
        }
      }
      continue
    }
    const variantOptions = (item.variant?.options ?? []) as { name: string; value: string }[]
    const packOption = variantOptions.find((o) => o.name === "Pack")
    const packSize = packOption ? (parseInt(packOption.value) || 1) : 0

    if (packSize > 0 && item.variantId) {
      // Pack variant: alert based on product stock
      const newStock = item.product.stock - (packSize * item.quantity)
      if (newStock <= 0) {
        void notifyAdminOutOfStock(item.product.name)
      } else if (newStock < lowStockThreshold) {
        void notifyAdminLowStock(item.product.name, newStock)
      }
    } else if (item.variantId && item.variant) {
      const newStock = item.variant.stock - item.quantity
      const name = item.product.name + (item.variant.name ? ` — ${item.variant.name}` : "")
      if (newStock <= 0) {
        void notifyAdminOutOfStock(name)
      } else if (newStock < lowStockThreshold) {
        void notifyAdminLowStock(name, newStock)
      }
    } else if (!item.variantId) {
      const newStock = item.product.stock - item.quantity
      if (newStock <= 0) {
        void notifyAdminOutOfStock(item.product.name)
      } else if (newStock < lowStockThreshold) {
        void notifyAdminLowStock(item.product.name, newStock)
      }
    }
  }

  revalidatePath("/", "layout")
  redirect(`/checkout/confirmation?orderId=${order.id}`)
}

export async function submitPaymentConfirmation(orderId: string, transactionRef: string) {
  const session = await auth()

  let order
  if (session?.user?.id) {
    order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { payment: true },
    })
  } else {
    // Guest: find order by ID and verify it's a guest order
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })
    if (order?.userId) order = null // Not a guest order — deny access
  }

  if (!order) return { error: "Order not found" }
  if (!order.payment) return { error: "No payment record found" }
  if (order.payment.status !== "PENDING") return { error: "Payment already submitted" }

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      status: "SUBMITTED",
      transactionRef: transactionRef || null,
    },
  })

  return { success: true }
}
