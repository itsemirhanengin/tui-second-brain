import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { useUIStore } from "../../../stores/useUIStore"
import {
  getAccounts,
  getCategories,
  getTransactions,
  createTransaction,
  deleteTransaction,
  createAccount,
  createCategory,
  deleteAccount,
  deleteCategory,
  updateCategory,
  getCategoryBudgetSummaries,
  type Account,
  type Category,
} from "./budgetStore"
import {
  getRecurringTransactions,
  createRecurring,
  deleteRecurring,
  toggleRecurringActive,
  type RecurringFrequency,
} from "./recurringStore"
import { getCurrency } from "../../settings/settingsStore"
import { formatCurrency } from "../../../utils/currency"
import { currentMonth, currentYear, today } from "../../../utils/date"
import { BudgetOverview } from "./views/BudgetOverview"
import { TransactionsList } from "./views/TransactionsList"
import { AccountsList } from "./views/AccountsList"
import { CategoriesList } from "./views/CategoriesList"
import { RecurringList } from "./views/RecurringList"
import { BudgetReports } from "./views/BudgetReports"

type View = "overview" | "transactions" | "add_tx" | "accounts" | "add_account" | "categories" | "add_category" | "set_limit" | "recurring" | "add_recurring" | "reports"

export function BudgetDashboard() {
  const currency = getCurrency()
  const [view, setView] = useState<View>("overview")
  const [month] = useState(currentMonth())
  const [year] = useState(currentYear())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const { setInputFocused: setGlobalFocus, consumePendingAction } = useUIStore()
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalFocus(v) }

  const [txType, setTxType] = useState<"income" | "expense" | "transfer">("expense")
  const [txAmount, setTxAmount] = useState("")
  const [txDesc, setTxDesc] = useState("")
  const [txCatIdx, setTxCatIdx] = useState(0)
  const [txAccIdx, setTxAccIdx] = useState(0)
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

  const accounts = getAccounts()
  const transactions = getTransactions(30)
  const categories = getCategories()
  const expenseCategories = getCategories("expense")
  const incomeCategories = getCategories("income")
  const summaries = getCategoryBudgetSummaries(month, year)

  const accountTypes = ["bank", "credit_card", "cash", "savings", "investment", "ewallet"]

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
        case "p": setView("reports"); break
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
    } else if (view === "reports") {
      if (key.name === "escape") setView("overview")
    } else if (view === "transactions") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(transactions.length - 1, i + 1)); break
        case "n": setView("add_tx"); setTxStep(0); setInputFocused(true); break
        case "x":
          if (transactions[selectedIndex]) { deleteTransaction(transactions[selectedIndex].id); setSelectedIndex(0) }
          break
        case "escape": setView("overview"); break
      }
    } else if (view === "accounts") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(accounts.length - 1, i + 1)); break
        case "n": setView("add_account"); setAccStep(0); setAccName(""); setAccBalance(""); setInputFocused(true); break
        case "x":
          if (accounts[selectedIndex]) { deleteAccount(accounts[selectedIndex].id); setSelectedIndex(0) }
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
            setView("set_limit"); setInputFocused(true)
          }
          break
        case "x":
          if (expenseCategories[selectedIndex]) { deleteCategory(expenseCategories[selectedIndex].id); setSelectedIndex(0) }
          break
        case "escape": setView("overview"); break
      }
    } else if (key.name === "escape") {
      setView("overview"); setInputFocused(false)
    }
  })

  // --- Forms ---

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
            setView("categories"); setInputFocused(false)
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
            if (accStep < steps.length - 1) setAccStep(accStep + 1)
            else { createAccount(accName, accType, Number(accBalance) || 0, currency); setView("accounts"); setInputFocused(false) }
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
            if (catStep < steps.length - 1) setCatStep(catStep + 1)
            else { createCategory(catName, catType, null, Number(catLimit) || null); setView("categories"); setInputFocused(false) }
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
          ) : relevantCats.map((cat, i) => (
            <text key={cat.id} fg={i === recCatIdx ? "#7aa2f7" : "#565f89"}>
              {i === recCatIdx ? "▸ " : "  "}{cat.icon} {cat.name}
            </text>
          ))}
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
              createRecurring(recName.trim(), recType, Number(recAmount) || 0, catId, accId, recFreq, Number(recDay) || 1, null, today(), null)
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
              if (accId) createTransaction(txType, Number(txAmount) || 0, txDesc, catId, accId, null, today(), currency)
              setView("overview"); setInputFocused(false); setTxStep(0); setTxAmount(""); setTxDesc("")
            }} focused style={{ width: 1 }} />
          </box>
        )}
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  // --- Sub-view rendering ---

  if (view === "transactions") {
    return <TransactionsList transactions={transactions} selectedIndex={selectedIndex} />
  }

  if (view === "accounts") {
    return <AccountsList accounts={accounts} selectedIndex={selectedIndex} />
  }

  if (view === "categories") {
    return <CategoriesList summaries={summaries} selectedIndex={selectedIndex} />
  }

  if (view === "recurring") {
    return <RecurringList accounts={accounts} categories={categories} selectedIndex={selectedIndex} />
  }

  if (view === "reports") {
    return <BudgetReports month={month} year={year} />
  }

  return <BudgetOverview month={month} year={year} />
}
