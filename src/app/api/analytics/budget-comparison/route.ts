import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get current month expenses by category
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0)

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        amount: true,
        category: true
      }
    })

    // Get user's actual budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear
      }
    })

    // Group expenses by category
    const categorySpending = new Map<string, number>()
    expenses.forEach(expense => {
      const currentAmount = categorySpending.get(expense.category) || 0
      categorySpending.set(expense.category, currentAmount + expense.amount)
    })

    // Create budget comparison data
    const budgetMap = new Map(budgets.map(b => [b.category, b.amount]))
    
    // Get all categories that have either budget or spending
    const allCategories = new Set([
      ...budgets.map(b => b.category),
      ...Array.from(categorySpending.keys())
    ])

    const result = Array.from(allCategories).map(category => ({
      category,
      budget: Number((budgetMap.get(category) || 0).toFixed(2)),
      spent: Number((categorySpending.get(category) || 0).toFixed(2))
    })).filter(item => item.budget > 0 || item.spent > 0)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching budget comparison data:', error)
    return NextResponse.json({ error: 'Failed to fetch budget comparison data' }, { status: 500 })
  }
}
