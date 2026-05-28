import db from "../../../db/connection"
import { today, timeNow } from "../../../utils/date"

export interface WaterEntry {
  id: number
  amount_ml: number
  date: string
  time: string
  created_at: string
}

export interface WaterGoal {
  id: number
  daily_goal_ml: number
  effective_from: string
}

export function addWaterEntry(amount_ml: number): WaterEntry {
  const stmt = db.prepare("INSERT INTO water_entries (amount_ml, date, time) VALUES (?, ?, ?)")
  const result = stmt.run(amount_ml, today(), timeNow())
  return {
    id: Number(result.lastInsertRowid),
    amount_ml,
    date: today(),
    time: timeNow(),
    created_at: new Date().toISOString(),
  }
}

export function getTodayEntries(): WaterEntry[] {
  return db.query("SELECT * FROM water_entries WHERE date = ? ORDER BY time DESC").all(today()) as WaterEntry[]
}

export function getTodayTotal(): number {
  const row = db.query("SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_entries WHERE date = ?").get(today()) as { total: number }
  return row.total
}

export function getEntriesByDate(date: string): WaterEntry[] {
  return db.query("SELECT * FROM water_entries WHERE date = ? ORDER BY time DESC").all(date) as WaterEntry[]
}

export function getDailyTotals(days: number = 7): { date: string; total: number }[] {
  return db.query(`
    SELECT date, COALESCE(SUM(amount_ml), 0) as total
    FROM water_entries
    WHERE date >= date('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date DESC
  `).all(days) as { date: string; total: number }[]
}

export function deleteWaterEntry(id: number): void {
  db.run("DELETE FROM water_entries WHERE id = ?", [id])
}

export function getCurrentGoal(): number {
  const row = db.query("SELECT daily_goal_ml FROM water_goals ORDER BY effective_from DESC LIMIT 1").get() as WaterGoal | null
  return row?.daily_goal_ml ?? 2000
}

export function setGoal(daily_goal_ml: number): void {
  db.run("INSERT INTO water_goals (daily_goal_ml, effective_from) VALUES (?, date('now'))", [daily_goal_ml])
  db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('water_daily_goal', ?)", [String(daily_goal_ml)])
}

export function getStreak(): number {
  const goal = getCurrentGoal()
  const rows = db.query(`
    SELECT date, COALESCE(SUM(amount_ml), 0) as total
    FROM water_entries
    GROUP BY date
    ORDER BY date DESC
  `).all() as { date: string; total: number }[]

  let streak = 0
  const todayStr = today()
  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(todayStr)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split("T")[0]
    if (rows[i].date !== expectedStr || rows[i].total < goal) break
    streak++
  }
  return streak
}
