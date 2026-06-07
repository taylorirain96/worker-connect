'use client'

import type { Country } from '@/types'
import {
  getCityLabel,
  getLocationOptions,
  getRegionLabel,
  REGISTRATION_COUNTRY_OPTIONS,
} from '@/lib/locationOptions'

interface LocationSelectorProps {
  country: Country
  region: string
  city: string
  onCountryChange: (country: Country) => void
  onRegionChange: (region: string) => void
  onCityChange: (city: string) => void
  errors?: {
    country?: string
    region?: string
    city?: string
  }
  className?: string
}

export default function LocationSelector({
  country,
  region,
  city,
  onCountryChange,
  onRegionChange,
  onCityChange,
  errors,
  className = '',
}: LocationSelectorProps) {
  const regionOptions = getLocationOptions(country)
  const regionLabel = getRegionLabel(country)
  const cityLabel = getCityLabel(country)

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Country
        </label>
        <select
          value={country}
          onChange={(event) => onCountryChange(event.target.value as Country)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {REGISTRATION_COUNTRY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors?.country && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {regionLabel}
          </label>
          <select
            value={region}
            onChange={(event) => onRegionChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select {country === 'AU' ? 'a state or territory' : 'a region'}</option>
            {regionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors?.region && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.region}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {cityLabel}
          </label>
          <input
            type="text"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            placeholder={country === 'AU' ? 'e.g., Sydney' : 'e.g., Auckland'}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors?.city && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>}
        </div>
      </div>
    </div>
  )
}
