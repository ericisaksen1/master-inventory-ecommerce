"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  saveMenuOrder,
} from "@/actions/menus"
import type { FlatMenuItem } from "./page"

interface LinkOption {
  label: string
  url: string
  group: string
}

interface MenuBuilderProps {
  location: string
  label: string
  items: FlatMenuItem[]
  linkOptions: LinkOption[]
}

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"

const selectClass =
  "w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"

function computeParentIds(items: FlatMenuItem[]): { id: string; sortOrder: number; parentId: string | null }[] {
  return items.map((item, index) => {
    let parentId: string | null = null
    if (item.depth === 1) {
      for (let i = index - 1; i >= 0; i--) {
        if (items[i].depth === 0) {
          parentId = items[i].id
          break
        }
      }
    }
    return { id: item.id, sortOrder: index, parentId }
  })
}

function canIndent(items: FlatMenuItem[], index: number): boolean {
  if (index === 0) return false
  if (items[index].depth >= 1) return false
  // Must have a depth-0 item above (can't indent if above is already depth 1 with no parent before it)
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].depth === 0) return true
  }
  return false
}

function canOutdent(items: FlatMenuItem[], index: number): boolean {
  return items[index].depth > 0
}

// --- Sortable Item Component ---

interface SortableMenuItemProps {
  item: FlatMenuItem
  index: number
  items: FlatMenuItem[]
  isPending: boolean
  editingId: string | null
  editLabel: string
  editUrl: string
  editCssClass: string
  editLinkTarget: string
  editVisibility: string
  editAffiliateVisibility: string
  onStartEdit: (item: FlatMenuItem) => void
  onCancelEdit: () => void
  onUpdate: (id: string) => void
  onDelete: (id: string) => void
  onIndent: (index: number) => void
  onOutdent: (index: number) => void
  onEditLabelChange: (v: string) => void
  onEditUrlChange: (v: string) => void
  onEditCssClassChange: (v: string) => void
  onEditLinkTargetChange: (v: string) => void
  onEditVisibilityChange: (v: string) => void
  onEditAffiliateVisibilityChange: (v: string) => void
}

