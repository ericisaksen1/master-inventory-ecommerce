import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { getAvailableStockBulk } from "@/lib/master-inventory"
import type { ProductCardStyle } from "./product-card"
import type { BlogCardStyle } from "./blog-post-card"
import { FeaturedProductsCarousel } from "./featured-products-carousel"
import { FeaturedProductHero } from "./featured-product-hero"
import { HeroBanner } from "./hero-banner"
import { CategoryGrid } from "./category-grid"
import { FeaturedProductsGrid } from "./featured-products-grid"
import { RecentBlogPosts } from "./recent-blog-posts"
import { PaymentMethods } from "./payment-methods"
import { RichTextBlock } from "./rich-text-block"
import { CtaBanner } from "./cta-banner"
import { NewsletterSignup } from "./newsletter-signup"
import { BulkOrderCta } from "./bulk-order-cta"
import { CountdownTimer } from "./countdown-timer"
import { Testimonials } from "./testimonials"
import { TrustBadges } from "./trust-badges"
import { BrandLogos } from "./brand-logos"
import { CollectionLinks } from "./collection-links"
import { ImageTextSplit } from "./image-text-split"
import { VideoEmbed } from "./video-embed"
import { FaqAccordion } from "./faq-accordion"
import { SpacerDivider } from "./spacer-divider"
import { MarqueeBanner } from "./marquee-banner"
import { ProductListing } from "./product-listing"
import { StacksGrid } from "./stacks-grid"
import type { ComponentColorProps } from "@/lib/component-colors"

function extractColors(s: Record<string, any>): ComponentColorProps {
  return {
    bgColor: s.bgColor || undefined,
    headlineColor: s.headlineColor || undefined,
    textColor: s.textColor || undefined,
    buttonColor: s.buttonColor || undefined,
    buttonTextColor: s.buttonTextColor || undefined,
    buttonHoverColor: s.buttonHoverColor || undefined,
    buttonHoverTextColor: s.buttonHoverTextColor || undefined,
    linkColor: s.linkColor || undefined,
    linkHoverColor: s.linkHoverColor || undefined,
  }
}

interface PageComponentsProps {
  pageId: string | null
  searchParams?: { sort?: string; minPrice?: string; maxPrice?: string; category?: string }
}

