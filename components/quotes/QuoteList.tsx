'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Quote } from '@/types'
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface QuoteListProps {
  workerId?: string
  jobId?: string
  isEmployer?: boolean
  onAccept?: (quoteId: string) => Promise<void>
  onReject?: (quoteId: string) => Promise<void>
  onView?: (quote: Quote) => void
}

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'rejected', 'expired'] as const

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', icon: XCircle },
  expired: { label: 'Expired', color: 'text-gray-500 dark:text-gray-400', icon: Clock },
}

export default function QuoteList({
  workerId,
  jobId,
  isEmployer = false,
  onView,
}: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = ''
        if (jobId) {
          url = `/api/quotes/job/${jobId}${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
        } else if (workerId) {
          url = `/api/quotes/worker/${workerId}${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
        } else {
          setQuotes([])
          return
        }
        const res = await fetch(url, { headers: { 'x-user-id': workerId ?? 'admin' } })
        if (!res.ok) throw new Error('Failed to fetch quotes')
        const data = await res.json()
        setQuotes(data.quotes ?? [])
        setPage(0)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quotes')
      } finally {
        setLoading(false)
      }
    }
    fetchQuotes()
  }, [workerId, jobId, statusFilter])

  const paginated = quotes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(quotes.length / PAGE_SIZE)

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-sm p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 self-center">
          {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
          No quotes found.
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((quote) => {
            const status = STATUS_CONFIG[quote.status]
            const StatusIcon = status.icon
            return (
              <Card key={quote.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView?.(quote)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{quote.jobTitle}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {isEmployer ? `By ${quote.workerName}` : `Job posted`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(quote.totalPrice)}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                  {quote.timeline && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">⏱ {quote.timeline}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:text-gray-900 dark:hover:text-white"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
