'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsLineChart from '@/components/analytics/AnalyticsLineChart'
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/components/providers/AuthProvider'
import { getAdminAnalytics, type AdminAnalytics } from '@/lib/services/analyticsService'
import { exportAdminAnalyticsCSV } from '@/lib/services/analyticsService'
import { formatCurrency } from '@/lib/utils'
import {
  LayoutDashboard, DollarSign, AlertTriangle, Users, Briefcase,
  Activity, Settings, Download, RefreshCw, TrendingUp,
  CheckCircle, Shield, BarChart2, Menu, X, Server, FileText, BookOpen, Globe,
} from 'lucide-react'

// ─── Sidebar navigation ───────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Overview',             href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Payments & Billing',   href: '/admin/payments',  icon: DollarSign },
  { label: 'Disputes & Refunds',   href: '/admin/disputes',  icon: AlertTriangle },
  { label: 'Workers Management',   href: '/admin/workers',   icon: Users },
  { label: 'Employers Management', href: '/admin/employers', icon: Briefcase },
  { label: 'System Health',        href: '/admin/monitoring',icon: Activity },
  { label: 'Analytics',            href: '/admin/analytics', icon: BarChart2 },
  { label: 'Tax & 1099s',          href: '/admin/tax',       icon: FileText },
  { label: 'Master Playbook',      href: '/admin/playbook',  icon: BookOpen },
  { label: 'SEO Operations',       href: '/admin/seo',       icon: Globe },
  { label: 'Settings',             href: '/admin',           icon: Settings },
]

type DateRange = '7d' | '30d' | '90d'

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

const MOCK_UPTIME = 99.94

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0">
        {!collapsed && (
          <span className="text-lg font-bold text-white truncate">Admin Panel</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1" role="navigation" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, authLoading, router])

  const loadData = useCallback(async () => {
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
      loadData()
    }
  }, [authLoading, profile, loadData])

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
    loadData()
  }

  const monthlyChart = analytics.monthlyRevenueChart.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    jobs: m.jobs,
  }))

  const categoryPie = analytics.categoryStats.map((c) => ({
    name: c.category,
    value: c.count,
    color: c.color,
  }))

  const dailyChart = analytics.dailyStats.slice(-14).map((d) => ({
    date: d.date,
    revenue: d.revenue,
    newUsers: d.newUsers,
  }))

  const sidebarWidth = sidebarCollapsed ? 64 : 256

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

        <main
          className="flex-1 bg-gray-50 dark:bg-gray-900 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Platform overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date range picker */}
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
                <Button variant="outline" size="sm" onClick={() => exportAdminAnalyticsCSV(analytics)}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                label="Active Jobs"
                value={analytics.activeJobs.toLocaleString()}
                subtitle="In progress now"
                icon={<Briefcase className="h-5 w-5" />}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600"
                trend={4.5}
                trendLabel="vs last week"
              />
              <MetricCard
                label="Total Workers"
                value={(analytics.totalUsers * 0.71).toFixed(0)}
                subtitle="Registered workers"
                icon={<Users className="h-5 w-5" />}
                iconBg="bg-violet-100 dark:bg-violet-900/30"
                iconColor="text-violet-600"
                trend={analytics.userGrowthRate}
                trendLabel="growth rate"
              />
              <MetricCard
                label="Active Employers"
                value={(analytics.totalUsers * 0.29).toFixed(0)}
                subtitle="Registered employers"
                icon={<TrendingUp className="h-5 w-5" />}
                iconBg="bg-orange-100 dark:bg-orange-900/30"
                iconColor="text-orange-600"
                trend={5.2}
                trendLabel="vs last month"
              />
              <MetricCard
                label="Commission"
                value={formatCurrency(analytics.totalRevenue * 0.1)}
                subtitle="10% platform fee"
                icon={<DollarSign className="h-5 w-5" />}
                iconBg="bg-green-100 dark:bg-green-900/30"
                iconColor="text-green-600"
                trend={analytics.revenueGrowth}
                trendLabel="vs last period"
              />
              <MetricCard
                label="System Uptime"
                value={`${MOCK_UPTIME}%`}
                subtitle="Last 30 days"
                icon={<Server className="h-5 w-5" />}
                iconBg="bg-cyan-100 dark:bg-cyan-900/30"
                iconColor="text-cyan-600"
                trend={0.02}
                trendLabel="vs last month"
              />
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" padding="none">
                <CardHeader className="p-5 pb-2">
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <AnalyticsLineChart
                    data={monthlyChart}
                    xKey="month"
                    series={[{ key: 'revenue', label: 'Revenue', color: '#6366f1' }]}
                    height={240}
                    formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                </CardContent>
              </Card>

              <Card padding="none">
                <CardHeader className="p-5 pb-2">
                  <CardTitle>Jobs by Category</CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <AnalyticsPieChart
                    data={categoryPie}
                    formatValue={(v) => `${v.toLocaleString()} jobs`}
                    height={260}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Secondary charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card padding="none">
                <CardHeader className="p-5 pb-2">
                  <CardTitle>Daily Revenue (Last 14 Days)</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <AnalyticsLineChart
                    data={dailyChart}
                    xKey="date"
                    series={[{ key: 'revenue', label: 'Revenue ($)', color: '#10b981' }]}
                    height={200}
                    formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
                  />
                </CardContent>
              </Card>

              <Card padding="none">
                <CardHeader className="p-5 pb-2">
                  <CardTitle>New Users (Last 14 Days)</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <AnalyticsLineChart
                    data={dailyChart}
                    xKey="date"
                    series={[{ key: 'newUsers', label: 'New Users', color: '#22d3ee' }]}
                    height={200}
                    formatValue={(v) => `${v} users`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Platform health summary */}
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
                label="Completion Rate"
                value={`${analytics.jobCompletionRate}%`}
                subtitle={`${analytics.completedJobs.toLocaleString()} jobs done`}
                icon={<CheckCircle className="h-5 w-5" />}
                iconBg="bg-teal-100 dark:bg-teal-900/30"
                iconColor="text-teal-600"
                trend={1.2}
                trendLabel="vs last month"
              />
            </div>

            {/* Quick navigation cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NAV_ITEMS.filter((n) => n.href !== '/admin/dashboard').map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card padding="md" className="hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">View details →</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
