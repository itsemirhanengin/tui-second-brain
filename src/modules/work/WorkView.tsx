import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { useUIStore } from "../../stores/useUIStore"
import { useWorkStore } from "../../stores/useWorkStore"
import { useRunningTimer } from "../../hooks/useRunningTimer"
import { type Project } from "./workStore"
import { getPomodoroState, startPomodoro, stopPomodoro } from "./pomodoroStore"
import { TasksView } from "./TasksView"
import { WorkDashboard } from "./views/WorkDashboard"
import { ProjectsList } from "./views/ProjectsList"
import { ProjectDetail } from "./views/ProjectDetail"
import { ClientsList } from "./views/ClientsList"
import { TimeTrackerView } from "./views/TimeTrackerView"
import { NewProjectWizard } from "./wizards/NewProjectWizard"
import { NewClientWizard } from "./wizards/NewClientWizard"
import { ManualEntryWizard } from "./wizards/ManualEntryWizard"

type View = "projects" | "clients" | "tasks" | "timetracker" | "dashboard" | "new_project" | "new_client" | "manual_entry" | "project_detail"

export function WorkView({ subView }: { subView: string }) {
  const propView = (subView === "clients" ? "clients" : subView === "tasks" ? "tasks" : subView === "timetracker" ? "timetracker" : subView === "projects" ? "projects" : "dashboard") as View
  const [view, setView] = useState<View>(propView)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const { setInputFocused: setGlobalFocus, consumePendingAction } = useUIStore()
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalFocus(v) }
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [timerDesc, setTimerDesc] = useState("")

  const workStore = useWorkStore()
  const { projects, clients, timeEntries, removeProject, removeClient, removeTimeEntry, refresh } = workStore
  const { runningTimer, stopTimer, startTimer } = useRunningTimer()

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    setView(propView)
    setSelectedIndex(0)
    setInputFocused(false)
    refresh()
  }, [propView])

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-project") {
      didConsume.current = true
      setView("new_project"); setInputFocused(true)
    } else if (action === "new-client") {
      didConsume.current = true
      setView("new_client"); setInputFocused(true)
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
        case "n": setView("new_project"); setInputFocused(true); break
        case "return":
          if (projects[selectedIndex]) { setActiveProject(projects[selectedIndex]); setView("project_detail") }
          break
        case "x":
          if (projects[selectedIndex]) { removeProject(projects[selectedIndex].id); setSelectedIndex(0) }
          break
      }
    } else if (view === "clients") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(clients.length - 1, i + 1)); break
        case "n": setView("new_client"); setInputFocused(true); break
        case "x":
          if (clients[selectedIndex]) { removeClient(clients[selectedIndex].id); setSelectedIndex(0) }
          break
      }
    } else if (view === "timetracker") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(timeEntries.length - 1, i + 1)); break
        case "t":
          if (runningTimer) { stopTimer(); refresh() }
          else { setTimerDesc(""); setInputFocused(true) }
          break
        case "m": setView("manual_entry"); setInputFocused(true); break
        case "o": {
          const pomo = getPomodoroState()
          if (pomo.phase !== "idle") stopPomodoro()
          else startPomodoro(null, "Pomodoro")
          break
        }
        case "x":
          if (timeEntries[selectedIndex]) { removeTimeEntry(timeEntries[selectedIndex].id); setSelectedIndex(0) }
          break
      }
    } else if (view === "project_detail") {
      if (key.name === "escape") setView("projects")
    } else if (key.name === "escape") {
      setView(propView); setInputFocused(false)
    }
  })

  if (view === "new_project") {
    return <NewProjectWizard onComplete={() => { setView("projects"); setInputFocused(false) }} />
  }

  if (view === "new_client") {
    return <NewClientWizard onComplete={() => { setView("clients"); setInputFocused(false) }} />
  }

  if (view === "manual_entry") {
    return <ManualEntryWizard onComplete={() => { setView("timetracker"); setInputFocused(false) }} />
  }

  if (view === "tasks") {
    return <TasksView />
  }

  if (view === "project_detail" && activeProject) {
    return <ProjectDetail project={activeProject} />
  }

  if (view === "timetracker") {
    return (
      <TimeTrackerView
        selectedIndex={selectedIndex}
        inputFocused={inputFocused}
        timerDesc={timerDesc}
        setTimerDesc={setTimerDesc}
        onStartTimer={(desc?: string) => {
          const projId = projects[0]?.id ?? null
          startTimer(projId, desc ?? timerDesc)
          setInputFocused(false)
          refresh()
        }}
        onInputFocused={setInputFocused}
      />
    )
  }

  if (view === "dashboard") {
    return <WorkDashboard />
  }

  if (view === "clients") {
    return <ClientsList selectedIndex={selectedIndex} />
  }

  return <ProjectsList selectedIndex={selectedIndex} />
}
