import { getSetting, setSetting } from "../../modules/settings/settingsStore"

const STORAGE_KEY = "command_palette_recent"
const MAX_RECENT = 8

export function getRecentCommandIds(): string[] {
  const raw = getSetting(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordCommandUsage(commandId: string): void {
  const recent = getRecentCommandIds().filter((id) => id !== commandId)
  recent.unshift(commandId)
  setSetting(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}
