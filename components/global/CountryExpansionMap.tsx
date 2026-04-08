'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import type { SupportedCountry } from '@/types/global'

const TIER_CONFIG = {
  full: {
    label: 'Full Support',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  partial: {
    label: 'Partial Support',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  coming_soon: {
    label: 'Coming Soon',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
}

export default function CountryExpansionMap() {
  const [countries, setCountries] = useState<SupportedCountry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tax/countries')
      .then(r => r.json())
      .then((data: { countries: SupportedCountry[] }) => setCountries(data.countries))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading countries...</p>
        </CardContent>
      </Card>
    )
  }

  const grouped = {
    full: countries.filter(c => c.tier === 'full'),
    partial: countries.filter(c => c.tier === 'partial'),
    coming_soon: countries.filter(c => c.tier === 'coming_soon'),
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Global Expansion Map
        </h2>

        {(Object.entries(grouped) as [keyof typeof TIER_CONFIG, SupportedCountry[]][]).map(
          ([tier, list]) => {
            const config = TIER_CONFIG[tier]
            return (
              <div key={tier} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.badge}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({list.length} countries)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {list.map(country => (
                    <div
                      key={country.code}
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {country.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {country.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        )}
      </CardContent>
    </Card>
  )
}
