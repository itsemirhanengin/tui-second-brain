export function today(): string {
  return new Date().toISOString().split("T")[0]
}

export function now(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19)
}

export function timeNow(): string {
  return new Date().toTimeString().substring(0, 8)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const current = new Date(today())
  return Math.ceil((target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export function getMonthName(month: number): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months[month - 1] ?? ""
}

export function currentMonth(): number {
  return new Date().getMonth() + 1
}

export function currentYear(): number {
  return new Date().getFullYear()
}

export function dayOfMonth(): number {
  return new Date().getDate()
}

export function nextPaymentDate(dayOfMonth: number): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  let next = new Date(year, month, dayOfMonth)
  if (next <= now) {
    next = new Date(year, month + 1, dayOfMonth)
  }
  return next.toISOString().split("T")[0]
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
