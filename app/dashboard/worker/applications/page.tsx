'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { Briefcase, ArrowLeft, Calendar, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getWorkerApplications, withdrawApplication } from '@/lib/applications'
import { getOrCreateConversation } from '@/lib/messaging'
import { STATUS_LABELS } from '@/lib/utils'
import type { JobApplication } from '@/types'

function statusBadgeVariant(status: JobApplication['status']) {
  switch (status) {
    case 'accepted': return 'success' as const
    case 'rejected': return 'danger' as const
    case 'withdrawn': return 'default' as const
    default: return 'warning' as const
  }
}

function statusLabel(status: JobApplication['status']): string {
  return STATUS_LABELS[status]?.label ?? status
}

export default function MyApplicationsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [fetching, setFetching] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [messagingId, setMessagingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    getWorkerApplications(user.uid)
      .then(setApplications)
      .finally(() => setFetching(false))
  }, [user])

  const handleWithdraw = async (appId: string) => {
    setWithdrawingId(appId)
    try {
      await withdrawApplication(appId)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'withdrawn' as const } : a))
      )
      toast.success('Application withdrawn')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to withdraw')
    } finally {
      setWithdrawingId(null)
    }
  }

  const handleMessageEmployer = async (app: JobApplication) => {
    if (!user || !app.employerId || !app.jobId || !app.jobTitle) return
    setMessagingId(app.id)
    try {
      const convId = await getOrCreateConversation(
        user.uid,
        profile?.displayName || user.displayName || 'Worker',
        app.employerId,
        app.employerName || 'Employer',
        app.jobId,
        app.jobTitle,
        profile?.photoURL || user.photoURL || undefined
      )
      router.push(`/messages/${convId}`)
    } catch {
      toast.error('Could not open conversation. Please try again.')
    } finally {
      setMessagingId(null)
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || profile?.role !== 'worker') return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h1>

          <Card>
            <CardHeader>
              <CardTitle>All Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven&apos;t applied to any jobs yet
                  </p>
                  <Link href="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center gap-4 py-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/jobs/${app.jobId}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block"
                        >
                          {app.jobTitle ?? 'Job'}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {app.employerName ?? 'Employer'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant={statusBadgeVariant(app.status)}>
                          {statusLabel(app.status)}
                        </Badge>
                        {app.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={withdrawingId === app.id}
                            onClick={() => handleWithdraw(app.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                        {app.status === 'accepted' && app.employerId && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={messagingId === app.id}
                            disabled={messagingId === app.id}
                            onClick={() => handleMessageEmployer(app)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message Employer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
