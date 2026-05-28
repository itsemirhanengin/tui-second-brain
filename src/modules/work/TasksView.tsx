import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../utils/pendingAction"
import { EmptyState } from "../../components/shared/EmptyState"
import {
  getTaskStatuses,
  getTasks,
  getTasksByStatus,
  createTask,
  deleteTask,
  moveTask,
  updateTask,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
  getTaskCountByStatus,
  PROGRESS_ICONS,
  PRIORITY_ICONS,
  COLOR_PALETTE,
  type TaskStatus,
  type Task,
  type ProgressLevel,
  type Priority,
} from "./taskStore"
import {
  getProjects,
  getRunningTimer,
  startTimer,
  stopTimer,
} from "./workStore"
import { formatDuration } from "../../utils/date"

type View = "list" | "kanban" | "new_task" | "edit_task" | "manage_statuses" | "new_status" | "edit_status"

const PROGRESS_LEVELS: ProgressLevel[] = ["none", "quarter", "half", "three_quarter", "full", "cancelled"]
const PROGRESS_LABELS: Record<ProgressLevel, string> = {
  none: "Not started",
  quarter: "Started",
  half: "Halfway",
  three_quarter: "Almost done",
  full: "Complete",
  cancelled: "Cancelled",
}
const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"]

export function TasksView() {
  const [view, setView] = useState<View>("list")
  const [inputFocused, setInputFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [kanbanCol, setKanbanCol] = useState(0)
  const [kanbanRow, setKanbanRow] = useState(0)
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null)

  const statuses = getTaskStatuses()
  const allTasks = getTasks(filterProjectId ?? undefined)
  const projects = getProjects()
  const taskCounts = getTaskCountByStatus(filterProjectId ?? undefined)

  const [runningTimer, setRunningTimer] = useState(getRunningTimer())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const timer = getRunningTimer()
      setRunningTimer(timer)
      if (timer) setElapsed(Math.round((Date.now() - new Date(timer.start_time).getTime()) / 60000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<Priority>("none")
  const [newStatusIdx, setNewStatusIdx] = useState(0)
  const [newProjectIdx, setNewProjectIdx] = useState(0)
  const [newStep, setNewStep] = useState(0)

  const [editTask, setEditTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editPriority, setEditPriority] = useState<Priority>("none")
  const [editLabels, setEditLabels] = useState("")
  const [editDue, setEditDue] = useState("")
  const [editStep, setEditStep] = useState(0)

  const [statusName, setStatusName] = useState("")
  const [statusColorIdx, setStatusColorIdx] = useState(0)
  const [statusProgressIdx, setStatusProgressIdx] = useState(0)
  const [statusStep, setStatusStep] = useState(0)
  const [editingStatus, setEditingStatus] = useState<TaskStatus | null>(null)

  const [timerDesc, setTimerDesc] = useState("")
  const [startingTimer, setStartingTimer] = useState(false)

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-task") {
      didConsume.current = true
      setNewTitle(""); setNewDesc(""); setNewPriority("none")
      setNewStatusIdx(statuses.length > 1 ? 1 : 0)
      setNewProjectIdx(0); setNewStep(0)
      setView("new_task"); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("list"); setInputFocused(false); setStartingTimer(false)
      return
    }

    if (view === "new_status" || view === "edit_status") {
      if (statusStep === 1) {
        if (key.name === "left") { setStatusColorIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "right") { setStatusColorIdx((i) => Math.min(COLOR_PALETTE.length - 1, i + 1)); return }
      } else if (statusStep === 2) {
        if (key.name === "up") { setStatusProgressIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "down") { setStatusProgressIdx((i) => Math.min(PROGRESS_LEVELS.length - 1, i + 1)); return }
      }
    }

    if (view === "new_task") {
      if (newStep === 2) {
        const max = projects.length
        if (key.name === "up") { setNewProjectIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "down") { setNewProjectIdx((i) => Math.min(max, i + 1)); return }
      } else if (newStep === 3) {
        if (key.name === "up") { setNewStatusIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "down") { setNewStatusIdx((i) => Math.min(statuses.length - 1, i + 1)); return }
      } else if (newStep === 4) {
        if (key.name === "up") { setNewPriority(PRIORITIES[Math.max(0, PRIORITIES.indexOf(newPriority) - 1)]); return }
        if (key.name === "down") { setNewPriority(PRIORITIES[Math.min(PRIORITIES.length - 1, PRIORITIES.indexOf(newPriority) + 1)]); return }
      }
    }

    if (inputFocused) return

    if (view === "list") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(allTasks.length - 1, i + 1)); break
        case "n":
          setNewTitle(""); setNewDesc(""); setNewPriority("none")
          setNewStatusIdx(statuses.length > 1 ? 1 : 0)
          setNewProjectIdx(0); setNewStep(0)
          setView("new_task"); setInputFocused(true)
          break
        case "e":
          if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            setEditTask(t); setEditTitle(t.title); setEditDesc(t.description)
            setEditPriority(t.priority); setEditLabels(t.labels); setEditDue(t.due_date ?? "")
            setEditStep(0); setView("edit_task"); setInputFocused(true)
          }
          break
        case "k": setView("kanban"); setKanbanCol(0); setKanbanRow(0); break
        case "m": setView("manage_statuses"); setSelectedIndex(0); break
        case "x":
          if (allTasks[selectedIndex]) { deleteTask(allTasks[selectedIndex].id); setSelectedIndex(Math.max(0, selectedIndex - 1)) }
          break
        case "right":
          if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            const curIdx = statuses.findIndex((s) => s.id === t.status_id)
            if (curIdx < statuses.length - 1) moveTask(t.id, statuses[curIdx + 1].id)
          }
          break
        case "left":
          if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            const curIdx = statuses.findIndex((s) => s.id === t.status_id)
            if (curIdx > 0) moveTask(t.id, statuses[curIdx - 1].id)
          }
          break
        case "p":
          if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            const pIdx = PRIORITIES.indexOf(t.priority)
            const next = PRIORITIES[(pIdx + 1) % PRIORITIES.length]
            updateTask(t.id, t.title, t.description, next, t.labels, t.due_date)
          }
          break
        case "f":
          if (filterProjectId === null && projects.length > 0) setFilterProjectId(projects[0].id)
          else if (filterProjectId !== null) {
            const idx = projects.findIndex((p) => p.id === filterProjectId)
            if (idx < projects.length - 1) setFilterProjectId(projects[idx + 1].id)
            else setFilterProjectId(null)
          }
          setSelectedIndex(0)
          break
        case "t":
          if (runningTimer) { stopTimer(runningTimer.id); setRunningTimer(null) }
          else if (allTasks[selectedIndex]) {
            setTimerDesc(allTasks[selectedIndex].title)
            setStartingTimer(true); setInputFocused(true)
          }
          break
      }
    } else if (view === "kanban") {
      const colTasks = statuses[kanbanCol] ? getTasksByStatus(statuses[kanbanCol].id, filterProjectId ?? undefined) : []
      switch (key.name) {
        case "left": setKanbanCol((c) => Math.max(0, c - 1)); setKanbanRow(0); break
        case "right": setKanbanCol((c) => Math.min(statuses.length - 1, c + 1)); setKanbanRow(0); break
        case "up": setKanbanRow((r) => Math.max(0, r - 1)); break
        case "down": setKanbanRow((r) => Math.min(colTasks.length - 1, r + 1)); break
        case "l": setView("list"); setSelectedIndex(0); break
        case "n":
          setNewTitle(""); setNewDesc(""); setNewPriority("none"); setNewStatusIdx(kanbanCol)
          setNewProjectIdx(0); setNewStep(0)
          setView("new_task"); setInputFocused(true)
          break
        case "return":
        case ">":
          if (colTasks[kanbanRow] && kanbanCol < statuses.length - 1) moveTask(colTasks[kanbanRow].id, statuses[kanbanCol + 1].id)
          break
        case "<":
          if (colTasks[kanbanRow] && kanbanCol > 0) moveTask(colTasks[kanbanRow].id, statuses[kanbanCol - 1].id)
          break
        case "x":
          if (colTasks[kanbanRow]) { deleteTask(colTasks[kanbanRow].id); setKanbanRow(Math.max(0, kanbanRow - 1)) }
          break
        case "t":
          if (runningTimer) { stopTimer(runningTimer.id); setRunningTimer(null) }
          else if (colTasks[kanbanRow]) {
            setTimerDesc(colTasks[kanbanRow].title); setStartingTimer(true); setInputFocused(true)
          }
          break
        case "escape": setView("list"); break
      }
    } else if (view === "manage_statuses") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(statuses.length - 1, i + 1)); break
        case "n":
          setStatusName(""); setStatusColorIdx(0); setStatusProgressIdx(0); setStatusStep(0)
          setView("new_status"); setInputFocused(true)
          break
        case "e":
          if (statuses[selectedIndex]) {
            const s = statuses[selectedIndex]
            setEditingStatus(s); setStatusName(s.name)
            setStatusColorIdx(COLOR_PALETTE.indexOf(s.color) >= 0 ? COLOR_PALETTE.indexOf(s.color) : 0)
            setStatusProgressIdx(PROGRESS_LEVELS.indexOf(s.progress))
            setStatusStep(0); setView("edit_status"); setInputFocused(true)
          }
          break
        case "x":
          if (statuses[selectedIndex]) { deleteTaskStatus(statuses[selectedIndex].id); setSelectedIndex(Math.max(0, selectedIndex - 1)) }
          break
        case "escape": setView("list"); break
      }
    } else if (key.name === "escape") {
      setView("list"); setInputFocused(false); setStartingTimer(false)
    }
  })

  // --- All rendering below (no hooks after this point) ---

  if (startingTimer) {
    const task = allTasks[selectedIndex]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#f39c12"><strong>Start Timer{task ? ` — ${task.title}` : ""}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Description:</text>
          <input placeholder={timerDesc} value={timerDesc} onInput={setTimerDesc} onSubmit={() => {
            const projId = task?.project_id ?? null
            startTimer(projId, timerDesc)
            setStartingTimer(false); setInputFocused(false)
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to start timer, ESC to cancel</text>
      </box>
    )
  }

  if (view === "new_status" || view === "edit_status") {
    const isEdit = view === "edit_status"
    if (statusStep === 1) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Color</text>
          <box style={{ flexDirection: "row", flexWrap: "wrap", gap: 0 }}>
            {COLOR_PALETTE.map((c, i) => (
              <text key={c} fg={i === statusColorIdx ? "#ffffff" : c} bg={i === statusColorIdx ? c : undefined}>{" ● "}</text>
            ))}
          </box>
          <text fg="#565f89">Selected: <span fg={COLOR_PALETTE[statusColorIdx]}>████ {COLOR_PALETTE[statusColorIdx]}</span></text>
          <text fg="#414868">Left/Right to pick, Enter to confirm, ESC to cancel</text>
          <input placeholder="" onSubmit={() => setStatusStep(2)} focused style={{ width: 1 }} />
        </box>
      )
    }
    if (statusStep === 2) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Progress Level</text>
          {PROGRESS_LEVELS.map((level, i) => (
            <text key={level} fg={i === statusProgressIdx ? "#7aa2f7" : "#565f89"}>
              {i === statusProgressIdx ? "▸ " : "  "}{PROGRESS_ICONS[level]} {PROGRESS_LABELS[level]}
            </text>
          ))}
          <text fg="#414868">Up/Down to pick, Enter to confirm, ESC to cancel</text>
          <input placeholder="" onSubmit={() => {
            if (isEdit && editingStatus) updateTaskStatus(editingStatus.id, statusName, COLOR_PALETTE[statusColorIdx], PROGRESS_LEVELS[statusProgressIdx])
            else createTaskStatus(statusName, COLOR_PALETTE[statusColorIdx], PROGRESS_LEVELS[statusProgressIdx])
            setView("manage_statuses"); setInputFocused(false)
          }} focused style={{ width: 1 }} />
        </box>
      )
    }
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Name</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Status Name:</text>
          <input placeholder="e.g. In Review" value={statusName} onInput={setStatusName} onSubmit={() => {
            if (statusName.trim()) setStatusStep(1)
          }} focused style={{ width: 30 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "new_task") {
    const textSteps = [
      { label: "Task Title:", placeholder: "What needs to be done?", value: newTitle, setter: setNewTitle },
      { label: "Description (optional):", placeholder: "", value: newDesc, setter: setNewDesc },
    ]
    const projectChoices = [{ name: "No Project" }, ...projects.map((p) => ({ name: p.name }))]

    if (newStep < textSteps.length) {
      const step = textSteps[newStep]
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Task</strong> (Step {newStep + 1}/5)</text>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">{step.label}</text>
            <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => setNewStep(newStep + 1)} focused style={{ width: 40 }} />
          </box>
          <text fg="#414868">Enter to continue, ESC to cancel</text>
        </box>
      )
    }
    if (newStep === 2) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Task</strong> — Project (Step 3/5)</text>
          {projectChoices.map((p, i) => (
            <text key={i} fg={i === newProjectIdx ? "#7aa2f7" : "#565f89"}>
              {i === newProjectIdx ? "▸ " : "  "}{p.name}
            </text>
          ))}
          <text fg="#414868">Up/Down to pick, Enter to confirm</text>
          <input placeholder="" onSubmit={() => setNewStep(3)} focused style={{ width: 1 }} />
        </box>
      )
    }
    if (newStep === 3) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Task</strong> — Status (Step 4/5)</text>
          {statuses.map((s, i) => (
            <text key={s.id} fg={i === newStatusIdx ? "#7aa2f7" : "#565f89"}>
              {i === newStatusIdx ? "▸ " : "  "}<span fg={s.color}>{PROGRESS_ICONS[s.progress]}</span> {s.name}
            </text>
          ))}
          <text fg="#414868">Up/Down to pick, Enter to confirm</text>
          <input placeholder="" onSubmit={() => setNewStep(4)} focused style={{ width: 1 }} />
        </box>
      )
    }
    if (newStep === 4) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Task</strong> — Priority (Step 5/5)</text>
          {PRIORITIES.map((p, i) => {
            const pi = PRIORITY_ICONS[p]
            return (
              <text key={p} fg={PRIORITIES.indexOf(newPriority) === i ? "#7aa2f7" : "#565f89"}>
                {PRIORITIES.indexOf(newPriority) === i ? "▸ " : "  "}<span fg={pi.color}>{pi.icon}</span>{p === "none" ? "No priority" : p.charAt(0).toUpperCase() + p.slice(1)}
              </text>
            )
          })}
          <text fg="#414868">Up/Down to pick, Enter to create</text>
          <input placeholder="" onSubmit={() => {
            const sid = statuses[newStatusIdx]?.id ?? statuses[0]?.id
            const projectIds = [null, ...projects.map((p) => p.id)]
            const pid = projectIds[newProjectIdx] ?? null
            if (sid) createTask(newTitle, sid, pid, newPriority, newDesc)
            setView("list"); setInputFocused(false)
          }} focused style={{ width: 1 }} />
        </box>
      )
    }
  }

  if (view === "edit_task" && editTask) {
    const steps = [
      { label: "Title:", placeholder: "", value: editTitle, setter: setEditTitle },
      { label: "Description:", placeholder: "", value: editDesc, setter: setEditDesc },
      { label: "Labels (comma-sep):", placeholder: "bug,feature", value: editLabels, setter: setEditLabels },
      { label: "Due Date (YYYY-MM-DD):", placeholder: "", value: editDue, setter: setEditDue },
    ]
    const step = steps[editStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Edit Task</strong> (Step {editStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (editStep < steps.length - 1) setEditStep(editStep + 1)
            else { updateTask(editTask.id, editTitle, editDesc, editPriority, editLabels, editDue || null); setView("list"); setInputFocused(false) }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "manage_statuses") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Manage Task Statuses</strong></text>
        <text fg="#565f89">[N] New [E] Edit [X] Delete [ESC] Back</text>
        {statuses.length === 0 ? <EmptyState message="No statuses" hint="Press 'N' to create" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {statuses.map((s, idx) => (
              <box key={s.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg={s.color}>{PROGRESS_ICONS[s.progress]}</text>
                <text fg="#e2e8f0">{s.name}</text>
                <text fg={s.color}>████</text>
                <text fg="#414868">{PROGRESS_LABELS[s.progress]}</text>
                <text fg="#565f89">({taskCounts.get(s.id) ?? 0} tasks)</text>
              </box>
            ))}
          </scrollbox>
        )}
      </box>
    )
  }

  if (view === "kanban") {
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

  // List view (default)
  const filterLabel = filterProjectId ? projects.find((p) => p.id === filterProjectId)?.name ?? "All" : "All Projects"
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Tasks</strong></text>
        <text fg="#bb9af7">[{filterLabel}]</text>
        {runningTimer && <text fg="#f39c12">Timer: {formatDuration(elapsed)} ({runningTimer.description})</text>}
      </box>
      <text fg="#565f89">[N] New [E] Edit [K] Kanban [M] Statuses [X] Del [P] Priority [F] Filter [T] Timer [left/right] Move</text>
      {allTasks.length === 0 ? <EmptyState message="No tasks yet" hint="Press 'N' to create a task" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {allTasks.map((task, idx) => {
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
