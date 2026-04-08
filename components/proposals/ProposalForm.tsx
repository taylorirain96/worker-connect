'use client'

import { useState } from 'react'
import type { Proposal } from '@/types'

interface ProposalFormProps {
  jobId: string
  workerId: string
  employerId: string
  workerName?: string
  employerName?: string
  onSuccess?: (proposalId: string) => void
}

export default function ProposalForm({
  jobId,
  workerId,
  employerId,
  workerName,
  employerName,
  onSuccess,
}: ProposalFormProps) {
  const [rate, setRate] = useState('')
  const [hours, setHours] = useState('')
  const [duration, setDuration] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/proposals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          workerId,
          employerId,
          workerName,
          employerName,
          proposedTerms: {
            rate: Number(rate),
            hours: Number(hours),
            duration,
            specialRequests,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit proposal')
      onSuccess?.(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900">Submit Proposal</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($/hr)</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <input
          type="text"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="e.g. 2 weeks"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
        <textarea
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  )
}
