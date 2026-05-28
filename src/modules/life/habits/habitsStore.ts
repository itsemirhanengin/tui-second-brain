import db from "../../../db/connection"
import { today } from "../../../utils/date"

export interface Habit {
  id: number
  name: string
  category: string
  is_active: number
  created_at: string
}

export function getHabits(activeOnly = true): Habit[] {
  if (activeOnly) return db.query("SELECT * FROM habits WHERE is_active = 1 ORDER BY category, name").all() as Habit[]
  return db.query("SELECT * FROM habits ORDER BY category, name").all() as Habit[]
}

export function createHabit(name: string, category = ""): Habit {
  const result = db.prepare("INSERT INTO habits (name, category) VALUES (?, ?)").run(name, category)
  return db.query("SELECT * FROM habits WHERE id = ?").get(Number(result.lastInsertRowid)) as Habit
}

export function deleteHabit(id: number): void {
  db.run("DELETE FROM habit_logs WHERE habit_id = ?", [id])
  db.run("DELETE FROM habits WHERE id = ?", [id])
}

export function toggleHabitActive(id: number): void {
  db.run("UPDATE habits SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function logHabitToday(habitId: number): boolean {
  try {
    db.prepare("INSERT OR IGNORE INTO habit_logs (habit_id, date) VALUES (?, ?)").run(habitId, today())
    return true
  } catch {
    return false
  }
}

export function unlogHabitToday(habitId: number): void {
  db.run("DELETE FROM habit_logs WHERE habit_id = ? AND date = ?", [habitId, today()])
}

export function isHabitDoneToday(habitId: number): boolean {
  const row = db.query("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habitId, today())
  return row != null
}

export function getHabitHeatmap(habitId: number, weeks = 12): { date: string; done: boolean }[] {
  const results: { date: string; done: boolean }[] = []
  const d = new Date()
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = new Date(d)
    date.setDate(d.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const row = db.query("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habitId, dateStr)
    results.push({ date: dateStr, done: row != null })
  }
  return results
}

export function getHabitWeeklyRate(habitId: number, weeks = 4): number {
  const days = weeks * 7
  const row = db.query(
    "SELECT COUNT(*) as cnt FROM habit_logs WHERE habit_id = ? AND date >= date('now', '-' || ? || ' days')",
  ).get(habitId, days) as { cnt: number }
  return days > 0 ? Math.round((row.cnt / days) * 100) : 0
}

export function getHabitMonthlyRate(habitId: number): number {
  const row = db.query(
    "SELECT COUNT(*) as cnt FROM habit_logs WHERE habit_id = ? AND date >= date('now', '-30 days')",
  ).get(habitId) as { cnt: number }
  return Math.round((row.cnt / 30) * 100)
}

export function getHabitCategories(): string[] {
  const rows = db.query("SELECT DISTINCT category FROM habits WHERE category != '' ORDER BY category").all() as { category: string }[]
  return rows.map((r) => r.category)
}
