import { CurrencyDisplay } from "../../../../components/shared/CurrencyDisplay"
import { ProgressBar } from "../../../../components/shared/ProgressBar"
import { getCurrency } from "../../../settings/settingsStore"
import { formatCurrency } from "../../../../utils/currency"
import { getMonthName } from "../../../../utils/date"
import {
  getMonthlyIncome,
  getMonthlyExpense,
  getTotalBalance,
  getCategoryBudgetSummaries,
} from "../budgetStore"
import { getUpcomingRecurring } from "../recurringStore"

interface BudgetOverviewProps {
  month: number
  year: number
}

export function BudgetOverview({ month, year }: BudgetOverviewProps) {
  const currency = getCurrency()
  const income = getMonthlyIncome(month, year)
  const expense = getMonthlyExpense(month, year)
  const balance = getTotalBalance()
  const summaries = getCategoryBudgetSummaries(month, year)
  const net = income - expense

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Budget Overview</strong> — {getMonthName(month)} {year}</text>

      <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Income</text>
          <CurrencyDisplay amount={income} currency={currency} colorize />
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Expenses</text>
          <text fg="#e94560">{formatCurrency(expense, currency)}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Net</text>
          <CurrencyDisplay amount={net} currency={currency} colorize />
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Total Balance</text>
          <CurrencyDisplay amount={balance} currency={currency} colorize />
        </box>
      </box>

      {summaries.filter((s) => s.limit !== null).length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Category Budgets:</text>
          {summaries
            .filter((s) => s.limit !== null)
            .map((s) => (
              <box key={s.category.id} style={{ flexDirection: "column" }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg="#e2e8f0">{s.category.icon} {s.category.name}:</text>
                  <text fg={s.overLimit ? "#e94560" : "#e2e8f0"}>
                    {formatCurrency(s.spent, currency)} / {formatCurrency(s.limit!, currency)}
                  </text>
                  {s.overLimit && <text fg="#e94560">[+{formatCurrency(s.overAmount, currency)} OVER]</text>}
                </box>
                <ProgressBar current={s.spent} max={s.limit!} width={30} showPercentage />
              </box>
            ))}
        </box>
      )}

      {(() => {
        const upcoming = getUpcomingRecurring(4)
        if (upcoming.length === 0) return null
        return (
          <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
            <text fg="#565f89">Upcoming Recurring:</text>
            {upcoming.map((u) => {
              const color = u.recurring.type === "income" ? "#16c79a" : "#e94560"
              const sign = u.recurring.type === "income" ? "+" : "-"
              return (
                <box key={u.recurring.id} style={{ flexDirection: "row", gap: 1 }}>
                  <text fg="#565f89">{u.nextDate}</text>
                  <text fg="#e2e8f0">{u.recurring.name}</text>
                  <text fg={color}>{sign}{formatCurrency(u.recurring.amount, currency)}</text>
                  <text fg="#414868">
                    {u.daysLeft === 0 ? "today" : u.daysLeft === 1 ? "tomorrow" : `in ${u.daysLeft}d`}
                  </text>
                </box>
              )
            })}
          </box>
        )
      })()}

      <text fg="#565f89">[N] New Transaction [T] Transactions [A] Accounts [C] Categories [R] Recurring [P] Reports</text>
    </box>
  )
}
