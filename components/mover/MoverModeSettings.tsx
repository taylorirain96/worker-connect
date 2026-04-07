'use client'

import { useState } from 'react'
import { Save, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'
import type { MoverSettings } from '@/types/reputation'

interface Props {
  workerId: string
  settings: MoverSettings
  onSave: (updated: MoverSettings) => void
}

const JOB_TYPE_OPTIONS = [
  'Moving & Hauling',
  'Cleaning',
  'Painting',
  'Handyman',
  'Landscaping',
  'Furniture Assembly',
  'Packing',
  'Storage',
]

export function MoverModeSettings({ workerId, settings, onSave }: Props) {
  const [form, setForm] = useState<MoverSettings>({ ...settings })
  const [saving, setSaving] = useState(false)

  function toggleJobType(type: string) {
    setForm((prev) => ({
      ...prev,
      jobTypePreferences: prev.jobTypePreferences.includes(type)
        ? prev.jobTypePreferences.filter((t) => t !== type)
        : [...prev.jobTypePreferences, type],
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch(`/api/workers/${workerId}/mover-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const updated = await response.json()
      onSave(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Mover Mode Settings</h3>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-800">Mover Mode Active</p>
          <p className="text-xs text-gray-500">Appear in relocation job matching</p>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
          className="text-indigo-600"
        >
          {form.isActive ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-400" />
          )}
        </button>
      </div>

      {/* Target city */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4 inline mr-1" />
          Target Relocation City
        </label>
        <input
          type="text"
          value={form.targetRelocationCity ?? ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, targetRelocationCity: e.target.value || null }))
          }
          placeholder="e.g. Austin, TX"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Readiness slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relocation Readiness:{' '}
          <span className="text-indigo-600 font-semibold">{form.relocationReadiness}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={form.relocationReadiness}
          onChange={(e) =>
            setForm((f) => ({ ...f, relocationReadiness: Number(e.target.value) }))
          }
          className="w-full accent-indigo-600"
        />
      </div>

      {/* Job type preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type Preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => toggleJobType(type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.jobTypePreferences.includes(type)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 w-full justify-center bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
