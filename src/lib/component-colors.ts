import type { CSSProperties } from "react"

export interface ComponentColorProps {
  bgColor?: string
  headlineColor?: string
  textColor?: string
  buttonColor?: string
  buttonTextColor?: string
  buttonHoverColor?: string
  buttonHoverTextColor?: string
  linkColor?: string
  linkHoverColor?: string
}

function autoContrast(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

export function sectionColorStyle(colors: ComponentColorProps): CSSProperties | undefined {
  const style: Record<string, string> = {}
  if (colors.bgColor) style.backgroundColor = colors.bgColor
  if (colors.buttonColor) {
    style["--color-button-bg"] = colors.buttonColor
    style["--color-button-border"] = colors.buttonColor
    style["--color-product-btn-bg"] = colors.buttonColor
    style["--color-product-btn-border"] = colors.buttonColor
    // Use explicit text color if provided, otherwise auto-contrast
    const textColor = colors.buttonTextColor || autoContrast(colors.buttonColor)
    style["--color-button-text"] = textColor
    style["--color-product-btn-text"] = textColor
  }
  if (colors.buttonTextColor && !colors.buttonColor) {
    style["--color-button-text"] = colors.buttonTextColor
    style["--color-product-btn-text"] = colors.buttonTextColor
  }
  if (colors.buttonHoverColor) {
    style["--color-button-hover-bg"] = colors.buttonHoverColor
    style["--color-product-btn-hover-bg"] = colors.buttonHoverColor
    const hoverTextColor = colors.buttonHoverTextColor || autoContrast(colors.buttonHoverColor)
    style["--color-button-hover-text"] = hoverTextColor
    style["--color-product-btn-hover-text"] = hoverTextColor
  }
  if (colors.buttonHoverTextColor && !colors.buttonHoverColor) {
    style["--color-button-hover-text"] = colors.buttonHoverTextColor
    style["--color-product-btn-hover-text"] = colors.buttonHoverTextColor
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined
}

export function headlineColorStyle(color?: string): CSSProperties | undefined {
  return color ? { color } : undefined
}

export function textColorStyle(color?: string): CSSProperties | undefined {
  return color ? { color } : undefined
}

export function linkColorProps(
  linkColor?: string,
  linkHoverColor?: string,
): Record<string, any> {
  const result: Record<string, any> = {}
  const style: Record<string, string> = {}

  if (linkColor) {
    style.color = linkColor
    style.borderColor = linkColor
  }
  if (linkHoverColor) {
    style["--link-hover-color"] = linkHoverColor
    result["data-link-hover"] = ""
  }

  if (Object.keys(style).length > 0) result.style = style
  return result
}
