import { EmptyState } from "../../../../components/shared/EmptyState"
import { getCurrency } from "../../../settings/settingsStore"
import { formatCurrency } from "../../../../utils/currency"
import { getRecurringTransactions, type RecurringFrequency } from "../recurringStore"
import { type Account, type Category } from "../budgetStore"

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

interface RecurringListProps {
  accounts: Account[]
  categories: Category[]
  selectedIndex: number
}

export function RecurringList({ accounts, categories, selectedIndex }: RecurringListProps) {
  const currency = getCurrency()
  const recs = getRecurringTransactions()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Recurring Transactions</strong></text>
      <text fg="#565f89">[N] New [P] Pause/Resume [X] Delete [ESC] Back</text>
      {recs.length === 0 ? <EmptyState message="No recurring transactions" hint="Press 'N' to create" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {recs.map((rec, idx) => {
            const color = rec.type === "income" ? "#16c79a" : "#e94560"
            const sign = rec.type === "income" ? "+" : "-"
            const cat = rec.category_id ? categories.find((c) => c.id === rec.category_id) : null
            const acc = accounts.find((a) => a.id === rec.account_id)
            return (
              <box key={rec.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                  <text fg={rec.is_active ? "#e2e8f0" : "#414868"}>{rec.name}</text>
                  <text fg={rec.is_active ? color : "#414868"}>{sign}{formatCurrency(rec.amount, currency)}</text>
                  <text fg="#565f89">{FREQ_LABELS[rec.frequency]}</text>
                  {rec.frequency === "monthly" && rec.day_of_month && <text fg="#414868">day {rec.day_of_month}</text>}
                  {!rec.is_active && <text fg="#f39c12">[PAUSED]</text>}
                </box>
                <box style={{ paddingLeft: 4, flexDirection: "row", gap: 2 }}>
                  {cat && <text fg="#414868">{cat.icon} {cat.name}</text>}
                  {acc && <text fg="#414868">{acc.name}</text>}
                  {rec.last_generated && <text fg="#414868">Last: {rec.last_generated}</text>}
                </box>
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
