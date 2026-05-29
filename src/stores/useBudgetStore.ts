import { create } from "zustand"
import {
  getAccounts,
  getCategories,
  getTransactions,
  createAccount,
  createCategory,
  createTransaction,
  deleteAccount,
  deleteCategory,
  deleteTransaction,
  getMonthlyIncome,
  getMonthlyExpense,
  getCategorySpending,
  getMonthlyTotals,
  getTopCategories,
  getCategoryBudgetSummaries,
  type Account,
  type Category,
  type Transaction,
} from "../modules/life/budget/budgetStore"
import {
  getRecurringTransactions,
  createRecurring,
  deleteRecurring,
  type RecurringTransaction,
} from "../modules/life/budget/recurringStore"

interface BudgetState {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]

  refresh: () => void
  addAccount: (name: string, type: string, balance: number) => void
  removeAccount: (id: number) => void
  addCategory: (name: string, type: string) => void
  removeCategory: (id: number) => void
  addTransaction: (type: string, amount: number, description: string, categoryId: number | null, accountId: number, date: string) => void
  removeTransaction: (id: number) => void
  addRecurring: (type: string, amount: number, description: string, categoryId: number | null, accountId: number, frequency: string) => void
  removeRecurring: (id: number) => void

  getMonthlyIncome: (month?: number, year?: number) => number
  getMonthlyExpense: (month?: number, year?: number) => number
  getCategorySpending: (categoryId: number, month?: number, year?: number) => number
  getMonthlyTotals: (months?: number) => { month: number; year: number; income: number; expense: number }[]
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  accounts: getAccounts(),
  categories: getCategories(),
  transactions: getTransactions(),
  recurringTransactions: getRecurringTransactions(),

  refresh: () => set({
    accounts: getAccounts(),
    categories: getCategories(),
    transactions: getTransactions(),
    recurringTransactions: getRecurringTransactions(),
  }),

  addAccount: (name, type, balance) => {
    createAccount(name, type, balance)
    get().refresh()
  },

  removeAccount: (id) => {
    deleteAccount(id)
    get().refresh()
  },

  addCategory: (name, type) => {
    createCategory(name, type)
    get().refresh()
  },

  removeCategory: (id) => {
    deleteCategory(id)
    get().refresh()
  },

  addTransaction: (type, amount, description, categoryId, accountId, date) => {
    createTransaction(type, amount, description, categoryId, accountId, null, date)
    get().refresh()
  },

  removeTransaction: (id) => {
    deleteTransaction(id)
    get().refresh()
  },

  addRecurring: (type, amount, description, categoryId, accountId, frequency) => {
    createRecurring(description, type as "income" | "expense", amount, categoryId, accountId, frequency as any, 1, null)
    get().refresh()
  },

  removeRecurring: (id) => {
    deleteRecurring(id)
    get().refresh()
  },

  getMonthlyIncome,
  getMonthlyExpense,
  getCategorySpending,
  getMonthlyTotals,
}))
