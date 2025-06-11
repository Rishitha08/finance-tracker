import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('userId')
    
    console.log('Profile request - userId from header:', userId)

    if (!userId) {
      console.log('No userId in header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    })

    console.log('Database query result:', user ? `Found user: ${user.username}` : 'User not found')

    if (!user) {
      // List all users for debugging
      const allUsers = await prisma.user.findMany({
        select: { id: true, username: true }
      })
      console.log('All users in database:', allUsers)
      
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
