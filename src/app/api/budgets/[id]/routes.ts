import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    const budget = await prisma.budget.update({
      where: {
        id: params.id,
        userId // Ensure user can only update their own budgets
      },
      data: {
        amount: parseFloat(amount)
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.budget.delete({
      where: {
        id: params.id,
        userId
      }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}
