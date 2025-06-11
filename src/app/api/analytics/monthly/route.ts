import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching monthly data for user:', userId)

    // Get transactions from last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        amount: true,
        date: true
      }
    })

    console.log(`Found ${transactions.length} transactions for monthly analysis`)

    // Group by month with proper date handling
    const monthlyData = new Map<string, number>()
    
    // Initialize last 12 months with zero values
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyData.set(monthKey, 0)
    }
    
    // Add actual transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const currentAmount = monthlyData.get(monthKey) || 0
      monthlyData.set(monthKey, currentAmount + transaction.amount)
    })

    const result = Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2))
    }))

    console.log('Monthly data result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching monthly data:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly data' }, { status: 500 })
  }
}
