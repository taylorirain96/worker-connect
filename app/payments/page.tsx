'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import PaymentCard from '@/components/payments/PaymentCard'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import type { Payment } from '@/types'
import {
  CreditCard, DollarSign, Clock, CheckCircle, XCircle, ArrowLeft, TrendingUp
} from 'lucide-react'

// ─── Mock data (replace with Firestore calls via paymentService) ──────────────
const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay_1',
    jobId: 'job_1',
    jobTitle: 'Plumbing Repair — Kitchen Sink',
    employerId: 'emp_1',
    workerId: 'worker_1',
    amount: 320,
    currency: 'usd',
    status: 'completed',
    stripePaymentIntentId: 'pi_mock_1',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'pay_2',
    jobId: 'job_2',
    jobTitle: 'Electrical Panel Upgrade',
    employerId: 'emp_2',
    workerId: 'worker_1',
    amount: 850,
    currency: 'usd',
    status: 'processing',
    stripePaymentIntentId: 'pi_mock_2',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pay_3',
    jobId: 'job_3',
    jobTitle: 'HVAC Maintenance Service',
    employerId: 'emp_1',
    workerId: 'worker_1',
    amount: 200,
    currency: 'usd',
    status: 'pending',
    stripePaymentIntentId: 'pi_mock_3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pay_4',
    jobId: 'job_4',
    jobTitle: 'Carpentry — Deck Repair',
    employerId: 'emp_3',
    workerId: 'worker_1',
    amount: 450,
    currency: 'usd',
    status: 'completed',
    stripePaymentIntentId: 'pi_mock_4',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'pay_5',
    jobId: 'job_5',
    jobTitle: 'Roof Inspection & Repair',
    employerId: 'emp_2',
    workerId: 'worker_1',
    amount: 175,
    currency: 'usd',
    status: 'failed',
    stripePaymentIntentId: 'pi_mock_5',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

type StatusFilter = 'all' | Payment['status']

export default function PaymentsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const filtered = filter === 'all' ? MOCK_PAYMENTS : MOCK_PAYMENTS.filter((p) => p.status === filter)

  const totalCompleted = MOCK_PAYMENTS
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0)
  const totalPending = MOCK_PAYMENTS
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + p.amount, 0)
  const failedCount = MOCK_PAYMENTS.filter((p) => p.status === 'failed').length

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back link */}
          <Link
            href="/earnings"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Earnings
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.displayName ?? 'Worker'}&apos;s payment history
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Received</span>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalCompleted)}
                </p>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalPending)}
                </p>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Failed</span>
                </div>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {failedCount} payment{failedCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3">
            <Link href="/invoices">
              <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <DollarSign className="h-4 w-4" />
                Invoices
              </button>
            </Link>
            <Link href="/payouts">
              <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <TrendingUp className="h-4 w-4" />
                Payouts
              </button>
            </Link>
            <Link href="/earnings">
              <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <TrendingUp className="h-4 w-4" />
                Earnings Dashboard
              </button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {(['all', 'completed', 'processing', 'pending', 'failed', 'refunded'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  filter === f
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Payment list */}
          <Card padding="none">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  No payments found
                </div>
              ) : (
                filtered.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
