'use client'

import { useState } from 'react'

interface LearningJobApplicationProps {
  jobId: string
  workerId: string
  jobTitle: string
  onSuccess?: (applicationId: string) => void
}

export default function LearningJobApplication({
  jobId,
  workerId,
  jobTitle,
  onSuccess,
}: LearningJobApplicationProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/learning-jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to apply')
      setApplied(true)
      onSuccess?.(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (applied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-2xl mb-2">🎓</p>
        <h3 className="font-bold text-green-800">Application Submitted!</h3>
        <p className="text-green-700 text-sm mt-1">You&apos;ve applied to learn: {jobTitle}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleApply} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Apply to Learn</h2>
        <p className="text-sm text-gray-500 mt-1">{jobTitle}</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Why do you want this learning opportunity?
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Tell the employer why you&apos;re a great candidate to learn this skill..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
