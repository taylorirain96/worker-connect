'use client'

import { useState } from 'react'

interface EmployerSponsorshipFormProps {
  employerId: string
  employerName?: string
  onSuccess?: (sponsorshipId: string) => void
}

export default function EmployerSponsorshipForm({
  employerId,
  employerName,
  onSuccess,
}: EmployerSponsorshipFormProps) {
  const [workerId, setWorkerId] = useState('')
  const [skill, setSkill] = useState('')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/learning-jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId,
          workerId,
          skillBeingTaught: skill,
          requiredSkill: 'None',
          title: `Sponsored Training: ${skill}`,
          description: notes,
          rate: Number(amount),
          learningArrangement: {
            supervisorId: '',
            trainingComponent: skill,
            estimatedHours: Number(duration) * 8,
          },
          skillGainedUpon: 'completion',
          certificationEligible: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create sponsorship')
      setSubmitted(true)
      onSuccess?.(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <h3 className="font-bold text-green-800">Sponsorship Created!</h3>
        <p className="text-green-700 text-sm mt-1">Worker training program has been set up</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Sponsor Worker Training</h2>
        <p className="text-sm text-gray-500 mt-1">
          {employerName ? `${employerName} · ` : ''}Pay for a worker&apos;s skill development
        </p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Worker ID</label>
        <input
          type="text"
          value={workerId}
          onChange={e => setWorkerId(e.target.value)}
          placeholder="Enter worker's user ID"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skill to Sponsor</label>
        <input
          type="text"
          value={skill}
          onChange={e => setSkill(e.target.value)}
          placeholder="e.g. Advanced Plumbing, Project Management"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Amount ($/hr)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Training objectives, expectations..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Creating...' : 'Create Sponsorship Program'}
      </button>
    </form>
  )
}
