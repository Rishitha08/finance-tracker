'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BudgetFormProps {
  onClose: () => void
  onBudgetCreated: () => void
  categories: string[]
}

export default function BudgetForm({ onClose, onBudgetCreated, categories }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: field === 'month' || field === 'year' ? parseInt(value) || 0 : value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.category || !formData.amount) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Submitting budget:', formData)
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          amount: amount,
          month: formData.month,
          year: formData.year
        })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Budget created successfully:', result)
        
        // Reset form
        setFormData({
          category: 'Food',
          amount: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        })
        
        // Notify parent components
        onBudgetCreated()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Failed to create budget:', errorData)
        setError(errorData.error || 'Failed to create budget')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
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
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  style={{ color: '#1e293b', backgroundColor: 'white' }}
                >
                  {categories.map(category => (
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                  style={{ color: '#1e293b', backgroundColor: 'white' }}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 samsung-gradient text-white"
              >
                {loading ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
