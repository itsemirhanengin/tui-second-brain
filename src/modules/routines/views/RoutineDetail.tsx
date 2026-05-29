import { ProgressBar } from "../../../components/shared/ProgressBar"
import { getCompletionRate, getLogsByRoutine, type Routine } from "../routinesStore"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface RoutineDetailProps {
  routine: Routine
}

export function RoutineDetail({ routine }: RoutineDetailProps) {
  const logs = getLogsByRoutine(routine.id, 14)
  const rate = getCompletionRate(routine.id, 30)
  const daysOfWeek: number[] = JSON.parse(routine.days_of_week || "[]")

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>{routine.name}</strong></text>
      {routine.description && <text fg="#e2e8f0">{routine.description}</text>}
      <text fg="#565f89">
        Frequency: {routine.frequency}
        {daysOfWeek.length > 0 && ` (${daysOfWeek.map((d) => DAY_NAMES[d] ?? d).join(", ")})`}
        {routine.time_of_day && ` at ${routine.time_of_day}`}
      </text>
      <box style={{ flexDirection: "row", gap: 3 }}>
        <text fg="#bb9af7">Streak: {routine.streak_count}</text>
        <text fg="#16c79a">Best: {routine.best_streak}</text>
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
