import db from "../../../db/connection"
import { today, nextPaymentDate, addDays, daysUntil } from "../../../utils/date"

export interface CreditCardDebt {
  id: number
  account_id: number
  statement_date: number
  due_days_after_statement: number
  min_payment_rate: number
  current_balance: number
  statement_amount: number
  last_statement_date: string | null
}

export interface Loan {
  id: number
  name: string
  type: string
  principal: number
  interest_rate: number
  monthly_payment: number
  start_date: string
  end_date: string
  remaining_balance: number
  payment_day: number
  total_installments: number
  paid_installments: number
  created_at: string
}

export interface LiabilityPayment {
  id: number
  liability_type: string
  liability_id: number
  amount: number
  payment_date: string
  is_minimum: number
  note: string
}

export interface UpcomingPayment {
  name: string
  type: "credit_card" | "loan"
  amount: number
  dueDate: string
  daysLeft: number
  urgency: "green" | "yellow" | "red" | "overdue"
  liabilityId: number
}

// --- Credit Cards ---

export function getCreditCardDebts(): CreditCardDebt[] {
  return db.query("SELECT * FROM credit_card_debts ORDER BY id").all() as CreditCardDebt[]
}

export function getCreditCardDebtById(id: number): CreditCardDebt | null {
  return db.query("SELECT * FROM credit_card_debts WHERE id = ?").get(id) as CreditCardDebt | null
}

export function createCreditCardDebt(accountId: number, statementDate: number, dueDays: number = 10, minPaymentRate: number = 0.3): CreditCardDebt {
  const result = db.prepare("INSERT INTO credit_card_debts (account_id, statement_date, due_days_after_statement, min_payment_rate) VALUES (?, ?, ?, ?)").run(accountId, statementDate, dueDays, minPaymentRate)
  return getCreditCardDebtById(Number(result.lastInsertRowid))!
}

export function updateCreditCardDebt(id: number, statementDate: number, dueDays: number, minPaymentRate: number, currentBalance: number, statementAmount: number, lastStatementDate: string | null): void {
  db.run(
    "UPDATE credit_card_debts SET statement_date = ?, due_days_after_statement = ?, min_payment_rate = ?, current_balance = ?, statement_amount = ?, last_statement_date = ? WHERE id = ?",
    [statementDate, dueDays, minPaymentRate, currentBalance, statementAmount, lastStatementDate, id]
  )
}

export function deleteCreditCardDebt(id: number): void {
  db.run("DELETE FROM credit_card_debts WHERE id = ?", [id])
}

export function getCreditCardDueDate(card: CreditCardDebt): string {
  const statementDateStr = nextPaymentDate(card.statement_date)
  return addDays(statementDateStr, card.due_days_after_statement)
}

export function getCreditCardMinPayment(card: CreditCardDebt): number {
  return card.statement_amount * card.min_payment_rate
}

// --- Loans ---

export function getLoans(): Loan[] {
  return db.query("SELECT * FROM loans ORDER BY name").all() as Loan[]
}

export function getLoanById(id: number): Loan | null {
  return db.query("SELECT * FROM loans WHERE id = ?").get(id) as Loan | null
}

export function createLoan(name: string, type: string, principal: number, interestRate: number, monthlyPayment: number, startDate: string, endDate: string, paymentDay: number, totalInstallments: number): Loan {
  const result = db.prepare(
    "INSERT INTO loans (name, type, principal, interest_rate, monthly_payment, start_date, end_date, remaining_balance, payment_day, total_installments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(name, type, principal, interestRate, monthlyPayment, startDate, endDate, principal, paymentDay, totalInstallments)
  return getLoanById(Number(result.lastInsertRowid))!
}

export function updateLoan(id: number, name: string, monthlyPayment: number, remainingBalance: number, paidInstallments: number): void {
  db.run("UPDATE loans SET name = ?, monthly_payment = ?, remaining_balance = ?, paid_installments = ? WHERE id = ?", [name, monthlyPayment, remainingBalance, paidInstallments, id])
}

export function deleteLoan(id: number): void {
  db.run("DELETE FROM loans WHERE id = ?", [id])
}

export function recordLoanPayment(loanId: number, amount: number): void {
  db.run("INSERT INTO liability_payments (liability_type, liability_id, amount, payment_date) VALUES ('loan', ?, ?, ?)", [loanId, amount, today()])
  db.run("UPDATE loans SET remaining_balance = remaining_balance - ?, paid_installments = paid_installments + 1 WHERE id = ?", [amount, loanId])
}

// --- Payments ---

export function recordPayment(liabilityType: string, liabilityId: number, amount: number, isMinimum: boolean = false, note: string = ""): void {
  db.run("INSERT INTO liability_payments (liability_type, liability_id, amount, payment_date, is_minimum, note) VALUES (?, ?, ?, ?, ?, ?)", [liabilityType, liabilityId, amount, today(), isMinimum ? 1 : 0, note])

  if (liabilityType === "credit_card") {
    db.run("UPDATE credit_card_debts SET current_balance = current_balance - ? WHERE id = ?", [amount, liabilityId])
  } else {
    db.run("UPDATE loans SET remaining_balance = remaining_balance - ?, paid_installments = paid_installments + 1 WHERE id = ?", [amount, liabilityId])
  }
}

export function getPaymentHistory(liabilityType: string, liabilityId: number): LiabilityPayment[] {
  return db.query("SELECT * FROM liability_payments WHERE liability_type = ? AND liability_id = ? ORDER BY payment_date DESC").all(liabilityType, liabilityId) as LiabilityPayment[]
}

// --- Upcoming Payments ---

export function getUpcomingPayments(): UpcomingPayment[] {
  const payments: UpcomingPayment[] = []

  const cards = getCreditCardDebts()
  const accountNames = new Map<number, string>()
  const accountRows = db.query("SELECT id, name FROM accounts").all() as { id: number; name: string }[]
  for (const a of accountRows) accountNames.set(a.id, a.name)

  for (const card of cards) {
    if (card.statement_amount <= 0 && card.current_balance <= 0) continue
    const dueDate = getCreditCardDueDate(card)
    const days = daysUntil(dueDate)
    payments.push({
      name: accountNames.get(card.account_id) ?? "Credit Card",
      type: "credit_card",
      amount: card.statement_amount > 0 ? card.statement_amount : card.current_balance,
      dueDate,
      daysLeft: days,
      urgency: days < 0 ? "overdue" : days <= 3 ? "red" : days <= 7 ? "yellow" : "green",
      liabilityId: card.id,
    })
  }

  const loans = getLoans()
  for (const loan of loans) {
    if (loan.remaining_balance <= 0) continue
    const dueDate = nextPaymentDate(loan.payment_day)
    const days = daysUntil(dueDate)
    payments.push({
      name: loan.name,
      type: "loan",
      amount: loan.monthly_payment,
      dueDate,
      daysLeft: days,
      urgency: days < 0 ? "overdue" : days <= 3 ? "red" : days <= 7 ? "yellow" : "green",
      liabilityId: loan.id,
    })
  }

  payments.sort((a, b) => a.daysLeft - b.daysLeft)
  return payments
}
