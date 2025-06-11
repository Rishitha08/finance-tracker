'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CategoryFormProps {
  onAddCategory: (name: string, type: 'income' | 'expense') => Promise<boolean>
  onCancel: () => void
  defaultType?: 'income' | 'expense'
}

export default function CategoryForm({ onAddCategory, onCancel, defaultType = 'expense' }: CategoryFormProps) {
  const [categoryData, setCategoryData] = useState<{
    name: string
    type: 'income' | 'expense'
  }>({ 
    name: '', 
    type: defaultType 
  })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!categoryData.name.trim()) {
      setError('Please enter a category name')
      return
    }

    setAdding(true)
    setError('')

    try {
      const success = await onAddCategory(categoryData.name.trim(), categoryData.type)
      if (success) {
        setCategoryData({ name: '', type: defaultType })
        onCancel()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setAdding(false)
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'income' | 'expense'
    setCategoryData(prev => ({ ...prev, type: newType }))
  }

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <h4 className="font-medium text-slate-900 mb-3">Add New Category</h4>
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mb-3">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-slate-700">Category Name</Label>
          <Input
            placeholder="Enter category name"
            value={categoryData.name}
            onChange={(e) => setCategoryData(prev => ({ ...prev, name: e.target.value }))}
            style={{ color: '#1e293b', backgroundColor: 'white' }}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Type</Label>
          <select
            value={categoryData.type}
            onChange={handleTypeChange}
            className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 mt-1"
            style={{ color: '#1e293b', backgroundColor: 'white' }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>
      
      {/* Samsung-Style Buttons with Red Cancel */}
      <div className="flex space-x-3 mt-4">
        <Button
          onClick={handleSubmit}
          disabled={adding}
          className="transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981'
          }}
        >
          {adding ? 'Adding...' : 'Add Category'}
        </Button>
        
        {/* RED CANCEL BUTTON WITH WHITE TEXT */}
        <Button
          onClick={onCancel}
          disabled={adding}
          className="red-cancel-button"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
