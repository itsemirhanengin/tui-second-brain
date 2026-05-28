import { useState, useCallback, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../utils/pendingAction"
import { Badge } from "../../components/shared/Badge"
import { ProgressBar } from "../../components/shared/ProgressBar"
import { EmptyState } from "../../components/shared/EmptyState"
import {
  getRoutines,
  createRoutine,
  deleteRoutine,
  toggleRoutineActive,
  logRoutine,
  getTodayRoutinesWithStatus,
  getCompletionRate,
  getLogsByRoutine,
  getRoutineById,
  updateRoutine,
  type Routine,
  type RoutineLog,
} from "./routinesStore"

type View = "today" | "all" | "detail" | "new" | "log_done" | "log_skip" | "stats"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function RoutinesView({ subView }: { subView: "list" | "stats" }) {
  const propView: View = subView === "stats" ? "stats" : "today"
  const [view, setView] = useState<View>(propView)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)
  const [, setDataVer] = useState(0)
  const bump = () => setDataVer((v) => v + 1)

  useEffect(() => {
    setView(propView)
    setSelectedIndex(0)
    setInputFocused(false)
  }, [propView])
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)

  const todayRoutines = getTodayRoutinesWithStatus()
  const allRoutines = getRoutines(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formFreq, setFormFreq] = useState("daily")
  const [formDays, setFormDays] = useState("")
  const [formTime, setFormTime] = useState("")
  const [formStep, setFormStep] = useState(0)

  const [logNote, setLogNote] = useState("")

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-routine") {
      didConsume.current = true
      setView("new"); setFormStep(0); setFormName(""); setFormDesc("")
      setFormFreq("daily"); setFormDays(""); setFormTime("")
      setInputFocused(true)
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
            setLogNote("")
            setView("log_done")
            setInputFocused(true)
          }
          break
        case "x":
          if (todayRoutines[selectedIndex]) {
            setActiveRoutine(todayRoutines[selectedIndex].routine)
            setLogNote("")
            setView("log_skip")
            setInputFocused(true)
          }
          break
        case "n": setView("new"); setFormStep(0); setFormName(""); setFormDesc(""); setInputFocused(true); break
        case "a": setView("all"); setSelectedIndex(0); break
        case "s": setView("stats"); setSelectedIndex(0); break
        case "d":
          if (todayRoutines[selectedIndex]) {
            setActiveRoutine(todayRoutines[selectedIndex].routine)
            setView("detail")
          }
          break
      }
    } else if (view === "all") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(allRoutines.length - 1, i + 1)); break
        case "t": setView("today"); setSelectedIndex(0); break
        case "n": setView("new"); setFormStep(0); setInputFocused(true); break
        case "p":
          if (allRoutines[selectedIndex]) { toggleRoutineActive(allRoutines[selectedIndex].id); bump() }
          break
        case "delete":
          if (allRoutines[selectedIndex]) { deleteRoutine(allRoutines[selectedIndex].id); setSelectedIndex(0); bump() }
          break
        case "d":
          if (allRoutines[selectedIndex]) {
            setActiveRoutine(allRoutines[selectedIndex])
            setView("detail")
          }
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
      setView("today")
      setInputFocused(false)
    }
  })

  if (view === "log_done" && activeRoutine) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#16c79a"><strong>Mark Complete: {activeRoutine.name}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Note (optional):</text>
          <input placeholder="How did it go?" value={logNote} onInput={setLogNote} onSubmit={() => {
            logRoutine(activeRoutine.id, "completed", logNote)
            setView("today")
            setInputFocused(false)
          }} focused style={{ width: 40 }} />
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
          <input placeholder="Why are you skipping?" value={logNote} onInput={setLogNote} onSubmit={() => {
            if (logNote.trim()) {
              logRoutine(activeRoutine.id, "skipped", logNote)
              setView("today")
              setInputFocused(false)
            }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to save (reason required), ESC to cancel</text>
      </box>
    )
  }

  if (view === "new") {
    const steps = [
      { label: "Routine Name:", placeholder: "e.g. Morning Gym", value: formName, setter: setFormName },
      { label: "Description:", placeholder: "Describe the routine", value: formDesc, setter: setFormDesc },
      { label: "Frequency (daily/weekly/monthly):", placeholder: "daily", value: formFreq, setter: setFormFreq },
      { label: "Days (e.g. 1,3,5 for Mon,Wed,Fri or day numbers):", placeholder: "leave empty for daily", value: formDays, setter: setFormDays },
      { label: "Preferred Time (HH:MM, optional):", placeholder: "08:00", value: formTime, setter: setFormTime },
    ]
    const step = steps[formStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Routine</strong> (Step {formStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (formStep < steps.length - 1) {
              setFormStep(formStep + 1)
            } else {
              const days = formDays ? formDays.split(",").map(Number).filter((n) => !isNaN(n)) : []
              createRoutine(formName, formDesc, formFreq, days, formTime || null)
              setView("today")
              setInputFocused(false)
            }
          }} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "detail" && activeRoutine) {
    const logs = getLogsByRoutine(activeRoutine.id, 14)
    const rate = getCompletionRate(activeRoutine.id, 30)
    const daysOfWeek: number[] = JSON.parse(activeRoutine.days_of_week || "[]")

    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{activeRoutine.name}</strong></text>
        {activeRoutine.description && <text fg="#e2e8f0">{activeRoutine.description}</text>}
        <text fg="#565f89">
          Frequency: {activeRoutine.frequency}
          {daysOfWeek.length > 0 && ` (${daysOfWeek.map((d) => DAY_NAMES[d] ?? d).join(", ")})`}
          {activeRoutine.time_of_day && ` at ${activeRoutine.time_of_day}`}
        </text>
        <box style={{ flexDirection: "row", gap: 3 }}>
          <text fg="#bb9af7">Streak: {activeRoutine.streak_count}</text>
          <text fg="#16c79a">Best: {activeRoutine.best_streak}</text>
          <text fg="#3498db">30d Rate: {rate}%</text>
        </box>
        <ProgressBar current={rate} max={100} width={30} label="Completion" />

        <text fg="#565f89">Recent Log:</text>
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {logs.map((log) => {
            const color = log.status === "completed" ? "#16c79a" : log.status === "skipped" ? "#f39c12" : "#e94560"
            const icon = log.status === "completed" ? "✓" : log.status === "skipped" ? "⊘" : "✗"
            return (
              <box key={log.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#565f89">{log.date}</text>
                <text fg={color}>{icon} {log.status}</text>
                {log.note && <text fg="#414868">{log.note}</text>}
              </box>
            )
          })}
        </scrollbox>
        <text fg="#414868">ESC to go back</text>
      </box>
    )
  }

  if (view === "stats") {
    const activeRoutines = getRoutines(true)
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Routine Statistics</strong></text>
        <text fg="#565f89">ESC to go back</text>
        {activeRoutines.length === 0 ? <EmptyState message="No routines yet" hint="" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {activeRoutines.map((r, idx) => {
              const rate = getCompletionRate(r.id, 30)
              return (
                <box key={r.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                  <box style={{ flexDirection: "row", gap: 1 }}>
                    <text fg={idx === selectedIndex ? "#7aa2f7" : "#e2e8f0"}>{idx === selectedIndex ? "▸ " : "  "}{r.name}</text>
                    <text fg="#bb9af7">Streak: {r.streak_count}</text>
                    <text fg="#16c79a">Best: {r.best_streak}</text>
                  </box>
                  <box style={{ paddingLeft: 4 }}>
                    <ProgressBar current={rate} max={100} width={25} label={`${rate}%`} />
                  </box>
                </box>
              )
            })}
          </scrollbox>
        )}
      </box>
    )
  }

  if (view === "all") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>All Routines</strong></text>
        <text fg="#565f89">[N] New [P] Toggle Active [Del] Delete [D] Detail [T] Today [ESC] Back</text>
        {allRoutines.length === 0 ? <EmptyState message="No routines" hint="Press 'N' to create" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {allRoutines.map((r, idx) => (
              <box key={r.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg={r.is_active ? "#e2e8f0" : "#414868"}>{r.name}</text>
                <text fg="#565f89">({r.frequency})</text>
                {!r.is_active && <Badge text="inactive" />}
                <text fg="#bb9af7">🔥{r.streak_count}</text>
              </box>
            ))}
          </scrollbox>
        )}
      </box>
    )
  }

  // Today view (default)
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Today's Routines</strong></text>
      <text fg="#565f89">[Enter] Done [X] Skip [N] New [A] All [S] Stats [D] Detail</text>

      {todayRoutines.length === 0 ? (
        <EmptyState message="No routines scheduled for today" hint="Press 'N' to create a new routine" />
      ) : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {todayRoutines.map(({ routine, log, isDue }, idx) => {
            let statusIcon = "○"
            let statusColor = "#565f89"
            if (log?.status === "completed") { statusIcon = "✓"; statusColor = "#16c79a" }
            else if (log?.status === "skipped") { statusIcon = "⊘"; statusColor = "#f39c12" }
            else if (!isDue) { statusIcon = "—"; statusColor = "#414868" }

            return (
              <box key={routine.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg={statusColor}>{statusIcon}</text>
                <text fg={log?.status === "completed" ? "#16c79a" : "#e2e8f0"}>{routine.name}</text>
                {routine.time_of_day && <text fg="#414868">{routine.time_of_day}</text>}
                <text fg="#bb9af7">🔥{routine.streak_count}</text>
                {log?.note && <text fg="#414868">({log.note})</text>}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
