import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before using
    const { id } = await params

    console.log('Deleting transaction:', id, 'for user:', userId)

    // Check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: {
        id,
        userId
      }
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
