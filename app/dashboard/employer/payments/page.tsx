'use client'

/**
 * Employer Payment History — /app/dashboard/employer/payments/page.tsx
 *
 * Displays:
 *   - Jobs posted and posting fees paid
 *   - Active escrow balances
 *   - Completed payments
 *   - Total spent
 */

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  CreditCard,
  Lock,
  Unlock,
  DollarSign,
  Briefcase,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { POSTING_FEES, getPostingFee, type EscrowRecord, type PostingFeeSize } from '@/types'

function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface PostedJobRecord {
  id: string
  title: string
  estimatedBudget: number
  postingFee: number
  feeSize: PostingFeeSize
  feePaid: boolean
  postedAt: string
  status: string
}

interface EmployerPaymentSummary {
  postedJobs: PostedJobRecord[]
  escrows: Array<EscrowRecord & { jobTitle: string }>
}

// ─── Mock data (replace with Firestore queries in production) ─────────────────

const MOCK_POSTED_JOBS: PostedJobRecord[] = [
  {
    id: 'job_1',
    title: 'Bathroom Renovation — Tile Work',
    estimatedBudget: 1850,
    postingFee: 29.99,
    feeSize: 'medium',
    feePaid: true,
    postedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    status: 'completed',
  },
  {
    id: 'job_2',
    title: 'Kitchen Sink Replacement',
    estimatedBudget: 420,
    postingFee: 14.99,
    feeSize: 'small',
    feePaid: true,
    postedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'in_progress',
  },
  {
    id: 'job_3',
    title: 'Electrical Panel Upgrade',
    estimatedBudget: 2800,
    postingFee: 54.99,
    feeSize: 'large',
    feePaid: true,
    postedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    status: 'completed',
  },
  {
    id: 'job_4',
    title: 'Fence Installation — 20m',
    estimatedBudget: 1100,
    postingFee: 29.99,
    feeSize: 'medium',
    feePaid: false,
    postedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'draft',
  },
]

const MOCK_ESCROWS: Array<EscrowRecord & { jobTitle: string }> = [
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
    workerId: 'worker_2',
    employerId: 'emp_1',
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
    workerId: 'worker_3',
    employerId: 'emp_1',
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
]

const ESCROW_STATUS_CONFIG: Record<
  EscrowRecord['status'],
  { label: string; icon: React.ElementType; colorClass: string }
> = {
  released:        { label: 'Released',         icon: Unlock,      colorClass: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  in_escrow:       { label: 'In Escrow',         icon: Lock,        colorClass: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  pending_deposit: { label: 'Awaiting Deposit',  icon: Clock,       colorClass: 'text-gray-500 bg-gray-100 dark:bg-gray-700' },
  pending:         { label: 'Awaiting Deposit',  icon: Clock,       colorClass: 'text-gray-500 bg-gray-100 dark:bg-gray-700' },
  held:            { label: 'In Escrow',         icon: Lock,        colorClass: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  disputed:        { label: 'Disputed',          icon: AlertCircle, colorClass: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  refunded:        { label: 'Refunded',          icon: CreditCard,  colorClass: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
}

export default function EmployerPaymentsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<EmployerPaymentSummary>({ postedJobs: [], escrows: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with real Firestore queries:
    // jobs: collection('jobs').where('employerId', '==', user.uid)
    // escrows: collection('escrows').where('employerId', '==', user.uid)
    void user
    setTimeout(() => {
      setData({ postedJobs: MOCK_POSTED_JOBS, escrows: MOCK_ESCROWS })
      setLoading(false)
    }, 300)
  }, [user])

  const totalPostingFees = data.postedJobs.filter((j) => j.feePaid).reduce((sum, j) => sum + j.postingFee, 0)
  const activeEscrow     = data.escrows.filter((e) => e.status === 'in_escrow').reduce((sum, e) => sum + e.amount, 0)
  const totalReleased    = data.escrows.filter((e) => e.status === 'released').reduce((sum, e) => sum + e.amount, 0)
  const totalSpent       = totalPostingFees + totalReleased

  const stats = [
    { label: 'Total Spent',    value: formatNZD(totalSpent),       icon: DollarSign, color: 'text-indigo-600',  bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Active Escrow',  value: formatNZD(activeEscrow),     icon: Lock,       color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Jobs Posted',    value: String(data.postedJobs.filter((j) => j.feePaid).length), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Jobs Completed', value: String(data.escrows.filter((e) => e.status === 'released').length), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Posting fees, escrow balances, and completed payments
              </p>
            </div>
            <Link href="/dashboard/employer">
              <Button variant="outline" size="sm">← Back to Dashboard</Button>
            </Link>
          </div>

          {/* Stats */}
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
            <div className="lg:col-span-2 space-y-6">

              {/* Escrow / Completed Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-500" />
                    Escrow & Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                  ) : data.escrows.length === 0 ? (
                    <div className="text-center py-8">
                      <Lock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No escrow records yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.escrows.map((escrow) => {
                        const cfg = ESCROW_STATUS_CONFIG[escrow.status]
                        const StatusIcon = cfg.icon
                        return (
                          <div key={escrow.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.colorClass}`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{escrow.jobTitle}</p>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                <span>Escrowed: {formatNZD(escrow.amount)}</span>
                                <span>·</span>
                                <span>Worker gets: {formatNZD(escrow.workerReceives)}</span>
                                <span>·</span>
                                <span>Fee: {formatNZD(escrow.commission)}</span>
                              </div>
                            </div>
                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.colorClass}`}>
                              {cfg.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Posted Jobs / Posting Fees */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-500" />
                    Job Posting Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                  ) : data.postedJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No jobs posted yet</p>
                      <Link href="/jobs/post">
                        <Button size="sm" className="mt-3">Post a Job</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.postedJobs.map((job) => {
                        const feeInfo = getPostingFee(job.estimatedBudget)
                        return (
                          <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              job.feePaid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {job.feePaid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {feeInfo.label} · Est. {formatNZD(job.estimatedBudget)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                {formatNZD(job.postingFee)}
                              </p>
                              <p className="text-xs text-gray-500">{job.feePaid ? 'Paid' : 'Unpaid'}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Posting fee guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-500" />
                    Posting Fee Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {POSTING_FEES.map((fee) => (
                    <div key={fee.size} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{fee.label}</p>
                        <p className="text-xs text-gray-400">{fee.description}</p>
                      </div>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatNZD(fee.fee)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Escrow protection info */}
              <Card className="border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      Escrow Protection
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your payment is held securely in escrow. Workers only receive funds
                    when you confirm the job is complete — or automatically after 7 days
                    if no dispute is raised.
                  </p>
                  {[
                    'Funds held until job complete',
                    'Raise a dispute anytime',
                    'Auto-release after 7 days',
                    'Full payment protection',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Post a job CTA */}
              <Link href="/jobs/post">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Post a New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
