'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsLineChart from '@/components/analytics/AnalyticsLineChart'
import AnalyticsBarChart from '@/components/analytics/AnalyticsBarChart'
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getAdminAnalytics,
  exportAdminAnalyticsCSV,
  type AdminAnalytics,
} from '@/lib/services/analyticsService'
import { formatCurrency, getInitials } from '@/lib/utils'
import {
  BarChart2, DollarSign, Users, Briefcase, TrendingUp, CheckCircle,
  Download, RefreshCw, Calendar, AlertTriangle, Award, Shield,
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

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#b45309', '#6366f1', '#10b981']

export default function AdminAnalyticsPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('12m')

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, authLoading, router])

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await getAdminAnalytics()
      setAnalytics(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      loadAnalytics()
    }
  }, [authLoading, profile, loadAnalytics])

  if (authLoading || loading) {
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

  if (!analytics || profile?.role !== 'admin') return null

  const handleRefresh = () => {
    setRefreshing(true)
    loadAnalytics()
  }

  const handleExportCSV = () => {
    exportAdminAnalyticsCSV(analytics)
  }

  const monthlyChartData = analytics.monthlyRevenueChart.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    jobs: m.jobs,
  }))

  const dailyChartData = analytics.dailyStats.slice(-14).map((d) => ({
    date: d.date,
    revenue: d.revenue,
    jobs: d.jobs,
    newUsers: d.newUsers,
  }))

  const categoryPieData = analytics.categoryStats.map((c) => ({
    name: c.category,
    value: c.count,
    color: c.color,
  }))

  const categoryRevenueData = analytics.categoryStats.map((c) => ({
    category: c.category.slice(0, 7),
    revenue: c.revenue,
    color: c.color,
  }))

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time platform performance overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(analytics.totalRevenue)}
              subtitle={`${formatCurrency(analytics.monthlyRevenue)} this month`}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
              trend={analytics.revenueGrowth}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Total Users"
              value={analytics.totalUsers.toLocaleString()}
              subtitle={`+${analytics.newUsersThisMonth} this month`}
              icon={<Users className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
              trend={analytics.userGrowthRate}
              trendLabel="growth rate"
            />
            <MetricCard
              label="Total Jobs"
              value={analytics.totalJobs.toLocaleString()}
              subtitle={`${analytics.activeJobs} active now`}
              icon={<Briefcase className="h-5 w-5" />}
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600"
              trend={3.8}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Completion Rate"
              value={`${analytics.jobCompletionRate}%`}
              subtitle={`${analytics.completedJobs.toLocaleString()} jobs done`}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
              trend={1.2}
              trendLabel="vs last month"
            />
          </div>

          {/* Revenue charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Monthly Revenue Line */}
            <Card className="lg:col-span-2" padding="none">
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {DATE_RANGE_LABELS[dateRange]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsLineChart
                  data={monthlyChartData}
                  xKey="month"
                  series={[
                    { key: 'revenue', label: 'Revenue', color: '#6366f1' },
                  ]}
                  height={240}
                  formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
              </CardContent>
            </Card>

            {/* Jobs by Category Pie */}
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Jobs by Category</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <AnalyticsPieChart
                  data={categoryPieData}
                  formatValue={(v) => `${v.toLocaleString()} jobs`}
                  height={260}
                />
              </CardContent>
            </Card>
          </div>

          {/* Daily Stats + Revenue by Category */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Revenue (last 14 days) */}
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Daily Revenue (Last 14 Days)</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsBarChart
                  data={dailyChartData}
                  xKey="date"
                  series={[{ key: 'revenue', label: 'Revenue ($)', color: '#6366f1' }]}
                  height={220}
                  formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
              </CardContent>
            </Card>

            {/* Revenue by Category Bar */}
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsBarChart
                  data={categoryRevenueData}
                  xKey="category"
                  series={[{ key: 'revenue', label: 'Revenue ($)', color: '#10b981' }]}
                  height={220}
                  formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
                  multiColor
                  colors={analytics.categoryStats.map((c) => c.color)}
                />
              </CardContent>
            </Card>
          </div>

          {/* User Growth + New Users */}
          <Card padding="none">
            <CardHeader className="p-5 pb-2">
              <CardTitle>Daily New Users (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <AnalyticsLineChart
                data={dailyChartData}
                xKey="date"
                series={[{ key: 'newUsers', label: 'New Users', color: '#22d3ee' }]}
                height={200}
                formatValue={(v) => `${v} users`}
              />
            </CardContent>
          </Card>

          {/* Top Workers Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                Top Workers Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topWorkers.map((worker) => (
                  <div
                    key={worker.workerId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40"
                  >
                    {/* Rank badge */}
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: RANK_COLORS[worker.rank - 1] ?? '#9ca3af' }}
                    >
                      #{worker.rank}
                    </div>

                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {getInitials(worker.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{worker.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{worker.category}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Jobs</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{worker.jobsCompleted}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Earnings</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(worker.totalEarnings)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="text-sm font-bold text-yellow-600">⭐ {worker.rating}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dispute & Platform Health */}
          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard
              label="Open Disputes"
              value={analytics.disputeCount}
              subtitle="Requires attention"
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600"
              trend={-18.4}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Dispute Resolution"
              value={`${analytics.disputeResolutionRate}%`}
              subtitle="Resolved within 48h"
              icon={<Shield className="h-5 w-5" />}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
              trend={2.3}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Active Jobs"
              value={analytics.activeJobs.toLocaleString()}
              subtitle="In progress now"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600"
              trend={4.5}
              trendLabel="vs last week"
            />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
