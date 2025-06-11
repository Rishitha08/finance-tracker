import { useState, useEffect, useCallback } from 'react'

export interface CategorySet {
  income: string[]
  expense: string[]
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategorySet>({ income: [], expense: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error('Failed to fetch categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Set fallback categories
      setCategories({
        income: ['Salary', 'Business Income', 'Investment Returns', 'Other Income'],
        expense: ['Food & Dining', 'Rent & Housing', 'Transportation', 'Utilities', 'Other Expenses']
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategory = useCallback(async (name: string, type: 'income' | 'expense'): Promise<boolean> => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type })
      })

      if (response.ok) {
        // Refresh categories after adding
        await fetchCategories()
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add category')
      }
    } catch (err) {
      console.error('Error adding category:', err)
      throw err
    }
  }, [fetchCategories])

  const getCategoriesForType = useCallback((type: string): string[] => {
    if (type === 'income') {
      return categories.income
    } else if (type === 'expense') {
      return categories.expense
    } else {
      return [...categories.income, ...categories.expense]
    }
  }, [categories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    getCategoriesForType
  }
}
