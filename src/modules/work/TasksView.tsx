import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { useUIStore } from "../../stores/useUIStore"
import { useRunningTimer } from "../../hooks/useRunningTimer"
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
  getSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  getAllSubtaskCounts,
  COLOR_PALETTE,
  type TaskStatus,
  type Task,
  type Priority,
  type ProgressLevel,
} from "./taskStore"
import { getProjects } from "./workStore"
import { startPomodoro, stopPomodoro, getPomodoroState } from "./pomodoroStore"
import { TaskListView } from "./views/TaskListView"
import { KanbanBoard } from "./views/KanbanBoard"
import { TaskDetailView } from "./views/TaskDetailView"
import { StatusManager } from "./views/StatusManager"
import { NewTaskWizard } from "./wizards/NewTaskWizard"
import { EditTaskWizard } from "./wizards/EditTaskWizard"
import { StatusWizard } from "./wizards/StatusWizard"

type View = "list" | "kanban" | "new_task" | "edit_task" | "manage_statuses" | "new_status" | "edit_status" | "task_detail"

const PROGRESS_LEVELS: ProgressLevel[] = ["none", "quarter", "half", "three_quarter", "full", "cancelled"]
const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"]

export function TasksView() {
  const [view, setView] = useState<View>("list")
  const [inputFocused, _setInputFocused] = useState(false)
  const { setInputFocused: setGlobalFocus, consumePendingAction } = useUIStore()
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalFocus(v) }
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [kanbanCol, setKanbanCol] = useState(0)
  const [kanbanRow, setKanbanRow] = useState(0)
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null)

  const statuses = getTaskStatuses()
  const allTasks = getTasks(filterProjectId ?? undefined)
  const projects = getProjects()
  const taskCounts = getTaskCountByStatus(filterProjectId ?? undefined)
  const subtaskCounts = getAllSubtaskCounts()

  const { runningTimer, startTimer, stopTimer } = useRunningTimer()

  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<Priority>("none")
  const [newStatusIdx, setNewStatusIdx] = useState(0)
  const [newProjectIdx, setNewProjectIdx] = useState(0)
  const [newStep, setNewStep] = useState(0)

  const [editTaskData, setEditTaskData] = useState<Task | null>(null)
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

  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [subtaskIdx, setSubtaskIdx] = useState(0)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [addingSubtask, setAddingSubtask] = useState(false)

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

    if (view === "task_detail" && detailTask) {
      const subs = getSubtasks(detailTask.id)
      switch (key.name) {
        case "up": setSubtaskIdx((i) => Math.max(0, i - 1)); break
        case "down": setSubtaskIdx((i) => Math.min(subs.length - 1, i + 1)); break
        case "return":
          if (subs[subtaskIdx]) { toggleSubtask(subs[subtaskIdx].id) }
          break
        case "s":
          setNewSubtaskTitle(""); setAddingSubtask(true); setInputFocused(true)
          break
        case "x":
          if (subs[subtaskIdx]) { deleteSubtask(subs[subtaskIdx].id); setSubtaskIdx(Math.max(0, subtaskIdx - 1)) }
          break
        case "escape": setView("list"); setDetailTask(null); break
      }
      return
    }

    if (view === "list") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(allTasks.length - 1, i + 1)); break
        case "return":
          if (allTasks[selectedIndex]) {
            setDetailTask(allTasks[selectedIndex]); setSubtaskIdx(0)
            setAddingSubtask(false); setView("task_detail")
          }
          break
        case "n":
          setNewTitle(""); setNewDesc(""); setNewPriority("none")
          setNewStatusIdx(statuses.length > 1 ? 1 : 0)
          setNewProjectIdx(0); setNewStep(0)
          setView("new_task"); setInputFocused(true)
          break
        case "s":
          if (allTasks[selectedIndex]) {
            setDetailTask(allTasks[selectedIndex]); setSubtaskIdx(0)
            setNewSubtaskTitle(""); setAddingSubtask(true)
            setView("task_detail"); setInputFocused(true)
          }
          break
        case "e":
          if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            setEditTaskData(t); setEditTitle(t.title); setEditDesc(t.description)
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
          if (runningTimer) stopTimer()
          else if (allTasks[selectedIndex]) {
            setTimerDesc(allTasks[selectedIndex].title)
            setStartingTimer(true); setInputFocused(true)
          }
          break
        case "o": {
          const pomo = getPomodoroState()
          if (pomo.phase !== "idle") stopPomodoro()
          else if (allTasks[selectedIndex]) {
            const t = allTasks[selectedIndex]
            startPomodoro(t.id, t.title)
          }
          break
        }
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
          if (runningTimer) stopTimer()
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

  // --- Rendering ---

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
    return (
      <StatusWizard
        isEdit={view === "edit_status"}
        statusStep={statusStep}
        statusName={statusName}
        statusColorIdx={statusColorIdx}
        statusProgressIdx={statusProgressIdx}
        setStatusName={setStatusName}
        onNameSubmit={() => { if (statusName.trim()) setStatusStep(1) }}
        onColorSubmit={() => setStatusStep(2)}
        onProgressSubmit={() => {
          if (view === "edit_status" && editingStatus) {
            updateTaskStatus(editingStatus.id, statusName, COLOR_PALETTE[statusColorIdx], PROGRESS_LEVELS[statusProgressIdx])
          } else {
            createTaskStatus(statusName, COLOR_PALETTE[statusColorIdx], PROGRESS_LEVELS[statusProgressIdx])
          }
          setView("manage_statuses"); setInputFocused(false)
        }}
      />
    )
  }

  if (view === "new_task") {
    return (
      <NewTaskWizard
        step={newStep}
        title={newTitle}
        desc={newDesc}
        setTitle={setNewTitle}
        setDesc={setNewDesc}
        projects={projects}
        statuses={statuses}
        projectIdx={newProjectIdx}
        statusIdx={newStatusIdx}
        priority={newPriority}
        onNext={() => {
          if (newStep < 4) {
            setNewStep(newStep + 1)
          } else {
            const sid = statuses[newStatusIdx]?.id ?? statuses[0]?.id
            const projectIds = [null, ...projects.map((p) => p.id)]
            const pid = projectIds[newProjectIdx] ?? null
            if (sid) createTask(newTitle, sid, pid, newPriority, newDesc)
            setView("list"); setInputFocused(false)
          }
        }}
      />
    )
  }

  if (view === "edit_task" && editTaskData) {
    return (
      <EditTaskWizard
        task={editTaskData}
        editTitle={editTitle}
        editDesc={editDesc}
        editLabels={editLabels}
        editDue={editDue}
        setEditTitle={setEditTitle}
        setEditDesc={setEditDesc}
        setEditLabels={setEditLabels}
        setEditDue={setEditDue}
        editStep={editStep}
        onSubmit={() => {
          if (editStep < 3) setEditStep(editStep + 1)
          else {
            updateTask(editTaskData.id, editTitle, editDesc, editPriority, editLabels, editDue || null)
            setView("list"); setInputFocused(false)
          }
        }}
      />
    )
  }

  if (view === "task_detail" && detailTask) {
    return (
      <TaskDetailView
        task={detailTask}
        statuses={statuses}
        projects={projects}
        subtaskIdx={subtaskIdx}
        addingSubtask={addingSubtask}
        newSubtaskTitle={newSubtaskTitle}
        setNewSubtaskTitle={setNewSubtaskTitle}
        onAddSubtask={() => {
          if (newSubtaskTitle.trim()) createSubtask(detailTask.id, newSubtaskTitle.trim())
          setNewSubtaskTitle(""); setAddingSubtask(false); setInputFocused(false)
        }}
      />
    )
  }

  if (view === "manage_statuses") {
    return <StatusManager statuses={statuses} selectedIndex={selectedIndex} taskCounts={taskCounts} />
  }

  if (view === "kanban") {
    return (
      <KanbanBoard
        statuses={statuses}
        projects={projects}
        kanbanCol={kanbanCol}
        kanbanRow={kanbanRow}
        filterProjectId={filterProjectId}
        subtaskCounts={subtaskCounts}
      />
    )
  }

  return (
    <TaskListView
      tasks={allTasks}
      statuses={statuses}
      projects={projects}
      selectedIndex={selectedIndex}
      filterProjectId={filterProjectId}
      subtaskCounts={subtaskCounts}
    />
  )
}
