'use client'

import { useEffect, useState } from 'react'
import type { SupportedCountry } from '@/types/global'

interface CountrySelectorProps {
  value: string
  onChange: (code: string) => void
  label?: string
}

export default function CountrySelector({ value, onChange, label }: CountrySelectorProps) {
  const [countries, setCountries] = useState<SupportedCountry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tax/countries')
      .then(r => r.json())
      .then((data: { countries: SupportedCountry[] }) => setCountries(data.countries))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <option value="">
          {loading ? 'Loading...' : 'Select a country'}
        </option>
        {countries.map(country => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
    </div>
  )
}
