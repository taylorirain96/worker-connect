'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (profile?.role === 'worker') {
        router.push('/dashboard/worker')
      } else if (profile?.role === 'employer') {
        router.push('/dashboard/employer')
      } else if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (user && !profile) {
        // Profile not yet loaded or new user, redirect to worker dashboard
        router.push('/dashboard/worker')
      }
    }
  }, [user, profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
