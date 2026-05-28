import { useState, useEffect } from "react"
import { ProgressBar } from "../../components/shared/ProgressBar"
import { CurrencyDisplay } from "../../components/shared/CurrencyDisplay"
import { Badge } from "../../components/shared/Badge"
import { getTodayTotal, getCurrentGoal, getStreak } from "../life/water/waterStore"
import { getTodayRoutinesWithStatus } from "../routines/routinesStore"
import { getMonthlyIncome, getMonthlyExpense, getTotalBalance } from "../life/budget/budgetStore"
import { getUpcomingPayments } from "../life/liabilities/liabilitiesStore"
import { getRunningTimer, getTodayTotalMinutes, getProjects } from "../work/workStore"
import { getAllNotes } from "../life/notes/notesStore"
import { getCurrency } from "../settings/settingsStore"
import { formatCurrency } from "../../utils/currency"
import { formatDuration, currentMonth, currentYear, getMonthName } from "../../utils/date"

export function Dashboard() {
  const currency = getCurrency()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7">
        <strong>Dashboard</strong>
        <span fg="#565f89"> — {getMonthName(month)} {year}</span>
      </text>

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

      <text fg="#414868">D:Dashboard L:Life R:Routines W:Work S:Settings</text>
    </box>
  )
}
