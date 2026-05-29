import { Badge } from "../../../components/shared/Badge"
import { EmptyState } from "../../../components/shared/EmptyState"
import type { Routine } from "../routinesStore"

interface AllRoutinesProps {
  routines: Routine[]
  selectedIndex: number
}

export function AllRoutines({ routines, selectedIndex }: AllRoutinesProps) {
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>All Routines</strong></text>
      <text fg="#565f89">[N] New [P] Toggle Active [Del] Delete [D] Detail [T] Today [ESC] Back</text>
      {routines.length === 0 ? <EmptyState message="No routines" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {routines.map((r, idx) => (
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
