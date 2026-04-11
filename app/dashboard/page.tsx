'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRole } from '@/context/RoleContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WorkerDashboardPage from '@/app/dashboard/worker/page'
import EmployerDashboardPage from '@/app/dashboard/employer/page'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const { activeRole } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (profile?.role === 'admin') {
        router.push('/admin')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || profile?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (activeRole === 'employer') {
    return <EmployerDashboardPage />
  }

  return <WorkerDashboardPage />
}
