'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsLineChart from '@/components/analytics/AnalyticsLineChart'
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  ArrowLeft, Download, RefreshCw, Search, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { AdminPaymentRow } from '@/types'

type DateRange = '7d' | '30d' | '90d'
type PaymentStatus = 'all' | 'succeeded' | 'failed' | 'pending' | 'refunded'

const DAYS_MAP: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90 }
const PAYMENT_METHODS = ['card', 'bank_transfer', 'apple_pay', 'google_pay']
const STATUS_COLORS: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  succeeded: 'success',
  failed: 'danger',
  pending: 'warning',
  refunded: 'info',
}

// ─── Mock payment data ────────────────────────────────────────────────────────

function generateMockPayments(count: number): AdminPaymentRow[] {
  const statuses: AdminPaymentRow['status'][] = ['succeeded', 'succeeded', 'succeeded', 'failed', 'pending', 'refunded']
  const types: AdminPaymentRow['type'][] = ['payment', 'payment', 'payment', 'refund', 'payout']
  const names = ['John Smith', 'Alice Johnson', 'Bob Martinez', 'Carol White', 'David Chen',
    'Elena Rodriguez', 'Frank Wilson', 'Grace Kim', 'Henry Lee', 'Irene Park']
  return Array.from({ length: count }, (_, i) => ({
    id: `pay-${(i + 1).toString().padStart(6, '0')}`,
    userId: `user-${(i % 20) + 1}`,
    userName: names[i % 10],
    amount: Math.round(50 + Math.random() * 2000),
    status: statuses[i % 6],
    type: types[i % 5],
    method: PAYMENT_METHODS[i % 4],
    date: new Date(Date.now() - i * 3 * 3600000).toISOString(),
    jobId: `job-${(i % 50) + 1}`,
    jobTitle: `Job ${(i % 50) + 1}`,
  }))
}

const MOCK_PAYMENTS = generateMockPayments(250)

// ─── Revenue chart data ────────────────────────────────────────────────────────

function generateRevenueChart(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(4000 + Math.sin(i * 0.6) * 1500 + Math.random() * 800),
      transactions: Math.round(20 + Math.random() * 30),
    }
  })
}

function downloadPaymentsCSV(payments: AdminPaymentRow[]) {
  const headers = ['ID', 'User', 'Amount', 'Status', 'Type', 'Method', 'Date', 'Job ID']
  const rows = payments.map((p) => [
    p.id, p.userName, p.amount.toString(), p.status, p.type, p.method,
    new Date(p.date).toLocaleDateString(), p.jobId ?? '',
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'payments.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50

export default function AdminPaymentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [chartData, setChartData] = useState(() => generateRevenueChart(30))

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') router.push('/dashboard')
  }, [profile, authLoading, router])

  const refresh = useCallback(() => {
    setLoading(true)
    const days = DAYS_MAP[dateRange]
    setTimeout(() => {
      setChartData(generateRevenueChart(days))
      setLoading(false)
      setRefreshing(false)
    }, 400)
  }, [dateRange])

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') refresh()
  }, [authLoading, profile, refresh])

  useEffect(() => {
    setChartData(generateRevenueChart(DAYS_MAP[dateRange]))
  }, [dateRange])

  // Filter & sort payments
  const filtered = MOCK_PAYMENTS.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (methodFilter !== 'all' && p.method !== methodFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!p.id.includes(q) && !p.userName.toLowerCase().includes(q) && !(p.jobTitle ?? '').toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
    }
    return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0)
  const totalTransactions = chartData.reduce((s, d) => s + d.transactions, 0)
  const succeeded = MOCK_PAYMENTS.filter((p) => p.status === 'succeeded').length
  const failed = MOCK_PAYMENTS.filter((p) => p.status === 'failed').length

  const methodPie = PAYMENT_METHODS.map((m, i) => ({
    name: m.replace('_', ' '),
    value: [69.1, 23.5, 5.7, 1.7][i],
    color: ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'][i],
  }))

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></main>
        <Footer />
      </div>
    )
  }

  if (profile?.role !== 'admin') return null

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('desc')
    }
    setPage(1)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Billing</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue analytics and payment management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setDateRange(r); setPage(1) }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    dateRange === r
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {r}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); refresh() }} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadPaymentsCSV(filtered)}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(totalRevenue)}
              subtitle={`${DAYS_MAP[dateRange]} days`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
              trend={9.2}
              trendLabel="vs prev period"
            />
            <MetricCard
              label="Processed"
              value={totalTransactions.toLocaleString()}
              subtitle="Total transactions"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
              trend={7.4}
              trendLabel="vs prev period"
            />
            <MetricCard
              label="Failed"
              value={failed.toLocaleString()}
              subtitle={`${((failed / (succeeded + failed)) * 100).toFixed(1)}% failure rate`}
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600"
              trend={-12.0}
              trendLabel="vs prev period"
            />
            <MetricCard
              label="Avg Transaction"
              value={formatCurrency(totalRevenue / Math.max(totalTransactions, 1))}
              subtitle="Per payment"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-violet-100 dark:bg-violet-900/30"
              iconColor="text-violet-600"
              trend={3.1}
              trendLabel="vs prev period"
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsLineChart
                  data={chartData}
                  xKey="date"
                  series={[{ key: 'revenue', label: 'Revenue', color: '#6366f1' }]}
                  height={220}
                  formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
              </CardContent>
            </Card>

            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <AnalyticsPieChart
                  data={methodPie}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                  height={240}
                  innerRadius={50}
                />
              </CardContent>
            </Card>
          </div>

          {/* Payment table */}
          <Card padding="none">
            <CardHeader className="p-5 pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Payment Transactions</CardTitle>
                <span className="text-sm text-gray-400">{filtered.length} total</span>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, user, or job…"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus); setPage(1) }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filter by payment method"
                >
                  <option value="all">All methods</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>

                <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Filter className="h-4 w-4" />
                  More filters
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ID</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">User</th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('amount')}
                      >
                        Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Method</th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('date')}
                      >
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {paginated.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{payment.id}</td>
                        <td className="px-5 py-3 text-gray-900 dark:text-gray-100 font-medium">{payment.userName}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={STATUS_COLORS[payment.status] ?? 'info'} className="capitalize">
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 capitalize text-gray-600 dark:text-gray-300">{payment.type}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 capitalize">{payment.method.replace('_', ' ')}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                          {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  )
}
