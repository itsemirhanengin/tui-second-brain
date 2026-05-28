import db from "../../../db/connection"
import { currentMonth, currentYear } from "../../../utils/date"

export interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  credit_limit: number | null
  color: string
  icon: string
  is_active: number
  created_at: string
}

export interface Category {
  id: number
  name: string
  type: string
  parent_id: number | null
  monthly_limit: number | null
  color: string
  icon: string
}

export interface Transaction {
  id: number
  type: string
  amount: number
  currency: string
  description: string
  category_id: number | null
  account_id: number
  to_account_id: number | null
  date: string
  created_at: string
}

export interface BudgetEntry {
  id: number
  category_id: number
  month: number
  year: number
  limit_amount: number
}

// --- Accounts ---

export function getAccounts(activeOnly: boolean = true): Account[] {
  if (activeOnly) {
    return db.query("SELECT * FROM accounts WHERE is_active = 1 ORDER BY name").all() as Account[]
  }
  return db.query("SELECT * FROM accounts ORDER BY name").all() as Account[]
}

export function getAccountById(id: number): Account | null {
  return db.query("SELECT * FROM accounts WHERE id = ?").get(id) as Account | null
}

export function createAccount(name: string, type: string, balance: number = 0, currency: string = "TRY", creditLimit: number | null = null, color: string = "#7aa2f7", icon: string = "💳"): Account {
  const result = db.prepare("INSERT INTO accounts (name, type, balance, currency, credit_limit, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, type, balance, currency, creditLimit, color, icon)
  return getAccountById(Number(result.lastInsertRowid))!
}

export function updateAccount(id: number, name: string, type: string, currency: string, creditLimit: number | null, color: string, icon: string): void {
  db.run("UPDATE accounts SET name = ?, type = ?, currency = ?, credit_limit = ?, color = ?, icon = ? WHERE id = ?", [name, type, currency, creditLimit, color, icon, id])
}

export function updateAccountBalance(id: number, amount: number): void {
  db.run("UPDATE accounts SET balance = balance + ? WHERE id = ?", [amount, id])
}

export function setAccountBalance(id: number, balance: number): void {
  db.run("UPDATE accounts SET balance = ? WHERE id = ?", [balance, id])
}

export function toggleAccountActive(id: number): void {
  db.run("UPDATE accounts SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function deleteAccount(id: number): void {
  db.run("DELETE FROM accounts WHERE id = ?", [id])
}

export function getTotalBalance(): number {
  const row = db.query("SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE is_active = 1").get() as { total: number }
  return row.total
}

// --- Categories ---

export function getCategories(type?: string): Category[] {
  if (type) {
    return db.query("SELECT * FROM categories WHERE type = ? ORDER BY name").all(type) as Category[]
  }
  return db.query("SELECT * FROM categories ORDER BY type, name").all() as Category[]
}

export function getCategoryById(id: number): Category | null {
  return db.query("SELECT * FROM categories WHERE id = ?").get(id) as Category | null
}

export function createCategory(name: string, type: string, parentId: number | null = null, monthlyLimit: number | null = null, color: string = "#7aa2f7", icon: string = "📁"): Category {
  const result = db.prepare("INSERT INTO categories (name, type, parent_id, monthly_limit, color, icon) VALUES (?, ?, ?, ?, ?, ?)").run(name, type, parentId, monthlyLimit, color, icon)
  return getCategoryById(Number(result.lastInsertRowid))!
}

export function updateCategory(id: number, name: string, monthlyLimit: number | null, color: string, icon: string): void {
  db.run("UPDATE categories SET name = ?, monthly_limit = ?, color = ?, icon = ? WHERE id = ?", [name, monthlyLimit, color, icon, id])
}

export function deleteCategory(id: number): void {
  db.run("DELETE FROM categories WHERE id = ?", [id])
}

// --- Transactions ---

export function getTransactions(limit: number = 50, offset: number = 0): Transaction[] {
  return db.query("SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?").all(limit, offset) as Transaction[]
}

export function getTransactionsByMonth(month: number, year: number): Transaction[] {
  return db.query(`
    SELECT * FROM transactions
    WHERE CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?
    ORDER BY date DESC, created_at DESC
  `).all(month, year) as Transaction[]
}

export function getTransactionsByCategory(categoryId: number, month: number, year: number): Transaction[] {
  return db.query(`
    SELECT * FROM transactions
    WHERE category_id = ? AND CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?
    ORDER BY date DESC
  `).all(categoryId, month, year) as Transaction[]
}

export function createTransaction(type: string, amount: number, description: string, categoryId: number | null, accountId: number, toAccountId: number | null = null, date: string, currency: string = "TRY"): Transaction {
  const result = db.prepare("INSERT INTO transactions (type, amount, currency, description, category_id, account_id, to_account_id, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(type, amount, currency, description, categoryId, accountId, toAccountId, date)

  if (type === "income") {
    updateAccountBalance(accountId, amount)
  } else if (type === "expense") {
    updateAccountBalance(accountId, -amount)
  } else if (type === "transfer" && toAccountId) {
    updateAccountBalance(accountId, -amount)
    updateAccountBalance(toAccountId, amount)
  }

  return db.query("SELECT * FROM transactions WHERE id = ?").get(Number(result.lastInsertRowid)) as Transaction
}

export function deleteTransaction(id: number): void {
  const tx = db.query("SELECT * FROM transactions WHERE id = ?").get(id) as Transaction | null
  if (!tx) return

  if (tx.type === "income") {
    updateAccountBalance(tx.account_id, -tx.amount)
  } else if (tx.type === "expense") {
    updateAccountBalance(tx.account_id, tx.amount)
  } else if (tx.type === "transfer" && tx.to_account_id) {
    updateAccountBalance(tx.account_id, tx.amount)
    updateAccountBalance(tx.to_account_id, -tx.amount)
  }

  db.run("DELETE FROM transactions WHERE id = ?", [id])
}

export function getMonthlyIncome(month: number = currentMonth(), year: number = currentYear()): number {
  const row = db.query(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE type = 'income' AND CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?
  `).get(month, year) as { total: number }
  return row.total
}

export function getMonthlyExpense(month: number = currentMonth(), year: number = currentYear()): number {
  const row = db.query(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE type = 'expense' AND CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?
  `).get(month, year) as { total: number }
  return row.total
}

export function getCategorySpending(categoryId: number, month: number = currentMonth(), year: number = currentYear()): number {
  const row = db.query(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE type = 'expense' AND category_id = ? AND CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?
  `).get(categoryId, month, year) as { total: number }
  return row.total
}

// --- Budgets ---

export function getBudget(categoryId: number, month: number, year: number): BudgetEntry | null {
  return db.query("SELECT * FROM budgets WHERE category_id = ? AND month = ? AND year = ?").get(categoryId, month, year) as BudgetEntry | null
}

export function setBudget(categoryId: number, month: number, year: number, limitAmount: number): void {
  db.run("INSERT OR REPLACE INTO budgets (category_id, month, year, limit_amount) VALUES (?, ?, ?, ?)", [categoryId, month, year, limitAmount])
}

export interface CategoryBudgetSummary {
  category: Category
  spent: number
  limit: number | null
  overLimit: boolean
  overAmount: number
}

export function getMonthlyTotals(months: number = 6): { month: number; year: number; income: number; expense: number }[] {
  const results: { month: number; year: number; income: number; expense: number }[] = []
  let m = currentMonth()
  let y = currentYear()
  for (let i = 0; i < months; i++) {
    results.unshift({ month: m, year: y, income: getMonthlyIncome(m, y), expense: getMonthlyExpense(m, y) })
    m--
    if (m === 0) { m = 12; y-- }
  }
  return results
}

export function getCategoryTrend(categoryId: number, months: number = 6): { month: number; year: number; spent: number }[] {
  const results: { month: number; year: number; spent: number }[] = []
  let m = currentMonth()
  let y = currentYear()
  for (let i = 0; i < months; i++) {
    results.unshift({ month: m, year: y, spent: getCategorySpending(categoryId, m, y) })
    m--
    if (m === 0) { m = 12; y-- }
  }
  return results
}

export function getTopCategories(month: number = currentMonth(), year: number = currentYear(), limit = 5): { category: Category; spent: number }[] {
  const cats = getCategories("expense")
  const ranked = cats
    .map((cat) => ({ category: cat, spent: getCategorySpending(cat.id, month, year) }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
  return ranked.slice(0, limit)
}

export function getCategoryBudgetSummaries(month: number = currentMonth(), year: number = currentYear()): CategoryBudgetSummary[] {
  const categories = getCategories("expense")
  return categories.map((cat) => {
    const spent = getCategorySpending(cat.id, month, year)
    const budget = getBudget(cat.id, month, year)
    const limit = budget?.limit_amount ?? cat.monthly_limit
    const overLimit = limit !== null && spent > limit
    const overAmount = limit !== null ? Math.max(0, spent - limit) : 0
    return { category: cat, spent, limit, overLimit, overAmount }
  })
}
