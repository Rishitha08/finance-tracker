'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MonthlyExpenseChart from '@/components/charts/MonthlyExpenseChart'
import CategoryForm from '@/components/CategoryForm'
import { useCategories } from '@/hooks/useCategories'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: string
  date: string
}

interface Stats {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
}

interface User {
  id: string
  username: string
  email: string
}

interface MonthlyData {
  month: string
  amount: number
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  })
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const router = useRouter()

  // Use centralized categories hook
  const { categories, getCategoriesForType, addCategory } = useCategories()

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return 'User'
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  useEffect(() => {
    fetchUserData()
    fetchData()
    fetchMonthlyData()
  }, [])

  useEffect(() => {
    // Update default category when type changes or categories load
    const availableCategories = getCategoriesForType(formData.type)
    if (availableCategories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: availableCategories[0] }))
    }
  }, [formData.type, categories, getCategoriesForType])

  const fetchUserData = async () => {
    try {
      setUserLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (response.ok) {
        const text = await response.text()
        try {
          const userData = JSON.parse(text)
          setUser(userData)
        } catch (parseError) {
          setUser({
            id: 'fallback-user',
            username: 'User',
            email: 'user@example.com'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser({
        id: 'fallback-user',
        username: 'User',
        email: 'user@example.com'
      })
    } finally {
      setUserLoading(false)
    }
  }

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('/api/analytics/monthly', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          setMonthlyData(Array.isArray(data) ? data : [])
        } catch (parseError) {
          setMonthlyData([])
        }
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      setMonthlyData([])
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      
      if (response.ok) {
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          setTransactions(Array.isArray(data) ? data : [])
          calculateStats(Array.isArray(data) ? data : [])
        } catch (parseError) {
          setTransactions([])
          calculateStats([])
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactions: Transaction[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    setStats({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses
    })
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    const availableCategories = getCategoriesForType(newType)
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: availableCategories.length > 0 ? availableCategories[0] : ''
    }))
  }

  const handleAddCategory = async (name: string, type: 'income' | 'expense') => {
    try {
      await addCategory(name, type)
      
      // Update current form category if it matches the new type
      if (type === formData.type) {
        setFormData(prev => ({ ...prev, category: name }))
      }
      
      return true
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      const text = await response.text()

      if (response.ok) {
        try {
          const result = JSON.parse(text)
          
          // Reset form
          const defaultCategory = getCategoriesForType(formData.type)[0] || ''
          setFormData({
            amount: '',
            description: '',
            category: defaultCategory,
            type: 'expense',
            date: new Date().toISOString().split('T')[0]
          })
          
          // Refresh data
          await fetchData()
          await fetchMonthlyData()
        } catch (parseError) {
          console.error('JSON parse error for transaction response:', parseError)
        }
      } else {
        console.error('Failed to create transaction:', text)
        alert('Failed to add transaction. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/auth/login')
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchData()
        await fetchMonthlyData()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 samsung-gradient rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">₹</span>
          </div>
          <div className="text-lg font-medium text-slate-700">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Samsung-Style Black Header */}
      <header className="bg-black shadow-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 samsung-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">₹</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Finance Tracker</h1>
                <p className="text-gray-300 mt-1">Manage your personal finances</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-white font-medium border-b-2 border-blue-400 pb-1 hover:text-blue-400 transition-colors">Dashboard</a>
              <a href="/analytics" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Analytics</a>
              <a href="/budget" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Budget</a>
            </nav>

            <div className="md:hidden">
              <select onChange={(e) => router.push(e.target.value)} value="/dashboard" className="px-3 py-2 border border-gray-600 rounded-lg text-white bg-gray-800" style={{ color: 'white', backgroundColor: '#374151' }}>
                <option value="/dashboard">Dashboard</option>
                <option value="/analytics">Analytics</option>
                <option value="/budget">Budget</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-gray-900 px-4 py-3 rounded-2xl border border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg">
                  <span className="text-white font-bold text-sm">{user ? capitalizeFirstLetter(user.username).charAt(0) : 'U'}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">Welcome back,</p>
                  <p className="text-blue-400 font-medium text-xs">{user ? capitalizeFirstLetter(user.username) : 'User'}</p>
                </div>
              </div>

              <Button onClick={handleLogout} className="relative overflow-hidden group transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95" style={{ color: 'white !important', backgroundColor: 'black', border: '2px solid #3b82f6', padding: '10px 20px', borderRadius: '20px', fontWeight: '600', fontSize: '14px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)', minWidth: '100px' }}>
                <span className="relative z-10 flex items-center space-x-2" style={{ color: 'white' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span style={{ color: 'white' }}>Logout</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Message */}
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to your Financial Dashboard, {user ? capitalizeFirstLetter(user.username) : 'User'}!
            </h2>
            <p className="text-slate-600">Track your income, expenses, and achieve your financial goals</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Balance</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(stats.balance)}</p>
                    <p className={`text-sm mt-1 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.balance >= 0 ? 'Positive balance' : 'Negative balance'}
                    </p>
                  </div>
                  <div className="w-12 h-12 samsung-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">₹</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Income</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.monthlyIncome)}</p>
                    <p className="text-sm text-slate-500 mt-1">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">↑</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.monthlyExpenses)}</p>
                    <p className="text-sm text-slate-500 mt-1">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">↓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Net Savings</p>
                    <p className={`text-2xl font-bold mt-2 ${stats.monthlyIncome - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.monthlyIncome - stats.monthlyExpenses)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expense Chart */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Monthly Expense Trends</CardTitle>
              <p className="text-slate-600">Your spending patterns over the last 12 months</p>
            </CardHeader>
            <CardContent>
              <MonthlyExpenseChart data={monthlyData} />
            </CardContent>
          </Card>

          {/* Enhanced Transaction Form with Centralized Categories */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Add New Transaction</CardTitle>
              <p className="text-slate-600">Record your income or expense</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleInputChange('amount')}
                      required
                      disabled={submitLoading}
                      style={{ color: '#1e293b', backgroundColor: 'white' }}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium text-slate-700">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange('date')}
                      required
                      disabled={submitLoading}
                      style={{ color: '#1e293b', backgroundColor: 'white' }}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter transaction description"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    required
                    disabled={submitLoading}
                    style={{ color: '#1e293b', backgroundColor: 'white' }}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium text-slate-700">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={handleTypeChange}
                      disabled={submitLoading}
                      className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 mt-1"
                      style={{ color: '#1e293b', backgroundColor: 'white' }}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
                      <Button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="text-xs px-3 py-1 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        + Add
                      </Button>
                    </div>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      disabled={submitLoading}
                      className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 mt-1"
                      style={{ color: '#1e293b', backgroundColor: 'white' }}
                    >
                      {getCategoriesForType(formData.type).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Centralized Category Form with Red Cancel Button */}
                {showAddCategory && (
                  <CategoryForm
                    onAddCategory={handleAddCategory}
                    onCancel={() => setShowAddCategory(false)}
                    defaultType={formData.type as 'income' | 'expense'}
                  />
                )}

                <Button 
                  type="submit" 
                  disabled={submitLoading}
                  className="w-full samsung-button samsung-gradient text-white py-3 text-base font-semibold"
                >
                  {submitLoading ? 'Adding Transaction...' : 'Add Transaction'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Recent Transactions</CardTitle>
              <p className="text-slate-600">Your latest financial activities</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-600">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="hover:bg-red-600 transition-colors"
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-slate-400 text-2xl">📊</span>
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No transactions yet</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first transaction above to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
