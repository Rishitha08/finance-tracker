import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    console.log('Registration attempt:', { email, username })

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists with email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with auto-generated unique ID
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      }
    })

    console.log('User created successfully with ID:', user.id)

    // Generate JWT token with the actual user ID
    const token = await signToken({ 
      userId: user.id, 
      email: user.email,
      username: user.username 
    })

    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        }
      },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
