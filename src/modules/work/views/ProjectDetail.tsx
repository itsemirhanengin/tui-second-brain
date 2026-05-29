import { useWorkStore } from "../../../stores/useWorkStore"
import { Badge } from "../../../components/shared/Badge"
import { CurrencyDisplay } from "../../../components/shared/CurrencyDisplay"
import { StatsRow } from "../../../components/shared/StatsRow"
import { getCurrency } from "../../settings/settingsStore"
import { formatDuration, daysUntil } from "../../../utils/date"
import { getTasks, getTaskStatuses, PROGRESS_ICONS } from "../taskStore"
import { getTimeEntries, type Project } from "../workStore"

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const currency = getCurrency()
  const { getProjectTotalMinutes, getProjectBillable, getClientById } = useWorkStore()

  const totalMin = getProjectTotalMinutes(project.id)
  const billable = getProjectBillable(project.id)
  const entries = getTimeEntries(project.id, 10)
  const client = project.client_id ? getClientById(project.client_id) : null
  const daysLeft = project.deadline ? daysUntil(project.deadline) : null
  const projectTasks = getTasks(project.id)
  const statuses = getTaskStatuses()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg="#7aa2f7"><strong>{project.name}</strong></text>
        <Badge text={project.status} />
      </box>
      {project.description && <text fg="#e2e8f0">{project.description}</text>}
      <box style={{ flexDirection: "row", gap: 3 }}>
        {client && <text fg="#565f89">Client: {client.name}</text>}
        {project.deadline && (
          <text fg={daysLeft !== null && daysLeft < 0 ? "#e94560" : "#565f89"}>
            Deadline: {project.deadline} {daysLeft !== null ? `(${daysLeft}d)` : ""}
          </text>
        )}
      </box>

      <StatsRow stats={[
        { label: "Total Time", value: formatDuration(totalMin) },
        { label: "Billable", value: <CurrencyDisplay amount={billable} currency={currency} /> },
        { label: "Tasks", value: String(projectTasks.length) },
      ]} />

      {projectTasks.length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Tasks:</text>
          {projectTasks.slice(0, 10).map((task) => {
            const st = statuses.find((s) => s.id === task.status_id)
            return (
              <box key={task.id} style={{ flexDirection: "row", gap: 1 }}>
                {st && <text fg={st.color}>{PROGRESS_ICONS[st.progress]}</text>}
                <text fg={st?.progress === "full" ? "#414868" : "#e2e8f0"}>{task.title}</text>
                {st && <text fg={st.color}>{st.name}</text>}
              </box>
            )
          })}
          {projectTasks.length > 10 && <text fg="#414868">...and {projectTasks.length - 10} more</text>}
        </box>
      )}

      {entries.length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Recent Time Entries:</text>
          {entries.map((e) => (
            <box key={e.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg="#565f89">{e.start_time.substring(0, 16)}</text>
              <text fg="#e2e8f0">{e.duration_minutes ? formatDuration(e.duration_minutes) : "running"}</text>
              <text fg="#414868">{e.description || "—"}</text>
            </box>
          ))}
        </box>
      )}
      <text fg="#414868">ESC to go back</text>
    </box>
  )
}
