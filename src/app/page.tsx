import { redirect } from 'next/navigation'

/**
 * Root page component that handles initial routing logic
 * Redirects to dashboard - authentication will be handled by middleware
 */
export default function HomePage() {
  // Simple redirect - let middleware handle authentication
  redirect('/dashboard')
}
