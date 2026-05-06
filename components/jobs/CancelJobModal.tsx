'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'

interface CancelJobModalProps {
  jobId: string
  jobTitle: string
  /** Whether escrow funds are currently held (triggers refund notice) */
  escrowHeld?: boolean
  isOpen: boolean
  onClose: () => void
  onConfirmed: () => void
}

export default function CancelJobModal({
  jobId,
  jobTitle,
  escrowHeld = false,
  isOpen,
  onClose,
  onConfirmed,
}: CancelJobModalProps) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const reasonTrimmed = reason.trim()
  const isValid = reasonTrimmed.length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid ?? '',
        },
        body: JSON.stringify({ reason: reasonTrimmed }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to cancel job')
      }

      toast.success('Job cancelled successfully')
      onConfirmed()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <h2 className="text-base font-semibold text-white">Cancel Job</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            Are you sure you want to cancel{' '}
            <span className="font-semibold text-white">"{jobTitle}"</span>? This cannot be undone.
          </p>

          {escrowHeld && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300 leading-relaxed">
                Your escrow payment will be refunded within{' '}
                <span className="font-semibold">3–5 business days</span>.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="cancel-reason" className="block text-xs font-medium text-gray-400">
              Reason for cancellation{' '}
              <span className="text-gray-600">(min 10 characters)</span>
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are cancelling this job…"
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-600 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
              required
              minLength={10}
            />
            {reason.length > 0 && reason.trim().length < 10 && (
              <p className="text-xs text-red-400">{10 - reason.trim().length} more characters required</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Keep Job
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              loading={submitting}
              disabled={!isValid}
            >
              Cancel Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
