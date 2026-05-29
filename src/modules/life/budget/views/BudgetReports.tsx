import { getCurrency } from "../../../settings/settingsStore"
import { formatCurrency } from "../../../../utils/currency"
import { getMonthName } from "../../../../utils/date"
import { asciiPieChart } from "../../../../utils/charts"
import {
  getMonthlyExpense,
  getMonthlyTotals,
  getTopCategories,
} from "../budgetStore"

interface BudgetReportsProps {
  month: number
  year: number
}

export function BudgetReports({ month, year }: BudgetReportsProps) {
  const currency = getCurrency()
  const expense = getMonthlyExpense(month, year)
  const monthlyData = getMonthlyTotals(6)
  const topCats = getTopCategories(month, year, 5)
  const maxExpense = Math.max(...monthlyData.map((d) => d.expense), 1)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevExpense = getMonthlyExpense(prevMonth, prevYear)
  const momChange = prevExpense > 0 ? ((expense - prevExpense) / prevExpense * 100) : 0

  const barWidth = 20
  const makeBar = (val: number, max: number, ch = "█") => {
    const filled = max > 0 ? Math.round((val / max) * barWidth) : 0
    return ch.repeat(filled) + "░".repeat(barWidth - filled)
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Budget Reports</strong></text>
      <text fg="#565f89">[ESC] Back</text>

      <box style={{ flexDirection: "column", borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
        <text fg="#565f89">Month-over-Month:</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#e2e8f0">This month: {formatCurrency(expense, currency)}</text>
          <text fg="#565f89">vs</text>
          <text fg="#e2e8f0">Last month: {formatCurrency(prevExpense, currency)}</text>
          {momChange !== 0 && (
            <text fg={momChange > 0 ? "#e94560" : "#16c79a"}>
              ({momChange > 0 ? "+" : ""}{momChange.toFixed(1)}%)
            </text>
          )}
        </box>
      </box>

      <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
        <text fg="#565f89">Expense Trend (Last 6 Months):</text>
        {monthlyData.map((d) => (
          <box key={`${d.month}-${d.year}`} style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89" style={{ width: 8 }}>{getMonthName(d.month)} {String(d.year).slice(2)}</text>
            <text fg="#e94560">{makeBar(d.expense, maxExpense)}</text>
            <text fg="#e2e8f0">{formatCurrency(d.expense, currency)}</text>
          </box>
        ))}
      </box>

      <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
        <text fg="#565f89">Income vs Expense (Last 6 Months):</text>
        {monthlyData.map((d) => {
          const maxVal = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expense)), 1)
          return (
            <box key={`ie-${d.month}-${d.year}`} style={{ flexDirection: "column" }}>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#565f89" style={{ width: 8 }}>{getMonthName(d.month)} {String(d.year).slice(2)}</text>
                <text fg="#16c79a">{makeBar(d.income, maxVal, "▓")}</text>
                <text fg="#16c79a">{formatCurrency(d.income, currency)}</text>
              </box>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg="#565f89" style={{ width: 8 }}>{""}</text>
                <text fg="#e94560">{makeBar(d.expense, maxVal)}</text>
                <text fg="#e94560">{formatCurrency(d.expense, currency)}</text>
              </box>
            </box>
          )
        })}
      </box>

      {topCats.length > 0 && (
        <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
          <text fg="#565f89">Top Spending Categories ({getMonthName(month)}):</text>
          {topCats.map((c, i) => (
            <box key={c.category.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg="#565f89">{i + 1}.</text>
              <text fg="#e2e8f0">{c.category.icon} {c.category.name}</text>
              <text fg="#e94560">{formatCurrency(c.spent, currency)}</text>
              <text fg="#565f89">{makeBar(c.spent, topCats[0].spent, "▪")}</text>
            </box>
          ))}
        </box>
      )}

      {(() => {
        const pieColors = ["#e94560", "#f39c12", "#3498db", "#bb9af7", "#16c79a", "#7aa2f7", "#e67e22", "#9b59b6"]
        const pieSlices = topCats.map((c, i) => ({
          label: `${c.category.icon} ${c.category.name}`,
          value: c.spent,
          color: pieColors[i % pieColors.length],
        }))
        const pie = asciiPieChart(pieSlices, 25)
        if (pie.length === 0) return null
        return (
          <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
            <text fg="#565f89">Category Breakdown:</text>
            {pie.map((s) => (
              <box key={s.label} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={s.color}>{s.bar}</text>
                <text fg="#e2e8f0">{s.label}</text>
                <text fg="#565f89">{s.pct.toFixed(1)}%</text>
              </box>
            ))}
          </box>
        )
      })()}
    </box>
  )
}
