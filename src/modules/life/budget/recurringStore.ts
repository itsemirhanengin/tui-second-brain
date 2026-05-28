import db from "../../../db/connection"
import { createTransaction } from "./budgetStore"
import { today } from "../../../utils/date"
import { getCurrency } from "../../settings/settingsStore"

export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly"

export interface RecurringTransaction {
  id: number
  name: string
  type: "income" | "expense"
  amount: number
  currency: string
  category_id: number | null
  account_id: number
  frequency: RecurringFrequency
  day_of_month: number | null
  day_of_week: number | null
  start_date: string
  end_date: string | null
  is_active: number
  last_generated: string | null
  created_at: string
}

export function getRecurringTransactions(activeOnly = false): RecurringTransaction[] {
  if (activeOnly) {
    return db.query("SELECT * FROM recurring_transactions WHERE is_active = 1 ORDER BY name").all() as RecurringTransaction[]
  }
  return db.query("SELECT * FROM recurring_transactions ORDER BY is_active DESC, name").all() as RecurringTransaction[]
}

export function getRecurringById(id: number): RecurringTransaction | null {
  return db.query("SELECT * FROM recurring_transactions WHERE id = ?").get(id) as RecurringTransaction | null
}

export function createRecurring(
  name: string,
  type: "income" | "expense",
  amount: number,
  categoryId: number | null,
  accountId: number,
  frequency: RecurringFrequency,
  dayOfMonth: number | null,
  dayOfWeek: number | null,
  startDate: string = today(),
  endDate: string | null = null,
): RecurringTransaction {
  const currency = getCurrency()
  const result = db.prepare(
    `INSERT INTO recurring_transactions (name, type, amount, currency, category_id, account_id, frequency, day_of_month, day_of_week, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(name, type, amount, currency, categoryId, accountId, frequency, dayOfMonth, dayOfWeek, startDate, endDate)
  return getRecurringById(Number(result.lastInsertRowid))!
}

export function updateRecurring(
  id: number,
  name: string,
  type: "income" | "expense",
  amount: number,
  categoryId: number | null,
  accountId: number,
  frequency: RecurringFrequency,
  dayOfMonth: number | null,
  dayOfWeek: number | null,
  endDate: string | null,
): void {
  db.run(
    `UPDATE recurring_transactions SET name=?, type=?, amount=?, category_id=?, account_id=?, frequency=?, day_of_month=?, day_of_week=?, end_date=? WHERE id=?`,
    [name, type, amount, categoryId, accountId, frequency, dayOfMonth, dayOfWeek, endDate, id],
  )
}

export function toggleRecurringActive(id: number): void {
  db.run("UPDATE recurring_transactions SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function deleteRecurring(id: number): void {
  db.run("DELETE FROM recurring_transactions WHERE id = ?", [id])
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split("T")[0]
}

function getNextOccurrence(rec: RecurringTransaction, after: string): string | null {
  const afterDate = new Date(after)
  const startDate = new Date(rec.start_date)

  if (rec.end_date && new Date(rec.end_date) < afterDate) return null

  let candidate: Date

  switch (rec.frequency) {
    case "daily": {
      candidate = new Date(afterDate)
      candidate.setDate(candidate.getDate() + 1)
      break
    }
    case "weekly": {
      candidate = new Date(afterDate)
      candidate.setDate(candidate.getDate() + 1)
      const targetDay = rec.day_of_week ?? 1
      while (candidate.getDay() !== targetDay) {
        candidate.setDate(candidate.getDate() + 1)
      }
      break
    }
    case "biweekly": {
      candidate = new Date(afterDate)
      candidate.setDate(candidate.getDate() + 1)
      const biTarget = rec.day_of_week ?? 1
      while (candidate.getDay() !== biTarget) {
        candidate.setDate(candidate.getDate() + 1)
      }
      const weeksSinceStart = Math.floor((candidate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksSinceStart % 2 !== 0) {
        candidate.setDate(candidate.getDate() + 7)
      }
      break
    }
    case "monthly": {
      const dom = rec.day_of_month ?? 1
      candidate = new Date(afterDate.getFullYear(), afterDate.getMonth(), dom)
      if (candidate <= afterDate) {
        candidate = new Date(afterDate.getFullYear(), afterDate.getMonth() + 1, dom)
      }
      break
    }
    case "yearly": {
      const ydom = rec.day_of_month ?? startDate.getDate()
      const ymonth = startDate.getMonth()
      candidate = new Date(afterDate.getFullYear(), ymonth, ydom)
      if (candidate <= afterDate) {
        candidate = new Date(afterDate.getFullYear() + 1, ymonth, ydom)
      }
      break
    }
    default:
      return null
  }

  if (candidate < startDate) return null
  if (rec.end_date && candidate > new Date(rec.end_date)) return null

  return candidate.toISOString().split("T")[0]
}

function getDatesInRange(rec: RecurringTransaction, fromDate: string, toDate: string): string[] {
  const dates: string[] = []
  const end = new Date(toDate)
  let current = fromDate

  const before = new Date(current)
  before.setDate(before.getDate() - 1)
  current = before.toISOString().split("T")[0]

  for (let i = 0; i < 400; i++) {
    const next = getNextOccurrence(rec, current)
    if (!next) break
    if (new Date(next) > end) break
    dates.push(next)
    current = next
  }

  return dates
}

export function processRecurringTransactions(): number {
  const active = getRecurringTransactions(true)
  const todayStr = today()
  let generated = 0

  for (const rec of active) {
    if (rec.end_date && rec.end_date < todayStr) {
      db.run("UPDATE recurring_transactions SET is_active = 0 WHERE id = ?", [rec.id])
      continue
    }

    const fromDate = rec.last_generated ?? rec.start_date
    const dates = getDatesInRange(rec, fromDate, todayStr)

    for (const date of dates) {
      if (date <= (rec.last_generated ?? "")) continue

      createTransaction(
        rec.type,
        rec.amount,
        `[Recurring] ${rec.name}`,
        rec.category_id,
        rec.account_id,
        null,
        date,
        rec.currency,
      )
      generated++
    }

    if (dates.length > 0) {
      const lastDate = dates[dates.length - 1]
      db.run("UPDATE recurring_transactions SET last_generated = ? WHERE id = ?", [lastDate, rec.id])
    }
  }

  return generated
}

export interface UpcomingRecurring {
  recurring: RecurringTransaction
  nextDate: string
  daysLeft: number
}

export function getUpcomingRecurring(limit = 5): UpcomingRecurring[] {
  const active = getRecurringTransactions(true)
  const todayStr = today()
  const todayDate = new Date(todayStr)

  const upcoming: UpcomingRecurring[] = []

  for (const rec of active) {
    const ref = rec.last_generated ?? new Date(new Date(rec.start_date).getTime() - 86400000).toISOString().split("T")[0]
    const nextDate = getNextOccurrence(rec, ref)
    if (!nextDate) continue

    const daysLeft = Math.ceil((new Date(nextDate).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
    upcoming.push({ recurring: rec, nextDate, daysLeft })
  }

  upcoming.sort((a, b) => a.daysLeft - b.daysLeft)
  return upcoming.slice(0, limit)
}
