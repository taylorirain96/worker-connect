'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsLineChart from '@/components/analytics/AnalyticsLineChart'
import AnalyticsBarChart from '@/components/analytics/AnalyticsBarChart'
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart'
import PerformanceRing from '@/components/analytics/PerformanceRing'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  getWorkerAnalytics,
  exportWorkerAnalyticsCSV,
  type WorkerAnalytics,
} from '@/lib/services/analyticsService'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  BarChart2, DollarSign, Star, Clock, TrendingUp, CheckCircle,
  Download, RefreshCw, Calendar, Briefcase, Zap, Award,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type DateRange = '7d' | '30d' | '90d' | '12m'

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<WorkerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('12m')

  const loadAnalytics = useCallback(async () => {
    if (!user) return
    try {
      const data = await getWorkerAnalytics(user.uid)
      setAnalytics(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handleRefresh = () => {
    setRefreshing(true)
    loadAnalytics()
  }

  const handleExportCSV = () => {
    if (analytics) exportWorkerAnalyticsCSV(analytics)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!analytics) return null

  const revenueChartData = analytics.monthlyRevenue.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    jobs: m.jobs,
  }))

  const weeklyChartData = analytics.weeklyActivity.map((d) => ({
    day: d.day,
    earnings: d.earnings,
    jobs: d.jobs,
  }))

  const categoryPieData = analytics.categoryBreakdown.map((c) => ({
    name: c.category,
    value: c.revenue,
    color: c.color,
  }))

  const statusPieData = analytics.statusBreakdown.map((s) => ({
    name: s.status,
    value: s.count,
    color: s.color,
  }))

  const totalJobs = analytics.statusBreakdown.reduce((s, e) => s + e.count, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s performance dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date range selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      dateRange === r
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Updating…' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Top KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Earnings"
              value={formatCurrency(analytics.totalEarnings)}
              subtitle={`Projected: ${formatCurrency(analytics.projectedNextMonthEarnings)} next mo.`}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
              trend={8.4}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Jobs Completed"
              value={analytics.jobsCompleted}
              subtitle={`${totalJobs} total jobs`}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
              trend={5.2}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Avg Rating"
              value={`${analytics.averageRating} ⭐`}
              subtitle="Customer satisfaction"
              icon={<Star className="h-5 w-5" />}
              iconBg="bg-yellow-100 dark:bg-yellow-900/30"
              iconColor="text-yellow-600"
              trend={0.3}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Response Time"
              value={`${analytics.responseTimeHours}h`}
              subtitle="Average first response"
              icon={<Clock className="h-5 w-5" />}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600"
              trend={-12.5}
              trendLabel="faster than last month"
            />
          </div>

          {/* Revenue charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Monthly Revenue Line */}
            <Card className="lg:col-span-2" padding="none">
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Monthly Revenue & Jobs</CardTitle>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {DATE_RANGE_LABELS[dateRange]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsLineChart
                  data={revenueChartData}
                  xKey="month"
                  series={[
                    { key: 'revenue', label: 'Revenue ($)', color: '#6366f1' },
                  ]}
                  height={240}
                  formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
                  showLegend={false}
                />
              </CardContent>
            </Card>

            {/* Earnings by Category Pie */}
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Earnings by Category</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <AnalyticsPieChart
                  data={categoryPieData}
                  formatValue={(v) => formatCurrency(v)}
                  height={260}
                />
              </CardContent>
            </Card>
          </div>

          {/* Weekly activity + job status */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Weekly Activity Bar */}
            <Card className="lg:col-span-2" padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsBarChart
                  data={weeklyChartData}
                  xKey="day"
                  series={[{ key: 'earnings', label: 'Earnings ($)', color: '#6366f1' }]}
                  height={200}
                  formatValue={(v) => `$${v}`}
                />
              </CardContent>
            </Card>

            {/* Job Status Pie */}
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <AnalyticsPieChart
                  data={statusPieData}
                  formatValue={(v) => `${v} jobs`}
                  height={240}
                  innerRadius={50}
                />
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                <PerformanceRing
                  value={analytics.acceptanceRate}
                  color="#6366f1"
                  label="Acceptance"
                  sublabel="Rate"
                />
                <PerformanceRing
                  value={analytics.completionRate}
                  color="#10b981"
                  label="Completion"
                  sublabel="Rate"
                />
                <PerformanceRing
                  value={analytics.onTimeRate}
                  color="#3b82f6"
                  label="On-Time"
                  sublabel="Delivery"
                />
                <PerformanceRing
                  value={analytics.customerSatisfaction}
                  color="#f59e0b"
                  label="Customer"
                  sublabel="Satisfaction"
                />
                <PerformanceRing
                  value={100 - analytics.cancellationRate}
                  color="#8b5cf6"
                  label="Reliability"
                  sublabel="(no cancels)"
                />
                <PerformanceRing
                  value={Math.round(analytics.averageRating * 20)}
                  color="#ec4899"
                  label="Avg Rating"
                  sublabel={`${analytics.averageRating} / 5`}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{analytics.acceptanceRate}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{analytics.completionRate}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Job Duration</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{analytics.avgJobDurationHours}h</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cancellation Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{analytics.cancellationRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  Recent Jobs
                </CardTitle>
                <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Browse jobs →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{job.employer} · {job.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {job.rating && (
                        <span className="text-xs text-yellow-600 font-medium">⭐ {job.rating}</span>
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {job.earnings > 0 ? formatCurrency(job.earnings) : '—'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] ?? ''}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:block">{formatDate(job.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projected Earnings */}
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Projected Next Month</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analytics.projectedNextMonthEarnings)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Based on your recent performance trend
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 flex-shrink-0" />
            </div>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  )
}
