import { EmptyState } from "../../../components/shared/EmptyState"
import { PROGRESS_ICONS, type TaskStatus } from "../taskStore"

const PROGRESS_LABELS: Record<string, string> = {
  none: "Not started",
  quarter: "Started",
  half: "Halfway",
  three_quarter: "Almost done",
  full: "Complete",
  cancelled: "Cancelled",
}

interface StatusManagerProps {
  statuses: TaskStatus[]
  selectedIndex: number
  taskCounts: Map<number, number>
}

export function StatusManager({ statuses, selectedIndex, taskCounts }: StatusManagerProps) {
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Manage Task Statuses</strong></text>
      <text fg="#565f89">[N] New [E] Edit [X] Delete [ESC] Back</text>
      {statuses.length === 0 ? <EmptyState message="No statuses" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {statuses.map((s, idx) => (
            <box key={s.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
              <text fg={s.color}>{PROGRESS_ICONS[s.progress]}</text>
              <text fg="#e2e8f0">{s.name}</text>
              <text fg={s.color}>████</text>
              <text fg="#414868">{PROGRESS_LABELS[s.progress] ?? s.progress}</text>
              <text fg="#565f89">({taskCounts.get(s.id) ?? 0} tasks)</text>
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  )
}
