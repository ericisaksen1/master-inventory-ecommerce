import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "blckoutbrbell@gmail.com" },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: "blckoutbrbell@gmail.com",
      name: "Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  })

  console.log("Created admin user:", admin.email)

  // Seed default settings
  const defaultSettings = [
    { key: "store_name", value: "Store", type: "string" },
    { key: "store_description", value: "Welcome to our store", type: "string" },
    { key: "venmo_username", value: "", type: "string" },
    { key: "venmo_qr_url", value: "", type: "string" },
    { key: "cashapp_tag", value: "", type: "string" },
    { key: "cashapp_qr_url", value: "", type: "string" },
    { key: "bitcoin_address", value: "", type: "string" },
    { key: "bitcoin_qr_url", value: "", type: "string" },
    { key: "default_commission_rate", value: "10", type: "number" },
    { key: "affiliate_cookie_days", value: "30", type: "number" },
    { key: "tax_rate", value: "0", type: "number" },
    { key: "shipping_flat_rate", value: "0", type: "number" },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log("Seeded default settings")

  // --- Category ---
  const peptides = await prisma.category.upsert({
    where: { slug: "peptides" },
    update: {},
    create: { name: "Peptides", slug: "peptides", description: "Research peptides and compounds", sortOrder: 1 },
  })

  console.log("Seeded category:", peptides.name)

  // --- Products ---
  const products: Array<{
    name: string
    slug: string
    description: string
    shortDescription: string
    basePrice: number
    compareAtPrice?: number
    sku: string
    isFeatured?: boolean
    categoryId: string
    variants: { name: string; sku: string; price: number; stock: number; options: { name: string; value: string }[] }[]
    images: { url: string; alt: string; isPrimary?: boolean }[]
  }> = [
    {
      name: "NAD+500 (pH Buffered)",
      slug: "nad-500",
      description: "NAD+500 is a pH-buffered nicotinamide adenine dinucleotide formulation designed for research applications. Each vial contains 500mg of high-purity NAD+ in a lyophilized powder form, ready for reconstitution.",
      shortDescription: "500mg pH-buffered NAD+ lyophilized powder",
      basePrice: 65.00,
      sku: "PEP-NAD-500",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-NAD-500-DEF", price: 65.00, stock: 50, options: [{ name: "Size", value: "500mg" }] },
      ],
      images: [
        { url: "/uploads/products/nad-500.png", alt: "NAD+500 pH Buffered", isPrimary: true },
      ],
    },
    {
      name: "Retatrutide 30mg",
      slug: "retatrutide-30mg",
      description: "Retatrutide is a triple agonist peptide targeting GIP, GLP-1, and glucagon receptors. This 30mg vial contains high-purity lyophilized powder for research purposes.",
      shortDescription: "30mg triple agonist research peptide",
      basePrice: 150.00,
      sku: "PEP-RET-30",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-RET-30-DEF", price: 150.00, stock: 30, options: [{ name: "Size", value: "30mg" }] },
      ],
      images: [
        { url: "/uploads/products/retatrutide-30mg.png", alt: "Retatrutide 30mg", isPrimary: true },
      ],
    },
    {
      name: "Retatrutide 10mg",
      slug: "retatrutide-10mg",
      description: "Retatrutide is a triple agonist peptide targeting GIP, GLP-1, and glucagon receptors. This 10mg vial is ideal for smaller-scale research applications.",
      shortDescription: "10mg triple agonist research peptide",
      basePrice: 50.00,
      sku: "PEP-RET-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-RET-10-DEF", price: 50.00, stock: 40, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/retatrutide-10mg.png", alt: "Retatrutide 10mg", isPrimary: true },
      ],
    },
    {
      name: "Tirzepatide 10mg",
      slug: "tirzepatide-10mg",
      description: "Tirzepatide is a dual GIP and GLP-1 receptor agonist peptide. Each vial contains 10mg of lyophilized powder. Limited stock available.",
      shortDescription: "10mg dual agonist peptide — limited stock",
      basePrice: 65.00,
      sku: "PEP-TZP-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-TZP-10-DEF", price: 65.00, stock: 10, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/tirzepatide-10mg.png", alt: "Tirzepatide 10mg", isPrimary: true },
      ],
    },
    {
      name: "BPC-157 10mg",
      slug: "bpc-157-10mg",
      description: "BPC-157 (Body Protection Compound) is a pentadecapeptide derived from human gastric juice. Each vial contains 10mg of high-purity lyophilized peptide for research use.",
      shortDescription: "10mg body protection compound peptide",
      basePrice: 40.00,
      sku: "PEP-BPC-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-BPC-10-DEF", price: 40.00, stock: 60, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/bpc157-10mg.png", alt: "BPC-157 10mg", isPrimary: true },
      ],
    },
    {
      name: "TB-500 10mg",
      slug: "tb-500-10mg",
      description: "TB-500 (Thymosin Beta-4) is a naturally occurring peptide found in virtually all human and animal cells. Each vial contains 10mg of lyophilized powder.",
      shortDescription: "10mg Thymosin Beta-4 research peptide",
      basePrice: 40.00,
      sku: "PEP-TB5-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-TB5-10-DEF", price: 40.00, stock: 55, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/tb500-10mg.png", alt: "TB-500 10mg", isPrimary: true },
      ],
    },
    {
      name: "Semax 10mg",
      slug: "semax-10mg",
      description: "Semax is a synthetic peptide derived from adrenocorticotropic hormone (ACTH). Each vial contains 10mg of lyophilized research-grade peptide.",
      shortDescription: "10mg ACTH-derived nootropic peptide",
      basePrice: 50.00,
      sku: "PEP-SMX-10",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-SMX-10-DEF", price: 50.00, stock: 35, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/semax-10mg.png", alt: "Semax 10mg", isPrimary: true },
      ],
    },
    {
      name: "GHK-CU",
      slug: "ghk-cu",
      description: "GHK-Cu (copper peptide) is a naturally occurring tripeptide with a high affinity for copper ions. Each vial contains research-grade lyophilized peptide.",
      shortDescription: "Copper tripeptide for research applications",
      basePrice: 40.00,
      sku: "PEP-GHK-CU",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-GHK-CU-DEF", price: 40.00, stock: 40, options: [{ name: "Size", value: "Standard" }] },
      ],
      images: [
        { url: "/uploads/products/ghk-cu.png", alt: "GHK-CU", isPrimary: true },
      ],
    },
    {
      name: "MOTS-C",
      slug: "mots-c",
      description: "MOTS-c is a mitochondrial-derived peptide encoded within the 12S rRNA gene. Each vial contains high-purity lyophilized powder for research purposes.",
      shortDescription: "Mitochondrial-derived research peptide",
      basePrice: 50.00,
      sku: "PEP-MOT-C",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-MOT-C-DEF", price: 50.00, stock: 30, options: [{ name: "Size", value: "Standard" }] },
      ],
      images: [
        { url: "/uploads/products/mots-c.png", alt: "MOTS-C", isPrimary: true },
      ],
    },
    {
      name: "TB-500 5mg / BPC-157 5mg Blend 10mg",
      slug: "tb500-bpc157-blend",
      description: "A synergistic blend combining 5mg TB-500 (Thymosin Beta-4) and 5mg BPC-157 in a single 10mg vial. Lyophilized powder for research applications.",
      shortDescription: "10mg synergistic TB-500 + BPC-157 blend",
      basePrice: 75.00,
      sku: "PEP-TBBPC-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-TBBPC-10-DEF", price: 75.00, stock: 25, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/tb500-bpc157-blend.png", alt: "TB-500 / BPC-157 Blend 10mg", isPrimary: true },
      ],
    },
    {
      name: "Epithalon 10mg",
      slug: "epithalon-10mg",
      description: "Epithalon (Epitalon) is a synthetic tetrapeptide based on the natural peptide epithalamin. Each vial contains 10mg of lyophilized research-grade peptide.",
      shortDescription: "10mg synthetic tetrapeptide",
      basePrice: 50.00,
      sku: "PEP-EPT-10",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-EPT-10-DEF", price: 50.00, stock: 35, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/epithalon-10mg.png", alt: "Epithalon 10mg", isPrimary: true },
      ],
    },
    {
      name: "SS-31",
      slug: "ss-31",
      description: "SS-31 (Elamipretide) is a mitochondria-targeted tetrapeptide. Each vial contains high-purity lyophilized powder for research applications.",
      shortDescription: "Mitochondria-targeted tetrapeptide",
      basePrice: 45.00,
      sku: "PEP-SS31",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-SS31-DEF", price: 45.00, stock: 30, options: [{ name: "Size", value: "Standard" }] },
      ],
      images: [
        { url: "/uploads/products/ss-31.png", alt: "SS-31", isPrimary: true },
      ],
    },
    {
      name: "5-Amino-1MQ 50mg",
      slug: "5-amino-1mq",
      description: "5-Amino-1MQ is a small molecule inhibitor of NNMT (nicotinamide N-methyltransferase). Each vial contains 50mg of research-grade compound in lyophilized form.",
      shortDescription: "50mg NNMT inhibitor compound",
      basePrice: 80.00,
      sku: "PEP-5A1-50",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-5A1-50-DEF", price: 80.00, stock: 20, options: [{ name: "Size", value: "50mg" }] },
      ],
      images: [
        { url: "/uploads/products/5-amino-1mq.png", alt: "5-Amino-1MQ 50mg", isPrimary: true },
      ],
    },
    {
      name: "Tesamorelin 10mg",
      slug: "tesamorelin-10mg",
      description: "Tesamorelin is a growth hormone-releasing hormone (GHRH) analog. Each vial contains 10mg of lyophilized research-grade peptide.",
      shortDescription: "10mg GHRH analog peptide",
      basePrice: 75.00,
      sku: "PEP-TES-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-TES-10-DEF", price: 75.00, stock: 25, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/tesamorelin-10mg.png", alt: "Tesamorelin 10mg", isPrimary: true },
      ],
    },
    {
      name: "CJC-1295 5mg / Ipamorelin 5mg Blend",
      slug: "cjc-ipamorelin-blend",
      description: "A research blend combining 5mg CJC-1295 (without DAC) and 5mg Ipamorelin in a single vial. Lyophilized powder for research applications.",
      shortDescription: "CJC-1295 + Ipamorelin blend for research",
      basePrice: 85.00,
      sku: "PEP-CJCIP-10",
      isFeatured: true,
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-CJCIP-10-DEF", price: 85.00, stock: 20, options: [{ name: "Size", value: "10mg" }] },
      ],
      images: [
        { url: "/uploads/products/cjc-ipamorelin-blend.png", alt: "CJC-1295 / Ipamorelin Blend", isPrimary: true },
      ],
    },
    {
      name: "HCG 5000IU",
      slug: "hcg-5000",
      description: "Human Chorionic Gonadotropin (HCG) at 5000 international units per vial. Lyophilized powder for research applications.",
      shortDescription: "5000IU lyophilized HCG",
      basePrice: 45.00,
      sku: "PEP-HCG-5K",
      categoryId: peptides.id,
      variants: [
        { name: "Default", sku: "PEP-HCG-5K-DEF", price: 45.00, stock: 45, options: [{ name: "Size", value: "5000IU" }] },
      ],
      images: [
        { url: "/uploads/products/hcg-5000.png", alt: "HCG 5000IU", isPrimary: true },
      ],
    },
  ]

  for (const product of products) {
    const { variants, images, categoryId, ...productData } = product

    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } })
    if (existing) {
      console.log(`  Skipping ${productData.name} (already exists)`)
      continue
    }

    const created = await prisma.product.create({
      data: {
        ...productData,
        basePrice: productData.basePrice,
        compareAtPrice: productData.compareAtPrice ?? null,
        categories: {
          create: { categoryId },
        },
        variants: {
          create: variants.map((v, i) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            options: v.options,
            sortOrder: i,
          })),
        },
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary ?? false,
            sortOrder: i,
          })),
        },
      },
    })

    console.log(`  Created product: ${created.name}`)
  }

  console.log("Seeded products")

  console.log("\nLogin credentials:")
  console.log("  Admin: blckoutbrbell@gmail.com / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
