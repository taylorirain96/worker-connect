'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  Briefcase, DollarSign, Star, Clock, TrendingUp,
  CheckCircle, AlertCircle, Search
} from 'lucide-react'
import { formatCurrency, STATUS_LABELS, formatRelativeDate } from '@/lib/utils'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Application } from '@/types'

interface RecentApplication {
  id: string
  title: string
  employer: string
  status: string
  appliedAt: string
  budget: number
  budgetType: 'fixed' | 'hourly'
}

const MOCK_APPLIED_JOBS: RecentApplication[] = [
  { id: '1', title: 'Fix Leaking Bathroom Pipe', employer: 'John Smith', status: 'pending', appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), budget: 150, budgetType: 'fixed' },
  { id: '2', title: 'Install New Electrical Panel', employer: 'Sarah Johnson', status: 'accepted', appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), budget: 2500, budgetType: 'fixed' },
  { id: '3', title: 'HVAC System Maintenance', employer: 'Mike Williams', status: 'rejected', appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), budget: 200, budgetType: 'fixed' },
]

function docToApplication(id: string, data: DocumentData): Application {
  const toISO = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : typeof v === 'string'
      ? v
      : new Date().toISOString()
  return { ...data, id, createdAt: toISO(data.createdAt), updatedAt: toISO(data.updatedAt) } as Application
}

export default function WorkerDashboardPage() {
  const { user, profile } = useAuth()
  const [applications, setApplications] = useState<RecentApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    if (!user?.uid || !db) {
      setApplications(MOCK_APPLIED_JOBS)
      setLoadingApps(false)
      return
    }
    async function fetchApplications() {
      try {
        const appsRef = collection(db!, 'applications')
        const q = query(appsRef, where('workerId', '==', user!.uid), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const apps = snapshot.docs.map((d) => docToApplication(d.id, d.data()))
        if (apps.length === 0) {
          setApplications(MOCK_APPLIED_JOBS)
        } else {
          setApplications(
            apps.slice(0, 5).map((a) => ({
              id: a.id,
              title: a.jobTitle,
              employer: a.employerId, // employerName is not stored on Application; field is present for future use but not currently rendered in the UI
              status: a.status,
              appliedAt: a.createdAt,
              budget: a.proposedRate,
              budgetType: 'fixed' as const,
            }))
          )
        }
      } catch {
        setApplications(MOCK_APPLIED_JOBS)
      } finally {
        setLoadingApps(false)
      }
    }
    fetchApplications()
  }, [user])

  const totalApplied = applications.length
  const activeJobs = applications.filter((a) => a.status === 'accepted').length
  const completedJobs = profile?.completedJobs ?? 0
  const totalEarned = profile?.totalEarnings ?? 0

  const stats = [
    { label: 'Jobs Applied', value: String(totalApplied), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: String(activeJobs), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Completed', value: String(completedJobs), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.displayName?.split(' ')[0] || 'Worker'}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {profile?.availability === 'available' ? '🟢 You are visible to employers' : '🔴 Update your availability to get more jobs'}
              </p>
            </div>
            <Link href="/jobs">
              <Button className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Jobs
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applied Jobs */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Applications</CardTitle>
                    <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700">Browse more jobs</Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingApps ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications yet</p>
                      <Link href="/jobs">
                        <Button variant="outline" size="sm" className="mt-3">Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => {
                        const status = STATUS_LABELS[app.status]
                        return (
                          <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{app.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(app.budget)} · {formatRelativeDate(app.appliedAt)}</p>
                            </div>
                            <Badge
                              variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                            >
                              {status?.label ?? app.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion & Quick Stats */}
            <div className="space-y-4">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Profile Photo', done: !!user?.photoURL },
                      { label: 'Bio Added', done: !!profile?.bio },
                      { label: 'Skills Listed', done: (profile?.skills?.length || 0) > 0 },
                      { label: 'Hourly Rate Set', done: !!profile?.hourlyRate },
                      { label: 'Location Added', done: !!profile?.location },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        {done ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="w-full mt-4">Complete Profile</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Rating */}
              {(profile?.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>Your rating: <strong className="text-gray-900 dark:text-white">{profile?.rating?.toFixed(1)}</strong> ({profile?.reviewCount ?? 0} reviews)</span>
                </div>
              )}

              {/* Earnings link */}
              <Link href="/earnings">
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    View Earnings & Withdraw
                  </div>
                  <span className="text-xs text-primary-600">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

