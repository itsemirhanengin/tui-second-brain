import { useWorkStore } from "../../../stores/useWorkStore"
import { useRunningTimer } from "../../../hooks/useRunningTimer"
import { CurrencyDisplay } from "../../../components/shared/CurrencyDisplay"
import { RunningTimerBanner } from "../../../components/shared/RunningTimerBanner"
import { StatsRow } from "../../../components/shared/StatsRow"
import { WorkHoursChart } from "../../../components/shared/WorkHoursChart"
import { getCurrency } from "../../settings/settingsStore"
import { formatDuration, daysUntil } from "../../../utils/date"
import { getTasks, getTaskStatuses, getTaskCountByStatus, PROGRESS_ICONS } from "../taskStore"

export function WorkDashboard() {
  const currency = getCurrency()
  const { projects, clients, getProjectTotalMinutes, getProjectBillable, getClientById, getTodayTotalMinutes, getWeekTotalMinutes, getDailyWorkMinutes } = useWorkStore()
  const { runningTimer, elapsed } = useRunningTimer()

  const todayMin = getTodayTotalMinutes()
  const weekMin = getWeekTotalMinutes()
  const activeProjects = projects.filter((p) => p.status === "active")
  const allTasksList = getTasks()
  const statuses = getTaskStatuses()
  const taskCountMap = getTaskCountByStatus()
  const totalTasks = allTasksList.length
  const doneTasks = statuses.filter((s) => s.progress === "full").reduce((sum, s) => sum + (taskCountMap.get(s.id) ?? 0), 0)
  const inProgressTasks = statuses.filter((s) => s.progress === "half" || s.progress === "quarter" || s.progress === "three_quarter").reduce((sum, s) => sum + (taskCountMap.get(s.id) ?? 0), 0)
  const daily = getDailyWorkMinutes(7)

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Work Overview</strong></text>

      {runningTimer && (
        <RunningTimerBanner elapsed={elapsed} description={runningTimer.description} compact />
      )}

      <StatsRow stats={[
        { label: "Today", value: formatDuration(todayMin) },
        { label: "This Week", value: formatDuration(weekMin) },
        { label: "Projects", value: `${activeProjects.length} active` },
        { label: "Clients", value: String(clients.filter((c) => c.is_active).length) },
      ]} />

      <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Total Tasks</text>
          <text fg="#e2e8f0">{totalTasks}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">In Progress</text>
          <text fg="#f39c12">{inProgressTasks}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Done</text>
          <text fg="#16c79a">{doneTasks}</text>
        </box>
        {statuses.map((s) => {
          const cnt = taskCountMap.get(s.id) ?? 0
          if (cnt === 0) return null
          return (
            <box key={s.id} style={{ flexDirection: "column" }}>
              <text fg="#565f89">{PROGRESS_ICONS[s.progress]} {s.name}</text>
              <text fg={s.color}>{cnt}</text>
            </box>
          )
        })}
      </box>

      <WorkHoursChart data={daily} />

      {activeProjects.length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Active Projects:</text>
          {activeProjects.map((p) => {
            const totalMin = getProjectTotalMinutes(p.id)
            const billable = getProjectBillable(p.id)
            const client = p.client_id ? getClientById(p.client_id) : null
            const pTasks = getTasks(p.id)
            return (
              <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#e2e8f0">{p.name}</text>
                {client && <text fg="#414868">({client.name})</text>}
                <text fg="#565f89">{formatDuration(totalMin)}</text>
                {billable > 0 && <CurrencyDisplay amount={billable} currency={currency} />}
                <text fg="#414868">{pTasks.length} tasks</text>
                {p.deadline && (
                  <text fg={daysUntil(p.deadline) < 0 ? "#e94560" : "#565f89"}>
                    Due: {p.deadline}
                  </text>
                )}
              </box>
            )
          })}
        </box>
      )}
    </box>
  )
}
