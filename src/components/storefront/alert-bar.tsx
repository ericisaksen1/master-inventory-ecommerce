import { getSettings } from "@/lib/settings"

export async function AlertBar() {
  const settings = await getSettings([
    "alert_bar_enabled",
    "alert_bar_content",
    "alert_bar_bg_color",
    "alert_bar_text_color",
  ])

  if (settings.alert_bar_enabled !== "true") return null

  const content = settings.alert_bar_content || ""
  if (!content || content.replace(/<[^>]*>/g, "").trim() === "") return null

  return (
    <div
      style={{
        backgroundColor: settings.alert_bar_bg_color || "#000000",
        color: settings.alert_bar_text_color || "#ffffff",
      }}
    >
      <div
        className="prose prose-sm max-w-none px-4 py-3 text-center [&_a]:text-current [&_a]:underline [&_p]:my-0"
        style={{ color: settings.alert_bar_text_color || "#ffffff" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
