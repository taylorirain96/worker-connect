'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { WITHDRAWAL_FEES } from '@/lib/earnings/calculateEarnings'
import type { EarningsTransaction, Withdrawal } from '@/types'
import { ArrowLeft, DollarSign, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

function toISO(v: unknown): string {
  if (v && typeof v === 'object' && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString()
  if (typeof v === 'string') return v
  return new Date().toISOString()
}

function escrowDocToTransaction(id: string, data: DocumentData): EarningsTransaction {
  const amount: number = typeof data.workerReceives === 'number' ? data.workerReceives
    : typeof data.workerAmount === 'number' ? data.workerAmount
    : typeof data.amount === 'number' ? data.amount : 0
  return {
    id,
    workerId: data.workerId ?? '',
    type: 'job' as const,
    amount,
    description: data.jobTitle ? `Job — ${data.jobTitle}` : 'Job payment',
    jobId: data.jobId,
    status: data.status === 'released' ? 'available' : 'pending',
    createdAt: toISO(data.createdAt),
    weekOf: toISO(data.createdAt).slice(0, 7),
  }
}

function withdrawalDocToWithdrawal(id: string, data: DocumentData): Withdrawal {
  return {
    id,
    workerId: data.uid ?? data.workerId ?? '',
    amount: data.amount ?? 0,
    fee: (data.fee ?? 0) + (data.instantFee ?? 0),
    netAmount: data.netAmount ?? 0,
    bankAccountId: data.bankAccountId ?? '',
    bankAccountLast4: data.bankAccountLast4 ?? '****',
    bankName: data.bankName ?? 'Bank',
    transferType: data.transferType ?? 'standard',
    status: data.status ?? 'pending',
    stripeTransferId: data.stripePayoutId ?? data.stripeTransferId,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt ?? data.createdAt),
    completedAt: data.completedAt ? toISO(data.completedAt) : undefined,
    failureReason: data.failureReason,
  }
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabType>('transactions')
  const [filterSource, setFilterSource] = useState<'all' | 'job' | 'referral_bonus' | 'bonus'>('all')
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) {
      setLoading(false)
      return
    }
    const uid = user.uid
    Promise.all([
      getDocs(query(collection(db, 'escrows'), where('workerId', '==', uid), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'withdrawals'), where('uid', '==', uid), orderBy('createdAt', 'desc'))),
    ])
      .then(([escrowSnap, withdrawalSnap]) => {
        setTransactions(escrowSnap.docs.map((d) => escrowDocToTransaction(d.id, d.data())))
        setWithdrawals(withdrawalSnap.docs.map((d) => withdrawalDocToWithdrawal(d.id, d.data())))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const filteredTx = useMemo(() => {
    if (filterSource === 'all') return transactions
    return transactions.filter((t) => t.type === filterSource)
  }, [filterSource, transactions])

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

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === 'transactions' ? (
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
          ) : (
            <Card padding="none">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center gap-4 px-5 py-3.5">
                    <ArrowUpRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {w.bankName} ···· {w.bankAccountLast4}
                        <span className="ml-2 text-xs text-gray-400 capitalize">({w.transferType})</span>
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(w.createdAt)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Fee: {formatCurrency(w.fee + (w.transferType === 'instant' ? WITHDRAWAL_FEES.instant.flat : 0))} · Net: {formatCurrency(w.netAmount)}
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

                {withdrawals.length === 0 && (
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
