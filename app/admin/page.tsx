'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import { Users, Briefcase, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, BookOpen, Globe } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  totalWorkers: number
  totalEmployers: number
  totalJobs: number
  openJobs: number
  completedJobs: number
  totalRevenue: number
  monthlyRevenue: number
  pendingApplications: number
  activeConversations: number
  openDisputes?: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  status: string
}

interface RecentJob {
  id: string
  title: string
  category: string
  status: string
  budget: number
  createdAt: string
  flagged: boolean
}

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  useEffect(() => {
    if (loading || profile?.role !== 'admin') return
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users?limit=3'),
          fetch('/api/admin/jobs?limit=3'),
        ])
        if (statsRes.ok) setStats(await statsRes.json() as AdminStats)
        if (usersRes.ok) {
          const data = await usersRes.json() as { users?: RecentUser[] }
          setRecentUsers(data.users ?? [])
        }
        if (jobsRes.ok) {
          const data = await jobsRes.json() as { jobs?: RecentJob[] }
          setRecentJobs(data.jobs ?? [])
        }
      } finally {
        setStatsLoading(false)
      }
    }
    fetchAdminData()
  }, [profile, loading])

  if (loading || profile?.role !== 'admin') {
    return null
  }

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Active Jobs', value: stats.openJobs.toLocaleString(), icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
      ]
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Platform overview and management</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/master-playbook">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Master Playbook
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Platform Analytics
                </Button>
              </Link>
              <Link href="/admin/seo">
                <Button variant="outline" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  SEO Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
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
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Workers', value: stats.totalWorkers.toLocaleString(), icon: '👷' },
                    { label: 'Employers', value: stats.totalEmployers.toLocaleString(), icon: '🏢' },
                    { label: 'Completed Jobs', value: stats.completedJobs.toLocaleString(), icon: '✅' },
                    { label: 'Pending Applications', value: stats.pendingApplications.toLocaleString(), icon: '📋' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Users</CardTitle>
                      {stats && <Badge variant="info">{stats.totalUsers.toLocaleString()} total</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentUsers.length > 0 ? (
                      <div className="space-y-3">
                        {recentUsers.map((user) => (
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
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Jobs</CardTitle>
                      {stats && <Badge variant="warning">{stats.openJobs} open</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentJobs.length > 0 ? (
                      <div className="space-y-3">
                        {recentJobs.map((job) => (
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
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No recent jobs</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
