'use client'

/**
 * Homeowner Spending Dashboard — /dashboard/homeowner/spending
 *
 * Shows:
 *   - Summary stat cards (total spent, in escrow, this month, jobs completed)
 *   - Monthly spending bar chart (last 6 months)
 *   - Category breakdown with visual bars
 *   - Recent transaction history
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  DollarSign, Lock, CheckCircle, Briefcase,
  TrendingUp, ArrowLeft, Tag, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { SpendingSummary, SpendingTransaction, MonthlySpend, CategorySpend } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNZD(n: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  carpentry: 'Carpentry',
  hvac: 'HVAC',
  roofing: 'Roofing',
  landscaping: 'Landscaping',
  painting: 'Painting',
  flooring: 'Flooring',
  cleaning: 'Cleaning',
  moving: 'Moving',
  general: 'General',
  apprenticeship: 'Apprenticeship',
}

const STATUS_CONFIG: Record<SpendingTransaction['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  completed: { label: 'Paid',       variant: 'success' },
  in_escrow: { label: 'In Escrow',  variant: 'warning' },
  refunded:  { label: 'Refunded',   variant: 'default' },
  disputed:  { label: 'Disputed',   variant: 'danger'  },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeownerSpendingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SpendingSummary | null>(null)
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user?.uid) return
    try {
      const res = await fetch('/api/homeowner/spending', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load spending data')
      const json = await res.json() as SpendingSummary
      setData(json)
    } catch {
      toast.error('Could not load spending summary. Please try again.')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/dashboard/homeowner/spending')
      return
    }
    if (user) fetchData()
  }, [user, loading, router, fetchData])

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="h-56 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const maxMonthly = data ? Math.max(...data.monthlyBreakdown.map((m: MonthlySpend) => m.amount), 1) : 1
  const maxCategory = data ? Math.max(...data.categoryBreakdown.map((c: CategorySpend) => c.amount), 1) : 1
  const currentMonthLabel = new Date().toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })
  const currentMonthLong = new Date().toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/homeowner"
              className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your payment history and spending overview</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Spent</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data ? fmtNZD(data.totalSpent) : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">all time</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Escrow</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data ? fmtNZD(data.inEscrow) : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">held securely</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">This Month</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data ? fmtNZD(data.thisMonthSpent) : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {currentMonthLong}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jobs Done</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data ? data.completedJobCount : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly spending chart */}
          {data && data.monthlyBreakdown.some((m: MonthlySpend) => m.amount > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Monthly Spending
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-end gap-2 h-40">
                  {data.monthlyBreakdown.map((m: MonthlySpend) => {
                    const heightPct = maxMonthly > 0 ? (m.amount / maxMonthly) * 100 : 0
                    const isCurrentMonth = m.month === currentMonthLabel
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {fmtNZD(m.amount)}
                        </span>
                        <div className="w-full flex items-end" style={{ height: '120px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              isCurrentMonth
                                ? 'bg-indigo-600 dark:bg-indigo-500'
                                : 'bg-indigo-200 dark:bg-indigo-900/60'
                            }`}
                            style={{ height: `${Math.max(heightPct, m.amount > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category breakdown */}
          {data && data.categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4 text-violet-500" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {data.categoryBreakdown.map((cat: CategorySpend) => {
                  const widthPct = maxCategory > 0 ? (cat.amount / maxCategory) * 100 : 0
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {CATEGORY_LABELS[cat.category] ?? capitalise(cat.category)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {cat.count} {cat.count === 1 ? 'job' : 'jobs'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {fmtNZD(cat.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Transaction history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data || data.transactions.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <DollarSign className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No payments yet.</p>
                  <Link
                    href="/jobs/post"
                    className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Post your first job →
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.transactions.map((txn: SpendingTransaction) => {
                    const cfg = STATUS_CONFIG[txn.status]
                    return (
                      <li key={txn.id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {txn.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {CATEGORY_LABELS[txn.category] ?? capitalise(txn.category)} · {txn.workerName} · {fmtDate(txn.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {fmtNZD(txn.amount)}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Escrow explainer */}
          {data && data.inEscrow > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {fmtNZD(data.inEscrow)} held in escrow
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  These funds are securely held and will only be released to the worker once you confirm the job is complete.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
