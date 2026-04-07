'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  type PieLabelRenderProps,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle, Users } from 'lucide-react'
import type { PaymentAnalyticsSummary } from '@/types/payment'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface StatCardProps {
  label: string
  value: string
  trend?: number
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, trend, icon, color }: StatCardProps) {
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}% vs last period
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface PaymentAnalyticsProps {
  initialPeriod?: '1m' | '3m' | '6m' | '1y'
}

const PERIOD_OPTIONS = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
] as const

export default function PaymentAnalytics({ initialPeriod = '6m' }: PaymentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PaymentAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y'>(initialPeriod)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/payments/analytics?period=${period}`, {
        headers: { 'x-user-role': 'admin' },
      })
      if (!res.ok) throw new Error('Failed to load analytics')
      const data = await res.json() as { analytics: PaymentAnalyticsSummary }
      setAnalytics(data.analytics)
    } catch {
      setError('Failed to load payment analytics')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { void fetchAnalytics() }, [fetchAnalytics])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  if (loading) {
    return <div className="flex justify-center py-16"><LoadingSpinner /></div>
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-sm text-red-500 py-8">{error ?? 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={fmt(analytics.totalRevenue)}
          trend={analytics.revenueGrowthPct}
          icon={<DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
          color="bg-primary-100 dark:bg-primary-900/30"
        />
        <StatCard
          label="Total Payouts"
          value={fmt(analytics.totalPayouts)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          label="Avg Transaction"
          value={fmt(analytics.averagePaymentValue)}
          icon={<CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          label="Active Disputes"
          value={analytics.disputeCount.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Revenue vs Payouts chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue &amp; Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.revenueByMonth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [fmt(Number(value ?? 0))]} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="payouts" name="Payouts" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Refunds & disputes trend */}
        <Card>
          <CardHeader>
            <CardTitle>Refunds &amp; Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.revenueByMonth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [fmt(Number(value ?? 0))]} />
                <Legend />
                <Line type="monotone" dataKey="refunds" name="Refunds" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="disputes" name="Disputes" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment method breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.paymentMethodBreakdown}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(props: PieLabelRenderProps) =>
                    `${String(props.name ?? "")} ${((Number(props.percent) || 0) * 100).toFixed(0)}%`
                  }
                >
                  {analytics.paymentMethodBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [fmt(Number(value ?? 0))]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top workers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <CardTitle>Top Earners</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topWorkers.map((w, i) => (
              <div key={w.workerId} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{w.workerName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{w.count} payments</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(w.total)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
