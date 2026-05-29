import { EmptyState } from "../../../components/shared/EmptyState"
import type { Routine, RoutineLog } from "../routinesStore"

interface TodayRoutineEntry {
  routine: Routine
  log: RoutineLog | null
  isDue: boolean
}

interface TodayRoutinesProps {
  routines: TodayRoutineEntry[]
  selectedIndex: number
}

export function TodayRoutines({ routines, selectedIndex }: TodayRoutinesProps) {
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Today's Routines</strong></text>
      <text fg="#565f89">[Enter] Done [X] Skip [N] New [A] All [S] Stats [D] Detail</text>

      {routines.length === 0 ? (
        <EmptyState message="No routines scheduled for today" hint="Press 'N' to create a new routine" />
      ) : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {routines.map(({ routine, log, isDue }, idx) => {
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
