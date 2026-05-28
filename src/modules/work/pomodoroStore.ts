import db from "../../db/connection"
import { getSetting } from "../settings/settingsStore"
import { today } from "../../utils/date"

export type PomodoroPhase = "idle" | "work" | "break"

interface PomodoroState {
  phase: PomodoroPhase
  startedAt: number
  taskId: number | null
  taskTitle: string
  sessionCount: number
}

const state: PomodoroState = {
  phase: "idle",
  startedAt: 0,
  taskId: null,
  taskTitle: "",
  sessionCount: 0,
}

export function getWorkMinutes(): number {
  return Number(getSetting("pomodoro_work_minutes") ?? "25")
}

export function getBreakMinutes(): number {
  return Number(getSetting("pomodoro_break_minutes") ?? "5")
}

export function startPomodoro(taskId: number | null = null, taskTitle = ""): void {
  state.phase = "work"
  state.startedAt = Date.now()
  state.taskId = taskId
  state.taskTitle = taskTitle
}

export function stopPomodoro(): void {
  state.phase = "idle"
  state.startedAt = 0
  state.taskId = null
  state.taskTitle = ""
}

export function getPomodoroState(): {
  phase: PomodoroPhase
  remainingSeconds: number
  taskId: number | null
  taskTitle: string
  sessionCount: number
} {
  if (state.phase === "idle") {
    return { phase: "idle", remainingSeconds: 0, taskId: null, taskTitle: "", sessionCount: state.sessionCount }
  }

  const durationMs = state.phase === "work"
    ? getWorkMinutes() * 60 * 1000
    : getBreakMinutes() * 60 * 1000

  const elapsed = Date.now() - state.startedAt
  const remaining = Math.max(0, durationMs - elapsed)

  if (remaining <= 0) {
    process.stdout.write("\x07")

    if (state.phase === "work") {
      logCompletedPomodoro(state.taskId, getWorkMinutes())
      state.sessionCount++
      state.phase = "break"
      state.startedAt = Date.now()
    } else {
      state.phase = "work"
      state.startedAt = Date.now()
    }

    const newDurationMs = state.phase === "work"
      ? getWorkMinutes() * 60 * 1000
      : getBreakMinutes() * 60 * 1000

    return {
      phase: state.phase,
      remainingSeconds: Math.ceil(newDurationMs / 1000),
      taskId: state.taskId,
      taskTitle: state.taskTitle,
      sessionCount: state.sessionCount,
    }
  }

  return {
    phase: state.phase,
    remainingSeconds: Math.ceil(remaining / 1000),
    taskId: state.taskId,
    taskTitle: state.taskTitle,
    sessionCount: state.sessionCount,
  }
}

function logCompletedPomodoro(taskId: number | null, workMinutes: number): void {
  db.prepare(
    "INSERT INTO pomodoro_logs (task_id, date, work_minutes) VALUES (?, ?, ?)",
  ).run(taskId, today(), workMinutes)
}

export function getTodayPomodoroCount(): number {
  const row = db.query(
    "SELECT COUNT(*) as cnt FROM pomodoro_logs WHERE date = ?",
  ).get(today()) as { cnt: number }
  return row.cnt
}

export function getTaskPomodoroCount(taskId: number): number {
  const row = db.query(
    "SELECT COUNT(*) as cnt FROM pomodoro_logs WHERE task_id = ?",
  ).get(taskId) as { cnt: number }
  return row.cnt
}

export function formatPomodoroTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
