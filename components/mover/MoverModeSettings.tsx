'use client'
import { useState } from 'react'
import { MapPin, Percent } from 'lucide-react'
import type { WorkerMoverSettings } from '@/types/reputation'

interface Props {
  workerId: string
  settings?: WorkerMoverSettings
  onSave: (data: Partial<WorkerMoverSettings>) => Promise<void>
}

export default function MoverModeSettings({ workerId, settings, onSave }: Props) {
  const [city, setCity] = useState(settings?.targetRelocationCity ?? '')
  const [readiness, setReadiness] = useState(settings?.relocationReadiness ?? 50)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave({ targetRelocationCity: city || undefined, relocationReadiness: readiness })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Mover Mode Settings</h3>
        <p className="text-sm text-gray-500 mt-0.5">Set your relocation preferences for premium job matching.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <MapPin className="inline h-4 w-4 mr-1 text-gray-400" />
          Target Relocation City
        </label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Austin, TX"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Percent className="inline h-4 w-4 mr-1 text-gray-400" />
          Relocation Readiness: <span className="text-blue-600 font-semibold">{readiness}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={readiness}
          onChange={(e) => setReadiness(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Not Ready</span>
          <span>Fully Ready</span>
        </div>
      </div>
      {settings && (
        <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{settings.relocationAcceptanceRate}%</p>
            <p className="text-xs text-gray-500">Acceptance</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{settings.relocationSuccessRate}%</p>
            <p className="text-xs text-gray-500">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{settings.repeatClientRate}%</p>
            <p className="text-xs text-gray-500">Repeat Clients</p>
          </div>
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
