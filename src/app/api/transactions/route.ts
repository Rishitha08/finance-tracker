import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    console.log('Transactions GET - userId from header:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    console.log('User exists check:', userExists ? `Found: ${userExists.username}` : 'Not found')

    if (!userExists) {
      // List all users for debugging
      const allUsers = await prisma.user.findMany({
        select: { id: true, username: true }
      })
      console.log('All users in database:', allUsers)
      
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })

    console.log(`Found ${transactions.length} transactions for user ${userId}`)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    console.log('Transaction POST - userId from header:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    console.log('User exists check for POST:', userExists ? `Found: ${userExists.username}` : 'Not found')

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, description, category, type, date } = body

    console.log('Creating transaction:', { amount, description, category, type, date, userId })

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        category,
        type,
        date: new Date(date),
        userId
      }
    })

    console.log('Transaction created successfully:', transaction.id)
    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ 
      error: 'Failed to create transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
