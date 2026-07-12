'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CreditCard, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PaymentForm from '@/components/payments/PaymentForm'
import { getInitials } from '@/lib/utils'
import { normalizeCurrencyAmount } from '@/lib/utils/money'
import type { UserProfile } from '@/types'

interface RequestQuoteModalProps {
  worker: UserProfile
  homeownerId: string
  onClose: () => void
  onSuccess?: (requestId: string) => void
}

export default function RequestQuoteModal({
  worker,
  homeownerId,
  onClose,
  onSuccess,
}: RequestQuoteModalProps) {
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'details' | 'payment'>('details')
  const [minRequestDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paymentReference] = useState(() => `quote-fee-request-${worker.uid}-${Date.now()}`)

  const quoteFeeAmount = normalizeCurrencyAmount(Number(worker.quoteFeeAmount ?? 0))
  const requiresQuoteFee = Boolean(worker.chargesQuoteFee && quoteFeeAmount > 0)
  const currency = worker.country === 'AU' ? 'aud' : 'nzd'

  const submitRequest = async (paymentIntentId?: string) => {
    setSubmitting(true)

    try {
      const res = await fetch('/api/jobs/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': homeownerId,
        },
        body: JSON.stringify({
          workerId: worker.uid,
          description: description.trim(),
          date,
          address: address.trim(),
          paymentIntentId,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        requestId?: string
      }

      if (!res.ok) {
        throw new Error(data.error ?? 'Request failed')
      }

      toast.success(
        requiresQuoteFee
          ? `Quote fee paid and request sent to ${worker.displayName ?? 'the worker'}!`
          : `Request sent to ${worker.displayName ?? 'the worker'}! They'll be in touch soon.`
      )
      if (data.requestId) onSuccess?.(data.requestId)
      onClose()
    } catch (err) {
      console.error('Quote request failed:', err)
      toast.error(err instanceof Error ? err.message : 'Could not send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !date || !address.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (requiresQuoteFee) {
      setStep('payment')
      return
    }

    await submitRequest()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {worker.photoURL ? (
              <Image
                src={worker.photoURL}
                alt={worker.displayName ?? 'Worker'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(worker.displayName ?? 'W')}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                Request {worker.displayName ?? 'Worker'}
              </h2>
              {worker.skills && worker.skills.length > 0 && (
                <p className="text-xs text-gray-500 capitalize">{worker.skills[0]}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleContinue} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                What do you need done? <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Inspect a leaking shower and provide a site quote…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date needed <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minRequestDate}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12 Sample Street, Auckland"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {requiresQuoteFee ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">
                  This worker charges a {currency === 'aud' ? 'A$' : 'NZ$'}
                  {quoteFeeAmount.toFixed(2)} site-visit / quote fee.
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                  You&apos;ll pay it before the request is sent. It is separate from any later job
                  price, non-refundable, and won&apos;t be deducted if you hire this worker.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                This request goes directly to {worker.displayName ?? 'the worker'} — it won&apos;t be
                posted publicly.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                {requiresQuoteFee ? 'Continue to Payment' : submitting ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4">
              <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                <CreditCard className="h-4 w-4 text-primary-600" />
                Pay quote fee before requesting a site visit
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                This fee pays for {worker.displayName ?? 'the worker'}&apos;s time to visit and quote.
                It is separate from any future job payment, non-refundable, and not credited toward
                the job price if you hire them later.
              </p>
            </div>

            <PaymentForm
              amount={quoteFeeAmount}
              currency={currency}
              jobId={paymentReference}
              employerId={homeownerId}
              workerId={worker.uid}
              description={`Quote/site visit fee for ${worker.displayName ?? 'worker'}`}
              createIntentBody={{
                employerId: homeownerId,
                workerId: worker.uid,
                paymentType: 'quote_fee',
                currency,
                requestDescription: description.trim(),
                requestedDate: date,
                address: address.trim(),
              }}
              successMessage="Quote fee paid successfully"
              onSuccess={(paymentIntentId) => {
                void submitRequest(paymentIntentId)
              }}
              onError={(message) => {
                toast.error(message)
              }}
            />

            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
