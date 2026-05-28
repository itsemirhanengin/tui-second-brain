import db from "../../db/connection"
import { today } from "../../utils/date"

export interface Routine {
  id: number
  name: string
  description: string
  frequency: string
  days_of_week: string
  time_of_day: string | null
  is_active: number
  streak_count: number
  best_streak: number
  created_at: string
}

export interface RoutineLog {
  id: number
  routine_id: number
  date: string
  status: string
  note: string
  completed_at: string | null
}

export function getRoutines(activeOnly: boolean = true): Routine[] {
  if (activeOnly) {
    return db.query("SELECT * FROM routines WHERE is_active = 1 ORDER BY name").all() as Routine[]
  }
  return db.query("SELECT * FROM routines ORDER BY name").all() as Routine[]
}

export function getRoutineById(id: number): Routine | null {
  return db.query("SELECT * FROM routines WHERE id = ?").get(id) as Routine | null
}

export function createRoutine(name: string, description: string, frequency: string, daysOfWeek: number[] = [], timeOfDay: string | null = null): Routine {
  const result = db.prepare("INSERT INTO routines (name, description, frequency, days_of_week, time_of_day) VALUES (?, ?, ?, ?, ?)").run(name, description, frequency, JSON.stringify(daysOfWeek), timeOfDay)
  return getRoutineById(Number(result.lastInsertRowid))!
}

export function updateRoutine(id: number, name: string, description: string, frequency: string, daysOfWeek: number[], timeOfDay: string | null): void {
  db.run("UPDATE routines SET name = ?, description = ?, frequency = ?, days_of_week = ?, time_of_day = ? WHERE id = ?", [name, description, frequency, JSON.stringify(daysOfWeek), timeOfDay, id])
}

export function toggleRoutineActive(id: number): void {
  db.run("UPDATE routines SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function deleteRoutine(id: number): void {
  db.run("DELETE FROM routines WHERE id = ?", [id])
}

// --- Logging ---

export function logRoutine(routineId: number, status: "completed" | "skipped" | "missed", note: string = ""): void {
  const completedAt = status === "completed" ? new Date().toISOString() : null
  db.run("INSERT INTO routine_logs (routine_id, date, status, note, completed_at) VALUES (?, ?, ?, ?, ?)", [routineId, today(), status, note, completedAt])

  if (status === "completed") {
    const routine = getRoutineById(routineId)
    if (routine) {
      const newStreak = routine.streak_count + 1
      const bestStreak = Math.max(newStreak, routine.best_streak)
      db.run("UPDATE routines SET streak_count = ?, best_streak = ? WHERE id = ?", [newStreak, bestStreak, routineId])
    }
  } else {
    db.run("UPDATE routines SET streak_count = 0 WHERE id = ?", [routineId])
  }
}

export function getTodayLogs(): RoutineLog[] {
  return db.query("SELECT * FROM routine_logs WHERE date = ? ORDER BY id").all(today()) as RoutineLog[]
}

export function getLogsByRoutine(routineId: number, limit: number = 30): RoutineLog[] {
  return db.query("SELECT * FROM routine_logs WHERE routine_id = ? ORDER BY date DESC LIMIT ?").all(routineId, limit) as RoutineLog[]
}

export function getLogByRoutineAndDate(routineId: number, date: string): RoutineLog | null {
  return db.query("SELECT * FROM routine_logs WHERE routine_id = ? AND date = ?").get(routineId, date) as RoutineLog | null
}

export function isTodayDueForRoutine(routine: Routine): boolean {
  const now = new Date()
  const dayOfWeek = now.getDay()

  switch (routine.frequency) {
    case "daily":
      return true
    case "weekly": {
      const days: number[] = JSON.parse(routine.days_of_week)
      return days.includes(dayOfWeek)
    }
    case "monthly": {
      const days: number[] = JSON.parse(routine.days_of_week)
      return days.includes(now.getDate())
    }
    default:
      return true
  }
}

export function getTodayRoutinesWithStatus(): { routine: Routine; log: RoutineLog | null; isDue: boolean }[] {
  const routines = getRoutines(true)
  const todayLogs = getTodayLogs()
  const logMap = new Map<number, RoutineLog>()
  for (const log of todayLogs) logMap.set(log.routine_id, log)

  return routines.map((routine) => ({
    routine,
    log: logMap.get(routine.id) ?? null,
    isDue: isTodayDueForRoutine(routine),
  }))
}

export function getCompletionRate(routineId: number, days: number = 30): number {
  const row = db.query(`
    SELECT
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(*) as total
    FROM routine_logs
    WHERE routine_id = ? AND date >= date('now', '-' || ? || ' days')
  `).get(routineId, days) as { completed: number; total: number }
  if (row.total === 0) return 0
  return Math.round((row.completed / row.total) * 100)
}

export function getWeeklyCompletionGrid(weeks = 8): { grid: number[][]; dates: string[] } {
  const grid: number[][] = []
  const dates: string[] = []
  const today = new Date()
  const dayOfWeek = today.getDay()

  for (let w = weeks - 1; w >= 0; w--) {
    const row: number[] = []
    for (let d = 0; d < 7; d++) {
      const offset = w * 7 + (dayOfWeek - d)
      const date = new Date(today)
      date.setDate(today.getDate() - offset)
      const dateStr = date.toISOString().split("T")[0]
      if (w === 0 && d === 0) dates.push(dateStr)
      const logs = db.query(
        "SELECT COUNT(CASE WHEN status = 'completed' THEN 1 END) as c FROM routine_logs WHERE date = ?",
      ).get(dateStr) as { c: number }
      row.push(logs.c)
    }
    grid.push(row)
  }
  return { grid, dates }
}
