'use client'

import { useState } from 'react'
import type { MoverSettings } from '@/types/reputation'
import RelocationBadge from './RelocationBadge'

interface Props {
  settings: MoverSettings | null
  onSave: (settings: Partial<MoverSettings>) => void
}

export default function MoverModeSettings({ settings, onSave }: Props) {
  const [city, setCity] = useState(settings?.targetRelocationCity ?? '')
  const [readiness, setReadiness] = useState(settings?.relocationReadiness ?? 50)
  const [isActive, setIsActive] = useState(settings?.isActive ?? false)

  const isEligible = Boolean(city) && readiness >= 80

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      targetRelocationCity: city,
      relocationReadiness: readiness,
      isActive,
      hasRelocationBadge: isEligible,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Mover Mode Settings</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Target Relocation City</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="e.g. New York"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Relocation Readiness: <span className="text-blue-600">{readiness}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={readiness}
          onChange={e => setReadiness(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label="Active for Relocation Jobs"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm text-gray-700">Active for Relocation Jobs</span>
      </div>
      {isEligible && <RelocationBadge hasRelocationBadge={true} targetCity={city} />}
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Save Settings
      </button>
    </form>
  )
}
