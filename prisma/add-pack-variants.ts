import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * One-time migration: Convert 3-pack products into pack variants on individual products.
 * Creates 1, 3, 5, and 10 pack variants, then removes 3-pack products and categories.
 */

// Map: [3-pack product ID, individual product ID]
const pairings: [string, string][] = [
  ["cmm855g7v0003rmc73lbbehz3", "cmm855g9o000brmc744niwvzi"], // GLP-T 30mg
  ["cmm855g8r0007rmc78g8ru3xf", "cmm855g8u0008rmc7gtn8msx6"], // CJC with DAC 5mg
  ["cmm855g920009rmc7gauvkg8x", "cmm855gee000nrmc7fiqhr2s4"], // BPC-157 + TB-500 10mg
  ["cmm855g9s000crmc7wdq2navu", "cmm855gh2000qrmc7hakqw3bs"], // CJC-1295+IPA no DAC 10mg
  ["cmm855gad000drmc7i0h7r4cd", "cmm855gb5000ermc772ot23oz"], // Tesa 11mg + Ipa 6mg Blend
  ["cmm855gbu000frmc7qh0q6f74", "cmm855gre001qrmc7wfych4x8"], // HCG 5000
  ["cmm855gc4000hrmc7if25v7y6", "cmm855gcj000irmc7grgqz549"], // TRIPLE HELIX
  ["cmm855gnw000zrmc7mawwfzau", "cmm855gr1001lrmc7lwkowkcg"], // BPC-157 + TB-500 20mg
  ["cmm855gny0010rmc730nm12x7", "cmm855gqd001hrmc7v3mmh15n"], // MOTS-C 10mg
  ["cmm855go20011rmc7si1w9nao", "cmm855gq1001frmc78wkesr99"], // L-Carnitine 500mg/ml 10ml
  ["cmm855go40012rmc7w7mskpdz", "cmm855gpu001drmc7iv6lqa93"], // Tesamorelin 10mg
  ["cmm855go80013rmc7koj11ega", "cmm855glx000srmc76xeu30bs"], // Cagri 10mg
  ["cmm855goy0016rmc769kq5jdk", "cmm855gsg001xrmc7hwjuyhpn"], // GLP-R 10mg
  ["cmm855gp10017rmc7jh9azje1", "cmm855gsb001wrmc7fo4ioe2y"], // GLP-R 20mg
  ["cmm855gp30018rmc7fnev3gup", "cmm855gs8001vrmc79tkhh139"], // GLP-R 30mg
  ["cmm855gp60019rmc7enix95zl", "cmm855grc001prmc7mu8qhxbg"], // KLOW 80mg
]

const THREE_PACK_IDS = pairings.map(([id]) => id)

const CATEGORY_IDS_TO_DELETE = [
  "cmm88l11a0001rmmc48u452a6", // 3 Packs subcategory
  "cmm855g7h0001rmc70hpkrmcx", // Packs parent category
]

async function main() {
  console.log("Starting pack variant migration...\n")

  // Step 1: Create variants on individual products
  for (const [threePackId, individualId] of pairings) {
    const [threePack, individual] = await Promise.all([
      prisma.product.findUnique({ where: { id: threePackId } }),
      prisma.product.findUnique({ where: { id: individualId } }),
    ])

    if (!threePack || !individual) {
      console.log(`⚠ Skipping pair: 3-pack=${threePackId} individual=${individualId} (not found)`)
      continue
    }

    const unitPrice = Number(individual.basePrice)
    const threePackPrice = Number(threePack.basePrice)
    const fivePackPrice = Math.round(unitPrice * 5 * 0.90)
    const tenPackPrice = Math.round(unitPrice * 10 * 0.80)

    // Delete any existing variants on the individual product first
    await prisma.productVariant.deleteMany({ where: { productId: individualId } })

    await prisma.productVariant.createMany({
      data: [
        {
          productId: individualId,
          name: "1 Pack",
          price: unitPrice,
          stock: 100,
          sortOrder: 0,
          options: [{ name: "Pack", value: "1 Pack" }],
        },
        {
          productId: individualId,
          name: "3 Pack",
          price: threePackPrice,
          stock: 100,
          sortOrder: 1,
          options: [{ name: "Pack", value: "3 Pack" }],
        },
        {
          productId: individualId,
          name: "5 Pack",
          price: fivePackPrice,
          stock: 100,
          sortOrder: 2,
          options: [{ name: "Pack", value: "5 Pack" }],
        },
        {
          productId: individualId,
          name: "10 Pack",
          price: tenPackPrice,
          stock: 100,
          sortOrder: 3,
          options: [{ name: "Pack", value: "10 Pack" }],
        },
      ],
    })

    console.log(`✓ ${individual.name}: 1=$${unitPrice}, 3=$${threePackPrice}, 5=$${fivePackPrice}, 10=$${tenPackPrice}`)
  }

  // Step 2: Delete 3-pack products (children first)
  console.log("\nDeleting 3-pack products...")

  await prisma.productCategory.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.productImage.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.productVariant.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.cartItem.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.orderItem.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.wishlistItem.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.productReview.deleteMany({
    where: { productId: { in: THREE_PACK_IDS } },
  })
  await prisma.product.deleteMany({
    where: { id: { in: THREE_PACK_IDS } },
  })

  console.log(`✓ Deleted ${THREE_PACK_IDS.length} 3-pack products`)

  // Step 3: Delete empty categories
  console.log("\nDeleting empty categories...")

  // Delete subcategory first, then parent
  await prisma.productCategory.deleteMany({
    where: { categoryId: { in: CATEGORY_IDS_TO_DELETE } },
  })
  await prisma.category.deleteMany({
    where: { id: { in: CATEGORY_IDS_TO_DELETE } },
  })

  console.log("✓ Deleted '3 Packs' and 'Packs' categories")

  console.log("\nDone!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
