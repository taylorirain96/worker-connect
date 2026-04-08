'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'

interface ExchangeRateDisplayProps {
  baseCurrency?: string
}

const CURRENCY_INFO: Record<string, { name: string; flag: string }> = {
  USD: { name: 'US Dollar', flag: '🇺🇸' },
  NZD: { name: 'NZ Dollar', flag: '🇳🇿' },
  AUD: { name: 'AU Dollar', flag: '🇦🇺' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  CAD: { name: 'CA Dollar', flag: '🇨🇦' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  SGD: { name: 'SG Dollar', flag: '🇸🇬' },
  HKD: { name: 'HK Dollar', flag: '🇭🇰' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  SEK: { name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  ZAR: { name: 'SA Rand', flag: '🇿🇦' },
  KRW: { name: 'Korean Won', flag: '🇰🇷' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  MYR: { name: 'MY Ringgit', flag: '🇲🇾' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  PLN: { name: 'Polish Zloty', flag: '🇵🇱' },
  AED: { name: 'UAE Dirham', flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', flag: '🇸🇦' },
}

export default function ExchangeRateDisplay({ baseCurrency = 'USD' }: ExchangeRateDisplayProps) {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/currency/rates')
      .then(r => r.json())
      .then((data: { rates: Record<string, number> }) => setRates(data.rates))
      .catch(() => setError('Failed to load exchange rates'))
      .finally(() => setLoading(false))
  }, [])

  const baseRate = rates[baseCurrency] ?? 1

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading exchange rates...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Exchange Rates
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Rates based in {baseCurrency}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(rates)
            .filter(([code]) => code !== baseCurrency)
            .map(([code, rate]) => {
              const info = CURRENCY_INFO[code]
              const adjusted = rate / baseRate
              return (
                <div
                  key={code}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <span className="text-lg">{info?.flag ?? '💱'}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{code}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {adjusted >= 100
                        ? adjusted.toFixed(0)
                        : adjusted >= 1
                        ? adjusted.toFixed(2)
                        : adjusted.toFixed(4)}
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
