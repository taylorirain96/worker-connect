'use client'
import { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface MilestoneFormProps {
  jobId: string
  userId: string
  totalBudget: number
  allocatedPct: number
  onCreated: () => void
  onClose: () => void
}

export default function MilestoneForm({
  jobId,
  userId,
  totalBudget,
  allocatedPct,
  onCreated,
  onClose,
}: MilestoneFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [percentage, setPercentage] = useState(25)
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const remainingPct = 100 - allocatedPct
  const amount = Math.round(totalBudget * (percentage / 100) * 100) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return toast.error('Please enter a milestone title')
    if (percentage > remainingPct) {
      return toast.error(`Only ${remainingPct}% of the budget is unallocated`)
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), amount, percentage, dueDate: dueDate || undefined }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to create milestone')
      }
      toast.success('Milestone created')
      onCreated()
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
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Add Milestone</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Milestone title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frame & rough-in complete"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done for this milestone?"
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Payment — {percentage}% of budget
              <span className="ml-1 text-slate-500">({remainingPct}% remaining)</span>
            </label>
            <input
              type="range"
              min={5}
              max={Math.min(remainingPct, 100)}
              step={5}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>5%</span>
              <span className="font-semibold text-indigo-300">NZ${amount.toFixed(2)}</span>
              <span>{Math.min(remainingPct, 100)}%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Due date <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : 'Add Milestone'}
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
