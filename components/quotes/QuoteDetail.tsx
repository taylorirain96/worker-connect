'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Quote } from '@/types'
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Package } from 'lucide-react'

interface QuoteDetailProps {
  quote: Quote
  isEmployer?: boolean
  onAccept?: (quoteId: string) => Promise<void>
  onReject?: (quoteId: string) => Promise<void>
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: Clock },
}

export default function QuoteDetail({ quote, isEmployer = false, onAccept, onReject }: QuoteDetailProps) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const status = STATUS_CONFIG[quote.status]
  const StatusIcon = status.icon

  const materialsTotal = quote.materials?.reduce((s, m) => s + m.cost, 0) ?? 0
  const laborTotal = (quote.laborHours ?? 0) * (quote.laborRate ?? 0)
  const travelCost = quote.travel?.cost ?? 0
  const expiresAt = new Date(quote.expiresAt)
  const isExpired = expiresAt < new Date()

  const handleAccept = async () => {
    if (!onAccept) return
    setLoading('accept')
    setError(null)
    try {
      await onAccept(quote.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept quote')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setLoading('reject')
    setError(null)
    try {
      await onReject(quote.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject quote')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{quote.jobTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Submitted by {quote.workerName}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Worker info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {quote.workerAvatar ? (
              <img src={quote.workerAvatar} alt={quote.workerName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{quote.workerName}</p>
              {quote.availability && (
                <p className="text-xs text-green-600 dark:text-green-400">{quote.availability}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{quote.description}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            {quote.timeline && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{quote.timeline}</span>
              </div>
            )}
            {quote.travel && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{quote.travel.distance} miles travel</span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <p className="font-medium text-gray-900 dark:text-white text-sm">Price Breakdown</p>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Base price</span>
              <span>{formatCurrency(quote.basePrice)}</span>
            </div>
            {laborTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Labor ({quote.laborHours}h × {formatCurrency(quote.laborRate ?? 0)}/hr)</span>
                <span>{formatCurrency(laborTotal)}</span>
              </div>
            )}
            {materialsTotal > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Materials</span>
                  <span>{formatCurrency(materialsTotal)}</span>
                </div>
                {quote.materials?.map((m, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-500 dark:text-gray-500 pl-4">
                    <span>{m.description}</span>
                    <span>{formatCurrency(m.cost)}</span>
                  </div>
                ))}
              </div>
            )}
            {travelCost > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Travel</span>
                <span>{formatCurrency(travelCost)}</span>
              </div>
            )}
            {quote.tax !== undefined && quote.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(quote.totalPrice)}</span>
            </div>
          </div>

          {/* Conditions */}
          {quote.conditions && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Notes: </span>
              {quote.conditions}
            </div>
          )}

          {/* Expiry */}
          <p className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {isExpired ? 'This quote has expired.' : `Expires ${expiresAt.toLocaleDateString()}`}
          </p>

          {/* Actions */}
          {isEmployer && quote.status === 'pending' && !isExpired && (
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleReject}
                loading={loading === 'reject'}
                disabled={loading !== null}
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                loading={loading === 'accept'}
                disabled={loading !== null}
                className="flex-1"
              >
                Accept Quote
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
