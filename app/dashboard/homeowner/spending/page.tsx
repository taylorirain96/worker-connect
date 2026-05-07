'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, TrendingUp, Briefcase, ArrowLeft, RefreshCw,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthPoint { month: string; amount: number }
interface CategoryStat { name: string; amount: number; count: number }
interface RecentJob { id: string; title: string; category: string; amount: number; completedAt: string }

interface SpendingData {
  totalSpent: number
  thisMonth: number
  spendByMonth: MonthPoint[]
  categories: CategoryStat[]
  recentJobs: RecentJob[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNZD(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerSpendingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SpendingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/homeowner/spending', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load spending data')
      const json = await res.json() as SpendingData
      setData(json)
    } catch {
      toast.error('Could not load spending data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void fetchData()
  }, [user, fetchData])

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/homeowner" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track how much you&apos;ve spent on jobs</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchData()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {!loading && data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Spent</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{fmtNZD(data.totalSpent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">This Month</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{fmtNZD(data.thisMonth)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Completed Jobs</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                          {data.categories.reduce((s, c) => s + c.count, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Spend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Spend (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.spendByMonth.every((m) => m.amount === 0) ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No spending data yet. Post a job to get started.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={data.spendByMonth} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis
                          tickFormatter={(v: number) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
                          tick={{ fontSize: 12 }}
                          width={50}
                        />
                        <Tooltip
                          formatter={(value) => [
                            typeof value === 'number' ? fmtNZD(value) : 'N/A',
                            'Spent',
                          ]}
                          contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="url(#spendGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spend by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Spend by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.categories.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No category data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie
                              data={data.categories}
                              dataKey="amount"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={65}
                              innerRadius={30}
                            >
                              {data.categories.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                typeof value === 'number' ? fmtNZD(value) : 'N/A'
                              }
                              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <ul className="space-y-1.5">
                          {data.categories.map((cat, idx) => (
                            <li key={cat.name} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full"
                                  style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                                />
                                <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                <span className="text-gray-400 dark:text-gray-500 text-xs">({cat.count} job{cat.count !== 1 ? 's' : ''})</span>
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">{fmtNZD(cat.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.recentJobs.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                        No completed jobs yet.{' '}
                        <Link href="/post/homeowner" className="text-indigo-600 hover:underline">Post a job</Link> to get started.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {data.recentJobs.map((job) => (
                          <li key={job.id} className="py-2.5 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                              >
                                {job.title}
                              </Link>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {job.category} · {fmtDate(job.completedAt)}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{fmtNZD(job.amount)}</span>
                          </li>
                        ))}
                      </ul>
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
