'use client'
import { useState } from 'react'
import { X, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface SubmitMilestoneModalProps {
  jobId: string
  milestoneId: string
  milestoneTitle: string
  userId: string
  onSubmitted: () => void
  onClose: () => void
}

export default function SubmitMilestoneModal({
  jobId,
  milestoneId,
  milestoneTitle,
  userId,
  onSubmitted,
  onClose,
}: SubmitMilestoneModalProps) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/milestones/${milestoneId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ submissionNote: note.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to submit milestone')
      }
      toast.success('Milestone submitted for review')
      onSubmitted()
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
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Submit Milestone</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-300">
            Submit <span className="text-white font-medium">"{milestoneTitle}"</span> for employer approval.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Note for the employer <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what was done, any issues encountered, etc."
              rows={4}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Submitting…' : 'Submit for Review'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
