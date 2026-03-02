"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images: { id: string; url: string; alt: string | null }[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        No images
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || "Product image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                index === selectedIndex
                  ? "border-primary"
                  : "border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || "Thumbnail"}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
