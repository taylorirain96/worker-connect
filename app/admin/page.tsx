'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { Users, Briefcase, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const MOCK_ADMIN_STATS = {
  totalUsers: 12483,
  totalWorkers: 8921,
  totalEmployers: 3562,
  totalJobs: 45892,
  openJobs: 1243,
  completedJobs: 38765,
  totalRevenue: 2850000,
  monthlyRevenue: 185000,
  pendingApplications: 342,
  activeConversations: 891,
}

const MOCK_RECENT_USERS = [
  { id: 'u1', name: 'Alice Thompson', email: 'alice@example.com', role: 'worker', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'u2', name: 'Bob Martinez', email: 'bob@example.com', role: 'employer', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), status: 'active' },
  { id: 'u3', name: 'Carol White', email: 'carol@example.com', role: 'worker', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
]

const MOCK_RECENT_JOBS = [
  { id: 'j1', title: 'Emergency Roof Repair', category: 'roofing', status: 'open', budget: 1200, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), flagged: true },
  { id: 'j2', title: 'Kitchen Renovation', category: 'carpentry', status: 'in_progress', budget: 15000, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), flagged: false },
  { id: 'j3', title: 'Electrical Rewiring', category: 'electrical', status: 'open', budget: 4500, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), flagged: false },
]

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  if (loading || profile?.role !== 'admin') {
    return null
  }

  const stats = [
    { label: 'Total Users', value: MOCK_ADMIN_STATS.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: MOCK_ADMIN_STATS.openJobs.toLocaleString(), icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Monthly Revenue', value: formatCurrency(MOCK_ADMIN_STATS.monthlyRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Revenue', value: formatCurrency(MOCK_ADMIN_STATS.totalRevenue), icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Platform overview and management</p>
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
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Workers', value: MOCK_ADMIN_STATS.totalWorkers.toLocaleString(), icon: '👷' },
              { label: 'Employers', value: MOCK_ADMIN_STATS.totalEmployers.toLocaleString(), icon: '🏢' },
              { label: 'Completed Jobs', value: MOCK_ADMIN_STATS.completedJobs.toLocaleString(), icon: '✅' },
              { label: 'Pending Applications', value: MOCK_ADMIN_STATS.pendingApplications.toLocaleString(), icon: '📋' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Users</CardTitle>
                  <Badge variant="info">{MOCK_ADMIN_STATS.totalUsers.toLocaleString()} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_RECENT_USERS.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'worker' ? 'info' : 'primary'} className="capitalize">
                          {user.role}
                        </Badge>
                        {user.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Jobs</CardTitle>
                  <Badge variant="warning">{MOCK_ADMIN_STATS.openJobs} open</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_RECENT_JOBS.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                          {job.flagged && (
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" aria-label="Flagged for review" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatCurrency(job.budget)} · {job.category}</p>
                      </div>
                      <Badge variant={job.status === 'open' ? 'success' : 'info'} className="capitalize flex-shrink-0">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
