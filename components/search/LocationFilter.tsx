'use client'
import { MapPin } from 'lucide-react'

const RADIUS_OPTIONS = [5, 10, 25, 50, 100]

interface LocationFilterProps {
  location: string
  radius: number
  onChange: (location: string, radius: number) => void
}

export default function LocationFilter({ location, radius, onChange }: LocationFilterProps) {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="location-input"
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2"
        >
          Location
        </label>
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            aria-hidden
          />
          <input
            id="location-input"
            type="text"
            value={location}
            onChange={(e) => onChange(e.target.value, radius)}
            placeholder="City, state or zip"
            aria-label="Enter location"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {location && (
        <div>
          <label
            htmlFor="radius-select"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2"
          >
            Radius
          </label>
          <select
            id="radius-select"
            value={radius}
            onChange={(e) => onChange(location, parseInt(e.target.value, 10))}
            aria-label="Search radius in miles"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} miles</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
