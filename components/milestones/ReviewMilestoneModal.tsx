'use client'
import { useState } from 'react'
import { X, CheckCircle, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReviewMilestoneModalProps {
  jobId: string
  milestoneId: string
  milestoneTitle: string
  milestoneAmount: number
  userId: string
  onReviewed: () => void
  onClose: () => void
}

export default function ReviewMilestoneModal({
  jobId,
  milestoneId,
  milestoneTitle,
  milestoneAmount,
  userId,
  onReviewed,
  onClose,
}: ReviewMilestoneModalProps) {
  const [reviewNote, setReviewNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    if (action === 'reject' && !reviewNote.trim()) {
      return toast.error('Please provide feedback so the worker knows what to fix')
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ action, reviewNote: reviewNote.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed')
      }
      toast.success(action === 'approve' ? `Milestone approved & ${formatCurrency(milestoneAmount)} released!` : 'Changes requested — worker notified')
      onReviewed()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">Review Milestone</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-300">
            Review <span className="text-white font-medium">&ldquo;{milestoneTitle}&rdquo;</span>.
            Approving will release <span className="text-indigo-300 font-semibold">{formatCurrency(milestoneAmount)}</span> to the worker.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Feedback <span className="text-slate-500">(required if requesting changes)</span>
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Great work! / Please fix the following before I approve…"
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleAction('approve')}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Pay
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAction('reject')}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Request Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
