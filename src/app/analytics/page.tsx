'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import { useCategories } from '@/hooks/useCategories'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: string
  date: string
}

interface CategoryData {
  category: string
  amount: number
  count: number
  percentage: number
}

interface User {
  id: string
  username: string
  email: string
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [filter, setFilter] = useState({
    category: 'All',
    type: 'expense',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [tempFilter, setTempFilter] = useState({
    category: 'All',
    type: 'expense',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
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
    fetchCategoryData()
  }, [])

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

  const fetchCategoryData = async () => {
    try {
      const response = await fetch(`/api/analytics/categories?type=${filter.type}`, {
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
          setCategoryData(Array.isArray(data) ? data : [])
        } catch (parseError) {
          setCategoryData([])
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
      setCategoryData([])
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
          analyzeDataWithFilters(Array.isArray(data) ? data : [], filter)
        } catch (parseError) {
          setTransactions([])
          analyzeDataWithFilters([], filter)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setTransactions([])
      analyzeDataWithFilters([], filter)
    } finally {
      setLoading(false)
    }
  }

  // Separate function to analyze data with specific filters
  const analyzeDataWithFilters = (transactions: Transaction[], filterToUse: typeof filter) => {
    console.log('Analyzing with specific filters:', filterToUse)
    console.log('Total transactions:', transactions.length)
    
    let filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      const startDate = new Date(filterToUse.startDate)
      const endDate = new Date(filterToUse.endDate)
      endDate.setHours(23, 59, 59, 999)
      
      let matchesDate = transactionDate >= startDate && transactionDate <= endDate
      let matchesCategory = filterToUse.category === 'All' || t.category === filterToUse.category
      let matchesType = filterToUse.type === 'All' || t.type === filterToUse.type
      
      return matchesDate && matchesCategory && matchesType
    })

    console.log('Filtered transactions count:', filteredTransactions.length)

    if (filteredTransactions.length === 0) {
      setCategoryData([])
      return
    }

    const categoryMap = new Map<string, { amount: number, count: number }>()
    
    filteredTransactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 }
      categoryMap.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      })
    })

    const total = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0)

    const categoryAnalysis = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: total > 0 ? Number(((data.amount / total) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.amount - a.amount)

    console.log('Category analysis result:', categoryAnalysis)
    setCategoryData(categoryAnalysis)
  }

  const handleTempFilterChange = (field: string, value: string) => {
    setTempFilter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitFilters = async () => {
    setFilterLoading(true)
    console.log('Applying filters:', tempFilter)
    
    // Update the filter state
    setFilter(tempFilter)
    
    // Re-analyze data with new filters - use tempFilter directly
    analyzeDataWithFilters(transactions, tempFilter)
    
    // Fetch fresh category data from API if needed
    try {
      const response = await fetch(`/api/analytics/categories?type=${tempFilter.type}`, {
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
          if (Array.isArray(data) && data.length > 0) {
            setCategoryData(data)
          }
        } catch (parseError) {
          console.log('Using local analysis instead of API data')
        }
      }
    } catch (error) {
      console.log('API fetch failed, using local analysis')
    }
    
    setFilterLoading(false)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      category: 'All',
      type: 'expense',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
    setTempFilter(resetFilters)
    setFilter(resetFilters)
    analyzeDataWithFilters(transactions, resetFilters)
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

  const availableCategories = getCategoriesForType(tempFilter.type)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 samsung-gradient rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">₹</span>
          </div>
          <div className="text-lg font-medium text-slate-700">Loading analytics...</div>
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
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-gray-300 mt-1">Analyze your spending patterns</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Dashboard</a>
              <a href="/analytics" className="text-white font-medium border-b-2 border-blue-400 pb-1 hover:text-blue-400 transition-colors">Analytics</a>
              <a href="/budget" className="text-gray-300 hover:text-white font-medium transition-colors hover:border-b-2 hover:border-blue-400 pb-1">Budget</a>
            </nav>

            <div className="md:hidden">
              <select onChange={(e) => router.push(e.target.value)} value="/analytics" className="px-3 py-2 border border-gray-600 rounded-lg text-white bg-gray-800" style={{ color: 'white', backgroundColor: '#374151' }}>
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
          {/* Enhanced Filters WITHOUT Add Category Button */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Analytics Filters</CardTitle>
              <p className="text-slate-600">Filter your data to get specific insights</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={tempFilter.type}
                    onChange={(e) => {
                      handleTempFilterChange('type', e.target.value)
                      handleTempFilterChange('category', 'All')
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#1e293b', backgroundColor: 'white' }}
                  >
                    <option value="All">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={tempFilter.category}
                    onChange={(e) => handleTempFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#1e293b', backgroundColor: 'white' }}
                  >
                    <option value="All">All Categories</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tempFilter.startDate}
                    onChange={(e) => handleTempFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#1e293b', backgroundColor: 'white' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tempFilter.endDate}
                    onChange={(e) => handleTempFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#1e293b', backgroundColor: 'white' }}
                  />
                </div>
              </div>

              {/* Filter Action Buttons with RED RESET BUTTON */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button 
                  onClick={handleSubmitFilters}
                  disabled={filterLoading}
                  className="samsung-gradient text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                  style={{ padding: '10px 24px', borderRadius: '16px', fontWeight: '600', fontSize: '14px' }}
                >
                  {filterLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Applying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Apply Filters</span>
                    </div>
                  )}
                </Button>
                
                {/* RED RESET BUTTON WITH WHITE TEXT */}
                <Button 
                  onClick={handleResetFilters}
                  disabled={filterLoading}
                  className="red-cancel-button"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category-wise Pie Chart with Better No Data Handling */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Category-wise Spending Distribution</CardTitle>
              <p className="text-slate-600">Visual breakdown of your expenses by category</p>
            </CardHeader>
            <CardContent>
              {filterLoading ? (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <div className="w-16 h-16 samsung-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <span className="text-white font-bold text-2xl">📊</span>
                    </div>
                    <p>Applying filters...</p>
                  </div>
                </div>
              ) : categoryData.length > 0 ? (
                <div className="w-full h-96">
                  <CategoryPieChart data={categoryData} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-slate-400 text-2xl">📊</span>
                    </div>
                    <p className="text-lg font-medium">No data matches your filters</p>
                    <p className="text-sm text-slate-400 mt-2">Try:</p>
                    <ul className="text-sm text-slate-400 mt-1 space-y-1">
                      <li>• Expanding your date range</li>
                      <li>• Selecting "All" for category or type</li>
                      <li>• Adding some transactions first</li>
                    </ul>
                    <Button 
                      onClick={handleResetFilters}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Category Breakdown */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Detailed Category Breakdown</CardTitle>
              <p className="text-slate-600">Complete analysis of your spending by category</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                      ></div>
                      <div>
                        <p className="font-medium text-slate-900 text-lg">{item.category}</p>
                        <p className="text-sm text-slate-600">{item.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-slate-600">{item.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-slate-400 text-2xl">📈</span>
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No data available</p>
                    <p className="text-slate-400 text-sm mt-1">Adjust your filters or add some transactions to see analytics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Total Transactions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {transactions.filter(t => {
                      const transactionDate = new Date(t.date)
                      const startDate = new Date(filter.startDate)
                      const endDate = new Date(filter.endDate)
                      let matchesDate = transactionDate >= startDate && transactionDate <= endDate
                      let matchesCategory = filter.category === 'All' || t.category === filter.category
                      let matchesType = filter.type === 'All' || t.type === filter.type
                      return matchesDate && matchesCategory && matchesType
                    }).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-xl">🏆</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Top Category</p>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {categoryData.length > 0 ? categoryData[0].category : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {categoryData.length > 0 ? formatCurrency(categoryData[0].amount) : '₹0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="samsung-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 text-xl">📈</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Average Transaction</p>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {formatCurrency(
                      categoryData.reduce((sum, item) => sum + item.amount, 0) / 
                      Math.max(categoryData.reduce((sum, item) => sum + item.count, 0), 1)
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Insights */}
          <Card className="samsung-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Spending Insights</CardTitle>
              <p className="text-slate-600">Smart analysis of your financial patterns</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.length > 0 && (
                  <>
                    <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-lg">💰</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          Your highest spending category is <strong>{categoryData[0]?.category}</strong>
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatCurrency(categoryData[0]?.amount || 0)} ({categoryData[0]?.percentage.toFixed(1)}% of total spending)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-lg">🔄</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          Most frequent category: <strong>{categoryData.sort((a, b) => b.count - a.count)[0]?.category}</strong>
                        </p>
                        <p className="text-sm text-slate-600">
                          {categoryData.sort((a, b) => b.count - a.count)[0]?.count} transactions in this period
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          You're spending across <strong>{categoryData.length}</strong> different categories
                        </p>
                        <p className="text-sm text-slate-600">
                          {categoryData.length >= 5 ? 'Good diversification!' : 'Consider diversifying your spending categories'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {categoryData.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-slate-400 text-2xl">💡</span>
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No insights available</p>
                    <p className="text-slate-400 text-sm mt-1">Add some transactions to see personalized insights</p>
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
