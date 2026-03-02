import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

interface AuthSuccess {
  site: {
    id: string
    name: string
    domain: string
  }
}

interface AuthError {
  error: string
  status: number
}

/**
 * Authenticate an API request using Bearer token from the Authorization header.
 * Returns the connected site on success, or an error object on failure.
 */
export async function authenticateApiKey(
  request: NextRequest
): Promise<AuthSuccess | AuthError> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 }
  }

  const apiKey = authHeader.slice(7)

  if (!apiKey) {
    return { error: "API key is required", status: 401 }
  }

  const site = await prisma.connectedSite.findUnique({
    where: { apiKey },
    select: { id: true, name: true, domain: true, isActive: true },
  })

  if (!site) {
    return { error: "Invalid API key", status: 401 }
  }

  if (!site.isActive) {
    return { error: "Site is deactivated", status: 403 }
  }

  return { site: { id: site.id, name: site.name, domain: site.domain } }
}
