export interface User {
  id: string
  username: string
  email: string
}

export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
  date: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

export interface CategoryData {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface BudgetData {
  category: string
  budget: number
  spent: number
}

export interface CategorySet {
  income: string[]
  expense: string[]
}

export interface MonthlyData {
  month: string
  amount: number
}

export interface Stats {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
}
