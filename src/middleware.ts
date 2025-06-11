import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

async function verifyTokenEdge(token: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is on a public route and has a token, redirect to dashboard
  if (isPublicRoute && token) {
    try {
      await verifyTokenEdge(token)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Invalid token, continue to auth page
    }
  }

  // If user is trying to access protected route without token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // For API routes, extract real user ID from token
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && token) {
    try {
      const decoded = await verifyTokenEdge(token)
      console.log('Decoded user ID from token:', decoded.userId)
      
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('userId', decoded.userId)
      requestHeaders.set('userEmail', decoded.email || '')
      requestHeaders.set('username', decoded.username || '')
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
