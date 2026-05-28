import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { ProgressBar } from "../../components/shared/ProgressBar"
import { CurrencyDisplay } from "../../components/shared/CurrencyDisplay"
import { Badge } from "../../components/shared/Badge"
import { getTodayTotal, getCurrentGoal, getStreak } from "../life/water/waterStore"
import { getTodayRoutinesWithStatus } from "../routines/routinesStore"
import { getMonthlyIncome, getMonthlyExpense, getTotalBalance } from "../life/budget/budgetStore"
import { getUpcomingPayments } from "../life/liabilities/liabilitiesStore"
import { getUpcomingRecurring } from "../life/budget/recurringStore"
import { getRunningTimer, getTodayTotalMinutes, getProjects } from "../work/workStore"
import { getTasks } from "../work/taskStore"
import { getAllNotes } from "../life/notes/notesStore"
import { getCurrency } from "../settings/settingsStore"
import { formatCurrency } from "../../utils/currency"
import { formatDuration, currentMonth, currentYear, getMonthName, addDays, today } from "../../utils/date"
import { getNotifications, type AppNotification } from "../../utils/notifications"

interface AgendaItem {
  date: string
  label: string
  detail: string
  color: string
  source: string
}

function buildAgenda(dayOffset: number): AgendaItem[] {
  const items: AgendaItem[] = []
  const targetDate = addDays(today(), dayOffset)

  const payments = getUpcomingPayments()
  for (const p of payments) {
    if (p.dueDate === targetDate) {
      items.push({ date: p.dueDate, label: p.name, detail: `Payment due`, color: "#e94560", source: "budget" })
    }
  }

  const recurring = getUpcomingRecurring(20)
  for (const r of recurring) {
    if (r.nextDate === targetDate) {
      items.push({ date: r.nextDate, label: r.recurring.name, detail: `Recurring ${r.recurring.type}`, color: "#e94560", source: "budget" })
    }
  }

  const tasks = getTasks()
  for (const t of tasks) {
    if (t.due_date === targetDate) {
      items.push({ date: t.due_date!, label: t.title, detail: "Task due", color: "#7aa2f7", source: "work" })
    }
  }

  const projects = getProjects("active")
  for (const p of projects) {
    if (p.deadline === targetDate) {
      items.push({ date: p.deadline!, label: p.name, detail: "Project deadline", color: "#7aa2f7", source: "work" })
    }
  }

  if (dayOffset === 0) {
    const routines = getTodayRoutinesWithStatus()
    for (const r of routines) {
      if (r.isDue && !r.log) {
        items.push({ date: targetDate, label: r.routine.name, detail: "Routine pending", color: "#bb9af7", source: "routines" })
      }
    }
  }

  return items
}

