'use client'
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
import { formatCurrency, STATUS_LABELS } from '@/lib/utils'

const MOCK_APPLIED_JOBS = [
  { id: '1', title: 'Fix Leaking Bathroom Pipe', employer: 'John Smith', status: 'pending', appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), budget: 150, budgetType: 'fixed' as const },
  { id: '2', title: 'Install New Electrical Panel', employer: 'Sarah Johnson', status: 'accepted', appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), budget: 2500, budgetType: 'fixed' as const },
  { id: '3', title: 'HVAC System Maintenance', employer: 'Mike Williams', status: 'rejected', appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), budget: 200, budgetType: 'fixed' as const },
]

const MOCK_EARNINGS = [
  { month: 'Nov', amount: 3200 },
  { month: 'Dec', amount: 4100 },
  { month: 'Jan', amount: 2800 },
]

export default function WorkerDashboardPage() {
  const { user, profile } = useAuth()

  const stats = [
    { label: 'Jobs Applied', value: '8', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: '2', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Completed', value: '12', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Earned', value: '$8,240', icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
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
                  {MOCK_APPLIED_JOBS.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications yet</p>
                      <Link href="/jobs">
                        <Button variant="outline" size="sm" className="mt-3">Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {MOCK_APPLIED_JOBS.map((app) => {
                        const status = STATUS_LABELS[app.status]
                        return (
                          <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{app.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">by {app.employer} · {formatCurrency(app.budget)}</p>
                            </div>
                            <Badge
                              variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                            >
                              {status?.label}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion & Earnings */}
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

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <CardTitle>This Month</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatCurrency(MOCK_EARNINGS[MOCK_EARNINGS.length - 1].amount)}
                  </div>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +28% from last month
                  </p>
                  <div className="flex gap-1 mt-4 items-end h-12">
                    {MOCK_EARNINGS.map(({ month, amount }) => {
                      const max = Math.max(...MOCK_EARNINGS.map((e) => e.amount))
                      const height = (amount / max) * 100
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-primary-500 rounded-sm"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-gray-400">{month}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-1 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>Your rating: <strong className="text-gray-900 dark:text-white">4.9</strong> (87 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
