import { ProgressBar } from "../../../../components/shared/ProgressBar"
import { EmptyState } from "../../../../components/shared/EmptyState"
import { getCurrency } from "../../../settings/settingsStore"
import { formatCurrency } from "../../../../utils/currency"
import { type CategoryBudgetSummary } from "../budgetStore"

interface CategoriesListProps {
  summaries: CategoryBudgetSummary[]
  selectedIndex: number
}

export function CategoriesList({ summaries, selectedIndex }: CategoriesListProps) {
  const currency = getCurrency()

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Expense Categories & Budget Limits</strong></text>
      <text fg="#565f89">[N] New [B] Set Limit [X] Delete [ESC] Back</text>
      {summaries.length === 0 ? <EmptyState message="No categories" hint="Press 'N' to add" /> : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {summaries.filter(s => s.spent > 0 || s.limit !== null).concat(summaries.filter(s => s.spent === 0 && s.limit === null)).map((sum, idx) => (
            <box key={sum.category.id} style={{ flexDirection: "column" }}>
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg="#e2e8f0">{sum.category.icon} {sum.category.name}</text>
                <text fg={sum.overLimit ? "#e94560" : "#565f89"}>
                  {formatCurrency(sum.spent, currency)} {sum.limit !== null ? `/ ${formatCurrency(sum.limit, currency)}` : ""}
                </text>
                {sum.overLimit && <text fg="#e94560">[+{formatCurrency(sum.overAmount, currency)} OVER]</text>}
              </box>
              {sum.limit !== null && (
                <box style={{ paddingLeft: 4 }}>
                  <ProgressBar current={sum.spent} max={sum.limit} width={30} showPercentage />
                </box>
              )}
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  )
}