export function Dashboard() {
  const currency = getCurrency()
  const [tick, setTick] = useState(0)
  const [agendaOffset, setAgendaOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  useKeyboard((key) => {
    if (key.name === "left") setAgendaOffset((o) => o - 1)
    if (key.name === "right") setAgendaOffset((o) => o + 1)
    if (key.name === "return") setAgendaOffset(0)
  })

  const waterTotal = getTodayTotal()
  const waterGoal = getCurrentGoal()
  const waterStreak = getStreak()

  const routines = getTodayRoutinesWithStatus()
  const completedRoutines = routines.filter((r) => r.log?.status === "completed").length
  const dueRoutines = routines.filter((r) => r.isDue).length

  const month = currentMonth()
  const year = currentYear()
  const income = getMonthlyIncome(month, year)
  const expense = getMonthlyExpense(month, year)
  const balance = getTotalBalance()

  const upcoming = getUpcomingPayments().slice(0, 5)

  const timer = getRunningTimer()
  const todayWorkMin = getTodayTotalMinutes()
  const timerElapsed = timer ? Math.round((Date.now() - new Date(timer.start_time).getTime()) / 60000) : 0

  const recentNotes = getAllNotes().slice(0, 3)
  const activeProjects = getProjects("active")

  const urgencyColor: Record<string, string> = { green: "#16c79a", yellow: "#f39c12", red: "#e94560", overdue: "#e94560" }
  const notifications = getNotifications()

  const severityColors: Record<string, string> = { danger: "#e94560", warning: "#f39c12", info: "#3498db" }
  const severityIcons: Record<string, string> = { danger: "!", warning: "~", info: "i" }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7">
        <strong>Dashboard</strong>
        <span fg="#565f89"> — {getMonthName(month)} {year}</span>
      </text>

      {notifications.length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#e94560", padding: 1 }}>
          <text fg="#e94560"><strong>Today's Briefing</strong> <span fg="#565f89">({notifications.length} item{notifications.length > 1 ? "s" : ""})</span></text>
          {notifications.slice(0, 6).map((n) => (
            <box key={n.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={severityColors[n.severity]}>[{severityIcons[n.severity]}]</text>
              <text fg="#e2e8f0">{n.title}</text>
              <text fg="#565f89">{n.detail}</text>
            </box>
          ))}
          {notifications.length > 6 && <text fg="#414868">...and {notifications.length - 6} more</text>}
        </box>
      )}

      <box style={{ flexDirection: "row", gap: 2 }}>
        {/* Water */}
        <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#292e42", padding: 1, width: "33%" }}>
          <text fg="#3498db"><strong>Water</strong></text>
          <text fg="#e2e8f0">
            {waterTotal}ml / {waterGoal}ml
          </text>
          <ProgressBar current={waterTotal} max={waterGoal} width={15} filledColor="#3498db" showPercentage={false} />
          <text fg="#bb9af7">Streak: {waterStreak}d</text>
        </box>

        {/* Routines */}
        <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#292e42", padding: 1, width: "33%" }}>
          <text fg="#bb9af7"><strong>Routines</strong></text>
          <text fg="#e2e8f0">
            {completedRoutines}/{dueRoutines} completed
          </text>
          <ProgressBar current={completedRoutines} max={Math.max(dueRoutines, 1)} width={15} filledColor="#bb9af7" showPercentage={false} />
        </box>

        {/* Budget */}
        <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#292e42", padding: 1, width: "33%" }}>
          <text fg="#16c79a"><strong>Budget</strong></text>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">In:</text>
            <text fg="#16c79a">{formatCurrency(income, currency)}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">Out:</text>
            <text fg="#e94560">{formatCurrency(expense, currency)}</text>
          </box>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">Net:</text>
            <CurrencyDisplay amount={income - expense} currency={currency} colorize />
          </box>
        </box>
      </box>

      {/* Timer */}
      {timer && (
        <box style={{ borderStyle: "rounded", borderColor: "#f39c12", padding: 1 }}>
          <text fg="#f39c12">
            Timer Running: {formatDuration(timerElapsed)} — {timer.description || "No description"} | Today: {formatDuration(todayWorkMin)}
          </text>
        </box>
      )}

      <box style={{ flexDirection: "row", gap: 2 }}>
        {/* Upcoming Payments */}
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, flexGrow: 1 }}>
          <text fg="#e94560"><strong>Upcoming Payments</strong></text>
          {upcoming.length === 0 ? (
            <text fg="#414868">No upcoming payments</text>
          ) : (
            upcoming.map((p) => (
              <box key={`${p.type}-${p.liabilityId}`} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={urgencyColor[p.urgency]}>{p.dueDate}</text>
                <text fg="#e2e8f0">{p.name}</text>
                <text fg="#e2e8f0">{formatCurrency(p.amount, currency)}</text>
                {p.urgency === "overdue" ? <Badge text="OVERDUE" /> : <text fg={urgencyColor[p.urgency]}>{p.daysLeft}d</text>}
              </box>
            ))
          )}
        </box>

        {/* Active Projects */}
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, flexGrow: 1 }}>
          <text fg="#7aa2f7"><strong>Active Projects</strong></text>
          {activeProjects.length === 0 ? (
            <text fg="#414868">No active projects</text>
          ) : (
            activeProjects.slice(0, 5).map((p) => (
              <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#e2e8f0">{p.name}</text>
                {p.deadline && <text fg="#565f89">Due: {p.deadline}</text>}
              </box>
            ))
          )}
        </box>
      </box>

      {/* Recent Notes */}
      <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
        <text fg="#bb9af7"><strong>Recent Notes</strong></text>
        {recentNotes.length === 0 ? (
          <text fg="#414868">No notes yet</text>
        ) : (
          recentNotes.map((n) => (
            <box key={n.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg="#e2e8f0">{n.is_locked ? "🔒 " : ""}{n.title}</text>
              {n.tags && <text fg="#414868">[{n.tags}]</text>}
              <text fg="#565f89">{n.updated_at.substring(0, 10)}</text>
            </box>
          ))
        )}
      </box>

      {(() => {
        const agendaDate = addDays(today(), agendaOffset)
        const dayName = new Date(agendaDate).toLocaleDateString("en-US", { weekday: "long" })
        const label = agendaOffset === 0 ? "Today" : agendaOffset === 1 ? "Tomorrow" : agendaOffset === -1 ? "Yesterday" : dayName
        const items = buildAgenda(agendaOffset)
        const sourceColors: Record<string, string> = { budget: "#e94560", work: "#7aa2f7", routines: "#bb9af7" }

        return (
          <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
            <box style={{ flexDirection: "row", gap: 2 }}>
              <text fg="#7aa2f7"><strong>Agenda</strong></text>
              <text fg="#e2e8f0">{label} — {agendaDate}</text>
              <text fg="#414868">[Left/Right] Navigate [Enter] Today</text>
            </box>
            {items.length === 0 ? (
              <text fg="#414868">Nothing scheduled</text>
            ) : (
              items.map((item, i) => (
                <box key={i} style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={sourceColors[item.source] ?? "#565f89"}>●</text>
                  <text fg="#e2e8f0">{item.label}</text>
                  <text fg="#565f89">{item.detail}</text>
                </box>
              ))
            )}
          </box>
        )
      })()}

      <text fg="#414868">Shift+1..5: Switch modules | Tab: Switch sub-modules | ?: Help</text>
    </box>
  )
}
