'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Clock, DollarSign, Target, BarChart2 } from 'lucide-react'

interface QuoteStatsProps {
  workerId: string
}

interface Stats {
  total: number
  accepted: number
  rejected: number
  pending: number
  expired: number
  acceptanceRate: number
  thisMonthCount: number
  averageAcceptedValue: number
  avgResponseTimeHours: number | null
}

export default function QuoteStats({ workerId }: QuoteStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workerId) return
    fetch(`/api/quotes/worker/${workerId}?stats=true`, {
      headers: { 'x-user-id': workerId },
    })
      .then((r) => r.json())
      .then((data) => setStats(data.stats ?? null))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [workerId])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Quote Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Quote Performance</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">No quotes submitted yet. Submit your first quote to see stats here.</p>
        </CardContent>
      </Card>
    )
  }

  const barTotal = stats.total
  const acceptedPct = barTotal > 0 ? (stats.accepted / barTotal) * 100 : 0
  const pendingPct = barTotal > 0 ? (stats.pending / barTotal) * 100 : 0
  const rejectedPct = barTotal > 0 ? (stats.rejected / barTotal) * 100 : 0
  const expiredPct = barTotal > 0 ? (stats.expired / barTotal) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary-500" />
          Quote Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptanceRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.accepted} of {stats.total} accepted</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">This Month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonthCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">quotes submitted</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Avg Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageAcceptedValue > 0 ? formatCurrency(stats.averageAcceptedValue) : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">accepted quotes</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Avg Response</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgResponseTimeHours !== null
                ? stats.avgResponseTimeHours < 24
                  ? `${stats.avgResponseTimeHours}h`
                  : `${Math.round(stats.avgResponseTimeHours / 24)}d`
                : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">time to accept</p>
          </div>
        </div>

        {/* Status bar */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Breakdown — {stats.total} total
          </p>
          <div className="flex rounded-full overflow-hidden h-4">
            {acceptedPct > 0 && (
              <div
                className="bg-green-500 flex items-center justify-center"
                style={{ width: `${acceptedPct}%` }}
                title={`Accepted: ${stats.accepted}`}
              />
            )}
            {pendingPct > 0 && (
              <div
                className="bg-yellow-400 flex items-center justify-center"
                style={{ width: `${pendingPct}%` }}
                title={`Pending: ${stats.pending}`}
              />
            )}
            {rejectedPct > 0 && (
              <div
                className="bg-red-400 flex items-center justify-center"
                style={{ width: `${rejectedPct}%` }}
                title={`Rejected: ${stats.rejected}`}
              />
            )}
            {expiredPct > 0 && (
              <div
                className="bg-gray-400 flex items-center justify-center"
                style={{ width: `${expiredPct}%` }}
                title={`Expired: ${stats.expired}`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Accepted ({stats.accepted})
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Pending ({stats.pending})
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Rejected ({stats.rejected})
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> Expired ({stats.expired})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
