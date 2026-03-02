import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Clearing database...\n")

  // Delete in order: children first, then parents
  const deleted = await prisma.$transaction([
    prisma.affiliateCommission.deleteMany(),
    prisma.affiliateClick.deleteMany(),
    prisma.shippingLabel.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.affiliate.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.address.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.page.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.user.deleteMany(),
  ])

  const tables = [
    "AffiliateCommission", "AffiliateClick", "ShippingLabel", "Payment", "OrderItem", "Order",
    "Coupon", "Affiliate", "CartItem", "Cart", "ProductImage", "ProductCategory",
    "ProductVariant", "Product", "Category", "Address", "PasswordResetToken",
    "VerificationToken", "Session", "Account", "MenuItem", "Page", "Setting", "User",
  ]

  for (let i = 0; i < tables.length; i++) {
    console.log(`  ${tables[i]}: ${deleted[i].count} deleted`)
  }

  console.log("\nDatabase cleared.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
