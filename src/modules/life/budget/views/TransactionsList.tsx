import { EmptyState } from "../../../../components/shared/EmptyState"
import { getCurrency } from "../../../settings/settingsStore"
import { formatCurrency } from "../../../../utils/currency"
import { type Transaction } from "../budgetStore"

interface TransactionsListProps {
  transactions: Transaction[]
  selectedIndex: number
}

export function TransactionsList({ transactions, selectedIndex }: TransactionsListProps) {
  const currency = getCurrency()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Transactions</strong></text>
      <text fg="#565f89">[N] New [X] Delete [ESC] Back</text>
      {transactions.length === 0 ? <EmptyState message="No transactions" hint="Press 'N' to add" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {transactions.map((tx, idx) => {
            const color = tx.type === "income" ? "#16c79a" : tx.type === "expense" ? "#e94560" : "#3498db"
            const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "↔"
            return (
              <box key={tx.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg="#565f89" style={{ width: 10 }}>{tx.date}</text>
                <text fg={color}>{sign}{formatCurrency(tx.amount, currency)}</text>
                <text fg="#e2e8f0">{tx.description || "—"}</text>
              </box>
            )
          })}
        </scrollbox>
      )}
    </box>
  )
}
