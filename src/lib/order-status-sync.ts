import { prisma } from "@/lib/prisma"

/**
 * Notify a connected site that a drop-ship order's status has changed.
 * Fire-and-forget — failures are logged but don't block the caller.
 */
export async function syncStatusToConnectedSite(
  siteId: string,
  sourceOrderNumber: string,
  status: string
) {
  try {
    const site = await prisma.connectedSite.findUnique({
      where: { id: siteId },
      select: { domain: true, apiKey: true, isActive: true },
    })

    if (!site || !site.isActive) return

    const url = `${site.domain}/api/order-status-sync`
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${site.apiKey}`,
      },
      body: JSON.stringify({
        orderNumber: sourceOrderNumber,
        status,
      }),
    })
  } catch (err) {
    console.error(`[order-status-sync] Failed to sync status to site ${siteId}:`, err)
  }
}
