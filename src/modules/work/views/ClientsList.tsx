import { useWorkStore } from "../../../stores/useWorkStore"
import { Badge } from "../../../components/shared/Badge"
import { EmptyState } from "../../../components/shared/EmptyState"
import { getCurrency } from "../../settings/settingsStore"
import { formatCurrency } from "../../../utils/currency"
import { getTasks } from "../taskStore"

interface ClientsListProps {
  selectedIndex: number
}

export function ClientsList({ selectedIndex }: ClientsListProps) {
  const currency = getCurrency()
  const { projects, clients } = useWorkStore()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Clients</strong></text>
      <text fg="#565f89">[N] New [X] Delete</text>

      {clients.length === 0 ? <EmptyState message="No clients yet" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {clients.map((c, idx) => {
            const clientProjects = projects.filter((p) => p.client_id === c.id)
            const clientTaskCount = clientProjects.reduce((sum, p) => sum + getTasks(p.id).length, 0)
            return (
              <box key={c.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                  <text fg="#e2e8f0">{c.name}</text>
                  {!c.is_active && <Badge text="inactive" />}
                  {c.company && <text fg="#414868">({c.company})</text>}
                </box>
                <box style={{ paddingLeft: 4, flexDirection: "row", gap: 2 }}>
                  {c.email && <text fg="#565f89">{c.email}</text>}
                  {c.hourly_rate > 0 && <text fg="#565f89">{formatCurrency(c.hourly_rate, currency)}/hr</text>}
                  <text fg="#565f89">{clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}</text>
                  <text fg="#565f89">{clientTaskCount} task{clientTaskCount !== 1 ? "s" : ""}</text>
                </box>
                {clientProjects.length > 0 && (
                  <box style={{ paddingLeft: 4, flexDirection: "column" }}>
                    {clientProjects.map((p) => (
                      <box key={p.id} style={{ flexDirection: "row", gap: 1 }}>
                        <text fg="#414868">└</text>
                        <text fg="#565f89">{p.name}</text>
                        <Badge text={p.status} />
                        <text fg="#414868">{getTasks(p.id).length} tasks</text>
                      </box>
                    ))}
                  </box>
                )}
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
