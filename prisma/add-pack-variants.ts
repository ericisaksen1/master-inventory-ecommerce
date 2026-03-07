import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Wiping all existing variants...")

  await prisma.productVariant.deleteMany({})
  console.log("All variants deleted.\n")

  const products = await prisma.product.findMany({
    select: { id: true, name: true, basePrice: true },
    orderBy: { name: "asc" },
  })

  console.log(`Adding pack variants to ${products.length} products...\n`)

  for (const product of products) {
    const unitPrice = Number(product.basePrice)
    const threePackPrice = Math.round(unitPrice * 3)
    const fivePackPrice = Math.round(unitPrice * 5)
    const tenPackPrice = Math.round(unitPrice * 10)

    await prisma.productVariant.createMany({
      data: [
        {
          productId: product.id,
          name: "Single",
          price: unitPrice,
          stock: 100,
          sortOrder: 0,
          options: [{ name: "Pack", value: "Single" }],
        },
        {
          productId: product.id,
          name: "3 Pack",
          price: threePackPrice,
          stock: 100,
          sortOrder: 1,
          options: [{ name: "Pack", value: "3 Pack" }],
        },
        {
          productId: product.id,
          name: "5 Pack",
          price: fivePackPrice,
          stock: 100,
          sortOrder: 2,
          options: [{ name: "Pack", value: "5 Pack" }],
        },
        {
          productId: product.id,
          name: "10 Pack",
          price: tenPackPrice,
          stock: 100,
          sortOrder: 3,
          options: [{ name: "Pack", value: "10 Pack" }],
        },
      ],
    })

    console.log(
      `${product.name}: Single=$${unitPrice}, 3 Pack=$${threePackPrice}, 5 Pack=$${fivePackPrice}, 10 Pack=$${tenPackPrice}`
    )
  }

  console.log(`\nDone! Added variants to ${products.length} products.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
