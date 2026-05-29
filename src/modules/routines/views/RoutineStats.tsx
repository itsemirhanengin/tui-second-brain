import { ProgressBar } from "../../../components/shared/ProgressBar"
import { EmptyState } from "../../../components/shared/EmptyState"
import { HeatmapGrid } from "../../../components/shared/HeatmapGrid"
import { getRoutines, getCompletionRate, getWeeklyCompletionGrid, type Routine } from "../routinesStore"

interface RoutineStatsProps {
  selectedIndex: number
}

export function RoutineStats({ selectedIndex }: RoutineStatsProps) {
  const activeRoutines = getRoutines(true)
  const { grid } = getWeeklyCompletionGrid(8)

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Routine Statistics</strong></text>
      <text fg="#565f89">ESC to go back</text>

      <HeatmapGrid grid={grid} title="Completion Heatmap (8 weeks):" />

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
