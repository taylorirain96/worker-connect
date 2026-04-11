'use client'

/**
 * Worker Earnings Dashboard — /app/dashboard/worker/earnings/page.tsx
 *
 * Displays:
 *   - Total earned (all time)
 *   - Pending (in escrow)
 *   - This month's earnings
 *   - Commission tier badge (New / Established / Pro / Elite)
 *   - Progress bar to next tier
 *   - Transaction history table
 *   - "You only pay when you get paid" messaging
 */

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
  Shield,
  CreditCard,
  Award,
  CheckCircle,
} from 'lucide-react'
import { WORKER_TIERS, getWorkerTier, type EscrowRecord, type JobPaymentRecord } from '@/types'
import FeeBreakdown from '@/components/payments/FeeBreakdown'

function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ─── Mock data (replace with real Firestore queries in production) ─────────────

const MOCK_TRANSACTIONS: Array<
  (EscrowRecord | JobPaymentRecord) & { jobTitle: string }
> = [
  {
    id: 'escrow_1',
    jobId: 'job_1',
    jobTitle: 'Bathroom Renovation — Tile Work',
    workerId: 'worker_1',
    employerId: 'emp_1',
    amount: 1850,
    commission: 148,
    commissionRate: 0.08,
    workerReceives: 1702,
    currency: 'nzd',
    status: 'released',
    workerTier: 'established',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    releasedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'escrow_2',
    jobId: 'job_2',
    jobTitle: 'Kitchen Sink Replacement',
    workerId: 'worker_1',
    employerId: 'emp_2',
    amount: 420,
    commission: 33.60,
    commissionRate: 0.08,
    workerReceives: 386.40,
    currency: 'nzd',
    status: 'in_escrow',
    workerTier: 'established',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'escrow_3',
    jobId: 'job_3',
    jobTitle: 'Electrical Panel Upgrade',
    workerId: 'worker_1',
    employerId: 'emp_3',
    amount: 2800,
    commission: 224,
    commissionRate: 0.08,
    workerReceives: 2576,
    currency: 'nzd',
    status: 'released',
    workerTier: 'established',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    releasedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: 'escrow_4',
    jobId: 'job_4',
    jobTitle: 'Fence Installation — 20m',
    workerId: 'worker_1',
    employerId: 'emp_4',
    amount: 1100,
    commission: 88,
    commissionRate: 0.08,
    workerReceives: 1012,
    currency: 'nzd',
    status: 'pending_deposit',
    workerTier: 'established',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
] as Array<EscrowRecord & { jobTitle: string }>

const ESCROW_STATUS_CONFIG: Record<
  EscrowRecord['status'],
  { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default'; icon: React.ElementType }
> = {
  released:        { label: 'Paid Out',        variant: 'success', icon: Unlock },
  in_escrow:       { label: 'In Escrow',        variant: 'info',    icon: Lock },
  held:            { label: 'In Escrow',        variant: 'info',    icon: Lock },
  pending_deposit: { label: 'Awaiting Deposit', variant: 'warning', icon: Lock },
  pending:         { label: 'Awaiting Deposit', variant: 'warning', icon: Lock },
  disputed:        { label: 'Disputed',         variant: 'danger',  icon: Shield },
  refunded:        { label: 'Refunded',         variant: 'default', icon: CreditCard },
}

export default function WorkerEarningsPage() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Array<EscrowRecord & { jobTitle: string }>>([])
  const [loading, setLoading] = useState(true)

  const completedJobs = profile?.completedJobs ?? 8 // fallback for demo
  const tierInfo = getWorkerTier(completedJobs)
  const nextTier = WORKER_TIERS.find((t) => t.minJobs > tierInfo.minJobs)

  // Progress to next tier (0–100%)
  const progressToNext = nextTier
    ? Math.min(100, Math.round(((completedJobs - tierInfo.minJobs) / (nextTier.minJobs - tierInfo.minJobs)) * 100))
    : 100

  useEffect(() => {
    // TODO: Replace with real Firestore query:
    // collection('escrows').where('workerId', '==', user.uid).orderBy('createdAt', 'desc')
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS)
      setLoading(false)
    }, 300)
  }, [])

  const releasedTransactions = transactions.filter((t) => t.status === 'released')
  const pendingTransactions  = transactions.filter((t) => t.status === 'in_escrow' || t.status === 'pending_deposit')

  const totalEarned    = releasedTransactions.reduce((sum, t) => sum + t.workerReceives, 0)
  const pendingAmount  = pendingTransactions.reduce((sum, t) => sum + t.workerReceives, 0)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const thisMonthEarned = releasedTransactions
    .filter((t) => t.releasedAt && new Date(t.releasedAt) >= startOfMonth)
    .reduce((sum, t) => sum + t.workerReceives, 0)

  const stats = [
    { label: 'Total Earned', value: formatNZD(totalEarned), icon: DollarSign,  color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'In Escrow',    value: formatNZD(pendingAmount), icon: Lock,       color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'This Month',   value: formatNZD(thisMonthEarned), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Jobs Done',    value: String(completedJobs),   icon: CheckCircle, color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  ]

  const tierColors: Record<string, string> = {
    new:         'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    established: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    pro:         'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    elite:       'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                You only pay when you get paid — no upfront costs, ever.
              </p>
            </div>
            <Link href="/dashboard/worker">
              <Button variant="outline" size="sm">← Back to Dashboard</Button>
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Transaction history */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-10">
                      <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No transactions yet</p>
                      <p className="text-gray-400 text-xs mt-1">Complete jobs through QuickTrade to see earnings here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => {
                        const cfg = ESCROW_STATUS_CONFIG[tx.status]
                        const StatusIcon = cfg.icon
                        return (
                          <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              tx.status === 'released' ? 'bg-green-100 dark:bg-green-900/30' :
                              tx.status === 'in_escrow' ? 'bg-amber-100 dark:bg-amber-900/30' :
                              'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <StatusIcon className={`h-4 w-4 ${
                                tx.status === 'released' ? 'text-green-600' :
                                tx.status === 'in_escrow' ? 'text-amber-600' :
                                'text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{tx.jobTitle}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatNZD(tx.amount)} total · {Math.round(tx.commissionRate * 100)}% fee
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-semibold text-sm ${tx.status === 'released' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {formatNZD(tx.workerReceives)}
                              </p>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                cfg.variant === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                cfg.variant === 'info'    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                cfg.variant === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                cfg.variant === 'danger'  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tier & fee info sidebar */}
            <div className="space-y-4">

              {/* Commission Tier Badge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-500" />
                    Your Commission Tier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${tierColors[tierInfo.tier]}`}>
                    <Award className="h-4 w-4" />
                    {tierInfo.label}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Current rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(tierInfo.commissionRate * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Jobs completed</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{completedJobs}</span>
                    </div>
                  </div>

                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress to {nextTier.label}</span>
                        <span>{completedJobs}/{nextTier.minJobs} jobs</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${progressToNext}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {nextTier.minJobs - completedJobs} more job{nextTier.minJobs - completedJobs !== 1 ? 's' : ''} to unlock{' '}
                        <span className="text-indigo-500 font-medium">{Math.round(nextTier.commissionRate * 100)}% rate</span>
                      </p>
                    </div>
                  )}

                  {!nextTier && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <Award className="h-3.5 w-3.5" />
                      You&apos;re at the top tier — lowest commission rate!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fee breakdown preview */}
              <FeeBreakdown
                estimatedBudget={1850}
                quoteAmount={1850}
                workerCompletedJobs={completedJobs}
                showPostingFee={false}
              />

              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    How Payments Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {[
                    { step: '1', text: 'Employer accepts your quote' },
                    { step: '2', text: 'They deposit payment into secure escrow' },
                    { step: '3', text: 'You complete the job' },
                    { step: '4', text: 'Employer releases payment (or auto-releases after 7 days)' },
                    { step: '5', text: `QuickTrade deducts ${Math.round(tierInfo.commissionRate * 100)}% — you receive the rest` },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {step}
                      </span>
                      <span>{text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
