import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Finance Tracker',
    template: '%s | Finance Tracker'
  },
  description: 'Personal finance management application with Samsung-inspired design. Track expenses, manage budgets, and achieve your financial goals.',
  keywords: ['finance', 'budget', 'expense tracker', 'personal finance', 'money management'],
  authors: [{ name: 'Finance Tracker Team' }],
  creator: 'Finance Tracker',
  publisher: 'Finance Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Finance Tracker',
    description: 'Personal finance management application with Samsung-inspired design',
    url: '/',
    siteName: 'Finance Tracker',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  category: 'finance',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finance Tracker" />
        <meta name="application-name" content="Finance Tracker" />
      </head>
      <body 
        className={`${inter.className} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-slate-200`}
        suppressHydrationWarning
      >
        <div id="root" className="relative">
          {children}
        </div>
      </body>
    </html>
  )
}
