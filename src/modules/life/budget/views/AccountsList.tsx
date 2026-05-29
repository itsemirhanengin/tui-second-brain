import { CurrencyDisplay } from "../../../../components/shared/CurrencyDisplay"
import { EmptyState } from "../../../../components/shared/EmptyState"
import { type Account } from "../budgetStore"

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: "Bank Account",
  credit_card: "Credit Card",
  cash: "Cash",
  savings: "Savings",
  investment: "Investment",
  ewallet: "E-Wallet",
}

interface AccountsListProps {
  accounts: Account[]
  selectedIndex: number
}

export function AccountsList({ accounts, selectedIndex }: AccountsListProps) {
  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Accounts</strong></text>
      <text fg="#565f89">[N] New [X] Delete [ESC] Back</text>
      {accounts.length === 0 ? <EmptyState message="No accounts" hint="Press 'N' to add" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {accounts.map((acc, idx) => (
            <box key={acc.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
              <text fg="#e2e8f0">{acc.icon} {acc.name}</text>
              <text fg="#414868">({ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type})</text>
              <CurrencyDisplay amount={acc.balance} currency={acc.currency} colorize />
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  )
}
