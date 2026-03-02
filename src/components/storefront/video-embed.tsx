import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface VideoEmbedProps extends ComponentColorProps {
  heading: string
  description: string
  videoUrl: string
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
  )
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}

export function VideoEmbed({ heading, description, videoUrl, bgColor, headlineColor, textColor }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(videoUrl)
  if (!embedUrl) return null

  return (
    <section style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
      {heading && (
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
      )}
      {description && (
        <p className={`${heading ? "mt-3" : ""} mx-auto max-w-xl text-center text-gray-600 dark:text-gray-400`} style={textColorStyle(textColor)}>
          {description}
        </p>
      )}
      <div className={`${heading || description ? "mt-8" : ""} mx-auto max-w-4xl`}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <iframe
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={heading || "Video"}
          />
        </div>
      </div>
      </div>
    </section>
  )
}
