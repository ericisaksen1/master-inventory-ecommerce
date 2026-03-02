import { prisma } from "@/lib/prisma"
import { MediaGrid } from "./media-grid"

export const metadata = { title: "Media Library | Admin" }

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Media Library</h1>
      <div className="mt-6">
        <MediaGrid initialMedia={media} />
      </div>
    </div>
  )
}
