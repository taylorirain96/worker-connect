'use client'

import { useState } from 'react'
import type { MoverSettings } from '@/types/reputation'
import RelocationBadge from './RelocationBadge'

interface Props {
  settings: MoverSettings | null
  onSave: (settings: Partial<MoverSettings>) => void
}

const ROSTER_OPTIONS: { value: MoverSettings['rosterPreference']; label: string }[] = [
  { value: 'fly_in_fly_out', label: 'Fly-in / Fly-out (FIFO)' },
  { value: 'drive_in_drive_out', label: 'Drive-in / Drive-out (DIDO)' },
  { value: 'residential', label: 'Residential (relocate permanently)' },
]

const RELOCATION_PREF_OPTIONS: { value: MoverSettings['relocationPreference']; label: string }[] = [
  { value: 'temporary', label: 'Temporary (project / contract)' },
  { value: 'permanent', label: 'Permanent relocation' },
  { value: 'either', label: 'Open to either' },
]

export default function MoverModeSettings({ settings, onSave }: Props) {
  const [city, setCity] = useState(settings?.targetRelocationCity ?? '')
  const [readiness, setReadiness] = useState(settings?.relocationReadiness ?? 50)
  const [isActive, setIsActive] = useState(settings?.isActive ?? false)

  // FIFO / cross-border fields
  const [willingToRelocate, setWillingToRelocate] = useState(settings?.willingToRelocate ?? false)
  const [fifoAvailable, setFifoAvailable] = useState(settings?.fifoAvailable ?? false)
  const [targetCountries, setTargetCountries] = useState<('NZ' | 'AU')[]>(settings?.targetCountries ?? [])
  const [workRightsNZ, setWorkRightsNZ] = useState(settings?.workRightsNZ ?? false)
  const [workRightsAU, setWorkRightsAU] = useState(settings?.workRightsAU ?? false)
  const [visaType, setVisaType] = useState(settings?.visaType ?? '')
  const [accommodationRequired, setAccommodationRequired] = useState(settings?.accommodationRequired ?? false)
  const [travelAssistanceRequired, setTravelAssistanceRequired] = useState(settings?.travelAssistanceRequired ?? false)
  const [rosterPreference, setRosterPreference] = useState<MoverSettings['rosterPreference']>(settings?.rosterPreference)
  const [relocationPreference, setRelocationPreference] = useState<MoverSettings['relocationPreference']>(settings?.relocationPreference ?? 'either')

  const isEligible = Boolean(city) && readiness >= 80

  const toggleCountry = (c: 'NZ' | 'AU') =>
    setTargetCountries((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      targetRelocationCity: city,
      relocationReadiness: readiness,
      isActive,
      hasRelocationBadge: isEligible,
      willingToRelocate,
      fifoAvailable,
      targetCountries,
      workRightsNZ,
      workRightsAU,
      visaType: visaType || undefined,
      accommodationRequired,
      travelAssistanceRequired,
      rosterPreference,
      relocationPreference,
    })
  }

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Relocation &amp; FIFO Settings</h2>

      {/* Activation */}
      <div className="space-y-3">
        <Toggle checked={isActive} onChange={() => setIsActive(!isActive)} label="Open to relocation / FIFO roles" />
        <Toggle checked={willingToRelocate} onChange={() => setWillingToRelocate(!willingToRelocate)} label="Willing to relocate for the right role" />
        <Toggle checked={fifoAvailable} onChange={() => setFifoAvailable(!fifoAvailable)} label="Available for FIFO (fly-in fly-out) rosters" />
      </div>

      {/* Target countries */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Target Countries</label>
        <div className="flex gap-3">
          {(['NZ', 'AU'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCountry(c)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                targetCountries.includes(c)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {c === 'NZ' ? '🇳🇿 New Zealand' : '🇦🇺 Australia'}
            </button>
          ))}
        </div>
      </div>

      {/* Work rights */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Work Rights</label>
        <div className="space-y-2 pl-1">
          <Toggle checked={workRightsNZ} onChange={() => setWorkRightsNZ(!workRightsNZ)} label="I have NZ work rights" />
          <Toggle checked={workRightsAU} onChange={() => setWorkRightsAU(!workRightsAU)} label="I have AU work rights" />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">Visa / Status (optional)</label>
          <input
            type="text"
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            placeholder="e.g. Citizen, Resident, Work Visa, 482"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Roster preference */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Roster Preference</label>
        <div className="flex flex-col gap-2">
          {ROSTER_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="rosterPreference"
                value={value}
                checked={rosterPreference === value}
                onChange={() => setRosterPreference(value)}
                className="accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Relocation preference */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Relocation Type</label>
        <div className="flex flex-col gap-2">
          {RELOCATION_PREF_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="relocationPreference"
                value={value}
                checked={relocationPreference === value}
                onChange={() => setRelocationPreference(value)}
                className="accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Target city and readiness */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Target City / Region</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Perth, WA or Auckland, NZ"
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
            onChange={(e) => setReadiness(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-gray-500">Set to 80%+ to earn the Relocation Badge visible to employers.</p>
        </div>
      </div>

      {/* Logistics */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logistics</label>
        <div className="space-y-2 pl-1">
          <Toggle checked={accommodationRequired} onChange={() => setAccommodationRequired(!accommodationRequired)} label="I need employer-provided accommodation" />
          <Toggle checked={travelAssistanceRequired} onChange={() => setTravelAssistanceRequired(!travelAssistanceRequired)} label="I need travel assistance (flights / transport)" />
        </div>
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
