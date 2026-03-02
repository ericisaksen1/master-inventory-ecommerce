import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

// Magic bytes for image format validation
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/x-icon": [[0x00, 0x00, 0x01, 0x00], [0x00, 0x00, 0x02, 0x00]],
  "image/vnd.microsoft.icon": [[0x00, 0x00, 0x01, 0x00], [0x00, 0x00, 0x02, 0x00]],
}

function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false
  return signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  )
}

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico"])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use PNG, JPG, GIF, WebP, or ICO." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  // Validate file content matches claimed MIME type
  if (!validateMagicBytes(bytes, file.type)) {
    return NextResponse.json({ error: "File content does not match its type." }, { status: 400 })
  }

  const ext = path.extname(file.name).toLowerCase() || ".png"
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Invalid file extension." }, { status: 400 })
  }

  const filename = `${crypto.randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")

  await mkdir(uploadDir, { recursive: true })

  await writeFile(path.join(uploadDir, filename), bytes)

  const url = `/uploads/${filename}`

  const media = await prisma.media.create({
    data: {
      url,
      filename: file.name,
      alt: "",
      mimeType: file.type,
      size: file.size,
    },
  })

  return NextResponse.json({ url, mediaId: media.id })
}
