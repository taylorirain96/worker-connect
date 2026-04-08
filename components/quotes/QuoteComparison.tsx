'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Quote } from '@/types'
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface QuoteComparisonProps {
  quotes: Quote[]
  onAccept?: (quoteId: string) => Promise<void>
  onReject?: (quoteId: string) => Promise<void>
}

type SortKey = 'price' | 'timeline' | 'date'

const TIMELINE_ORDER: Record<string, number> = {
  'Same day': 0,
  'Next day': 1,
  'This week': 2,
  'Next week': 3,
  'Flexible': 4,
}

export default function QuoteComparison({ quotes, onAccept, onReject }: QuoteComparisonProps) {
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sorted = [...quotes].sort((a, b) => {
    if (sortKey === 'price') return a.totalPrice - b.totalPrice
    if (sortKey === 'timeline') {
      const ao = TIMELINE_ORDER[a.timeline ?? ''] ?? 99
      const bo = TIMELINE_ORDER[b.timeline ?? ''] ?? 99
      return ao - bo
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const minPrice = Math.min(...quotes.map((q) => q.totalPrice))
  const maxPrice = Math.max(...quotes.map((q) => q.totalPrice))

  const handleAccept = async (quoteId: string) => {
    if (!onAccept) return
    setLoading(quoteId)
    setErrors((prev) => { const next = { ...prev }; delete next[quoteId]; return next })
    try {
      await onAccept(quoteId)
    } catch (e) {
      setErrors((prev) => ({ ...prev, [quoteId]: e instanceof Error ? e.message : 'Failed' }))
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (quoteId: string) => {
    if (!onReject) return
    setLoading(quoteId)
    setErrors((prev) => { const next = { ...prev }; delete next[quoteId]; return next })
    try {
      await onReject(quoteId)
    } catch (e) {
      setErrors((prev) => ({ ...prev, [quoteId]: e instanceof Error ? e.message : 'Failed' }))
    } finally {
      setLoading(null)
    }
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No quotes submitted for this job yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sort by:</span>
        {(['price', 'timeline', 'date'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortKey === key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Quote Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((quote, index) => {
          const isBest = quote.totalPrice === minPrice
          const isWorst = quotes.length > 1 && quote.totalPrice === maxPrice
          const isExpired = new Date(quote.expiresAt) < new Date()

          return (
            <Card key={quote.id} className={isBest && quotes.length > 1 ? 'ring-2 ring-green-500' : ''}>
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {/* Rank & Best badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">#{index + 1}</span>
                      {isBest && quotes.length > 1 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Best Price
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      quote.status === 'accepted'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : quote.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {quote.status === 'accepted' ? <CheckCircle className="h-3 w-3" /> : quote.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {quote.status}
                    </span>
                  </div>

                  {/* Worker */}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{quote.workerName}</p>
                    {quote.availability && (
                      <p className="text-xs text-green-600 dark:text-green-400">{quote.availability}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(quote.totalPrice)}
                      </p>
                      {quotes.length > 1 && (
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          {isBest ? (
                            <><TrendingDown className="h-3 w-3 text-green-500" /><span className="text-green-600">Lowest</span></>
                          ) : isWorst ? (
                            <><TrendingUp className="h-3 w-3 text-red-500" /><span className="text-red-600">Highest</span></>
                          ) : (
                            <><Minus className="h-3 w-3 text-gray-400" /><span className="text-gray-400">{formatCurrency(quote.totalPrice - minPrice)} above lowest</span></>
                          )}
                        </div>
                      )}
                    </div>
                    {quote.timeline && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {quote.timeline}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{quote.description}</p>

                  {/* Breakdown pills */}
                  {(quote.laborHours || (quote.materials?.length ?? 0) > 0 || quote.travel) && (
                    <div className="flex flex-wrap gap-1.5">
                      {quote.laborHours ? (
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                          {quote.laborHours}h labor
                        </span>
                      ) : null}
                      {(quote.materials?.length ?? 0) > 0 ? (
                        <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                          {quote.materials!.length} material{quote.materials!.length !== 1 ? 's' : ''}
                        </span>
                      ) : null}
                      {quote.travel ? (
                        <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                          {quote.travel.distance}mi travel
                        </span>
                      ) : null}
                    </div>
                  )}

                  {errors[quote.id] && (
                    <p className="text-xs text-red-500">{errors[quote.id]}</p>
                  )}

                  {/* Actions */}
                  {quote.status === 'pending' && !isExpired && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(quote.id)}
                        loading={loading === quote.id}
                        disabled={loading !== null}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(quote.id)}
                        loading={loading === quote.id}
                        disabled={loading !== null}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                    </div>
                  )}
                  {isExpired && quote.status === 'pending' && (
                    <p className="text-xs text-red-500 pt-2 border-t border-gray-100 dark:border-gray-700">Expired</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
