'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { EarningsTransaction, Withdrawal } from '@/types'
import { ArrowLeft, DollarSign, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: EarningsTransaction[] = [
  { id: 't1', workerId: 'w1', type: 'job', amount: 18.40, description: 'Job cashback — Plumbing repair', status: 'available', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 't2', workerId: 'w1', type: 'referral_bonus', amount: 25, description: 'Referral bonus — Marcus J. (3 jobs)', status: 'available', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 't3', workerId: 'w1', type: 'job', amount: 22.10, description: 'Job cashback — Electrical install', status: 'available', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 't4', workerId: 'w1', type: 'bonus', amount: 50, description: 'Milestone bonus — 10 referrals', status: 'available', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 't5', workerId: 'w1', type: 'job', amount: 14.20, description: 'Job cashback — HVAC service', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
]

const MOCK_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'w1',
    workerId: 'w1',
    amount: 200,
    fee: 4,
    netAmount: 196,
    bankAccountId: 'ba_1',
    bankAccountLast4: '4242',
    bankName: 'Chase',
    transferType: 'standard',
    status: 'completed',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 17 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 17 * 86400000).toISOString(),
  },
  {
    id: 'w2',
    workerId: 'w1',
    amount: 100,
    fee: 2,
    netAmount: 97.75,
    bankAccountId: 'ba_1',
    bankAccountLast4: '4242',
    bankName: 'Chase',
    transferType: 'instant',
    status: 'completed',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 44 * 86400000).toISOString(),
  },
]

type TabType = 'transactions' | 'withdrawals'

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  processing: <Clock className="h-4 w-4 text-blue-500" />,
  available: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  completed: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  withdrawn: <ArrowUpRight className="h-4 w-4 text-gray-400" />,
}

const TX_TYPE_ICONS: Record<string, string> = {
  job: '💼',
  referral_bonus: '👥',
  milestone: '🏆',
  bonus: '🎁',
}

export default function HistoryPage() {
  const [tab, setTab] = useState<TabType>('transactions')
  const [filterSource, setFilterSource] = useState<'all' | 'job' | 'referral_bonus' | 'bonus'>('all')

  const filteredTx = useMemo(() => {
    if (filterSource === 'all') return MOCK_TRANSACTIONS
    return MOCK_TRANSACTIONS.filter((t) => t.type === filterSource)
  }, [filterSource])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/earnings"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Earnings
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {(['transactions', 'withdrawals'] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'transactions' && (
            <>
              {/* Source filter */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'job', 'referral_bonus', 'bonus'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterSource(f)}
                    className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                      filterSource === f
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {f === 'referral_bonus' ? 'Referrals' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <Card padding="none">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredTx.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-xl">{TX_TYPE_ICONS[tx.type] ?? '💰'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(tx.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {STATUS_ICON[tx.status]}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {filteredTx.length === 0 && (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                      <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      No transactions found
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {tab === 'withdrawals' && (
            <Card padding="none">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {MOCK_WITHDRAWALS.map((w) => (
                  <div key={w.id} className="flex items-center gap-4 px-5 py-3.5">
                    <ArrowUpRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {w.bankName} ···· {w.bankAccountLast4}
                        <span className="ml-2 text-xs text-gray-400 capitalize">({w.transferType})</span>
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(w.createdAt)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Fee: {formatCurrency(w.fee + (w.transferType === 'instant' ? 0.25 : 0))} · Net: {formatCurrency(w.netAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {STATUS_ICON[w.status]}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(w.amount)}
                      </span>
                    </div>
                  </div>
                ))}

                {MOCK_WITHDRAWALS.length === 0 && (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                    No withdrawals yet
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
