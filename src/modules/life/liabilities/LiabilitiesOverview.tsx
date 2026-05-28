import { useState, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { setGlobalInputFocus } from "../../../utils/inputFocus"
import { Badge } from "../../../components/shared/Badge"
import { ProgressBar } from "../../../components/shared/ProgressBar"
import { CurrencyDisplay } from "../../../components/shared/CurrencyDisplay"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  getCreditCardDebts,
  getLoans,
  getUpcomingPayments,
  createCreditCardDebt,
  createLoan,
  updateCreditCardDebt,
  deleteCreditCardDebt,
  deleteLoan,
  recordPayment,
  getCreditCardDueDate,
  getCreditCardMinPayment,
  type CreditCardDebt,
  type Loan,
  type UpcomingPayment,
} from "./liabilitiesStore"
import { getAccounts, type Account } from "../budget/budgetStore"
import { getCurrency } from "../../settings/settingsStore"
import { formatCurrency } from "../../../utils/currency"
import { daysUntil, nextPaymentDate, formatDate } from "../../../utils/date"

type View = "overview" | "schedule" | "add_card" | "add_loan" | "card_detail" | "loan_detail" | "record_payment" | "update_statement"

export function LiabilitiesOverview() {
  const currency = getCurrency()
  const [view, setView] = useState<View>("overview")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputFocused, _setInputFocused] = useState(false)
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalInputFocus(v) }
  const [tab, setTab] = useState<"cards" | "loans">("cards")
  const [, setDataVer] = useState(0)
  const bump = () => setDataVer((v) => v + 1)

  const cards = getCreditCardDebts()
  const loans = getLoans()
  const upcoming = getUpcomingPayments()
  const accounts = getAccounts().filter((a) => a.type === "credit_card")
  const allAccounts = getAccounts()

  // Form states
  const [formStep, setFormStep] = useState(0)
  const [formAccIdx, setFormAccIdx] = useState(0)
  const [formStatementDate, setFormStatementDate] = useState("26")
  const [formDueDays, setFormDueDays] = useState("10")
  const [formMinRate, setFormMinRate] = useState("0.3")

  const [loanName, setLoanName] = useState("")
  const [loanType, setLoanType] = useState("personal")
  const [loanPrincipal, setLoanPrincipal] = useState("")
  const [loanRate, setLoanRate] = useState("")
  const [loanPayment, setLoanPayment] = useState("")
  const [loanStartDate, setLoanStartDate] = useState("")
  const [loanEndDate, setLoanEndDate] = useState("")
  const [loanPaymentDay, setLoanPaymentDay] = useState("1")
  const [loanInstallments, setLoanInstallments] = useState("")
  const [loanStep, setLoanStep] = useState(0)

  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentNote, setPaymentNote] = useState("")
  const [paymentTarget, setPaymentTarget] = useState<{ type: "credit_card" | "loan"; id: number } | null>(null)

  const [statementAmount, setStatementAmount] = useState("")
  const [selectedCard, setSelectedCard] = useState<CreditCardDebt | null>(null)

  const urgencyColor: Record<string, string> = { green: "#16c79a", yellow: "#f39c12", red: "#e94560", overdue: "#e94560" }

  const accountName = (id: number) => allAccounts.find((a) => a.id === id)?.name ?? "Unknown"

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("overview"); setInputFocused(false)
      return
    }

    if (inputFocused) return

    if (view === "overview") {
      switch (key.name) {
        case "tab": setTab(tab === "cards" ? "loans" : "cards"); setSelectedIndex(0); break
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": {
          const max = tab === "cards" ? cards.length - 1 : loans.length - 1
          setSelectedIndex((i) => Math.min(max, i + 1))
          break
        }
        case "s": setView("schedule"); setSelectedIndex(0); break
        case "n":
          if (tab === "cards") { setView("add_card"); setFormStep(0); setInputFocused(true) }
          else { setView("add_loan"); setLoanStep(0); setInputFocused(true) }
          break
        case "p":
          if (tab === "cards" && cards[selectedIndex]) {
            setPaymentTarget({ type: "credit_card", id: cards[selectedIndex].id })
            setPaymentAmount("")
            setPaymentNote("")
            setView("record_payment")
            setInputFocused(true)
          } else if (tab === "loans" && loans[selectedIndex]) {
            setPaymentTarget({ type: "loan", id: loans[selectedIndex].id })
            setPaymentAmount(String(loans[selectedIndex].monthly_payment))
            setPaymentNote("")
            setView("record_payment")
            setInputFocused(true)
          }
          break
        case "u":
          if (tab === "cards" && cards[selectedIndex]) {
            setSelectedCard(cards[selectedIndex])
            setStatementAmount(String(cards[selectedIndex].statement_amount))
            setView("update_statement")
            setInputFocused(true)
          }
          break
        case "x":
          if (tab === "cards" && cards[selectedIndex]) deleteCreditCardDebt(cards[selectedIndex].id)
          else if (tab === "loans" && loans[selectedIndex]) deleteLoan(loans[selectedIndex].id)
          setSelectedIndex(0); bump()
          break
      }
    } else if (view === "schedule") {
      switch (key.name) {
        case "up": setSelectedIndex((i) => Math.max(0, i - 1)); break
        case "down": setSelectedIndex((i) => Math.min(upcoming.length - 1, i + 1)); break
        case "escape": setView("overview"); break
      }
    } else if (key.name === "escape") {
      setView("overview")
      setInputFocused(false)
    }
  })

  if (view === "update_statement" && selectedCard) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Update Statement - {accountName(selectedCard.account_id)}</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Statement Amount ({currency}):</text>
          <input placeholder="0" value={statementAmount} onInput={setStatementAmount} onSubmit={() => {
            const amt = Number(statementAmount)
            updateCreditCardDebt(selectedCard.id, selectedCard.statement_date, selectedCard.due_days_after_statement, selectedCard.min_payment_rate, selectedCard.current_balance, amt, new Date().toISOString().split("T")[0])
            setView("overview")
            setInputFocused(false)
          }} focused style={{ width: 15 }} />
        </box>
        <text fg="#414868">Enter to save, ESC to cancel</text>
      </box>
    )
  }

  if (view === "record_payment" && paymentTarget) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Record Payment</strong></text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Amount ({currency}):</text>
          <input placeholder="0" value={paymentAmount} onInput={setPaymentAmount} onSubmit={() => {
            recordPayment(paymentTarget.type, paymentTarget.id, Number(paymentAmount) || 0, false, paymentNote)
            setView("overview")
            setInputFocused(false)
          }} focused style={{ width: 15 }} />
        </box>
        <text fg="#414868">Enter to record, ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_card") {
    const creditAccounts = allAccounts.filter((a) => a.type === "credit_card")
    if (creditAccounts.length === 0) {
      return (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg="#f39c12">No credit card accounts found. Add a credit card account in Budget first.</text>
          <text fg="#414868">ESC to go back</text>
        </box>
      )
    }
    const steps = [
      { label: "Statement Day (1-31):", placeholder: "26", value: formStatementDate, setter: setFormStatementDate },
      { label: "Days until due after statement:", placeholder: "10", value: formDueDays, setter: setFormDueDays },
      { label: "Min payment rate (e.g. 0.3 = 30%):", placeholder: "0.3", value: formMinRate, setter: setFormMinRate },
    ]
    const step = steps[formStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Add Credit Card Tracking</strong> (Step {formStep + 1}/{steps.length + 1})</text>
        {formStep === 0 ? (
          <box style={{ flexDirection: "column", gap: 1 }}>
            <text fg="#565f89">Select credit card account:</text>
            {creditAccounts.map((acc, i) => (
              <text key={acc.id} fg={i === formAccIdx ? "#7aa2f7" : "#e2e8f0"}>{i === formAccIdx ? "▸ " : "  "}{acc.name}</text>
            ))}
            <input placeholder="Enter to select" onSubmit={() => setFormStep(1)} focused style={{ width: 1 }} />
          </box>
        ) : (
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">{step.label}</text>
            <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
              if (formStep < steps.length) {
                setFormStep(formStep + 1)
              } else {
                const accId = creditAccounts[formAccIdx]?.id
                if (accId) createCreditCardDebt(accId, Number(formStatementDate), Number(formDueDays), Number(formMinRate))
                setView("overview")
                setInputFocused(false)
              }
            }} focused style={{ width: 15 }} />
          </box>
        )}
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "add_loan") {
    const steps = [
      { label: "Loan Name:", placeholder: "e.g. Home Mortgage", value: loanName, setter: setLoanName },
      { label: "Type (personal/mortgage/car/education/other):", placeholder: "personal", value: loanType, setter: setLoanType },
      { label: `Principal (${currency}):`, placeholder: "100000", value: loanPrincipal, setter: setLoanPrincipal },
      { label: "Interest Rate (%):", placeholder: "2.5", value: loanRate, setter: setLoanRate },
      { label: `Monthly Payment (${currency}):`, placeholder: "5000", value: loanPayment, setter: setLoanPayment },
      { label: "Start Date (YYYY-MM-DD):", placeholder: "2024-01-01", value: loanStartDate, setter: setLoanStartDate },
      { label: "End Date (YYYY-MM-DD):", placeholder: "2026-01-01", value: loanEndDate, setter: setLoanEndDate },
      { label: "Payment Day (1-31):", placeholder: "1", value: loanPaymentDay, setter: setLoanPaymentDay },
      { label: "Total Installments:", placeholder: "24", value: loanInstallments, setter: setLoanInstallments },
    ]
    const step = steps[loanStep]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Add Loan</strong> (Step {loanStep + 1}/{steps.length})</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{step.label}</text>
          <input placeholder={step.placeholder} value={step.value} onInput={step.setter} onSubmit={() => {
            if (loanStep < steps.length - 1) {
              setLoanStep(loanStep + 1)
            } else {
              createLoan(loanName, loanType, Number(loanPrincipal), Number(loanRate), Number(loanPayment), loanStartDate, loanEndDate, Number(loanPaymentDay), Number(loanInstallments))
              setView("overview")
              setInputFocused(false)
            }
          }} focused style={{ width: 30 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (view === "schedule") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>Payment Schedule</strong></text>
        <text fg="#565f89">ESC to go back</text>
        {upcoming.length === 0 ? <EmptyState message="No upcoming payments" hint="" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {upcoming.map((p, idx) => (
              <box key={`${p.type}-${p.liabilityId}`} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={idx === selectedIndex ? "#7aa2f7" : "#565f89"}>{idx === selectedIndex ? "▸" : " "}</text>
                <text fg={urgencyColor[p.urgency]} style={{ width: 12 }}>{p.dueDate}</text>
                <text fg="#e2e8f0" style={{ width: 20 }}>{p.name}</text>
                <text fg="#e2e8f0">{formatCurrency(p.amount, currency)}</text>
                {p.urgency === "overdue" ? (
                  <Badge text="OVERDUE" />
                ) : (
                  <text fg={urgencyColor[p.urgency]}>{p.daysLeft} day{p.daysLeft !== 1 ? "s" : ""} left</text>
                )}
              </box>
            ))}
          </scrollbox>
        )}
      </box>
    )
  }

  // Overview
  const totalCCDebt = cards.reduce((s, c) => s + c.current_balance, 0)
  const totalLoanDebt = loans.reduce((s, l) => s + l.remaining_balance, 0)

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>Liabilities</strong></text>

      <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor: "#292e42", padding: 1 }}>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Credit Card Debt</text>
          <text fg="#e94560">{formatCurrency(totalCCDebt, currency)}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Loan Debt</text>
          <text fg="#e94560">{formatCurrency(totalLoanDebt, currency)}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg="#565f89">Total Debt</text>
          <text fg="#e94560">{formatCurrency(totalCCDebt + totalLoanDebt, currency)}</text>
        </box>
      </box>

      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg={tab === "cards" ? "#7aa2f7" : "#565f89"} >{tab === "cards" ? "▸ " : "  "}Credit Cards</text>
        <text fg={tab === "loans" ? "#7aa2f7" : "#565f89"}>{tab === "loans" ? "▸ " : "  "}Loans</text>
        <text fg="#414868">[Tab] Switch [S] Schedule [N] New [P] Pay [U] Update Statement [X] Delete</text>
      </box>

      {tab === "cards" ? (
        cards.length === 0 ? <EmptyState message="No credit card debts tracked" hint="Press 'N' to add" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {cards.map((card, idx) => {
              const dueDate = getCreditCardDueDate(card)
              const days = daysUntil(dueDate)
              const minPay = getCreditCardMinPayment(card)
              const urgency = days < 0 ? "overdue" : days <= 3 ? "red" : days <= 7 ? "yellow" : "green"
              return (
                <box key={card.id} style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, marginBottom: 1 }}>
                  <box style={{ flexDirection: "row", gap: 1 }}>
                    <text fg={idx === selectedIndex ? "#7aa2f7" : "#e2e8f0"}>{idx === selectedIndex ? "▸ " : "  "}{accountName(card.account_id)}</text>
                    {urgency === "overdue" ? <Badge text="OVERDUE" /> : days <= 3 ? <Badge text={`Due in ${days}d`} color="#fff" bg="#e94560" /> : <Badge text={`Due in ${days}d`} color="#1a1b26" bg={urgencyColor[urgency]} />}
                  </box>
                  <text fg="#565f89">  Balance: {formatCurrency(card.current_balance, currency)} | Statement: {formatCurrency(card.statement_amount, currency)}</text>
                  <text fg="#565f89">  Min Payment: {formatCurrency(minPay, currency)} | Due: {dueDate} | Statement Day: {card.statement_date}th</text>
                </box>
              )
            })}
          </scrollbox>
        )
      ) : (
        loans.length === 0 ? <EmptyState message="No loans tracked" hint="Press 'N' to add" /> : (
          <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
            {loans.map((loan, idx) => {
              const nextDue = nextPaymentDate(loan.payment_day)
              const days = daysUntil(nextDue)
              const progress = loan.total_installments > 0 ? (loan.paid_installments / loan.total_installments) * 100 : 0
              return (
                <box key={loan.id} style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1, marginBottom: 1 }}>
                  <box style={{ flexDirection: "row", gap: 1 }}>
                    <text fg={idx === selectedIndex ? "#7aa2f7" : "#e2e8f0"}>{idx === selectedIndex ? "▸ " : "  "}{loan.name}</text>
                    <text fg="#414868">({loan.type})</text>
                    <text fg="#565f89">Next: {nextDue} ({days}d)</text>
                  </box>
                  <text fg="#565f89">  Remaining: {formatCurrency(loan.remaining_balance, currency)} | Monthly: {formatCurrency(loan.monthly_payment, currency)}</text>
                  <text fg="#565f89">  Installments: {loan.paid_installments}/{loan.total_installments} | Rate: {loan.interest_rate}%</text>
                  <box style={{ paddingLeft: 2 }}>
                    <ProgressBar current={loan.paid_installments} max={loan.total_installments} width={25} label="Progress" filledColor="#16c79a" />
                  </box>
                </box>
              )
            })}
          </scrollbox>
        )
      )}
    </box>
  )
}
