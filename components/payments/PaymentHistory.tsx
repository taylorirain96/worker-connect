'use client'
import { useState } from 'react'
import PaymentCard from './PaymentCard'
import PaymentStatusBadge from './PaymentStatusBadge'
import { formatCurrency } from '@/lib/utils'
import type { Payment } from '@/types'
import { CreditCard, Search } from 'lucide-react'

type StatusFilter = 'all' | Payment['status']

interface PaymentHistoryProps {
  payments: Payment[]
}

const FILTER_TABS: StatusFilter[] = [
  'all',
  'completed',
  'processing',
  'pending',
  'failed',
  'refunded',
]

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = payments.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch =
      !search ||
      p.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      p.stripePaymentIntentId.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalCompleted = payments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{payments.length} total transactions</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalCompleted)} received
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title or payment ID…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {FILTER_TABS.map((f) => {
          const count = f === 'all' ? payments.length : payments.filter((p) => p.status === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
                filter === f
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {count > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs px-1.5 min-w-[1.25rem]">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-gray-600">
            <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No payments found</p>
          </div>
        ) : (
          filtered.map((payment) => (
            <div key={payment.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <PaymentCard payment={payment} />
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
