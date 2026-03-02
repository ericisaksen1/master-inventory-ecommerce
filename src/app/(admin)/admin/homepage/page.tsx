import { prisma } from "@/lib/prisma"
import { getPageComponents } from "@/actions/page-components"
import { getSettings } from "@/lib/settings"
import { ComponentEditor } from "./component-editor"

const THEME_COLOR_KEYS = [
  "primary_color",
  "secondary_color",
  "accent_color",
  "background_color",
  "foreground_color",
  "muted_color",
  "border_color",
  "button_bg_color",
  "button_text_color",
]

export const metadata = { title: "Homepage | Admin" }

export default async function HomepageAdmin() {
  const [components, products, themeColors] = await Promise.all([
    getPageComponents(null),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    getSettings(THEME_COLOR_KEYS),
  ])

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Homepage</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage components displayed on the homepage.
      </p>
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Components</h2>
        <div className="mt-3">
          <ComponentEditor pageId={null} components={components} productOptions={products} themeColors={themeColors} />
        </div>
      </div>
    </div>
  )
}
