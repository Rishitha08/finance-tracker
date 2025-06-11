import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    console.log('GET /api/budgets - userId:', userId)
    
    if (!userId) {
      console.log('No userId provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    console.log('Fetching budgets for month/year:', currentMonth, currentYear)

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear
      }
    })

    console.log('Found budgets:', budgets.length)
    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    console.log('POST /api/budgets - userId:', userId)
    
    if (!userId) {
      console.log('No userId provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { category, amount, month, year } = body

    // Validation
    if (!category || !amount || !month || !year) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('Invalid amount:', amount)
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Check if budget already exists for this category and month
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        category,
        month: parseInt(month),
        year: parseInt(year)
      }
    })

    console.log('Existing budget:', existingBudget)

    let budget
    if (existingBudget) {
      // Update existing budget
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: numericAmount }
      })
      console.log('Updated existing budget:', budget)
    } else {
      // Create new budget
      budget = await prisma.budget.create({
        data: {
          userId,
          category,
          amount: numericAmount,
          month: parseInt(month),
          year: parseInt(year)
        }
      })
      console.log('Created new budget:', budget)
    }

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating budget:', error)
    return NextResponse.json({ 
      error: 'Failed to create/update budget',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
