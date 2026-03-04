import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46] // %PDF

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

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  if (!PDF_MAGIC.every((b, i) => bytes[i] === b)) {
    return NextResponse.json({ error: "File content does not match PDF format." }, { status: 400 })
  }

  const filename = `${crypto.randomUUID()}.pdf`
  const uploadDir = path.join(process.cwd(), "public", "uploads")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), bytes)

  const url = `/uploads/${filename}`

  return NextResponse.json({ url, filename: file.name })
}
