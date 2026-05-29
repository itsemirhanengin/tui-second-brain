import { PROGRESS_ICONS, PRIORITY_ICONS, getSubtasks, type Task, type TaskStatus } from "../taskStore"
import { getTaskPomodoroCount } from "../pomodoroStore"
import type { Project } from "../workStore"

interface TaskDetailViewProps {
  task: Task
  statuses: TaskStatus[]
  projects: Project[]
  subtaskIdx: number
  addingSubtask: boolean
  newSubtaskTitle: string
  setNewSubtaskTitle: (v: string) => void
  onAddSubtask: () => void
}

export function TaskDetailView({ task, statuses, projects, subtaskIdx, addingSubtask, newSubtaskTitle, setNewSubtaskTitle, onAddSubtask }: TaskDetailViewProps) {
  const subs = getSubtasks(task.id)
  const status = statuses.find((s) => s.id === task.status_id)
  const project = task.project_id ? projects.find((p) => p.id === task.project_id) : null
  const pi = PRIORITY_ICONS[task.priority]
  const completed = subs.filter((s) => s.is_completed).length

  if (addingSubtask) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{task.title}</strong> — Add Subtask</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Subtask:</text>
          <input placeholder="What needs to be done?" value={newSubtaskTitle} onInput={setNewSubtaskTitle} onSubmit={onAddSubtask} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to add, ESC to cancel</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <box style={{ flexDirection: "row", gap: 1 }}>
        {status && <text fg={status.color}>{PROGRESS_ICONS[status.progress]}</text>}
        <text fg="#7aa2f7"><strong>{task.title}</strong></text>
        {task.priority !== "none" && <text fg={pi.color}>{pi.icon}</text>}
        {status && <text fg={status.color}>{status.name}</text>}
      </box>
      {task.description && <text fg="#e2e8f0">{task.description}</text>}
      <box style={{ flexDirection: "row", gap: 2 }}>
        {project && <text fg="#414868">Project: {project.name}</text>}
        {task.labels && <text fg="#414868">Labels: {task.labels}</text>}
        {task.due_date && <text fg="#565f89">Due: {task.due_date}</text>}
      </box>

      {(() => {
        const pc = getTaskPomodoroCount(task.id)
        if (pc === 0) return null
        return <text fg="#e94560">Pomodoros: {"#"}{pc}</text>
      })()}

      <box style={{ height: 1 }} />
      <text fg="#bb9af7"><strong>Subtasks</strong> <span fg="#565f89">({completed}/{subs.length})</span></text>
      <text fg="#565f89">[S] Add [Enter] Toggle [X] Delete [ESC] Back</text>

      {subs.length === 0 ? (
        <text fg="#414868">No subtasks yet — press S to add</text>
      ) : (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          {subs.map((sub, idx) => (
            <box key={sub.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={idx === subtaskIdx ? "#7aa2f7" : "#414868"}>{idx === subtaskIdx ? "▸" : " "}</text>
              <text fg={sub.is_completed ? "#16c79a" : "#565f89"}>{sub.is_completed ? "✓" : "○"}</text>
              <text fg={sub.is_completed ? "#414868" : "#e2e8f0"}>{sub.title}</text>
            </box>
          ))}
        </box>
      )}
    </box>
  )
}
