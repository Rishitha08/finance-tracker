'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const categories = ['Food', 'Rent', 'Travel', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other']

interface TransactionFormProps {
  onTransactionAdded: () => void
}

export default function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          amount: '',
          description: '',
          category: 'Food',
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        })
        onTransactionAdded()
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
