import { useWorkStore } from "../../../stores/useWorkStore"
import { Badge } from "../../../components/shared/Badge"
import { EmptyState } from "../../../components/shared/EmptyState"
import { formatDuration } from "../../../utils/date"

interface ProjectsListProps {
  selectedIndex: number
}

export function ProjectsList({ selectedIndex }: ProjectsListProps) {
  const { projects, clients, getProjectTotalMinutes } = useWorkStore()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Projects</strong></text>
      <text fg="#565f89">[N] New [Enter] Detail [X] Delete</text>

      {projects.length === 0 ? <EmptyState message="No projects yet" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {projects.map((p, idx) => {
            const client = p.client_id ? clients.find((c) => c.id === p.client_id) : null
            const totalMin = getProjectTotalMinutes(p.id)
            return (
              <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg="#e2e8f0">{p.name}</text>
                <Badge text={p.status} />
                {client && <text fg="#414868">({client.name})</text>}
                <text fg="#565f89">{formatDuration(totalMin)}</text>
                {p.deadline && <text fg="#565f89">Due: {p.deadline}</text>}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
