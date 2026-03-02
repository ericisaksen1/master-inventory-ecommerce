"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImagePickerModal } from "@/components/admin/image-picker-modal"
import type { FieldDef } from "@/lib/component-registry"

export interface ProductOption {
  slug: string
  name: string
}

interface ComponentSettingsFormProps {
  fields: FieldDef[]
  settings: Record<string, any>
  onChange: (key: string, value: any) => void
  productOptions?: ProductOption[]
  themeColors?: Record<string, string>
}

const selectClass =
  "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"

const textareaClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"

const THEME_COLOR_LABELS: Record<string, string> = {
  primary_color: "Primary",
  secondary_color: "Secondary",
  accent_color: "Accent",
  background_color: "Background",
  foreground_color: "Foreground",
  muted_color: "Muted",
  border_color: "Border",
  button_bg_color: "Button",
  button_text_color: "Button Text",
}

// --- Sub-components ---

function ThemeSwatches({
  themeColors,
  onSelect,
}: {
  themeColors: Record<string, string>
  onSelect: (color: string) => void
}) {
  const entries = Object.entries(themeColors).filter(([, v]) => v && v.trim() !== "")
  if (entries.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400">Theme Colors</p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([key, color]) => (
          <button
            key={key}
            type="button"
            title={THEME_COLOR_LABELS[key] || key}
            onClick={() => onSelect(color)}
            className="h-6 w-6 rounded-full border border-gray-300 transition-transform hover:scale-110 hover:border-gray-500"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}

function ColorFieldInput({
  field,
  value,
  onChange,
  themeColors,
}: {
  field: FieldDef
  value: string
  onChange: (key: string, val: string) => void
  themeColors?: Record<string, string>
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
      </label>
      {themeColors && (
        <ThemeSwatches
          themeColors={themeColors}
          onSelect={(c) => onChange(field.key, c)}
        />
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder="Default"
          className="flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(field.key, "")}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function ImageField({
  label,
  value,
  onSelect,
}: {
  label: string
  value: string
  onSelect: (url: string) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            <Image
              src={value}
              alt=""
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          {value ? "Change Image" : "Choose Image"}
        </Button>
      </div>
      <ImagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
        currentUrl={value}
      />
    </div>
  )
}

function renderSubField(
  sf: FieldDef,
  value: any,
  onChangeValue: (val: any) => void,
  productOptions?: ProductOption[],
) {
  if (sf.type === "image") {
    return (
      <ImageField
        key={sf.key}
        label={sf.label}
        value={value ?? ""}
        onSelect={onChangeValue}
      />
    )
  }

  if (sf.type === "select" && sf.options) {
    return (
      <div key={sf.key} className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {sf.label}
        </label>
        <select
          value={value ?? ""}
          onChange={(e) => onChangeValue(e.target.value)}
          className={selectClass}
        >
          {sf.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <Input
      key={sf.key}
      label={sf.label}
      value={value ?? ""}
      onChange={(e) => onChangeValue(e.target.value)}
    />
  )
}

// --- Main form ---

type SettingsTab = "content" | "colors"

export function ComponentSettingsForm({
  fields,
  settings,
  onChange,
  productOptions,
  themeColors,
}: ComponentSettingsFormProps) {
  const colorFields = fields.filter((f) => f.group === "Colors")
  const contentFields = fields.filter((f) => f.group !== "Colors")
  const hasTabs = colorFields.length > 0

  const [activeTab, setActiveTab] = useState<SettingsTab>("content")

  // Render a single non-color field
  function renderField(field: FieldDef, groupHeader: ReactNode) {
    if (field.type === "text") {
      return (
        <div key={field.key}>
          {groupHeader}
          <Input
            label={field.label}
            value={settings[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      )
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key}>
          {groupHeader}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <textarea
              rows={4}
              value={settings[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={textareaClass}
            />
          </div>
        </div>
      )
    }

    if (field.type === "number") {
      return (
        <div key={field.key}>
          {groupHeader}
          <Input
            label={field.label}
            type="number"
            value={settings[field.key] ?? ""}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
          />
        </div>
      )
    }

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key}>
          {groupHeader}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              value={settings[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={selectClass}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    }

    if (field.type === "product" && productOptions) {
      return (
        <div key={field.key}>
          {groupHeader}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              value={settings[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={selectClass}
            >
              <option value="">Select a product...</option>
              {productOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    }

    if (field.type === "toggle") {
      const isOn = !!settings[field.key]
      return (
        <div key={field.key}>
          {groupHeader}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(field.key, !isOn)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isOn ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isOn ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {field.label}
            </span>
          </div>
        </div>
      )
    }

    if (field.type === "image") {
      return (
        <div key={field.key}>
          {groupHeader}
          <ImageField
            label={field.label}
            value={settings[field.key] ?? ""}
            onSelect={(url) => onChange(field.key, url)}
          />
        </div>
      )
    }

    if (field.type === "color") {
      return (
        <div key={field.key}>
          {groupHeader}
          <ColorFieldInput
            field={field}
            value={settings[field.key] ?? ""}
            onChange={onChange}
            themeColors={themeColors}
          />
        </div>
      )
    }

    if (field.type === "repeater" && field.subFields) {
      const items: Record<string, any>[] = settings[field.key] ?? []

      function handleItemChange(index: number, subKey: string, value: any) {
        const updated = items.map((item, i) =>
          i === index ? { ...item, [subKey]: value } : item
        )
        onChange(field.key, updated)
      }

      function handleAddItem() {
        const newItem: Record<string, any> = {}
        field.subFields!.forEach((sf) => {
          newItem[sf.key] = ""
        })
        onChange(field.key, [...items, newItem])
      }

      function handleRemoveItem(index: number) {
        onChange(field.key, items.filter((_, i) => i !== index))
      }

      return (
        <div key={field.key}>
          {groupHeader}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  {field.subFields!.map((sf) =>
                    renderSubField(
                      sf,
                      item[sf.key],
                      (val) => handleItemChange(index, sf.key, val),
                      productOptions,
                    )
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddItem}
            >
              + Add {field.label.replace(/s$/, "")}
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  // Build content tab elements with group headers and Layout grid
  function renderContentFields() {
    const elements: ReactNode[] = []
    let lastGroup: string | undefined
    let layoutBatch: FieldDef[] = []

    function flushLayoutBatch() {
      if (layoutBatch.length === 0) return
      elements.push(
        <div key="layout-group">
          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Layout
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {layoutBatch.map((f) => renderField(f, null))}
          </div>
        </div>
      )
      layoutBatch = []
    }

    for (const field of contentFields) {
      if (field.group === "Layout") {
        layoutBatch.push(field)
        lastGroup = "Layout"
        continue
      }

      flushLayoutBatch()

      let groupHeader: ReactNode = null
      if (field.group && field.group !== lastGroup) {
        groupHeader = (
          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {field.group}
            </p>
          </div>
        )
      }
      if (field.group) lastGroup = field.group
      else lastGroup = undefined

      elements.push(renderField(field, groupHeader))
    }

    flushLayoutBatch()
    return elements
  }

  // --- No tabs: render flat ---
  if (!hasTabs) {
    return (
      <div className="space-y-4">
        {renderContentFields()}
      </div>
    )
  }

  // --- With tabs ---
  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "content"
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "colors"
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Colors
        </button>
      </div>

      {/* Content tab */}
      <div style={{ display: activeTab === "content" ? undefined : "none" }}>
        <div className="space-y-4">
          {renderContentFields()}
        </div>
      </div>

      {/* Colors tab */}
      <div style={{ display: activeTab === "colors" ? undefined : "none" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          {colorFields.map((field) => (
            <ColorFieldInput
              key={field.key}
              field={field}
              value={settings[field.key] ?? ""}
              onChange={onChange}
              themeColors={themeColors}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
