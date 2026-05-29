import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { useUIStore } from "../../stores/useUIStore"
import { useRoutineStore } from "../../stores/useRoutineStore"
import { type Routine } from "./routinesStore"
import { TodayRoutines } from "./views/TodayRoutines"
import { AllRoutines } from "./views/AllRoutines"
import { RoutineDetail } from "./views/RoutineDetail"
import { RoutineStats } from "./views/RoutineStats"
import { NewRoutineWizard } from "./wizards/NewRoutineWizard"

type View = "today" | "all" | "detail" | "new" | "log_done" | "log_skip" | "stats"

export function RoutinesView({ subView }: { subView: "list" | "stats" }) {
  const propView: View = subView === "stats" ? "stats" : "today"
  const [view, setView] = useState<View>(propView)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const { setInputFocused: setGlobalFocus, consumePendingAction } = useUIStore()
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalFocus(v) }
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)
  const [logNote, setLogNote] = useState("")

  const { todayRoutines, allRoutines, refresh, removeRoutine, toggleActive, log } = useRoutineStore()

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
    if (action === "new-routine") {
      didConsume.current = true
      setView("new"); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("today"); setInputFocused(false)
      return
    }
    if (inputFocused) return

    if (view === "today") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(todayRoutines.length - 1, i + 1)); break
        case "return":
          if (todayRoutines[selectedIndex]) {
            setActiveRoutine(todayRoutines[selectedIndex].routine)
            setLogNote(""); setView("log_done"); setInputFocused(true)
          }
          break
        case "x":
          if (todayRoutines[selectedIndex]) {
            setActiveRoutine(todayRoutines[selectedIndex].routine)
            setLogNote(""); setView("log_skip"); setInputFocused(true)
          }
          break
        case "n": setView("new"); setInputFocused(true); break
        case "a": setView("all"); setSelectedIndex(0); break
        case "s": setView("stats"); setSelectedIndex(0); break
        case "d":
          if (todayRoutines[selectedIndex]) {
            setActiveRoutine(todayRoutines[selectedIndex].routine); setView("detail")
          }
          break
      }
    } else if (view === "all") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(allRoutines.length - 1, i + 1)); break
        case "t": setView("today"); setSelectedIndex(0); break
        case "n": setView("new"); setInputFocused(true); break
        case "p":
          if (allRoutines[selectedIndex]) { toggleActive(allRoutines[selectedIndex].id) }
          break
        case "delete":
          if (allRoutines[selectedIndex]) { removeRoutine(allRoutines[selectedIndex].id); setSelectedIndex(0) }
          break
        case "d":
          if (allRoutines[selectedIndex]) { setActiveRoutine(allRoutines[selectedIndex]); setView("detail") }
          break
        case "escape": setView("today"); break
      }
    } else if (view === "stats") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(allRoutines.length - 1, i + 1)); break
        case "escape": setView("today"); break
      }
    } else if (view === "detail") {
      if (key.name === "escape") setView("today")
    } else if (key.name === "escape") {
      setView("today"); setInputFocused(false)
    }
  })

  if (view === "log_done" && activeRoutine) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#16c79a"><strong>Mark Complete: {activeRoutine.name}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Note (optional):</text>
          <input placeholder="How did it go?" value={logNote} onInput={setLogNote} onSubmit={((val: string) => {
            setLogNote(val)
            log(activeRoutine.id, "completed", val)
            setView("today"); setInputFocused(false)
          }) as any} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to save, ESC to cancel</text>
      </box>
    )
  }

  if (view === "log_skip" && activeRoutine) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#f39c12"><strong>Skip: {activeRoutine.name}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Reason (required):</text>
          <input placeholder="Why are you skipping?" value={logNote} onInput={setLogNote} onSubmit={((val: string) => {
            setLogNote(val)
            if (val.trim()) {
              log(activeRoutine.id, "skipped", val)
              setView("today"); setInputFocused(false)
            }
          }) as any} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to save (reason required), ESC to cancel</text>
      </box>
    )
  }

  if (view === "new") {
    return <NewRoutineWizard onComplete={() => { setView("today"); setInputFocused(false) }} />
  }

  if (view === "detail" && activeRoutine) {
    return <RoutineDetail routine={activeRoutine} />
  }

  if (view === "stats") {
    return <RoutineStats selectedIndex={selectedIndex} />
  }

  if (view === "all") {
    return <AllRoutines routines={allRoutines} selectedIndex={selectedIndex} />
  }

  return <TodayRoutines routines={todayRoutines} selectedIndex={selectedIndex} />
}
