import { useState, useCallback, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../utils/pendingAction"
import { setGlobalInputFocus } from "../../utils/inputFocus"
import { Badge } from "../../components/shared/Badge"
import { CurrencyDisplay } from "../../components/shared/CurrencyDisplay"
import { EmptyState } from "../../components/shared/EmptyState"
import {
  getProjects,
  getClients,
  getTimeEntries,
  getRunningTimer,
  startTimer,
  stopTimer,
  createProject,
  createClient,
  createManualEntry,
  deleteProject,
  deleteClient,
  deleteTimeEntry,
  updateProject,
  getProjectTotalMinutes,
  getProjectBillable,
  getTodayTotalMinutes,
  getWeekTotalMinutes,
  getDailyWorkMinutes,
  getClientById,
  type Project,
  type Client,
  type TimeEntry,
} from "./workStore"
import { getCurrency } from "../settings/settingsStore"
import { formatCurrency } from "../../utils/currency"
import { formatDuration, daysUntil, formatDate } from "../../utils/date"
import { TasksView } from "./TasksView"
import { getTasks, getTaskStatuses, getTaskCountByStatus, getTasksByStatus, PROGRESS_ICONS, type Task } from "./taskStore"
import { getPomodoroState, startPomodoro, stopPomodoro, getTodayPomodoroCount, formatPomodoroTime } from "./pomodoroStore"

type View = "projects" | "clients" | "tasks" | "timetracker" | "dashboard" | "new_project" | "new_client" | "manual_entry" | "project_detail"

export function WorkView({ subView }: { subView: string }) {
  const currency = getCurrency()
  const propView = (subView === "clients" ? "clients" : subView === "tasks" ? "tasks" : subView === "timetracker" ? "timetracker" : subView === "projects" ? "projects" : "dashboard") as View
  const [view, setView] = useState<View>(propView)

  useEffect(() => {
    setView(propView)
    setSelectedIndex(0)
    setInputFocused(false)
  }, [propView])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalInputFocus(v) }
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const projects = getProjects()
  const clients = getClients(false)
  const timeEntries = getTimeEntries(undefined, 30)
  const [runningTimer, setRunningTimer] = useState(getRunningTimer())
  const [elapsed, setElapsed] = useState(0)

  // Form states
  const [projName, setProjName] = useState("")
  const [projDesc, setProjDesc] = useState("")
  const [projDeadline, setProjDeadline] = useState("")
  const [projRate, setProjRate] = useState("")
  const [projClientIdx, setProjClientIdx] = useState(0)
  const [projStep, setProjStep] = useState(0)

  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientCompany, setClientCompany] = useState("")
  const [clientRate, setClientRate] = useState("")
  const [clientStep, setClientStep] = useState(0)

  const [manualDesc, setManualDesc] = useState("")
  const [manualStart, setManualStart] = useState("")
  const [manualEnd, setManualEnd] = useState("")
  const [manualProjIdx, setManualProjIdx] = useState(0)
  const [manualStep, setManualStep] = useState(0)

  const [timerDesc, setTimerDesc] = useState("")
  const [, setDataVer] = useState(0)
  const bump = () => setDataVer((v) => v + 1)

  useEffect(() => {
    const interval = setInterval(() => {
      const timer = getRunningTimer()
      setRunningTimer(timer)
      if (timer) {
        setElapsed(Math.round((Date.now() - new Date(timer.start_time).getTime()) / 60000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-project") {
      didConsume.current = true
      setView("new_project"); setProjStep(0); setProjName(""); setProjDesc("")
      setProjDeadline(""); setProjRate(""); setInputFocused(true)
    } else if (action === "new-client") {
      didConsume.current = true
      setView("new_client"); setClientStep(0); setClientName(""); setClientEmail("")
      setClientCompany(""); setClientRate(""); setInputFocused(true)
    } else if (action === "start-timer") {
      didConsume.current = true
      setView("timetracker"); setTimerDesc(""); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView(propView); setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (view === "projects") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(projects.length - 1, i + 1)); break
        case "n": setView("new_project"); setProjStep(0); setProjName(""); setProjDesc(""); setInputFocused(true); break
        case "return":
          if (projects[selectedIndex]) { setActiveProject(projects[selectedIndex]); setView("project_detail") }
          break
        case "x":
          if (projects[selectedIndex]) { deleteProject(projects[selectedIndex].id); setSelectedIndex(0); bump() }
          break
      }
    } else if (view === "clients") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(clients.length - 1, i + 1)); break
        case "n": setView("new_client"); setClientStep(0); setClientName(""); setInputFocused(true); break
        case "x":
          if (clients[selectedIndex]) { deleteClient(clients[selectedIndex].id); setSelectedIndex(0); bump() }
          break
      }
    } else if (view === "timetracker") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(timeEntries.length - 1, i + 1)); break
        case "t":
          if (runningTimer) {
            stopTimer(runningTimer.id)
            setRunningTimer(null)
            setTimerDesc("")
            setInputFocused(true)
          }
          break
        case "m": setView("manual_entry"); setManualStep(0); setManualDesc(""); setInputFocused(true); break
        case "o": {
          const pomo = getPomodoroState()
          if (pomo.phase !== "idle") { stopPomodoro(); bump() }
          else { startPomodoro(null, "Pomodoro"); bump() }
          break
        }
        case "x":
          if (timeEntries[selectedIndex]) { deleteTimeEntry(timeEntries[selectedIndex].id); setSelectedIndex(0); bump() }
          break
      }
    } else if (view === "project_detail") {
      if (key.name === "escape") setView("projects")
    } else if (key.name === "escape") {
      setView(propView)
      setInputFocused(false)
    }
  })

  if (view === "new_project") {
    const steps = [
      { label: "Project Name:", placeholder: "e.g. Website Redesign", value: projName, setter: setProjName },
      { label: "Description:", placeholder: "Project description", value: projDesc, setter: setProjDesc },
      { label: "Deadline (YYYY-MM-DD, optional):", placeholder: "", value: projDeadline, setter: setProjDeadline },
      { label: `Hourly Rate (${currency}, optional):`, placeholder: "0", value: projRate, setter: setProjRate },
    ]
    const step = steps[projStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Project</strong> (Step {projStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (projStep < steps.length - 1) {
              setProjStep(projStep + 1)
            } else {
              const clientId = clients[projClientIdx]?.id ?? null
              createProject(projName, clientId, projDesc, projDeadline || null, Number(projRate) || null)
              setView("projects")
              setInputFocused(false)
            }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "new_client") {
    const steps = [
      { label: "Client Name:", placeholder: "e.g. Acme Corp", value: clientName, setter: setClientName },
      { label: "Email:", placeholder: "client@example.com", value: clientEmail, setter: setClientEmail },
      { label: "Company:", placeholder: "Company name", value: clientCompany, setter: setClientCompany },
      { label: `Hourly Rate (${currency}):`, placeholder: "0", value: clientRate, setter: setClientRate },
    ]
    const step = steps[clientStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Client</strong> (Step {clientStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (clientStep < steps.length - 1) {
              setClientStep(clientStep + 1)
            } else {
              createClient(clientName, clientEmail, "", clientCompany, "", Number(clientRate) || 0)
              setView("clients")
              setInputFocused(false)
            }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "manual_entry") {
    const steps = [
      { label: "Description:", placeholder: "What did you work on?", value: manualDesc, setter: setManualDesc },
      { label: "Start Time (YYYY-MM-DD HH:MM):", placeholder: "2024-01-01 09:00", value: manualStart, setter: setManualStart },
      { label: "End Time (YYYY-MM-DD HH:MM):", placeholder: "2024-01-01 17:00", value: manualEnd, setter: setManualEnd },
    ]
    const step = steps[manualStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Manual Time Entry</strong> (Step {manualStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (manualStep < steps.length - 1) {
              setManualStep(manualStep + 1)
            } else {
              const projId = projects[manualProjIdx]?.id ?? null
              createManualEntry(projId, manualDesc, manualStart, manualEnd)
              setView("timetracker")
              setInputFocused(false)
            }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "tasks") {
    return <TasksView />
  }

  if (view === "project_detail" && activeProject) {
    const totalMin = getProjectTotalMinutes(activeProject.id)
    const billable = getProjectBillable(activeProject.id)
    const entries = getTimeEntries(activeProject.id, 10)
    const client = activeProject.client_id ? getClientById(activeProject.client_id) : null
    const daysLeft = activeProject.deadline ? daysUntil(activeProject.deadline) : null
    const projectTasks = getTasks(activeProject.id)
    const statuses = getTaskStatuses()

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <box style={{ flexDirection: "row", gap: 2 }}>
          <text fg="#7aa2f7"><strong>{activeProject.name}</strong></text>
          <Badge text={activeProject.status} />
        </box>
        {activeProject.description && <text fg="#e2e8f0">{activeProject.description}</text>}
        <box style={{ flexDirection: "row", gap: 3 }}>
          {client && <text fg="#565f89">Client: {client.name}</text>}
          {activeProject.deadline && (
            <text fg={daysLeft !== null && daysLeft < 0 ? "#e94560" : "#565f89"}>
              Deadline: {activeProject.deadline} {daysLeft !== null ? `(${daysLeft}d)` : ""}
            </text>
          )}
        </box>
        <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Total Time</text>
            <text fg="#e2e8f0">{formatDuration(totalMin)}</text>
          </box>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Billable</text>
            <CurrencyDisplay amount={billable} currency={currency} />
          </box>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Tasks</text>
            <text fg="#e2e8f0">{projectTasks.length}</text>
          </box>
        </box>

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

  if (view === "timetracker") {
    const todayMin = getTodayTotalMinutes()
    const weekMin = getWeekTotalMinutes()

    if (inputFocused && !runningTimer) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>Start Timer</strong></text>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">Description:</text>
            <input placeholder="What are you working on?" value={timerDesc} onInput={setTimerDesc} onSubmit={() => {
              const projId = projects[0]?.id ?? null
              startTimer(projId, timerDesc)
              setInputFocused(false)
            }} focused style={{ width: 40 }} />
          </box>
          <text fg="#414868">Enter to start, ESC to cancel</text>
        </box>
      )
    }

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Time Tracker</strong></text>

        {runningTimer && (
          <box style={{ borderStyle: "rounded", borderColor: "#f39c12", padding: 1, flexDirection: "column" }}>
            <text fg="#f39c12">Timer Running: {formatDuration(elapsed)}</text>
            <text fg="#e2e8f0">{runningTimer.description || "No description"}</text>
            <text fg="#565f89">[T] Stop Timer</text>
          </box>
        )}

        {(() => {
          const pomo = getPomodoroState()
          if (pomo.phase === "idle") return null
          const color = pomo.phase === "work" ? "#e94560" : "#16c79a"
          const label = pomo.phase === "work" ? "WORK" : "BREAK"
          return (
            <box style={{ borderStyle: "rounded", borderColor: color, padding: 1, flexDirection: "column" }}>
              <text fg={color}>Pomodoro {label}: {formatPomodoroTime(pomo.remainingSeconds)}</text>
              {pomo.taskTitle && <text fg="#e2e8f0">{pomo.taskTitle}</text>}
              <text fg="#565f89">Session: {"#"}{pomo.sessionCount} | Today: {"#"}{getTodayPomodoroCount()} | [O] Stop</text>
            </box>
          )
        })()}

        <box style={{ flexDirection: "row", gap: 3 }}>
          <text fg="#565f89">Today: {formatDuration(todayMin)}</text>
          <text fg="#565f89">This Week: {formatDuration(weekMin)}</text>
          <text fg="#565f89">Pomodoros today: {"#"}{getTodayPomodoroCount()}</text>
        </box>

        <text fg="#565f89">[T] {runningTimer ? "Stop" : "Start"} Timer [O] Pomodoro [M] Manual Entry [X] Delete [ESC] Back</text>

        {timeEntries.length === 0 ? <EmptyState message="No time entries" hint="Press 'T' to start a timer" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {timeEntries.map((e, idx) => {
              const projName = e.project_id ? projects.find((p) => p.id === e.project_id)?.name : null
              return (
                <box key={e.id} style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                  <text fg="#565f89">{e.start_time.substring(0, 16)}</text>
                  <text fg={e.is_running ? "#f39c12" : "#e2e8f0"}>
                    {e.is_running ? "RUNNING" : e.duration_minutes ? formatDuration(e.duration_minutes) : "—"}
                  </text>
                  {projName && <text fg="#bb9af7">[{projName}]</text>}
                  <text fg="#414868">{e.description || "—"}</text>
                </box>
              )
            })}
          </scrollbox>
        )}
      </box>
    )
  }

  if (view === "dashboard") {
    const todayMin = getTodayTotalMinutes()
    const weekMin = getWeekTotalMinutes()
    const activeProjects = projects.filter((p) => p.status === "active")
    const allTasksList = getTasks()
    const statuses = getTaskStatuses()
    const taskCountMap = getTaskCountByStatus()
    const totalTasks = allTasksList.length
    const doneTasks = statuses.filter((s) => s.progress === "full").reduce((sum, s) => sum + (taskCountMap.get(s.id) ?? 0), 0)
    const inProgressTasks = statuses.filter((s) => s.progress === "half" || s.progress === "quarter" || s.progress === "three_quarter").reduce((sum, s) => sum + (taskCountMap.get(s.id) ?? 0), 0)

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Work Overview</strong></text>

        {runningTimer && (
          <box style={{ borderStyle: "rounded", borderColor: "#f39c12", padding: 1 }}>
            <text fg="#f39c12">Timer Running: {formatDuration(elapsed)} — {runningTimer.description || "No description"}</text>
          </box>
        )}

        <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Today</text>
            <text fg="#e2e8f0">{formatDuration(todayMin)}</text>
          </box>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">This Week</text>
            <text fg="#e2e8f0">{formatDuration(weekMin)}</text>
          </box>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Projects</text>
            <text fg="#e2e8f0">{activeProjects.length} active</text>
          </box>
          <box style={{ flexDirection: "column" }}>
            <text fg="#565f89">Clients</text>
            <text fg="#e2e8f0">{clients.filter((c) => c.is_active).length}</text>
          </box>
        </box>

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

        {(() => {
          const daily = getDailyWorkMinutes(7)
          const maxMin = Math.max(...daily.map((d) => d.minutes), 1)
          if (daily.every((d) => d.minutes === 0)) return null
          return (
            <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
              <text fg="#565f89">Work Hours (Last 7 Days):</text>
              {daily.map((d) => {
                const barW = 20
                const filled = Math.round((d.minutes / maxMin) * barW)
                const dayName = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
                return (
                  <box key={d.date} style={{ flexDirection: "row", gap: 1 }}>
                    <text fg="#565f89" style={{ width: 5 }}>{dayName}</text>
                    <text fg="#7aa2f7">{"█".repeat(filled)}{"░".repeat(barW - filled)}</text>
                    <text fg="#e2e8f0">{formatDuration(d.minutes)}</text>
                  </box>
                )
              })}
            </box>
          )
        })()}

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

  if (view === "clients") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Clients</strong></text>
        <text fg="#565f89">[N] New [X] Delete</text>

        {clients.length === 0 ? <EmptyState message="No clients yet" hint="Press 'N' to create" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {clients.map((c, idx) => {
              const clientProjects = projects.filter((p) => p.client_id === c.id)
              const clientTaskCount = clientProjects.reduce((sum, p) => sum + getTasks(p.id).length, 0)
              return (
                <box key={c.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                  <box style={{ flexDirection: "row", gap: 1 }}>
                    <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                    <text fg="#e2e8f0">{c.name}</text>
                    {!c.is_active && <Badge text="inactive" />}
                    {c.company && <text fg="#414868">({c.company})</text>}
                  </box>
                  <box style={{ paddingLeft: 4, flexDirection: "row", gap: 2 }}>
                    {c.email && <text fg="#565f89">{c.email}</text>}
                    {c.hourly_rate > 0 && <text fg="#565f89">{formatCurrency(c.hourly_rate, currency)}/hr</text>}
                    <text fg="#565f89">{clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}</text>
                    <text fg="#565f89">{clientTaskCount} task{clientTaskCount !== 1 ? "s" : ""}</text>
                  </box>
                  {clientProjects.length > 0 && (
                    <box style={{ paddingLeft: 4, flexDirection: "column" }}>
                      {clientProjects.map((p) => (
                        <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                          <text fg="#414868">└</text>
                          <text fg="#565f89">{p.name}</text>
                          <Badge text={p.status} />
                          <text fg="#414868">{getTasks(p.id).length} tasks</text>
                        </box>
                      ))}
                    </box>
                  )}
                </box>
              )
            })}
          </scrollbox>
        )}
      </box>
    )
  }

  // Projects list (default)
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Projects</strong></text>
      <text fg="#565f89">[N] New [Enter] Detail [X] Delete</text>

      {projects.length === 0 ? <EmptyState message="No projects yet" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {projects.map((p, idx) => {
            const client = p.client_id ? clients.find((c) => c.id === p.client_id) : null
            const totalMin = getProjectTotalMinutes(p.id)
            return (
              <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg="#e2e8f0">{p.name}</text>
                <Badge text={p.status} />
                {client && <text fg="#414868">({client.name})</text>}
                <text fg="#565f89">{formatDuration(totalMin)}</text>
                {p.deadline && <text fg="#565f89">Due: {p.deadline}</text>}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
