'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BudgetComparisonChart from '@/components/charts/BudgetComparisonChart'
import { useCategories } from '@/hooks/useCategories'

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

interface Transaction {
  id: string
  amount: number
  category: string
  type: string
  date: string
}

interface User {
  id: string
  username: string
  email: string
}

interface BudgetData {
  category: string
  budget: number
  spent: number
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [budgetChartData, setBudgetChartData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Use centralized categories hook
  const { getCategoriesForType } = useCategories()

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return 'User'
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  useEffect(() => {
    fetchUserData()
    fetchData()
    fetchBudgetChartData()
  }, [])

  useEffect(() => {
    // Set default category for budget form
    const expenseCategories = getCategoriesForType('expense')
    if (expenseCategories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: expenseCategories[0] }))
    }
  }, [getCategoriesForType])

  // Recalculate budgets whenever transactions change
  useEffect(() => {
    if (transactions.length > 0 && budgets.length > 0) {
      calculateBudgetsWithTransactions()
    }
  }, [transactions])

  const fetchUserData = async () => {
    try {
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
    }
  }

  const fetchBudgetChartData = async () => {
    try {
      const response = await fetch('/api/analytics/budget-comparison', {
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
          setBudgetChartData(Array.isArray(data) ? data : [])
        } catch (parseError) {
          setBudgetChartData([])
        }
      }
    } catch (error) {
      console.error('Error fetching budget comparison data:', error)
      setBudgetChartData([])
    }
  }

  const fetchData = async () => {
    try {
      const [transactionsResponse, budgetsResponse] = await Promise.all([
        fetch('/api/transactions', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/budgets', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ])
      
      if (transactionsResponse.status === 401 || budgetsResponse.status === 401) {
        router.push('/auth/login')
        return
      }
      
      let transactionsData: Transaction[] = []
      let budgetsData: any[] = []

      if (transactionsResponse.ok) {
        const text = await transactionsResponse.text()
        try {
          transactionsData = JSON.parse(text)
          setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
        } catch (parseError) {
          setTransactions([])
        }
      }

      if (budgetsResponse.ok) {
        const text = await budgetsResponse.text()
        try {
          budgetsData = JSON.parse(text)
        } catch (parseError) {
          budgetsData = []
        }
      }

      // Calculate budgets with the fetched data
      calculateBudgets(budgetsData, transactionsData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setTransactions([])
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const calculateBudgets = (budgetsFromAPI: any[], transactionsData: Transaction[]) => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    console.log('Calculating budgets with:', {
      budgetsCount: budgetsFromAPI.length,
      transactionsCount: transactionsData.length,
      currentMonth,
      currentYear
    })

    // Group expenses by category for current month
    const categorySpending = new Map<string, number>()
    
    const currentMonthTransactions = transactionsData.filter(t => {
      const date = new Date(t.date)
      const isExpense = t.type === 'expense'
      const isCurrentMonth = date.getMonth() + 1 === currentMonth
      const isCurrentYear = date.getFullYear() === currentYear
      
      console.log('Transaction:', {
        description: t.category,
        amount: t.amount,
        date: t.date,
        isExpense,
        isCurrentMonth,
        isCurrentYear,
        include: isExpense && isCurrentMonth && isCurrentYear
      })
      
      return isExpense && isCurrentMonth && isCurrentYear
    })

    console.log('Current month expense transactions:', currentMonthTransactions.length)

    currentMonthTransactions.forEach(t => {
      const current = categorySpending.get(t.category) || 0
      categorySpending.set(t.category, current + t.amount)
      console.log(`Category ${t.category}: ${current} + ${t.amount} = ${current + t.amount}`)
    })

    console.log('Category spending map:', Object.fromEntries(categorySpending))

    const budgetData = budgetsFromAPI.map(budget => {
      const spent = categorySpending.get(budget.category) || 0
      console.log(`Budget ${budget.category}: amount=${budget.amount}, spent=${spent}`)
      
      return {
        id: budget.id,
        category: budget.category,
        amount: budget.amount,
        spent: spent,
        month: budget.month,
        year: budget.year
      }
    })

    console.log('Final budget data:', budgetData)
    setBudgets(budgetData)
  }

  const calculateBudgetsWithTransactions = () => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    // Group expenses by category for current month
    const categorySpending = new Map<string, number>()
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && 
             date.getMonth() + 1 === currentMonth && 
             date.getFullYear() === currentYear
    })

    currentMonthTransactions.forEach(t => {
      const current = categorySpending.get(t.category) || 0
      categorySpending.set(t.category, current + t.amount)
    })

    // Update budgets with new spending data
    setBudgets(prevBudgets => 
      prevBudgets.map(budget => ({
        ...budget,
        spent: categorySpending.get(budget.category) || 0
      }))
    )
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: field === 'month' || field === 'year' ? parseInt(value) || 0 : value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    setSubmitLoading(true)
    setError('')

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: amount,
          month: formData.month,
          year: formData.year
        })
      })

      if (response.ok) {
        const expenseCategories = getCategoriesForType('expense')
        setFormData({
          category: expenseCategories[0] || '',
          amount: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        })
        
        setShowForm(false)
        
        // Refresh data and recalculate
        await fetchData()
        await fetchBudgetChartData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create budget')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEditBudget = async (budgetId: string, newAmount: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(newAmount) })
      })

      if (response.ok) {
        setEditingBudget(null)
        setEditAmount('')
        await fetchData()
        await fetchBudgetChartData()
      }
    } catch (error) {
      console.error('Failed to update budget:', error)
    }
  }

  const startEditing = (budgetId: string, currentAmount: number) => {
    setEditingBudget(budgetId)
    setEditAmount(currentAmount.toString())
  }

  const cancelEditing = () => {
    setEditingBudget(null)
    setEditAmount('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
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

  const expenseCategories = getCategoriesForType('expense')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 samsung-gradient rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">₹</span>
          </div>
          <div className="text-lg font-medium text-slate-700">Loading budget...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Black Header with Samsung Blue Accents */}
      <header className="bg-black shadow-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 samsung-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">₹</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Budget</h1>
                <p className="text-gray-300 mt-1">Manage your spending limits</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Dashboard</a>
              <a href="/analytics" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Analytics</a>
              <a href="/budget" className="text-white font-medium border-b-2 border-blue-400 pb-1 hover:text-blue-400 transition-colors">Budget</a>
            </nav>

            <div className="md:hidden">
              <select onChange={(e) => router.push(e.target.value)} value="/budget" className="px-3 py-2 border border-gray-600 rounded-lg text-white bg-gray-800" style={{ color: 'white', backgroundColor: '#374151' }}>
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
          {/* Dynamic Budget vs Actual Comparison Chart */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Budget vs Actual Spending</CardTitle>
              <p className="text-slate-600">Compare your planned budget with actual spending (updates in real-time)</p>
            </CardHeader>
            <CardContent>
              <BudgetComparisonChart data={budgetChartData} />
            </CardContent>
          </Card>

          {/* Add Budget Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Monthly Budgets</h2>
            <Button 
              onClick={() => setShowForm(true)}
              className="samsung-gradient text-white"
            >
              Add Budget
            </Button>
          </div>

          {/* Budget Form Modal with RED CANCEL BUTTON */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 samsung-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Create Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={handleInputChange('category')}
                          disabled={submitLoading}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                          style={{ color: '#1e293b', backgroundColor: 'white' }}
                        >
                          {expenseCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="amount">Budget Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="Enter budget amount"
                          value={formData.amount}
                          onChange={handleInputChange('amount')}
                          required
                          disabled={submitLoading}
                          style={{ color: '#1e293b', backgroundColor: 'white' }}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="month">Month</Label>
                        <select
                          id="month"
                          value={formData.month}
                          onChange={handleInputChange('month')}
                          disabled={submitLoading}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                          style={{ color: '#1e293b', backgroundColor: 'white' }}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={handleInputChange('year')}
                          disabled={submitLoading}
                          style={{ color: '#1e293b', backgroundColor: 'white' }}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Fixed Button Styling with RED CANCEL */}
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={submitLoading}
                        className="flex-1 red-cancel-button"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitLoading}
                        className="flex-1 samsung-gradient text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                        style={{
                          padding: '10px 20px',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '14px',
                        }}
                      >
                        {submitLoading ? 'Creating...' : 'Create Budget'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Editable Budget Cards with Fixed Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
              const isOverBudget = percentage > 100
              const isEditing = editingBudget === budget.id
              
              return (
                <Card key={budget.id} className="samsung-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-lg">{budget.category}</h3>
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {budget.month}/{budget.year}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Spent: {formatCurrency(budget.spent)}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-600">Budget:</span>
                            {isEditing ? (
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="w-20 h-6 text-xs px-1"
                                  style={{ color: '#1e293b', backgroundColor: 'white' }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleEditBudget(budget.id, editAmount)}
                                  className="h-6 px-2 text-xs bg-green-500 hover:bg-green-600 text-white"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-6 px-2 text-xs bg-red-500 hover:bg-red-600 text-white"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-600">{formatCurrency(budget.amount)}</span>
                                <Button
                                  size="sm"
                                  onClick={() => startEditing(budget.id, budget.amount)}
                                  className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                  ✏️
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              isOverBudget ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            isOverBudget ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {percentage.toFixed(1)}% used
                          </span>
                          <span className={`text-sm font-medium ${
                            isOverBudget ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {isOverBudget 
                              ? `Over by ${formatCurrency(budget.spent - budget.amount)}`
                              : `${formatCurrency(budget.amount - budget.spent)} remaining`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Over Budget Alert - Now Working */}
                      {isOverBudget && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800 text-sm font-medium">Over Budget Alert!</span>
                          </div>
                          <p className="text-red-700 text-xs mt-1">
                            You've exceeded your budget by {formatCurrency(budget.spent - budget.amount)}
                          </p>
                        </div>
                      )}

                      {/* Near Budget Warning */}
                      {!isOverBudget && percentage > 80 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-800 text-sm font-medium">Budget Warning!</span>
                          </div>
                          <p className="text-yellow-700 text-xs mt-1">
                            You've used {percentage.toFixed(1)}% of your budget
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {budgets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-slate-400 text-2xl">🎯</span>
              </div>
              <p className="text-slate-500 text-lg font-medium">No budgets set yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first budget to start tracking your spending</p>
            </div>
          )}

          {/* Financial Insights */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle>Budget Insights & Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Budget</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Spent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-slate-600">Remaining</p>
                  <p className={`text-2xl font-bold ${
                    budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0))}
                  </p>
                </div>
              </div>

              {/* Spending Insights */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-slate-800 mb-4">Smart Insights</h3>
                <div className="space-y-3">
                  {budgets.length > 0 && (
                    <>
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            Top Spending Category: <strong>{budgets.sort((a, b) => b.spent - a.spent)[0]?.category}</strong>
                          </p>
                          <p className="text-xs text-slate-600">
                            {formatCurrency(budgets.sort((a, b) => b.spent - a.spent)[0]?.spent || 0)} spent this month
                          </p>
                        </div>
                      </div>

                      {budgets.filter(b => b.spent > b.amount).length > 0 && (
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm">⚠️</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              <strong>{budgets.filter(b => b.spent > b.amount).length}</strong> categories over budget
                            </p>
                            <p className="text-xs text-slate-600">
                              Consider reducing spending in: {budgets.filter(b => b.spent > b.amount).map(b => b.category).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {budgets.filter(b => b.spent <= b.amount * 0.8).length > 0 && (
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm">✅</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              Great job! <strong>{budgets.filter(b => b.spent <= b.amount * 0.8).length}</strong> categories under 80% of budget
                            </p>
                            <p className="text-xs text-slate-600">
                              You're staying within limits for: {budgets.filter(b => b.spent <= b.amount * 0.8).map(b => b.category).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
