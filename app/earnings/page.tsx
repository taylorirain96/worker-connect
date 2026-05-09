'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import EarningsChart from '@/components/earnings/EarningsChart'
import { useAuth } from '@/components/providers/AuthProvider'
import { buildEarningsSummary } from '@/lib/earnings/calculateEarnings'
import { calculateMultiplier, getMultiplierSources, formatMultiplier } from '@/lib/earnings/multipliers'
import { formatCurrency } from '@/lib/utils'
import type { EarningsTransaction } from '@/types'
import {
  DollarSign, TrendingUp, Clock, ArrowUpRight, Users, Zap, Info
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

function escrowDocsToTransactions(docs: { id: string; data: DocumentData }[]): EarningsTransaction[] {
  return docs.map((d) => {
    const data = d.data
    const toISO = (v: unknown): string => {
      if (v && typeof v === 'object' && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString()
      if (typeof v === 'string') return v
      return new Date().toISOString()
    }
    const status = data.status === 'released' ? 'available' : 'pending'
    const amount: number = typeof data.workerReceives === 'number' ? data.workerReceives
      : typeof data.workerAmount === 'number' ? data.workerAmount
      : typeof data.amount === 'number' ? data.amount : 0
    return {
      id: d.id,
      workerId: data.workerId ?? '',
      type: 'job' as const,
      amount,
      description: data.jobTitle ? `Job — ${data.jobTitle}` : 'Job payment',
      jobId: data.jobId,
      status,
      createdAt: toISO(data.createdAt),
      weekOf: toISO(data.createdAt).slice(0, 7),
    }
  })
}

export default function EarningsPage() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'escrows'),
      where('workerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    getDocs(q)
      .then((snap) => {
        const txns = escrowDocsToTransactions(snap.docs.map((d) => ({ id: d.id, data: d.data() })))
        setTransactions(txns)
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [user])

  const multiplierCtx = useMemo(() => ({
    // Treat any positive weekly points as a top-3 rank approximation; exact rank
    // requires a server-side leaderboard query which can be added as a future improvement.
    leaderboardRank: (profile?.weeklyPoints ?? 0) > 0 ? (1 as const) : undefined,
    recentReferral: false,
    loyaltyUnlocked: (profile?.completedJobs ?? 0) >= 10,
    photoDocumentation: false,
  }), [profile?.weeklyPoints, profile?.completedJobs])

  const summary = useMemo(() => buildEarningsSummary(transactions), [transactions])
  const multiplier = useMemo(() => calculateMultiplier(multiplierCtx), [multiplierCtx])
  const multiplierSources = useMemo(() => getMultiplierSources(multiplierCtx), [multiplierCtx])

  const growth =
    summary.totalLastMonth > 0
      ? (((summary.totalThisMonth - summary.totalLastMonth) / summary.totalLastMonth) * 100).toFixed(1)
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-emerald-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s earnings dashboard
                </p>
              </div>
            </div>
            <Link href="/earnings/withdraw">
              <Button>
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Lifetime', value: formatCurrency(summary.totalLifetime), sub: 'total', icon: DollarSign, color: 'text-gray-900 dark:text-white' },
                  { label: 'This Month', value: formatCurrency(summary.totalThisMonth), sub: growth ? `${growth}% vs last month` : 'vs last month', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Available', value: formatCurrency(summary.availableBalance), sub: 'ready to withdraw', icon: Zap, color: 'text-primary-600 dark:text-primary-400' },
                  { label: 'Pending', value: formatCurrency(summary.pendingBalance), sub: 'processing', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <Card key={label} padding="sm">
                    <CardContent>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                      </div>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Available balance + quick withdraw */}
              {summary.availableBalance >= 25 && (
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                  <CardContent>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                          {formatCurrency(summary.availableBalance)} ready to withdraw
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">Standard transfers are free</p>
                      </div>
                      <Link href="/earnings/withdraw">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Withdraw Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Multiplier */}
              <Card padding="sm">
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Active Multiplier: {formatMultiplier(multiplier)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Info className="h-3.5 w-3.5" />
                      Max 3.0x
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {multiplierSources.filter((s) => s.active).map((s) => (
                      <span
                        key={s.id}
                        className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-1 rounded-full"
                      >
                        {s.label} +{(s.value * 100).toFixed(0)}%
                        {s.expiresAt && (
                          <span className="ml-1 opacity-60">
                            · expires {new Date(s.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </span>
                    ))}
                    {multiplierSources.filter((s) => s.active).length === 0 && (
                      <span className="text-xs text-gray-400">No active boosts — complete jobs &amp; referrals to earn multipliers!</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Earnings chart */}
              {summary.monthlyBreakdown.length > 0 && (
                <Card>
                  <CardContent>
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Last 12 Months</h2>
                    <EarningsChart data={summary.monthlyBreakdown} height={200} />
                  </CardContent>
                </Card>
              )}

              {/* Breakdown */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Cashback', amount: summary.cashbackEarned, icon: '💼', color: 'text-primary-600 dark:text-primary-400' },
                  { label: 'Referrals', amount: summary.referralEarned, icon: '👥', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Bonuses', amount: summary.bonusEarned, icon: '🎁', color: 'text-purple-600 dark:text-purple-400' },
                ].map(({ label, amount, icon, color }) => (
                  <Card key={label} padding="sm">
                    <CardContent>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{icon}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No earnings yet — complete jobs to see them here.</p>
                </div>
              )}
            </>
          )}

          {/* Quick links */}
          <div className="flex flex-wrap gap-3">
            <Link href="/earnings/history">
              <Button variant="outline" size="sm">
                Transaction History
              </Button>
            </Link>
            <Link href="/referrals">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" />
                Referral Dashboard
              </Button>
            </Link>
            <Link href="/earnings/withdraw">
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4" />
                Withdraw Funds
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
