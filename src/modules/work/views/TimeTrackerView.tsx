import { useState } from "react"
import { useWorkStore } from "../../../stores/useWorkStore"
import { useRunningTimer } from "../../../hooks/useRunningTimer"
import { EmptyState } from "../../../components/shared/EmptyState"
import { RunningTimerBanner } from "../../../components/shared/RunningTimerBanner"
import { formatDuration } from "../../../utils/date"
import { getPomodoroState, formatPomodoroTime, getTodayPomodoroCount } from "../pomodoroStore"

interface TimeTrackerViewProps {
  selectedIndex: number
  inputFocused: boolean
  timerDesc: string
  setTimerDesc: (v: string) => void
  onStartTimer: (desc?: string) => void
  onInputFocused: (v: boolean) => void
}

export function TimeTrackerView({ selectedIndex, inputFocused, timerDesc, setTimerDesc, onStartTimer, onInputFocused }: TimeTrackerViewProps) {
  const { projects, timeEntries, getTodayTotalMinutes, getWeekTotalMinutes } = useWorkStore()
  const { runningTimer, elapsed } = useRunningTimer()

  const todayMin = getTodayTotalMinutes()
  const weekMin = getWeekTotalMinutes()

  if (inputFocused && !runningTimer) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Start Timer</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Description:</text>
          <input placeholder="What are you working on?" value={timerDesc} onInput={setTimerDesc} onSubmit={((val: string) => {
            setTimerDesc(val)
            onStartTimer(val)
          }) as any} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to start, ESC to cancel</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Time Tracker</strong></text>

      {runningTimer && <RunningTimerBanner elapsed={elapsed} description={runningTimer.description} />}

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
