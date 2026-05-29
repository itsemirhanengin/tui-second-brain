import { useRunningTimer } from "../../../hooks/useRunningTimer"
import { formatDuration } from "../../../utils/date"
import { getTasksByStatus, PROGRESS_ICONS, PRIORITY_ICONS, type TaskStatus, type Task } from "../taskStore"
import type { Project } from "../workStore"

interface KanbanBoardProps {
  statuses: TaskStatus[]
  projects: Project[]
  kanbanCol: number
  kanbanRow: number
  filterProjectId: number | null
  subtaskCounts: Map<number, { total: number; completed: number }>
}

export function KanbanBoard({ statuses, projects, kanbanCol, kanbanRow, filterProjectId, subtaskCounts }: KanbanBoardProps) {
  const { runningTimer, elapsed } = useRunningTimer()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Kanban</strong></text>
        {filterProjectId && <text fg="#bb9af7">[{projects.find((p) => p.id === filterProjectId)?.name}]</text>}
        {runningTimer && <text fg="#f39c12">Timer: {formatDuration(elapsed)}</text>}
      </box>
      <text fg="#565f89">[L] List [N] New [T] Timer [{'>'}/Enter] Move right [{'<'}] Move left [X] Del</text>
      <box style={{ flexDirection: "row", gap: 1, flexGrow: 1 }}>
        {statuses.map((status, colIdx) => {
          const colTasks = getTasksByStatus(status.id, filterProjectId ?? undefined)
          const isActiveCol = colIdx === kanbanCol
          return (
            <box key={status.id} style={{ flexDirection: "column", flexGrow: 1, borderStyle: "single", borderColor: isActiveCol ? status.color : "#292e42", padding: 1 }}>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg={status.color}>{PROGRESS_ICONS[status.progress]}</text>
                <text fg={isActiveCol ? status.color : "#565f89"}>{status.name}</text>
                <text fg="#414868">{colTasks.length}</text>
              </box>
              <scrollbox style={{ flexGrow: 1 }} viewportCulling>
                {colTasks.length === 0 ? <text fg="#292e42">empty</text> : colTasks.map((task, rowIdx) => {
                  const isSelected = isActiveCol && rowIdx === kanbanRow
                  const pi = PRIORITY_ICONS[task.priority]
                  const proj = task.project_id ? projects.find((pp) => pp.id === task.project_id) : null
                  return (
                    <box key={task.id} style={{ flexDirection: "column", backgroundColor: isSelected ? "#292e42" : undefined, marginBottom: 1 }}>
                      <box style={{ flexDirection: "row", gap: 1 }}>
                        <text fg={isSelected ? "#7aa2f7" : "#414868"}>{isSelected ? "▸" : " "}</text>
                        {task.priority !== "none" && <text fg={pi.color}>{pi.icon}</text>}
                        <text fg={isSelected ? "#e2e8f0" : "#565f89"}>{task.title}</text>
                        {(() => {
                          const sc = subtaskCounts.get(task.id)
                          if (!sc || sc.total === 0) return null
                          return <text fg={sc.completed === sc.total ? "#16c79a" : "#bb9af7"}>[{sc.completed}/{sc.total}]</text>
                        })()}
                      </box>
                      {proj && <text fg="#414868" style={{ paddingLeft: 3 }}>[{proj.name}]</text>}
                    </box>
                  )
                })}
              </scrollbox>
            </box>
          )
        })}
      </box>
    </box>
  )
}
