'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Quote } from '@/types'
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Package, FileText, ArrowLeftRight } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'

interface QuoteDetailProps {
  quote: Quote
  isEmployer?: boolean
  userId?: string
  onAccept?: (quoteId: string) => Promise<void>
  onReject?: (quoteId: string) => Promise<void>
  onRefresh?: () => void
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: Clock },
  countered: { label: 'Negotiating', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: ArrowLeftRight },
}

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const { days, hours, minutes, seconds, isExpired, isUrgent } = useCountdown(expiresAt)
  if (isExpired) {
    return <span className="text-xs font-medium text-red-500">Expired</span>
  }
  const isVeryUrgent = days === 0 && hours < 2
  const color = isVeryUrgent
    ? 'text-red-500'
    : isUrgent
    ? 'text-amber-500'
    : 'text-gray-400 dark:text-gray-500'
  const pulse = isVeryUrgent ? 'animate-pulse' : ''
  const label = days > 0
    ? `Expires in ${days}d ${hours}h`
    : hours > 0
    ? `Expires in ${hours}h ${minutes}m`
    : `Expires in ${minutes}m ${seconds}s`
  return <span className={`text-xs font-medium ${color} ${pulse}`}>{label}</span>
}

function LightboxModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-lg object-contain" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default function QuoteDetail({ quote, isEmployer = false, userId, onAccept, onReject, onRefresh }: QuoteDetailProps) {
  const [loading, setLoading] = useState<'accept' | 'reject' | 'counter' | 'acceptCounter' | 'declineCounter' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCounterForm, setShowCounterForm] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterNote, setCounterNote] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const status = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.pending
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

  const handleSendCounter = async () => {
    const price = Number(counterPrice)
    if (!price || price <= 0) {
      setError('Enter a valid counter offer price')
      return
    }
    setLoading('counter')
    setError(null)
    try {
      const res = await fetch(`/api/quotes/${quote.id}/counter`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId ?? quote.employerId },
        body: JSON.stringify({ counterOfferPrice: price, counterOfferNote: counterNote || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send counter offer')
      }
      setShowCounterForm(false)
      setCounterPrice('')
      setCounterNote('')
      onRefresh?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send counter offer')
    } finally {
      setLoading(null)
    }
  }

  const handleAcceptCounter = async () => {
    setLoading('acceptCounter')
    setError(null)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId ?? quote.workerId },
        body: JSON.stringify({ status: 'accepted' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to accept counter offer')
      }
      onRefresh?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept counter offer')
    } finally {
      setLoading(null)
    }
  }

  const handleDeclineCounter = async () => {
    if (!onReject) return
    setLoading('declineCounter')
    setError(null)
    try {
      await onReject(quote.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decline counter offer')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {lightboxSrc && (
        <LightboxModal src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
      )}
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
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                {quote.status === 'pending' && !isExpired && (
                  <ExpiryCountdown expiresAt={quote.expiresAt} />
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Worker info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {quote.workerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
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

            {/* Counter Offer Banner (worker view when countered) */}
            {!isEmployer && quote.status === 'countered' && quote.counterOfferPrice && (
              <div className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-orange-800 dark:text-orange-300 text-sm">Employer Counter Offer</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                  {formatCurrency(quote.counterOfferPrice)}
                </p>
                {quote.counterOfferNote && (
                  <p className="text-sm text-orange-700 dark:text-orange-400 italic">&quot;{quote.counterOfferNote}&quot;</p>
                )}
                {quote.counterOfferAt && (
                  <p className="text-xs text-orange-600 dark:text-orange-500">
                    Sent {new Date(quote.counterOfferAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeclineCounter}
                    loading={loading === 'declineCounter'}
                    disabled={loading !== null}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptCounter}
                    loading={loading === 'acceptCounter'}
                    disabled={loading !== null}
                    className="flex-1"
                  >
                    Accept {formatCurrency(quote.counterOfferPrice)}
                  </Button>
                </div>
              </div>
            )}

            {/* Show existing counter offer details on employer view */}
            {isEmployer && quote.status === 'countered' && quote.counterOfferPrice && (
              <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 p-3 text-sm text-orange-700 dark:text-orange-400">
                <p className="font-medium">Counter offer sent: {formatCurrency(quote.counterOfferPrice)}</p>
                {quote.counterOfferNote && <p className="mt-1 italic">&quot;{quote.counterOfferNote}&quot;</p>}
                <p className="text-xs mt-1 text-orange-500">Waiting for worker response</p>
              </div>
            )}

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
                  <span>{quote.travel.distance} km travel</span>
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

            {/* Attachments */}
            {quote.attachments && quote.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</p>
                <div className="flex flex-wrap gap-3">
                  {quote.attachments.map((att, i) => (
                    att.type === 'image' ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setLightboxSrc(att.url); setLightboxAlt(att.name) }}
                        className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-80 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors px-2"
                      >
                        <FileText className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 text-center truncate w-full">{att.name}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Expiry */}
            {quote.status !== 'countered' && (
              <p className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {isExpired ? 'This quote has expired.' : `Expires ${expiresAt.toLocaleDateString()}`}
              </p>
            )}

            {/* Employer Actions */}
            {isEmployer && (quote.status === 'pending' || quote.status === 'countered') && !isExpired && (
              <div className="space-y-3">
                {!showCounterForm ? (
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
                    {quote.status === 'pending' && (
                      <Button
                        variant="outline"
                        onClick={() => setShowCounterForm(true)}
                        disabled={loading !== null}
                        className="flex-1 border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        Counter Offer
                      </Button>
                    )}
                    <Button
                      onClick={handleAccept}
                      loading={loading === 'accept'}
                      disabled={loading !== null}
                      className="flex-1"
                    >
                      Accept Quote
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Send Counter Offer</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Counter Price ($) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                        placeholder={formatCurrency(quote.totalPrice)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note (optional)</label>
                      <textarea
                        rows={2}
                        value={counterNote}
                        onChange={(e) => setCounterNote(e.target.value)}
                        placeholder="Explain your counter offer..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowCounterForm(false); setCounterPrice(''); setCounterNote('') }}
                        disabled={loading !== null}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendCounter}
                        loading={loading === 'counter'}
                        disabled={loading !== null}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        Send Counter Offer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
