import { getUpcomingPayments } from "../modules/life/liabilities/liabilitiesStore"
import { getTodayRoutinesWithStatus } from "../modules/routines/routinesStore"
import { getProjects } from "../modules/work/workStore"
import { getCategoryBudgetSummaries } from "../modules/life/budget/budgetStore"
import { getUpcomingRecurring } from "../modules/life/budget/recurringStore"
import { getSetting } from "../modules/settings/settingsStore"
import { daysUntil, currentMonth, currentYear } from "./date"

export type NotificationSeverity = "danger" | "warning" | "info"
export type NotificationCategory = "payments" | "routines" | "deadlines" | "budget"

export interface AppNotification {
  id: string
  category: NotificationCategory
  severity: NotificationSeverity
  title: string
  detail: string
}

function isEnabled(category: NotificationCategory): boolean {
  const val = getSetting(`notifications_${category}`)
  return val !== "0"
}

export function getNotifications(): AppNotification[] {
  const notifications: AppNotification[] = []

  if (isEnabled("payments")) {
    const payments = getUpcomingPayments()
    for (const p of payments) {
      if (p.urgency === "overdue") {
        notifications.push({
          id: `pay-overdue-${p.type}-${p.liabilityId}`,
          category: "payments",
          severity: "danger",
          title: `Overdue: ${p.name}`,
          detail: `${p.amount.toFixed(0)} due ${p.dueDate}`,
        })
      } else if (p.daysLeft <= 3) {
        notifications.push({
          id: `pay-soon-${p.type}-${p.liabilityId}`,
          category: "payments",
          severity: "warning",
          title: `Due soon: ${p.name}`,
          detail: `${p.amount.toFixed(0)} in ${p.daysLeft}d`,
        })
      }
    }

    const upcoming = getUpcomingRecurring(3)
    for (const u of upcoming) {
      if (u.daysLeft <= 1) {
        notifications.push({
          id: `rec-${u.recurring.id}`,
          category: "payments",
          severity: "info",
          title: `Recurring ${u.daysLeft === 0 ? "today" : "tomorrow"}: ${u.recurring.name}`,
          detail: `${u.recurring.amount.toFixed(0)} ${u.recurring.type}`,
        })
      }
    }
  }

  if (isEnabled("routines")) {
    const routines = getTodayRoutinesWithStatus()
    const pending = routines.filter((r) => r.isDue && !r.log)
    if (pending.length > 0) {
      notifications.push({
        id: "routines-pending",
        category: "routines",
        severity: pending.length >= 3 ? "warning" : "info",
        title: `${pending.length} routine${pending.length > 1 ? "s" : ""} pending`,
        detail: pending.slice(0, 3).map((r) => r.routine.name).join(", "),
      })
    }
  }

  if (isEnabled("deadlines")) {
    const projects = getProjects("active")
    for (const p of projects) {
      if (!p.deadline) continue
      const days = daysUntil(p.deadline)
      if (days < 0) {
        notifications.push({
          id: `deadline-overdue-${p.id}`,
          category: "deadlines",
          severity: "danger",
          title: `Overdue: ${p.name}`,
          detail: `Deadline was ${p.deadline}`,
        })
      } else if (days <= 7) {
        notifications.push({
          id: `deadline-soon-${p.id}`,
          category: "deadlines",
          severity: days <= 2 ? "warning" : "info",
          title: `Deadline: ${p.name}`,
          detail: `${days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}`,
        })
      }
    }
  }

  if (isEnabled("budget")) {
    const month = currentMonth()
    const year = currentYear()
    const summaries = getCategoryBudgetSummaries(month, year)
    const overBudget = summaries.filter((s) => s.overLimit)
    if (overBudget.length > 0) {
      notifications.push({
        id: "budget-over",
        category: "budget",
        severity: "warning",
        title: `${overBudget.length} categor${overBudget.length > 1 ? "ies" : "y"} over budget`,
        detail: overBudget.slice(0, 3).map((s) => s.category.name).join(", "),
      })
    }
  }

  const severityOrder: Record<NotificationSeverity, number> = { danger: 0, warning: 1, info: 2 }
  notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return notifications
}

export function getNotificationCount(): number {
  return getNotifications().length
}
