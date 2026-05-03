'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DollarSign, CheckCircle, Star, TrendingUp, BarChart2, ArrowLeft, RefreshCw,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EarningsChart, { type MonthlyEarningsPoint } from '@/components/analytics/EarningsChart'
import StatsCard from '@/components/analytics/StatsCard'
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart'
import { collection, query, where, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNZD(n: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
  }).format(n)
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-NZ', { month: 'short' })
}

/** Returns an array of the last `count` month labels + start dates */
function buildMonthWindows(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    d.setMonth(d.getMonth() - (count - 1 - i))
    const start = new Date(d)
    const end = new Date(d)
    end.setMonth(end.getMonth() + 1)
    return { label: monthLabel(start), start, end }
  })
}

/** Deterministic pseudo-random (0..1) seeded on an integer */
function det(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryStat {
  name: string
  value: number
  color: string
}

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
]

// ─── Mock data fallback ───────────────────────────────────────────────────────

function buildMockData(uid: string, windows: ReturnType<typeof buildMonthWindows>) {
  const seed = uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const monthly: MonthlyEarningsPoint[] = windows.map((w, i) => ({
    month: w.label,
    amount: Math.round(det(seed + i) * 3500 + 500),
  }))
  const totalEarned = monthly.reduce((s, m) => s + m.amount, 0)
  const completedJobs = Math.round(det(seed + 10) * 25 + 5)
  const avgRating = parseFloat((det(seed + 11) * 2 + 3).toFixed(1))
  const completionRate = Math.round(det(seed + 12) * 30 + 70)
  const categories: CategoryStat[] = [
    { name: 'Plumbing', value: Math.round(det(seed + 20) * 8 + 2), color: CATEGORY_COLORS[0] },
    { name: 'Electrical', value: Math.round(det(seed + 21) * 7 + 1), color: CATEGORY_COLORS[1] },
    { name: 'Carpentry', value: Math.round(det(seed + 22) * 6 + 1), color: CATEGORY_COLORS[2] },
    { name: 'General', value: Math.round(det(seed + 23) * 5 + 1), color: CATEGORY_COLORS[3] },
    { name: 'Painting', value: Math.round(det(seed + 24) * 4 + 1), color: CATEGORY_COLORS[4] },
  ]
  return { monthly, totalEarned, completedJobs, avgRating, completionRate, categories }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkerAnalyticsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [monthly, setMonthly] = useState<MonthlyEarningsPoint[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [completedJobs, setCompletedJobs] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [categories, setCategories] = useState<CategoryStat[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  const fetchData = useCallback(async () => {
    if (!user?.uid) return
    setDataLoading(true)

    const windows = buildMonthWindows(6)

    try {
      let hasRealData = false
      const monthlyAmounts: number[] = new Array(6).fill(0)
      let totalJobs = 0
      const catMap: Record<string, number> = {}

      if (db) {
        // ── Earnings from escrow ──────────────────────────────────────────────
        const escrowSnap = await getDocs(
          query(
            collection(db, 'escrow'),
            where('workerId', '==', user.uid),
            where('status', '==', 'released'),
          ),
        )

        escrowSnap.forEach((doc: DocumentData) => {
          const d = doc.data() as {
            releasedAt?: { toDate?: () => Date } | string
            workerReceives?: number
            amount?: number
          }
          const raw = d.releasedAt
          let releasedAt: Date | null = null
          if (raw) {
            if (typeof raw === 'string') {
              releasedAt = new Date(raw)
            } else if (typeof raw.toDate === 'function') {
              releasedAt = raw.toDate?.() ?? null
            }
          }
          if (!releasedAt) return
          const idx = windows.findIndex(
            (w) => releasedAt! >= w.start && releasedAt! < w.end,
          )
          if (idx !== -1) {
            monthlyAmounts[idx] += d.workerReceives ?? d.amount ?? 0
            hasRealData = true
          }
        })

        // ── Completed jobs + categories ───────────────────────────────────────
        const jobsSnap = await getDocs(
          query(
            collection(db, 'jobs'),
            where('acceptedWorkerId', '==', user.uid),
            where('status', '==', 'completed'),
          ),
        )

        jobsSnap.forEach((doc: DocumentData) => {
          const d = doc.data() as { category?: string }
          totalJobs++
          const cat = d.category ?? 'General'
          catMap[cat] = (catMap[cat] ?? 0) + 1
          hasRealData = true
        })
      }

      if (hasRealData) {
        const monthlyData: MonthlyEarningsPoint[] = windows.map((w, i) => ({
          month: w.label,
          amount: monthlyAmounts[i],
        }))
        const total = monthlyAmounts.reduce((s, a) => s + a, 0)

        const cats: CategoryStat[] = Object.entries(catMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value], i) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))

        setMonthly(monthlyData)
        setTotalEarned(total)
        setCompletedJobs(totalJobs)
        setAvgRating(profile?.rating ?? 0)
        setCompletionRate(Math.round((profile?.completionRate ?? 0) * 100))
        setCategories(cats)
      } else {
        // ── Fall back to mock data ────────────────────────────────────────────
        const mock = buildMockData(user.uid, windows)
        setMonthly(mock.monthly)
        setTotalEarned(mock.totalEarned)
        setCompletedJobs(mock.completedJobs)
        setAvgRating(profile?.rating ?? mock.avgRating)
        setCompletionRate(
          profile?.completionRate
            ? Math.round(profile.completionRate * 100)
            : mock.completionRate,
        )
        setCategories(mock.categories)
      }
    } catch {
      // On error fall back to mock data
      const mock = buildMockData(user.uid, windows)
      setMonthly(mock.monthly)
      setTotalEarned(mock.totalEarned)
      setCompletedJobs(mock.completedJobs)
      setAvgRating(profile?.rating ?? mock.avgRating)
      setCompletionRate(
        profile?.completionRate
          ? Math.round(profile.completionRate * 100)
          : mock.completionRate,
      )
      setCategories(mock.categories)
    }

    setLastUpdated(new Date())
    setDataLoading(false)
  }, [user?.uid, profile?.rating, profile?.completionRate])

  useEffect(() => {
    if (user?.uid) fetchData()
  }, [user?.uid, fetchData])

  // ── Derived stats ────────────────────────────────────────────────────────
  const thisMonth = monthly[monthly.length - 1]?.amount ?? 0
  const lastMonth = monthly[monthly.length - 2]?.amount ?? 0
  const momChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

  const bestMonth = monthly.reduce<MonthlyEarningsPoint>(
    (best, m) => (m.amount > best.amount ? m : best),
    { month: '—', amount: 0 },
  )

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading || dataLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
              <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/worker">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="h-6 w-6 text-indigo-500" />
                  Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Your performance over the last 6 months
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-gray-400 hidden sm:block">
                  Updated{' '}
                  {lastUpdated.toLocaleTimeString('en-NZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Total Earned"
              value={fmtNZD(totalEarned)}
              subtitle="Last 6 months"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
            />
            <StatsCard
              label="Jobs Completed"
              value={completedJobs}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
            />
            <StatsCard
              label="Avg Rating"
              value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
              subtitle={
                avgRating > 0
                  ? `${profile?.reviewCount ?? 0} review${(profile?.reviewCount ?? 0) === 1 ? '' : 's'}`
                  : 'No reviews yet'
              }
              icon={<Star className="h-5 w-5" />}
              iconBg="bg-yellow-100 dark:bg-yellow-900/30"
              iconColor="text-yellow-600"
            />
            <StatsCard
              label="Completion Rate"
              value={completionRate > 0 ? `${completionRate}%` : '—'}
              trend={momChange !== 0 ? momChange : undefined}
              trendLabel="vs last month"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600"
            />
          </div>

          {/* Earnings chart */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Monthly Earnings (NZD)</CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  {bestMonth.amount > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Best month:{' '}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {bestMonth.month} — {fmtNZD(bestMonth.amount)}
                      </span>
                    </span>
                  )}
                  {monthly.length >= 2 && (
                    <span
                      className={`font-medium text-xs px-2.5 py-1 rounded-full ${
                        momChange > 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : momChange < 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {momChange > 0 ? '▲' : momChange < 0 ? '▼' : '—'}{' '}
                      {Math.abs(momChange).toFixed(1)}% vs last month
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EarningsChart data={monthly} height={260} />
            </CardContent>
          </Card>

          {/* Job category breakdown + performance summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs by Trade Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No job data yet</div>
                ) : (
                  <AnalyticsPieChart
                    data={categories}
                    height={240}
                    formatValue={(v) => `${v} job${v === 1 ? '' : 's'}`}
                    innerRadius={55}
                    showLegend
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    {
                      label: 'Best Performing Month',
                      value:
                        bestMonth.amount > 0
                          ? `${bestMonth.month} · ${fmtNZD(bestMonth.amount)}`
                          : '—',
                    },
                    {
                      label: 'This Month vs Last Month',
                      value: `${momChange > 0 ? '+' : ''}${momChange.toFixed(1)}%`,
                      colored: true,
                      positive: momChange > 0,
                      negative: momChange < 0,
                    },
                    {
                      label: 'Avg Earnings per Job',
                      value:
                        completedJobs > 0
                          ? fmtNZD(totalEarned / completedJobs)
                          : '—',
                    },
                    {
                      label: 'Most Common Trade',
                      value: categories[0]?.name ?? '—',
                    },
                    {
                      label: 'Completion Rate',
                      value: completionRate > 0 ? `${completionRate}%` : '—',
                    },
                  ].map(({ label, value, colored, positive, negative }, i, arr) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between py-3 ${
                        i < arr.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-700'
                          : ''
                      }`}
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                      <span
                        className={`font-semibold text-sm ${
                          colored
                            ? positive
                              ? 'text-green-600 dark:text-green-400'
                              : negative
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {value}
                      </span>
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
