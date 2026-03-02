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
  createPageComponent,
  updatePageComponentSettings,
  togglePageComponent,
  deletePageComponent,
  reorderPageComponents,
} from "@/actions/page-components"
import { componentRegistry, getComponentLabel, getComponentDef } from "@/lib/component-registry"
import { ComponentSettingsForm, type ProductOption } from "./component-settings-form"

interface PageComponentItem {
  id: string
  type: string
  settings: string
  sortOrder: number
  isActive: boolean
}

interface ComponentEditorProps {
  pageId: string | null
  components: PageComponentItem[]
  productOptions?: ProductOption[]
  themeColors?: Record<string, string>
}

// --- Sortable Component Card ---

interface SortableComponentCardProps {
  component: PageComponentItem
  isPending: boolean
  editingId: string | null
  editSettings: Record<string, any>
  onStartEdit: (c: PageComponentItem) => void
  onCancelEdit: () => void
  onSave: (id: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSettingChange: (key: string, value: any) => void
  productOptions?: ProductOption[]
  themeColors?: Record<string, string>
}

function SortableComponentCard({
  component,
  isPending,
  editingId,
  editSettings,
  onStartEdit,
  onCancelEdit,
  onSave,
  onToggle,
  onDelete,
  onSettingChange,
  productOptions,
  themeColors,
}: SortableComponentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isEditing = editingId === component.id
  const settings = isEditing ? editSettings : JSON.parse(component.settings)
  const def = getComponentDef(component.type)

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 last:border-b-0"
      {...attributes}
    >
      <div className="flex items-center gap-3 px-4 py-3">
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

        {/* Type badge */}
        <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {getComponentLabel(component.type)}
        </span>

        {/* Heading from settings */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {settings.heading || "Untitled"}
        </span>

        {/* Active toggle */}
        <button
          type="button"
          onClick={() => onToggle(component.id)}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            component.isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              component.isActive ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </button>

        {/* Edit */}
        <button
          type="button"
          onClick={() => (isEditing ? onCancelEdit() : onStartEdit(component))}
          className="text-sm text-gray-500 hover:text-black"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(component.id)}
          disabled={isPending}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {/* Expanded settings form */}
      {isEditing && def && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          <ComponentSettingsForm
            fields={def.fields}
            settings={editSettings}
            onChange={onSettingChange}
            productOptions={productOptions}
            themeColors={themeColors}
          />
          <div className="mt-4">
            <Button size="sm" onClick={() => onSave(component.id)} disabled={isPending}>
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

// --- Main Editor ---

export function ComponentEditor({ pageId, components: initialComponents, productOptions, themeColors }: ComponentEditorProps) {
  const [components, setComponents] = useState(initialComponents)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSettings, setEditSettings] = useState<Record<string, any>>({})
  const [addType, setAddType] = useState("")

  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const componentTypes = Object.entries(componentRegistry).map(([key, def]) => ({
    value: key,
    label: def.label,
  }))

  function handleStartEdit(c: PageComponentItem) {
    const def = getComponentDef(c.type)
    const stored = JSON.parse(c.settings)
    setEditingId(c.id)
    setEditSettings({ ...(def?.defaultSettings ?? {}), ...stored })
  }

  function handleSettingChange(key: string, value: any) {
    setEditSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(id: string) {
    startTransition(async () => {
      const result = await updatePageComponentSettings(id, editSettings)
      if (result.error) {
        toast(result.error, "error")
      } else {
        setComponents((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, settings: JSON.stringify(editSettings) } : c
          )
        )
        setEditingId(null)
        toast("Component updated")
        router.refresh()
      }
    })
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await togglePageComponent(id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this component?")) return
    startTransition(async () => {
      const result = await deletePageComponent(id)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Component deleted")
        router.refresh()
      }
    })
  }

  function handleAdd() {
    if (!addType) return
    startTransition(async () => {
      const result = await createPageComponent(pageId, addType)
      if (result.error) {
        toast(result.error, "error")
      } else {
        setAddType("")
        toast("Component added")
        router.refresh()
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = components.findIndex((c) => c.id === active.id)
    const newIndex = components.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const updated = [...components]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)

    setComponents(updated)

    const orderData = updated.map((c, i) => ({ id: c.id, sortOrder: i }))
    startTransition(async () => {
      const result = await reorderPageComponents(orderData)
      if (result.error) {
        toast(result.error, "error")
        router.refresh()
      }
    })
  }

  return (
    <div>
      {components.length === 0 ? (
        <p className="text-sm text-gray-500">No components added yet.</p>
      ) : (
        <DndContext id="component-editor-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="rounded-lg border border-gray-200">
              {components.map((component) => (
                <SortableComponentCard
                  key={component.id}
                  component={component}
                  isPending={isPending}
                  editingId={editingId}
                  editSettings={editSettings}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={handleSave}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onSettingChange={handleSettingChange}
                  productOptions={productOptions}
                  themeColors={themeColors}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Component */}
      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Add Component</label>
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Choose a component...</option>
            {componentTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={isPending || !addType}>
          {isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  )
}
