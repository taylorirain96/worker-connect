'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  DollarSign, TrendingUp, Clock, Award, Shield, ChevronRight,
} from 'lucide-react'
import { CommissionTierLadder } from '@/components/payments/FeeTransparency'
import { getWorkerEarningsSummary, getWorkerEscrows } from '@/lib/services/escrowService'
import { COMMISSION_TIERS } from '@/types'
import type { WorkerEarningsSummary, EscrowPayment } from '@/types'

const ESCROW_STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting Payment',
  held: 'In Escrow',
  released: 'Paid Out',
  disputed: 'Disputed',
  refunded: 'Refunded',
}

const ESCROW_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  pending: 'warning',
  held: 'info',
  released: 'success',
  disputed: 'danger',
  refunded: 'default',
}

export default function WorkerEarningsPage() {
  const { user, profile } = useAuth()
  const uid = user?.uid
  const [summary, setSummary] = useState<WorkerEarningsSummary | null>(null)
  const [transactions, setTransactions] = useState<EscrowPayment[]>([])
  const [loading, setLoading] = useState(true)

  const completedJobs = profile?.completedJobs ?? 0

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        const [sum, txns] = await Promise.all([
          getWorkerEarningsSummary(uid, completedJobs),
          getWorkerEscrows(uid, 50),
        ])
        setSummary(sum)
        setTransactions(txns)
      } catch (err) {
        console.error('Failed to load earnings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [uid, completedJobs])

  const tierConfig = COMMISSION_TIERS.find(
    (t) => t.tier === (summary?.commissionTier ?? 'new')
  ) ?? COMMISSION_TIERS[0]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings Dashboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Only pay when you get paid — QuickTrade takes a small fee only on completed jobs.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Earned</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `NZ$${(summary?.totalEarned ?? 0).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-2.5">
                  <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pending Escrow</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `NZ$${(summary?.pendingEscrow ?? 0).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2.5">
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your Tier</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : tierConfig.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2.5">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Commission Rate</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '...' : `${((summary?.commissionRate ?? 0.10) * 100).toFixed(0)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Commission tier ladder */}
          <div className="md:col-span-1">
            <CommissionTierLadder completedJobs={completedJobs} />
          </div>

          {/* "Only pay when you get paid" info card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                QuickTrade Worker Promise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  You only pay when you get paid.
                </span>{' '}
                QuickTrade&apos;s small commission is deducted automatically when the employer releases escrow — you never pay anything out of pocket.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Secure escrow payment protection',
                  'Auto-generated legal contract',
                  'Dispute resolution included',
                  'Verified reviews on your profile',
                  'QuickTrade Guarantee coverage',
                  'No upfront costs, ever',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <ChevronRight className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              {summary && summary.jobsToNextTier !== null && (
                <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
                  <p className="text-sm">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {summary.jobsToNextTier} more job{summary.jobsToNextTier === 1 ? '' : 's'}
                    </span>
                    {' '}until your commission drops to{' '}
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                      {((summary.nextTierRate ?? 0) * 100).toFixed(0)}%
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Loading transactions…</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  When an employer releases escrow for your job, it will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Job</th>
                      <th className="text-right py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Gross</th>
                      <th className="text-right py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Fee</th>
                      <th className="text-right py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Net</th>
                      <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                            Job #{t.jobId.slice(-6)}
                          </div>
                          <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-slate-900 dark:text-white">
                          NZ${t.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-500 dark:text-slate-400">
                          −NZ${t.commissionAmount.toFixed(2)}
                          <div className="text-xs">({(t.commissionRate * 100).toFixed(0)}%)</div>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          NZ${t.workerAmount.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <Badge variant={ESCROW_STATUS_VARIANTS[t.status] ?? 'default'}>
                            {ESCROW_STATUS_LABELS[t.status] ?? t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
