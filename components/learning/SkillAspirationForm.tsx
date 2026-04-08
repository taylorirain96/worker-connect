'use client'

import { useState } from 'react'
import type { SkillAspiration } from '@/types'

interface SkillAspirationFormProps {
  workerId: string
  onSuccess?: (id: string) => void
}

const SKILL_LEVELS = ['none', 'beginner', 'intermediate'] as const
const TARGET_LEVELS = ['intermediate', 'advanced', 'expert'] as const

export default function SkillAspirationForm({ workerId, onSuccess }: SkillAspirationFormProps) {
  const [targetSkill, setTargetSkill] = useState('')
  const [currentLevel, setCurrentLevel] = useState<typeof SKILL_LEVELS[number]>('none')
  const [targetLevel, setTargetLevel] = useState<typeof TARGET_LEVELS[number]>('intermediate')
  const [motivation, setMotivation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/skills/aspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, targetSkill, currentLevel, targetLevel, motivation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create aspiration')
      onSuccess?.(data.id)
      setTargetSkill('')
      setMotivation('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Declare a Skill Goal</h2>
        <p className="text-sm text-gray-500 mt-1">Tell employers what you want to learn</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skill I Want to Learn</label>
        <input
          type="text"
          value={targetSkill}
          onChange={e => setTargetSkill(e.target.value)}
          placeholder="e.g. Plumbing, Electrical, Project Management"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
          <select
            value={currentLevel}
            onChange={e => setCurrentLevel(e.target.value as typeof SKILL_LEVELS[number])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SKILL_LEVELS.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>
          <select
            value={targetLevel}
            onChange={e => setTargetLevel(e.target.value as typeof TARGET_LEVELS[number])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TARGET_LEVELS.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to learn this? (optional)</label>
        <textarea
          value={motivation}
          onChange={e => setMotivation(e.target.value)}
          rows={3}
          placeholder="Briefly describe your motivation..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !targetSkill}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Saving...' : 'Declare Skill Goal'}
      </button>
    </form>
  )
}
