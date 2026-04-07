'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { MoverModeSettings } from '@/types/reputation'
import { isRelocationReady } from '@/lib/utils/reputationAlgorithm'

interface Props {
  settings: MoverModeSettings | null
  completionRate: number
  onSave?: (settings: Pick<MoverModeSettings, 'targetRelocationCity' | 'relocationReadiness' | 'availableForRelocation' | 'preferredJobTypes'>) => Promise<void>
  className?: string
}

const JOB_TYPES = ['Long-term contracts', 'Commercial', 'Residential', 'Construction', 'Moving & Logistics']

export default function MoverModeSettings({ settings, completionRate, onSave, className }: Props) {
  const [city, setCity] = useState(settings?.targetRelocationCity ?? '')
  const [readiness, setReadiness] = useState(settings?.relocationReadiness ?? 0)
  const [available, setAvailable] = useState(settings?.availableForRelocation ?? false)
  const [jobTypes, setJobTypes] = useState<string[]>(settings?.preferredJobTypes ?? [])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const relocationReady = isRelocationReady(city, completionRate)

  const toggleJobType = (jt: string) => {
    setJobTypes((prev) => prev.includes(jt) ? prev.filter((t) => t !== jt) : [...prev, jt])
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave?.({ targetRelocationCity: city, relocationReadiness: readiness, availableForRelocation: available, preferredJobTypes: jobTypes })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5', className)}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">✈️</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mover Mode</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Get priority matching for long-term contracts in your target city</p>
        </div>
      </div>

      {/* Relocation Ready badge */}
      {relocationReady && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3">
          <span className="text-xl">🏅</span>
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Relocation Ready!</p>
            <p className="text-xs text-green-600 dark:text-green-400">Your badge is active and visible to employers.</p>
          </div>
        </div>
      )}

      {/* Target city */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
          Target Relocation City
        </label>
        <input
          type="text"
          placeholder="e.g. Austin, TX"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
        />
        {city && !relocationReady && completionRate < 80 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Reach 80% completion rate to unlock the Relocation Ready badge (currently {completionRate}%)
          </p>
        )}
      </div>

      {/* Readiness slider */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
          Relocation Readiness: <span className="text-blue-600">{readiness}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={readiness}
          onChange={(e) => setReadiness(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>Not ready</span><span>Fully ready</span>
        </div>
      </div>

      {/* Available toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Available for relocation now
        </label>
        <button
          onClick={() => setAvailable(!available)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            available ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          )}
          role="switch"
          aria-checked={available}
        >
          <span className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            available ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </div>

      {/* Job types */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
          Preferred Job Types
        </label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((jt) => (
            <button
              key={jt}
              onClick={() => toggleJobType(jt)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium',
                jobTypes.includes(jt)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
              )}
            >
              {jt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
      >
        {loading ? 'Saving…' : saved ? '✓ Saved!' : 'Save Mover Settings'}
      </button>
    </div>
  )
}
