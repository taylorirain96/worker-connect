'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import PaymentCard from './PaymentCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import Input from '@/components/ui/Input'
import type { Payment } from '@/types'

interface PaymentHistoryProps {
  userId: string
  role?: 'worker' | 'employer'
}

const STATUS_OPTIONS = ['all', 'completed', 'processing', 'pending', 'refunded', 'failed'] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

export default function PaymentHistory({ userId, role = 'worker' }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/payments/history?userId=${encodeURIComponent(userId)}&role=${role}`)
      if (!res.ok) throw new Error('Failed to load payment history')
      const data = await res.json() as { payments: Payment[] }
      setPayments(data.payments ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, role])

  useEffect(() => { void fetchPayments() }, [fetchPayments])

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesSearch = !search || p.jobTitle.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totals = {
    completed: payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    pending: payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Completed', value: fmt(totals.completed), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending', value: fmt(totals.pending), color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Total Transactions', value: payments.length.toString(), color: 'text-gray-900 dark:text-white' },
          { label: 'Failed', value: payments.filter((p) => p.status === 'failed').length.toString(), color: 'text-red-600 dark:text-red-400' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by job title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => void fetchPayments()}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Payment list */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-500 py-8">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">No payments found.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((payment) => (
                <li key={payment.id}>
                  <PaymentCard payment={payment} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
