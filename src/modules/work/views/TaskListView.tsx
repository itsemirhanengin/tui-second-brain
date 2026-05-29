import { useRunningTimer } from "../../../hooks/useRunningTimer"
import { EmptyState } from "../../../components/shared/EmptyState"
import { formatDuration } from "../../../utils/date"
import { PROGRESS_ICONS, PRIORITY_ICONS, type Task, type TaskStatus } from "../taskStore"
import { getTaskPomodoroCount } from "../pomodoroStore"
import type { Project } from "../workStore"

interface TaskListViewProps {
  tasks: Task[]
  statuses: TaskStatus[]
  projects: Project[]
  selectedIndex: number
  filterProjectId: number | null
  subtaskCounts: Map<number, { total: number; completed: number }>
}

export function TaskListView({ tasks, statuses, projects, selectedIndex, filterProjectId, subtaskCounts }: TaskListViewProps) {
  const { runningTimer, elapsed } = useRunningTimer()
  const filterLabel = filterProjectId ? projects.find((p) => p.id === filterProjectId)?.name ?? "All" : "All Projects"

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Tasks</strong></text>
        <text fg="#bb9af7">[{filterLabel}]</text>
        {runningTimer && <text fg="#f39c12">Timer: {formatDuration(elapsed)} ({runningTimer.description})</text>}
      </box>
      <text fg="#565f89">[N] New [Enter] Detail [E] Edit [S] Subtask [K] Kanban [M] Statuses [X] Del [P] Priority [F] Filter [T] Timer [O] Pomodoro</text>
      {tasks.length === 0 ? <EmptyState message="No tasks yet" hint="Press 'N' to create a task" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {tasks.map((task, idx) => {
            const status = statuses.find((s) => s.id === task.status_id)
            const project = task.project_id ? projects.find((p) => p.id === task.project_id) : null
            const pi = PRIORITY_ICONS[task.priority]
            const isDone = status?.progress === "full" || status?.progress === "cancelled"
            return (
              <box key={task.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#414868"}>{idx === selectedIndex ? "▸" : " "}</text>
                {status && <text fg={status.color}>{PROGRESS_ICONS[status.progress]}</text>}
                {task.priority !== "none" && <text fg={pi.color}>{pi.icon}</text>}
                <text fg={isDone ? "#414868" : "#e2e8f0"}>{isDone ? "✓ " : ""}{task.title}</text>
                {(() => {
                  const sc = subtaskCounts.get(task.id)
                  if (!sc || sc.total === 0) return null
                  const allDone = sc.completed === sc.total
                  return <text fg={allDone ? "#16c79a" : "#bb9af7"}>[{sc.completed}/{sc.total}]</text>
                })()}
                {(() => {
                  const pc = getTaskPomodoroCount(task.id)
                  if (pc === 0) return null
                  return <text fg="#e94560">{"#"}{pc}</text>
                })()}
                {status && <text fg={status.color}>{status.name}</text>}
                {project && <text fg="#414868">[{project.name}]</text>}
                {task.labels && <text fg="#414868">{task.labels}</text>}
                {task.due_date && <text fg="#565f89">{task.due_date}</text>}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
