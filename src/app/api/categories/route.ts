import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultCategories } from '@/lib/categories'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get custom categories for user
    const customCategories = await prisma.customCategory.findMany({
      where: { userId },
      select: {
        name: true,
        type: true
      }
    })

    // Combine default and custom categories
    const incomeCategories = [
      ...defaultCategories.income,
      ...customCategories.filter(c => c.type === 'income').map(c => c.name)
    ]

    const expenseCategories = [
      ...defaultCategories.expense,
      ...customCategories.filter(c => c.type === 'expense').map(c => c.name)
    ]

    return NextResponse.json({
      income: incomeCategories,
      expense: expenseCategories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type } = body

    // Validate input
    if (!name || !type || !['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Invalid category data' }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await prisma.customCategory.findFirst({
      where: {
        userId,
        name,
        type
      }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
    }

    // Create new custom category
    const category = await prisma.customCategory.create({
      data: {
        userId,
        name,
        type
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
