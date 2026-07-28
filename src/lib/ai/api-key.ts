const SESSION_KEY = 'growthlab:byok-api-key'
let inMemoryApiKey = ''

function sessionStorageOrNull(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

export function setApiKey(apiKey: string): void {
  inMemoryApiKey = apiKey.trim()
  const storage = sessionStorageOrNull()
  try {
    if (inMemoryApiKey) storage?.setItem(SESSION_KEY, inMemoryApiKey)
    else storage?.removeItem(SESSION_KEY)
  } catch {
    // The in-memory copy remains usable when storage is unavailable or full.
  }
}

export function getApiKey(): string {
  if (inMemoryApiKey) return inMemoryApiKey
  const storage = sessionStorageOrNull()
  try {
    inMemoryApiKey = storage?.getItem(SESSION_KEY)?.trim() ?? ''
  } catch {
    inMemoryApiKey = ''
  }
  return inMemoryApiKey
}

export function clearApiKey(): void {
  inMemoryApiKey = ''
  try {
    sessionStorageOrNull()?.removeItem(SESSION_KEY)
  } catch {
    // Clearing the in-memory copy is sufficient for the current page.
  }
}

