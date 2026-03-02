import { getMenuItems, getLinkOptions } from "@/actions/menus"
import { MenuBuilder } from "./menu-builder"

export const metadata = { title: "Menus | Admin" }

interface TreeItem {
  id: string
  label: string
  url: string
  cssClass: string | null
  linkTarget: string | null
  visibility: string
  affiliateVisibility: string
  sortOrder: number
  children: TreeItem[]
}

export interface FlatMenuItem {
  id: string
  label: string
  url: string
  cssClass: string | null
  linkTarget: string | null
  visibility: string
  affiliateVisibility: string
  sortOrder: number
  depth: number
}

function flattenMenuItems(tree: TreeItem[]): FlatMenuItem[] {
  const flat: FlatMenuItem[] = []
  for (const item of tree) {
    flat.push({
      id: item.id,
      label: item.label,
      url: item.url,
      cssClass: item.cssClass,
      linkTarget: item.linkTarget,
      visibility: item.visibility,
      affiliateVisibility: item.affiliateVisibility,
      sortOrder: item.sortOrder,
      depth: 0,
    })
    for (const child of item.children) {
      flat.push({
        id: child.id,
        label: child.label,
        url: child.url,
        cssClass: child.cssClass,
        linkTarget: child.linkTarget,
        visibility: child.visibility,
        affiliateVisibility: child.affiliateVisibility,
        sortOrder: child.sortOrder,
        depth: 1,
      })
    }
  }
  return flat
}

export default async function MenusPage() {
  const [headerItems, footerItems, linkData] = await Promise.all([
    getMenuItems("header"),
    getMenuItems("footer"),
    getLinkOptions(),
  ])

  const flatHeader = flattenMenuItems(headerItems as unknown as TreeItem[])
  const flatFooter = flattenMenuItems(footerItems as unknown as TreeItem[])

  // Build link options array with groups
  const linkOptions = [
    ...linkData.pages.map((p) => ({
      label: p.title,
      url: `/${p.slug}`,
      group: "Pages",
    })),
    ...linkData.products.map((p) => ({
      label: p.name,
      url: `/products/${p.slug}`,
      group: "Products",
    })),
    ...linkData.categories.map((c) => ({
      label: c.name,
      url: `/categories/${c.slug}`,
      group: "Categories",
    })),
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Menus</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage navigation menus for your header and footer.
      </p>
      <div className="mt-8 space-y-10">
        <MenuBuilder location="header" label="Header Menu" items={flatHeader} linkOptions={linkOptions} />
        <MenuBuilder location="footer" label="Footer Menu" items={flatFooter} linkOptions={linkOptions} />
      </div>
    </div>
  )
}
