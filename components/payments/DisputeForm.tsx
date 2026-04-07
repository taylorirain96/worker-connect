'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AlertTriangle, DollarSign, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import type { DisputeReason, DisputeItem, Currency } from '@/types/payment'

const DISPUTE_REASONS: { value: DisputeReason; label: string }[] = [
  { value: 'fraudulent', label: 'Fraudulent charge' },
  { value: 'product_not_received', label: 'Service not received' },
  { value: 'product_unacceptable', label: 'Service quality unacceptable' },
  { value: 'duplicate', label: 'Duplicate charge' },
  { value: 'subscription_canceled', label: 'Subscription already canceled' },
  { value: 'credit_not_processed', label: 'Credit not processed' },
  { value: 'customer_initiated', label: 'Customer initiated refund' },
  { value: 'incorrect_account_details', label: 'Incorrect account details' },
  { value: 'general', label: 'General / other' },
]

export interface DisputeFormProps {
  paymentId: string
  jobId: string
  workerId: string
  employerId: string
  amount: number
  currency?: Currency
  onSuccess?: (dispute: DisputeItem) => void
  onCancel?: () => void
}

export default function DisputeForm({
  paymentId,
  jobId,
  workerId,
  employerId,
  amount,
  currency = 'usd',
  onSuccess,
  onCancel,
}: DisputeFormProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [created, setCreated] = useState<DisputeItem | null>(null)

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(n)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    try {
      const res = await fetch('/api/disputes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          jobId,
          workerId,
          employerId,
          amount,
          currency,
          reason,
          description,
          evidence,
        }),
      })
      const data = await res.json() as { dispute?: DisputeItem; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit dispute')
      setCreated(data.dispute ?? null)
      setSubmitted(true)
      if (data.dispute) onSuccess?.(data.dispute)
      toast.success('Dispute submitted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit dispute')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && created) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <FileText className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dispute Filed</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Your dispute has been submitted. Our team will review it and respond within 3–5 business days.
          </p>
          {created.dueBy && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Response due by: {new Date(created.dueBy).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            Case ID: {created.id}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>File a Dispute</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          {/* Payment summary */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Payment in dispute</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{paymentId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                  <DollarSign className="h-4 w-4" />
                  {fmt(amount).replace(/[$£€]/, '')}
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Reason for dispute <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a reason…</option>
              {DISPUTE_REASONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Describe the issue <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              minLength={20}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Please provide a detailed description of the issue…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">{description.length} characters (minimum 20)</p>
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Supporting evidence <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
              placeholder="Links to screenshots, emails, or other supporting documentation…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p className="font-medium">Before submitting:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Disputes are reviewed within 3–5 business days</li>
              <li>False disputes may result in account suspension</li>
              <li>All party communications are recorded</li>
            </ul>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="danger" loading={loading} disabled={!reason || description.length < 20} className="flex-1">
              Submit Dispute
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
