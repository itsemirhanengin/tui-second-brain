import db from "../../db/connection"

export function getSetting(key: string): string | null {
  const row = db.query("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | null
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value])
}

export function getAllSettings(): Record<string, string> {
  const rows = db.query("SELECT key, value FROM settings").all() as { key: string; value: string }[]
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}

export function getCurrency(): string {
  return getSetting("currency") ?? "TRY"
}

export function getWaterGoal(): number {
  return Number(getSetting("water_daily_goal") ?? "2000")
}

export function getDateFormat(): string {
  return getSetting("date_format") ?? "YYYY-MM-DD"
}

export function getTimeFormat(): string {
  return getSetting("time_format") ?? "24h"
}
