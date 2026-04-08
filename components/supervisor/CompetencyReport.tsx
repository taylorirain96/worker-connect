'use client'

import { useState } from 'react'

interface CompetencyReportProps {
  supervisorId: string
  learningJobId: string
  workerId: string
  onSuccess?: (reportId: string) => void
}

export default function CompetencyReport({
  supervisorId,
  learningJobId,
  workerId,
  onSuccess,
}: CompetencyReportProps) {
  const [score, setScore] = useState(50)
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [readyForIndependent, setReadyForIndependent] = useState(false)
  const [certifyingSkill, setCertifyingSkill] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/supervisor/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisorId,
          learningJobId,
          workerId,
          competencyAssessment: score,
          strengths: strengths.split(',').map(s => s.trim()).filter(Boolean),
          improvementAreas: improvements.split(',').map(s => s.trim()).filter(Boolean),
          readyForIndependent,
          certifyingSkill,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit report')
      onSuccess?.(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Competency Report</h2>
        <p className="text-sm text-gray-500 mt-1">Assess the worker&apos;s performance</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Competency Score: <span className="font-bold text-blue-600">{score}/100</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={e => setScore(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Needs Work</span>
          <span>Competent</span>
          <span>Expert</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Strengths (comma-separated)</label>
        <input
          type="text"
          value={strengths}
          onChange={e => setStrengths(e.target.value)}
          placeholder="e.g. Attention to detail, Safety awareness, Fast learner"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement (comma-separated)</label>
        <input
          type="text"
          value={improvements}
          onChange={e => setImprovements(e.target.value)}
          placeholder="e.g. Speed, Communication, Tool maintenance"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={readyForIndependent}
            onChange={e => setReadyForIndependent(e.target.checked)}
          />
          <span className="text-sm text-gray-700">Worker is ready for independent work</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={certifyingSkill}
            onChange={e => setCertifyingSkill(e.target.checked)}
          />
          <span className="text-sm text-gray-700">🎓 I am certifying this worker&apos;s skill</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
