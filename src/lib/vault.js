// Se Fire Vault — local secure notes store with PIN lock.
// Notes live in localStorage under 'sfvault:notes'.
// The PIN is stored as a SHA-256 hash (with salt) under 'sfvault:pin'.
// Unlock state is session-only (never persisted).

const NOTES_KEY = 'sfvault:notes'
const PIN_KEY = 'sfvault:pin'
const SALT = 'sefire-vault-salt'

export const CATEGORIES = ['Personal', 'Work', 'Finance', 'Other']

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
}

export function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return true
  } catch {
    return false
  }
}

async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hasPin() {
  try {
    return !!localStorage.getItem(PIN_KEY)
  } catch {
    return false
  }
}

export async function setPin(pin) {
  const hash = await sha256(String(pin) + SALT)
  try {
    localStorage.setItem(PIN_KEY, hash)
    return true
  } catch {
    return false
  }
}

export async function verifyPin(pin) {
  const hash = await sha256(String(pin) + SALT)
  try {
    return localStorage.getItem(PIN_KEY) === hash
  } catch {
    return false
  }
}

export function clearVault() {
  try {
    localStorage.removeItem(PIN_KEY)
    localStorage.removeItem(NOTES_KEY)
    return true
  } catch {
    return false
  }
}

export { uid }