function SortableMenuItem({
  item,
  index,
  items,
  isPending,
  editingId,
  editLabel,
  editUrl,
  editCssClass,
  editLinkTarget,
  editVisibility,
  editAffiliateVisibility,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onIndent,
  onOutdent,
  onEditLabelChange,
  onEditUrlChange,
  onEditCssClassChange,
  onEditLinkTargetChange,
  onEditVisibilityChange,
  onEditAffiliateVisibilityChange,
}: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${item.depth * 32 + 16}px`,
    opacity: isDragging ? 0.5 : 1,
  }

  const isEditing = editingId === item.id

  return (
    <li ref={setNodeRef} style={style} className="border-b border-gray-200 py-3 pr-4 last:border-b-0" {...attributes}>
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          {...listeners}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        {/* Indent/Outdent buttons */}
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => onOutdent(index)}
            disabled={!canOutdent(items, index) || isPending}
            className="rounded p-0.5 text-gray-400 hover:text-black disabled:opacity-30"
            title="Outdent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onIndent(index)}
            disabled={!canIndent(items, index) || isPending}
            className="rounded p-0.5 text-gray-400 hover:text-black disabled:opacity-30"
            title="Indent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Depth indicator */}
        {item.depth === 1 && (
          <span className="text-gray-300">└</span>
        )}

        {isEditing ? (
          /* Edit mode */
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
                <input
                  value={editLabel}
                  onChange={(e) => onEditLabelChange(e.target.value)}
                  className={inputClass}
                  placeholder="Label"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">URL</label>
                <input
                  value={editUrl}
                  onChange={(e) => onEditUrlChange(e.target.value)}
                  className={inputClass}
                  placeholder="/products"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">CSS Class</label>
                <input
                  value={editCssClass}
                  onChange={(e) => onEditCssClassChange(e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Link Target</label>
                <select
                  value={editLinkTarget}
                  onChange={(e) => onEditLinkTargetChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Same window</option>
                  <option value="_blank">New tab (_blank)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Visibility</label>
                <select
                  value={editVisibility}
                  onChange={(e) => onEditVisibilityChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Everyone</option>
                  <option value="logged_in">Logged in only</option>
                  <option value="logged_out">Logged out only</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Affiliate Visibility</label>
                <select
                  value={editAffiliateVisibility}
                  onChange={(e) => onEditAffiliateVisibilityChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Everyone</option>
                  <option value="affiliate_only">Affiliates only</option>
                  <option value="non_affiliate_only">Non-affiliates only</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onUpdate(item.id)}
                disabled={isPending}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Display mode */
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="truncate text-xs text-gray-400">{item.url}</span>
                {item.linkTarget === "_blank" && (
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                    new tab
                  </span>
                )}
                {item.cssClass && (
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
                    .{item.cssClass}
                  </span>
                )}
                {item.visibility !== "all" && (
                  <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                    {item.visibility === "logged_in" ? "logged in" : "logged out"}
                  </span>
                )}
                {item.affiliateVisibility !== "all" && (
                  <span className="shrink-0 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-700">
                    {item.affiliateVisibility === "affiliate_only" ? "affiliates" : "non-affiliates"}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartEdit(item)}
              className="text-sm text-gray-500 hover:text-black"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              disabled={isPending}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  )
}

// --- Main MenuBuilder ---

export function MenuBuilder({ location, label, items: initialItems, linkOptions }: MenuBuilderProps) {
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [editCssClass, setEditCssClass] = useState("")
  const [editLinkTarget, setEditLinkTarget] = useState("")
  const [editVisibility, setEditVisibility] = useState("all")
  const [editAffiliateVisibility, setEditAffiliateVisibility] = useState("all")

  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCssClass, setNewCssClass] = useState("")
  const [newLinkTarget, setNewLinkTarget] = useState("")
  const [newVisibility, setNewVisibility] = useState("all")
  const [newAffiliateVisibility, setNewAffiliateVisibility] = useState("all")

  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Group link options for the select
  const groupedOptions = linkOptions.reduce<Record<string, LinkOption[]>>((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = []
    acc[opt.group].push(opt)
    return acc
  }, {})

  function handleLinkSelect(value: string) {
    if (!value) return
    const option = linkOptions.find((o) => o.url === value)
    if (option) {
      setNewUrl(option.url)
      if (!newLabel) setNewLabel(option.label)
    } else {
      setNewUrl(value)
      const builtInPages: Record<string, string> = {
        "/products": "All Products",
        "/categories": "All Categories",
        "/cart": "Cart",
        "/checkout": "Checkout",
        "/orders": "Order History",
        "/search": "Search",
        "/login": "Login",
        "/register": "Register",
        "/contact": "Contact",
        "/blog": "Blog",
        "/affiliate/apply": "Become an Affiliate",
        "/affiliate": "Affiliate Dashboard",
      }
      if (!newLabel && builtInPages[value]) setNewLabel(builtInPages[value])
    }
  }

  function handleAdd() {
    if (!newLabel.trim() || !newUrl.trim()) return
    const formData = new FormData()
    formData.set("label", newLabel.trim())
    formData.set("url", newUrl.trim())
    formData.set("location", location)
    formData.set("cssClass", newCssClass.trim())
    formData.set("linkTarget", newLinkTarget)
    formData.set("visibility", newVisibility)
    formData.set("affiliateVisibility", newAffiliateVisibility)

    startTransition(async () => {
      const result = await createMenuItem(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        setNewLabel("")
        setNewUrl("")
        setNewCssClass("")
        setNewLinkTarget("")
        setNewVisibility("all")
        setNewAffiliateVisibility("all")
        router.refresh()
      }
    })
  }

  function startEdit(item: FlatMenuItem) {
    setEditingId(item.id)
    setEditLabel(item.label)
    setEditUrl(item.url)
    setEditCssClass(item.cssClass || "")
    setEditLinkTarget(item.linkTarget || "")
    setEditVisibility(item.visibility || "all")
    setEditAffiliateVisibility(item.affiliateVisibility || "all")
  }

  function handleUpdate(id: string) {
    const formData = new FormData()
    formData.set("label", editLabel.trim())
    formData.set("url", editUrl.trim())
    formData.set("cssClass", editCssClass.trim())
    formData.set("linkTarget", editLinkTarget)
    formData.set("visibility", editVisibility)
    formData.set("affiliateVisibility", editAffiliateVisibility)

    startTransition(async () => {
      const result = await updateMenuItem(id, formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        setEditingId(null)
        router.refresh()
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return
    startTransition(async () => {
      const result = await deleteMenuItem(id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        // Remove item and promote any orphaned children
        const idx = items.findIndex((i) => i.id === id)
        const updated = [...items]
        updated.splice(idx, 1)
        // If deleted item was depth 0, promote its children
        for (let i = idx; i < updated.length; i++) {
          if (updated[i].depth === 0) break
          updated[i] = { ...updated[i], depth: 0 }
        }
        setItems(updated)
        router.refresh()
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const updated = [...items]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)

    // Validate: if a depth-1 item ends up at position 0 or after another depth-1 with no parent, promote it
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].depth === 1) {
        let hasParent = false
        for (let j = i - 1; j >= 0; j--) {
          if (updated[j].depth === 0) {
            hasParent = true
            break
          }
        }
        if (!hasParent) {
          updated[i] = { ...updated[i], depth: 0 }
        }
      }
    }

    setItems(updated)
    persistOrder(updated)
  }

  function handleIndent(index: number) {
    if (!canIndent(items, index)) return
    const updated = [...items]
    updated[index] = { ...updated[index], depth: 1 }
    setItems(updated)
    persistOrder(updated)
  }

  function handleOutdent(index: number) {
    if (!canOutdent(items, index)) return
    const updated = [...items]
    updated[index] = { ...updated[index], depth: 0 }

    // Any children that were under this item (consecutive depth-1 items after it)
    // need to stay at depth 1 if there's still a depth-0 parent above them,
    // otherwise promote them too
    for (let i = index + 1; i < updated.length; i++) {
      if (updated[i].depth === 0) break
      let hasParent = false
      for (let j = i - 1; j >= 0; j--) {
        if (updated[j].depth === 0) {
          hasParent = true
          break
        }
      }
      if (!hasParent) {
        updated[i] = { ...updated[i], depth: 0 }
      }
    }

    setItems(updated)
    persistOrder(updated)
  }

  function persistOrder(updatedItems: FlatMenuItem[]) {
    const orderData = computeParentIds(updatedItems)
    startTransition(async () => {
      const result = await saveMenuOrder(orderData)
      if (result.error) {
        toast(result.error, "error")
        router.refresh()
      }
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">{label}</h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No menu items yet.</p>
      ) : (
        <DndContext id="menu-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-3 rounded-lg border border-gray-200">
              {items.map((item, index) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  index={index}
                  items={items}
                  isPending={isPending}
                  editingId={editingId}
                  editLabel={editLabel}
                  editUrl={editUrl}
                  editCssClass={editCssClass}
                  editLinkTarget={editLinkTarget}
                  editVisibility={editVisibility}
                  editAffiliateVisibility={editAffiliateVisibility}
                  onStartEdit={startEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onIndent={handleIndent}
                  onOutdent={handleOutdent}
                  onEditLabelChange={setEditLabel}
                  onEditUrlChange={setEditUrl}
                  onEditCssClassChange={setEditCssClass}
                  onEditLinkTargetChange={setEditLinkTarget}
                  onEditVisibilityChange={setEditVisibility}
                  onEditAffiliateVisibilityChange={setEditAffiliateVisibility}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Add new item */}
      <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Add Menu Item</p>

        {/* Link picker */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">Quick Select</label>
          <select
            value=""
            onChange={(e) => handleLinkSelect(e.target.value)}
            className={selectClass}
          >
            <option value="">Choose a page...</option>
            <optgroup label="Shop Pages">
              <option value="/products">All Products</option>
              <option value="/categories">All Categories</option>
              <option value="/cart">Cart</option>
              <option value="/checkout">Checkout</option>
              <option value="/orders">Order History</option>
              <option value="/search">Search</option>
              <option value="/contact">Contact</option>
              <option value="/blog">Blog</option>
              <option value="/login">Login</option>
              <option value="/register">Register</option>
              <option value="/affiliate/apply">Become an Affiliate</option>
              <option value="/affiliate">Affiliate Dashboard</option>
            </optgroup>
            {Object.entries(groupedOptions).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Shop"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">URL</label>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="e.g. /products or https://..."
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
            />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">CSS Class</label>
            <input
              value={newCssClass}
              onChange={(e) => setNewCssClass(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Link Target</label>
            <select
              value={newLinkTarget}
              onChange={(e) => setNewLinkTarget(e.target.value)}
              className={selectClass}
            >
              <option value="">Same window</option>
              <option value="_blank">New tab (_blank)</option>
            </select>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Visibility</label>
            <select
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
              className={selectClass}
            >
              <option value="all">Everyone</option>
              <option value="logged_in">Logged in only</option>
              <option value="logged_out">Logged out only</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Affiliate Visibility</label>
            <select
              value={newAffiliateVisibility}
              onChange={(e) => setNewAffiliateVisibility(e.target.value)}
              className={selectClass}
            >
              <option value="all">Everyone</option>
              <option value="affiliate_only">Affiliates only</option>
              <option value="non_affiliate_only">Non-affiliates only</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <Button size="sm" onClick={handleAdd} disabled={isPending || !newLabel.trim() || !newUrl.trim()}>
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </div>
      </div>
    </div>
  )
}
