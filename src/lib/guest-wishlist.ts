const STORAGE_KEY = "guest_wishlist"

function getIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function isGuestWishlisted(productId: string): boolean {
  return getIds().includes(productId)
}

export function toggleGuestWishlist(productId: string): boolean {
  const ids = getIds()
  const index = ids.indexOf(productId)
  if (index >= 0) {
    ids.splice(index, 1)
    saveIds(ids)
    return false
  } else {
    ids.push(productId)
    saveIds(ids)
    return true
  }
}

export function getGuestWishlistIds(): string[] {
  return getIds()
}

export function clearGuestWishlist() {
  localStorage.removeItem(STORAGE_KEY)
}
