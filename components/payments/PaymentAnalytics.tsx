'use client'
import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { PaymentAnalytics } from '@/types'
import type { MoverModeStats } from '@/types/payment'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, MapPin, Package } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

interface AnalyticsData extends PaymentAnalytics {
  bundleBreakdown?: {
    single: { count: number; revenue: number }
    '3pack': { count: number; revenue: number }
    '10pack': { count: number; revenue: number }
  }
  moverModeStats?: MoverModeStats
  topCategories?: Array<{ category: string; revenue: number; count: number }>
}

export default function PaymentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/payments/analytics')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load analytics')
        return r.json() as Promise<AnalyticsData>
      })
      .then(setAnalytics)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-700" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {error ?? 'Failed to load analytics'}
      </div>
    )
  }

  const bundleData = analytics.bundleBreakdown
    ? [
        { name: 'Single', ...analytics.bundleBreakdown.single },
        { name: '3-Pack', ...analytics.bundleBreakdown['3pack'] },
        { name: '10-Pack', ...analytics.bundleBreakdown['10pack'] },
      ]
    : null

  const mover = analytics.moverModeStats

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          color="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <MetricCard
          label="Total Payouts"
          value={formatCurrency(analytics.totalPayouts)}
          icon={<TrendingUp className="h-4 w-4 text-primary-600" />}
          color="bg-primary-100 dark:bg-primary-900/30"
        />
        <MetricCard
          label="Successful"
          value={analytics.successfulPayments.toLocaleString()}
          icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          label="Disputes"
          value={analytics.disputeCount.toLocaleString()}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Revenue trend */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue vs Payouts</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={analytics.revenueByMonth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              width={48}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), '']}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#22c55e"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="payouts"
              name="Payouts"
              stroke="#6366f1"
              fill="url(#colorPayouts)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Price Anchoring – Bundle breakdown */}
      {bundleData && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Price Anchoring – Bundle Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {bundleData.map((b) => (
              <div
                key={b.name}
                className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-center"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{b.name}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {b.count.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(b.revenue)}
                </p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bundleData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={48}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mover Mode stats */}
      {mover && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Mover Mode Metrics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Mover Workers</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {mover.totalMoverWorkers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Opportunities</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {mover.totalMoverOpportunities.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Acceptance Rate</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {(mover.moverAcceptanceRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Success Rate</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {(mover.moverSuccessRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Avg Bonus</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {mover.avgBonusPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">Mover Revenue</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {formatCurrency(mover.totalMoverRevenue)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Top Relocation Cities
            </p>
            <ul className="space-y-1.5">
              {mover.topRelocationCities.map((c) => (
                <li
                  key={c.city}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-3 w-3 text-amber-500" />
                    {c.city}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{c.count} workers</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Top categories */}
      {analytics.topCategories && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={analytics.topCategories}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={48}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