export async function PageComponents({ pageId, searchParams }: PageComponentsProps) {
  const [components, settings] = await Promise.all([
    prisma.pageComponent.findMany({
      where: { pageId, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSettings([
      "product_card_style",
      "blog_card_style",
      "blog_show_author",
      "blog_show_date",
      "blog_show_excerpt",
    ]),
  ])

  if (components.length === 0) return null

  const cardStyle = (settings.product_card_style || "standard") as ProductCardStyle
  const blogCardStyle = (settings.blog_card_style || "standard") as BlogCardStyle
  const blogShowAuthor = settings.blog_show_author !== "false"
  const blogShowDate = settings.blog_show_date !== "false"
  const blogShowExcerpt = settings.blog_show_excerpt !== "false"

  const rendered = await Promise.all(
    components.map(async (component) => {
      const settings = JSON.parse(component.settings)

      switch (component.type) {
        case "hero_banner": {
          return (
            <HeroBanner
              key={component.id}
              heading={settings.heading || "Welcome to the Store"}
              subtext={settings.subtext || ""}
              primaryButtonText={settings.primaryButtonText || "Shop Now"}
              primaryButtonUrl={settings.primaryButtonUrl || "/products"}
              secondaryButtonText={settings.secondaryButtonText || ""}
              secondaryButtonUrl={settings.secondaryButtonUrl || "/"}
              showSecondaryButton={settings.showSecondaryButton ?? true}
              layout={settings.layout || "centered"}
              textAlign={settings.textAlign || "center"}
              imageUrl={settings.imageUrl || ""}
              imageAlt={settings.imageAlt || ""}
              backgroundImageUrl={settings.backgroundImageUrl || ""}
              overlayOpacity={settings.overlayOpacity || "50"}
              minHeight={settings.minHeight || "default"}
              verticalAlign={settings.verticalAlign || "center"}
              headingFontSize={settings.headingFontSize || "7xl"}
              subtextFontSize={settings.subtextFontSize || "xl"}
              {...extractColors(settings)}
            />
          )
        }

        case "category_grid": {
          const categories = await prisma.category.findMany({
            where: { isActive: true, parentId: null },
            orderBy: { sortOrder: "asc" },
            take: settings.maxCategories || 8,
            select: { id: true, name: true, slug: true, description: true },
          })

          return (
            <CategoryGrid
              key={component.id}
              heading={settings.heading || "Shop by Category"}
              categories={categories}
              {...extractColors(settings)}
            />
          )
        }

        case "featured_products_grid": {
          const where: any = { isActive: true }

          if (settings.source === "featured") {
            where.isFeatured = true
          } else if (settings.source === "on_sale") {
            where.compareAtPrice = { not: null }
          }

          const orderBy =
            settings.source === "newest"
              ? { createdAt: "desc" as const }
              : { createdAt: "desc" as const }

          const products = await prisma.product.findMany({
            where,
            orderBy,
            take: settings.maxProducts || 8,
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: { where: { isActive: true }, select: { id: true, stock: true, price: true } },
            },
          })

          // Master stock overrides
          const gridMasterLinks = await prisma.masterSkuLink.findMany({
            where: { productId: { in: products.map((p) => p.id) }, variantId: null, siteId: null },
            select: { productId: true, masterSkuId: true },
          })
          const gridMasterIds = [...new Set(gridMasterLinks.map((l) => l.masterSkuId))]
          const gridMasterStock = await getAvailableStockBulk(gridMasterIds)
          const gridProductMaster = new Map<string, number>()
          for (const link of gridMasterLinks) {
            if (link.productId) gridProductMaster.set(link.productId, gridMasterStock.get(link.masterSkuId) ?? 0)
          }

          const serializedProducts = products.map((p) => {
            const localStock = p.variants.length === 1 ? p.variants[0].stock : p.stock
            return {
              slug: p.slug,
              name: p.name,
              basePrice: Number(p.basePrice),
              compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
              shortDescription: p.shortDescription,
              images: p.images.map((img) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
              })),
              id: p.id,
              stock: gridProductMaster.has(p.id) ? gridProductMaster.get(p.id)! : localStock,
              defaultVariantId: p.variants.length === 1 ? p.variants[0].id : null,
              hasMultipleVariants: p.variants.length > 1,
              hasVariantPricing: p.variants.length > 1 && new Set(p.variants.map((v) => v.price.toString())).size > 1,
            }
          })

          return (
            <FeaturedProductsGrid
              key={component.id}
              heading={settings.heading || "Featured Products"}
              products={serializedProducts}
              showViewAll={settings.showViewAll ?? true}
              cardStyle={cardStyle}
              {...extractColors(settings)}
            />
          )
        }

        case "featured_products_carousel": {
          const where: any = { isActive: true }

          if (settings.source === "featured") {
            where.isFeatured = true
          } else if (settings.source === "on_sale") {
            where.compareAtPrice = { not: null }
          }

          const orderBy =
            settings.source === "newest"
              ? { createdAt: "desc" as const }
              : { createdAt: "desc" as const }

          const products = await prisma.product.findMany({
            where,
            orderBy,
            take: settings.maxProducts || 8,
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: { where: { isActive: true }, select: { id: true, stock: true, price: true } },
            },
          })

          // Master stock overrides
          const carouselMasterLinks = await prisma.masterSkuLink.findMany({
            where: { productId: { in: products.map((p) => p.id) }, variantId: null, siteId: null },
            select: { productId: true, masterSkuId: true },
          })
          const carouselMasterIds = [...new Set(carouselMasterLinks.map((l) => l.masterSkuId))]
          const carouselMasterStock = await getAvailableStockBulk(carouselMasterIds)
          const carouselProductMaster = new Map<string, number>()
          for (const link of carouselMasterLinks) {
            if (link.productId) carouselProductMaster.set(link.productId, carouselMasterStock.get(link.masterSkuId) ?? 0)
          }

          const serializedProducts = products.map((p) => {
            const localStock = p.variants.length === 1 ? p.variants[0].stock : p.stock
            return {
              slug: p.slug,
              name: p.name,
              basePrice: Number(p.basePrice),
              compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
              shortDescription: p.shortDescription,
              images: p.images.map((img) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
              })),
              id: p.id,
              stock: carouselProductMaster.has(p.id) ? carouselProductMaster.get(p.id)! : localStock,
              defaultVariantId: p.variants.length === 1 ? p.variants[0].id : null,
              hasMultipleVariants: p.variants.length > 1,
              hasVariantPricing: p.variants.length > 1 && new Set(p.variants.map((v) => v.price.toString())).size > 1,
            }
          })

          return (
            <FeaturedProductsCarousel
              key={component.id}
              products={serializedProducts}
              heading={settings.heading || "Featured Products"}
              subtitle={settings.subtitle || ""}
              showViewAll={settings.showViewAll ?? true}
              autoPlay={settings.autoPlay ?? false}
              {...extractColors(settings)}
            />
          )
        }

        case "featured_product_hero": {
          if (!settings.productSlug) return null

          const product = await prisma.product.findFirst({
            where: { slug: settings.productSlug, isActive: true },
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
                select: { id: true, stock: true, price: true },
              },
            },
          })

          if (!product) return null

          return (
            <FeaturedProductHero
              key={component.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                basePrice: Number(product.basePrice),
                compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                shortDescription: product.shortDescription,
                description: product.description,
                images: product.images.map((img) => ({
                  url: img.url,
                  alt: img.alt,
                  isPrimary: img.isPrimary,
                })),
                defaultVariantId: product.variants[0]?.id ?? null,
                hasMultipleVariants: product.variants.length > 1,
                stock: product.variants.length === 1 ? product.variants[0].stock : product.stock,
              }}
              layout={settings.layout || "image_right"}
              ctaText={settings.ctaText || "Add to Cart"}
              showPrice={settings.showPrice ?? true}
              showDescription={settings.showDescription ?? true}
              {...extractColors(settings)}
            />
          )
        }

        case "payment_methods": {
          return (
            <PaymentMethods
              key={component.id}
              heading={settings.heading || "Flexible Payment Options"}
              {...extractColors(settings)}
            />
          )
        }

        case "rich_text_block": {
          return (
            <RichTextBlock
              key={component.id}
              heading={settings.heading || ""}
              content={settings.content || ""}
              maxWidth={settings.maxWidth || "medium"}
              {...extractColors(settings)}
            />
          )
        }

        case "cta_banner": {
          return (
            <CtaBanner
              key={component.id}
              heading={settings.heading || "Special Offer"}
              subtext={settings.subtext || ""}
              buttonText={settings.buttonText || "Shop Now"}
              buttonUrl={settings.buttonUrl || "/products"}
              style={settings.style || "primary"}
              {...extractColors(settings)}
            />
          )
        }

        case "newsletter_signup": {
          return (
            <NewsletterSignup
              key={component.id}
              heading={settings.heading || "Stay in the Loop"}
              description={settings.description || ""}
              buttonText={settings.buttonText || "Subscribe"}
              placeholder={settings.placeholder || "Enter your email"}
              {...extractColors(settings)}
            />
          )
        }

        case "bulk_order_cta": {
          return (
            <BulkOrderCta
              key={component.id}
              heading={settings.heading || "Bulk Ordering"}
              description={settings.description || ""}
              buttonText={settings.buttonText || "REQUEST PRICE LIST"}
              {...extractColors(settings)}
            />
          )
        }

        case "countdown_timer": {
          if (!settings.endDate) return null
          return (
            <CountdownTimer
              key={component.id}
              heading={settings.heading || "Sale Ends In"}
              endDate={settings.endDate}
              buttonText={settings.buttonText || ""}
              buttonUrl={settings.buttonUrl || "/products"}
              expiredMessage={settings.expiredMessage || "This sale has ended."}
              {...extractColors(settings)}
            />
          )
        }

        case "testimonials": {
          return (
            <Testimonials
              key={component.id}
              heading={settings.heading || "What Our Customers Say"}
              items={settings.items || []}
              {...extractColors(settings)}
            />
          )
        }

        case "trust_badges": {
          return (
            <TrustBadges
              key={component.id}
              heading={settings.heading || ""}
              items={settings.items || []}
              {...extractColors(settings)}
            />
          )
        }

        case "brand_logos": {
          return (
            <BrandLogos
              key={component.id}
              heading={settings.heading || ""}
              items={settings.items || []}
              {...extractColors(settings)}
            />
          )
        }

        case "collection_links": {
          return (
            <CollectionLinks
              key={component.id}
              heading={settings.heading || ""}
              items={settings.items || []}
              {...extractColors(settings)}
            />
          )
        }

        case "image_text_split": {
          return (
            <ImageTextSplit
              key={component.id}
              heading={settings.heading || ""}
              content={settings.content || ""}
              imageUrl={settings.imageUrl || ""}
              imageAlt={settings.imageAlt || ""}
              layout={settings.layout || "image_left"}
              buttonText={settings.buttonText || ""}
              buttonUrl={settings.buttonUrl || "/"}
              showButton={settings.showButton ?? false}
              {...extractColors(settings)}
            />
          )
        }

        case "video_embed": {
          if (!settings.videoUrl) return null
          return (
            <VideoEmbed
              key={component.id}
              heading={settings.heading || ""}
              description={settings.description || ""}
              videoUrl={settings.videoUrl}
              {...extractColors(settings)}
            />
          )
        }

        case "faq_accordion": {
          return (
            <FaqAccordion
              key={component.id}
              heading={settings.heading || "Frequently Asked Questions"}
              items={settings.items || []}
              {...extractColors(settings)}
            />
          )
        }

        case "recent_blog_posts": {
          const posts = await prisma.blogPost.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: "desc" },
            take: settings.maxPosts || 3,
            select: {
              slug: true,
              title: true,
              excerpt: true,
              featuredImage: true,
              publishedAt: true,
              author: { select: { name: true } },
              categories: {
                select: { category: { select: { name: true, slug: true } } },
              },
            },
          })

          const serializedPosts = posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            featuredImage: p.featuredImage,
            publishedAt: p.publishedAt?.toISOString() ?? null,
            authorName: p.author?.name ?? null,
            categories: p.categories.map((c) => ({
              name: c.category.name,
              slug: c.category.slug,
            })),
          }))

          return (
            <RecentBlogPosts
              key={component.id}
              heading={settings.heading || "From the Blog"}
              posts={serializedPosts}
              showViewAll={settings.showViewAll ?? true}
              cardStyle={blogCardStyle}
              showAuthor={blogShowAuthor}
              showDate={blogShowDate}
              showExcerpt={blogShowExcerpt}
              {...extractColors(settings)}
            />
          )
        }

        case "marquee_banner": {
          let items: string[] | undefined
          if (settings.mode === "products") {
            const where: any = { isActive: true }
            if (settings.source === "featured") where.isFeatured = true
            else if (settings.source === "on_sale") where.compareAtPrice = { not: null }

            const products = await prisma.product.findMany({
              where,
              orderBy: { createdAt: "desc" },
              take: settings.maxProducts || 10,
              select: { name: true },
            })
            items = products.map((p) => p.name)
          }

          return (
            <MarqueeBanner
              key={component.id}
              content={settings.mode === "text" ? settings.content : undefined}
              items={items}
              speed={settings.speed || "medium"}
              direction={settings.direction || "left"}
              bgColor={settings.bgColor || "#000000"}
              textColor={settings.textColor || "#ffffff"}
              separator={settings.separator || "·"}
              pauseOnHover={settings.pauseOnHover ?? true}
              fontSize={settings.fontSize || "sm"}
              fontFamily={settings.fontFamily || ""}
            />
          )
        }

        case "product_listing": {
          const colors = extractColors(settings)
          return (
            <div
              key={component.id}
              className="container-subpages px-4 py-12 sm:px-6 lg:px-8"
              style={{
                backgroundColor: colors.bgColor || undefined,
              }}
            >
              <ProductListing
                searchParams={searchParams}
                heading={settings.heading || "All Products"}
                showFilters={settings.showFilters ?? true}
                showSort={settings.showSort ?? true}
                showCategoryNav={settings.showCategoryNav ?? true}
                headlineColor={colors.headlineColor}
              />
            </div>
          )
        }

        case "stacks_grid": {
          const stacks = await prisma.stack.findMany({
            where: { isActive: true },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      basePrice: true,
                      stock: true,
                      isActive: true,
                      images: { where: { isPrimary: true }, take: 1 },
                    },
                  },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
            take: settings.maxStacks || 8,
          })

          // Check master inventory for all products in stacks
          const allProductIds: string[] = []
          for (const stack of stacks) {
            for (const item of stack.items) {
              allProductIds.push(item.product.id)
            }
          }

          const { getAvailableStockBulk } = await import("@/lib/master-inventory")
          const masterLinks = await prisma.masterSkuLink.findMany({
            where: { productId: { in: allProductIds }, variantId: null, siteId: null },
            select: { productId: true, masterSkuId: true, quantityMultiplier: true },
          })
          const masterLinkMap = new Map(masterLinks.map((l) => [l.productId!, l]))

          let availableMap = new Map<string, number>()
          if (masterLinks.length > 0) {
            const masterSkuIds = [...new Set(masterLinks.map((l) => l.masterSkuId))]
            availableMap = await getAvailableStockBulk(masterSkuIds)
          }

          const stackData = stacks.map((stack) => ({
            id: stack.id,
            name: stack.name,
            slug: stack.slug,
            description: stack.description,
            image: stack.image,
            items: stack.items.map((si) => ({
              name: si.product.name,
              basePrice: Number(si.product.basePrice),
              imageUrl: si.product.images[0]?.url || null,
              stock: si.product.stock,
              isActive: si.product.isActive,
              quantity: si.quantity,
            })),
            inStock: stack.items.every((si) => {
              if (!si.product.isActive) return false
              const link = masterLinkMap.get(si.product.id)
              if (link) {
                const available = availableMap.get(link.masterSkuId) ?? 0
                return Math.floor(available / link.quantityMultiplier) >= si.quantity
              }
              return si.product.stock >= si.quantity
            }),
          }))

          return (
            <StacksGrid
              key={component.id}
              heading={settings.heading || "Our Stacks"}
              stacks={stackData}
              showViewAll={settings.showViewAll ?? true}
              {...extractColors(settings)}
            />
          )
        }

        case "spacer_divider": {
          return (
            <SpacerDivider
              key={component.id}
              height={settings.height || "medium"}
              showLine={settings.showLine ?? false}
            />
          )
        }

        default:
          return null
      }
    })
  )

  return <>{rendered}</>
}
