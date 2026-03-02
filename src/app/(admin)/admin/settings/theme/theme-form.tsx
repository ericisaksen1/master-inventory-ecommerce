"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { updateSettings } from "@/actions/settings"
import { fontOptions, themePresets, radiusOptions, shadowOptions } from "@/lib/theme-presets"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

interface ThemeFormProps {
  settings: Record<string, string>
}

type ThemeTab = "style" | "layout" | "components"

const themeTabs: { key: ThemeTab; label: string }[] = [
  { key: "style", label: "Style & Branding" },
  { key: "layout", label: "Layout" },
  { key: "components", label: "Components & Features" },
]

export function ThemeForm({ settings }: ThemeFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<ThemeTab>("style")

  const [formValues, setFormValues] = useState<Record<string, string>>({
    theme_mode: settings.theme_mode || "light",
    primary_color: settings.primary_color || "#000000",
    secondary_color: settings.secondary_color || "#4b5563",
    accent_color: settings.accent_color || settings.tertiary_color || "#2563eb",
    background_color: settings.background_color || "#ffffff",
    foreground_color: settings.foreground_color || "#171717",
    muted_color: settings.muted_color || "#f3f4f6",
    border_color: settings.border_color || "#e5e7eb",
    dark_background_color: settings.dark_background_color || "#0a0a0a",
    dark_foreground_color: settings.dark_foreground_color || "#f5f5f5",
    dark_muted_color: settings.dark_muted_color || "#1f2937",
    dark_border_color: settings.dark_border_color || "#374151",
    font_heading: settings.font_heading || "Inter",
    font_body: settings.font_body || "Inter",
    border_radius: settings.border_radius || "medium",
    shadow_depth: settings.shadow_depth || "subtle",
    button_bg_color: settings.button_bg_color || settings.primary_color || "#000000",
    button_text_color: settings.button_text_color || "#ffffff",
    button_style: settings.button_style || "filled",
    product_button_bg_color: settings.product_button_bg_color || "",
    product_button_text_color: settings.product_button_text_color || "",
    product_button_style: settings.product_button_style || "",
    site_logo_url: settings.site_logo_url || "",
    favicon_url: settings.favicon_url || "",
    logo_height: settings.logo_height || "",
    header_layout: settings.header_layout || "classic",
    footer_layout: settings.footer_layout || "standard",
    footer_show_legal: settings.footer_show_legal || "false",
    products_layout: settings.products_layout || "standard",
    product_card_style: settings.product_card_style || "standard",
    product_card_bg_color: settings.product_card_bg_color || "#f3f4f6",
    product_card_shadow: settings.product_card_shadow || "subtle",
    blog_layout: settings.blog_layout || "standard",
    contact_page_style: settings.contact_page_style || "standard",
    blog_card_style: settings.blog_card_style || "standard",
    blog_show_author: settings.blog_show_author || "true",
    blog_show_date: settings.blog_show_date || "true",
    blog_show_excerpt: settings.blog_show_excerpt || "true",
    enable_wishlist: settings.enable_wishlist || "true",
    enable_reviews: settings.enable_reviews || "true",
    header_full_width: settings.header_full_width || "false",
    container_width_header: settings.container_width_header || "",
    container_width_homepage: settings.container_width_homepage || "",
    container_width_subpages: settings.container_width_subpages || "",
    header_bg_color: settings.header_bg_color || "",
    header_nav_color: settings.header_nav_color || "",
    header_nav_hover_color: settings.header_nav_hover_color || "",
    header_icon_color: settings.header_icon_color || "",
    header_icon_hover_color: settings.header_icon_hover_color || "",
    header_user_bg_color: settings.header_user_bg_color || "",
    header_user_text_color: settings.header_user_text_color || "",
    header_cart_badge_bg_color: settings.header_cart_badge_bg_color || "",
    header_cart_badge_text_color: settings.header_cart_badge_text_color || "",
    footer_bg_color: settings.footer_bg_color || "",
    footer_heading_color: settings.footer_heading_color || "",
    footer_link_color: settings.footer_link_color || "",
    footer_link_hover_color: settings.footer_link_hover_color || "",
    alert_bar_enabled: settings.alert_bar_enabled || "false",
    alert_bar_content: settings.alert_bar_content || "",
    alert_bar_bg_color: settings.alert_bar_bg_color || "#000000",
    alert_bar_text_color: settings.alert_bar_text_color || "#ffffff",
  })

  function setValue(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(preset: (typeof themePresets)[number]) {
    setFormValues((prev) => ({ ...prev, ...preset.settings }))
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Theme settings saved!")
      }
    })
  }

  const isDark = formValues.theme_mode === "dark"

  const sansSerif = fontOptions.filter((f) => f.category === "sans-serif")
  const serif = fontOptions.filter((f) => f.category === "serif")
  const mono = fontOptions.filter((f) => f.category === "monospace")

  return (
    <form action={handleSubmit} className="mt-6">
      {/* Hidden inputs for all form values — always in DOM regardless of tab */}
      {Object.entries(formValues).map(([key, value]) => (
        <input key={key} type="hidden" name={`setting_${key}`} value={value} />
      ))}

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {themeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Style & Branding tab ── */}
      <div style={{ display: activeTab === "style" ? undefined : "none" }} className="space-y-10 pt-6">

      {/* ── Presets ── */}
      <section>
        <h2 className="text-lg font-semibold">Presets</h2>
        <p className="mt-1 text-sm text-gray-500">
          Start with a preset, then customize individual settings below.
        </p>
        <p className="mt-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Light</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {themePresets.filter((p) => p.settings.theme_mode === "light").map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-400 hover:shadow-sm"
            >
              <div className="flex gap-1">
                {[
                  preset.settings.primary_color,
                  preset.settings.accent_color,
                  preset.settings.background_color,
                  preset.settings.muted_color,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium">{preset.name}</p>
              <p className="text-xs text-gray-500">{preset.description}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Dark</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {themePresets.filter((p) => p.settings.theme_mode === "dark").map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-400 hover:shadow-sm"
            >
              <div className="flex gap-1">
                {[
                  preset.settings.primary_color,
                  preset.settings.accent_color,
                  preset.settings.dark_background_color,
                  preset.settings.dark_muted_color,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium">{preset.name}</p>
              <p className="text-xs text-gray-500">{preset.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Typography ── */}
      <section>
        <h2 className="text-lg font-semibold">Typography</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FontSelect
            label="Heading Font"
            value={formValues.font_heading}
            onChange={(v) => setValue("font_heading", v)}
            sansSerif={sansSerif}
            serif={serif}
            mono={mono}
          />
          <FontSelect
            label="Body Font"
            value={formValues.font_body}
            onChange={(v) => setValue("font_body", v)}
            sansSerif={sansSerif}
            serif={serif}
            mono={mono}
          />
        </div>
      </section>

      {/* ── Theme Mode ── */}
      <section>
        <h2 className="text-lg font-semibold">Mode</h2>
        <div className="mt-4 flex gap-3">
          {(["light", "dark"] as const).map((mode) => (
            <label key={mode} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={formValues.theme_mode === mode}
                onChange={() => setValue("theme_mode", mode)}
                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ── Colors ── */}
      <section>
        <h2 className="text-lg font-semibold">Colors</h2>
        <div className="mt-4 space-y-4">
          <ColorField label="Primary" description="Buttons, links, CTAs" value={formValues.primary_color} onChange={(v) => setValue("primary_color", v)} />
          <ColorField label="Secondary" description="Secondary text" value={formValues.secondary_color} onChange={(v) => setValue("secondary_color", v)} />
          <ColorField label="Accent" description="Highlights, badges" value={formValues.accent_color} onChange={(v) => setValue("accent_color", v)} />
          <ColorField label="Background" description="Page background" value={formValues.background_color} onChange={(v) => setValue("background_color", v)} />
          <ColorField label="Foreground" description="Main text" value={formValues.foreground_color} onChange={(v) => setValue("foreground_color", v)} />
          <ColorField label="Muted" description="Subtle backgrounds" value={formValues.muted_color} onChange={(v) => setValue("muted_color", v)} />
          <ColorField label="Border" description="Borders & dividers" value={formValues.border_color} onChange={(v) => setValue("border_color", v)} />
        </div>
      </section>

      {/* ── Buttons ── */}
      <section>
        <h2 className="text-lg font-semibold">Buttons</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize button appearance. Defaults to your primary color.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Button Style</label>
          <div className="grid grid-cols-2 gap-3 sm:w-72">
            {([
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
            ] as const).map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setValue("button_style", style.value)}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  formValues.button_style === style.value
                    ? "border-black shadow-sm"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex justify-center">
                  <div
                    className="inline-flex items-center justify-center rounded-md px-4 py-1.5 text-xs font-medium transition-all"
                    style={
                      style.value === "filled"
                        ? { backgroundColor: formValues.button_bg_color, color: formValues.button_text_color }
                        : { backgroundColor: "transparent", color: formValues.button_bg_color, border: `2px solid ${formValues.button_bg_color}` }
                    }
                  >
                    Button
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium">{style.label}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <ColorField label="Button Color" description={formValues.button_style === "outline" ? "Border and text color" : "Button fill color"} value={formValues.button_bg_color} onChange={(v) => setValue("button_bg_color", v)} />
          <ColorField label="Button Text" description={formValues.button_style === "outline" ? "Text color on hover" : "Button label color"} value={formValues.button_text_color} onChange={(v) => setValue("button_text_color", v)} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">Preview:</p>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all"
              style={
                formValues.button_style === "outline"
                  ? { backgroundColor: "transparent", color: formValues.button_bg_color, border: `2px solid ${formValues.button_bg_color}` }
                  : { backgroundColor: formValues.button_bg_color, color: formValues.button_text_color }
              }
            >
              Add to Cart
            </div>
            <span className="text-xs text-gray-400">
              {formValues.button_style === "outline" ? "Fills on hover" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── Product Buttons ── */}
      <section>
        <h2 className="text-lg font-semibold">Product Buttons</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize the &quot;View&quot; and &quot;Add to Cart&quot; buttons on product cards. Leave empty to inherit from global buttons above.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Product Button Style</label>
          <div className="grid grid-cols-3 gap-3 sm:w-96">
            {([
              { value: "", label: "Inherit" },
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
            ] as const).map((style) => {
              const effectiveStyle = style.value || formValues.button_style
              const effectiveColor = formValues.product_button_bg_color || formValues.button_bg_color
              const effectiveText = formValues.product_button_text_color || formValues.button_text_color
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setValue("product_button_style", style.value)}
                  className={`rounded-lg border-2 p-4 text-center transition-all ${
                    formValues.product_button_style === style.value
                      ? "border-black shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex justify-center">
                    <div
                      className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                      style={
                        effectiveStyle === "outline"
                          ? { backgroundColor: "transparent", color: effectiveColor, border: `2px solid ${effectiveColor}` }
                          : { backgroundColor: effectiveColor, color: effectiveText }
                      }
                    >
                      View
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium">{style.label}</p>
                  {style.value === "" && (
                    <p className="text-[10px] text-gray-400">Uses global</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <ColorField label="Product Button Color" description="Leave at global color or pick a custom one" value={formValues.product_button_bg_color || formValues.button_bg_color} onChange={(v) => setValue("product_button_bg_color", v)} />
          <ColorField label="Product Button Text" description="Custom text/hover color" value={formValues.product_button_text_color || formValues.button_text_color} onChange={(v) => setValue("product_button_text_color", v)} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setValue("product_button_bg_color", ""); setValue("product_button_text_color", ""); setValue("product_button_style", "") }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset to global button settings
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">Preview:</p>
          {(() => {
            const effectiveStyle = formValues.product_button_style || formValues.button_style
            const effectiveColor = formValues.product_button_bg_color || formValues.button_bg_color
            const effectiveText = formValues.product_button_text_color || formValues.button_text_color
            return (
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all"
                  style={
                    effectiveStyle === "outline"
                      ? { backgroundColor: "transparent", color: effectiveColor, border: `2px solid ${effectiveColor}` }
                      : { backgroundColor: effectiveColor, color: effectiveText }
                  }
                >
                  View
                </div>
                <span className="text-xs text-gray-400">
                  {effectiveStyle === "outline" ? "Fills on hover" : ""}
                </span>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ── Dark Mode Overrides ── */}
      {isDark && (
        <section>
          <h2 className="text-lg font-semibold">Dark Mode Overrides</h2>
          <p className="mt-1 text-sm text-gray-500">
            These colors apply when dark mode is active.
          </p>
          <div className="mt-4 space-y-4">
            <ColorField label="Dark Background" description="Dark page background" value={formValues.dark_background_color} onChange={(v) => setValue("dark_background_color", v)} />
            <ColorField label="Dark Foreground" description="Dark mode text" value={formValues.dark_foreground_color} onChange={(v) => setValue("dark_foreground_color", v)} />
            <ColorField label="Dark Muted" description="Dark subtle backgrounds" value={formValues.dark_muted_color} onChange={(v) => setValue("dark_muted_color", v)} />
            <ColorField label="Dark Border" description="Dark borders" value={formValues.dark_border_color} onChange={(v) => setValue("dark_border_color", v)} />
          </div>
        </section>
      )}

      {/* ── Style ── */}
      <section>
        <h2 className="text-lg font-semibold">Style</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Border Radius"
            value={formValues.border_radius}
            onChange={(v) => setValue("border_radius", v)}
            options={radiusOptions}
          />
          <SelectField
            label="Shadow Depth"
            value={formValues.shadow_depth}
            onChange={(v) => setValue("shadow_depth", v)}
            options={shadowOptions}
          />
        </div>
      </section>

      {/* ── Branding ── */}
      <section>
        <h2 className="text-lg font-semibold">Branding</h2>
        <p className="mt-1 text-sm text-gray-500">Upload a logo and favicon for your store.</p>
        <div className="mt-4 space-y-6">
          <ImageUploadField
            label="Site Logo"
            value={formValues.site_logo_url}
            onChange={(v) => setValue("site_logo_url", v)}
            previewClass="h-10 max-w-[200px] object-contain"
            accept="image/png,image/jpeg,image/gif,image/webp"
          />
          <ImageUploadField
            label="Favicon"
            value={formValues.favicon_url}
            onChange={(v) => setValue("favicon_url", v)}
            previewClass="h-8 w-8 object-contain"
            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/gif"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Logo Height (px)</label>
            <input
              type="number"
              value={formValues.logo_height}
              onChange={(e) => setValue("logo_height", e.target.value)}
              placeholder="Leave empty for default (32px)"
              min={16}
              max={200}
              className="h-10 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-500">
              Height of the logo in pixels. Leave empty for the default 32px.
            </p>
          </div>
        </div>
      </section>

      </div>{/* end Style & Branding tab */}

      {/* ── Layout tab ── */}
      <div style={{ display: activeTab === "layout" ? undefined : "none" }} className="space-y-10 pt-6">

      {/* ── Header Layout ── */}
      <section>
        <h2 className="text-lg font-semibold">Header Layout</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how your storefront header is arranged.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "classic", label: "Classic", description: "Logo left, nav center, utils right" },
            { value: "centered", label: "Centered", description: "Centered logo with nav below" },
            { value: "minimal", label: "Minimal", description: "Logo + utils only, hamburger nav" },
            { value: "stacked", label: "Full Nav Bar", description: "Logo row + full-width nav bar" },
          ] as const).map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setValue("header_layout", layout.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.header_layout === layout.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <HeaderLayoutIcon layout={layout.value} active={formValues.header_layout === layout.value} />
              <p className="mt-3 text-sm font-medium">{layout.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{layout.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Header Colors ── */}
      <section>
        <h2 className="text-lg font-semibold">Header Colors</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize the header background, navigation, and icon colors. Leave empty to inherit from your global theme colors.
        </p>
        {(() => {
          const themeSwatches = [
            { color: formValues.primary_color, label: "Primary" },
            { color: formValues.secondary_color, label: "Secondary" },
            { color: formValues.accent_color, label: "Accent" },
            { color: formValues.foreground_color, label: "Foreground" },
            { color: formValues.background_color, label: "Background" },
            { color: formValues.muted_color, label: "Muted" },
            { color: formValues.border_color, label: "Border" },
          ]
          return (
        <div className="mt-4 space-y-4">
          <ColorField
            label="Background"
            description="Header background color"
            value={formValues.header_bg_color || formValues.background_color}
            onChange={(v) => setValue("header_bg_color", v)}
            swatches={themeSwatches}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="Nav Links"
              description="Navigation text color"
              value={formValues.header_nav_color || formValues.foreground_color}
              onChange={(v) => setValue("header_nav_color", v)}
              swatches={themeSwatches}
            />
            <ColorField
              label="Nav Hover"
              description="Navigation hover color"
              value={formValues.header_nav_hover_color || formValues.foreground_color}
              onChange={(v) => setValue("header_nav_hover_color", v)}
              swatches={themeSwatches}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="Icons"
              description="Search, wishlist, cart, account"
              value={formValues.header_icon_color || formValues.foreground_color}
              onChange={(v) => setValue("header_icon_color", v)}
              swatches={themeSwatches}
            />
            <ColorField
              label="Icon Hover"
              description="Icon hover color"
              value={formValues.header_icon_hover_color || formValues.foreground_color}
              onChange={(v) => setValue("header_icon_hover_color", v)}
              swatches={themeSwatches}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="User Icon BG"
              description="User avatar background"
              value={formValues.header_user_bg_color || formValues.foreground_color}
              onChange={(v) => setValue("header_user_bg_color", v)}
              swatches={themeSwatches}
            />
            <ColorField
              label="User Icon Text"
              description="User avatar letter color"
              value={formValues.header_user_text_color || formValues.background_color}
              onChange={(v) => setValue("header_user_text_color", v)}
              swatches={themeSwatches}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="Cart Badge BG"
              description="Cart count badge background"
              value={formValues.header_cart_badge_bg_color || formValues.foreground_color}
              onChange={(v) => setValue("header_cart_badge_bg_color", v)}
              swatches={themeSwatches}
            />
            <ColorField
              label="Cart Badge Text"
              description="Cart count badge text"
              value={formValues.header_cart_badge_text_color || formValues.background_color}
              onChange={(v) => setValue("header_cart_badge_text_color", v)}
              swatches={themeSwatches}
            />
          </div>
        </div>
          )
        })()}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              setValue("header_bg_color", "")
              setValue("header_nav_color", "")
              setValue("header_nav_hover_color", "")
              setValue("header_icon_color", "")
              setValue("header_icon_hover_color", "")
              setValue("header_user_bg_color", "")
              setValue("header_user_text_color", "")
              setValue("header_cart_badge_bg_color", "")
              setValue("header_cart_badge_text_color", "")
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset to global theme colors
          </button>
        </div>
      </section>

      {/* ── Footer Layout ── */}
      <section>
        <h2 className="text-lg font-semibold">Footer Layout</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how your storefront footer is arranged.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "standard", label: "Standard", description: "Multi-column grid with copyright bar" },
            { value: "centered", label: "Centered", description: "Logo and links centered" },
            { value: "minimal", label: "Minimal", description: "Links left, copyright right" },
            { value: "columns-with-logo", label: "Logo + Columns", description: "Logo left, link columns right" },
          ] as const).map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setValue("footer_layout", layout.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.footer_layout === layout.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <FooterLayoutIcon layout={layout.value} active={formValues.footer_layout === layout.value} />
              <p className="mt-3 text-sm font-medium">{layout.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{layout.description}</p>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <ToggleField
            label="Show Legal Links"
            description="Display Terms of Service and Privacy Policy links in the footer"
            checked={formValues.footer_show_legal === "true"}
            onChange={(v) => setValue("footer_show_legal", v ? "true" : "false")}
          />
        </div>
      </section>

      {/* ── Footer Colors ── */}
      <section>
        <h2 className="text-lg font-semibold">Footer Colors</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize the footer background, headings, and link colors. Leave empty to inherit from your global theme colors.
        </p>
        {(() => {
          const themeSwatches = [
            { color: formValues.primary_color, label: "Primary" },
            { color: formValues.secondary_color, label: "Secondary" },
            { color: formValues.accent_color, label: "Accent" },
            { color: formValues.foreground_color, label: "Foreground" },
            { color: formValues.background_color, label: "Background" },
            { color: formValues.muted_color, label: "Muted" },
            { color: formValues.border_color, label: "Border" },
          ]
          return (
        <div className="mt-4 space-y-4">
          <ColorField
            label="Background"
            description="Footer background color"
            value={formValues.footer_bg_color || formValues.muted_color}
            onChange={(v) => setValue("footer_bg_color", v)}
            swatches={themeSwatches}
          />
          <ColorField
            label="Headings"
            description="Section heading labels"
            value={formValues.footer_heading_color || formValues.foreground_color}
            onChange={(v) => setValue("footer_heading_color", v)}
            swatches={themeSwatches}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="Links"
              description="Footer link text color"
              value={formValues.footer_link_color || formValues.foreground_color}
              onChange={(v) => setValue("footer_link_color", v)}
              swatches={themeSwatches}
            />
            <ColorField
              label="Link Hover"
              description="Footer link hover color"
              value={formValues.footer_link_hover_color || formValues.foreground_color}
              onChange={(v) => setValue("footer_link_hover_color", v)}
              swatches={themeSwatches}
            />
          </div>
        </div>
          )
        })()}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              setValue("footer_bg_color", "")
              setValue("footer_heading_color", "")
              setValue("footer_link_color", "")
              setValue("footer_link_hover_color", "")
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset to global theme colors
          </button>
        </div>
      </section>

      {/* ── Container Widths ── */}
      <section>
        <h2 className="text-lg font-semibold">Container Widths</h2>
        <div className="mt-4 mb-4">
          <ToggleField
            label="Full Width Header"
            description="Stretch the header container to the full width of the page"
            checked={formValues.header_full_width === "true"}
            onChange={(v) => setValue("header_full_width", v ? "true" : "false")}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Set a custom max-width (in pixels) for different areas. Leave blank to use the default (1280px).
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Header</label>
            <input
              type="number"
              placeholder="1280"
              value={formValues.container_width_header}
              onChange={(e) => setValue("container_width_header", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Homepage Sections</label>
            <input
              type="number"
              placeholder="1280"
              value={formValues.container_width_homepage}
              onChange={(e) => setValue("container_width_homepage", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subpage Content</label>
            <input
              type="number"
              placeholder="1280"
              value={formValues.container_width_subpages}
              onChange={(e) => setValue("container_width_subpages", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />

          </div>
        </div>
      </section>

      {/* ── Product Grid Layout ── */}
      <section>
        <h2 className="text-lg font-semibold">Product Grid Layout</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how products are displayed on listing pages.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "standard", label: "Standard", description: "1 col mobile, up to 4 cols desktop" },
            { value: "compact", label: "Compact", description: "2 col mobile, up to 5 cols desktop" },
            { value: "spacious", label: "Spacious", description: "1 col mobile, up to 3 cols desktop" },
            { value: "list", label: "List", description: "Horizontal cards, single column" },
          ] as const).map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setValue("products_layout", layout.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.products_layout === layout.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <ProductsLayoutIcon layout={layout.value} active={formValues.products_layout === layout.value} />
              <p className="mt-3 text-sm font-medium">{layout.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{layout.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Blog Layout ── */}
      <section>
        <h2 className="text-lg font-semibold">Blog Layout</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how blog posts are displayed on listing pages.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "standard", label: "Standard", description: "1 col mobile, up to 4 cols desktop" },
            { value: "compact", label: "Compact", description: "2 col mobile, up to 5 cols desktop" },
            { value: "spacious", label: "Spacious", description: "1 col mobile, up to 3 cols desktop" },
            { value: "list", label: "List", description: "Horizontal cards, single column" },
          ] as const).map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setValue("blog_layout", layout.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.blog_layout === layout.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <ProductsLayoutIcon layout={layout.value} active={formValues.blog_layout === layout.value} />
              <p className="mt-3 text-sm font-medium">{layout.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{layout.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Contact Page Style ── */}
      <section>
        <h2 className="text-lg font-semibold">Contact Page Style</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how the contact page is laid out.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "standard", label: "Standard", description: "Two-column: form + contact info" },
            { value: "centered", label: "Centered", description: "Single centered column form" },
            { value: "split", label: "Split", description: "50/50 branded panel + form" },
            { value: "minimal", label: "Minimal", description: "Narrow centered form, no extras" },
          ] as const).map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setValue("contact_page_style", style.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.contact_page_style === style.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <ContactPageStyleIcon style={style.value} active={formValues.contact_page_style === style.value} />
              <p className="mt-3 text-sm font-medium">{style.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{style.description}</p>
            </button>
          ))}
        </div>
      </section>

      </div>{/* end Layout tab */}

      {/* ── Components & Features tab ── */}
      <div style={{ display: activeTab === "components" ? undefined : "none" }} className="space-y-10 pt-6">

      {/* ── Alert Bar ── */}
      <section>
        <h2 className="text-lg font-semibold">Alert Bar</h2>
        <p className="mt-1 text-sm text-gray-500">
          Display an announcement bar above the header on all storefront pages.
        </p>
        <div className="mt-4 space-y-4">
          <ToggleField
            label="Enable Alert Bar"
            description="Show the announcement bar to all visitors"
            checked={formValues.alert_bar_enabled === "true"}
            onChange={(v) => setValue("alert_bar_enabled", v ? "true" : "false")}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bar Content</label>
            <p className="mb-2 text-xs text-gray-500">
              Keep it brief — this is a short announcement strip above the header.
            </p>
            <div className="[&_.ProseMirror]:min-h-[80px]">
              <RichTextEditor
                content={formValues.alert_bar_content}
                onChange={(html) => setValue("alert_bar_content", html)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              label="Background Color"
              description="Bar background"
              value={formValues.alert_bar_bg_color}
              onChange={(v) => setValue("alert_bar_bg_color", v)}
            />
            <ColorField
              label="Text Color"
              description="Bar text and links"
              value={formValues.alert_bar_text_color}
              onChange={(v) => setValue("alert_bar_text_color", v)}
            />
          </div>
        </div>
      </section>

      {/* ── Product Card Style ── */}
      <section>
        <h2 className="text-lg font-semibold">Product Card Style</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the visual style for product cards on listing pages.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {([
            { value: "standard", label: "Standard", description: "Clean card with border, hover shadow" },
            { value: "bordered", label: "Bordered", description: "Stronger border and shadow emphasis" },
            { value: "minimal", label: "Minimal", description: "No card wrapper, image + text only" },
            { value: "overlay", label: "Overlay", description: "Name and price overlaid on image" },
            { value: "boxed", label: "Boxed", description: "Padded card with background and shadow" },
          ] as const).map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setValue("product_card_style", style.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.product_card_style === style.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <CardStyleIcon style={style.value} active={formValues.product_card_style === style.value} />
              <p className="mt-3 text-sm font-medium">{style.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{style.description}</p>
            </button>
          ))}
        </div>

        {/* Boxed style settings */}
        {formValues.product_card_style === "boxed" && (
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Card Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formValues.product_card_bg_color || "#f3f4f6"}
                  onChange={(e) => setValue("product_card_bg_color", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
                />
                <input
                  type="text"
                  value={formValues.product_card_bg_color || ""}
                  onChange={(e) => setValue("product_card_bg_color", e.target.value)}
                  placeholder="#f3f4f6"
                  className="flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Card Shadow</label>
              <select
                value={formValues.product_card_shadow || "subtle"}
                onChange={(e) => setValue("product_card_shadow", e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="none">None</option>
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* ── Blog Card Style ── */}
      <section>
        <h2 className="text-lg font-semibold">Blog Card Style</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the visual style for blog post cards.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { value: "standard", label: "Standard", description: "Image top, text below, clean look" },
            { value: "bordered", label: "Bordered", description: "Card with border and shadow" },
            { value: "minimal", label: "Minimal", description: "No wrapper, just image + text" },
            { value: "overlay", label: "Overlay", description: "Title overlaid on darkened image" },
          ] as const).map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setValue("blog_card_style", style.value)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                formValues.blog_card_style === style.value
                  ? "border-black shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <CardStyleIcon style={style.value} active={formValues.blog_card_style === style.value} />
              <p className="mt-3 text-sm font-medium">{style.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{style.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Blog Display Options ── */}
      <section>
        <h2 className="text-lg font-semibold">Blog Display Options</h2>
        <p className="mt-1 text-sm text-gray-500">
          Control what metadata is shown on blog post cards.
        </p>
        <div className="mt-4 space-y-3">
          <ToggleField
            label="Show Author"
            description="Display author name on blog cards"
            checked={formValues.blog_show_author === "true"}
            onChange={(v) => setValue("blog_show_author", v ? "true" : "false")}
          />
          <ToggleField
            label="Show Date"
            description="Display publish date on blog cards"
            checked={formValues.blog_show_date === "true"}
            onChange={(v) => setValue("blog_show_date", v ? "true" : "false")}
          />
          <ToggleField
            label="Show Excerpt"
            description="Display post excerpt on blog cards"
            checked={formValues.blog_show_excerpt === "true"}
            onChange={(v) => setValue("blog_show_excerpt", v ? "true" : "false")}
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <h2 className="text-lg font-semibold">Features</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enable or disable storefront features.
        </p>
        <div className="mt-4 space-y-3">
          <ToggleField
            label="Enable Wishlist"
            description="Allow customers to save products to a wishlist"
            checked={formValues.enable_wishlist === "true"}
            onChange={(v) => setValue("enable_wishlist", v ? "true" : "false")}
          />
          <ToggleField
            label="Enable Reviews"
            description="Allow customers to leave product reviews and ratings"
            checked={formValues.enable_reviews === "true"}
            onChange={(v) => setValue("enable_reviews", v ? "true" : "false")}
          />
        </div>
      </section>

      </div>{/* end Components & Features tab */}

      <div className="mt-8">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Theme Settings"}
        </Button>
      </div>
    </form>
  )
}

/* ── Helper Components ── */

function ColorField({
  label,
  description,
  value,
  onChange,
  swatches,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  swatches?: { color: string; label: string }[]
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-gray-300 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-28 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      {swatches && swatches.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 mr-1">Theme:</span>
          {swatches.map((s) => (
            <button
              key={s.label}
              type="button"
              title={s.label}
              onClick={() => onChange(s.color)}
              className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${
                value.toLowerCase() === s.color.toLowerCase()
                  ? "border-black ring-1 ring-black ring-offset-1"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: s.color }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FontSelect({
  label,
  value,
  onChange,
  sansSerif,
  serif,
  mono,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  sansSerif: typeof fontOptions
  serif: typeof fontOptions
  mono: typeof fontOptions
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      >
        <optgroup label="Sans Serif">
          {sansSerif.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Serif">
          {serif.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Monospace">
          {mono.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </optgroup>
      </select>
      <p className="mt-1.5 text-xs text-gray-500" style={{ fontFamily: `"${value}", sans-serif` }}>
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ImageUploadField({
  label,
  value,
  onChange,
  previewClass,
  accept,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  previewClass: string
  accept: string
}) {
  const [preview, setPreview] = useState(value)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error || "Upload failed", "error")
        setPreview(value)
        return
      }

      onChange(data.url)
      setPreview(data.url)
      toast(`${label} uploaded!`)
    } catch {
      toast("Upload failed", "error")
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    onChange("")
    setPreview("")
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>

      {preview ? (
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className={previewClass} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-medium text-gray-600 hover:text-black"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-gray-400"
        >
          <div>
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600">
              {uploading ? "Uploading..." : `Click to upload ${label.toLowerCase()}`}
            </p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, SVG, or ICO. Max 2MB.</p>
          </div>
        </button>
      )}

      <input ref={fileRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  )
}

function HeaderLayoutIcon({ layout, active }: { layout: string; active: boolean }) {
  const bar = active ? "fill-black" : "fill-gray-300"
  const dot = active ? "fill-black" : "fill-gray-400"
  const line = active ? "fill-gray-600" : "fill-gray-200"

  if (layout === "classic") {
    return (
      <svg viewBox="0 0 120 40" className="h-10 w-full">
        {/* Logo block */}
        <rect x="4" y="14" width="24" height="12" rx="2" className={bar} />
        {/* Nav links */}
        <rect x="40" y="17" width="12" height="6" rx="1" className={line} />
        <rect x="56" y="17" width="12" height="6" rx="1" className={line} />
        <rect x="72" y="17" width="12" height="6" rx="1" className={line} />
        {/* Utils */}
        <circle cx="100" cy="20" r="4" className={dot} />
        <circle cx="112" cy="20" r="4" className={dot} />
      </svg>
    )
  }

  if (layout === "centered") {
    return (
      <svg viewBox="0 0 120 56" className="h-10 w-full">
        {/* Top row: utils right */}
        <circle cx="100" cy="8" r="3" className={dot} />
        <circle cx="110" cy="8" r="3" className={dot} />
        {/* Center logo */}
        <rect x="42" y="16" width="36" height="10" rx="2" className={bar} />
        {/* Center nav */}
        <rect x="28" y="34" width="12" height="5" rx="1" className={line} />
        <rect x="44" y="34" width="12" height="5" rx="1" className={line} />
        <rect x="60" y="34" width="12" height="5" rx="1" className={line} />
        <rect x="76" y="34" width="12" height="5" rx="1" className={line} />
      </svg>
    )
  }

  if (layout === "minimal") {
    return (
      <svg viewBox="0 0 120 40" className="h-10 w-full">
        {/* Logo block */}
        <rect x="4" y="14" width="24" height="12" rx="2" className={bar} />
        {/* Utils */}
        <circle cx="92" cy="20" r="4" className={dot} />
        <circle cx="104" cy="20" r="4" className={dot} />
        {/* Hamburger */}
        <rect x="112" y="14" width="6" height="2" rx="0.5" className={dot} />
        <rect x="112" y="19" width="6" height="2" rx="0.5" className={dot} />
        <rect x="112" y="24" width="6" height="2" rx="0.5" className={dot} />
      </svg>
    )
  }

  // stacked
  return (
    <svg viewBox="0 0 120 52" className="h-10 w-full">
      {/* Top row: logo + utils */}
      <rect x="4" y="6" width="24" height="10" rx="2" className={bar} />
      <circle cx="100" cy="11" r="3.5" className={dot} />
      <circle cx="112" cy="11" r="3.5" className={dot} />
      {/* Full-width nav bar */}
      <rect x="0" y="24" width="120" height="28" rx="0" className={active ? "fill-gray-100" : "fill-gray-50"} />
      <rect x="12" y="34" width="14" height="5" rx="1" className={line} />
      <rect x="32" y="34" width="14" height="5" rx="1" className={line} />
      <rect x="52" y="34" width="14" height="5" rx="1" className={line} />
      <rect x="72" y="34" width="14" height="5" rx="1" className={line} />
    </svg>
  )
}

function FooterLayoutIcon({ layout, active }: { layout: string; active: boolean }) {
  const bar = active ? "fill-black" : "fill-gray-300"
  const dot = active ? "fill-black" : "fill-gray-400"
  const line = active ? "fill-gray-600" : "fill-gray-200"
  const bg = active ? "fill-gray-100" : "fill-gray-50"

  if (layout === "standard") {
    return (
      <svg viewBox="0 0 120 52" className="h-10 w-full">
        {/* 4 column headers */}
        <rect x="4" y="4" width="16" height="5" rx="1" className={bar} />
        <rect x="32" y="4" width="16" height="5" rx="1" className={bar} />
        <rect x="60" y="4" width="16" height="5" rx="1" className={bar} />
        <rect x="88" y="4" width="16" height="5" rx="1" className={bar} />
        {/* Column links */}
        <rect x="4" y="14" width="20" height="3" rx="0.5" className={line} />
        <rect x="4" y="20" width="18" height="3" rx="0.5" className={line} />
        <rect x="32" y="14" width="18" height="3" rx="0.5" className={line} />
        <rect x="32" y="20" width="20" height="3" rx="0.5" className={line} />
        <rect x="60" y="14" width="22" height="3" rx="0.5" className={line} />
        <rect x="60" y="20" width="16" height="3" rx="0.5" className={line} />
        <rect x="88" y="14" width="24" height="3" rx="0.5" className={line} />
        {/* Divider + copyright */}
        <rect x="0" y="34" width="120" height="1" className={line} />
        <rect x="38" y="42" width="44" height="4" rx="1" className={dot} />
      </svg>
    )
  }

  if (layout === "centered") {
    return (
      <svg viewBox="0 0 120 48" className="h-10 w-full">
        {/* Centered logo */}
        <rect x="42" y="4" width="36" height="8" rx="2" className={bar} />
        {/* Centered links row */}
        <rect x="20" y="20" width="12" height="4" rx="1" className={line} />
        <rect x="36" y="20" width="12" height="4" rx="1" className={line} />
        <rect x="52" y="20" width="12" height="4" rx="1" className={line} />
        <rect x="68" y="20" width="12" height="4" rx="1" className={line} />
        <rect x="84" y="20" width="12" height="4" rx="1" className={line} />
        {/* Copyright */}
        <rect x="38" y="36" width="44" height="4" rx="1" className={dot} />
      </svg>
    )
  }

  if (layout === "minimal") {
    return (
      <svg viewBox="0 0 120 28" className="h-10 w-full">
        {/* Divider */}
        <rect x="0" y="4" width="120" height="1" className={line} />
        {/* Links left */}
        <rect x="4" y="12" width="12" height="4" rx="1" className={line} />
        <rect x="20" y="12" width="12" height="4" rx="1" className={line} />
        <rect x="36" y="12" width="12" height="4" rx="1" className={line} />
        <rect x="52" y="12" width="12" height="4" rx="1" className={line} />
        {/* Copyright right */}
        <rect x="82" y="12" width="34" height="4" rx="1" className={dot} />
      </svg>
    )
  }

  // columns-with-logo
  return (
    <svg viewBox="0 0 120 52" className="h-10 w-full">
      {/* Logo left */}
      <rect x="4" y="4" width="28" height="10" rx="2" className={bar} />
      <rect x="4" y="18" width="22" height="3" rx="0.5" className={line} />
      {/* Columns right */}
      <rect x="44" y="4" width="14" height="5" rx="1" className={bar} />
      <rect x="66" y="4" width="14" height="5" rx="1" className={bar} />
      <rect x="88" y="4" width="14" height="5" rx="1" className={bar} />
      <rect x="44" y="14" width="16" height="3" rx="0.5" className={line} />
      <rect x="44" y="20" width="14" height="3" rx="0.5" className={line} />
      <rect x="66" y="14" width="16" height="3" rx="0.5" className={line} />
      <rect x="66" y="20" width="14" height="3" rx="0.5" className={line} />
      <rect x="88" y="14" width="18" height="3" rx="0.5" className={line} />
      <rect x="88" y="20" width="14" height="3" rx="0.5" className={line} />
      {/* Divider + copyright */}
      <rect x="0" y="34" width="120" height="1" className={line} />
      <rect x="38" y="42" width="44" height="4" rx="1" className={dot} />
    </svg>
  )
}

function ProductsLayoutIcon({ layout, active }: { layout: string; active: boolean }) {
  const bar = active ? "fill-black" : "fill-gray-300"
  const line = active ? "fill-gray-600" : "fill-gray-200"
  const bg = active ? "fill-gray-100" : "fill-gray-50"

  if (layout === "standard") {
    // 4 cards in a row (1 col mobile implied)
    return (
      <svg viewBox="0 0 120 48" className="h-10 w-full">
        {/* Row of 4 cards */}
        <rect x="2" y="2" width="26" height="32" rx="2" className={bg} />
        <rect x="4" y="4" width="22" height="14" rx="1" className={line} />
        <rect x="4" y="22" width="16" height="3" rx="0.5" className={bar} />
        <rect x="4" y="28" width="12" height="3" rx="0.5" className={line} />

        <rect x="32" y="2" width="26" height="32" rx="2" className={bg} />
        <rect x="34" y="4" width="22" height="14" rx="1" className={line} />
        <rect x="34" y="22" width="16" height="3" rx="0.5" className={bar} />
        <rect x="34" y="28" width="12" height="3" rx="0.5" className={line} />

        <rect x="62" y="2" width="26" height="32" rx="2" className={bg} />
        <rect x="64" y="4" width="22" height="14" rx="1" className={line} />
        <rect x="64" y="22" width="16" height="3" rx="0.5" className={bar} />
        <rect x="64" y="28" width="12" height="3" rx="0.5" className={line} />

        <rect x="92" y="2" width="26" height="32" rx="2" className={bg} />
        <rect x="94" y="4" width="22" height="14" rx="1" className={line} />
        <rect x="94" y="22" width="16" height="3" rx="0.5" className={bar} />
        <rect x="94" y="28" width="12" height="3" rx="0.5" className={line} />

        <text x="60" y="45" textAnchor="middle" className={active ? "fill-gray-500" : "fill-gray-300"} fontSize="6">1 → 2 → 3 → 4</text>
      </svg>
    )
  }

  if (layout === "compact") {
    // 5 smaller cards (2 col mobile)
    return (
      <svg viewBox="0 0 120 48" className="h-10 w-full">
        <rect x="1" y="2" width="22" height="28" rx="2" className={bg} />
        <rect x="3" y="4" width="18" height="12" rx="1" className={line} />
        <rect x="3" y="19" width="12" height="3" rx="0.5" className={bar} />
        <rect x="3" y="24" width="10" height="3" rx="0.5" className={line} />

        <rect x="25" y="2" width="22" height="28" rx="2" className={bg} />
        <rect x="27" y="4" width="18" height="12" rx="1" className={line} />
        <rect x="27" y="19" width="12" height="3" rx="0.5" className={bar} />
        <rect x="27" y="24" width="10" height="3" rx="0.5" className={line} />

        <rect x="49" y="2" width="22" height="28" rx="2" className={bg} />
        <rect x="51" y="4" width="18" height="12" rx="1" className={line} />
        <rect x="51" y="19" width="12" height="3" rx="0.5" className={bar} />
        <rect x="51" y="24" width="10" height="3" rx="0.5" className={line} />

        <rect x="73" y="2" width="22" height="28" rx="2" className={bg} />
        <rect x="75" y="4" width="18" height="12" rx="1" className={line} />
        <rect x="75" y="19" width="12" height="3" rx="0.5" className={bar} />
        <rect x="75" y="24" width="10" height="3" rx="0.5" className={line} />

        <rect x="97" y="2" width="22" height="28" rx="2" className={bg} />
        <rect x="99" y="4" width="18" height="12" rx="1" className={line} />
        <rect x="99" y="19" width="12" height="3" rx="0.5" className={bar} />
        <rect x="99" y="24" width="10" height="3" rx="0.5" className={line} />

        <text x="60" y="45" textAnchor="middle" className={active ? "fill-gray-500" : "fill-gray-300"} fontSize="6">2 → 3 → 4 → 5</text>
      </svg>
    )
  }

  if (layout === "spacious") {
    // 3 large cards
    return (
      <svg viewBox="0 0 120 48" className="h-10 w-full">
        <rect x="2" y="2" width="36" height="32" rx="2" className={bg} />
        <rect x="4" y="4" width="32" height="16" rx="1" className={line} />
        <rect x="4" y="24" width="20" height="3" rx="0.5" className={bar} />
        <rect x="4" y="30" width="14" height="3" rx="0.5" className={line} />

        <rect x="42" y="2" width="36" height="32" rx="2" className={bg} />
        <rect x="44" y="4" width="32" height="16" rx="1" className={line} />
        <rect x="44" y="24" width="20" height="3" rx="0.5" className={bar} />
        <rect x="44" y="30" width="14" height="3" rx="0.5" className={line} />

        <rect x="82" y="2" width="36" height="32" rx="2" className={bg} />
        <rect x="84" y="4" width="32" height="16" rx="1" className={line} />
        <rect x="84" y="24" width="20" height="3" rx="0.5" className={bar} />
        <rect x="84" y="30" width="14" height="3" rx="0.5" className={line} />

        <text x="60" y="45" textAnchor="middle" className={active ? "fill-gray-500" : "fill-gray-300"} fontSize="6">1 → 2 → 2 → 3</text>
      </svg>
    )
  }

  // list
  return (
    <svg viewBox="0 0 120 48" className="h-10 w-full">
      {/* Row 1: image left, text right */}
      <rect x="2" y="2" width="24" height="13" rx="2" className={bg} />
      <rect x="4" y="4" width="20" height="9" rx="1" className={line} />
      <rect x="30" y="4" width="30" height="3" rx="0.5" className={bar} />
      <rect x="30" y="10" width="50" height="3" rx="0.5" className={line} />

      {/* Row 2 */}
      <rect x="2" y="18" width="24" height="13" rx="2" className={bg} />
      <rect x="4" y="20" width="20" height="9" rx="1" className={line} />
      <rect x="30" y="20" width="30" height="3" rx="0.5" className={bar} />
      <rect x="30" y="26" width="50" height="3" rx="0.5" className={line} />

      {/* Row 3 */}
      <rect x="2" y="34" width="24" height="13" rx="2" className={bg} />
      <rect x="4" y="36" width="20" height="9" rx="1" className={line} />
      <rect x="30" y="36" width="30" height="3" rx="0.5" className={bar} />
      <rect x="30" y="42" width="50" height="3" rx="0.5" className={line} />
    </svg>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  )
}

function CardStyleIcon({ style, active }: { style: string; active: boolean }) {
  const bar = active ? "fill-black" : "fill-gray-300"
  const line = active ? "fill-gray-600" : "fill-gray-200"
  const bg = active ? "fill-gray-100" : "fill-gray-50"

  if (style === "standard") {
    return (
      <svg viewBox="0 0 80 56" className="h-10 w-full">
        <rect x="2" y="2" width="76" height="52" rx="3" className={bg} stroke={active ? "#d1d5db" : "#e5e7eb"} strokeWidth="1" fill="none" />
        <rect x="4" y="4" width="72" height="28" rx="2" className={line} />
        <rect x="8" y="36" width="30" height="4" rx="1" className={bar} />
        <rect x="8" y="44" width="20" height="3" rx="0.5" className={line} />
      </svg>
    )
  }

  if (style === "bordered") {
    return (
      <svg viewBox="0 0 80 56" className="h-10 w-full">
        <rect x="2" y="2" width="76" height="52" rx="3" className={bg} stroke={active ? "#9ca3af" : "#d1d5db"} strokeWidth="1.5" fill="none" />
        <rect x="4" y="4" width="72" height="28" rx="2" className={line} />
        <rect x="8" y="36" width="30" height="4" rx="1" className={bar} />
        <rect x="8" y="44" width="20" height="3" rx="0.5" className={line} />
        {/* Shadow indicator */}
        <rect x="6" y="56" width="70" height="2" rx="1" opacity="0.15" className={bar} />
      </svg>
    )
  }

  if (style === "minimal") {
    return (
      <svg viewBox="0 0 80 56" className="h-10 w-full">
        <rect x="4" y="2" width="72" height="30" rx="2" className={line} />
        <rect x="4" y="36" width="30" height="4" rx="1" className={bar} />
        <rect x="4" y="44" width="20" height="3" rx="0.5" className={line} />
      </svg>
    )
  }

  if (style === "boxed") {
    return (
      <svg viewBox="0 0 80 56" className="h-10 w-full">
        {/* Outer card with fill + shadow */}
        <rect x="2" y="2" width="76" height="52" rx="5" className={bg} stroke={active ? "#d1d5db" : "#e5e7eb"} strokeWidth="1" />
        {/* Inner padding area with image */}
        <rect x="8" y="6" width="64" height="24" rx="3" fill="white" />
        <rect x="8" y="6" width="64" height="24" rx="3" className={line} opacity="0.5" />
        {/* Centered text */}
        <rect x="22" y="34" width="36" height="4" rx="1" className={bar} />
        <rect x="26" y="42" width="28" height="3" rx="0.5" className={line} />
        {/* Shadow indicator */}
        <rect x="6" y="56" width="68" height="2" rx="1" opacity="0.2" className={bar} />
      </svg>
    )
  }

  // overlay
  return (
    <svg viewBox="0 0 80 56" className="h-10 w-full">
      <rect x="2" y="2" width="76" height="52" rx="3" className={line} />
      <defs>
        <linearGradient id={`grad-${active}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="black" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="76" height="52" rx="3" fill={`url(#grad-${active})`} />
      <rect x="8" y="40" width="30" height="4" rx="1" fill="white" />
      <rect x="8" y="48" width="20" height="3" rx="0.5" fill="white" opacity="0.7" />
    </svg>
  )
}

function ContactPageStyleIcon({ style, active }: { style: string; active: boolean }) {
  const bar = active ? "fill-black" : "fill-gray-300"
  const line = active ? "fill-gray-600" : "fill-gray-200"
  const bg = active ? "fill-gray-100" : "fill-gray-50"

  if (style === "standard") {
    // Two columns: form left (wider), info right
    return (
      <svg viewBox="0 0 120 56" className="h-10 w-full">
        {/* Left column — form */}
        <rect x="2" y="2" width="72" height="52" rx="2" className={bg} />
        <rect x="6" y="6" width="30" height="4" rx="1" className={bar} />
        <rect x="6" y="14" width="64" height="6" rx="1" className={line} />
        <rect x="6" y="24" width="64" height="6" rx="1" className={line} />
        <rect x="6" y="34" width="64" height="10" rx="1" className={line} />
        <rect x="6" y="48" width="24" height="4" rx="1" className={bar} />
        {/* Right column — info */}
        <rect x="80" y="6" width="24" height="3" rx="0.5" className={bar} />
        <rect x="80" y="13" width="34" height="3" rx="0.5" className={line} />
        <rect x="80" y="19" width="30" height="3" rx="0.5" className={line} />
        <rect x="80" y="28" width="20" height="3" rx="0.5" className={line} />
      </svg>
    )
  }

  if (style === "centered") {
    // Centered single column
    return (
      <svg viewBox="0 0 120 56" className="h-10 w-full">
        <rect x="30" y="2" width="60" height="4" rx="1" className={bar} />
        <rect x="36" y="9" width="48" height="3" rx="0.5" className={line} />
        <rect x="24" y="16" width="72" height="6" rx="1" className={bg} />
        <rect x="24" y="25" width="72" height="6" rx="1" className={bg} />
        <rect x="24" y="34" width="72" height="10" rx="1" className={bg} />
        <rect x="46" y="48" width="28" height="5" rx="1" className={bar} />
      </svg>
    )
  }

  if (style === "split") {
    // 50/50 split: branded left, form right
    return (
      <svg viewBox="0 0 120 56" className="h-10 w-full">
        {/* Left branded panel */}
        <rect x="0" y="0" width="58" height="56" rx="2" className={bar} />
        <rect x="8" y="14" width="30" height="5" rx="1" fill="white" />
        <rect x="8" y="24" width="38" height="3" rx="0.5" fill="white" opacity="0.5" />
        <rect x="8" y="30" width="28" height="3" rx="0.5" fill="white" opacity="0.5" />
        {/* Right form panel */}
        <rect x="62" y="8" width="24" height="4" rx="1" className={bar} />
        <rect x="62" y="16" width="52" height="6" rx="1" className={bg} />
        <rect x="62" y="25" width="52" height="6" rx="1" className={bg} />
        <rect x="62" y="34" width="52" height="10" rx="1" className={bg} />
        <rect x="62" y="48" width="22" height="5" rx="1" className={bar} />
      </svg>
    )
  }

  // minimal
  return (
    <svg viewBox="0 0 120 56" className="h-10 w-full">
      <rect x="32" y="4" width="24" height="4" rx="1" className={bar} />
      <rect x="32" y="12" width="56" height="6" rx="1" className={bg} />
      <rect x="32" y="21" width="56" height="6" rx="1" className={bg} />
      <rect x="32" y="30" width="56" height="10" rx="1" className={bg} />
      <rect x="32" y="44" width="22" height="5" rx="1" className={bar} />
    </svg>
  )
}
