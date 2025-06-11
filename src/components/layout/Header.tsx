'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user?: any
}

export default function Header({ user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 samsung-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Finance Tracker</h1>
              <p className="text-sm text-slate-600">Manage your personal finances</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/analytics" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Analytics
            </Link>
            <Link 
              href="/budget" 
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Budget
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-slate-700 font-medium hidden sm:block">
                    {user.username || 'User'}
                  </span>
                </div>
                
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="samsung-gradient text-white hover:opacity-90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
