import { useState, useCallback, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../../utils/pendingAction"
import { ProgressBar } from "../../../components/shared/ProgressBar"
import { CurrencyDisplay } from "../../../components/shared/CurrencyDisplay"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  getMonthlyIncome,
  getMonthlyExpense,
  getTotalBalance,
  getCategoryBudgetSummaries,
  getAccounts,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getCategories,
  createAccount,
  createCategory,
  deleteAccount,
  deleteCategory,
  updateCategory,
  type Account,
  type Category,
  type Transaction,
  type CategoryBudgetSummary,
} from "./budgetStore"
import {
  getRecurringTransactions,
  createRecurring,
  deleteRecurring,
  toggleRecurringActive,
  getUpcomingRecurring,
  type RecurringTransaction,
  type RecurringFrequency,
} from "./recurringStore"
import { getCurrency } from "../../settings/settingsStore"
import { formatCurrency } from "../../../utils/currency"
import { currentMonth, currentYear, getMonthName, today } from "../../../utils/date"

type View = "overview" | "transactions" | "add_tx" | "accounts" | "add_account" | "categories" | "add_category" | "set_limit" | "recurring" | "add_recurring"

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

export function BudgetDashboard() {
  const currency = getCurrency()
  const [view, setView] = useState<View>("overview")
  const [month] = useState(currentMonth())
  const [year] = useState(currentYear())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)

  // Form states
  const [txType, setTxType] = useState<"income" | "expense" | "transfer">("expense")
  const [txAmount, setTxAmount] = useState("")
  const [txDesc, setTxDesc] = useState("")
  const [txCatIdx, setTxCatIdx] = useState(0)
  const [txAccIdx, setTxAccIdx] = useState(0)
  const [txToAccIdx, setTxToAccIdx] = useState(0)
  const [txStep, setTxStep] = useState(0)

  const [accName, setAccName] = useState("")
  const [accType, setAccType] = useState("bank")
  const [accBalance, setAccBalance] = useState("")
  const [accStep, setAccStep] = useState(0)

  const [catName, setCatName] = useState("")
  const [catType, setCatType] = useState<"income" | "expense">("expense")
  const [catLimit, setCatLimit] = useState("")
  const [catStep, setCatStep] = useState(0)

  const [limitInput, setLimitInput] = useState("")

  const [recName, setRecName] = useState("")
  const [recType, setRecType] = useState<"income" | "expense">("expense")
  const [recAmount, setRecAmount] = useState("")
  const [recFreq, setRecFreq] = useState<RecurringFrequency>("monthly")
  const [recDay, setRecDay] = useState("1")
  const [recCatIdx, setRecCatIdx] = useState(0)
  const [recAccIdx, setRecAccIdx] = useState(0)
  const [recStep, setRecStep] = useState(0)

  const income = getMonthlyIncome(month, year)
  const expense = getMonthlyExpense(month, year)
  const balance = getTotalBalance()
  const summaries = getCategoryBudgetSummaries(month, year)
  const accounts = getAccounts()
  const transactions = getTransactions(30)
  const categories = getCategories()
  const expenseCategories = getCategories("expense")
  const incomeCategories = getCategories("income")

  const accountTypes = ["bank", "credit_card", "cash", "savings", "investment", "ewallet"]
  const accountTypeLabels: Record<string, string> = {
    bank: "Bank Account",
    credit_card: "Credit Card",
    cash: "Cash",
    savings: "Savings",
    investment: "Investment",
    ewallet: "E-Wallet",
  }

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-transaction") {
      didConsume.current = true
      setView("add_tx"); setTxStep(0); setTxAmount(""); setTxDesc("")
      setTxType("expense"); setInputFocused(true)
    } else if (action === "new-recurring") {
      didConsume.current = true
      setRecName(""); setRecType("expense"); setRecAmount(""); setRecFreq("monthly")
      setRecDay("1"); setRecCatIdx(0); setRecAccIdx(0); setRecStep(0)
      setView("add_recurring"); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("overview"); setInputFocused(false)
      return
    }

    if (view === "add_recurring") {
      const relevantCats = recType === "income" ? incomeCategories : expenseCategories
      const textCount = 5
      if (recStep === textCount) {
        if (key.name === "up") { setRecCatIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "down") { setRecCatIdx((i) => Math.min(relevantCats.length - 1, i + 1)); return }
      } else if (recStep === textCount + 1) {
        if (key.name === "up") { setRecAccIdx((i) => Math.max(0, i - 1)); return }
        if (key.name === "down") { setRecAccIdx((i) => Math.min(accounts.length - 1, i + 1)); return }
      }
    }

    if (inputFocused) return

    if (view === "overview") {
      switch (key.name) {
        case "t": setView("transactions"); setSelectedIndex(0); break
        case "a": setView("accounts"); setSelectedIndex(0); break
        case "c": setView("categories"); setSelectedIndex(0); break
        case "r": setView("recurring"); setSelectedIndex(0); break
        case "n": setView("add_tx"); setTxStep(0); setInputFocused(true); break
      }
    } else if (view === "recurring") {
      const recs = getRecurringTransactions()
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(recs.length - 1, i + 1)); break
        case "n":
          setRecName(""); setRecType("expense"); setRecAmount(""); setRecFreq("monthly")
          setRecDay("1"); setRecCatIdx(0); setRecAccIdx(0); setRecStep(0)
          setView("add_recurring"); setInputFocused(true)
          break
        case "p":
          if (recs[selectedIndex]) toggleRecurringActive(recs[selectedIndex].id)
          break
        case "x":
          if (recs[selectedIndex]) { deleteRecurring(recs[selectedIndex].id); setSelectedIndex(Math.max(0, selectedIndex - 1)) }
          break
        case "escape": setView("overview"); break
      }
    } else if (view === "transactions") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(transactions.length - 1, i + 1)); break
        case "n": setView("add_tx"); setTxStep(0); setInputFocused(true); break
        case "x":
          if (transactions[selectedIndex]) {
            deleteTransaction(transactions[selectedIndex].id)
            setSelectedIndex(0)
          }
          break
        case "escape": setView("overview"); break
      }
    } else if (view === "accounts") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(accounts.length - 1, i + 1)); break
        case "n": setView("add_account"); setAccStep(0); setAccName(""); setAccBalance(""); setInputFocused(true); break
        case "x":
          if (accounts[selectedIndex]) {
            deleteAccount(accounts[selectedIndex].id)
            setSelectedIndex(0)
          }
          break
        case "escape": setView("overview"); break
      }
    } else if (view === "categories") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(expenseCategories.length - 1, i + 1)); break
        case "n": setView("add_category"); setCatStep(0); setCatName(""); setCatLimit(""); setInputFocused(true); break
        case "b":
          if (expenseCategories[selectedIndex]) {
            setLimitInput(String(expenseCategories[selectedIndex].monthly_limit ?? ""))
            setView("set_limit")
            setInputFocused(true)
          }
          break
        case "x":
          if (expenseCategories[selectedIndex]) {
            deleteCategory(expenseCategories[selectedIndex].id)
            setSelectedIndex(0)
          }
          break
        case "escape": setView("overview"); break
      }
    } else if (key.name === "escape") {
      setView("overview")
      setInputFocused(false)
    }
  })

  if (view === "set_limit" && expenseCategories[selectedIndex]) {
    const cat = expenseCategories[selectedIndex]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Set Budget Limit: {cat.name}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Monthly Limit ({currency}):</text>
          <input placeholder="e.g. 5000" value={limitInput} onInput={setLimitInput} onSubmit={() => {
            const val = Number(limitInput)
            updateCategory(cat.id, cat.name, val > 0 ? val : null, cat.color, cat.icon)
            setView("categories")
            setInputFocused(false)
          }} focused style={{ width: 15 }} />
        </box>
        <text fg="#414868">Enter to save (0 or empty to remove limit), ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_account") {
    const steps = [
      { label: "Account Name:", placeholder: "e.g. Ziraat Bank", value: accName, setter: setAccName },
      { label: `Type (${accountTypes.join("/")})`, placeholder: "bank", value: accType, setter: setAccType },
      { label: `Initial Balance (${currency}):`, placeholder: "0", value: accBalance, setter: setAccBalance },
    ]
    const step = steps[accStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Account</strong> (Step {accStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (accStep < steps.length - 1) {
              setAccStep(accStep + 1)
            } else {
              createAccount(accName, accType, Number(accBalance) || 0, currency)
              setView("accounts")
              setInputFocused(false)
            }
          }} focused style={{ width: 30 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_category") {
    const steps = [
      { label: "Category Name:", placeholder: "e.g. Groceries", value: catName, setter: setCatName },
      { label: "Type (income/expense):", placeholder: "expense", value: catType, setter: (v: string) => setCatType(v as "income" | "expense") },
      { label: `Monthly Limit (${currency}, 0 for none):`, placeholder: "0", value: catLimit, setter: setCatLimit },
    ]
    const step = steps[catStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Category</strong> (Step {catStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (catStep < steps.length - 1) {
              setCatStep(catStep + 1)
            } else {
              const limit = Number(catLimit) || null
              createCategory(catName, catType, null, limit)
              setView("categories")
              setInputFocused(false)
            }
          }} focused style={{ width: 30 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_recurring") {
    const textSteps = [
      { label: "Name (e.g. Rent, Netflix):", placeholder: "Netflix", value: recName, setter: setRecName },
      { label: "Type (income/expense):", placeholder: "expense", value: recType, setter: (v: string) => setRecType(v as "income" | "expense") },
      { label: `Amount (${currency}):`, placeholder: "0", value: recAmount, setter: setRecAmount },
      { label: "Frequency (daily/weekly/biweekly/monthly/yearly):", placeholder: "monthly", value: recFreq, setter: (v: string) => setRecFreq(v as RecurringFrequency) },
      { label: "Day of month (1-31, for monthly/yearly):", placeholder: "1", value: recDay, setter: setRecDay },
    ]
    const relevantCats = recType === "income" ? incomeCategories : expenseCategories

    if (recStep < textSteps.length) {
      const step = textSteps[recStep]
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Recurring</strong> (Step {recStep + 1}/{textSteps.length + 2})</text>
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">{step.label}</text>
            <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => setRecStep(recStep + 1)} focused style={{ width: 30 }} />
          </box>
          <text fg="#414868">Enter to continue, ESC to cancel</text>
        </box>
      )
    }
    if (recStep === textSteps.length) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Recurring</strong> — Category (Step {recStep + 1}/{textSteps.length + 2})</text>
          {relevantCats.length === 0 ? (
            <text fg="#565f89">No categories for {recType}</text>
          ) : (
            relevantCats.map((cat, i) => (
              <text key={cat.id} fg={i === recCatIdx ? "#7aa2f7" : "#565f89"}>
                {i === recCatIdx ? "▸ " : "  "}{cat.icon} {cat.name}
              </text>
            ))
          )}
          <text fg="#414868">Up/Down to pick, Enter to continue</text>
          <input placeholder="" onSubmit={() => setRecStep(recStep + 1)} focused style={{ width: 1 }} />
        </box>
      )
    }
    if (recStep === textSteps.length + 1) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#7aa2f7"><strong>New Recurring</strong> — Account (Step {recStep + 1}/{textSteps.length + 2})</text>
          {accounts.map((acc, i) => (
            <text key={acc.id} fg={i === recAccIdx ? "#7aa2f7" : "#565f89"}>
              {i === recAccIdx ? "▸ " : "  "}{acc.name} ({formatCurrency(acc.balance, currency)})
            </text>
          ))}
          <text fg="#414868">Up/Down to pick, Enter to create</text>
          <input placeholder="" onSubmit={() => {
            const catId = (recType === "income" ? incomeCategories : expenseCategories)[recCatIdx]?.id ?? null
            const accId = accounts[recAccIdx]?.id
            if (accId && recName.trim()) {
              createRecurring(
                recName.trim(), recType, Number(recAmount) || 0, catId, accId,
                recFreq, Number(recDay) || 1, null, today(), null,
              )
            }
            setView("recurring"); setInputFocused(false)
          }} focused style={{ width: 1 }} />
        </box>
      )
    }
  }

  if (view === "add_tx") {
    const relevantCats = txType === "income" ? incomeCategories : txType === "expense" ? expenseCategories : []
    const steps = [
      { label: "Type (income/expense/transfer):", placeholder: "expense", value: txType, setter: (v: string) => setTxType(v as "income" | "expense" | "transfer") },
      { label: `Amount (${currency}):`, placeholder: "0", value: txAmount, setter: setTxAmount },
      { label: "Description:", placeholder: "e.g. Lunch at restaurant", value: txDesc, setter: setTxDesc },
    ]
    const step = steps[txStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Transaction</strong> (Step {txStep + 1}/{steps.length + 1})</text>
        {txStep < steps.length ? (
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">{step.label}</text>
            <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => setTxStep(txStep + 1)} focused style={{ width: 30 }} />
          </box>
        ) : (
          <box style={{ flexDirection: "column", gap: 1 }}>
            <text fg="#565f89">Select account (index):</text>
            {accounts.map((acc, i) => <text key={acc.id} fg={i === txAccIdx ? "#7aa2f7" : "#e2e8f0"}>{i === txAccIdx ? "▸ " : "  "}{acc.name} ({formatCurrency(acc.balance, currency)})</text>)}
            <input placeholder="Press Enter to confirm" onSubmit={() => {
              const catId = relevantCats[txCatIdx]?.id ?? null
              const accId = accounts[txAccIdx]?.id
              if (accId) {
                createTransaction(txType, Number(txAmount) || 0, txDesc, catId, accId, null, today(), currency)
              }
              setView("overview")
              setInputFocused(false)
              setTxStep(0)
              setTxAmount("")
              setTxDesc("")
            }} focused style={{ width: 1 }} />
          </box>
        )}
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "transactions") {
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

  if (view === "accounts") {
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
                <text fg="#414868">({accountTypeLabels[acc.type] ?? acc.type})</text>
                <CurrencyDisplay amount={acc.balance} currency={acc.currency} colorize />
              </box>
            ))}
          </scrollbox>
        )}
      </box>
    )
  }

  if (view === "categories") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Expense Categories & Budget Limits</strong></text>
        <text fg="#565f89">[N] New [B] Set Limit [X] Delete [ESC] Back</text>
        {expenseCategories.length === 0 ? <EmptyState message="No categories" hint="Press 'N' to add" /> : (
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

  if (view === "recurring") {
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

  // Overview
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

      <text fg="#565f89">[N] New Transaction [T] Transactions [A] Accounts [C] Categories [R] Recurring</text>
    </box>
  )
}
